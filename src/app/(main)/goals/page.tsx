'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Box, Typography, CircularProgress, Stack, LinearProgress, Button, Grid, MenuItem, TextField, Select, InputLabel, FormControl, Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import BoltIcon from '@mui/icons-material/Bolt';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';

export default function GoalsPage() {
  const { user, fetcher, isLoading: ctxLoading } = useAppContext();
  const router = useRouter();

  // Monthly Goal state
  const [selectedExam, setSelectedExam] = useState('');
  const [targetMonth, setTargetMonth] = useState('2026-12');
  const [dailyRequirement, setDailyRequirement] = useState<number | null>(null);
  const [loadingCalc, setLoadingCalc] = useState(false);

  useEffect(() => {
    if (!ctxLoading && !user) router.push('/login');
  }, [user, ctxLoading, router]);

  const { data, error, isLoading, mutate } = useSWR(
    user ? '/goals/' : null,
    fetcher
  );

  if (ctxLoading || isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={32} sx={{ color: '#2E8B57' }} />
      </Box>
    );
  }

  const missions = data?.missions || [];
  const preferredExams = data?.preferred_exams || [];

  const handleCalculateDailyGoal = () => {
    setLoadingCalc(true);
    // Standard mock calculation based on target month
    setTimeout(() => {
      const today = new Date();
      const target = new Date(targetMonth + '-01');
      const diffTime = Math.abs(target.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Target around 2000 questions to be ready
      const req = Math.max(10, Math.round(2000 / (diffDays || 1)));
      setDailyRequirement(req);
      setLoadingCalc(false);
    }, 600);
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', pb: 6 }}>
      {/* Page Title */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: '0.8rem', color: '#FF6B2B', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Missions & Goals 🎯
        </Typography>
        <Typography variant="h4" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, color: '#F0F4F8', mt: 0.5 }}>
          Weekly Study Missions
        </Typography>
        <Typography sx={{ color: '#8892A4', fontSize: '0.9rem', mt: 0.5 }}>
          Complete these Duolingo-style study milestones to earn double XP and keep your habit strong.
        </Typography>
      </Box>

      {/* Missions List */}
      <Stack spacing={2.5} sx={{ mb: 5 }}>
        {missions.map((mission: any, index: number) => {
          const pct = Math.round((mission.progress / mission.target) * 100);
          return (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Box sx={{
                p: 2.5,
                background: mission.completed ? 'rgba(27, 107, 58, 0.08)' : '#161B22',
                border: mission.completed ? '1px solid rgba(46, 139, 87, 0.3)' : '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ mb: 2 }}>
                  <Box sx={{ mt: 0.25 }}>
                    {mission.completed ? (
                      <CheckCircleIcon sx={{ color: '#2E8B57', fontSize: 24 }} />
                    ) : (
                      <RadioButtonUncheckedIcon sx={{ color: '#4A5568', fontSize: 24 }} />
                    )}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography sx={{
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      color: mission.completed ? '#F0F4F8' : '#F0F4F8',
                      textDecoration: mission.completed ? 'line-through' : 'none',
                      opacity: mission.completed ? 0.7 : 1,
                      fontFamily: "'Satoshi', sans-serif"
                    }}>
                      {mission.text}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#8892A4', mt: 0.5 }}>
                      Progress: {mission.progress} / {mission.target}
                    </Typography>
                  </Box>
                  
                  {/* Reward Badge */}
                  <Box sx={{
                    background: mission.completed ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.08)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: '8px',
                    px: 1.25, py: 0.5,
                    display: 'flex', alignItems: 'center', gap: 0.25,
                    alignSelf: 'flex-start'
                  }}>
                    <BoltIcon sx={{ fontSize: 13, color: '#a78bfa' }} />
                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#a78bfa', fontFamily: "'JetBrains Mono'" }}>
                      +{mission.xp_reward} XP
                    </Typography>
                  </Box>
                </Stack>

                {/* Progress bar */}
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{
                    height: 6, borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.06)',
                    '& .MuiLinearProgress-bar': {
                      background: mission.completed ? '#2E8B57' : 'linear-gradient(90deg, #1B6B3A, #2E8B57)',
                      borderRadius: 3
                    }
                  }}
                />
              </Box>
            </motion.div>
          );
        })}
      </Stack>

      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 4 }} />

      {/* Monthly Goal Setting */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Box sx={{
          p: 3,
          background: 'linear-gradient(135deg, #161B22 0%, #1C2230 100%)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
            <TrackChangesIcon sx={{ color: '#FF6B2B', fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, color: '#F0F4F8' }}>
              Target Exam Calendar
            </Typography>
          </Stack>
          
          <Typography sx={{ color: '#8892A4', fontSize: '0.85rem', mb: 3 }}>
            Select your target exam and date. We will calculate the daily question answering speed you need to comfortably complete the syllabus.
          </Typography>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="exam-select-label" sx={{ color: '#8892A4', fontSize: '0.85rem' }}>Select Exam</InputLabel>
                <Select
                  labelId="exam-select-label"
                  value={selectedExam}
                  label="Select Exam"
                  onChange={(e) => setSelectedExam(e.target.value)}
                  sx={{
                    color: '#F0F4F8',
                    bgcolor: 'rgba(255,255,255,0.02)',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' },
                  }}
                >
                  {preferredExams.length > 0 ? (
                    preferredExams.map((exam: string) => (
                      <MenuItem key={exam} value={exam}>{exam}</MenuItem>
                    ))
                  ) : (
                    <MenuItem value="LDC 2026">LDC 2026</MenuItem>
                  )}
                  <MenuItem value="LGS 2026">LGS 2026</MenuItem>
                  <MenuItem value="SI Kerala Police">SI Kerala Police</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                type="month"
                label="Target Month"
                value={targetMonth}
                onChange={(e) => setTargetMonth(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& input': { color: '#F0F4F8' },
                  bgcolor: 'rgba(255,255,255,0.02)',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.1)' },
                }}
              />
            </Grid>

            <Grid size={12}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleCalculateDailyGoal}
                disabled={!selectedExam || loadingCalc}
                sx={{
                  background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
                  textTransform: 'none', fontWeight: 700, borderRadius: '10px', py: 1
                }}
              >
                {loadingCalc ? <CircularProgress size={20} /> : 'Calculate Study Requirements'}
              </Button>
            </Grid>
          </Grid>

          {/* Calculator Output */}
          {dailyRequirement && (
            <Box sx={{
              mt: 3, p: 2,
              background: 'rgba(255, 107, 43, 0.08)',
              border: '1px solid rgba(255, 107, 43, 0.2)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                <SportsScoreIcon sx={{ color: '#FF6B2B' }} />
                <Typography sx={{ fontWeight: 800, color: '#F0F4F8', fontSize: '0.95rem' }}>
                  Your Personalized Roadmap:
                </Typography>
              </Stack>
              <Typography variant="h4" sx={{ fontFamily: "'JetBrains Mono'", fontWeight: 900, color: '#FF6B2B', my: 1.5 }}>
                {dailyRequirement} Questions/Day
              </Typography>
              <Typography sx={{ color: '#8892A4', fontSize: '0.75rem', lineHeight: 1.5 }}>
                To reach peak readiness for <strong>{selectedExam}</strong> by <strong>{targetMonth}</strong>, aim to complete at least {dailyRequirement} questions on your study feed every single day.
              </Typography>
            </Box>
          )}
        </Box>
      </motion.div>
    </Box>
  );
}
