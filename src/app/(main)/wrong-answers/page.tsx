'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Box, Typography, CircularProgress, Stack, Card, CardContent, Divider, Chip, Collapse, Button, useTheme
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useAppContext } from '@/context/AppContext';

export default function WrongAnswersPage() {
  const { user, fetcher, isLoading: ctxLoading } = useAppContext();
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    if (!ctxLoading && !user) router.push('/login');
  }, [user, ctxLoading, router]);

  // Fetch wrong answers
  const { data, error, isLoading } = useSWR(
    user ? '/wrong-answers/' : null,
    fetcher
  );

  const toggleExpand = (id: number) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  if (ctxLoading || isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={32} sx={{ color: '#2E8B57' }} />
      </Box>
    );
  }

  const wrongAnswers = data || [];

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', pb: 6 }}>
      {/* Title */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: '0.8rem', color: '#EF4444', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Error Book 🎯
        </Typography>
        <Typography variant="h4" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, color: 'text.primary', mt: 0.5 }}>
          Wrong Answer Review
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', mt: 0.5 }}>
          Your customized study list. Review questions you got wrong to turn weaknesses into top scores.
        </Typography>
      </Box>

      {wrongAnswers.length === 0 ? (
        <Box sx={{
          textAlign: 'center', py: 8, px: 3,
          bgcolor: 'background.paper', borderRadius: '20px',
          border: '1px solid', borderColor: 'divider'
        }}>
          <Typography sx={{ fontSize: '2.5rem', mb: 1.5 }}>🎯</Typography>
          <Typography sx={{ fontWeight: 800, color: 'text.primary', fontFamily: "'Cabinet Grotesk'", mb: 0.5 }}>
            You haven't gotten anything wrong yet.
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', mb: 3 }}>
            That's impressive! Keep practicing on the study feed to build your knowledge.
          </Typography>
          <Button
            variant="contained"
            onClick={() => router.push('/feed')}
            sx={{
              background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
              textTransform: 'none', fontWeight: 700, borderRadius: '10px', px: 3
            }}
          >
            Start Practicing
          </Button>
        </Box>
      ) : (
        <Stack spacing={2.5}>
          <AnimatePresence mode="popLayout">
            {wrongAnswers.map((wa: any, idx: number) => {
              const q = wa.question;
              if (!q) return null;
              const isExpanded = expandedId === wa.id;

              return (
                <motion.div
                  key={wa.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card sx={{
                    bgcolor: 'background.paper',
                    border: '1px solid', borderColor: 'divider',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.4)' : '0 8px 20px rgba(0,0,0,0.04)'
                    }
                  }} onClick={() => toggleExpand(wa.id)}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Chip
                            label="ERROR"
                            size="small"
                            sx={{
                              fontSize: '0.65rem', fontWeight: 900,
                              bgcolor: 'rgba(239,68,68,0.12)', color: '#EF4444',
                              border: '1px solid rgba(239,68,68,0.25)'
                            }}
                          />
                          {q.difficulty && (
                            <Chip
                              label={q.difficulty.toUpperCase()}
                              size="small"
                              sx={{
                                fontSize: '0.65rem', fontWeight: 800,
                                bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                                color: 'text.secondary',
                                border: '1px solid',
                                borderColor: 'divider'
                              }}
                            />
                          )}
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'text.secondary' }}>
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700 }}>
                            {isExpanded ? 'Hide info' : 'Review info'}
                          </Typography>
                          {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                        </Stack>
                      </Stack>

                      <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '1.05rem', lineHeight: 1.5 }}>
                        {q.text}
                      </Typography>

                      <Collapse in={isExpanded} timeout="auto" unmountOnExit sx={{ mt: 3 }}>
                        <Divider sx={{ borderColor: 'divider', mb: 2.5 }} />

                        {/* Options Display */}
                        <Stack spacing={1.25} sx={{ mb: 2.5 }}>
                          {q.options && Object.entries(q.options).map(([key, val]: any) => {
                            const isCorrectOption = key === q.correct_answer;
                            const isSelectedOption = key === wa.selected_option;
                            
                            let optionBorder = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)';
                            let optionBg = isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.02)';
                            let optionColor = theme.palette.text.primary;

                            if (isCorrectOption) {
                              optionBorder = '1px solid rgba(46, 139, 87, 0.4)';
                              optionBg = 'rgba(27, 107, 58, 0.08)';
                              optionColor = '#22c55e';
                            } else if (isSelectedOption) {
                              optionBorder = '1px solid rgba(239, 68, 68, 0.4)';
                              optionBg = 'rgba(239, 68, 68, 0.08)';
                              optionColor = '#EF4444';
                            }

                            return (
                              <Box key={key} sx={{
                                p: 1.75, borderRadius: '12px',
                                border: optionBorder, background: optionBg, color: optionColor,
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                              }}>
                                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700 }}>
                                  {key}) {val}
                                </Typography>
                                {isCorrectOption && (
                                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, ml: 'auto', bgcolor: 'rgba(34,197,94,0.12)', px: 1, py: 0.25, borderRadius: '4px' }}>
                                    CORRECT
                                  </Typography>
                                )}
                                {isSelectedOption && !isCorrectOption && (
                                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, ml: 'auto', bgcolor: 'rgba(239,68,68,0.12)', px: 1, py: 0.25, borderRadius: '4px' }}>
                                    YOUR ANSWER
                                  </Typography>
                                )}
                              </Box>
                            );
                          })}
                        </Stack>

                        {q.explanation && (
                          <Box sx={{ p: 2, background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
                            <Typography sx={{ color: 'text.secondary', fontSize: '0.825rem', lineHeight: 1.5 }}>
                              💡 <strong>Explanation:</strong> {q.explanation}
                            </Typography>
                          </Box>
                        )}
                      </Collapse>
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
