'use client';

import { useState, useMemo, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Box, Typography, Button, CircularProgress, Stack,
  LinearProgress, Chip, Alert, SwipeableDrawer, Divider
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

// ───────────────────────────────────────────────
// Types
// ───────────────────────────────────────────────
interface Question {
  id: number; text: string; options: Record<string, string>;
  correct_answer: string; explanation?: string; topic?: any; difficulty?: string;
}
interface UserAnswers { [qId: string]: string }
interface ResultData {
  results: { score: number; total: number; correct: number; wrong: number; unanswered: number };
  questions: Question[];
  timeTaken: number;
}

const QUIZ_DURATION = 15 * 60; // 15 minutes

const difficultyColor: Record<string, string> = {
  easy: '#22c55e', medium: '#F59E0B', hard: '#EF4444'
};

// ───────────────────────────────────────────────
// Score Gauge SVG
// ───────────────────────────────────────────────
function ScoreGauge({ score }: { score: number }) {
  const [display, setDisplay] = useState(0);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - display / 100);

  useEffect(() => {
    let start = 0;
    const end = Math.round(score);
    const step = end / 60;
    const id = setInterval(() => {
      start = Math.min(start + step, end);
      setDisplay(Math.round(start));
      if (start >= end) clearInterval(id);
    }, 20);
    return () => clearInterval(id);
  }, [score]);

  const color = score >= 70 ? '#22c55e' : score >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <Box sx={{ position: 'relative', width: 180, height: 180, mx: 'auto' }}>
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
        <circle
          cx="90" cy="90" r={radius} fill="none"
          stroke={color} strokeWidth="14"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '90px 90px', transition: 'stroke-dashoffset 0.05s linear' }}
        />
      </svg>
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ fontFamily: "'JetBrains Mono'", fontWeight: 900, fontSize: '2.5rem', color, lineHeight: 1 }}>
          {display}
        </Typography>
        <Typography sx={{ fontSize: '0.7rem', color: '#8892A4', fontWeight: 600 }}>/ 100</Typography>
      </Box>
    </Box>
  );
}

