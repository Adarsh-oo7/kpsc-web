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
  IconButton,
  useTheme,
} from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import PersonOutline from '@mui/icons-material/PersonOutline';
import LockOutlined from '@mui/icons-material/LockOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import PersonPinOutlinedIcon from '@mui/icons-material/PersonPinOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import QuizOutlined from '@mui/icons-material/QuizOutlined';
import MenuBookOutlined from '@mui/icons-material/MenuBookOutlined';
import TranslateOutlined from '@mui/icons-material/TranslateOutlined';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { afterAuthPath, apiErrorMessage, safeNextPath } from '@/lib/auth';

const GREEN = '#1B6B3A';
const GREEN_LIGHT = '#2E8B57';
const AMBER = '#F59E0B';
const PURPLE = '#8B5CF6';

const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'activeTab',
})<{ activeTab: number }>(({ theme, activeTab }) => ({
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
      borderColor: activeTab === 0 ? GREEN_LIGHT : PURPLE,
      boxShadow: activeTab === 0
        ? '0 0 0 3px rgba(46, 139, 87, 0.28)'
        : '0 0 0 3px rgba(139, 92, 246, 0.28)',
    },
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  },
  '& .MuiInputBase-input': {
    paddingLeft: '10px',
    fontFamily: "'Satoshi', sans-serif",
    fontSize: '1rem',
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
    fontFamily: "'Satoshi', sans-serif",
    fontSize: '0.8rem',
  },
}));

