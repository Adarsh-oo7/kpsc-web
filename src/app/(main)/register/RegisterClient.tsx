'use client';

import { useEffect, useMemo, useState } from 'react';
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
  IconButton,
} from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import PersonOutline from '@mui/icons-material/PersonOutline';
import BadgeOutlined from '@mui/icons-material/BadgeOutlined';
import MailOutline from '@mui/icons-material/MailOutline';
import LockOutlined from '@mui/icons-material/LockOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { motion } from 'framer-motion';
import apiClient from '@/lib/apiClient';
import { useAppContext } from '@/context/AppContext';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import {
  afterAuthPath,
  apiErrorMessage,
  fieldErrorsFromApi,
  isValidIndianMobile,
  safeNextPath,
  suggestUsername,
} from '@/lib/auth';

const StyledTextField = styled(TextField)(({ theme }) => ({
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
      borderColor: '#2E8B57',
      boxShadow: '0 0 0 2px rgba(46, 139, 87, 0.2)',
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

type FieldKey = 'full_name' | 'username' | 'email' | 'phone_number' | 'password' | 'confirmPassword';

export default function RegisterClient({
  nextParam = null,
}: {
  nextParam?: string | null;
}) {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, user, profile, isLoading } = useAppContext();
  const nextPath = safeNextPath(nextParam);

  const passwordHint = useMemo(() => {
    if (!password) return 'At least 8 characters. Avoid using your name.';
    if (password.length < 8) return `${8 - password.length} more character${password.length === 7 ? '' : 's'} needed.`;
    if (password !== confirmPassword && confirmPassword) return 'Passwords match? Check confirm password below.';
    return 'Looks good.';
  }, [password, confirmPassword]);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(afterAuthPath(profile, nextPath));
    }
  }, [isLoading, user, profile, nextPath, router]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
        <CircularProgress sx={{ color: '#2E8B57' }} />
      </Box>
    );
  }

  const applyUsernameFrom = (nameValue: string, emailValue: string) => {
    if (!usernameTouched) {
      setUsername(suggestUsername(nameValue, emailValue));
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    setError('');
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/google/', { credential });
      const { access, refresh } = response.data;
      const profileData = await login(access, refresh);
      router.replace(afterAuthPath(profileData, nextPath));
    } catch (err: any) {
      setError(apiErrorMessage(err, 'Google Sign-In failed. Please try again, or use email.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Partial<Record<FieldKey, string>> = {};
    if (!fullName.trim()) nextErrors.full_name = 'Enter your full name.';
    if (!username.trim() || username.trim().length < 3) {
      nextErrors.username = 'Choose a username with at least 3 letters or numbers, no spaces.';
    } else if (!/^[a-zA-Z0-9._]{3,30}$/.test(username.trim())) {
      nextErrors.username = 'Use only letters, numbers, dots, or underscores.';
    }
    if (!email.trim()) nextErrors.email = 'Enter your email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = 'Enter a valid email, like name@gmail.com.';
    if (phoneNumber && !isValidIndianMobile(phoneNumber)) {
      nextErrors.phone_number = 'Enter a 10-digit Indian mobile number, or leave this blank.';
    }
    if (!password) nextErrors.password = 'Create a password.';
    else if (password.length < 8) nextErrors.password = 'Use at least 8 characters.';
    if (password !== confirmPassword) nextErrors.confirmPassword = 'Passwords do not match.';

    setFieldErrors(nextErrors);
    setError('');
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/register/', {
        full_name: fullName.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim(),
        password,
        phone_number: phoneNumber.trim(),
      });

      let access = response.data.access;
      let refresh = response.data.refresh;
      if (!access || !refresh) {
        const tokenResponse = await apiClient.post('/auth/token/', {
          username: username.trim().toLowerCase(),
          password,
        });
        access = tokenResponse.data.access;
        refresh = tokenResponse.data.refresh;
      }

      const profileData = await login(access, refresh);
      router.replace(afterAuthPath(profileData, nextPath));
    } catch (err: any) {
      setFieldErrors(fieldErrorsFromApi(err));
      setError(apiErrorMessage(err, 'Could not create your account. Check the fields and try again.'));
    } finally {
      setLoading(false);
    }
  };

  const loginHref = nextPath ? `/login?next=${encodeURIComponent(nextPath)}` : '/login';

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
          ? 'radial-gradient(circle at 80% 20%, rgba(27, 107, 58, 0.12) 0%, transparent 50%), radial-gradient(circle at 15% 80%, rgba(245, 158, 11, 0.08) 0%, transparent 50%)'
          : 'radial-gradient(circle at 80% 20%, rgba(27, 107, 58, 0.06) 0%, transparent 50%), radial-gradient(circle at 15% 80%, rgba(245, 158, 11, 0.04) 0%, transparent 50%)',
      }}
    >
      <motion.div
        initial={false}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: '440px' }}
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
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3.5 }}>
            <Box sx={{
              width: 80, height: 80,
              bgcolor: 'white',
              borderRadius: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(46, 139, 87, 0.25)',
              overflow: 'hidden',
              p: 1,
              mb: 2.5
            }}>
              <Image
                src="/logo.png"
                alt="KPSC Master Logo"
                width={64}
                height={64}
                style={{ objectFit: 'contain' }}
              />
            </Box>

            <Typography variant="h4" sx={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 900, color: 'text.primary', letterSpacing: '-0.02em' }}>
              Create your account
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', mt: 0.5, textAlign: 'center' }}>
              Free for students. Next you’ll pick your exam — about 30 seconds.
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
            <Stack spacing={2.25}>
              <StyledTextField
                placeholder="Full name"
                fullWidth
                value={fullName}
                onChange={(e) => {
                  const value = e.target.value;
                  setFullName(value);
                  applyUsernameFrom(value, email);
                  setFieldErrors((prev) => ({ ...prev, full_name: undefined }));
                }}
                autoFocus
                autoComplete="name"
                error={Boolean(fieldErrors.full_name)}
                helperText={fieldErrors.full_name || 'Your real name, as you want it on the leaderboard.'}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><PersonOutline /></InputAdornment>,
                }}
              />
              <StyledTextField
                placeholder="Username"
                fullWidth
                value={username}
                onChange={(e) => {
                  setUsernameTouched(true);
                  setUsername(e.target.value.trim().toLowerCase());
                  setFieldErrors((prev) => ({ ...prev, username: undefined }));
                }}
                autoComplete="username"
                error={Boolean(fieldErrors.username)}
                helperText={fieldErrors.username || 'No spaces. You can also log in with your email.'}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><BadgeOutlined /></InputAdornment>,
                }}
              />
              <StyledTextField
                placeholder="Email"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => {
                  const value = e.target.value;
                  setEmail(value);
                  applyUsernameFrom(fullName, value);
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }}
                autoComplete="email"
                error={Boolean(fieldErrors.email)}
                helperText={fieldErrors.email || 'Used to log in and recover your account.'}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><MailOutline /></InputAdornment>,
                }}
              />
              <StyledTextField
                placeholder="WhatsApp number (optional)"
                type="tel"
                fullWidth
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, phone_number: undefined }));
                }}
                autoComplete="tel"
                error={Boolean(fieldErrors.phone_number)}
                helperText={fieldErrors.phone_number || 'Optional. 10-digit number for study reminders.'}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><PhoneOutlined /></InputAdornment>,
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
                autoComplete="new-password"
                error={Boolean(fieldErrors.password)}
                helperText={fieldErrors.password || passwordHint}
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
              <StyledTextField
                placeholder="Confirm password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                autoComplete="new-password"
                error={Boolean(fieldErrors.confirmPassword)}
                helperText={fieldErrors.confirmPassword || ' '}
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
                  mt: 0.5,
                  background: 'linear-gradient(135deg, #1B6B3A 0%, #2E8B57 100%)',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 700,
                  boxShadow: '0 4px 14px rgba(27, 107, 58, 0.3)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1B6B3A 0%, #2E8B57 100%)',
                    filter: 'brightness(1.1)',
                    boxShadow: '0 6px 20px rgba(27, 107, 58, 0.4)',
                  },
                  '&:active': {
                    transform: 'scale(0.98)'
                  }
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Create account & continue'}
              </Button>
            </Stack>
          </form>

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

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Already have an account?{' '}
              <MuiLink
                component={Link}
                href={loginHref}
                sx={{
                  color: 'primary.main',
                  fontWeight: 700,
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                  '&:hover': { color: 'primary.dark', textDecoration: 'underline' }
                }}
              >
                Log in
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
}
