// app/(main)/exams/company-board-lgs/LgsCountdown.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Box, Stack, Typography, Paper } from '@mui/material';

interface LgsCountdownProps {
  targetDate: string;
}

export default function LgsCountdown({ targetDate }: LgsCountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      let newTimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        newTimeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return newTimeLeft;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!isClient) return null;

  return (
    <Box sx={{ mt: 3, p: 2.5, borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', maxWidth: 450 }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        ⏳ Countdown to July 18 Exam
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
        {[
          { label: 'Days', value: timeLeft.days },
          { label: 'Hours', value: timeLeft.hours },
          { label: 'Mins', value: timeLeft.minutes },
          { label: 'Secs', value: timeLeft.seconds },
        ].map((item, idx) => (
          <Paper
            key={idx}
            sx={{
              flex: 1,
              py: 1,
              textAlign: 'center',
              borderRadius: '10px',
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", color: '#10B981' }}>
              {String(item.value).padStart(2, '0')}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', fontWeight: 700 }}>
              {item.label}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
