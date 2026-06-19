'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  styled,
  Link as MuiLink,
  Paper,
  Stack,
  Tabs,
  Tab
} from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import PersonOutline from '@mui/icons-material/PersonOutline';
import LockOutlined from '@mui/icons-material/LockOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import PersonPinOutlinedIcon from '@mui/icons-material/PersonPinOutlined';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';
import GoogleSignInButton from '@/components/GoogleSignInButton';

// Styled text field that dynamically updates focused border color based on tab active state
const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'activeTab',
})<{ activeTab: number }>(({ theme, activeTab }) => ({
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
      borderColor: activeTab === 0 ? '#2E8B57' : '#8B5CF6',
      boxShadow: activeTab === 0 ? '0 0 0 2px rgba(46, 139, 87, 0.2)' : '0 0 0 2px rgba(139, 92, 246, 0.2)',
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

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, profile, isLoading } = useAppContext();

  // Tab indices: 0 = Student Login, 1 = Institute Login
  const [activeTab, setActiveTab] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Set default tab based on query param
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === '1' || searchParams.get('type') === 'institute') {
      setActiveTab(1);
    } else {
      setActiveTab(0);
    }
  }, [searchParams]);

  // Redirect if user is already logged in
  useEffect(() => {
    if (!isLoading && user) {
      if (profile?.is_owner === true) {
        router.push('/institute/dashboard');
      } else if (!profile?.preferred_exams || profile.preferred_exams.length === 0) {
        router.push('/onboarding');
      } else {
        router.push('/');
      }
    }
  }, [user, profile, isLoading, router]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setError('');
    setUsername('');
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const tokenResponse = await apiClient.post('/auth/token/', { username, password });
      const { access, refresh } = tokenResponse.data;

      const profileData = await login(access, refresh);

      if (profileData?.is_owner === true) {
        router.push('/institute/dashboard');
      } else if (activeTab === 1 && profileData?.is_owner !== true) {
        setError('This account is not registered as an Institute Owner.');
      } else if (!profileData?.preferred_exams || profileData.preferred_exams.length === 0) {
        router.push('/onboarding');
      } else {
        router.push('/');
      }

    } catch (err: any) {
      console.error(err);
      setError('Login failed. Please check your username and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    setError('');
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/google/', { credential });
      const { access, refresh, has_preferred_exams } = response.data;

      const profileData = await login(access, refresh);

      if (profileData?.is_owner === true) {
        router.push('/institute/dashboard');
      } else if (!has_preferred_exams || !profileData?.preferred_exams || profileData.preferred_exams.length === 0) {
        router.push('/onboarding');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Google Sign-In failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (errorMsg: string) => {
    setError(errorMsg);
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        bgcolor: 'background.default' 
      }}>
        <CircularProgress sx={{ color: activeTab === 0 ? '#2E8B57' : '#8B5CF6' }} />
      </Box>
    );
  }

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
        backgroundImage: (theme) => {
          if (activeTab === 0) {
            return theme.palette.mode === 'dark'
              ? 'radial-gradient(circle at 80% 20%, rgba(27, 107, 58, 0.12) 0%, transparent 50%), radial-gradient(circle at 15% 80%, rgba(245, 158, 11, 0.08) 0%, transparent 50%)'
              : 'radial-gradient(circle at 80% 20%, rgba(27, 107, 58, 0.06) 0%, transparent 50%), radial-gradient(circle at 15% 80%, rgba(245, 158, 11, 0.04) 0%, transparent 50%)';
          } else {
            return theme.palette.mode === 'dark'
              ? 'radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 15% 80%, rgba(46, 139, 87, 0.08) 0%, transparent 50%)'
              : 'radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%), radial-gradient(circle at 15% 80%, rgba(46, 139, 87, 0.04) 0%, transparent 50%)';
          }
        },
        transition: 'background-image 0.5s ease',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: '450px' }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 5 },
            borderRadius: '28px',
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(22, 27, 34, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            border: '1px solid',
            borderColor: 'divider',
            backdropFilter: 'blur(12px)',
            width: '100%',
          }}
        >
          {/* Logo & Header */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3.5 }}>
            <Box sx={{
              width: 80, height: 80,
              bgcolor: 'white',
              borderRadius: '22px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: activeTab === 0 ? '0 8px 24px rgba(46, 139, 87, 0.25)' : '0 8px 24px rgba(139, 92, 246, 0.25)',
              overflow: 'hidden',
              p: 1,
              mb: 2.5,
              transition: 'box-shadow 0.4s ease'
            }}>
              <Image
                src="/logo.png"
                alt="KPSC Master Logo"
                width={64}
                height={64}
                style={{ objectFit: 'contain' }}
              />
            </Box>

            {/* Custom MUI Tabs switcher for student/institute portal */}
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              centered
              sx={{
                mb: 3,
                width: '100%',
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                borderRadius: '16px',
                p: 0.5,
                '& .MuiTabs-indicator': {
                  height: '100%',
                  borderRadius: '12px',
                  bgcolor: activeTab === 0 ? 'rgba(46, 139, 87, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                  zIndex: 1,
                  transition: 'background-color 0.3s ease, left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                },
                '& .MuiTab-root': {
                  zIndex: 2,
                  minHeight: '44px',
                  py: 1,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'text.secondary',
                  transition: 'color 0.3s ease',
                  '&.Mui-selected': {
                    color: activeTab === 0 ? '#2E8B57' : '#8B5CF6',
                  }
                }
              }}
            >
              <Tab 
                label="Student Login" 
                icon={<PersonPinOutlinedIcon sx={{ fontSize: 18 }} />} 
                iconPosition="start"
                sx={{ flex: 1 }}
              />
              <Tab 
                label="Institute Login" 
                icon={<SchoolOutlinedIcon sx={{ fontSize: 18 }} />} 
                iconPosition="start"
                sx={{ flex: 1 }}
              />
            </Tabs>
            
            <Typography variant="h4" sx={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 900, color: 'text.primary', letterSpacing: '-0.02em', textAlign: 'center' }}>
              {activeTab === 0 ? 'Welcome Back' : 'Institute Portal'}
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', mt: 0.5, textAlign: 'center' }}>
              {activeTab === 0 ? 'Login to continue your PSC preparation' : 'Coaching Center Owner Login'}
            </Typography>
          </Box>

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

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <StyledTextField
                placeholder="Username"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                activeTab={activeTab}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><PersonOutline /></InputAdornment>,
                }}
              />
              <StyledTextField
                placeholder="Password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                activeTab={activeTab}
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
                  background: activeTab === 0 
                    ? 'linear-gradient(135deg, #1B6B3A 0%, #2E8B57 100%)'
                    : 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', 
                  textTransform: 'none', 
                  fontSize: '1rem',
                  fontWeight: 700,
                  boxShadow: activeTab === 0 
                    ? '0 4px 14px rgba(27, 107, 58, 0.3)'
                    : '0 4px 14px rgba(139, 92, 246, 0.3)',
                  transition: 'all 0.3s ease',
                  '&:hover': { 
                    background: activeTab === 0 
                      ? 'linear-gradient(135deg, #1B6B3A 0%, #2E8B57 100%)'
                      : 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', 
                    filter: 'brightness(1.1)',
                    boxShadow: activeTab === 0 
                      ? '0 6px 20px rgba(27, 107, 58, 0.4)'
                      : '0 6px 20px rgba(139, 92, 246, 0.4)',
                  },
                  '&:active': {
                    transform: 'scale(0.98)'
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
              </Button>
            </Stack>
          </form>

          {/* Render Google Sign In button only for student tab */}
          {activeTab === 0 && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', my: 2.5 }}>
                <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                <Typography variant="caption" sx={{ px: 2, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  or
                </Typography>
                <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
              </Box>

              <GoogleSignInButton 
                onSuccess={handleGoogleSuccess} 
                onError={handleGoogleError} 
              />
            </>
          )}

          {/* Divider */}
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, mb: activeTab === 0 ? 3 : 2 }}>
            <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
            <Typography variant="caption" sx={{ px: 2, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Portal Links
            </Typography>
            <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
          </Box>

          <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
            {activeTab === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Don’t have an account?{' '}
                <MuiLink 
                  component={Link} 
                  href="/register" 
                  sx={{ 
                    color: 'primary.main', 
                    fontWeight: 700, 
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    '&:hover': { color: 'primary.dark', textDecoration: 'underline' } 
                  }}
                >
                  Create Account
                </MuiLink>
              </Typography>
            ) : (
              <>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Don’t have an account?{' '}
                  <MuiLink 
                    component={Link} 
                    href="/institute/register" 
                    sx={{ 
                      color: '#8B5CF6', 
                      fontWeight: 700, 
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                      '&:hover': { color: '#6D28D9', textDecoration: 'underline' } 
                    }}
                  >
                    Register Academy Here
                  </MuiLink>
                </Typography>
              </>
            )}
          </Stack>
        </Paper>
      </motion.div>
    </Box>
  );
}
