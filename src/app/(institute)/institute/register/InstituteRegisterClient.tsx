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
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import PersonOutline from '@mui/icons-material/PersonOutline';
import MailOutline from '@mui/icons-material/MailOutline';
import LockOutlined from '@mui/icons-material/LockOutlined';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import LinkIcon from '@mui/icons-material/Link';
import LabelImportantIcon from '@mui/icons-material/LabelImportant';
import PhoneIcon from '@mui/icons-material/Phone';
import GroupsOutlined from '@mui/icons-material/GroupsOutlined';
import PaymentsOutlined from '@mui/icons-material/PaymentsOutlined';
import NoteAltOutlined from '@mui/icons-material/NoteAltOutlined';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '@/lib/apiClient';
import { useAppContext } from '@/context/AppContext';
import { apiErrorMessage } from '@/lib/auth';

const GREEN = '#1B6B3A';
const GREEN_LIGHT = '#2E8B57';
const AMBER = '#F59E0B';
const PURPLE = '#8B5CF6';

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
    borderRadius: '14px',
    color: theme.palette.text.primary,
    minHeight: '56px',
    border: '1.5px solid',
    borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.22)' : '#CBD5E1',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.4)' : '#94A3B8',
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#FFFFFF',
      borderColor: GREEN_LIGHT,
      boxShadow: '0 0 0 3px rgba(46, 139, 87, 0.28)',
    },
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  },
  '& .MuiInputBase-input': {
    paddingLeft: '10px',
    fontFamily: "'Satoshi', sans-serif",
    '&::placeholder': {
      color: theme.palette.mode === 'dark' ? '#9AA4B5' : '#64748B',
      opacity: 1,
    },
    '&:-webkit-autofill': {
      WebkitBoxShadow: theme.palette.mode === 'dark'
        ? '0 0 0 1000px #1C2230 inset !important'
        : '0 0 0 1000px #ffffff inset !important',
      WebkitTextFillColor: `${theme.palette.text.primary} !important`,
      transition: 'background-color 5000s ease-in-out 0s',
    },
  },
  '& .MuiInputAdornment-root': { color: theme.palette.text.secondary, marginRight: '8px', marginLeft: '8px' },
  '& .MuiFormHelperText-root': {
    marginLeft: '4px',
    marginTop: '6px',
  },
}));

const BENEFITS = [
  { icon: <GroupsOutlined sx={{ fontSize: 22 }} />, title: 'Students & batches', detail: 'Add learners, group them, and mark attendance from one place.' },
  { icon: <PaymentsOutlined sx={{ fontSize: 22 }} />, title: 'Fee records', detail: 'Track dues and payments without a separate spreadsheet.' },
  { icon: <NoteAltOutlined sx={{ fontSize: 22 }} />, title: 'Notes & questions', detail: 'Share PDFs and academy MCQs with the students in your centre.' },
];

