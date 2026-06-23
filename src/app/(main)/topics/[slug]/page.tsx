'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Box, Typography, Grid, Card, CardContent, Button, CircularProgress,
  Stack, LinearProgress, Chip, Alert, SwipeableDrawer, Divider,
  FormControl, InputLabel, Select, MenuItem, useTheme, Tooltip
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';

// Icon imports
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import PublicIcon from '@mui/icons-material/Public';
import ScienceIcon from '@mui/icons-material/Science';
import GavelIcon from '@mui/icons-material/Gavel';
import CalculateIcon from '@mui/icons-material/Calculate';
import TranslateIcon from '@mui/icons-material/Translate';
import CategoryIcon from '@mui/icons-material/Category';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import BarChartIcon from '@mui/icons-material/BarChart';
import TimerIcon from '@mui/icons-material/Timer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

// Define gradients matching topics list
const gradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
];

const getTopicVisuals = (topicName: string) => {
  const lowerCaseName = topicName.toLowerCase();
  const iconSize = { fontSize: 48 };
  let icon = <CategoryIcon sx={iconSize} />;

  if (lowerCaseName.includes('history')) icon = <HistoryEduIcon sx={iconSize} />;
  else if (lowerCaseName.includes('geography')) icon = <PublicIcon sx={iconSize} />;
  else if (lowerCaseName.includes('science')) icon = <ScienceIcon sx={iconSize} />;
  else if (lowerCaseName.includes('polity')) icon = <GavelIcon sx={iconSize} />;
  else if (lowerCaseName.includes('math')) icon = <CalculateIcon sx={iconSize} />;
  else if (lowerCaseName.includes('english')) icon = <TranslateIcon sx={iconSize} />;

  const hash = topicName.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0);
  const gradient = gradients[Math.abs(hash) % gradients.length];

  return { icon, gradient };
};

// Accuracy radial progress gauge component
function TopicAccuracyGauge({ accuracy }: { accuracy: number }) {
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - accuracy / 100);
  const color = accuracy >= 70 ? '#22c55e' : accuracy >= 50 ? '#F59E0B' : accuracy > 0 ? '#EF4444' : '#4A5568';

  return (
    <Box sx={{ position: 'relative', width: 150, height: 150, mx: 'auto' }}>
      <svg width="150" height="150" viewBox="0 0 150 150">
        <circle cx="75" cy="75" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle
          cx="75" cy="75" r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: '75px 75px', transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </svg>
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ fontFamily: "'JetBrains Mono'", fontWeight: 900, fontSize: '2.2rem', color, lineHeight: 1 }}>
          {Math.round(accuracy)}%
        </Typography>
        <Typography sx={{ fontSize: '0.65rem', color: '#8892A4', fontWeight: 650, mt: 0.5 }}>ACCURACY</Typography>
      </Box>
    </Box>
  );
}

