'use client';

import { useState } from 'react';
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
  Paper,
  Stack,
  Link as MuiLink
} from '@mui/material';
import Link from 'next/link';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import PersonOutline from '@mui/icons-material/PersonOutline';
import LockOutlined from '@mui/icons-material/LockOutlined';
import { motion } from 'framer-motion';
import apiClient from '@/lib/apiClient';
import { useAppContext } from '@/context/AppContext';

// Styled component for a consistent, premium dark text field design
const StyledTextField = styled(TextField)({
  '& .MuiInputBase-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '14px',
    color: '#F0F4F8',
    height: '56px',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      borderColor: '#2E8B57',
      boxShadow: '0 0 0 2px rgba(46, 139, 87, 0.2)',
    },
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  },
  '& .MuiInputBase-input': { 
    paddingLeft: '10px',
    fontFamily: "'Satoshi', sans-serif",
    '&::placeholder': {
      color: '#8892A4',
      opacity: 1,
    },
    '&:-webkit-autofill': {
      WebkitBoxShadow: '0 0 0 1000px #161B22 inset !important',
      WebkitTextFillColor: '#F0F4F8 !important',
      transition: 'background-color 5000s ease-in-out 0s',
    }
  },
  '& .MuiInputAdornment-root': { color: '#8892A4', marginRight: '8px', marginLeft: '8px' },
});

export default function InstituteLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAppContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Step 1: Get login tokens
      const tokenResponse = await apiClient.post('/auth/token/', { username, password });
      
      const { access, refresh } = tokenResponse.data;

      // Step 2: Call the central login function from the context
      const profile = await login(access, refresh);

      // Step 3: Use the returned profile to redirect
      if (profile?.is_owner === true) {
        router.push('/institute/dashboard');
      } else {
        router.push('/');
      }

    } catch (err: any) {
      console.error(err);
      if (err.response && (err.response.status === 401 || err.response.status === 400)) {
        setError('Login failed. Please check your username and password.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
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
        bgcolor: '#0F1117',
        backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 15% 80%, rgba(46, 139, 87, 0.08) 0%, transparent 50%)',
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
            bgcolor: 'rgba(22, 27, 34, 0.8)',
            border: '1px solid rgba(255,255,255,0.06)',
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
            
            <Typography variant="h4" sx={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 900, color: '#F0F4F8', letterSpacing: '-0.02em' }}>
              Institute Portal
            </Typography>
            <Typography sx={{ color: '#8892A4', fontSize: '0.9rem', mt: 0.5 }}>
              Coaching Center Owner Login
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
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
              </Button>
            </Stack>
          </form>

          {/* Bottom links */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#8892A4', mb: 1 }}>
              Don&apos;t have an account?{' '}
              <MuiLink 
                component={Link} 
                href="/institute/register" 
                sx={{ 
                  color: '#8B5CF6', 
                  fontWeight: 700, 
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                  '&:hover': { color: '#a78bfa', textDecoration: 'underline' } 
                }}
              >
                Register Academy Here
              </MuiLink>
            </Typography>
            <Typography variant="body2" sx={{ color: '#8892A4' }}>
              Are you a student?{' '}
              <MuiLink 
                component={Link} 
                href="/login" 
                sx={{ 
                  color: '#2E8B57', 
                  fontWeight: 700, 
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                  '&:hover': { color: '#22c55e', textDecoration: 'underline' } 
                }}
              >
                Student Login
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
}