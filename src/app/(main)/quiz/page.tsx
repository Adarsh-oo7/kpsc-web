'use client';

import { useState, useMemo, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Box, Typography, Button, CircularProgress, Stack,
  LinearProgress, Chip, Alert, SwipeableDrawer, Divider, useTheme,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
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
import ReportQuestionButton from '@/components/ReportQuestionButton';

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
function ScoreGauge({ score, total }: { score: number; total: number }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const scorePercent = Math.max(0, Math.min(100, Math.round((score / total) * 100)));
  const [displayVal, setDisplayVal] = useState(0);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - displayVal / 100);

  useEffect(() => {
    let start = 0;
    const end = scorePercent;
    if (end === 0) {
      setDisplayVal(0);
      return;
    }
    const step = end / 60 || 1;
    const id = setInterval(() => {
      start = Math.min(start + step, end);
      setDisplayVal(start);
      if (start >= end) clearInterval(id);
    }, 20);
    return () => clearInterval(id);
  }, [scorePercent]);

  const color = scorePercent >= 70 ? '#22c55e' : scorePercent >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <Box sx={{ position: 'relative', width: 180, height: 180, mx: 'auto' }}>
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={radius} fill="none" stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"} strokeWidth="14" />
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
        <Typography sx={{ fontFamily: "'JetBrains Mono'", fontWeight: 900, fontSize: '2.4rem', color, lineHeight: 1 }}>
          {score.toFixed(2).replace(/\.00$/, '')}
        </Typography>
        <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', fontWeight: 700, mt: 0.5 }}>/ {total} MARKS</Typography>
      </Box>
    </Box>
  );
}

