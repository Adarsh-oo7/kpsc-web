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
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import apiClient from '@/lib/apiClient';

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
  // Default exam dates mapping if not provided in DB
  const defaultDates: Record<string, string> = {
    'Company Board LGS': '2026-07-18T00:00:00',
    'Last Grade Servant': '2026-08-01T00:00:00',
    'LGS': '2026-08-01T00:00:00',
    'Village Field Assistant': '2026-09-19T00:00:00',
    'VFA': '2026-09-19T00:00:00',
    'LD Clerk': '2026-08-15T00:00:00',
    'LDC': '2026-08-15T00:00:00',
    'Degree Level': '2026-10-10T00:00:00',
    'KSEB Electricity Worker': '2026-09-05T00:00:00',
  };

  const examName = primaryExam?.name || 'Company Board LGS 2026';
  const targetDateStr =
    primaryExam?.expected_exam_date ||
    defaultDates[examName] ||
    defaultDates['Company Board LGS'] ||
    '2026-08-01T00:00:00';

  const catNumber = primaryExam?.category_number || (examName.includes('VFA') ? 'Cat 571/2025' : 'Cat 423/2025');

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
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

  return (
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
              Scheduled expected exam date: <strong>{new Date(targetDateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
            </Typography>
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
  );
}
