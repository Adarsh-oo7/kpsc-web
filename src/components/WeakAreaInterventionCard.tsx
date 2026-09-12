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
  name?: string;
  title?: string;
  accuracy: number;
  slug?: string;
  key?: string;
  marks?: number;
}

interface WeakAreaInterventionCardProps {
  weakTopics?: WeakTopic[];
  examName?: string;
}

function displayName(topic: WeakTopic) {
  return topic.name || topic.title || 'This section';
}

export default function WeakAreaInterventionCard({
  weakTopics = [],
  examName = 'LGS 2026',
}: WeakAreaInterventionCardProps) {
  const router = useRouter();

  const topicsToDisplay = (weakTopics || []).filter((topic) => displayName(topic)).slice(0, 3);

  const goPractice = (topic: WeakTopic) => {
    if (topic.key) {
      router.push(`/quiz?section=${encodeURIComponent(topic.key)}&limit=15`);
      return;
    }
    if (topic.slug) {
      router.push(`/topics/${topic.slug}`);
      return;
    }
    if (topic.id) {
      router.push(`/quiz?topic_id=${topic.id}`);
      return;
    }
    router.push('/topics');
  };

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
            Focus these {examName} sections
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Practise the paper parts that are pulling your cut-off down.
          </Typography>
        </Box>
      </Stack>

      {topicsToDisplay.length === 0 ? (
        <Button variant="contained" onClick={() => router.push('/topics')} sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 3 }}>
          Open syllabus and start
        </Button>
      ) : (
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
                justifyContent: 'space-between',
                height: '100%'
              }}
            >
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Chip
                    label={`${Math.round(topic.accuracy || 0)}% Accuracy`}
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
                  {displayName(topic)}
                  {topic.marks ? ` · ${topic.marks} marks` : ''}
                </Typography>
              </Box>

              <Button
                variant="contained"
                size="small"
                fullWidth
                onClick={() => goPractice(topic)}
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
                Practise this section
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
      )}
    </Paper>
  );
}
