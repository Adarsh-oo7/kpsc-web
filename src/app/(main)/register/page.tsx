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
  Stack
} from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import PersonOutline from '@mui/icons-material/PersonOutline';
import MailOutline from '@mui/icons-material/MailOutline';
import LockOutlined from '@mui/icons-material/LockOutlined';
import { motion } from 'framer-motion';
import apiClient from '@/lib/apiClient';
import { useAppContext } from '@/context/AppContext';
import GoogleSignInButton from '@/components/GoogleSignInButton';


// Styled component for a consistent, premium theme text field design
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
}));

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAppContext();

  const handleGoogleSuccess = async (credential: string) => {
    setError('');
    setSuccess('');
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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Password match validation
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // Backend expects 'username', so we map name to username.
      await apiClient.post('/auth/register/', {
        username: name,
        email,
        password,
      });

      setSuccess('Registration successful! Redirecting to login...');

      // Redirect to the login page after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 1500);

    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Registration failed. Please try again.');
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
          ? 'radial-gradient(circle at 80% 20%, rgba(27, 107, 58, 0.12) 0%, transparent 50%), radial-gradient(circle at 15% 80%, rgba(245, 158, 11, 0.08) 0%, transparent 50%)'
          : 'radial-gradient(circle at 80% 20%, rgba(27, 107, 58, 0.06) 0%, transparent 50%), radial-gradient(circle at 15% 80%, rgba(245, 158, 11, 0.04) 0%, transparent 50%)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
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
          {/* Logo & Header */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
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
              Create Account
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', mt: 0.5 }}>
              സൈൻ അപ്പ്
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

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <StyledTextField
                placeholder="Name (as Username)"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
                InputProps={{
                  startAdornment: <InputAdornment position="start"><PersonOutline /></InputAdornment>,
                }}
              />
              <StyledTextField
                placeholder="Email"
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
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
              </Button>
            </Stack>
          </form>

          {/* Google Sign In Option */}
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

          {/* Bottom link */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Already have an account?{' '}
              <MuiLink 
                component={Link} 
                href="/login" 
                sx={{ 
                  color: 'primary.main', 
                  fontWeight: 700, 
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                  '&:hover': { color: 'primary.dark', textDecoration: 'underline' } 
                }}
              >
                Login Here
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
}