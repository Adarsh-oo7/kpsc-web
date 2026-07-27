'use client';

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Button,
  Chip,
  Grid
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useRouter } from 'next/navigation';

interface WeakTopic {
  id?: number;
  name: string;
  accuracy: number;
  slug?: string;
}

interface WeakAreaInterventionCardProps {
  weakTopics?: WeakTopic[];
  examName?: string;
}

export default function WeakAreaInterventionCard({
  weakTopics = [],
  examName = 'LGS 2026',
}: WeakAreaInterventionCardProps) {
  const router = useRouter();

  // Fallback defaults if user hasn't attempted enough quizzes yet
  const defaultWeakTopics: WeakTopic[] = [
    { id: 1, name: 'Kerala History & Renaissance Movement', accuracy: 42, slug: 'kerala-history' },
    { id: 2, name: 'Simple Arithmetic & Percentage', accuracy: 48, slug: 'simple-arithmetic' },
    { id: 3, name: 'General Science & SCERT Chemistry', accuracy: 45, slug: 'general-science' },
  ];

  const topicsToDisplay = weakTopics.length > 0 ? weakTopics.slice(0, 3) : defaultWeakTopics;

  return (
    <Paper
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 5,
        border: '1px solid',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, #ffffff 100%)',
        boxShadow: '0 10px 30px rgba(239, 68, 68, 0.06)'
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 3,
            bgcolor: 'rgba(239, 68, 68, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#EF4444'
          }}
        >
          <WarningAmberIcon />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: "'Outfit', sans-serif", color: 'text.primary' }}>
            Identified Weak Topics in {examName}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Target these low-accuracy topics to boost your cut-off score by +15 marks.
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        {topicsToDisplay.map((topic, idx) => (
          <Grid item xs={12} sm={4} key={idx}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 4,
                borderColor: 'rgba(239, 68, 68, 0.2)',
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                height: '100%'
              }}
            >
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Chip
                    label={`${Math.round(topic.accuracy)}% Accuracy`}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(239, 68, 68, 0.12)',
                      color: '#EF4444',
                      fontWeight: 800,
                      fontSize: '0.7rem'
                    }}
                  />
                  <AutoFixHighIcon sx={{ fontSize: 16, color: '#EF4444' }} />
                </Stack>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.3, mb: 2 }}>
                  {topic.name}
                </Typography>
              </Box>

              <Button
                variant="contained"
                size="small"
                fullWidth
                onClick={() => router.push(`/quiz?topic_id=${topic.id || 1}`)}
                endIcon={<ArrowForwardIcon sx={{ fontSize: '0.85rem !important' }} />}
                sx={{
                  bgcolor: '#EF4444',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  borderRadius: 2.5,
                  '&:hover': { bgcolor: '#DC2626' }
                }}
              >
                Fix Weak Area
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}
