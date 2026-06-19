'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Alert,
  styled,
  CircularProgress,
  Link as MuiLink,
  Paper,
  Stack,
  Step,
  Stepper,
  StepLabel,
} from '@mui/material';
import Link from 'next/link';
import PersonOutline from '@mui/icons-material/PersonOutline';
import MailOutline from '@mui/icons-material/MailOutline';
import LockOutlined from '@mui/icons-material/LockOutlined';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import LinkIcon from '@mui/icons-material/Link';
import LabelImportantIcon from '@mui/icons-material/LabelImportant';
import PhoneIcon from '@mui/icons-material/Phone';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '@/lib/apiClient';
import { useAppContext } from '@/context/AppContext';

// Custom text field styled for premium theme inputs and autocomplete overrides
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
    borderRadius: '14px',
    color: theme.palette.text.primary,
    height: '56px',
    border: '1px solid',
    borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.01)',
      borderColor: '#8B5CF6', // Purple theme accent
      boxShadow: '0 0 0 2px rgba(139, 92, 246, 0.2)',
    },
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  },
  '& .MuiInputBase-input': { 
    paddingLeft: '10px',
    fontFamily: "'Satoshi', sans-serif",
    '&::placeholder': {
      color: theme.palette.text.secondary,
      opacity: 1,
    },
    '&:-webkit-autofill': {
      WebkitBoxShadow: theme.palette.mode === 'dark' 
        ? '0 0 0 1000px #161B22 inset !important' 
        : '0 0 0 1000px #ffffff inset !important',
      WebkitTextFillColor: `${theme.palette.text.primary} !important`,
      transition: 'background-color 5000s ease-in-out 0s',
    }
  },
  '& .MuiInputAdornment-root': { color: theme.palette.text.secondary, marginRight: '8px', marginLeft: '8px' },
}));

