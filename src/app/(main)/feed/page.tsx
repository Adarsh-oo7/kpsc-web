'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import {
  Box, Typography, Button, CircularProgress, Alert,
  Stack, LinearProgress, Divider, Chip, IconButton,
  SwipeableDrawer
} from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import BoltIcon from '@mui/icons-material/Bolt';
import StarIcon from '@mui/icons-material/Star';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';
import ReportQuestionButton from '@/components/ReportQuestionButton';

// ============================================================
// XP Notification (flies up and disappears)
// ============================================================
function XPNotification({ amount, onDone }: { amount: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 1 }}
      animate={{ opacity: 0, y: -80, scale: 0.7 }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: 'fixed', top: 70, right: 80, zIndex: 9999,
        background: 'rgba(139,92,246,0.9)', color: 'white',
        borderRadius: '20px', padding: '4px 12px',
        fontWeight: 700, fontSize: '0.9rem',
        fontFamily: "'JetBrains Mono'",
        pointerEvents: 'none',
        boxShadow: '0 4px 16px rgba(139,92,246,0.4)',
      }}
    >
      +{amount} XP ⚡
    </motion.div>
  );
}

// ============================================================
// Level Up Overlay
// ============================================================
function LevelUpOverlay({ level, onClose }: { level: number; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        style={{ textAlign: 'center' }}
      >
        <Box sx={{
          background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
          borderRadius: '32px', p: 5,
          boxShadow: '0 24px 80px rgba(27,107,58,0.5)',
        }}>
          <Typography sx={{ fontSize: '3rem', mb: 1 }}>🎉</Typography>
          <Typography sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, fontSize: '2.5rem', color: 'white' }}>
            Level Up!
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem', mt: 1 }}>
            You are now Level {level}!
          </Typography>
          <Box sx={{ mt: 2, display: 'inline-block', background: 'rgba(255,255,255,0.15)', borderRadius: '12px', px: 3, py: 1 }}>
            <Typography sx={{ color: 'white', fontWeight: 700 }}>Keep going, PSC topper! 🚀</Typography>
          </Box>
        </Box>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// Main Study Feed Page
