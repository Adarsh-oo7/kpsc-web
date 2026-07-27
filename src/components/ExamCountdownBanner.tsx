'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid
} from '@mui/material';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import apiClient from '@/lib/apiClient';
import StartLearningModal from '@/components/StartLearningModal';
import { useRouter } from 'next/navigation';

interface ExamCountdownBannerProps {
  primaryExam?: {
    id: number;
    name: string;
    category_number?: string;
    expected_exam_date?: string;
  };
  availableExams?: Array<{ id: number; name: string }>;
  onExamChange?: (examId: number) => void;
}

export default function ExamCountdownBanner({
  primaryExam,
  availableExams = [],
  onExamChange,
}: ExamCountdownBannerProps) {
  // Comprehensive Kerala PSC 2026 Upcoming Exam Lookup
  const defaultDates: Record<string, string> = {
    'Company Board LGS': '2026-07-18T00:00:00',
    'Last Grade Servant': '2026-08-01T00:00:00',
    'LGS': '2026-08-01T00:00:00',
    'Lower Division Clerk': '2026-08-15T00:00:00',
    'LDC': '2026-08-15T00:00:00',
    'Village Field Assistant': '2026-09-19T00:00:00',
    'VFA': '2026-09-19T00:00:00',
    'KSEB Electricity Worker': '2026-09-05T00:00:00',
    'Fire & Rescue Officer': '2026-09-26T00:00:00',
    'Fireman': '2026-09-26T00:00:00',
    'KSRTC Conductor': '2026-10-03T00:00:00',
    'Degree Level': '2026-10-10T00:00:00',
    'University LGS': '2026-10-24T00:00:00',
    'Secretariat Assistant': '2026-11-07T00:00:00',
    'Sub Inspector of Police': '2026-11-21T00:00:00',
    'SI Police': '2026-11-21T00:00:00',
    'Civil Excise Officer': '2026-12-05T00:00:00',
  };

  const defaultCategoryNumbers: Record<string, string> = {
    'Company Board LGS': 'Cat. No. 423/2023',
    'Last Grade Servant': 'Cat. No. 701/2024',
    'LGS': 'Cat. No. 701/2024',
    'Lower Division Clerk': 'Cat. No. 501/2023',
    'LDC': 'Cat. No. 501/2023',
    'Village Field Assistant': 'Cat. No. 571/2023',
    'VFA': 'Cat. No. 571/2023',
    'KSEB Electricity Worker': 'Cat. No. 612/2023',
    'Fire & Rescue Officer': 'Cat. No. 330/2024',
    'KSRTC Conductor': 'Cat. No. 410/2024',
    'Degree Level': 'Cat. No. 112/2024',
    'University LGS': 'Cat. No. 215/2024',
    'Secretariat Assistant': 'Cat. No. 089/2024',
    'Sub Inspector of Police': 'Cat. No. 045/2024',
    'Civil Excise Officer': 'Cat. No. 198/2024',
  };

  // Helper to ensure countdown targets only UPCOMING future exam dates
  const getUpcomingTargetDate = (rawDateStr?: string, name?: string) => {
    const now = new Date();
    let dateObj = rawDateStr ? new Date(rawDateStr) : null;
    if (!dateObj || isNaN(dateObj.getTime()) || dateObj <= now) {
      const fallbackStr = defaultDates[name || ''] || '2026-08-15T00:00:00';
      dateObj = new Date(fallbackStr);
      if (dateObj <= now) {
        // If date has passed, roll forward to next upcoming exam session
        dateObj.setFullYear(now.getFullYear() + 1);
      }
    }
    return dateObj.toISOString();
  };

  const examName = primaryExam?.name || 'Company Board LGS 2026';
  const targetDateStr = getUpcomingTargetDate(primaryExam?.expected_exam_date, examName);
  const catNumber = primaryExam?.category_number || defaultCategoryNumbers[examName] || 'Cat. No. 423/2023';

  // Mounted state to avoid React Hydration mismatch #418 on SSR
  const [mounted, setMounted] = useState(false);
  const [learningModalOpen, setLearningModalOpen] = useState(false);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    setMounted(true);
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDateStr) - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDateStr]);

  const router = useRouter();

  return (
    <>
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 5,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, #ffffff 100%)',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 12px 32px rgba(0,0,0,0.06)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={7}>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={0.5}>
                <Chip
                  label="🎯 Primary Target Exam"
                  icon={<LocalFireDepartmentIcon sx={{ fontSize: '0.85rem !important', color: '#10B981 !important' }} />}
                  sx={{ bgcolor: 'rgba(16, 185, 129, 0.12)', color: '#10B981', fontWeight: 800, fontSize: '0.75rem' }}
                />
                <Chip
                  label={catNumber}
                  icon={<AssignmentIcon sx={{ fontSize: '0.85rem !important', color: '#3B82F6 !important' }} />}
                  sx={{ bgcolor: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6', fontWeight: 800, fontSize: '0.75rem' }}
                />
              </Stack>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: { xs: '1.5rem', sm: '1.85rem' },
                  lineHeight: 1.2
                }}
              >
                {examName}
              </Typography>

              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                Scheduled expected exam date: <strong>{mounted ? new Date(targetDateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Upcoming 2026 Session'}</strong>
              </Typography>

              {/* Primary Action Buttons */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<RocketLaunchIcon />}
                  onClick={() => setLearningModalOpen(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '0.85rem',
                    textTransform: 'none',
                    borderRadius: '14px',
                    px: 3,
                    py: 1.2,
                    boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)',
                    '&:hover': { background: 'linear-gradient(135deg, #059669, #047857)' }
                  }}
                >
                  🚀 Start Learning (പഠനം ആരംഭിക്കുക)
                </Button>

                <Button
                  variant="outlined"
                  endIcon={<PlayArrowIcon />}
                  onClick={() => router.push('/feed')}
                  sx={{
                    borderColor: '#10B981',
                    color: '#10B981',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    textTransform: 'none',
                    borderRadius: '14px',
                    px: 2.5,
                    py: 1.2,
                    '&:hover': { borderColor: '#059669', bgcolor: 'rgba(16, 185, 129, 0.08)' }
                  }}
                >
                  ⏩ Continue Learning (തുടരുക)
                </Button>
              </Stack>
            </Stack>
          </Grid>

        {/* Live Countdown Timer */}
        <Grid item xs={12} md={5}>
          <Box
            sx={{
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.9)',
              p: 2.5,
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              textAlign: 'center'
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ⏳ Time Remaining Until Exam
            </Typography>

            <Stack direction="row" justifyContent="center" spacing={1.5} sx={{ mt: 1.5 }}>
              {[
                { label: 'DAYS', val: timeLeft.days },
                { label: 'HRS', val: timeLeft.hours },
                { label: 'MINS', val: timeLeft.minutes },
                { label: 'SECS', val: timeLeft.seconds },
              ].map((item, idx) => (
                <Box
                  key={idx}
                  sx={{
                    minWidth: 50,
                    p: 1,
                    borderRadius: 2.5,
                    bgcolor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)'
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 900,
                      fontSize: '1.2rem',
                      color: '#10B981',
                      lineHeight: 1
                    }}
                  >
                    {String(item.val).padStart(2, '0')}
                  </Typography>
                  <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: 'text.secondary', mt: 0.5 }}>
                    {item.label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Paper>

    <StartLearningModal
      open={learningModalOpen}
      onClose={() => setLearningModalOpen(false)}
      examName={examName}
    />
  </>
  );
}
