'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, TextField, Button, InputAdornment, Alert,
  styled, CircularProgress, Link as MuiLink
} from '@mui/material';
import Link from 'next/link';
import PersonOutline from '@mui/icons-material/PersonOutline';
import MailOutline from '@mui/icons-material/MailOutline';
import LockOutlined from '@mui/icons-material/LockOutlined';
import apiClient from '@/lib/apiClient'; // Import our central API client

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

export default function RegisterPage() {
  // The 'name' state from your form will be used as the 'username' for the backend
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(''); // State for success message
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Frontend password match validation
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      // Use the apiClient to send data to the backend
      // The backend expects 'username', so we map the 'name' field to it.
      await apiClient.post('/auth/register/', {
        username: name,
        email,
        password,
      });

      setSuccess('Registration successful! Please log in.');

      // Redirect to the login page after a short delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err: any) {
      console.error(err);
      // Display specific error from the backend if available
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
          p: 4,
          backgroundColor: '#3A6B5D'
        }}
      >
        <Box sx={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <Typography variant="h3" component="h1" sx={{ color: 'white', fontWeight: 'bold' }}>
            Sign Up
          </Typography>
          <Typography variant="h6" component="h2" sx={{ color: 'white', fontWeight: 'normal', mt: 1, mb: 4 }}>
            സൈൻ അപ്പ്
          </Typography>
          
          {error && <Alert severity="error" variant="filled" sx={{ mb: 2, textAlign: 'left' }}>{error}</Alert>}
          {success && <Alert severity="success" variant="filled" sx={{ mb: 2, textAlign: 'left' }}>{success}</Alert>}
          
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <StyledTextField
                placeholder="Name (as Username)"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                required autoFocus
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
                placeholder="Password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                InputProps={{ startAdornment: <InputAdornment position="start"><LockOutlined /></InputAdornment> }}
              />
              <StyledTextField
                placeholder="Confirm Password"
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
                  borderRadius: '50px', height: '56px', mt: '16px',
                  backgroundColor: '#2E594F', textTransform: 'none', fontSize: '1.2rem',
                  '&:hover': { backgroundColor: '#254a41' },
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
              </Button>
            </Box>
          </form>

          <Typography variant="body2" sx={{ mt: 4, color: 'rgba(255,255,255,0.8)' }}>
            Already have an account?{' '}
            <MuiLink component={Link} href="/login" sx={{ color: 'white', fontWeight: 'bold' }}>
              Login Here
            </MuiLink>
          </Typography>
        </Box>
      </Box>
  );
}