const BENEFITS = [
  { icon: <QuizOutlined sx={{ fontSize: 22 }} />, title: 'Daily quiz', detail: 'Practice in the same sections as the real PSC paper.' },
  { icon: <MenuBookOutlined sx={{ fontSize: 22 }} />, title: 'Syllabus-first', detail: 'LDC, LGS, Degree and more — pick your exam after login.' },
  { icon: <TranslateOutlined sx={{ fontSize: 22 }} />, title: 'Malayalam + English', detail: 'Clear explanations in the language you study in.' },
];

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
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { login, logout, user, profile, isLoading } = useAppContext();
  const nextPath = safeNextPath(nextParam);
  const isStudent = (tabParam === '1' || typeParam === 'institute') ? false : true;

  const [activeTab, setActiveTab] = useState(isStudent ? 0 : 1);
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

  const accent = activeTab === 0 ? GREEN : PURPLE;
  const accentLight = activeTab === 0 ? GREEN_LIGHT : '#6D28D9';

  const handleTabChange = (nextTab: number) => {
    setActiveTab(nextTab);
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
        minHeight: 'calc(100vh - 64px)',
        bgcolor: 'background.default',
      }}>
        <CircularProgress sx={{ color: accent }} />
      </Box>
    );
  }

  const registerHref = nextPath ? `/register?next=${encodeURIComponent(nextPath)}` : '/register';

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
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
          px: { md: 6, lg: 8 },
          py: 6,
          background: isDark
            ? `linear-gradient(160deg, rgba(27,107,58,0.28) 0%, rgba(15,17,23,0.4) 48%, rgba(245,158,11,0.12) 100%), ${theme.palette.background.default}`
            : 'linear-gradient(160deg, #E8F5EC 0%, #F8FAFC 46%, #FFF7E8 100%)',
          borderRight: '1px solid',
          borderColor: isDark ? 'rgba(46,139,87,0.25)' : 'rgba(27,107,58,0.12)',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: GREEN_LIGHT,
            mb: 1.5,
          }}
        >
          Kerala PSC prep
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Cabinet Grotesk', sans-serif",
            fontWeight: 900,
            fontSize: { md: '2.4rem', lg: '2.75rem' },
            lineHeight: 1.12,
            letterSpacing: '-0.03em',
            color: 'text.primary',
            maxWidth: 460,
          }}
        >
          {activeTab === 0 ? 'Start today’s learning in one login.' : 'Run your academy from one dashboard.'}
        </Typography>
        <Typography sx={{ mt: 2, mb: 4, color: 'text.secondary', fontSize: '1.05rem', maxWidth: 440, lineHeight: 1.6 }}>
          {activeTab === 0
            ? 'Log in and we take you straight to practice — daily quiz, syllabus sections, and explanations you can actually use.'
            : 'Institute owners can manage batches, students, and fees here. Students should stay on Student.'}
        </Typography>
        <Stack spacing={2.25}>
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
                  color: GREEN,
                  bgcolor: isDark ? 'rgba(46,139,87,0.18)' : 'rgba(27,107,58,0.12)',
                  border: '1px solid',
                  borderColor: isDark ? 'rgba(46,139,87,0.35)' : 'rgba(27,107,58,0.18)',
                }}
              >
                {item.icon}
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.98rem' }}>{item.title}</Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', lineHeight: 1.45 }}>{item.detail}</Typography>
              </Box>
            </Box>
          ))}
        </Stack>
        <Box
          sx={{
            mt: 5,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 1,
            px: 1.5,
            py: 0.85,
            borderRadius: '999px',
            bgcolor: isDark ? 'rgba(245,158,11,0.14)' : 'rgba(245,158,11,0.16)',
            border: '1px solid',
            borderColor: isDark ? 'rgba(245,158,11,0.35)' : 'rgba(217,119,6,0.28)',
            width: 'fit-content',
          }}
        >
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: AMBER }} />
          <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: isDark ? '#FCD34D' : '#92400E' }}>
            Free to start · Pick your exam after login
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2.25, sm: 4 },
          py: { xs: 3, md: 5 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 440,
            p: { xs: 3, sm: 4 },
            borderRadius: '24px',
            bgcolor: isDark ? '#161B22' : '#FFFFFF',
            border: '1.5px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.08)',
            boxShadow: isDark
              ? '0 24px 60px rgba(0,0,0,0.45)'
              : '0 18px 50px rgba(15, 23, 42, 0.08)',
          }}
        >
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 2.5 }}>
            <Box sx={{
              width: 48, height: 48, bgcolor: 'white', borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(27,107,58,0.22)', overflow: 'hidden', p: 0.5,
            }}>
              <Image src="/logo.png" alt="KPSC Master" width={40} height={40} style={{ objectFit: 'contain' }} />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 900, fontSize: '1.15rem', lineHeight: 1.2 }}>
                Start learning
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>Kerala PSC practice, ready after login</Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 0.75,
              p: 0.6,
              mb: 3,
              borderRadius: '14px',
              bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
              border: '1px solid',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
            }}
          >
            {[
              { id: 0, label: 'Student', icon: <PersonPinOutlinedIcon sx={{ fontSize: 18 }} /> },
              { id: 1, label: 'Institute', icon: <SchoolOutlinedIcon sx={{ fontSize: 18 }} /> },
            ].map((tab) => {
              const selected = activeTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  startIcon={tab.icon}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 800,
                    borderRadius: '10px',
                    py: 1.1,
                    color: selected ? '#fff' : 'text.secondary',
                    background: selected
                      ? (tab.id === 0 ? `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_LIGHT} 100%)` : `linear-gradient(135deg, ${PURPLE} 0%, #6D28D9 100%)`)
                      : 'transparent',
                    boxShadow: selected
                      ? (tab.id === 0 ? '0 6px 16px rgba(27,107,58,0.28)' : '0 6px 16px rgba(139,92,246,0.28)')
                      : 'none',
                    '&:hover': {
                      background: selected
                        ? (tab.id === 0 ? `linear-gradient(135deg, ${GREEN} 0%, ${GREEN_LIGHT} 100%)` : `linear-gradient(135deg, ${PURPLE} 0%, #6D28D9 100%)`)
                        : (isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0'),
                    },
                  }}
                >
                  {tab.label}
                </Button>
              );
            })}
          </Box>

          <Typography
            sx={{
              fontFamily: "'Cabinet Grotesk', sans-serif",
              fontWeight: 900,
              fontSize: { xs: '1.55rem', sm: '1.7rem' },
              letterSpacing: '-0.03em',
              color: 'text.primary',
              mb: 0.75,
            }}
          >
            {activeTab === 0 ? 'Welcome back' : 'Institute portal'}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.95rem', mb: 3, lineHeight: 1.5 }}>
            {activeTab === 0
              ? 'Use your email or username. After login we open today’s practice.'
              : 'For coaching-centre owners. Students should use Student.'}
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 2.5,
                borderRadius: '12px',
                bgcolor: 'rgba(239, 68, 68, 0.12)',
                color: '#FCA5A5',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                '& .MuiAlert-icon': { color: '#EF4444' },
                '& .MuiAlert-message': { color: isDark ? '#FECACA' : '#991B1B', fontWeight: 600 },
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.25}>
              <Box>
                <Typography component="label" htmlFor="login-username" sx={{ display: 'block', fontWeight: 800, fontSize: '0.82rem', mb: 0.75, color: 'text.primary' }}>
                  {activeTab === 0 ? 'Email or username' : 'Institute username'}
                </Typography>
                <StyledTextField
                  id="login-username"
                  placeholder={activeTab === 0 ? 'you@email.com or your username' : 'Academy owner username'}
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
                  helperText={fieldErrors.username || ' '}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PersonOutline /></InputAdornment>,
                  }}
                />
              </Box>
              <Box>
                <Typography component="label" htmlFor="login-password" sx={{ display: 'block', fontWeight: 800, fontSize: '0.82rem', mb: 0.75, color: 'text.primary' }}>
                  Password
                </Typography>
                <StyledTextField
                  id="login-password"
                  placeholder="Your password"
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
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                  borderRadius: '14px',
                  height: 56,
                  mt: 0.5,
                  background: `linear-gradient(135deg, ${accent} 0%, ${accentLight} 100%)`,
                  textTransform: 'none',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  letterSpacing: '-0.01em',
                  color: '#fff',
                  boxShadow: activeTab === 0
                    ? '0 8px 22px rgba(27, 107, 58, 0.38)'
                    : '0 8px 22px rgba(139, 92, 246, 0.38)',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${accent} 0%, ${accentLight} 100%)`,
                    filter: 'brightness(1.08)',
                  },
                  '&:disabled': { color: '#fff', opacity: 0.72 },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : (activeTab === 0 ? 'Continue to practice' : 'Open institute dashboard')}
              </Button>
            </Stack>
          </form>

          {activeTab === 0 && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', my: 2.5 }}>
                <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                <Typography variant="caption" sx={{ px: 1.5, color: 'text.secondary', fontWeight: 700, letterSpacing: '0.06em' }}>
                  or continue with Google
                </Typography>
                <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
              </Box>
              <Box
                sx={{
                  borderRadius: '14px',
                  border: '1.5px solid',
                  borderColor: isDark ? 'rgba(255,255,255,0.16)' : '#CBD5E1',
                  p: 0.5,
                  bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                }}
              >
                <GoogleSignInButton onSuccess={handleGoogleSuccess} onError={setError} />
              </Box>
            </>
          )}

          <Typography sx={{ mt: 3, textAlign: 'center', color: 'text.secondary', fontSize: '0.95rem' }}>
            {activeTab === 0 ? 'New here? ' : 'No academy account? '}
            <MuiLink
              component={Link}
              href={activeTab === 0 ? registerHref : '/institute/register'}
              sx={{
                color: accent,
                fontWeight: 800,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {activeTab === 0 ? 'Create a free student account' : 'Register academy'}
            </MuiLink>
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
