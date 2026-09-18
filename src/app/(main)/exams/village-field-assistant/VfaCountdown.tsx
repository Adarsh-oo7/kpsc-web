'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Typography } from '@mui/material';
import { useAppContext } from '@/context/AppContext';
import {
  resolveVfaExamDate,
  VFA_DISTRICTS,
  vfaDistrictName,
  vfaPhaseForDistrict,
} from '@/lib/vfaSchedule';

const STORAGE_KEY = 'vfa_exam_district';

export default function VfaCountdown() {
  const { profile } = useAppContext();
  const [district, setDistrict] = useState('');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem(STORAGE_KEY) || '';
    setDistrict(profile?.district || saved);
  }, [profile?.district]);

  const phase = vfaPhaseForDistrict(district);
  const targetDate = resolveVfaExamDate(district);
  const districtLabel = vfaDistrictName(district);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(`${targetDate}T00:00:00`) - +new Date();
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const caption = useMemo(() => {
    if (phase && districtLabel) return `Countdown to ${districtLabel} VFA exam (${phase.shortLabel})`;
    return 'Countdown to the next VFA Saturday — pick your district';
  }, [phase, districtLabel]);

  if (!isClient) return null;

  return (
    <Box sx={{ mt: 3, p: 2.5, borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', maxWidth: 480 }}>
      <FormControl fullWidth size="small" sx={{ mb: 1.75 }}>
        <InputLabel id="vfa-district-label">Your exam district</InputLabel>
        <Select
          labelId="vfa-district-label"
          label="Your exam district"
          value={district}
          onChange={(event) => {
            const next = String(event.target.value);
            setDistrict(next);
            localStorage.setItem(STORAGE_KEY, next);
          }}
        >
          <MenuItem value="">
            <em>All districts — next Saturday</em>
          </MenuItem>
          {VFA_DISTRICTS.map((item) => (
            <MenuItem key={item.key} value={item.key}>
              {item.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {caption}
      </Typography>
      {phase && (
        <Typography sx={{ color: 'text.secondary', fontSize: '0.78rem', mt: 0.5, lineHeight: 1.5 }}>
          Same Saturday as {phase.districts.join(', ')}.
        </Typography>
      )}
      <Stack direction="row" spacing={2} sx={{ mt: 1.5 }}>
        {[
          { label: 'Days', value: timeLeft.days },
          { label: 'Hours', value: timeLeft.hours },
          { label: 'Mins', value: timeLeft.minutes },
          { label: 'Secs', value: timeLeft.seconds },
        ].map((item) => (
          <Paper
            key={item.label}
            sx={{
              flex: 1,
              py: 1,
              textAlign: 'center',
              borderRadius: '10px',
              bgcolor: 'background.default',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: "'JetBrains Mono', monospace", color: '#3B82F6' }}>
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