export default function InstituteRegisterClient() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { login } = useAppContext();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userTokens, setUserTokens] = useState<{ access: string; refresh: string } | null>(null);

  const [instituteName, setInstituteName] = useState('');
  const [slug, setSlug] = useState('');
  const [tagline, setTagline] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');

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
    if (password.length < 8) {
      setError('Password should be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      const registerResponse = await apiClient.post('/auth/register/', {
        username: username.trim(),
        email: email.trim(),
        password,
      });

      let access = registerResponse.data?.access;
      let refresh = registerResponse.data?.refresh;
      if (!access || !refresh) {
        const tokenResponse = await apiClient.post('/auth/token/', {
          username: username.trim(),
          password,
        });
        access = tokenResponse.data.access;
        refresh = tokenResponse.data.refresh;
      }

      setUserTokens({ access, refresh });
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setCurrentStep(2);
    } catch (err: unknown) {
      setError(apiErrorMessage(err, 'Failed to create account. Please check inputs and try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!instituteName.trim() || !slug.trim()) {
      setError('Academy name and page slug are required.');
      return;
    }

    setLoading(true);
    try {
      const tokens = userTokens || {
        access: localStorage.getItem('access_token') || '',
        refresh: localStorage.getItem('refresh_token') || '',
      };
      if (!tokens.access) {
        throw new Error('Authentication session lost. Please log in.');
      }

      await apiClient.put('/institute/my-institute/', {
        name: instituteName.trim(),
        slug: slug.trim(),
        tagline: tagline.trim(),
        contact_email: contactEmail || email,
        phone: phone.trim(),
      });

      await login(tokens.access, tokens.refresh);
      router.replace('/institute/dashboard');
    } catch (err: unknown) {
      setError(apiErrorMessage(err, 'Could not finish academy setup. Try a different name or slug.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.05fr) minmax(0, 0.95fr)' },
        bgcolor: isDark ? '#0F1117' : '#F3F7F4',
      }}
    >
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          px: { md: 6, lg: 8 },
          py: 6,
          background: `linear-gradient(165deg, ${GREEN} 0%, #166534 48%, #134E2A 100%)`,
          '&::after': {
            content: '""',
            position: 'absolute',
            width: 420,
            height: 420,
            right: -120,
            bottom: -140,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${AMBER} 0%, rgba(245,158,11,0) 68%)`,
            opacity: 0.28,
            pointerEvents: 'none',
          },
        }}
      >
        <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#FCD34D', mb: 1.5, position: 'relative' }}>
          Coaching centre
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Cabinet Grotesk', sans-serif",
            fontWeight: 900,
            fontSize: { md: '2.4rem', lg: '2.75rem' },
            lineHeight: 1.12,
            letterSpacing: '-0.03em',
            color: '#FFFFFF',
            maxWidth: 460,
            position: 'relative',
          }}
        >
          Run your academy from one dashboard.
        </Typography>
        <Typography sx={{ mt: 2, mb: 4, color: 'rgba(255,255,255,0.86)', fontSize: '1.05rem', maxWidth: 440, lineHeight: 1.6, position: 'relative' }}>
          Register the centre, then add students, batches, fees, and notes. Students join from the public Institutes page.
        </Typography>
        <Stack spacing={2.25} sx={{ position: 'relative' }}>
          {BENEFITS.map((item) => (
            <Box key={item.title} sx={{ display: 'flex', gap: 1.75, alignItems: 'flex-start' }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  color: '#FCD34D',
                  bgcolor: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.22)',
                }}
              >
                {item.icon}
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, color: '#FFFFFF', fontSize: '0.98rem' }}>{item.title}</Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.78)', fontSize: '0.9rem', lineHeight: 1.45 }}>{item.detail}</Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', px: { xs: 2.25, sm: 4 }, py: { xs: 3, md: 5 } }}>
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 480,
            p: { xs: 3, sm: 4 },
            borderRadius: '24px',
            bgcolor: isDark ? '#161B22' : '#FFFFFF',
            border: '1.5px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.08)',
            boxShadow: isDark ? '0 24px 60px rgba(0,0,0,0.45)' : '0 18px 50px rgba(15, 23, 42, 0.08)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                bgcolor: 'white',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(27,107,58,0.22)',
                overflow: 'hidden',
                p: 0.5,
              }}
            >
              <Image src="/logo.png" alt="KPSC Master" width={40} height={40} style={{ objectFit: 'contain' }} />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 900, fontSize: '1.15rem', lineHeight: 1.2 }}>
                Register academy
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>Owner account, then centre details</Typography>
            </Box>
          </Box>

          <Stepper
            activeStep={currentStep - 1}
            alternativeLabel
            sx={{
              mb: 3,
              '& .MuiStepLabel-label': { color: 'text.secondary', fontSize: '0.78rem' },
              '& .MuiStepLabel-label.Mui-active': { color: PURPLE, fontWeight: 800 },
              '& .MuiStepLabel-label.Mui-completed': { color: GREEN_LIGHT },
              '& .MuiStepIcon-root.Mui-active': { color: PURPLE },
              '& .MuiStepIcon-root.Mui-completed': { color: GREEN_LIGHT },
            }}
          >
            <Step><StepLabel>Owner login</StepLabel></Step>
            <Step><StepLabel>Academy</StepLabel></Step>
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: '12px' }}>
              {error}
            </Alert>
          )}

          <AnimatePresence mode="wait">
            {currentStep === 1 ? (
              <motion.div key="step1" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }}>
                <form onSubmit={handleStep1Submit}>
                  <Stack spacing={2}>
                    <StyledTextField
                      placeholder="Username"
                      fullWidth
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      autoFocus
                      InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutline /></InputAdornment> }}
                    />
                    <StyledTextField
                      placeholder="Email"
                      type="email"
                      fullWidth
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      InputProps={{ startAdornment: <InputAdornment position="start"><MailOutline /></InputAdornment> }}
                    />
                    <StyledTextField
                      placeholder="Password (8+ characters)"
                      type="password"
                      fullWidth
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      InputProps={{ startAdornment: <InputAdornment position="start"><LockOutlined /></InputAdornment> }}
                    />
                    <StyledTextField
                      placeholder="Confirm password"
                      type="password"
                      fullWidth
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      InputProps={{ startAdornment: <InputAdornment position="start"><LockOutlined /></InputAdornment> }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={loading}
                      sx={{
                        borderRadius: '14px',
                        height: '56px',
                        mt: 0.5,
                        background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_LIGHT} 100%)`,
                        color: '#fff',
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 800,
                        boxShadow: '0 8px 18px rgba(27,107,58,0.28)',
                        '&:hover': { background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_LIGHT} 100%)`, filter: 'brightness(1.06)' },
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Continue to academy'}
                    </Button>
                  </Stack>
                </form>
              </motion.div>
            ) : (
              <motion.div key="step2" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }}>
                <form onSubmit={handleStep2Submit}>
                  <Stack spacing={2}>
                    <StyledTextField
                      placeholder="Coaching centre name"
                      fullWidth
                      value={instituteName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                      autoFocus
                      InputProps={{ startAdornment: <InputAdornment position="start"><CorporateFareIcon /></InputAdornment> }}
                    />
                    <StyledTextField
                      placeholder="Page slug (e.g. malabar-academy)"
                      fullWidth
                      value={slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      required
                      helperText={`Public page: /institute/${slug || 'your-slug'}`}
                      FormHelperTextProps={{ sx: { color: 'text.secondary', ml: 1 } }}
                      InputProps={{ startAdornment: <InputAdornment position="start"><LinkIcon /></InputAdornment> }}
                    />
                    <StyledTextField
                      placeholder="Tagline (optional)"
                      fullWidth
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      InputProps={{ startAdornment: <InputAdornment position="start"><LabelImportantIcon /></InputAdornment> }}
                    />
                    <StyledTextField
                      placeholder="Contact email (optional)"
                      type="email"
                      fullWidth
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      InputProps={{ startAdornment: <InputAdornment position="start"><MailOutline /></InputAdornment> }}
                    />
                    <StyledTextField
                      placeholder="Phone (optional)"
                      fullWidth
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment> }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={loading}
                      sx={{
                        borderRadius: '14px',
                        height: '56px',
                        mt: 0.5,
                        background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_LIGHT} 100%)`,
                        color: '#fff',
                        textTransform: 'none',
                        fontSize: '1rem',
                        fontWeight: 800,
                        boxShadow: '0 8px 18px rgba(27,107,58,0.28)',
                        '&:hover': { background: `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_LIGHT} 100%)`, filter: 'brightness(1.06)' },
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Open academy dashboard'}
                    </Button>
                  </Stack>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <Box sx={{ mt: 3.5, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Already have an academy?{' '}
              <MuiLink component={Link} href="/login?tab=1" sx={{ color: GREEN, fontWeight: 800, textDecoration: 'none' }}>
                Institute login
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