export default function TopicStudyPage() {
  const { slug } = useParams() as { slug: string };
  const { user, fetcher, isLoading: ctxLoading } = useAppContext();
  const router = useRouter();

  // Redirect to login if user profile context not loaded
  useEffect(() => {
    if (!ctxLoading && !user) router.push('/login');
  }, [user, ctxLoading, router]);

  // SWR fetching
  const { data: topics } = useSWR(user ? '/topics/' : null, fetcher);
  const { data: summaryData, mutate: mutateSummary } = useSWR(user ? '/analytics/topic-summary/' : null, fetcher);

  // Active state controller
  const [studyState, setStudyState] = useState<'dashboard' | 'practice' | 'results'>('dashboard');

  // Practice session configuration
  const [practiceCount, setPracticeCount] = useState(10);
  const [practiceDifficulty, setPracticeDifficulty] = useState<'easy' | 'medium' | 'hard' | ''>('');

  // Active quiz state variables
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState('');
  const [answeredMap, setAnsweredMap] = useState<{ [key: number]: { selected: string; timeSpent: number } }>({});
  const [isIdxAnswered, setIsIdxAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionXpEarned, setSessionXpEarned] = useState(0);
  const [sessionScorePercent, setSessionScorePercent] = useState(0);
  const [resultsList, setResultsList] = useState<any[]>([]);
  const [isStartingSession, setIsStartingSession] = useState(false);

  // AI Explanation drawer state
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLang, setAiLang] = useState<'en' | 'ml'>('en');
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Timers
  const totalTimeRef = useRef(0);
  const questionStartRef = useRef<number>(0);

  // Locate current topic metadata
  const currentTopic = useMemo(() => {
    if (!topics) return null;
    return topics.find((t: any) => t.slug === slug);
  }, [topics, slug]);

  // Locate current topic summary analytics
  const topicSummary = useMemo(() => {
    if (!summaryData) return null;
    return summaryData.find((s: any) => s.topic_slug === slug) || {
      topic_name: currentTopic?.name || '',
      topic_slug: slug,
      accuracy: 0.0,
      easy_accuracy: 0.0,
      medium_accuracy: 0.0,
      hard_accuracy: 0.0,
      total_attempted: 0,
      last_practiced: null
    };
  }, [summaryData, slug, currentTopic]);

  // Start question timer on mount / idx change
  useEffect(() => {
    if (studyState === 'practice') {
      questionStartRef.current = Date.now();
    }
  }, [currentIdx, studyState]);

  // Global session timer ticker
  useEffect(() => {
    let intervalId: any;
    if (studyState === 'practice') {
      intervalId = setInterval(() => {
        setTimeLeft(t => t + 1);
        totalTimeRef.current += 1;
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [studyState]);

  const handleStartPractice = async () => {
    setIsStartingSession(true);
    try {
      const res = await apiClient.post('/practice/start/', {
        topic_slug: slug,
        difficulty: practiceDifficulty,
        count: practiceCount,
        session_type: 'topic'
      });
      
      setSessionId(res.data.session_id);
      setQuestions(res.data.questions || []);
      setCurrentIdx(0);
      setAnsweredMap({});
      setSelectedOpt('');
      setIsIdxAnswered(false);
      setTimeLeft(0);
      totalTimeRef.current = 0;
      setStudyState('practice');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to start practice session.');
    } finally {
      setIsStartingSession(false);
    }
  };

  const handleSelectOption = (opt: string) => {
    if (isIdxAnswered) return;
    setSelectedOpt(opt);
  };

  const handleSubmitQuestion = () => {
    if (!selectedOpt || isIdxAnswered) return;

    const currentQ = questions[currentIdx];
    const timeSpent = Math.round((Date.now() - questionStartRef.current) / 1000);

    setAnsweredMap(prev => ({
      ...prev,
      [currentQ.id]: { selected: selectedOpt, timeSpent }
    }));
    setIsIdxAnswered(true);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOpt('');
      setIsIdxAnswered(false);
    } else {
      submitPracticeSession();
    }
  };

  const submitPracticeSession = async () => {
    if (!sessionId) return;
    setIsStartingSession(true);

    const answersPayload = Object.entries(answeredMap).map(([qId, data]) => ({
      question_id: parseInt(qId),
      selected_option: data.selected,
      time_spent_secs: data.timeSpent
    }));

    try {
      const res = await apiClient.post(`/practice/${sessionId}/submit/`, {
        answers: answersPayload,
        total_time_secs: totalTimeRef.current
      });

      setSessionXpEarned(res.data.xp_earned || 0);
      setSessionScorePercent(res.data.score_percent || 0);
      setResultsList(res.data.results || []);
      setStudyState('results');
    } catch (err) {
      console.error(err);
      alert('Failed to submit practice session.');
    } finally {
      setIsStartingSession(false);
    }
  };

  const handleFinishSession = () => {
    mutateSummary(); // Refresh dashboard data SWR cache
    setStudyState('dashboard');
  };

  const handleAI = async (lang: 'en' | 'ml') => {
    setAiLang(lang);
    setAiOpen(true);
    setAiLoading(true);
    setAiText('');
    const q = questions[currentIdx];
    if (!q) return;

    try {
      const res = await apiClient.get(`/questions/${q.id}/explanation/?lang=${lang}`);
      setAiText(res.data.explanation);
    } catch {
      setAiText('Failed to generate AI explanation fallback.');
    } finally {
      setAiLoading(false);
    }
  };

  if (ctxLoading || !topicSummary || !currentTopic) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={32} sx={{ color: '#2E8B57' }} />
      </Box>
    );
  }

  const { icon, gradient } = getTopicVisuals(currentTopic.name);

  return (
    <Box sx={{ maxWidth: 850, mx: 'auto', pb: 8, px: 2 }}>
      
      {/* ───────────────────────────────────────────────
          1. DASHBOARD VIEW
          ─────────────────────────────────────────────── */}
      {studyState === 'dashboard' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {/* Header Banner */}
          <Card sx={{
            background: gradient,
            borderRadius: '24px',
            color: 'white',
            mb: 4,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
          }}>
            <CardContent sx={{ p: { xs: 4, md: 5 }, position: 'relative' }}>
              <Stack direction="row" spacing={3} alignItems="center">
                <Box sx={{
                  bgcolor: 'rgba(255,255,255,0.15)',
                  p: 2, borderRadius: '18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  {icon}
                </Box>
                <Box>
                  <Typography sx={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 900, letterSpacing: '0.15em', opacity: 0.85 }}>
                    TOPIC DASHBOARD
                  </Typography>
                  <Typography variant="h3" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 950, letterSpacing: '-0.02em', mt: 0.5, fontSize: { xs: '2rem', md: '2.8rem' } }}>
                    {topicSummary.topic_name}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Grid container spacing={3}>
            {/* Left Column - Gauge and Info */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Card sx={{ background: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '20px', height: '100%' }}>
                <CardContent sx={{ p: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                  <TopicAccuracyGauge accuracy={topicSummary.accuracy} />
                  
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', my: 3 }} />

                  <Stack spacing={2} sx={{ textAlign: 'left' }}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ color: '#8892A4', fontSize: '0.85rem' }}>Questions Solved</Typography>
                      <Typography sx={{ color: '#F0F4F8', fontWeight: 750, fontSize: '0.85rem', fontFamily: "'JetBrains Mono'" }}>{topicSummary.total_attempted}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography sx={{ color: '#8892A4', fontSize: '0.85rem' }}>Last Practiced</Typography>
                      <Typography sx={{ color: '#F0F4F8', fontWeight: 700, fontSize: '0.85rem' }}>
                        {topicSummary.last_practiced 
                          ? new Date(topicSummary.last_practiced).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'Never'}
                      </Typography>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Right Column - Difficulty Bars */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Card sx={{ background: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '20px', height: '100%' }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="subtitle2" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, color: '#F0F4F8', mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <BarChartIcon sx={{ color: '#2E8B57' }} /> Difficulty Analysis
                  </Typography>

                  <Stack spacing={4.5}>
                    {[
                      { label: 'Easy Level', acc: topicSummary.easy_accuracy, color: '#22c55e' },
                      { label: 'Medium Level', acc: topicSummary.medium_accuracy, color: '#F59E0B' },
                      { label: 'Hard Level', acc: topicSummary.hard_accuracy, color: '#EF4444' }
                    ].map((row, idx) => (
                      <Box key={idx}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#D0D8E0' }}>{row.label}</Typography>
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 800, color: row.color, fontFamily: "'JetBrains Mono'" }}>{Math.round(row.acc)}%</Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={row.acc || 0}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'rgba(255,255,255,0.04)',
                            '& .MuiLinearProgress-bar': {
                              background: row.color,
                              borderRadius: 4
                            }
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Bottom - Practice Config & Launch Card */}
            <Grid size={12}>
              <Card sx={{ background: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '20px', mt: 1 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="subtitle2" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, color: '#F0F4F8', mb: 3 }}>
                    Structured Study Practice
                  </Typography>

                  <Grid container spacing={3} alignItems="center">
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FormControl fullWidth sx={{
                        '& .MuiInputLabel-root': { color: '#8892A4' },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                          '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                          '&.Mui-focused fieldset': { borderColor: '#2E8B57' },
                        },
                        bgcolor: 'rgba(255,255,255,0.01)',
                        borderRadius: '12px'
                      }}>
                        <InputLabel id="count-label">Question Count</InputLabel>
                        <Select
                          labelId="count-label"
                          value={practiceCount}
                          onChange={(e) => setPracticeCount(e.target.value as number)}
                          sx={{ color: '#F0F4F8' }}
                          label="Question Count"
                        >
                          <MenuItem value={5}>5 Questions</MenuItem>
                          <MenuItem value={10}>10 Questions</MenuItem>
                          <MenuItem value={15}>15 Questions</MenuItem>
                          <MenuItem value={20}>20 Questions</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <FormControl fullWidth sx={{
                        '& .MuiInputLabel-root': { color: '#8892A4' },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                          '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                          '&.Mui-focused fieldset': { borderColor: '#2E8B57' },
                        },
                        bgcolor: 'rgba(255,255,255,0.01)',
                        borderRadius: '12px'
                      }}>
                        <InputLabel id="difficulty-label">Difficulty Filter</InputLabel>
                        <Select
                          labelId="difficulty-label"
                          value={practiceDifficulty}
                          onChange={(e) => setPracticeDifficulty(e.target.value as any)}
                          sx={{ color: '#F0F4F8' }}
                          label="Difficulty Filter"
                        >
                          <MenuItem value="">Mixed Difficulty</MenuItem>
                          <MenuItem value="easy">Easy Level</MenuItem>
                          <MenuItem value="medium">Medium Level</MenuItem>
                          <MenuItem value="hard">Hard Level</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={handleStartPractice}
                        disabled={isStartingSession}
                        startIcon={<PlayArrowIcon />}
                        sx={{
                          background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
                          textTransform: 'none',
                          fontWeight: 750,
                          borderRadius: '12px',
                          py: 1.6,
                          fontSize: '0.95rem'
                        }}
                      >
                        {isStartingSession ? <CircularProgress size={20} color="inherit" /> : 'Start Study Session'}
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </motion.div>
      )}

      {/* ───────────────────────────────────────────────
          2. PRACTICE SESSION ACTIVE RUNNER
          ─────────────────────────────────────────────── */}
      {studyState === 'practice' && questions.length > 0 && (
        <Box sx={{ maxWidth: 640, mx: 'auto' }}>
          {/* Sticky Header Bar */}
          <Box sx={{
            position: 'sticky', top: 64, zIndex: 10, mb: 3,
            p: 2, borderRadius: '16px',
            background: 'rgba(22, 27, 34, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid', borderColor: 'divider',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography sx={{ fontSize: '0.8rem', color: '#8892A4', fontWeight: 600 }}>
                Question {currentIdx + 1} of {questions.length}
              </Typography>
              
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{
                  px: 1.5, py: 0.4, borderRadius: '16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid', borderColor: 'divider'
                }}>
                  <TimerIcon sx={{ fontSize: 14, color: '#8892A4' }} />
                  <Typography sx={{ fontFamily: "'JetBrains Mono'", fontSize: '0.8rem', fontWeight: 700, color: '#D0D8E0' }}>
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </Typography>
                </Stack>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    if (window.confirm('Quit study session? Answers will not be saved.')) {
                      setStudyState('dashboard');
                    }
                  }}
                  sx={{ color: '#EF4444', borderColor: 'rgba(239,68,68,0.4)', textTransform: 'none', py: 0.3, fontSize: '0.75rem' }}
                >
                  Quit
                </Button>
              </Stack>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={((currentIdx) / questions.length) * 100}
              sx={{ height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.06)', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #1B6B3A, #2E8B57)', borderRadius: 2 } }}
            />
          </Box>

          {/* Question Display Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIdx}
              initial={{ opacity: 0, x: 25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.2 }}
            >
              <Card sx={{ background: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '20px', p: 3, mb: 3 }}>
                <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={questions[currentIdx].difficulty?.toUpperCase() || 'MIXED'}
                    size="small"
                    sx={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      bgcolor: questions[currentIdx].difficulty === 'easy' ? 'rgba(34,197,94,0.1)' : questions[currentIdx].difficulty === 'hard' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                      color: questions[currentIdx].difficulty === 'easy' ? '#22c55e' : questions[currentIdx].difficulty === 'hard' ? '#EF4444' : '#F59E0B',
                      border: '1px solid transparent'
                    }}
                  />
                </Stack>

                <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#F0F4F8', lineHeight: 1.6, mb: 3 }}>
                  {questions[currentIdx].text}
                </Typography>

                {/* Option list */}
                <Stack spacing={1.25}>
                  {Object.entries(questions[currentIdx].options).map(([key, val]) => {
                    const isCorrect = key === questions[currentIdx].correct_answer;
                    const isSelected = key === selectedOpt;
                    let borderStyle = '1px solid rgba(255,255,255,0.08)';
                    let bgStyle = '#1C2230';

                    if (isIdxAnswered) {
                      if (isCorrect) {
                        borderStyle = '1px solid #22c55e';
                        bgStyle = 'rgba(34,197,94,0.08)';
                      } else if (isSelected) {
                        borderStyle = '1px solid #EF4444';
                        bgStyle = 'rgba(239,68,68,0.08)';
                      } else {
                        bgStyle = '#161B22';
                        borderStyle = '1px solid rgba(255,255,255,0.03)';
                      }
                    } else if (isSelected) {
                      borderStyle = '1px solid #2E8B57';
                      bgStyle = 'rgba(27,107,58,0.1)';
                    }

                    return (
                      <Box
                        key={key}
                        onClick={() => handleSelectOption(key)}
                        sx={{
                          p: 2,
                          borderRadius: '12px',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          cursor: isIdxAnswered ? 'default' : 'pointer',
                          transition: 'all 0.15s ease',
                          border: borderStyle,
                          bgcolor: bgStyle,
                          '&:hover': {
                            border: isIdxAnswered ? borderStyle : '1px solid rgba(255,255,255,0.15)'
                          }
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box sx={{
                            width: 28, height: 28, borderRadius: '8px',
                            bgcolor: isSelected ? 'rgba(46,139,87,0.2)' : 'rgba(255,255,255,0.04)',
                            color: isSelected ? '#2E8B57' : '#8892A4',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: "'JetBrains Mono'", fontWeight: 800, fontSize: '0.8rem'
                          }}>
                            {key}
                          </Box>
                           <Typography sx={{ fontSize: '0.9rem', color: isIdxAnswered && !isCorrect && !isSelected ? '#8892A4' : '#F0F4F8' }}>
                            {val as string}
                          </Typography>
                        </Stack>

                        {isIdxAnswered && isCorrect && <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 18 }} />}
                        {isIdxAnswered && isSelected && !isCorrect && <CancelIcon sx={{ color: '#EF4444', fontSize: 18 }} />}
                      </Box>
                    );
                  })}
                </Stack>

                {/* Question Explanation */}
                {isIdxAnswered && questions[currentIdx].explanation && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                    <Box sx={{ mt: 3, p: 2, borderRadius: '10px', bgcolor: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#60a5fa', mb: 0.5 }}>EXPLANATION</Typography>
                      <Typography sx={{ fontSize: '0.85rem', color: '#93c5fd', lineHeight: 1.6 }}>
                        {questions[currentIdx].explanation}
                      </Typography>
                    </Box>
                  </motion.div>
                )}
              </Card>

              {/* Action Buttons */}
              {!isIdxAnswered ? (
                <Button
                  variant="contained"
                  fullWidth
                  disabled={!selectedOpt}
                  onClick={handleSubmitQuestion}
                  sx={{ py: 1.6, borderRadius: '12px', fontWeight: 700 }}
                >
                  Submit Answer
                </Button>
              ) : (
                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="outlined"
                    startIcon={<AutoAwesomeIcon />}
                    onClick={() => handleAI('ml')}
                    sx={{ flex: 1, py: 1.3, textTransform: 'none', borderRadius: '12px', fontWeight: 700 }}
                  >
                    AI Doubt (ML)
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => handleAI('en')}
                    sx={{ py: 1.3, px: 2, textTransform: 'none', borderRadius: '12px', fontWeight: 700 }}
                  >
                    EN
                  </Button>
                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={handleNext}
                    sx={{ flex: 1.5, py: 1.3, borderRadius: '12px', fontWeight: 700 }}
                  >
                    {currentIdx < questions.length - 1 ? 'Next' : 'Finish'}
                  </Button>
                </Stack>
              )}
            </motion.div>
          </AnimatePresence>

          {/* AI Drawer Helper */}
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
                p: 3, maxHeight: '70vh'
              }
            }}
          >
            <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.1)', mx: 'auto', mb: 3 }} />
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <AutoAwesomeIcon sx={{ color: '#F59E0B', fontSize: 18 }} />
                <Typography sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, color: '#F0F4F8' }}>
                  AI Explanation ({aiLang === 'ml' ? 'Malayalam' : 'English'})
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.5}>
                {(['en', 'ml'] as const).map(l => (
                  <Button key={l} size="small" variant={aiLang === l ? 'contained' : 'outlined'} disabled={aiLoading} onClick={() => handleAI(l)}>
                    {l.toUpperCase()}
                  </Button>
                ))}
              </Stack>
            </Stack>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 2 }} />
            {aiLoading ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                <CircularProgress color="warning" size={28} sx={{ mb: 1.5 }} />
                <Typography sx={{ color: '#8892A4', fontSize: '0.85rem' }}>Analyzing question...</Typography>
              </Box>
            ) : (
              <Box sx={{ overflowY: 'auto', maxHeight: '40vh', pr: 1 }}>
                <Typography sx={{ color: '#8892A4', lineHeight: 1.8, fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                  {aiText || 'No explanation generated.'}
                </Typography>
              </Box>
            )}
            <Button variant="contained" fullWidth onClick={() => setAiOpen(false)} sx={{ mt: 3, py: 1.5, background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)', color: 'white', fontWeight: 700 }}>
              Got it!
            </Button>
          </SwipeableDrawer>

        </Box>
      )}

      {/* ───────────────────────────────────────────────
          3. RESULTS VIEW SCREEN
          ─────────────────────────────────────────────── */}
      {studyState === 'results' && (
        <Box sx={{ maxWidth: 620, mx: 'auto' }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card sx={{ background: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '24px', p: 4, mb: 4, textAlign: 'center' }}>
              <EmojiEventsIcon sx={{ fontSize: 48, color: '#F59E0B', mb: 1.5 }} />
              <Typography variant="h4" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 950, color: '#F0F4F8', mb: 3 }}>
                Practice Complete!
              </Typography>
              
              <Box sx={{ mb: 3.5 }}>
                <TopicAccuracyGauge accuracy={sessionScorePercent} />
              </Box>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid size={6}>
                  <Box sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', p: 2, borderRadius: '12px' }}>
                    <Typography sx={{ color: '#8892A4', fontSize: '0.75rem', textTransform: 'uppercase' }}>XP EARNED</Typography>
                    <Typography sx={{ color: '#8B5CF6', fontWeight: 800, fontSize: '1.4rem', fontFamily: "'JetBrains Mono'", mt: 0.5 }}>+{sessionXpEarned} XP</Typography>
                  </Box>
                </Grid>
                <Grid size={6}>
                  <Box sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', p: 2, borderRadius: '12px' }}>
                    <Typography sx={{ color: '#8892A4', fontSize: '0.75rem', textTransform: 'uppercase' }}>TIME TAKEN</Typography>
                    <Typography sx={{ color: '#2E8B57', fontWeight: 800, fontSize: '1.4rem', fontFamily: "'JetBrains Mono'", mt: 0.5 }}>
                      {Math.floor(totalTimeRef.current / 60)}m {totalTimeRef.current % 60}s
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Button
                variant="contained"
                fullWidth
                onClick={handleFinishSession}
                sx={{
                  mt: 4,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
                  fontWeight: 750,
                  borderRadius: '12px',
                  textTransform: 'none'
                }}
              >
                Return to Dashboard
              </Button>
            </Card>
          </motion.div>

          {/* Results Question Review List */}
          <Typography variant="h6" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, color: '#F0F4F8', mb: 2 }}>
            Review Answers
          </Typography>

          <Stack spacing={2}>
            {resultsList.map((res: any, idx: number) => {
              const qData = res.question;
              const isCorrect = res.is_correct;
              const selected = res.selected_option;

              return (
                <Card key={idx} sx={{
                  background: 'background.paper',
                  border: isCorrect ? '1px solid rgba(34,197,94,0.15)' : '1px solid rgba(239,68,68,0.15)',
                  borderRadius: '16px',
                  p: 3
                }}>
                  <Typography sx={{ fontWeight: 650, color: '#F0F4F8', mb: 2, fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {idx + 1}. {qData.text}
                  </Typography>

                  <Stack spacing={1}>
                    {Object.entries(qData.options).map(([optKey, optVal]) => {
                      const isCorrectOpt = optKey === qData.correct_answer;
                      const isSelectedOpt = optKey === selected;
                      let bg = 'transparent';
                      let border = '1px solid transparent';
                      let textColor = '#8892A4';

                      if (isCorrectOpt) {
                        bg = 'rgba(34,197,94,0.06)';
                        border = '1px solid rgba(34,197,94,0.2)';
                        textColor = '#86efac';
                      } else if (isSelectedOpt) {
                        bg = 'rgba(239,68,68,0.06)';
                        border = '1px solid rgba(239,68,68,0.2)';
                        textColor = '#fca5a5';
                      }

                      return (
                        <Box key={optKey} sx={{
                          p: 1.25, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          bgcolor: bg, border
                        }}>
                          <Typography sx={{ fontSize: '0.8rem', color: textColor }}>
                            <strong>{optKey}.</strong> {optVal as string}
                          </Typography>
                          {isCorrectOpt && <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 16 }} />}
                          {isSelectedOpt && !isCorrectOpt && <CancelIcon sx={{ color: '#EF4444', fontSize: 16 }} />}
                        </Box>
                      );
                    })}
                  </Stack>

                  {qData.explanation && (
                    <Box sx={{ mt: 2, p: 1.5, borderRadius: '8px', bgcolor: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.12)' }}>
                      <Typography sx={{ fontSize: '0.8rem', color: '#93c5fd', lineHeight: 1.6 }}>
                        <strong>💡</strong> {qData.explanation}
                      </Typography>
                    </Box>
                  )}
                </Card>
              );
            })}
          </Stack>
        </Box>
      )}

    </Box>
  );
}
