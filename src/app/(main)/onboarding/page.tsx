'use client';

import { useEffect, useMemo, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Stack,
  Alert,
  Paper,
  TextField,
  InputAdornment,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PhoneIcon from '@mui/icons-material/Phone';
import SearchIcon from '@mui/icons-material/Search';
import TranslateIcon from '@mui/icons-material/Translate';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';
import { apiErrorMessage, isValidIndianMobile, safeNextPath } from '@/lib/auth';

interface Exam {
  id: number;
  name: string;
  year: number;
  duration_minutes: number;
}

interface ExamCategory {
  id: number;
  name: string;
  description: string;
  exams: Exam[];
}

const POPULAR_KEYS = [
  'ldc',
  'ld clerk',
  'lgs',
  'last grade',
  'degree level',
  'degree',
  'civil police',
  'cpo',
  'village field',
  'vfa',
  'kas',
  'secretariat',
];

function isPopularExam(name: string) {
  const n = name.toLowerCase();
  return POPULAR_KEYS.some((key) => n.includes(key));
}

const STEPS = [
  { id: 1, label: 'Exam' },
  { id: 2, label: 'Practice' },
  { id: 3, label: 'Contact' },
];

function OnboardingClient() {
  const { user, profile, login, isLoading: ctxLoading } = useAppContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = safeNextPath(searchParams.get('next'));

  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [selectedExamIds, setSelectedExamIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'ml'>('en');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [search, setSearch] = useState('');
  const [step, setStep] = useState(1);
  const [practiceMode, setPracticeMode] = useState<'full' | 'focus'>('full');

  useEffect(() => {
    if (!ctxLoading && !user) {
      router.push('/login');
    }
  }, [user, ctxLoading, router]);

  useEffect(() => {
    if (profile?.phone_number) setPhoneNumber(profile.phone_number);
    if (profile?.preferred_language === 'en' || profile?.preferred_language === 'ml') {
      setPreferredLanguage(profile.preferred_language);
    }
    if (profile?.practice_mode === 'focus' || profile?.practice_mode === 'full') {
      setPracticeMode(profile.practice_mode);
    }
    if (Array.isArray(profile?.preferred_exams) && profile.preferred_exams.length) {
      setSelectedExamIds(profile.preferred_exams.map((exam: Exam) => exam.id));
    }
  }, [profile]);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await apiClient.get('/exams/');
        const payload = Array.isArray(res.data) ? res.data : res.data?.results || [];
        setCategories(payload);
      } catch (err: any) {
        setError(apiErrorMessage(err, 'Could not load exams. Refresh the page and try again.'));
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchExams();
  }, [user]);

  const allExams = useMemo(
    () => categories.flatMap((category) => category.exams.map((exam) => ({ ...exam, category: category.name }))),
    [categories]
  );

  const popularExams = useMemo(
    () => allExams.filter((exam) => isPopularExam(exam.name)).slice(0, 8),
    [allExams]
  );

  const query = search.trim().toLowerCase();
  const popularIds = useMemo(() => new Set(popularExams.map((exam) => exam.id)), [popularExams]);
  const filteredCategories = useMemo(() => {
    return categories
      .map((category) => ({
        ...category,
        exams: category.exams.filter((exam) => {
          if (query) return exam.name.toLowerCase().includes(query);
          return !popularIds.has(exam.id);
        }),
      }))
      .filter((category) => category.exams.length > 0);
  }, [categories, query, popularIds]);

  const handleSelectExam = (examId: number) => {
    setSelectedExamIds((prev) => {
      if (prev.includes(examId)) {
        setError('');
        return prev.filter((id) => id !== examId);
      }
      if (prev.length >= 3) {
        setError('You can choose up to 3 exams. Unselect one to add another.');
        return prev;
      }
      setError('');
      return [...prev, examId];
    });
  };

  const goNext = () => {
    if (step === 1 && selectedExamIds.length === 0) {
      setError('Pick the exam you are preparing for. This decides your questions and mocks.');
      return;
    }
    setError('');
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const handleFinish = async (skipPhone = false) => {
    if (selectedExamIds.length === 0) {
      setError('Pick at least one exam to continue.');
      setStep(1);
      return;
    }
    const phoneToSave = skipPhone ? (profile?.phone_number || '') : phoneNumber.trim();
    if (phoneToSave && !isValidIndianMobile(phoneToSave)) {
      setError('Enter a valid 10-digit WhatsApp number, or skip this step.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      await apiClient.patch('/auth/profile/', {
        preferred_exams_ids: selectedExamIds,
        primary_exam_id: selectedExamIds[0],
        preferred_language: preferredLanguage,
        practice_mode: practiceMode,
        phone_number: phoneToSave,
      });

      const access = localStorage.getItem('access_token');
      const refresh = localStorage.getItem('refresh_token');
      if (access && refresh) {
        await login(access, refresh);
      }

      router.replace(nextPath || '/home');
    } catch (err: any) {
      setError(apiErrorMessage(err, 'Could not save your choices. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (ctxLoading || loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress sx={{ color: '#2E8B57' }} />
          <Typography sx={{ color: 'text.secondary', fontFamily: "'Satoshi', sans-serif" }}>
            Setting up your study plan...
          </Typography>
        </Stack>
      </Box>
    );
  }

  const stepCopy = {
    1: {
      title: 'Which exam are you preparing for?',
      subtitle: 'Start with one. We’ll personalise questions, mocks, and your daily mission around it.',
    },
    2: {
      title: 'How should we pick questions?',
      subtitle: 'Full mix from your exam paper, or more from weak sections. Then choose the language you will write in.',
    },
    3: {
      title: 'How can we remind you to study?',
      subtitle: 'WhatsApp is optional. Skip if you prefer — you can add it from Profile anytime.',
    },
  }[step];

  const renderExamCard = (exam: Exam) => {
    const isSelected = selectedExamIds.includes(exam.id);
    return (
      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={exam.id}>
        <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
          <Card
            onClick={() => handleSelectExam(exam.id)}
            sx={{
              cursor: 'pointer',
              borderRadius: '20px',
              border: '2px solid',
              borderColor: isSelected ? '#2E8B57' : 'divider',
              bgcolor: isSelected
                ? 'rgba(46, 139, 87, 0.08)'
                : (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.02)'
                      : 'rgba(0, 0, 0, 0.01)',
              transition: 'all 0.3s ease',
            }}
          >
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontFamily: "'Satoshi', sans-serif",
                    fontWeight: 700,
                    color: 'text.primary',
                    pr: 2,
                  }}
                >
                  {exam.name}
                </Typography>
                {isSelected ? (
                  <CheckCircleIcon sx={{ color: '#2E8B57', fontSize: 24 }} />
                ) : (
                  <Box
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      border: '2px solid',
                      borderColor: 'text.disabled',
                    }}
                  />
                )}
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                {exam.year ? `Year ${exam.year}` : 'Official paper'}
                {exam.duration_minutes ? ` • ${exam.duration_minutes} mins` : ''}
              </Typography>
            </CardContent>
          </Card>
        </motion.div>
      </Grid>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: { xs: 2, md: 4 },
        bgcolor: 'background.default',
        backgroundImage: (theme) =>
          theme.palette.mode === 'dark'
            ? 'radial-gradient(circle at 80% 20%, rgba(27, 107, 58, 0.15) 0%, transparent 50%), radial-gradient(circle at 15% 80%, rgba(245, 158, 11, 0.08) 0%, transparent 50%)'
            : 'radial-gradient(circle at 80% 20%, rgba(27, 107, 58, 0.06) 0%, transparent 50%), radial-gradient(circle at 15% 80%, rgba(245, 158, 11, 0.04) 0%, transparent 50%)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: '900px' }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 6 },
            borderRadius: '32px',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(22, 27, 34, 0.85)' : 'rgba(255, 255, 255, 0.95)',
            border: '1px solid',
            borderColor: 'divider',
            backdropFilter: 'blur(16px)',
            width: '100%',
          }}
        >
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Box
              sx={{
                width: 60,
                height: 60,
                background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(27,107,58,0.3)',
                mx: 'auto',
                mb: 3,
              }}
            >
              {step === 2 ? <TranslateIcon sx={{ fontSize: '32px', color: 'white' }} /> : <SchoolIcon sx={{ fontSize: '32px', color: 'white' }} />}
            </Box>
            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3 }}>
              {STEPS.map((item) => (
                <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      bgcolor: step >= item.id ? '#2E8B57' : 'transparent',
                      color: step >= item.id ? 'white' : 'text.disabled',
                      border: '2px solid',
                      borderColor: step >= item.id ? '#2E8B57' : 'divider',
                    }}
                  >
                    {item.id}
                  </Box>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: step === item.id ? 'text.primary' : 'text.disabled' }}>
                    {item.label}
                  </Typography>
                </Box>
              ))}
            </Stack>
            <Typography
              variant="h4"
              sx={{
                fontFamily: "'Cabinet Grotesk', sans-serif",
                fontWeight: 900,
                color: 'text.primary',
                letterSpacing: '-0.02em',
                mb: 1.5,
                fontSize: { xs: '1.6rem', md: '2rem' },
              }}
            >
              {stepCopy.title}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'text.secondary',
                fontFamily: "'Satoshi', sans-serif",
                maxWidth: '620px',
                mx: 'auto',
              }}
            >
              {stepCopy.subtitle}
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: '16px',
                bgcolor: 'rgba(239, 68, 68, 0.1)',
                color: '#EF4444',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                '& .MuiAlert-icon': { color: '#EF4444' },
              }}
            >
              {error}
            </Alert>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="exam" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <TextField
                  fullWidth
                  placeholder="Search LDC, LGS, Degree, Police..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#2E8B57' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '16px',
                      bgcolor: 'background.paper',
                    },
                  }}
                />

                {!query && popularExams.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Typography sx={{ fontWeight: 800, mb: 2, color: '#2E8B57' }}>Most chosen</Typography>
                    <Grid container spacing={2}>
                      {popularExams.map(renderExamCard)}
                    </Grid>
                  </Box>
                )}

                <Stack spacing={4}>
                  {filteredCategories.map((category) => (
                    <Box key={category.id}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: "'Cabinet Grotesk', sans-serif",
                          fontWeight: 800,
                          mb: 2,
                          color: 'primary.main',
                        }}
                      >
                        {category.name}
                      </Typography>
                      <Grid container spacing={2}>
                        {category.exams.map(renderExamCard)}
                      </Grid>
                    </Box>
                  ))}
                </Stack>
                {filteredCategories.length === 0 && (
                  <Typography sx={{ color: 'text.secondary', textAlign: 'center', py: 4 }}>
                    No exam matched “{search}”. Try LDC, LGS, or Degree.
                  </Typography>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="lang" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <Typography sx={{ fontWeight: 800, mb: 1.5, color: '#2E8B57' }}>Question mix</Typography>
                <Grid container spacing={2} sx={{ mb: 4 }}>
                  {[
                    {
                      key: 'full',
                      name: 'Full syllabus',
                      desc: 'Mixed questions from your whole exam paper. Best when you are starting or want everyday coverage.',
                    },
                    {
                      key: 'focus',
                      name: 'Focus areas',
                      desc: 'More questions from weak or important sections. Best when you already know the paper and want marks.',
                    },
                  ].map((item) => {
                    const isSelected = practiceMode === item.key;
                    return (
                      <Grid size={{ xs: 12, sm: 6 }} key={item.key}>
                        <Card
                          onClick={() => setPracticeMode(item.key as 'full' | 'focus')}
                          sx={{
                            cursor: 'pointer',
                            borderRadius: '20px',
                            border: '2px solid',
                            borderColor: isSelected ? '#2E8B57' : 'divider',
                            bgcolor: isSelected ? 'rgba(46, 139, 87, 0.08)' : 'background.paper',
                            boxShadow: isSelected ? '0 8px 24px rgba(46, 139, 87, 0.12)' : 'none',
                          }}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography sx={{ fontWeight: 700, color: 'text.primary' }}>{item.name}</Typography>
                              {isSelected && <CheckCircleIcon sx={{ color: '#2E8B57', fontSize: 24 }} />}
                            </Box>
                            <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>{item.desc}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>

                <Typography sx={{ fontWeight: 800, mb: 1.5, color: '#2E8B57' }}>Exam language</Typography>
                <Grid container spacing={3}>
                  {[
                    { key: 'ml', name: 'Malayalam (മലയാളം)', desc: 'Best if you will write Kerala PSC in Malayalam.' },
                    { key: 'en', name: 'English', desc: 'Best if you prefer English questions and explanations.' },
                  ].map((lang) => {
                    const isSelected = preferredLanguage === lang.key;
                    return (
                      <Grid size={{ xs: 12, sm: 6 }} key={lang.key}>
                        <Card
                          onClick={() => setPreferredLanguage(lang.key as 'en' | 'ml')}
                          sx={{
                            cursor: 'pointer',
                            borderRadius: '20px',
                            border: '2px solid',
                            borderColor: isSelected ? '#2E8B57' : 'divider',
                            bgcolor: isSelected ? 'rgba(46, 139, 87, 0.08)' : 'background.paper',
                            boxShadow: isSelected ? '0 8px 24px rgba(46, 139, 87, 0.12)' : 'none',
                          }}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                              <Typography sx={{ fontWeight: 700, color: 'text.primary' }}>{lang.name}</Typography>
                              {isSelected && <CheckCircleIcon sx={{ color: '#2E8B57', fontSize: 24 }} />}
                            </Box>
                            <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>{lang.desc}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="phone" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
                <TextField
                  fullWidth
                  placeholder="10-digit WhatsApp number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: '#2E8B57' }} />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Optional. Used only for study reminders, not shared publicly."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '16px',
                      bgcolor: 'background.paper',
                    },
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              mt: 5,
              gap: 2,
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {step === 1 ? `Selected: ${selectedExamIds.length} of 3` : 'You can change these later in Profile.'}
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              {step > 1 && (
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => {
                    setError('');
                    setStep((prev) => prev - 1);
                  }}
                  sx={{
                    borderRadius: '16px',
                    height: '52px',
                    textTransform: 'none',
                    fontWeight: 700,
                    width: { xs: '100%', sm: 'auto' },
                  }}
                >
                  Back
                </Button>
              )}
              {step < 3 ? (
                <Button
                  variant="contained"
                  onClick={goNext}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    borderRadius: '16px',
                    height: '52px',
                    px: 4,
                    background: 'linear-gradient(135deg, #1B6B3A 0%, #2E8B57 100%)',
                    textTransform: 'none',
                    fontWeight: 700,
                    width: { xs: '100%', sm: 'auto' },
                  }}
                >
                  Continue
                </Button>
              ) : (
                <>
                  <Button
                    variant="text"
                    disabled={submitting}
                    onClick={() => handleFinish(true)}
                    sx={{ textTransform: 'none', fontWeight: 700, height: '52px' }}
                  >
                    Skip for now
                  </Button>
                  <Button
                    variant="contained"
                    disabled={submitting}
                    onClick={() => handleFinish(false)}
                    endIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <ArrowForwardIcon />}
                    sx={{
                      borderRadius: '16px',
                      height: '52px',
                      px: 4,
                      background: 'linear-gradient(135deg, #1B6B3A 0%, #2E8B57 100%)',
                      textTransform: 'none',
                      fontWeight: 700,
                      width: { xs: '100%', sm: 'auto' },
                    }}
                  >
                    {submitting ? 'Saving...' : 'Start studying'}
                  </Button>
                </>
              )}
            </Stack>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            bgcolor: 'background.default',
          }}
        >
          <CircularProgress sx={{ color: '#2E8B57' }} />
        </Box>
      }
    >
      <OnboardingClient />
    </Suspense>
  );
}
