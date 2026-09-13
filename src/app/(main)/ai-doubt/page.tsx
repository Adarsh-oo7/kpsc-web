'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Button, TextField, CircularProgress, Stack, Chip, Alert, useTheme
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';

export default function AIDoubtPage() {
  const { user, isLoading: ctxLoading } = useAppContext();
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [text, setText] = useState('');
  const [lang, setLang] = useState<'en' | 'ml'>('en');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ctxLoading && !user) router.push('/login');
  }, [user, ctxLoading, router]);

  const ask = async () => {
    if (text.trim().length < 8) {
      setError('Type the full question or the part you are stuck on.');
      return;
    }
    setLoading(true);
    setError('');
    setAnswer('');
    try {
      const res = await apiClient.post('/ai-doubt/', { text: text.trim(), lang });
      setAnswer(res.data.explanation || '');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Could not fetch an explanation. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (ctxLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', pb: 6 }}>
      <Typography sx={{ fontSize: '0.8rem', color: '#1B6B3A', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        24/7 tutor
      </Typography>
      <Typography variant="h4" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, color: 'text.primary', mt: 0.5 }}>
        AI Doubt Solver
      </Typography>
      <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', mt: 0.75, mb: 3, lineHeight: 1.6 }}>
        Paste a Kerala PSC question or the concept you missed. You also get the same AI on every quiz card (EN / ML).
      </Typography>

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Chip
          label="English"
          onClick={() => setLang('en')}
          color={lang === 'en' ? 'primary' : 'default'}
          variant={lang === 'en' ? 'filled' : 'outlined'}
        />
        <Chip
          label="Malayalam"
          onClick={() => setLang('ml')}
          color={lang === 'ml' ? 'primary' : 'default'}
          variant={lang === 'ml' ? 'filled' : 'outlined'}
        />
      </Stack>

      <TextField
        multiline
        minRows={5}
        fullWidth
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Example: Who appoints the Chairman of the Joint Public Service Commission?"
        sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
      />

      <Button
        variant="contained"
        fullWidth
        disabled={loading}
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
        onClick={ask}
        sx={{ textTransform: 'none', fontWeight: 800, py: 1.25, borderRadius: 3, background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)' }}
      >
        {loading ? 'Explaining…' : 'Explain this doubt'}
      </Button>

      {error && <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>{error}</Alert>}

      {answer && (
        <Box sx={{
          mt: 3, p: 2.5, borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.04)',
        }}>
          <Typography sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>Explanation</Typography>
          <Typography sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, color: 'text.primary', fontSize: '0.95rem' }}>
            {answer}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