// ───────────────────────────────────────────────
// Results Screen
// ───────────────────────────────────────────────
function ResultsScreen({ resultData, answers, onRetry, originalQuestions }: { resultData: ResultData; answers: UserAnswers; onRetry: () => void; originalQuestions: Question[] }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const router = useRouter();
  const { results, questions: backendQuestions, timeTaken } = resultData;
  const scorePercent = Math.max(0, Math.min(100, Math.round((results.score / results.total) * 100)));
  const mins = Math.floor(timeTaken / 60);
  const secs = timeTaken % 60;

  // Create a map of backend questions for quick O(1) lookup of correct_answer and explanation
  const backendMap = useMemo(() => {
    const map: Record<number, Question> = {};
    if (backendQuestions) {
      backendQuestions.forEach((q: Question) => {
        map[q.id] = q;
      });
    }
    return map;
  }, [backendQuestions]);

  // Order questions based on originalQuestions to preserve the test sequence
  const orderedReviewQuestions = useMemo(() => {
    return originalQuestions.map((q: Question) => {
      const backendQ = backendMap[q.id];
      return {
        ...q,
        correct_answer: backendQ?.correct_answer || q.correct_answer,
        explanation: backendQ?.explanation || q.explanation,
      };
    });
  }, [originalQuestions, backendMap]);

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', py: 2 }}>
      {/* Score */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{ textAlign: 'center', mb: 4, p: 4, borderRadius: '24px', background: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
          <EmojiEventsIcon sx={{ fontSize: 40, color: '#F59E0B', mb: 1 }} />
          <Typography variant="h4" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, color: 'text.primary', mb: 3 }}>
            Quiz Complete!
          </Typography>
          <ScoreGauge score={results.score} total={results.total} />
          <Typography sx={{ color: 'text.secondary', mt: 2, fontSize: '0.875rem' }}>
            You beat {Math.max(0, Math.round(100 - scorePercent + 15))}% of students today
          </Typography>
        </Box>
      </motion.div>

      {/* Marking Details Alert */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Alert severity="info" variant="outlined" sx={{ mb: 3, borderRadius: '16px', borderColor: isDark ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.15)', bgcolor: 'rgba(59,130,246,0.02)' }}>
          <Typography variant="body2" sx={{ color: isDark ? '#93c5fd' : '#2563EB', fontSize: '0.85rem', lineHeight: 1.6 }}>
            <strong>Kerala PSC Marking System Applied:</strong><br />
            • Correct answers: <strong>+{results.correct} marks</strong> (+1.00 each)<br />
            • Incorrect answers: <strong>-{(results.wrong * 0.33).toFixed(2)} marks</strong> (-0.33 each)<br />
            • Skipped questions: <strong>0.00 marks</strong><br />
            • Net Score: <strong>{results.score.toFixed(2).replace(/\.00$/, '')} / {results.total} marks</strong>
          </Typography>
        </Alert>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5, mb: 3 }}>
          {[
            { label: 'Correct', val: results.correct, color: '#22c55e' },
            { label: 'Wrong', val: results.wrong, color: '#EF4444' },
            { label: 'Skipped', val: results.unanswered, color: 'text.secondary' },
            { label: 'Time', val: `${mins}m${secs}s`, color: '#3B82F6' },
          ].map(s => (
            <Box key={s.label} sx={{ p: 2, textAlign: 'center', borderRadius: '12px', background: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
              <Typography sx={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: '1.25rem', color: s.color === 'text.secondary' ? theme.palette.text.secondary : s.color }}>{s.val}</Typography>
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>{s.label}</Typography>
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
      <Typography sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, fontSize: '1.1rem', color: 'text.primary', mb: 2 }}>
        Review Your Answers
      </Typography>
      <Stack spacing={2}>
        {orderedReviewQuestions.map((q: Question, idx: number) => {
          const userAns = answers[q.id];
          const correct = userAns === q.correct_answer;
          return (
            <motion.div key={q.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <Box sx={{ p: 3, borderRadius: '16px', background: 'background.paper', border: `1px solid ${correct ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.15)'}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.9rem', lineHeight: 1.5, flex: 1, pr: 1 }}>
                    {idx + 1}. {q.text}
                  </Typography>
                  <ReportQuestionButton questionId={q.id} questionText={q.text} />
                </Box>
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
                        <Typography sx={{ fontSize: '0.8rem', color: isCorrectOpt ? (isDark ? '#86efac' : '#145228') : isUserAns ? (isDark ? '#fca5a5' : '#EF4444') : 'text.secondary' }}>
                          <strong>{key}.</strong> {val}
                          {isUserAns && (
                            <Box component="span" sx={{ ml: 1, fontWeight: 700, fontSize: '0.75rem', color: isCorrectOpt ? '#22c55e' : '#EF4444' }}>
                              (Your Answer)
                            </Box>
                          )}
                        </Typography>
                        {isCorrectOpt && <CheckCircleIcon sx={{ fontSize: 16, color: '#22c55e' }} />}
                        {isUserAns && !isCorrectOpt && <CancelIcon sx={{ fontSize: 16, color: '#EF4444' }} />}
                      </Box>
                    );
                  })}
                </Stack>
                {!userAns && <Alert severity="warning" sx={{ mt: 1.5, py: 0 }}>Not answered</Alert>}
                {q.explanation && (
                  <Box sx={{ mt: 1.5, p: 1.5, borderRadius: '8px', background: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.04)', border: '1px solid', borderColor: 'divider' }}>
                    <Typography sx={{ fontSize: '0.8rem', color: isDark ? '#93c5fd' : '#1E40AF', lineHeight: 1.6 }}>
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
  const { fetcher, user, profile, isLoading: ctxLoading, refreshProfile } = useAppContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    if (!ctxLoading && !user) router.push('/login');
  }, [user, ctxLoading, router]);

  const [answers, setAnswers] = useState<UserAnswers>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [isFinished, setIsFinished] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ml'>('en');

  // Initialize language from user preferred language
  useEffect(() => {
    if (profile?.preferred_language) {
      setLanguage(profile.preferred_language as 'en' | 'ml');
    }
  }, [profile?.preferred_language]);

  // Reset quiz progress when language is changed
  useEffect(() => {
    setAnswers({});
    setCurrentQ(0);
    setIsFinished(false);
    setResultData(null);
    setSelectedOption('');
    setIsAnswered(false);
    setHasInitializedTime(false);
  }, [language]);

  const examId = searchParams.get('exam_id');
  const topicId = searchParams.get('topic_id');
  const limitParam = searchParams.get('limit');
  const currentAffairsParam = searchParams.get('current_affairs');

  const isWeeklyCurrentAffairs = currentAffairsParam === 'weekly';
  const isMockExam = !!examId && !limitParam;
  const isPracticeQuiz = !!examId && !!limitParam;
  const isTopicPractice = !!topicId;
  const isDailyQuiz = !examId && !topicId && !isWeeklyCurrentAffairs;

  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [hasInitializedTime, setHasInitializedTime] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLang, setAiLang] = useState<'en' | 'ml'>('en');
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const apiUrl = useMemo(() => {
    if (isMockExam) {
      return `/generate-mock-exam/${examId}/?language=${language}`;
    }
    if (isPracticeQuiz) {
      return `/questions/?exam_id=${examId}&limit=${limitParam}&language=${language}`;
    }
    if (isTopicPractice) {
      return `/questions/?topic_id=${topicId}&limit=${limitParam || '15'}&language=${language}`;
    }
    if (isWeeklyCurrentAffairs) {
      return `/questions/weekly-current-affairs/?language=${language}`;
    }
    return `/questions/daily-quiz/?limit=10&language=${language}`;
  }, [isMockExam, isPracticeQuiz, isTopicPractice, isWeeklyCurrentAffairs, examId, topicId, limitParam, language]);

  const { data: rawQuizData, error, isLoading } = useSWR(apiUrl, fetcher, { revalidateOnFocus: false });

  const questions = useMemo(() => {
    if (!rawQuizData) return [];
    if (isMockExam) {
      return (rawQuizData.questions || []) as Question[];
    }
    return rawQuizData as Question[];
  }, [rawQuizData, isMockExam]);

  const examDuration = useMemo(() => {
    if (isMockExam && rawQuizData && rawQuizData.duration_minutes) {
      return rawQuizData.duration_minutes * 60;
    }
    if (isWeeklyCurrentAffairs) {
      return 15 * 60; // 15 minutes for weekly current affairs quiz
    }
    if (isDailyQuiz) {
      return 10 * 60; // 10 minutes for daily quiz
    }
    return 15 * 60; // 15 minutes default for practice
  }, [rawQuizData, isMockExam, isDailyQuiz, isWeeklyCurrentAffairs]);

  const quizTitle = useMemo(() => {
    if (isMockExam && rawQuizData && rawQuizData.exam_name) {
      return rawQuizData.exam_name;
    }
    if (isPracticeQuiz && questions.length > 0) {
      return "Practice Quiz";
    }
    if (isTopicPractice && questions.length > 0 && questions[0]?.topic?.name) {
      return `${questions[0].topic.name} Practice`;
    }
    if (isWeeklyCurrentAffairs) {
      return "Weekly Current Affairs Quiz";
    }
    return "Daily Quiz";
  }, [isMockExam, isPracticeQuiz, isTopicPractice, isWeeklyCurrentAffairs, rawQuizData, questions]);

  useEffect(() => {
    if (rawQuizData && !hasInitializedTime) {
      setTimeLeft(examDuration);
      setHasInitializedTime(true);
    }
  }, [rawQuizData, examDuration, hasInitializedTime]);

  // Reset answer when question changes
  useEffect(() => { setSelectedOption(''); setIsAnswered(false); }, [currentQ]);

  const handleFinish = useCallback(async (autoSubmit = false) => {
    if (isFinished) return;
    if (!autoSubmit) {
      setShowConfirm(true);
      return;
    }
    setIsSubmitting(true);
    const timeTaken = examDuration - timeLeft;
    try {
      const res = await apiClient.post('/submit-exam/', {
        answers,
        question_ids: questions?.map((q: Question) => q.id) || [],
      });
      setResultData({ ...res.data, timeTaken });
      setIsFinished(true);
      if (refreshProfile) {
        refreshProfile().catch(err => console.error("Error refreshing profile:", err));
      }
    } catch {
      alert('Error submitting quiz.');
      setIsSubmitting(false);
    }
  }, [answers, timeLeft, isFinished, questions, examDuration]);

  // Timer
  useEffect(() => {
    if (isLoading || isFinished || !hasInitializedTime) return;
    if (timeLeft <= 0) { handleFinish(true); return; }
    const id = setInterval(() => setTimeLeft(t => t > 0 ? t - 1 : 0), 1000);
    return () => clearInterval(id);
  }, [isLoading, isFinished, timeLeft, handleFinish, hasInitializedTime]);

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
    if (isMockExam) {
      const currentQuestion = questions[currentQ];
      if (!currentQuestion) return;
      setAnswers(prev => {
        const next = { ...prev };
        if (next[currentQuestion.id] === key) {
          delete next[currentQuestion.id];
        } else {
          next[currentQuestion.id] = key;
        }
        return next;
      });
      return;
    }
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
  if (!apiUrl) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography sx={{ color: '#8892A4', mb: 3 }}>Select an exam or topic to start a quiz.</Typography>
        <Button variant="contained" onClick={() => router.push('/exams')}>Choose Exam</Button>
      </Box>
    );
  }

  if (questions && questions.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography sx={{ color: '#8892A4', mb: 3 }}>No questions available for this exam or topic.</Typography>
        <Button variant="contained" onClick={() => router.push('/exams')}>Choose Another Exam</Button>
      </Box>
    );
  }

  if (isFinished && resultData) {
    return <ResultsScreen resultData={resultData} answers={answers} onRetry={() => { setAnswers({}); setCurrentQ(0); setIsFinished(false); setResultData(null); setTimeLeft(examDuration); setHasInitializedTime(false); }} originalQuestions={questions} />;
  }

  // ── Pre-quiz screen ──
  if (!questions) return null;

  const q = questions[currentQ];
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = ((currentQ) / questions.length) * 100;
  const timerColor = timeLeft < 60 ? '#EF4444' : timeLeft < 300 ? '#F59E0B' : '#2E8B57';

  const getOptionStyle = (key: string) => {
    if (isMockExam) {
      const isSelected = answers[q.id] === key;
      return {
        border: `2px solid ${isSelected ? '#2E8B57' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')}`,
        background: isSelected ? 'rgba(27,107,58,0.15)' : (isDark ? '#1C2230' : '#F1F5F9'),
      };
    }
    if (!isAnswered) return {
      border: `2px solid ${selectedOption === key ? '#2E8B57' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')}`,
      background: selectedOption === key ? 'rgba(27,107,58,0.15)' : (isDark ? '#1C2230' : '#F1F5F9'),
    };
    if (key === q.correct_answer) return { border: '2px solid #22c55e', background: 'rgba(34,197,94,0.1)', animation: 'correctPulse 0.6s ease' };
    if (key === selectedOption) return { border: '2px solid #EF4444', background: 'rgba(239,68,68,0.1)', animation: 'shakeWrong 0.5s ease' };
    return { border: isDark ? '2px solid rgba(255,255,255,0.04)' : '2px solid rgba(0,0,0,0.04)', background: isDark ? '#1C2230' : '#F1F5F9', opacity: 0.55 };
  };

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto' }}>
      {/* Sticky Quiz Bar */}
      <Box sx={{
        position: 'sticky', top: 64, zIndex: 10, mb: 3,
        p: 2, borderRadius: '16px',
        background: isDark ? 'rgba(22, 27, 34, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(16px)',
        border: '1px solid', borderColor: 'divider',
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)',
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, flexWrap: 'wrap', gap: 1 }}>
          <Stack spacing={0.25}>
            <Typography sx={{ fontSize: '0.9rem', color: 'text.primary', fontWeight: 800 }}>
              {quizTitle}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}>
              Question {currentQ + 1} of {questions.length}
            </Typography>
          </Stack>
          
          <Box sx={{ display: 'flex', gap: 0.5, border: '1px solid', borderColor: 'divider', borderRadius: '10px', p: 0.25 }}>
            <Button
              size="small"
              onClick={() => setLanguage('en')}
              sx={{
                fontSize: '0.65rem',
                py: 0.25,
                px: 1,
                borderRadius: '8px',
                bgcolor: language === 'en' ? 'rgba(46, 139, 87, 0.15)' : 'transparent',
                color: language === 'en' ? '#2E8B57' : 'text.secondary',
                fontWeight: 700,
                textTransform: 'none',
                minWidth: 40,
                height: 24,
                '&:hover': { bgcolor: language === 'en' ? 'rgba(46, 139, 87, 0.25)' : 'action.hover' }
              }}
            >
              EN
            </Button>
            <Button
              size="small"
              onClick={() => setLanguage('ml')}
              sx={{
                fontSize: '0.65rem',
                py: 0.25,
                px: 1,
                borderRadius: '8px',
                bgcolor: language === 'ml' ? 'rgba(46, 139, 87, 0.15)' : 'transparent',
                color: language === 'ml' ? '#2E8B57' : 'text.secondary',
                fontWeight: 700,
                textTransform: 'none',
                minWidth: 40,
                height: 24,
                '&:hover': { bgcolor: language === 'ml' ? 'rgba(46, 139, 87, 0.25)' : 'action.hover' }
              }}
            >
              മലയാളം
            </Button>
          </Box>
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
            onClick={() => handleFinish(false)}
            disabled={isSubmitting}
            sx={{ fontSize: '0.75rem', py: 0.4, px: 1.5, color: '#EF4444', borderColor: 'rgba(239,68,68,0.4)' }}
          >
            Finish
          </Button>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 4, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #1B6B3A, #2E8B57)', borderRadius: 2 } }}
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
          <Box sx={{ borderRadius: '20px', background: 'background.paper', border: '1px solid', borderColor: 'divider', p: 3, mb: 3 }}>
            {/* Tags + Report button */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                {q.topic?.name && (
                  <Chip label={q.topic.name} size="small"
                    sx={{ background: 'rgba(27,107,58,0.15)', border: '1px solid rgba(46,139,87,0.2)', color: '#2E8B57', fontWeight: 600, fontSize: '0.7rem' }}
                  />
                )}
                {q.difficulty && (
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: difficultyColor[q.difficulty] || '#F59E0B', alignSelf: 'center' }} />
                )}
              </Box>
              {/* Report button — visible always so user can flag before answering */}
              <ReportQuestionButton questionId={q.id} questionText={q.text} />
            </Box>

            {/* Question text */}
            <Typography sx={{ fontWeight: 600, fontSize: '1.05rem', color: 'text.primary', lineHeight: 1.6, mb: 3 }}>
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
                    cursor: isMockExam ? 'pointer' : (isAnswered ? 'default' : 'pointer'),
                    transition: 'all 0.2s ease',
                    userSelect: 'none',
                    ...getOptionStyle(key),
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                      width: 28, height: 28, borderRadius: '8px', flexShrink: 0,
                      background: (isMockExam ? answers[q.id] === key : selectedOption === key && !isAnswered) ? 'rgba(46,139,87,0.2)' : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: '0.8rem',
                      color: (isMockExam ? answers[q.id] === key : selectedOption === key && !isAnswered) ? '#2E8B57' : 'text.secondary',
                    }}>
                      {key}
                    </Box>
                    <Typography sx={{ fontSize: '0.9rem', color: 'text.primary', lineHeight: 1.4 }}>{val as string}</Typography>
                  </Box>
                  {isAnswered && key === q.correct_answer && <CheckCircleIcon sx={{ fontSize: 20, color: '#22c55e', flexShrink: 0 }} />}
                  {isAnswered && key === selectedOption && key !== q.correct_answer && <CancelIcon sx={{ fontSize: 20, color: '#EF4444', flexShrink: 0 }} />}
                </Box>
              ))}
            </Stack>

            {/* Inline explanation after answering */}
            {isAnswered && q.explanation && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Box sx={{
                  mt: 2.5, p: 2, borderRadius: '10px',
                  background: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.04)',
                  border: '1px solid', borderColor: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.1)'
                }}>
                  <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#60a5fa' : '#1e40af', mb: 0.5, letterSpacing: '0.04em' }}>
                    EXPLANATION
                  </Typography>
                  <Typography sx={{ fontSize: '0.875rem', color: isDark ? '#93c5fd' : '#1e3a8a', lineHeight: 1.7 }}>
                    {q.explanation}
                  </Typography>
                </Box>
              </motion.div>
            )}
          </Box>

          {/* Action buttons */}
          {isMockExam ? (
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                disabled={currentQ === 0}
                onClick={() => setCurrentQ(prev => prev - 1)}
                sx={{ flex: 1, py: 1.5, fontSize: '0.9rem', color: 'text.secondary', borderColor: 'divider', '&:hover': { borderColor: 'text.secondary' } }}
              >
                Previous
              </Button>
              {answers[q.id] && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setAnswers(prev => {
                      const next = { ...prev };
                      delete next[q.id];
                      return next;
                    });
                  }}
                  sx={{ py: 1.5, fontSize: '0.9rem', px: 2, color: '#EF4444', borderColor: 'rgba(239,68,68,0.2)', '&:hover': { borderColor: 'rgba(239,68,68,0.4)', bgcolor: 'rgba(239,68,68,0.04)' } }}
                >
                  Clear
                </Button>
              )}
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{ flex: 1.5, py: 1.5, fontSize: '0.9rem' }}
              >
                {currentQ < questions.length - 1 ? (answers[q.id] ? 'Next' : 'Skip') : 'Finish Test'}
              </Button>
            </Stack>
          ) : !isAnswered ? (
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

      {/* Clickable 10-column Grid representing questions 1 to questions.length */}
      {isMockExam && (
        <Box sx={{ mt: 4, p: 3, borderRadius: '20px', background: 'background.paper', border: '1px solid', borderColor: 'divider', boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.06)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, fontSize: '1rem', color: 'text.primary' }}>
              Exam Navigation Grid
            </Typography>
            <Chip
              label={`${Object.keys(answers).length} / ${questions.length} Answered`}
              size="small"
              sx={{ bgcolor: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: isDark ? '#22c55e' : '#145228', fontWeight: 700 }}
            />
          </Box>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(10, 1fr)',
            gap: 1.25,
            maxHeight: 250,
            overflowY: 'auto',
            pr: 0.5,
            // Custom scrollbar
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-track': { background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' },
            '&::-webkit-scrollbar-thumb': { background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', borderRadius: '4px' },
          }}>
            {questions.map((question, idx) => {
              const isSelected = currentQ === idx;
              const isAnswered = answers[question.id] !== undefined;
              
              let bgColor = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
              let border = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)';
              let color = theme.palette.text.secondary;
              
              if (isSelected) {
                bgColor = 'rgba(59, 130, 246, 0.15)';
                border = '2px solid #3b82f6';
                color = isDark ? '#fff' : '#1e3a8a';
              } else if (isAnswered) {
                bgColor = 'rgba(34, 197, 94, 0.15)';
                border = '1px solid rgba(34, 197, 94, 0.4)';
                color = isDark ? '#22c55e' : '#1b6b3a';
              }
              
              return (
                <Box
                  key={question.id}
                  onClick={() => setCurrentQ(idx)}
                  sx={{
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    fontFamily: "'JetBrains Mono'",
                    background: bgColor,
                    border: border,
                    color: color,
                    transition: 'all 0.15s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.08)',
                      background: isSelected ? 'rgba(59, 130, 246, 0.25)' : isAnswered ? 'rgba(34, 197, 94, 0.25)' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
                      borderColor: isSelected ? '#3b82f6' : isAnswered ? '#22c55e' : (isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'),
                    }
                  }}
                >
                  {idx + 1}
                </Box>
              );
            })}
          </Box>
          <Stack direction="row" spacing={2} sx={{ mt: 2.5, justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.4)' }} />
              <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', fontWeight: 600 }}>Answered</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: 'rgba(59, 130, 246, 0.15)', border: '2px solid #3b82f6' }} />
              <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', fontWeight: 600 }}>Current</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', border: '1px solid', borderColor: 'divider' }} />
              <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', fontWeight: 600 }}>Unanswered</Typography>
            </Box>
          </Stack>
        </Box>
      )}

      {/* AI Explanation Drawer */}
      <SwipeableDrawer
        anchor="bottom"
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        onOpen={() => setAiOpen(true)}
        sx={{
          '& .MuiDrawer-paper': {
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            background: 'background.paper',
            border: '1px solid', borderColor: 'divider',
            p: 3, maxHeight: '70vh',
          }
        }}
      >
        <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', mx: 'auto', mb: 3 }} />
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon sx={{ color: '#F59E0B', fontSize: 18 }} />
            <Typography sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 700, color: 'text.primary', fontSize: '0.95rem' }}>
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
        <Divider sx={{ mb: 2 }} />
        {aiLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress color="warning" size={28} sx={{ mb: 1.5 }} />
            <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>Generating explanation...</Typography>
          </Box>
        ) : (
          <Box sx={{ overflowY: 'auto', maxHeight: '40vh', pr: 1 }}>
            <Typography sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
              {aiText || '...'}
            </Typography>
          </Box>
        )}
        <Button variant="contained" fullWidth onClick={() => setAiOpen(false)} sx={{ mt: 3, py: 1.5, background: 'linear-gradient(135deg, #D97706, #F59E0B)', color: '#000', fontWeight: 700 }}>
          Got it!
        </Button>
      </SwipeableDrawer>

      {/* Confirmation Dialog */}
      <Dialog 
        open={showConfirm} 
        onClose={() => setShowConfirm(false)}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            border: '1px solid',
            borderColor: 'divider',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Submit Test?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
            Are you sure you want to finish and submit your test?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowConfirm(false)} sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button 
            onClick={() => { setShowConfirm(false); handleFinish(true); }} 
            variant="contained"
            color="success"
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px', px: 3 }}
            autoFocus
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
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