export default function InstituteRegisterClient() {
  const router = useRouter();
  const { login } = useAppContext();

  // Wizard Step State (1: Account info, 2: Institute settings)
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Step 1 States (User Account)
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userTokens, setUserTokens] = useState<{ access: string; refresh: string } | null>(null);

  // Step 2 States (Institute Details)
  const [instituteName, setInstituteName] = useState('');
  const [slug, setSlug] = useState('');
  const [tagline, setTagline] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Auto-generate slug from name helper
  const handleNameChange = (val: string) => {
    setInstituteName(val);
    const autoSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(autoSlug);
  };

  const handleSlugChange = (val: string) => {
    // Keep it clean
    const cleaned = val
      .toLowerCase()
      .replace(/[\s_-]+/g, '-')
      .replace(/[^\w-]/g, '');
    setSlug(cleaned);
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      // Step 1: Register standard user on backend
      await apiClient.post('/auth/register/', {
        username,
        email,
        password,
      });

      // Step 2: Login immediately to secure JWT tokens
      const tokenResponse = await apiClient.post('/auth/token/', {
        username,
        password,
      });

      const { access, refresh } = tokenResponse.data;
      setUserTokens({ access, refresh });

      // Save tokens locally, but wait to fetch complete owner profile until step 2 is finalized
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      setSuccess('Account created! Now tell us about your coaching institute.');
      
      setTimeout(() => {
        setSuccess('');
        setCurrentStep(2);
      }, 1200);

    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data?.username) {
        setError(`Username error: ${err.response.data.username[0]}`);
      } else if (err.response?.data?.email) {
        setError(`Email error: ${err.response.data.email[0]}`);
      } else {
        setError('Failed to create account. Please check inputs and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!instituteName || !slug) {
      setError('Institute name and subdomain slug are required.');
      return;
    }

    setLoading(true);

    try {
      // Verify tokens are available
      const tokens = userTokens || {
        access: localStorage.getItem('access_token') || '',
        refresh: localStorage.getItem('refresh_token') || ''
      };

      if (!tokens.access) {
        throw new Error('Authentication session lost. Please log in.');
      }

      // Update/Create the institute profile associated with the authenticated owner
      await apiClient.put('/institute/my-institute/', {
        name: instituteName,
        slug: slug,
        tagline: tagline,
        contact_email: contactEmail || email,
        phone: phone,
      });

      // Force refresh AppContext to synchronize session with the newly created institute
      await login(tokens.access, tokens.refresh);

      setSuccess('Institute registered successfully! Launching portal...');

      setTimeout(() => {
        router.push('/institute/dashboard');
      }, 1500);

    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.name) {
        setError(`Institute name error: ${err.response.data.name[0]}`);
      } else if (err.response?.data?.slug) {
        setError(`Subdomain/Slug error: ${err.response.data.slug[0]}. Subdomain must be unique.`);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to set up institute profile. Please verify all details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 3,
        bgcolor: 'background.default',
        backgroundImage: (theme) => theme.palette.mode === 'dark'
          ? 'radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 15% 80%, rgba(46, 139, 87, 0.08) 0%, transparent 50%)'
          : 'radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%), radial-gradient(circle at 15% 80%, rgba(46, 139, 87, 0.04) 0%, transparent 50%)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: '480px' }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 5 },
            borderRadius: '24px',
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(22, 27, 34, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            border: '1px solid',
            borderColor: 'divider',
            backdropFilter: 'blur(12px)',
            width: '100%',
          }}
        >
          {/* Logo & Header */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
            <Box sx={{
              width: 50, height: 50,
              background: 'linear-gradient(135deg, #8B5CF6, #4C1D95)',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(139,92,246,0.3)',
              mb: 2
            }}>
              <CorporateFareIcon sx={{ fontSize: 24, color: 'white' }} />
            </Box>
            
            <Typography variant="h4" sx={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 900, color: 'text.primary', letterSpacing: '-0.02em', textAlign: 'center' }}>
              Institute Portal
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', mt: 0.5 }}>
              Register Your Coaching Academy
            </Typography>
          </Box>

          {/* Stepper progress indicator */}
          <Stepper activeStep={currentStep - 1} alternativeLabel sx={{ mb: 4, '& .MuiStepLabel-label': { color: 'text.secondary', fontFamily: "'Satoshi', sans-serif" }, '& .MuiStepLabel-label.Mui-active': { color: '#8B5CF6', fontWeight: 'bold' }, '& .MuiStepLabel-label.Mui-completed': { color: '#2E8B57' }, '& .MuiStepIcon-root': { color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' }, '& .MuiStepIcon-root.Mui-active': { color: '#8B5CF6' }, '& .MuiStepIcon-root.Mui-completed': { color: '#2E8B57' } }}>
            <Step>
              <StepLabel>Account Details</StepLabel>
            </Step>
            <Step>
              <StepLabel>Institute Details</StepLabel>
            </Step>
          </Stepper>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                borderRadius: '12px',
                bgcolor: 'rgba(239, 68, 68, 0.1)', 
                color: '#EF4444', 
                border: '1px solid rgba(239, 68, 68, 0.2)',
                '& .MuiAlert-icon': { color: '#EF4444' }
              }}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 3, 
                borderRadius: '12px',
                bgcolor: 'rgba(46, 139, 87, 0.1)', 
                color: '#22c55e', 
                border: '1px solid rgba(46, 139, 87, 0.2)',
                '& .MuiAlert-icon': { color: '#22c55e' }
              }}
            >
              {success}
            </Alert>
          )}

          <AnimatePresence mode="wait">
            {currentStep === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleStep1Submit}>
                  <Stack spacing={2.5}>
                    <StyledTextField
                      placeholder="Username (Owner Login ID)"
                      fullWidth
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      autoFocus
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><PersonOutline /></InputAdornment>,
                      }}
                    />
                    <StyledTextField
                      placeholder="Email Address"
                      type="email"
                      fullWidth
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><MailOutline /></InputAdornment>,
                      }}
                    />
                    <StyledTextField
                      placeholder="Password"
                      type="password"
                      fullWidth
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LockOutlined /></InputAdornment>,
                      }}
                    />
                    <StyledTextField
                      placeholder="Confirm Password"
                      type="password"
                      fullWidth
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LockOutlined /></InputAdornment>,
                      }}
                    />
                    
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={loading}
                      sx={{
                        borderRadius: '14px', 
                        height: '56px', 
                        mt: 1.5,
                        background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', 
                        textTransform: 'none', 
                        fontSize: '1rem',
                        fontWeight: 700,
                        boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)',
                        transition: 'all 0.2s ease',
                        '&:hover': { 
                          background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', 
                          filter: 'brightness(1.1)',
                          boxShadow: '0 6px 20px rgba(139, 92, 246, 0.4)',
                        },
                        '&:active': {
                          transform: 'scale(0.98)'
                        }
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Continue to Academy Setup'}
                    </Button>
                  </Stack>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleStep2Submit}>
                  <Stack spacing={2.5}>
                    <StyledTextField
                      placeholder="Coaching Institute Name"
                      fullWidth
                      value={instituteName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                      autoFocus
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><CorporateFareIcon /></InputAdornment>,
                      }}
                    />
                    <StyledTextField
                      placeholder="Subdomain Slug (e.g. malabar-academy)"
                      fullWidth
                      value={slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      required
                      helperText="This forms your portal address: slug.kpscmaster.com"
                      FormHelperTextProps={{ sx: { color: '#8892A4', ml: 1 } }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LinkIcon /></InputAdornment>,
                      }}
                    />
                    <StyledTextField
                      placeholder="Tagline / Motto (e.g. Success is Ours)"
                      fullWidth
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LabelImportantIcon /></InputAdornment>,
                      }}
                    />
                    <StyledTextField
                      placeholder="Institute Contact Email (Optional)"
                      type="email"
                      fullWidth
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><MailOutline /></InputAdornment>,
                      }}
                    />
                    <StyledTextField
                      placeholder="Contact Phone Number (Optional)"
                      fullWidth
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment>,
                      }}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={loading}
                      sx={{
                        borderRadius: '14px', 
                        height: '56px', 
                        mt: 1.5,
                        background: 'linear-gradient(135deg, #2E8B57 0%, #1B6B3A 100%)', // Forest green themed completion
                        textTransform: 'none', 
                        fontSize: '1rem',
                        fontWeight: 700,
                        boxShadow: '0 4px 14px rgba(46, 139, 87, 0.3)',
                        transition: 'all 0.2s ease',
                        '&:hover': { 
                          background: 'linear-gradient(135deg, #2E8B57 0%, #1B6B3A 100%)', 
                          filter: 'brightness(1.1)',
                          boxShadow: '0 6px 20px rgba(46, 139, 87, 0.4)',
                        },
                        '&:active': {
                          transform: 'scale(0.98)'
                        }
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Complete Registration & Launch'}
                    </Button>
                  </Stack>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom link */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Already registered your academy?{' '}
              <MuiLink 
                component={Link} 
                href="/institute/login" 
                sx={{ 
                  color: 'primary.main', 
                  fontWeight: 700, 
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                  '&:hover': { color: 'primary.dark', textDecoration: 'underline' } 
                }}
              >
                Log In Here
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
}
