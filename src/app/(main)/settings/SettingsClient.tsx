'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Paper, Button, Stack, TextField, Alert, CircularProgress,
  FormControl, InputLabel, Select, MenuItem, Divider,
} from '@mui/material';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';
import { apiErrorMessage } from '@/lib/auth';

const GREEN = '#1B6B3A';
const GREEN_LIGHT = '#2E8B57';

export default function SettingsClient() {
  const router = useRouter();
  const { user, profile, isLoading, themeMode, setThemeMode, refreshProfile, logout } = useAppContext();

  const [language, setLanguage] = useState(profile?.preferred_language || 'en');
  const [practiceMode, setPracticeMode] = useState(profile?.practice_mode === 'focus' ? 'focus' : 'full');
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsMsg, setPrefsMsg] = useState('');
  const [prefsError, setPrefsError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login?next=/settings');
  }, [isLoading, user, router]);

  useEffect(() => {
    if (profile?.preferred_language) setLanguage(profile.preferred_language);
    if (profile?.practice_mode) setPracticeMode(profile.practice_mode === 'focus' ? 'focus' : 'full');
  }, [profile]);

  const savePreferences = async () => {
    setSavingPrefs(true);
    setPrefsError('');
    setPrefsMsg('');
    try {
      await apiClient.patch('/auth/profile/', {
        preferred_language: language,
        practice_mode: practiceMode,
      });
      await refreshProfile();
      setPrefsMsg('Study preferences saved.');
    } catch (err: unknown) {
      setPrefsError(apiErrorMessage(err, 'Could not save preferences.'));
    } finally {
      setSavingPrefs(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMsg('');
    if (newPassword.length < 8) {
      setPasswordError('Use at least 8 characters for the new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    setSavingPassword(true);
    try {
      const res = await apiClient.post('/auth/change-password/', {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setPasswordMsg(res.data?.status || 'Password updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setPasswordError(apiErrorMessage(err, 'Could not update password.'));
    } finally {
      setSavingPassword(false);
    }
  };

  if (isLoading || !user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress sx={{ color: GREEN_LIGHT }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', pb: 8 }}>
      <Paper
        elevation={0}
        sx={{
          mb: 3.5,
          p: { xs: 3, md: 4 },
          borderRadius: '24px',
          background: `linear-gradient(165deg, ${GREEN} 0%, #166534 50%, #134E2A 100%)`,
          color: '#fff',
        }}
      >
        <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#FCD34D', mb: 1 }}>
          Account
        </Typography>
        <Typography sx={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 900, fontSize: { xs: '1.7rem', md: '2.2rem' }, letterSpacing: '-0.03em' }}>
          Settings
        </Typography>
        <Typography sx={{ mt: 1.25, color: 'rgba(255,255,255,0.86)', maxWidth: 480, lineHeight: 1.55 }}>
          Theme, language, practice mix, and password for {user.username}.
        </Typography>
      </Paper>

      <Stack spacing={2.5}>
        <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '20px', border: '1.5px solid', borderColor: 'divider' }}>
          <Typography sx={{ fontWeight: 800, mb: 2, color: 'text.primary' }}>Appearance</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            {[
              { id: 'light' as const, label: 'Light', icon: <LightModeOutlinedIcon /> },
              { id: 'dark' as const, label: 'Dark', icon: <DarkModeOutlinedIcon /> },
            ].map((option) => {
              const selected = themeMode === option.id;
              return (
                <Button
                  key={option.id}
                  onClick={() => setThemeMode(option.id)}
                  startIcon={option.icon}
                  variant={selected ? 'contained' : 'outlined'}
                  sx={{
                    flex: 1,
                    py: 1.4,
                    textTransform: 'none',
                    fontWeight: 800,
                    borderRadius: '12px',
                    color: selected ? '#fff' : 'text.primary',
                    borderColor: selected ? GREEN : 'divider',
                    background: selected ? `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})` : 'transparent',
                  }}
                >
                  {option.label}
                </Button>
              );
            })}
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '20px', border: '1.5px solid', borderColor: 'divider' }}>
          <Typography sx={{ fontWeight: 800, mb: 2, color: 'text.primary' }}>Study preferences</Typography>
          {prefsError && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{prefsError}</Alert>}
          {prefsMsg && <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }}>{prefsMsg}</Alert>}
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Question language</InputLabel>
              <Select value={language} label="Question language" onChange={(e) => setLanguage(e.target.value)}>
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="ml">Malayalam</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Question mix</InputLabel>
              <Select value={practiceMode} label="Question mix" onChange={(e) => setPracticeMode(e.target.value)}>
                <MenuItem value="full">Full syllabus</MenuItem>
                <MenuItem value="focus">Focus areas only</MenuItem>
              </Select>
            </FormControl>
            <Button
              onClick={savePreferences}
              disabled={savingPrefs}
              variant="contained"
              sx={{
                alignSelf: 'flex-start',
                textTransform: 'none',
                fontWeight: 800,
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})`,
              }}
            >
              {savingPrefs ? <CircularProgress size={20} color="inherit" /> : 'Save preferences'}
            </Button>
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '20px', border: '1.5px solid', borderColor: 'divider' }}>
          <Typography sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>Password</Typography>
          <Typography sx={{ color: 'text.secondary', mb: 2, fontSize: '0.9rem' }}>
            Google accounts cannot set a password here. Email/username accounts can.
          </Typography>
          {passwordError && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{passwordError}</Alert>}
          {passwordMsg && <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }}>{passwordMsg}</Alert>}
          <Box component="form" onSubmit={changePassword}>
            <Stack spacing={2}>
              <TextField
                type="password"
                label="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <TextField
                type="password"
                label="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
                helperText="At least 8 characters."
              />
              <TextField
                type="password"
                label="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <Button
                type="submit"
                disabled={savingPassword}
                variant="contained"
                sx={{
                  alignSelf: 'flex-start',
                  textTransform: 'none',
                  fontWeight: 800,
                  borderRadius: '12px',
                  background: `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})`,
                }}
              >
                {savingPassword ? <CircularProgress size={20} color="inherit" /> : 'Update password'}
              </Button>
            </Stack>
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '20px', border: '1.5px solid', borderColor: 'divider' }}>
          <Typography sx={{ fontWeight: 800, mb: 2, color: 'text.primary' }}>Account</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              startIcon={<PersonOutlineIcon />}
              onClick={() => router.push('/profile')}
              variant="outlined"
              sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '12px', color: GREEN, borderColor: GREEN }}
            >
              Edit profile
            </Button>
            <Button
              onClick={() => {
                logout();
                window.location.href = '/login';
              }}
              sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '12px', color: '#EF4444' }}
            >
              Log out
            </Button>
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{user.email}</Typography>
        </Paper>
      </Stack>
    </Box>
  );
}
