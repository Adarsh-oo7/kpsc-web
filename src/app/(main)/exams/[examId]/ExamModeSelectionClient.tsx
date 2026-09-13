'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Box, Typography, Button, Paper, CircularProgress, Alert, Grid } from '@mui/material';
import { useAppContext } from '@/context/AppContext';
import TimerIcon from '@mui/icons-material/Timer';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

interface Props {
  examId: string;
}

const GREEN = '#1B6B3A';
const GREEN_LIGHT = '#2E8B57';

export default function ExamModeSelectionClient({ examId }: Props) {
  const router = useRouter();
  const { fetcher, user } = useAppContext();
  const { data: categories, error, isLoading } = useSWR('/exams/', fetcher);

  const exam = useMemo(() => {
    if (!Array.isArray(categories)) return null;
    for (const cat of categories) {
      const match = (cat.exams || []).find((item: any) => String(item.id) === String(examId) || item.slug === examId);
      if (match) return match;
    }
    return null;
  }, [categories, examId]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress sx={{ color: GREEN_LIGHT }} />
      </Box>
    );
  }

  if (error || !exam) {
    return (
      <Alert severity="error" sx={{ borderRadius: '14px' }}>
        Could not load this exam. Go back to mock papers and pick it again.
        <Button onClick={() => router.push('/exams')} sx={{ ml: 1, textTransform: 'none', fontWeight: 800 }}>
          View papers
        </Button>
      </Alert>
    );
  }

  const mockHref = `/quiz?mode=mock&exam_id=${exam.id}`;
  const studyHref = `/exams/${exam.slug || examId}/study`;

  const startMock = () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(mockHref)}`);
      return;
    }
    router.push(mockHref);
  };

  return (
    <Box sx={{ pb: 6 }}>
      <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: GREEN_LIGHT, mb: 1 }}>
        Choose how to practise
      </Typography>
      <Typography sx={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 900, fontSize: { xs: '1.7rem', md: '2.1rem' }, mb: 1 }}>
        {exam.name}
      </Typography>
      <Typography sx={{ mb: 4, color: 'text.secondary', maxWidth: 560 }}>
        Study mode shows answers as you go. The full mock uses the official timer and negative marking.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', height: '100%', border: '1.5px solid', borderColor: 'divider' }}>
            <LibraryBooksIcon sx={{ fontSize: 48, mb: 2, color: GREEN }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Study mode</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Work through questions like flashcards. See the answer and explanation immediately.
            </Typography>
            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push(studyHref)}
              sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '12px' }}
            >
              Start studying
            </Button>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', height: '100%', border: '1.5px solid', borderColor: 'rgba(27,107,58,0.25)' }}>
            <TimerIcon sx={{ fontSize: 48, mb: 2, color: GREEN }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Full mock paper</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {exam.duration_minutes || 75} minutes, {exam.question_pattern?.total_questions || 100} MCQs, +1 / −0.33 marking. No answers until you submit.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={startMock}
              sx={{
                textTransform: 'none',
                fontWeight: 800,
                borderRadius: '12px',
                background: `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})`,
              }}
            >
              Start full mock
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
