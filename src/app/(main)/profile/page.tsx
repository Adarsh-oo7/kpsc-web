'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Box, Typography, TextField, Button, Alert, Card, CardContent,
  Select, MenuItem, InputLabel, FormControl, CircularProgress,
  Avatar, Input, Grid, Chip, Stack, Divider, Tab, Tabs, Tooltip,
  Dialog, DialogContent, DialogTitle, IconButton, LinearProgress, useTheme
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import StarIcon from '@mui/icons-material/Star';
import SchoolIcon from '@mui/icons-material/School';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CloseIcon from '@mui/icons-material/Close';
import BoltIcon from '@mui/icons-material/Bolt';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';

// Levels lookup system from specifications
const getLevelName = (lvl: number) => {
  const levels: { [key: number]: string } = {
    1: 'Beginner',
    2: 'Aspirant',
    3: 'Serious Prep',
    4: 'Active Learner',
    5: 'PSC Ready',
    6: 'PSC Scholar',
    7: 'PSC Expert',
    8: 'District Topper',
    9: 'Kerala Topper',
    10: 'PSC Master'
  };
  return levels[lvl] || levels[10] || 'Aspirant';
};

const getLevelProgress = (xp: number, lvl: number) => {
  const thresholds = [0, 500, 1500, 3500, 7000, 12000, 20000, 35000, 55000, 80000];
  const currentThreshold = thresholds[lvl - 1] || 0;
  const nextThreshold = thresholds[lvl] || 80000;
  
  if (lvl >= 10) return { pct: 100, remaining: 0, nextXp: nextThreshold };
  
  const range = nextThreshold - currentThreshold;
  const earnedInRange = xp - currentThreshold;
  const pct = Math.min(100, Math.max(0, Math.round((earnedInRange / range) * 100)));
  const remaining = nextThreshold - xp;
  
  return { pct, remaining, nextXp: nextThreshold };
};

const DISTRICTS = [
  { key: 'TVM', name: 'Thiruvananthapuram' },
  { key: 'KLM', name: 'Kollam' },
  { key: 'PTA', name: 'Pathanamthitta' },
  { key: 'ALP', name: 'Alappuzha' },
  { key: 'KTY', name: 'Kottayam' },
  { key: 'IDK', name: 'Idukki' },
  { key: 'EKM', name: 'Ernakulam' },
  { key: 'TCR', name: 'Thrissur' },
  { key: 'PKD', name: 'Palakkad' },
  { key: 'MLP', name: 'Malappuram' },
  { key: 'KOZ', name: 'Kozhikode' },
  { key: 'WYD', name: 'Wayanad' },
  { key: 'KNR', name: 'Kannur' },
  { key: 'KSD', name: 'Kasaragod' },
];