// ───────────────────────────────────────────────
// Results Screen
// ───────────────────────────────────────────────
function ResultsScreen({ resultData, answers, onRetry }: { resultData: ResultData; answers: UserAnswers; onRetry: () => void }) {
  const router = useRouter();
  const { results, questions, timeTaken } = resultData;
  const scorePercent = Math.round((results.correct / results.total) * 100);
  const mins = Math.floor(timeTaken / 60);
  const secs = timeTaken % 60;

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', py: 2 }}>
      {/* Score */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ textAlign: 'center', mb: 4, p: 4, borderRadius: '24px', background: '#161B22', border: '1px solid rgba(255,255,255,0.08)' }}>
          <EmojiEventsIcon sx={{ fontSize: 40, color: '#F59E0B', mb: 1 }} />
          <Typography variant="h4" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, color: '#F0F4F8', mb: 3 }}>
            Quiz Complete!
          </Typography>
          <ScoreGauge score={scorePercent} />
          <Typography sx={{ color: '#8892A4', mt: 2, fontSize: '0.875rem' }}>
            You beat {Math.max(0, Math.round(100 - scorePercent + 15))}% of students today
          </Typography>
        </Box>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5, mb: 3 }}>
          {[
            { label: 'Correct', val: results.correct, color: '#22c55e' },
            { label: 'Wrong', val: results.wrong, color: '#EF4444' },
            { label: 'Skipped', val: results.unanswered, color: '#8892A4' },
            { label: 'Time', val: `${mins}m${secs}s`, color: '#3B82F6' },
          ].map(s => (
            <Box key={s.label} sx={{ p: 2, textAlign: 'center', borderRadius: '12px', background: '#161B22', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Typography sx={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: '1.25rem', color: s.color }}>{s.val}</Typography>
              <Typography sx={{ fontSize: '0.7rem', color: '#8892A4' }}>{s.label}</Typography>
            </Box>
          ))}
        </Box>
      </motion.div>

      {/* Actions */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: 4 }}>
        <Button variant="contained" fullWidth onClick={() => router.push('/exams')}>Try Another Quiz</Button>
        <Button variant="outlined" fullWidth onClick={onRetry}>Retry This Quiz</Button>
        <Button variant="outlined" fullWidth onClick={() => router.push('/feed')}>Back to Feed</Button>
      </Stack>

      {/* Review */}
      <Typography sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, fontSize: '1.1rem', color: '#F0F4F8', mb: 2 }}>
        Review Your Answers
      </Typography>
      <Stack spacing={2}>
        {questions.map((q: Question, idx: number) => {
          const userAns = answers[q.id];
          const correct = userAns === q.correct_answer;
          return (
            <motion.div key={q.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <Box sx={{ p: 3, borderRadius: '16px', background: '#161B22', border: `1px solid ${correct ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.15)'}` }}>
                <Typography sx={{ fontWeight: 600, color: '#F0F4F8', mb: 2, fontSize: '0.9rem', lineHeight: 1.5 }}>
                  {idx + 1}. {q.text}
                </Typography>
                <Stack spacing={0.75}>
                  {Object.entries(q.options).map(([key, val]) => {
                    const isCorrectOpt = key === q.correct_answer;
                    const isUserAns = key === userAns;
                    return (
                      <Box key={key} sx={{
                        px: 2, py: 1, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: isCorrectOpt ? 'rgba(34,197,94,0.08)' : isUserAns ? 'rgba(239,68,68,0.08)' : 'transparent',
                        border: isCorrectOpt ? '1px solid rgba(34,197,94,0.25)' : isUserAns ? '1px solid rgba(239,68,68,0.2)' : '1px solid transparent',
                      }}>
                        <Typography sx={{ fontSize: '0.8rem', color: isCorrectOpt ? '#86efac' : isUserAns ? '#fca5a5' : '#8892A4' }}>
                          <strong>{key}.</strong> {val}
                        </Typography>
                        {isCorrectOpt && <CheckCircleIcon sx={{ fontSize: 16, color: '#22c55e' }} />}
                        {isUserAns && !isCorrectOpt && <CancelIcon sx={{ fontSize: 16, color: '#EF4444' }} />}
                      </Box>
                    );
                  })}
                </Stack>
                {!userAns && <Alert severity="warning" sx={{ mt: 1.5, py: 0 }}>Not answered</Alert>}
                {q.explanation && (
                  <Box sx={{ mt: 1.5, p: 1.5, borderRadius: '8px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
                    <Typography sx={{ fontSize: '0.8rem', color: '#93c5fd', lineHeight: 1.6 }}>
                      <strong>💡</strong> {q.explanation}
                    </Typography>
                  </Box>
                )}
              </Box>
            </motion.div>
          );
        })}
      </Stack>
    </Box>
  );
}

// ───────────────────────────────────────────────
// Quiz Page
// ───────────────────────────────────────────────
function QuizContent() {
  const { fetcher, user, isLoading: ctxLoading } = useAppContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!ctxLoading && !user) router.push('/login');
  }, [user, ctxLoading, router]);

  const [answers, setAnswers] = useState<UserAnswers>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLang, setAiLang] = useState<'en' | 'ml'>('en');
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const apiUrl = useMemo(() => {
    const exam = searchParams.get('exam_id');
    const topic = searchParams.get('topic_id');
    if (!exam && !topic) return null;
    const p = new URLSearchParams();
    if (exam) p.append('exam_id', exam);
    if (topic) p.append('topic_id', topic);
    p.append('limit', '15');
    return `/questions/?${p}`;
  }, [searchParams]);

  const { data: questions, error, isLoading } = useSWR(apiUrl, fetcher, { revalidateOnFocus: false });

  // Reset answer when question changes
  useEffect(() => { setSelectedOption(''); setIsAnswered(false); }, [currentQ]);

  const handleFinish = useCallback(async () => {
    if (isFinished) return;
    if (!window.confirm('Submit this quiz?')) return;
    setIsSubmitting(true);
    const timeTaken = QUIZ_DURATION - timeLeft;
    try {
      const res = await apiClient.post('/submit-exam/', {
        answers,
        question_ids: questions?.map((q: Question) => q.id) || [],
      });
      setResultData({ ...res.data, timeTaken });
      setIsFinished(true);
    } catch {
      alert('Error submitting quiz.');
      setIsSubmitting(false);
    }
  }, [answers, timeLeft, isFinished, questions]);

  // Timer
  useEffect(() => {
    if (isLoading || isFinished) return;
    if (timeLeft <= 0) { handleFinish(); return; }
    const id = setInterval(() => setTimeLeft(t => t > 0 ? t - 1 : 0), 1000);
    return () => clearInterval(id);
  }, [isLoading, isFinished, timeLeft, handleFinish]);

  const handleAI = async (lang: 'en' | 'ml') => {
    setAiLang(lang);
    setAiOpen(true);
    setAiLoading(true);
    setAiText('');
    const q = questions?.[currentQ];
    if (!q) return;
    try {
      const res = await apiClient.get(`/questions/${q.id}/explanation/?lang=${lang}`);
      setAiText(res.data.explanation);
    } catch {
      setAiText('Unable to fetch explanation.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSelectAnswer = (key: string) => {
    if (isAnswered) return;
    setSelectedOption(key);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption || isAnswered) return;
    setAnswers(prev => ({ ...prev, [questions[currentQ].id]: selectedOption }));
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) setCurrentQ(prev => prev + 1);
    else handleFinish();
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress size={32} /></Box>;
  if (error) return <Alert severity="error">Could not load quiz questions.</Alert>;
  if (!apiUrl || !questions?.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography sx={{ color: '#8892A4', mb: 3 }}>Select an exam or topic to start a quiz.</Typography>
        <Button variant="contained" onClick={() => router.push('/exams')}>Choose Exam</Button>
      </Box>
    );
  }

  if (isFinished && resultData) {
    return <ResultsScreen resultData={resultData} answers={answers} onRetry={() => { setAnswers({}); setCurrentQ(0); setIsFinished(false); setResultData(null); setTimeLeft(QUIZ_DURATION); }} />;
  }

  // ── Pre-quiz screen ──
  if (!questions) return null;

  const q = questions[currentQ];
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = ((currentQ) / questions.length) * 100;
  const timerColor = timeLeft < 60 ? '#EF4444' : timeLeft < 300 ? '#F59E0B' : '#2E8B57';

  const getOptionStyle = (key: string) => {
    if (!isAnswered) return {
      border: `2px solid ${selectedOption === key ? '#2E8B57' : 'rgba(255,255,255,0.08)'}`,
      background: selectedOption === key ? 'rgba(27,107,58,0.15)' : '#1C2230',
    };
    if (key === q.correct_answer) return { border: '2px solid #22c55e', background: 'rgba(34,197,94,0.1)', animation: 'correctPulse 0.6s ease' };
    if (key === selectedOption) return { border: '2px solid #EF4444', background: 'rgba(239,68,68,0.1)', animation: 'shakeWrong 0.5s ease' };
    return { border: '2px solid rgba(255,255,255,0.04)', background: '#1C2230', opacity: 0.55 };
  };

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto' }}>
      {/* Sticky Quiz Bar */}
      <Box sx={{
        position: 'sticky', top: 64, zIndex: 10, mb: 3,
        p: 2, borderRadius: '16px',
        background: 'rgba(22, 27, 34, 0.95)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography sx={{ fontSize: '0.8rem', color: '#8892A4', fontWeight: 600 }}>
            Question {currentQ + 1} of {questions.length}
          </Typography>
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 0.75,
            px: 2, py: 0.5, borderRadius: '20px',
            background: `${timerColor}15`,
            border: `1px solid ${timerColor}30`,
          }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: timerColor, animation: timeLeft < 60 ? 'ctaGlow 1s ease infinite' : 'none' }} />
            <Typography sx={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: '0.9rem', color: timerColor }}>
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            onClick={handleFinish}
            disabled={isSubmitting}
            sx={{ fontSize: '0.75rem', py: 0.4, px: 1.5, color: '#EF4444', borderColor: 'rgba(239,68,68,0.4)' }}
          >
            Finish
          </Button>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.06)', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #1B6B3A, #2E8B57)', borderRadius: 2 } }}
        />
      </Box>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <Box sx={{ borderRadius: '20px', background: '#161B22', border: '1px solid rgba(255,255,255,0.08)', p: 3, mb: 3 }}>
            {/* Tags */}
            <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
              {q.topic?.name && (
                <Chip label={q.topic.name} size="small"
                  sx={{ background: 'rgba(27,107,58,0.15)', border: '1px solid rgba(46,139,87,0.2)', color: '#2E8B57', fontWeight: 600, fontSize: '0.7rem' }}
                />
              )}
              {q.difficulty && (
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: difficultyColor[q.difficulty] || '#F59E0B', alignSelf: 'center' }} />
              )}
            </Box>

            {/* Question text */}
            <Typography sx={{ fontWeight: 600, fontSize: '1.05rem', color: '#F0F4F8', lineHeight: 1.6, mb: 3 }}>
              {q.text}
            </Typography>

            {/* Options */}
            <Stack spacing={1.25}>
              {Object.entries(q.options).map(([key, val]) => (
                <Box
                  key={key}
                  onClick={() => handleSelectAnswer(key)}
                  sx={{
                    minHeight: 52, px: 2, py: 1.5,
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
                      width: 28, height: 28, borderRadius: '8px', flexShrink: 0,
                      background: selectedOption === key && !isAnswered ? 'rgba(46,139,87,0.2)' : 'rgba(255,255,255,0.06)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: '0.8rem',
                      color: selectedOption === key && !isAnswered ? '#2E8B57' : '#8892A4',
                    }}>
                      {key}
                    </Box>
                    <Typography sx={{ fontSize: '0.9rem', color: '#F0F4F8', lineHeight: 1.4 }}>{val as string}</Typography>
                  </Box>
                  {isAnswered && key === q.correct_answer && <CheckCircleIcon sx={{ fontSize: 20, color: '#22c55e', flexShrink: 0 }} />}
                  {isAnswered && key === selectedOption && key !== q.correct_answer && <CancelIcon sx={{ fontSize: 20, color: '#EF4444', flexShrink: 0 }} />}
                </Box>
              ))}
            </Stack>

            {/* Inline explanation after answering */}
            {isAnswered && q.explanation && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Box sx={{ mt: 2.5, p: 2, borderRadius: '10px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#60a5fa', mb: 0.5, letterSpacing: '0.04em' }}>
                    EXPLANATION
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', color: '#93c5fd', lineHeight: 1.7 }}>
                    {q.explanation}
                  </Typography>
                </Box>
              </motion.div>
            )}
          </Box>

          {/* Action buttons */}
          {!isAnswered ? (
            <Button
              variant="contained"
              fullWidth
              size="large"
              disabled={!selectedOption}
              onClick={handleSubmitAnswer}
              sx={{ py: 1.75, fontSize: '1rem' }}
            >
              Submit Answer
            </Button>
          ) : (
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                startIcon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
                onClick={() => handleAI('ml')}
                sx={{ flex: 1, py: 1.25, fontSize: '0.8rem' }}
              >
                AI (ML)
              </Button>
              <Button
                variant="outlined"
                onClick={() => handleAI('en')}
                sx={{ py: 1.25, fontSize: '0.8rem', px: 2 }}
              >
                EN
              </Button>
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={handleNext}
                sx={{ flex: 1.5, py: 1.25 }}
              >
                {currentQ < questions.length - 1 ? 'Next' : 'Finish'}
              </Button>
            </Stack>
          )}
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
            background: '#161B22',
            border: '1px solid rgba(255,255,255,0.08)',
            p: 3, maxHeight: '70vh',
          }
        }}
      >
        <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.1)', mx: 'auto', mb: 3 }} />
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon sx={{ color: '#F59E0B', fontSize: 18 }} />
            <Typography sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 700, color: '#F0F4F8', fontSize: '0.95rem' }}>
              AI Explanation ({aiLang === 'ml' ? 'Malayalam' : 'English'})
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.5}>
            {(['en', 'ml'] as const).map(l => (
              <Button key={l} size="small" variant={aiLang === l ? 'contained' : 'outlined'} disabled={aiLoading} onClick={() => handleAI(l)} sx={{ fontSize: '0.7rem', py: 0.4, px: 1 }}>
                {l === 'en' ? 'EN' : 'ML'}
              </Button>
            ))}
          </Stack>
        </Stack>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 2 }} />
        {aiLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress color="warning" size={28} sx={{ mb: 1.5 }} />
            <Typography sx={{ color: '#8892A4', fontSize: '0.85rem' }}>Generating explanation...</Typography>
          </Box>
        ) : (
          <Box sx={{ overflowY: 'auto', maxHeight: '40vh', pr: 1 }}>
            <Typography sx={{ color: '#8892A4', lineHeight: 1.8, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
              {aiText || '...'}
            </Typography>
          </Box>
        )}
        <Button variant="contained" fullWidth onClick={() => setAiOpen(false)} sx={{ mt: 3, py: 1.5, background: 'linear-gradient(135deg, #D97706, #F59E0B)', color: '#000', fontWeight: 700 }}>
          Got it!
        </Button>
      </SwipeableDrawer>
    </Box>
  );
}

export default function QuizPage() {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress size={32} /></Box>}>
      <QuizContent />
    </Suspense>
  );
}