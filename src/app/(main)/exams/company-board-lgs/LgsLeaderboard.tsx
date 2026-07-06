// app/(main)/exams/company-board-lgs/LgsLeaderboard.tsx
'use client';

import React from 'react';
import { Paper, Stack, Box, Typography, Avatar } from '@mui/material';

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Sajith Kumar', district: 'Thiruvananthapuram', score: '94.67', xp: 840 },
  { rank: 2, name: 'Aparna Nair', district: 'Kollam', score: '92.33', xp: 760 },
  { rank: 3, name: 'Rahul R', district: 'Ernakulam', score: '91.00', xp: 710 },
  { rank: 4, name: 'Anjali Das', district: 'Alappuzha', score: '89.67', xp: 680 },
  { rank: 5, name: 'Muhammed Shafeeque', district: 'Kozhikode', score: '88.33', xp: 620 }
];

export default function LgsLeaderboard() {
  return (
    <Paper sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 4, background: 'background.paper' }}>
      <Stack spacing={2}>
        {MOCK_LEADERBOARD.map((user) => (
          <Box
            key={user.rank}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1.5,
              borderRadius: '12px',
              bgcolor: 'action.hover',
              border: '1px solid transparent',
              transition: 'border-color 0.2s',
              '&:hover': {
                borderColor: 'divider',
              }
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: user.rank === 1 ? 'rgba(245, 158, 11, 0.15)' : 'action.selected',
                color: user.rank === 1 ? '#F59E0B' : 'text.secondary',
                fontWeight: 900,
                fontSize: '0.8rem',
                fontFamily: "'JetBrains Mono', monospace"
              }}>
                {user.rank}
              </Box>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.9rem', fontWeight: 700 }}>
                {user.name.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 750, color: 'text.primary' }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  📍 {user.district}
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" sx={{ fontWeight: 900, color: '#10B981', fontFamily: "'JetBrains Mono', monospace" }}>
                {user.score}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.65rem' }}>
                ⚡ {user.xp} XP
              </Typography>
            </Box>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