export default function ProfilePage() {
  const { user, fetcher, isLoading: isContextLoading } = useAppContext();
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const [activeTab, setActiveTab] = useState<'edit' | 'achievements'>('edit');
  const [showCert, setShowCert] = useState(false);
  
  const [formData, setFormData] = useState({
    profile_photo_upload: null as File | null,
    qualifications: '',
    date_of_birth: '',
    place: '',
    district: '',
    preferred_topics_ids: [] as number[],
    preferred_exams_ids: [] as number[],
    preferred_difficulty: '',
    preferred_language: '',
    bio: '',
  });

  
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // APIs
  const { data: profileData, error: profileError, mutate } = useSWR(
    user ? '/auth/profile/' : null, fetcher, { revalidateOnFocus: false }
  );
  const { data: topics } = useSWR(user ? '/topics/' : null, fetcher);
  const { data: examsData } = useSWR(user ? '/exams/' : null, fetcher);
  const { data: dashData } = useSWR(user ? '/my-progress-dashboard/' : null, fetcher);
  const { data: activityData } = useSWR(user ? '/auth/profile/activity/' : null, fetcher);

  // Populate form data
  useEffect(() => {
    if (profileData) {
      setFormData(prev => ({
        ...prev,
        qualifications: profileData.qualifications || '',
        date_of_birth: profileData.date_of_birth || '',
        place: profileData.place || '',
        district: profileData.district || '',
        preferred_topics_ids: profileData.preferred_topics?.map((t: any) => t.id) || [],
        preferred_exams_ids: profileData.preferred_exams?.map((e: any) => e.id) || [],
        preferred_difficulty: profileData.preferred_difficulty || '',
        preferred_language: profileData.preferred_language || '',
        bio: profileData.bio || '',
      }));

      if (profileData.profile_photo) {
        setPreview(`${profileData.profile_photo}?t=${new Date().getTime()}`);
      }
    }
  }, [profileData]);

  // Redirect if logged out
  useEffect(() => {
    if (!isContextLoading && !user) {
      router.push('/login');
    }
  }, [user, isContextLoading, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB.');
        return;
      }
      setFormData({ ...formData, profile_photo_upload: file });
      setPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setIsSubmitting(true);
    const data = new FormData();

    if (formData.profile_photo_upload) data.append('profile_photo', formData.profile_photo_upload);
    if (formData.qualifications) data.append('qualifications', formData.qualifications);
    if (formData.date_of_birth) data.append('date_of_birth', formData.date_of_birth);
    if (formData.place) data.append('place', formData.place);
    if (formData.district) data.append('district', formData.district);
    if (formData.preferred_difficulty) data.append('preferred_difficulty', formData.preferred_difficulty);
    if (formData.preferred_language) data.append('preferred_language', formData.preferred_language);
    if (formData.bio) data.append('bio', formData.bio);

    formData.preferred_topics_ids.forEach(id => data.append('preferred_topics_ids', id.toString()));
    formData.preferred_exams_ids.forEach(id => data.append('preferred_exams_ids', id.toString()));
    
    try {
      const response = await apiClient.patch('/auth/profile/', data);
      setSuccess('Profile updated successfully!');
      mutate(response.data, false);
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to update profile.';
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getHeatmapGridData = () => {
    const today = new Date();
    const weeksCount = 24;
    const totalDays = weeksCount * 7;
    const startDate = new Date();
    startDate.setDate(today.getDate() - totalDays + 1);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);
    
    const activityDates = new Set(activityData?.activity || []);
    
    const weeks = [];
    const tempDate = new Date(startDate);
    
    for (let w = 0; w < weeksCount; w++) {
      const weekDays = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = tempDate.toISOString().split('T')[0];
        const isActive = activityDates.has(dateStr);
        weekDays.push({
          date: new Date(tempDate),
          dateStr,
          isActive
        });
        tempDate.setDate(tempDate.getDate() + 1);
      }
      weeks.push(weekDays);
    }
    return weeks;
  };

  const heatmapWeeks = getHeatmapGridData();

  if (isContextLoading || (!profileData && !profileError)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={32} sx={{ color: '#2E8B57' }} />
      </Box>
    );
  }

  // Calculate Levels and XP properties
  const totalXp = profileData?.total_xp || 0;
  const levelNum = profileData?.level || 1;
  const levelName = getLevelName(levelNum);
  const { pct: levelProgressPct, remaining: xpRemaining, nextXp } = getLevelProgress(totalXp, levelNum);

  const badges = dashData?.badges || [];

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', pb: 6, px: 2 }}>
      
      {/* Header Info Block */}
      <Card sx={{
        background: isDark 
          ? 'linear-gradient(135deg, #161B22 0%, #1C2230 100%)' 
          : 'linear-gradient(135deg, #ffffff 0%, #F1F5F9 100%)',
        border: '1px solid', borderColor: 'divider',
        borderRadius: '24px',
        mb: 4,
        overflow: 'hidden',
        position: 'relative'
      }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
            {/* Avatar block with status ring */}
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={preview || undefined}
                alt={user?.username}
                sx={{
                  width: 100,
                  height: 100,
                  border: '4px solid #1B6B3A',
                  boxShadow: '0 0 16px rgba(27,107,58,0.3)'
                }}
              />
              <Box sx={{
                position: 'absolute',
                bottom: -5,
                right: -5,
                bgcolor: '#8B5CF6',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 900,
                borderRadius: '50%',
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid',
                borderColor: 'background.paper',
                fontFamily: "'JetBrains Mono'"
              }}>
                {levelNum}
              </Box>
            </Box>

            {/* Title / Description */}
            <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
              <Typography variant="h5" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 950, color: 'text.primary' }}>
                {user?.username}
              </Typography>
              <Typography sx={{ color: '#2E8B57', fontSize: '0.85rem', fontWeight: 700, mt: 0.5 }}>
                Level {levelNum}: {levelName}
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', mt: 1, fontStyle: 'italic', maxWidth: 450 }}>
                {formData.bio || "No profile bio set yet. Tell other aspirants about your goals!"}
              </Typography>
            </Box>

            {/* Quick Metrics */}
            <Stack direction="row" spacing={2} sx={{ mt: { xs: 2, sm: 0 } }}>
              <Tooltip title="Total Study XP">
                <Box sx={{ bgcolor: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.15)', px: 2, py: 1.5, borderRadius: '14px', textAlign: 'center', minWidth: 70 }}>
                  <BoltIcon sx={{ color: '#a78bfa', fontSize: 20, mb: 0.25 }} />
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 900, color: 'text.primary', fontFamily: "'JetBrains Mono'" }}>{totalXp}</Typography>
                  <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary', textTransform: 'uppercase' }}>XP</Typography>
                </Box>
              </Tooltip>

              <Tooltip title="Current Streak">
                <Box sx={{ bgcolor: 'rgba(255, 107, 43, 0.08)', border: '1px solid rgba(255, 107, 43, 0.15)', px: 2, py: 1.5, borderRadius: '14px', textAlign: 'center', minWidth: 70 }}>
                  <LocalFireDepartmentIcon sx={{ color: '#FF6B2B', fontSize: 20, mb: 0.25 }} />
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 900, color: 'text.primary', fontFamily: "'JetBrains Mono'" }}>{profileData?.current_streak || 0}d</Typography>
                  <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary', textTransform: 'uppercase' }}>Streak</Typography>
                </Box>
              </Tooltip>

              <Tooltip title="Streak Freezes Remaining">
                <Box sx={{ bgcolor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.15)', px: 2, py: 1.5, borderRadius: '14px', textAlign: 'center', minWidth: 70 }}>
                  <AcUnitIcon sx={{ color: '#3B82F6', fontSize: 20, mb: 0.25 }} />
                  <Typography sx={{ fontSize: '0.9rem', fontWeight: 900, color: 'text.primary', fontFamily: "'JetBrains Mono'" }}>{profileData?.streak_freeze_count || 0}</Typography>
                  <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary', textTransform: 'uppercase' }}>Freezes</Typography>
                </Box>
              </Tooltip>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Styled Navigation Tabs */}
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 4, display: 'flex', gap: 4 }}>
        <Typography
          onClick={() => setActiveTab('edit')}
          sx={{
            pb: 1.5,
            fontSize: '0.9rem',
            fontWeight: 800,
            cursor: 'pointer',
            borderBottom: activeTab === 'edit' ? '3px solid #2E8B57' : '3px solid transparent',
            color: activeTab === 'edit' ? 'text.primary' : 'text.secondary',
            transition: 'all 0.2s',
            '&:hover': { color: 'text.primary' }
          }}
        >
          Edit Profile Settings
        </Typography>
        <Typography
          onClick={() => setActiveTab('achievements')}
          sx={{
            pb: 1.5,
            fontSize: '0.9rem',
            fontWeight: 800,
            cursor: 'pointer',
            borderBottom: activeTab === 'achievements' ? '3px solid #2E8B57' : '3px solid transparent',
            color: activeTab === 'achievements' ? 'text.primary' : 'text.secondary',
            transition: 'all 0.2s',
            '&:hover': { color: 'text.primary' }
          }}
        >
          My Achievements
        </Typography>
      </Box>

      {/* Tab Area Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'edit' ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>{success}</Alert>}

            <form onSubmit={handleSubmit}>
              <Card sx={{ background: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '20px', mb: 3 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, color: 'text.primary', mb: 3 }}>
                    Personal Details
                  </Typography>
                  <Grid container spacing={3}>
                    {/* Avatar Upload */}
                    <Grid size={12} sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mb: 1 }}>
                      <Avatar src={preview || undefined} sx={{ width: 64, height: 64, border: '2px solid', borderColor: 'divider' }} />
                      <Box>
                        <Button variant="contained" component="label" sx={{
                          background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                          color: 'text.primary',
                          '&:hover': { background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' },
                          textTransform: 'none', fontWeight: 700, borderRadius: '8px', py: 0.75, px: 2
                        }}>
                          Choose New Photo
                          <Input type="file" hidden onChange={handleFileChange} inputProps={{ accept: 'image/*' }} />
                        </Button>
                        <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', mt: 0.75 }}>
                          Format: PNG, JPG (Max 5MB)
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Bio Field */}
                    <Grid size={12}>
                      <TextField
                        label="Personal Bio"
                        multiline
                        rows={2}
                        placeholder="Share your target exam goals, batch details, or quote..."
                        fullWidth
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        sx={{
                          '& textarea': { color: 'text.primary' },
                          '& .MuiInputLabel-root': { color: 'text.secondary' },
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: 'divider' },
                            '&:hover fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' },
                            '&.Mui-focused fieldset': { borderColor: '#2E8B57' },
                          },
                          bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
                          borderRadius: '12px'
                        }}
                      />
                    </Grid>

                    {/* Qualifications */}
                    <Grid size={12}>
                      <TextField
                        label="Qualifications"
                        placeholder="e.g., Degree in Physics / HS / B.Tech"
                        fullWidth
                        value={formData.qualifications}
                        onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })}
                        sx={{
                          '& input': { color: 'text.primary' },
                          '& .MuiInputLabel-root': { color: 'text.secondary' },
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: 'divider' },
                            '&:hover fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' },
                            '&.Mui-focused fieldset': { borderColor: '#2E8B57' },
                          },
                          bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
                          borderRadius: '12px'
                        }}
                      />
                    </Grid>

                    {/* DOB */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Date of Birth"
                        type="date"
                        fullWidth
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          '& input': { color: 'text.primary' },
                          '& .MuiInputLabel-root': { color: 'text.secondary' },
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: 'divider' },
                            '&:hover fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' },
                            '&.Mui-focused fieldset': { borderColor: '#2E8B57' },
                          },
                          bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
                          borderRadius: '12px'
                        }}
                      />
                    </Grid>

                    {/* Place / Town */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        label="Place / Town"
                        placeholder="e.g., Chalakudy"
                        fullWidth
                        value={formData.place}
                        onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                        sx={{
                          '& input': { color: 'text.primary' },
                          '& .MuiInputLabel-root': { color: 'text.secondary' },
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: 'divider' },
                            '&:hover fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' },
                            '&.Mui-focused fieldset': { borderColor: '#2E8B57' },
                          },
                          bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
                          borderRadius: '12px'
                        }}
                      />
                    </Grid>

                    {/* District Dropdown */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormControl fullWidth sx={{
                        '& .MuiInputLabel-root': { color: 'text.secondary' },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: 'divider' },
                          '&:hover fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' },
                          '&.Mui-focused fieldset': { borderColor: '#2E8B57' },
                        },
                        bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
                        borderRadius: '12px'
                      }}>
                        <InputLabel id="district-label">District (Kerala)</InputLabel>
                        <Select
                          labelId="district-label"
                          value={formData.district}
                          onChange={(e) => setFormData({ ...formData, district: e.target.value as string })}
                          sx={{ color: 'text.primary' }}
                          label="District (Kerala)"
                        >
                          <MenuItem value=""><em>None</em></MenuItem>
                          {DISTRICTS.map((d) => (
                            <MenuItem key={d.key} value={d.key}>{d.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Preferences Card */}
              <Card sx={{ background: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '20px', mb: 4 }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, color: 'text.primary', mb: 3 }}>
                    Target Exam & Study Topics
                  </Typography>
                  <Grid container spacing={3}>
                    {/* Focus Exams */}
                    <Grid size={12}>
                      <FormControl fullWidth sx={{
                        '& .MuiInputLabel-root': { color: 'text.secondary' },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: 'divider' },
                          '&:hover fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' },
                          '&.Mui-focused fieldset': { borderColor: '#2E8B57' },
                        },
                        bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
                        borderRadius: '12px'
                      }}>
                        <InputLabel>Focus Exams (Select up to 3)</InputLabel>
                        <Select
                          multiple
                          value={formData.preferred_exams_ids}
                          onChange={(e) => {
                            const value = e.target.value as number[];
                            if (value.length <= 3) setFormData({ ...formData, preferred_exams_ids: value });
                          }}
                          sx={{ color: 'text.primary' }}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {examsData?.flatMap((c: any) => c.exams).filter((e: any) => selected.includes(e.id)).map((e: any) => (
                                <Chip key={e.id} label={e.name} sx={{ bgcolor: 'rgba(27, 107, 58, 0.2)', color: '#2E8B57', border: '1px solid rgba(46, 139, 87, 0.3)', height: 24, fontSize: '0.75rem' }} />
                              ))}
                            </Box>
                          )}
                        >
                          {examsData?.map((category: any) => (
                            category.exams.map((exam: any) => <MenuItem key={exam.id} value={exam.id}>{exam.name} ({exam.year})</MenuItem>)
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Preferred Topics */}
                    <Grid size={12}>
                      <FormControl fullWidth sx={{
                        '& .MuiInputLabel-root': { color: 'text.secondary' },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: 'divider' },
                          '&:hover fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' },
                          '&.Mui-focused fieldset': { borderColor: '#2E8B57' },
                        },
                        bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
                        borderRadius: '12px'
                      }}>
                        <InputLabel>Preferred Topics</InputLabel>
                        <Select
                          multiple
                          value={formData.preferred_topics_ids}
                          onChange={(e) => setFormData({ ...formData, preferred_topics_ids: e.target.value as number[] })}
                          sx={{ color: 'text.primary' }}
                          renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {topics?.filter((t: any) => selected.includes(t.id)).map((t: any) => (
                                <Chip key={t.id} label={t.name} sx={{ bgcolor: 'rgba(27, 107, 58, 0.2)', color: '#2E8B57', border: '1px solid rgba(46, 139, 87, 0.3)', height: 24, fontSize: '0.75rem' }} />
                              ))}
                            </Box>
                          )}
                        >
                          {topics?.map((topic: any) => <MenuItem key={topic.id} value={topic.id}>{topic.name}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Difficulty */}
                    <Grid size={12}>
                      <FormControl fullWidth sx={{
                        '& .MuiInputLabel-root': { color: 'text.secondary' },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: 'divider' },
                          '&:hover fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' },
                          '&.Mui-focused fieldset': { borderColor: '#2E8B57' },
                        },
                        bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
                        borderRadius: '12px'
                      }}>
                        <InputLabel>Preferred Difficulty</InputLabel>
                        <Select
                          value={formData.preferred_difficulty}
                          onChange={(e) => setFormData({ ...formData, preferred_difficulty: e.target.value as string })}
                          sx={{ color: 'text.primary' }}
                        >
                          <MenuItem value=""><em>None</em></MenuItem>
                          <MenuItem value="easy">Easy</MenuItem>
                          <MenuItem value="medium">Medium</MenuItem>
                          <MenuItem value="hard">Hard</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Preferred Language */}
                    <Grid size={12}>
                      <FormControl fullWidth sx={{
                        '& .MuiInputLabel-root': { color: 'text.secondary' },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: 'divider' },
                          '&:hover fieldset': { borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' },
                          '&.Mui-focused fieldset': { borderColor: '#2E8B57' },
                        },
                        bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
                        borderRadius: '12px'
                      }}>
                        <InputLabel>Preferred Language</InputLabel>
                        <Select
                          value={formData.preferred_language}
                          onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value as string })}
                          sx={{ color: 'text.primary' }}
                        >
                          <MenuItem value="en">English</MenuItem>
                          <MenuItem value="ml">Malayalam</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                  </Grid>
                </CardContent>
              </Card>

              {/* Submit CTA */}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={isSubmitting}
                sx={{
                  background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: '12px',
                  py: 1.5,
                  fontSize: '1rem'
                }}
              >
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Save Profile Preferences'}
              </Button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {/* Level & XP Progression Block */}
            <Card sx={{ background: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '20px', mb: 4 }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography sx={{ fontWeight: 800, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarIcon sx={{ color: '#8B5CF6' }} /> Level Progression
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', fontFamily: "'JetBrains Mono'" }}>
                    {totalXp} / {nextXp} XP
                  </Typography>
                </Stack>

                <Box sx={{ my: 2.5 }}>
                  <LinearProgress
                    variant="determinate"
                    value={levelProgressPct}
                    sx={{
                      height: 12,
                      borderRadius: 6,
                      bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #8B5CF6, #c084fc)',
                        borderRadius: 6
                      }
                    }}
                  />
                </Box>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                    Level {levelNum}: {levelName}
                  </Typography>
                  {levelNum < 10 ? (
                    <Typography sx={{ fontSize: '0.8rem', color: '#8B5CF6', fontWeight: 800 }}>
                      ⚡ {xpRemaining} XP to Level {levelNum + 1}: {getLevelName(levelNum + 1)}
                    </Typography>
                  ) : (
                    <Typography sx={{ fontSize: '0.8rem', color: '#8B5CF6', fontWeight: 800 }}>
                      🔥 Maximum Level Achieved!
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Heatmap Card */}
            <Card sx={{ background: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '20px', mb: 4 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography sx={{ fontWeight: 800, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                  <LocalFireDepartmentIcon sx={{ color: '#2E8B57' }} /> Study Activity Heatmap
                </Typography>
                
                <Box sx={{ display: 'flex', overflowX: 'auto', pb: 1, gap: '4px' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pr: 1, py: '2px', height: '88px', fontSize: '0.65rem', color: 'text.secondary' }}>
                    <Typography sx={{ fontSize: 'inherit' }}>Sun</Typography>
                    <Typography sx={{ fontSize: 'inherit' }}>Tue</Typography>
                    <Typography sx={{ fontSize: 'inherit' }}>Thu</Typography>
                    <Typography sx={{ fontSize: 'inherit' }}>Sat</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', gap: '3px' }}>
                    {heatmapWeeks.map((week, wIdx) => (
                      <Box key={wIdx} sx={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        {week.map((day, dIdx) => {
                          const isToday = day.dateStr === new Date().toISOString().split('T')[0];
                          return (
                            <Tooltip
                               key={dIdx}
                               title={`${day.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}: ${day.isActive ? 'Active Study Day' : 'No activity'}`}
                               arrow
                            >
                              <Box sx={{
                                width: 10,
                                height: 10,
                                borderRadius: '2px',
                                bgcolor: day.isActive ? '#2E8B57' : (isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'),
                                border: isToday ? '1px solid #8B5CF6' : 'none',
                                transition: 'transform 0.1s',
                                '&:hover': {
                                  transform: 'scale(1.3)',
                                  bgcolor: day.isActive ? '#39D353' : (isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)'),
                                  zIndex: 10
                                }
                              }} />
                            </Tooltip>
                          );
                        })}
                      </Box>
                    ))}
                  </Box>
                </Box>
                
                <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center" sx={{ mt: 1.5 }}>
                  <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>Less</Typography>
                  <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)' }} />
                  <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: '#2E8B57' }} />
                  <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>More</Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Badges Container */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, color: 'text.primary', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmojiEventsIcon sx={{ color: '#F59E0B' }} /> Earned Badges
              </Typography>
              
              {badges.length === 0 ? (
                <Box sx={{
                  textAlign: 'center', py: 5, px: 3,
                  background: 'background.paper', borderRadius: '20px',
                  border: '1px solid', borderColor: 'divider'
                }}>
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                    No achievement stats fetched yet. Start answering study card questions to unlock!
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={2}>
                  {badges.map((badge: any) => (
                    <Grid size={{ xs: 6, sm: 3 }} key={badge.id}>
                      <Box sx={{
                        p: 2,
                        background: badge.earned ? 'rgba(27, 107, 58, 0.08)' : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'),
                        border: badge.earned ? '1px solid rgba(46, 139, 87, 0.25)' : '1px solid',
                        borderColor: 'divider',
                        borderRadius: '16px',
                        textAlign: 'center',
                        opacity: badge.earned ? 1 : 0.35,
                        filter: badge.earned ? 'none' : 'grayscale(100%)',
                        transition: 'all 0.3s ease',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                        <Typography sx={{ fontSize: '2.2rem', mb: 1 }}>{badge.icon}</Typography>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', color: 'text.primary' }}>
                          {badge.name}
                        </Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', mt: 0.5, lineHeight: 1.3 }}>
                          {badge.description}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>

            {/* Certificate Award Nudge */}
            <Card sx={{
              background: isDark 
                ? 'linear-gradient(135deg, rgba(27, 107, 58, 0.15) 0%, rgba(28, 34, 48, 0.5) 100%)' 
                : 'linear-gradient(135deg, rgba(27, 107, 58, 0.08) 0%, rgba(248, 250, 252, 0.9) 100%)',
              border: '1px solid rgba(46, 139, 87, 0.3)',
              borderRadius: '20px'
            }}>
              <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <SchoolIcon sx={{ color: '#2E8B57', fontSize: 36, mb: 1.5 }} />
                <Typography variant="h6" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, color: 'text.primary' }}>
                  Milestone Study Credentials
                </Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', mt: 0.5, mb: 2.5, maxWidth: 500 }}>
                  As you complete daily study streaks and level up, KPSC Master issues verified certificates to recognize your test preparation milestone.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => setShowCert(true)}
                  startIcon={<FileDownloadIcon />}
                  sx={{
                    color: '#2E8B57',
                    borderColor: '#2E8B57',
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: '10px',
                    '&:hover': { borderColor: '#1B6B3A', background: 'rgba(27, 107, 58, 0.08)' }
                  }}
                >
                  View Level {levelNum} Certificate
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Verified Certificate Modal Pop-up */}
      <Dialog
        open={showCert}
        onClose={() => setShowCert(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.default',
            borderRadius: '24px',
            border: '2px solid #F59E0B',
            boxShadow: '0 0 32px rgba(245, 158, 11, 0.15)'
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'flex-end', p: 1.5 }}>
          <IconButton onClick={() => setShowCert(false)} sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, md: 5 }, pb: 5 }}>
          {/* Certificate Board Border */}
          <Box sx={{
            border: '3px double #F59E0B',
            borderRadius: '16px',
            p: { xs: 3, md: 5 },
            bgcolor: 'background.paper',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background Watermark */}
            <Typography sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%) rotate(-25deg)',
              opacity: 0.02,
              fontSize: '8rem',
              fontWeight: 900,
              userSelect: 'none',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              color: 'text.primary'
            }}>
              KPSC MASTER
            </Typography>

            <Typography sx={{ fontFamily: "'Cabinet Grotesk'", color: '#F59E0B', fontWeight: 900, fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase', mb: 3 }}>
              Kerala State PSC Master Academy
            </Typography>

            <Typography variant="h3" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 950, color: 'text.primary', mb: 1.5, fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
              CERTIFICATE OF MILESTONE
            </Typography>

            <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', mb: 4 }}>
              This is officially awarded to recognize study performance and consistency.
            </Typography>

            <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', fontStyle: 'italic', mb: 1 }}>
              Proudly presented to
            </Typography>

            <Typography variant="h4" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 950, color: '#2E8B57', borderBottom: '1px solid', borderColor: 'divider', pb: 1, px: 2, display: 'inline-block', minWidth: 250, mb: 3 }}>
              {user?.username}
            </Typography>

            <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', lineHeight: 1.6, maxWidth: 520, mx: 'auto', mb: 5 }}>
              For successfully achieving <strong>Level {levelNum}: {levelName}</strong> credentials with a accumulated record of <strong>{totalXp} XP</strong> and dedication to Kerala PSC civil services exam syllabus.
            </Typography>

            <Grid container spacing={3} justifyContent="space-between" alignItems="flex-end" sx={{ mt: 2 }}>
              <Grid size={{ xs: 6, sm: 4 }} sx={{ textAlign: 'left' }}>
                <Typography sx={{ fontFamily: "'JetBrains Mono'", fontSize: '0.75rem', color: 'text.primary', fontWeight: 700 }}>
                  Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
                <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>Issue Date</Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }} sx={{ display: { xs: 'none', sm: 'block' } }}>
                <StarIcon sx={{ color: '#F59E0B', fontSize: 40 }} />
              </Grid>

              <Grid size={{ xs: 6, sm: 4 }} sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontFamily: "'Satoshi'", fontSize: '0.75rem', color: 'text.primary', fontWeight: 800 }}>
                  Academic Board
                </Typography>
                <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary' }}>KPSC Master Verified</Typography>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}