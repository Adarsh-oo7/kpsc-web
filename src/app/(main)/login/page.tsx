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
  Link as MuiLink // Rename MUI Link to avoid conflict
} from '@mui/material';
import Link from 'next/link';
import PersonOutline from '@mui/icons-material/PersonOutline';
import LockOutlined from '@mui/icons-material/LockOutlined';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';

// Styled component for a consistent text field design
const StyledTextField = styled(TextField)({
  '& .MuiInputBase-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '50px',
    color: '#000',
    height: '56px',
    border: 'none',
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  },
  '& .MuiInputBase-input': { paddingLeft: '20px' },
  '& .MuiInputAdornment-root': { color: '#888', marginRight: '8px', marginLeft: '15px' },
});

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, user, isLoading } = useAppContext();

  // Redirect to home if a user is already logged in and finished loading
  useEffect(() => {
    if (!isLoading && user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Use the apiClient with the short URL
      const tokenResponse = await apiClient.post('/auth/token/', { username, password });
      const { access, refresh } = tokenResponse.data;

      // The login function handles everything else
      const profile = await login(access, refresh);

      // Redirect based on the role returned from the context's login function
      if (profile?.is_owner === true) {
        router.push('/institute/dashboard');
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

  // While checking for an existing session, don't show the login form
  if (isLoading) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#3A6B5D' }}>
            <CircularProgress color="inherit" />
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
        p: 4,
        backgroundColor: '#3A6B5D'
      }}
    >
      <Box sx={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <Typography variant="h3" component="h1" sx={{ color: 'white', fontWeight: 'bold' }}>
          Login
        </Typography>
        <Typography variant="h6" component="h2" sx={{ color: 'white', fontWeight: 'normal', mt: 1, mb: 4 }}>
          Welcome Back
        </Typography>
        
        {error && (
          <Alert severity="error" variant="filled" sx={{ mb: 2, textAlign: 'left' }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                borderRadius: '50px', height: '56px', mt: '16px',
                backgroundColor: '#2E594F', textTransform: 'none', fontSize: '1.2rem',
                '&:hover': { backgroundColor: '#254a41' },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
            </Button>
          </Box>
        </form>

        <Typography variant="body2" sx={{ mt: 4, color: 'white', textAlign: 'center' }}>
          Are you an institute owner?{' '}
          <MuiLink component={Link} href="/institute/login" sx={{ color: 'white', fontWeight: 'bold', textDecoration: 'underline' }}>
            Login to Portal
          </MuiLink>
        </Typography>

        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'rgba(255,255,255,0.8)' }}>
          Don’t have an account?{' '}
          <MuiLink component={Link} href="/register" sx={{ color: 'white', fontWeight: 'bold' }}>
            Register Here
          </MuiLink>
        </Typography>
      </Box>
    </Box>
  );
}