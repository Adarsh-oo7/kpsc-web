'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Divider,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';

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

export default function OnboardingPage() {
  const { user, login, isLoading: ctxLoading } = useAppContext();
  const router = useRouter();

  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [selectedExamIds, setSelectedExamIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Protect the route
  useEffect(() => {
    if (!ctxLoading && !user) {
      router.push('/login');
    }
  }, [user, ctxLoading, router]);

  // Fetch exams on load
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await apiClient.get('/exams/');
        setCategories(res.data);
      } catch (err: any) {
        console.error("Failed to fetch exams:", err);
        setError("Could not load exams. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchExams();
    }
  }, [user]);

  const handleSelectExam = (examId: number) => {
    setSelectedExamIds((prev) => {
      if (prev.includes(examId)) {
        return prev.filter((id) => id !== examId);
      } else {
        if (prev.length >= 3) {
          setError("You can select a maximum of 3 preferred exams.");
          return prev;
        }
        setError('');
        return [...prev, examId];
      }
    });
  };

  const handleFinish = async () => {
    if (selectedExamIds.length === 0) {
      setError("Please select at least one exam to continue.");
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      // Save exam preferences to user profile
      await apiClient.patch('/auth/profile/', {
        preferred_exams_ids: selectedExamIds,
      });

      // Retrieve tokens from localStorage to re-trigger login contexts
      const access = localStorage.getItem('access_token');
      const refresh = localStorage.getItem('refresh_token');
      if (access && refresh) {
        await login(access, refresh);
      }

      // Redirect to dashboard/home page
      router.push('/');
    } catch (err: any) {
      console.error("Failed to save onboarding preferences:", err);
      setError("An error occurred while saving your preferences. Please try again.");
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
            Setting up your learning space...
          </Typography>
        </Stack>
      </Box>
    );
  }

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
          {/* Header */}
          <Box sx={{ mb: 5, textAlign: 'center' }}>
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
              <SchoolIcon sx={{ fontSize: '32px', color: 'white' }} />
            </Box>
            <Typography
              variant="h3"
              sx={{
                fontFamily: "'Cabinet Grotesk', sans-serif",
                fontWeight: 900,
                color: 'text.primary',
                letterSpacing: '-0.02em',
                mb: 1.5,
              }}
            >
              Welcome to KPSC Master
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'text.secondary',
                fontFamily: "'Satoshi', sans-serif",
                fontWeight: 400,
                maxWidth: '600px',
                mx: 'auto',
              }}
            >
              Choose the exams you are preparing for. This personalizes your questions, mock papers, and study dashboard.
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.disabled', display: 'block', mt: 1 }}
            >
              You can select up to 3 exams (നിങ്ങൾക്ക് പരമാവധി 3 പരീക്ഷകൾ വരെ തിരഞ്ഞെടുക്കാം).
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 4,
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

          {/* Exam Categories Listing */}
          <Stack spacing={4}>
            {categories.map((category) => (
              <Box key={category.id}>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: "'Cabinet Grotesk', sans-serif",
                    fontWeight: 800,
                    mb: 2,
                    color: 'primary.main',
                    letterSpacing: '0.02em',
                  }}
                >
                  {category.name}
                </Typography>
                <Grid container spacing={2}>
                  {category.exams.map((exam) => {
                    const isSelected = selectedExamIds.includes(exam.id);
                    return (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={exam.id}>
                        <motion.div
                          whileHover={{ y: -4 }}
                          whileTap={{ scale: 0.98 }}
                        >
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
                              position: 'relative',
                              overflow: 'visible',
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
                                Year: {exam.year} • {exam.duration_minutes} Mins
                              </Typography>
                            </CardContent>
                          </Card>
                        </motion.div>
                      </Grid>
                    );
                  })}
                </Grid>
                <Divider sx={{ mt: 4, borderColor: 'divider' }} />
              </Box>
            ))}
          </Stack>

          {/* Footer Controls */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              mt: 6,
              gap: 3,
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Selected: <strong>{selectedExamIds.length} of 3</strong>
            </Typography>

            <Button
              variant="contained"
              disabled={selectedExamIds.length === 0 || submitting}
              onClick={handleFinish}
              endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
              sx={{
                borderRadius: '16px',
                height: '56px',
                px: 4,
                background: 'linear-gradient(135deg, #1B6B3A 0%, #2E8B57 100%)',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 700,
                boxShadow: '0 4px 14px rgba(27, 107, 58, 0.3)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1B6B3A 0%, #2E8B57 100%)',
                  filter: 'brightness(1.1)',
                  boxShadow: '0 6px 20px rgba(27, 107, 58, 0.4)',
                },
                '&:active': {
                  transform: 'scale(0.98)',
                },
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              {submitting ? 'Setting up...' : 'Get Started'}
            </Button>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
}
