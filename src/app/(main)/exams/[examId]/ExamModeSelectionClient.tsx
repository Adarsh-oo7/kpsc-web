'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Box, Typography, Button, Paper, CircularProgress, Alert, Grid, Chip, Stack } from '@mui/material';
import { useAppContext } from '@/context/AppContext';
import VfaPaywallDialog, { gateVfaStart, VfaAccess } from '@/components/VfaPaywallDialog';
import { isVfaExam } from '@/lib/vfaSchedule';
import { getPriorityExam } from '@/lib/priorityExams';
import TimerIcon from '@mui/icons-material/Timer';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import CategoryIcon from '@mui/icons-material/Category';
import StyleIcon from '@mui/icons-material/Style';

interface Props {
  examId: string;
}

const GREEN = '#1B6B3A';
const GREEN_LIGHT = '#2E8B57';

export default function ExamModeSelectionClient({ examId }: Props) {
  const router = useRouter();
  const { fetcher, user } = useAppContext();
  const { data: categories, error, isLoading } = useSWR('/exams/', fetcher);
  const [vfaOpen, setVfaOpen] = useState(false);
  const [vfaAccess, setVfaAccess] = useState<VfaAccess | null>(null);

  const exam = useMemo(() => {
    if (!Array.isArray(categories)) return null;
    for (const cat of categories) {
      const match = (cat.exams || []).find((item: any) => String(item.id) === String(examId) || item.slug === examId);
      if (match) return match;
    }
    return null;
  }, [categories, examId]);
  const { data: modelExams } = useSWR(exam?.id ? `/exams/${exam.id}/model-exams/` : null, fetcher);

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
  const hot = getPriorityExam(exam.slug);
  const subjects = hot?.syllabus || exam.official_syllabus?.subjects?.map((row: any) => ({ topic: row.title, marks: row.marks })) || [];
  const sets = Array.isArray(modelExams) ? modelExams : (modelExams?.results || []);

  const startMock = async () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(mockHref)}`);
      return;
    }
    if (isVfaExam(exam)) {
      const gate = await gateVfaStart(exam);
      if (!gate.allowed) {
        setVfaAccess(gate.access);
        setVfaOpen(true);
        return;
      }
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
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', height: '100%', border: '1.5px solid', borderColor: 'divider' }}>
            <CategoryIcon sx={{ fontSize: 48, mb: 2, color: GREEN }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Topic / subject practice</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Drill one syllabus part at a time — GK, arithmetic, English, or the job special paper.
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {subjects.slice(0, 12).map((row: { topic: string; marks: number }) => (
                <Chip
                  key={row.topic}
                  label={`${row.topic} (${row.marks})`}
                  onClick={() => router.push(`/quiz?exam_id=${exam.slug || exam.id}&topic=${encodeURIComponent(row.topic)}&limit=20`)}
                  sx={{ fontWeight: 700 }}
                />
              ))}
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 4, borderRadius: '24px', height: '100%', border: '1.5px solid', borderColor: 'divider' }}>
            <StyleIcon sx={{ fontSize: 48, mb: 2, color: GREEN }} />
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Set-based papers</Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Ten 100-question sets built like the real OMR paper. Each set follows the official subject weightage.
            </Typography>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {(sets.length ? sets : Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `Set ${i + 1}` }))).slice(0, 10).map((paper: any, idx: number) => (
                <Chip
                  key={paper.id || idx}
                  label={paper.name || `Set ${idx + 1}`}
                  onClick={() => router.push(paper.id && String(paper.id).length < 6 ? `/quiz?mode=mock&exam_id=${exam.id}` : `/quiz?mode=mock&exam_id=${exam.id}`)}
                  sx={{ fontWeight: 700 }}
                />
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      <VfaPaywallDialog
        open={vfaOpen}
        onClose={() => setVfaOpen(false)}
        access={vfaAccess}
        onUnlocked={() => {
          setVfaOpen(false);
          router.push(mockHref);
        }}
      />
    </Box>
  );
}
