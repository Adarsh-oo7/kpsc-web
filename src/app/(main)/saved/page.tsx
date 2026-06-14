'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Box, Typography, CircularProgress, Stack, Button, Card, CardContent, Divider, Chip, IconButton
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';

export default function SavedPage() {
  const { user, fetcher, isLoading: ctxLoading } = useAppContext();
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!ctxLoading && !user) router.push('/login');
  }, [user, ctxLoading, router]);

  // Fetch bookmarks
  const { data, error, isLoading, mutate } = useSWR(
    user ? '/bookmarks/' : null,
    fetcher
  );

  const handleDeleteBookmark = async (id: number) => {
    setDeletingId(id);
    try {
      await apiClient.delete(`/bookmarks/${id}/`);
      mutate();
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  if (ctxLoading || isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={32} sx={{ color: '#2E8B57' }} />
      </Box>
    );
  }

  const bookmarks = data || [];

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', pb: 6 }}>
      {/* Title */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: '0.8rem', color: '#1B6B3A', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Saved items ✦
        </Typography>
        <Typography variant="h4" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, color: 'text.primary', mt: 0.5 }}>
          Bookmarked Questions
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', mt: 0.5 }}>
          Review important questions you've starred to reinforce critical facts before exams.
        </Typography>
      </Box>

      {bookmarks.length === 0 ? (
        <Box sx={{
          textAlign: 'center', py: 8, px: 3,
          bgcolor: 'background.paper', borderRadius: '20px',
          border: '1px solid', borderColor: 'divider'
        }}>
          <Typography sx={{ fontSize: '2.5rem', mb: 1.5 }}>✦</Typography>
          <Typography sx={{ fontWeight: 800, color: 'text.primary', fontFamily: "'Cabinet Grotesk'", mb: 0.5 }}>
            No saved questions yet
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', mb: 3 }}>
            Tap the ✦ bookmark icon on any question in your study feed to save it here.
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push('/feed')}
            sx={{
              background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
              textTransform: 'none', fontWeight: 700, borderRadius: '10px', px: 3
            }}
          >
            Go to Study Feed
          </Button>
        </Box>
      ) : (
        <Stack spacing={2.5}>
          <AnimatePresence mode="popLayout">
            {bookmarks.map((b: any, idx: number) => {
              const q = b.question;
              if (!q) return null;

              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card sx={{
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '20px'
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Chip
                          label={q.difficulty ? q.difficulty.toUpperCase() : 'MEDIUM'}
                          size="small"
                          sx={{
                            fontSize: '0.65rem', fontWeight: 800,
                            bgcolor: q.difficulty === 'hard' ? 'rgba(239,68,68,0.12)' : 'surface.card',
                            color: q.difficulty === 'hard' ? '#EF4444' : 'text.secondary',
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        />
                        <IconButton
                          onClick={() => handleDeleteBookmark(b.id)}
                          disabled={deletingId === b.id}
                          sx={{ color: '#EF4444', p: 0.5 }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Stack>

                       <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1.05rem', lineHeight: 1.5, mb: 2 }}>
                        {q.text}
                      </Typography>

                      {/* Display correct answer */}
                      <Box sx={{
                        p: 2,
                        background: 'rgba(27, 107, 58, 0.08)',
                        border: '1px solid rgba(46, 139, 87, 0.25)',
                        borderRadius: '12px',
                        mb: 2
                      }}>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#2E8B57', mb: 0.5, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                          Correct Option: {q.correct_answer}
                        </Typography>
                        <Typography sx={{ color: 'text.primary', fontSize: '0.85rem' }}>
                          {q.options?.[q.correct_answer] || q.options?.options_list?.[q.correct_answer] || 'Option ' + q.correct_answer}
                        </Typography>
                      </Box>

                      {q.explanation && (
                        <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', lineHeight: 1.5 }}>
                          💡 <strong>Explanation:</strong> {q.explanation}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </Stack>
      )}
    </Box>
  );
}