// ============================================================
export default function StudyFeedPage() {
  const { fetcher, user, isLoading: ctxLoading, profile, refreshProfile } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!ctxLoading && !user) router.push('/login');
  }, [user, ctxLoading, router]);

  // Data
  const { data: feedData, error: feedError, isLoading: feedLoading, mutate: mutateFeed } = useSWR(
    user ? '/study-feed/' : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
    }
  );
  const { data: userProfile, mutate: mutateProfile } = useSWR(
    user ? '/auth/profile/' : null, fetcher
  );

  // UI State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [answerResult, setAnswerResult] = useState<any>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [xpNotif, setXpNotif] = useState<number | null>(null);
  const [levelUp, setLevelUp] = useState<number | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI Drawer
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLang, setAiLang] = useState<'en' | 'ml'>('en');
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const cards = feedData?.cards || [];
  const limitExceeded = feedData?.limit_exceeded || false;
  const limit = feedData?.limit || 15;
  const viewsToday = feedData?.views_today || 0;
  const currentCard = cards[currentIndex];

  const xp = userProfile?.total_xp || 0;
  const level = userProfile?.level || 1;
  const streak = userProfile?.current_streak || 0;
  const xpInLevel = xp % 100;

  // Reset when card changes
  useEffect(() => {
    setSelectedOption('');
    setIsAnswered(false);
    setAnswerResult(null);
    setIsCorrect(null);
    setAiText('');
    setBookmarked(false);
  }, [currentIndex]);

  // Bounds check currentIndex when cards change
  useEffect(() => {
    if (cards.length > 0 && currentIndex >= cards.length) {
      setCurrentIndex(0);
    }
  }, [cards.length, currentIndex]);

  const handleNext = async () => {
    if (!currentCard) return;
    const isQuiz = typeof currentCard.id === 'string' && currentCard.id.startsWith('quiz-');
    const isReask = typeof currentCard.id === 'string' && currentCard.id.startsWith('reask-');
    if (!isQuiz && !isReask) {
      try {
        await apiClient.post('/study-feed/view/', { card_id: currentCard.id });
        // Optimistically update views_today without refetching from server
        if (feedData) {
          mutateFeed({
            ...feedData,
            views_today: (feedData.views_today || 0) + 1
          }, { revalidate: false });
        }
      } catch { }
    }
    mutateProfile();
    if (refreshProfile) {
      refreshProfile().catch(err => console.error("Error refreshing profile:", err));
    }
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      await mutateFeed();
      setCurrentIndex(0);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOption || !currentCard || isAnswered || isSubmitting) return;
    setIsSubmitting(true);
    const questionId = currentCard.content_data?.question_id;
    try {
      const res = await apiClient.post('/submit-answer/', {
        question: questionId,
        selected_option: selectedOption,
      });
      const correct = res.data?.is_correct ?? (selectedOption === currentCard.content_data?.correct_answer);
      setIsCorrect(correct);
      setAnswerResult(res.data);
      setIsAnswered(true);
      if (res.data?.gamification?.xp_earned) {
        setXpNotif(res.data.gamification.xp_earned);
      }
      if (res.data?.gamification?.level_up) {
        setLevelUp(res.data.gamification.new_level);
      }
      mutateProfile();
      if (refreshProfile) {
        refreshProfile().catch(err => console.error("Error refreshing profile:", err));
      }

      // If user got the answer wrong, re-inject this question card 3 cards later
      if (!correct) {
        const reaskCard = {
          ...currentCard,
          id: `reask-${currentCard.id}-${Date.now()}`,
        };
        const targetIndex = currentIndex + 4; // Inserts it 3 cards later (e.g. current index + 4)
        const updatedCards = [...cards];
        if (targetIndex >= updatedCards.length) {
          updatedCards.push(reaskCard);
        } else {
          updatedCards.splice(targetIndex, 0, reaskCard);
        }
        if (feedData) {
          mutateFeed({
            ...feedData,
            cards: updatedCards
          }, { revalidate: false });
        }
      }
    } catch {
      const correct = selectedOption === currentCard.content_data?.correct_answer;
      setIsCorrect(correct);
      setIsAnswered(true);

      // Re-inject on connection failure too
      if (!correct) {
        const reaskCard = {
          ...currentCard,
          id: `reask-${currentCard.id}-${Date.now()}`,
        };
        const targetIndex = currentIndex + 4;
        const updatedCards = [...cards];
        if (targetIndex >= updatedCards.length) {
          updatedCards.push(reaskCard);
        } else {
          updatedCards.splice(targetIndex, 0, reaskCard);
        }
        if (feedData) {
          mutateFeed({
            ...feedData,
            cards: updatedCards
          }, { revalidate: false });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAI = async (lang: 'en' | 'ml') => {
    setAiLang(lang);
    setAiOpen(true);
    setAiLoading(true);
    setAiText('');
    const qId = currentCard?.content_data?.question_id;
    if (!qId) return;
    try {
      const res = await apiClient.get(`/questions/${qId}/explanation/?lang=${lang}`);
      setAiText(res.data.explanation);
    } catch {
      setAiText('Unable to fetch AI explanation. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleBookmark = async () => {
    const qId = currentCard?.content_data?.question_id;
    if (!qId) return;
    try {
      await apiClient.post('/bookmarks/', { question: qId });
      setBookmarked(true);
    } catch { }
  };

  // ── Loading / Error / Limit states ──────────────────────────────
  if (feedLoading || ctxLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (feedError) return <Alert severity="error">Failed to load study feed. Please try again.</Alert>;

  if (limitExceeded) {
    return (
      <Box sx={{ maxWidth: 480, mx: 'auto', mt: 6, textAlign: 'center' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <Box sx={{
            p: 5, borderRadius: '24px',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
          }}>
            <Typography sx={{ fontSize: '3rem', mb: 2 }}>📚</Typography>
            <Typography variant="h5" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, color: 'text.primary', mb: 1.5 }}>
              You've reached today's free limit
            </Typography>
            <Typography sx={{ color: 'text.secondary', mb: 1, fontSize: '0.9rem' }}>
              {viewsToday} cards studied today
            </Typography>
            <Typography sx={{ color: 'text.secondary', mb: 4, fontSize: '0.875rem', lineHeight: 1.7 }}>
              Upgrade to Pro — ₹199/month. Get unlimited study cards + AI explanations.
            </Typography>
            <Stack spacing={2}>
              <Button variant="contained" size="large" fullWidth onClick={() => router.push('/subscription')}
                sx={{ background: 'linear-gradient(135deg, #D97706, #F59E0B)', color: '#000', fontWeight: 700 }}>
                Upgrade Now ⚡
              </Button>
              <Button variant="outlined" fullWidth onClick={() => router.push('/home')}>
                Come Back Tomorrow
              </Button>
            </Stack>
          </Box>
        </motion.div>
      </Box>
    );
  }

  if (!cards.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography sx={{ fontSize: '2.5rem', mb: 2 }}>👇</Typography>
        <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700, mb: 1 }}>
          Your study feed starts here.
        </Typography>
        <Typography sx={{ color: 'text.secondary', mb: 3 }}>Answer your first question below.</Typography>
        <Button variant="contained" onClick={() => mutateFeed()}>Refresh Feed</Button>
      </Box>
    );
  }

  const getOptionStyle = (key: string) => {
    if (!isAnswered) {
      return {
        border: `2px solid ${selectedOption === key ? '#2E8B57' : 'rgba(136,146,164,0.15)'}`,
        background: selectedOption === key ? 'rgba(27,107,58,0.15)' : 'transparent',
        bgcolor: selectedOption === key ? 'rgba(27,107,58,0.15)' : 'surface.card',
        transform: selectedOption === key ? 'translateX(4px)' : 'none',
      };
    }
    const isCorrectOpt = key === currentCard.content_data?.correct_answer;
    const isSelected = key === selectedOption;
    if (isCorrectOpt) return {
      border: '2px solid #22c55e',
      background: 'rgba(34,197,94,0.12)',
      animation: 'correctPulse 0.6s ease forwards',
    };
    if (isSelected && !isCorrectOpt) return {
      border: '2px solid #EF4444',
      background: 'rgba(239,68,68,0.1)',
      animation: 'shakeWrong 0.5s ease',
    };
    return { border: '2px solid rgba(136,146,164,0.08)', bgcolor: 'surface.card', opacity: 0.6 };
  };

  const cardTypeColor: Record<string, string> = {
    question: '#2E8B57',
    current_affairs: '#3B82F6',
    fact: '#8B5CF6',
    community_win: '#F59E0B',
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      {/* XP Notification */}
      <AnimatePresence>
        {xpNotif && <XPNotification amount={xpNotif} onDone={() => setXpNotif(null)} />}
      </AnimatePresence>

      {/* Level Up Overlay */}
      <AnimatePresence>
        {levelUp && <LevelUpOverlay level={levelUp} onClose={() => setLevelUp(null)} />}
      </AnimatePresence>

      {/* XP Progress Bar */}
      <Box sx={{ mb: 3, p: 2.5, borderRadius: '16px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <StarIcon sx={{ fontSize: 16, color: '#2E8B57' }} />
            <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.875rem' }}>
              Level {level}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <LocalFireDepartmentIcon sx={{ fontSize: 16, color: '#FF6B2B' }} />
            <Typography sx={{ fontWeight: 700, color: '#FF6B2B', fontSize: '0.875rem' }}>
              {streak} day streak
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <BoltIcon sx={{ fontSize: 14, color: '#8B5CF6' }} />
            <Typography sx={{ fontSize: '0.75rem', color: '#a78bfa', fontFamily: "'JetBrains Mono'", fontWeight: 700 }}>
              {xp.toLocaleString()} XP
            </Typography>
          </Box>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={xpInLevel}
          sx={{
            height: 8, borderRadius: 4,
            bgcolor: 'rgba(255,255,255,0.06)',
            '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #8B5CF6, #2E8B57)', borderRadius: 4 }
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
          <Typography sx={{ fontSize: '0.65rem', color: '#4A5568' }}>
            Card {currentIndex + 1} of {cards.length}
          </Typography>
          <Typography sx={{ fontSize: '0.65rem', color: '#4A5568' }}>
            {viewsToday}/{limit} read today
          </Typography>
        </Box>
      </Box>

      {/* Main Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 40, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -40, scale: 0.98 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        >
          <Box sx={{ borderRadius: '20px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
            {/* Card Header */}
            <Box sx={{ px: 3, pt: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={currentCard?.card_type?.replace('_', ' ').toUpperCase()}
                  size="small"
                  sx={{
                    background: `${cardTypeColor[currentCard?.card_type] || '#2E8B57'}20`,
                    border: `1px solid ${cardTypeColor[currentCard?.card_type] || '#2E8B57'}40`,
                    color: cardTypeColor[currentCard?.card_type] || '#2E8B57',
                    fontWeight: 700, fontSize: '0.65rem', letterSpacing: '0.06em',
                  }}
                />
                {currentCard?.psc_likelihood_tag && (
                  <Chip
                    label={`🔥 HIGH PSC`}
                    size="small"
                    sx={{
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.25)',
                      color: '#f87171',
                      fontWeight: 700, fontSize: '0.65rem',
                    }}
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                {(() => {
                  const qId = Number(
                    currentCard?.content_data?.question_id ||
                    currentCard?.content_data?.id ||
                    (typeof currentCard?.id === 'string' ? currentCard.id.replace(/\D/g, '') : currentCard?.id)
                  );
                  if (!qId) return null;
                  return (
                    <ReportQuestionButton
                      questionId={qId}
                      questionText={currentCard?.content_data?.question_text || currentCard?.title}
                    />
                  );
                })()}
                <IconButton size="small" onClick={handleBookmark} sx={{ color: bookmarked ? '#F59E0B' : '#4A5568', ml: 0.5, flexShrink: 0 }}>
                  {bookmarked ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ px: 3, pb: 3 }}>
              {/* Card Title */}
              <Typography sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 700, fontSize: '1.1rem', color: 'text.primary', mb: 2, lineHeight: 1.4 }}>
                {currentCard?.title}
              </Typography>

              {/* FACT card */}
              {currentCard?.card_type === 'fact' && (
                <Box sx={{ p: 3, borderRadius: '12px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)', fontStyle: 'italic' }}>
                  <Typography sx={{ color: '#c4b5fd', lineHeight: 1.7, fontSize: '1rem' }}>
                    "{currentCard.content_data?.fact_text}"
                  </Typography>
                </Box>
              )}

              {/* CURRENT AFFAIRS card */}
              {currentCard?.card_type === 'current_affairs' && (
                <Box>
                  <Typography sx={{ color: 'text.secondary', lineHeight: 1.7, mb: 2 }}>
                    {currentCard.content_data?.content}
                  </Typography>
                  {currentCard.content_data?.ai_summary && (
                    <Box sx={{ p: 2, borderRadius: '10px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
                      <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#60a5fa', letterSpacing: '0.06em', mb: 0.5 }}>
                        AI SUMMARY
                      </Typography>
                      <Typography sx={{ color: '#93c5fd', fontSize: '0.875rem', lineHeight: 1.6 }}>
                        {currentCard.content_data.ai_summary}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* COMMUNITY WIN card */}
              {currentCard?.card_type === 'community_win' && (
                <Box sx={{ p: 3, borderRadius: '12px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                  <Typography sx={{ color: '#fcd34d', fontSize: '1rem', lineHeight: 1.7 }}>
                    {currentCard.content_data?.message || currentCard.content_data?.content}
                  </Typography>
                </Box>
              )}

              {/* QUESTION card */}
              {currentCard?.card_type === 'question' && (
                <Box>
                  <Typography sx={{ fontWeight: 600, color: 'text.primary', mb: 2.5, fontSize: '1rem', lineHeight: 1.6 }}>
                    {currentCard.content_data?.question_text}
                  </Typography>
                  <Stack spacing={1.25}>
                    {currentCard.content_data?.options &&
                      Object.entries(currentCard.content_data.options).map(([key, val]: any) => {
                        const isCorrectOpt = key === currentCard.content_data?.correct_answer;
                        const isSelected = key === selectedOption;
                        return (
                          <Box
                            key={key}
                            onClick={() => !isAnswered && setSelectedOption(key)}
                            sx={{
                              minHeight: 52, px: 2, py: 1.25,
                              borderRadius: '12px',
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              cursor: isAnswered ? 'default' : 'pointer',
                              transition: 'all 0.2s ease',
                              userSelect: 'none',
                              ...getOptionStyle(key),
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box sx={{
                                width: 26, height: 26, borderRadius: '8px', flexShrink: 0,
                                background: isAnswered && isCorrectOpt ? 'rgba(34,197,94,0.2)'
                                  : isAnswered && isSelected ? 'rgba(239,68,68,0.2)'
                                  : isSelected ? 'rgba(46,139,87,0.2)' : 'rgba(136,146,164,0.12)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: '0.75rem',
                                color: isAnswered && isCorrectOpt ? '#22c55e' : isSelected ? '#2E8B57' : '#8892A4',
                              }}>
                                {key}
                              </Box>
                              <Typography sx={{ fontSize: '0.9rem', color: 'text.primary', lineHeight: 1.4 }}>
                                {val}
                              </Typography>
                            </Box>
                            {isAnswered && isCorrectOpt && <CheckCircleIcon sx={{ fontSize: 20, color: '#22c55e', flexShrink: 0 }} />}
                            {isAnswered && isSelected && !isCorrectOpt && <CancelIcon sx={{ fontSize: 20, color: '#EF4444', flexShrink: 0 }} />}
                          </Box>
                        );
                      })}
                  </Stack>
                </Box>
              )}

              {/* Answer Result + Explanation (inline for question cards) */}
              {isAnswered && currentCard?.card_type === 'question' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  <Box sx={{ mt: 2.5, p: 2.5, borderRadius: '12px', background: isCorrect ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                    <Typography sx={{ fontWeight: 700, color: isCorrect ? 'success.main' : 'error.main', mb: 1 }}>
                      {isCorrect ? '✓ Correct!' : '✗ Wrong!'}
                      {answerResult?.gamification?.xp_earned && (
                        <Box component="span" sx={{ ml: 1.5, fontSize: '0.8rem', color: 'secondary.light', fontFamily: "'JetBrains Mono'" }}>
                          +{answerResult.gamification.xp_earned} XP
                        </Box>
                      )}
                    </Typography>
                    {currentCard.content_data?.explanation && (
                      <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.7 }}>
                        {currentCard.content_data.explanation}
                      </Typography>
                    )}
                  </Box>
                </motion.div>
              )}

              {/* Action Buttons */}
              <Box sx={{ mt: 3 }}>
                {currentCard?.card_type === 'question' ? (
                  !isAnswered ? (
                    <Button
                      variant="contained"
                      fullWidth
                      disabled={!selectedOption || isSubmitting}
                      onClick={handleSubmitAnswer}
                      sx={{ py: 1.5, fontSize: '0.95rem' }}
                    >
                      {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Submit Answer'}
                    </Button>
                  ) : (
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AutoAwesomeIcon sx={{ fontSize: 14 }} />}
                        onClick={() => handleAI('ml')}
                        sx={{ flex: 1, fontSize: '0.75rem', py: 1 }}
                      >
                        AI Explain (ML)
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleAI('en')}
                        sx={{ fontSize: '0.75rem', py: 1 }}
                      >
                        EN
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                        onClick={handleNext}
                        sx={{ flex: 1, fontSize: '0.75rem', py: 1 }}
                      >
                        Next
                      </Button>
                    </Stack>
                  )
                ) : (
                  <Button
                    variant="contained"
                    fullWidth
                    endIcon={<ArrowForwardIcon />}
                    onClick={handleNext}
                    sx={{ py: 1.5 }}
                  >
                    Mark as Read & Next
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </motion.div>
      </AnimatePresence>

      {/* AI Explanation Drawer */}
      <SwipeableDrawer
        anchor="bottom"
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        onOpen={() => setAiOpen(true)}
        sx={{
          '& .MuiDrawer-paper': {
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            p: 3, maxHeight: '75vh',
          }
        }}
      >
        <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: 'divider', mx: 'auto', mb: 3 }} />
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon sx={{ color: '#F59E0B', fontSize: 20 }} />
            <Typography sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 700, color: 'text.primary' }}>
              AI Explanation ({aiLang === 'ml' ? 'Malayalam' : 'English'})
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.5}>
            {(['en', 'ml'] as const).map(lang => (
              <Button
                key={lang}
                size="small"
                variant={aiLang === lang ? 'contained' : 'outlined'}
                disabled={aiLoading}
                onClick={() => handleAI(lang)}
                sx={{ fontSize: '0.7rem', py: 0.4, px: 1.25 }}
              >
                {lang === 'en' ? 'English' : 'മലയാളം'}
              </Button>
            ))}
          </Stack>
        </Stack>

        <Divider sx={{ borderColor: 'divider', mb: 2.5 }} />

        {aiLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5 }}>
            <CircularProgress color="warning" sx={{ mb: 2 }} />
            <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>AI is generating explanation...</Typography>
          </Box>
        ) : (
          <Box sx={{ overflowY: 'auto', maxHeight: '45vh', pr: 1 }}>
            <Typography sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
              {aiText || 'Explanation will appear here...'}
            </Typography>
          </Box>
        )}

        <Button
          variant="contained"
          fullWidth
          onClick={() => setAiOpen(false)}
          sx={{ mt: 3, py: 1.5, background: 'linear-gradient(135deg, #D97706, #F59E0B)', color: '#000', fontWeight: 700 }}
        >
          Got it, thanks!
        </Button>
      </SwipeableDrawer>
    </Box>
  );
}
