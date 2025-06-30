// app/institute/login/page.tsx

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
  styled
} from '@mui/material';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import PersonOutline from '@mui/icons-material/PersonOutline';
import LockOutlined from '@mui/icons-material/LockOutlined';
import axios from 'axios';
import { useAppContext } from '../../../../context/AppContext'; // Adjust path if needed

// Using the same styled text field from our other login pages for consistency
const StyledTextField = styled(TextField)({
  '& .MuiInputBase-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '50px',
    color: '#000',
    marginTop: '16px',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    border: 'none',
    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
  },
  '& .MuiInputBase-input': { paddingLeft: '0px' },
  '& .MuiInputAdornment-root': { color: '#888', marginRight: '8px' },
});

export default function InstituteLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAppContext();

  // In BOTH login pages (main and institute)

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Step 1: Get login tokens
      const tokenResponse = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/token/`,
        { username, password }
      );
      
      const { access, refresh } = tokenResponse.data;

      // Step 2: Call the central login function from the context
      // It will handle storing tokens, fetching the profile, setting the state, AND returning the profile
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
      className="min-h-screen w-full flex flex-col items-center justify-center p-4"
      sx={{ backgroundColor: '#3A6B5D' }}
    >
      <Box className="w-full max-w-sm text-center">
        <CorporateFareIcon sx={{ fontSize: 60, color: 'white', mb: 2 }}/>
        <Typography variant="h4" component="h1" className="text-white font-semibold">
          Institute Portal
        </Typography>
        <Typography variant="h6" component="h2" className="text-white font-normal mt-1 mb-6">
          Owner Login
        </Typography>
        
        {error && (
          <Alert severity="error" variant="filled" className="mb-4 text-left">
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="mt-4 space-y-2">
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
              borderRadius: '50px',
              height: '56px',
              marginTop: '32px !important',
              backgroundColor: '#2E594F',
              textTransform: 'none',
              fontSize: '1.2rem',
              '&:hover': {
                backgroundColor: '#254a41',
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>
        </form>
      </Box>
    </Box>
  );
}