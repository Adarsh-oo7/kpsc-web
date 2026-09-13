'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Tab,
  IconButton,
} from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import PersonOutline from '@mui/icons-material/PersonOutline';
import LockOutlined from '@mui/icons-material/LockOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import PersonPinOutlinedIcon from '@mui/icons-material/PersonPinOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { motion } from 'framer-motion';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { afterAuthPath, apiErrorMessage, safeNextPath } from '@/lib/auth';

const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'activeTab',
})<{ activeTab: number }>(({ theme, activeTab }) => ({
  '& .MuiInputBase-root': {
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
    borderRadius: '14px',
    color: theme.palette.text.primary,
    minHeight: '56px',
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
  '& .MuiFormHelperText-root': {
    marginLeft: '6px',
    fontFamily: "'Satoshi', sans-serif",
  },
}));

export default function LoginClient({
  nextParam = null,
  tabParam = null,
  typeParam = null,
}: {
  nextParam?: string | null;
  tabParam?: string | null;
  typeParam?: string | null;
}) {
  const router = useRouter();
  const { login, logout, user, profile, isLoading } = useAppContext();
  const nextPath = safeNextPath(nextParam);

  const [activeTab, setActiveTab] = useState(
    tabParam === '1' || typeParam === 'institute' ? 1 : 0
  );
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(afterAuthPath(profile, nextPath));
    }
  }, [user, profile, isLoading, router, nextPath]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    setError('');
    setFieldErrors({});
    setUsername('');
    setPassword('');
  };

  const finishLogin = async (access: string, refresh: string) => {
    const profileData = await login(access, refresh);
    if (activeTab === 1 && profileData?.is_owner !== true) {
      logout();
      setError('This is a student account. Use Student Login, or register your academy from Institute Login.');
      return;
    }
    if (activeTab === 0 && profileData?.is_owner === true) {
      router.replace('/institute/dashboard');
      return;
    }
    router.replace(afterAuthPath(profileData, nextPath));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { username?: string; password?: string } = {};
    if (!username.trim()) nextErrors.username = 'Enter the email or username you used to sign up.';
    if (!password) nextErrors.password = 'Enter your password.';
    setFieldErrors(nextErrors);
    setError('');
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const tokenResponse = await apiClient.post('/auth/token/', {
        username: username.trim(),
        password,
      });
      const { access, refresh } = tokenResponse.data;
      await finishLogin(access, refresh);
    } catch (err: any) {
      setError(apiErrorMessage(err, 'Login failed. Please check your email/username and password.'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    setError('');
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/google/', { credential });
      const { access, refresh } = response.data;
      await finishLogin(access, refresh);
    } catch (err: any) {
      setError(apiErrorMessage(err, 'Google Sign-In failed. Please try again, or use email.'));
    } finally {
      setLoading(false);
    }
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

  const registerHref = nextPath ? `/register?next=${encodeURIComponent(nextPath)}` : '/register';

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
          }
          return theme.palette.mode === 'dark'
            ? 'radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 15% 80%, rgba(46, 139, 87, 0.08) 0%, transparent 50%)'
            : 'radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%), radial-gradient(circle at 15% 80%, rgba(46, 139, 87, 0.04) 0%, transparent 50%)';
        },
        transition: 'background-image 0.5s ease',
      }}
    >
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
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
              {activeTab === 0 ? 'Welcome back' : 'Institute portal'}
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', mt: 0.5, textAlign: 'center' }}>
              {activeTab === 0
                ? 'Use your email or username. After login we take you to today’s practice.'
                : 'For coaching-centre owners only. Students should use Student Login.'}
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

          <form onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.5}>
              <StyledTextField
                placeholder={activeTab === 0 ? 'Email or username' : 'Institute username'}
                fullWidth
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, username: undefined }));
                }}
                autoFocus
                autoComplete="username"
                activeTab={activeTab}
                error={Boolean(fieldErrors.username)}
                helperText={fieldErrors.username || (activeTab === 0 ? 'The email you signed up with also works here.' : 'Use the academy owner username.')}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><PersonOutline /></InputAdornment>,
                }}
              />
              <StyledTextField
                placeholder="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
                autoComplete="current-password"
                activeTab={activeTab}
                error={Boolean(fieldErrors.password)}
                helperText={fieldErrors.password || ' '}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><LockOutlined /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        type="button"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
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
                  mt: 0.5,
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
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Log in'}
              </Button>
            </Stack>
          </form>

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
                onError={setError}
              />
            </>
          )}

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
                New here?{' '}
                <MuiLink
                  component={Link}
                  href={registerHref}
                  sx={{
                    color: 'primary.main',
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    '&:hover': { color: 'primary.dark', textDecoration: 'underline' }
                  }}
                >
                  Create a free student account
                </MuiLink>
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Don’t have an academy account?{' '}
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
                  Register academy
                </MuiLink>
              </Typography>
            )}
          </Stack>
        </Paper>
      </motion.div>
    </Box>
  );
}
