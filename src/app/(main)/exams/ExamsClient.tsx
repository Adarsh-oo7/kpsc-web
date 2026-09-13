'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Box,
  Typography,
  Grid,
  Alert,
  Paper,
  useTheme,
  Stack,
  TextField,
  InputAdornment,
  Chip,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Divider,
  LinearProgress,
} from '@mui/material';
import { useAppContext } from '@/context/AppContext';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TimerIcon from '@mui/icons-material/Timer';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import TranslateOutlined from '@mui/icons-material/TranslateOutlined';
import GavelOutlined from '@mui/icons-material/GavelOutlined';

const GREEN = '#1B6B3A';
const GREEN_LIGHT = '#2E8B57';
const AMBER = '#F59E0B';

type ExamItem = {
  id: number;
  name: string;
  slug?: string;
  year?: number | string;
  duration_minutes?: number;
  category_number?: string;
  official_syllabus?: {
    subjects?: { title: string; marks: number }[];
  };
  question_pattern?: {
    total_questions?: number;
    duration_minutes?: number;
    marking_scheme?: string;
  };
};

function examDuration(exam: ExamItem | null | undefined) {
  return exam?.question_pattern?.duration_minutes || exam?.duration_minutes || 75;
}

function examQuestionCount(exam: ExamItem | null | undefined) {
  return exam?.question_pattern?.total_questions || 100;
}

function mockPath(exam: ExamItem) {
  return `/quiz?mode=mock&exam_id=${exam.id}`;
}

function examHubPath(exam: ExamItem) {
  return exam.slug ? `/exams/${exam.slug}` : `/exams/${exam.id}`;
}

const getSyllabusWeightage = (examName: string) => {
  const name = examName.toLowerCase();
  if (name.includes('ldc') || name.includes('clerk')) {
    return [
      { subject: 'Part I: General Knowledge', weight: 50 },
      { subject: 'Part II: Current Affairs', weight: 20 },
      { subject: 'Part III: Simple Arithmetic & Mental Ability', weight: 10 },
      { subject: 'Part IV: General English', weight: 10 },
      { subject: 'Part V: Regional Language', weight: 10 },
    ];
  }
  if (name.includes('lgs') || name.includes('servant')) {
    return [
      { subject: 'Part I: General Knowledge', weight: 40 },
      { subject: 'Part II: Current Affairs', weight: 20 },
      { subject: 'Part III: Science', weight: 10 },
      { subject: 'Part IV: Public Health', weight: 10 },
      { subject: 'Part V: Simple Arithmetic & Mental Ability', weight: 20 },
    ];
  }
  if (name.includes('sub inspector') || name.includes('si ') || name.includes('inspector')) {
    return [
      { subject: 'General Knowledge & Current Affairs', weight: 50 },
      { subject: 'General Science', weight: 10 },
      { subject: 'Mental Ability & Logical Reasoning', weight: 10 },
      { subject: 'Quantitative Aptitude', weight: 10 },
      { subject: 'General English', weight: 10 },
      { subject: 'Regional Language (Malayalam/Kannada/Tamil)', weight: 5 },
      { subject: 'Police & Legal Subjects', weight: 5 },
    ];
  }
  if (name.includes('constable') || name.includes('cpo') || name.includes('police')) {
    return [
      { subject: 'Part I: General Knowledge', weight: 40 },
      { subject: 'Part II: Current Affairs', weight: 10 },
      { subject: 'Part III: Simple Arithmetic & Mental Ability', weight: 10 },
      { subject: 'Part IV: General English', weight: 10 },
      { subject: 'Part V: Regional Language', weight: 10 },
      { subject: 'Part VI: Special Topics (Job-Related)', weight: 20 },
    ];
  }
  if (name.includes('forest') || name.includes('beat forest')) {
    return [
      { subject: 'General Knowledge', weight: 40 },
      { subject: 'Current Affairs', weight: 10 },
      { subject: 'Simple Arithmetic, Mental Ability & Reasoning', weight: 10 },
      { subject: 'General English', weight: 10 },
      { subject: 'Regional Language (Malayalam/Kannada/Tamil)', weight: 10 },
      { subject: 'Special Topics (Forest & Wildlife)', weight: 20 },
    ];
  }
  if (name.includes('degree') || name.includes('graduate') || name.includes('assistant')) {
    return [
      { subject: 'Part I: General Knowledge', weight: 50 },
      { subject: 'Part II: Simple Arithmetic & Mental Ability', weight: 20 },
      { subject: 'Part III: General English', weight: 20 },
      { subject: 'Part IV: Regional Language', weight: 10 },
    ];
  }
  return [
    { subject: 'General Studies & Current Affairs', weight: 40 },
    { subject: 'English Language & Grammar', weight: 20 },
    { subject: 'Regional Language', weight: 20 },
    { subject: 'Arithmetic & Mental Ability', weight: 20 },
  ];
};

function weightageFor(exam: ExamItem | null) {
  const subjects = exam?.official_syllabus?.subjects;
  if (Array.isArray(subjects) && subjects.length) {
    return subjects.map((s) => ({ subject: s.title, weight: s.marks }));
  }
  const official = getSyllabusWeightage(exam?.name || '');
  return official;
}

export default function ExamsClient() {
  const { setExamId, fetcher, user, profile } = useAppContext();
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [bestScores, setBestScores] = useState<Record<string, number>>({});
  const [syllabusOpen, setSyllabusOpen] = useState(false);
  const [selectedExamForSyllabus, setSelectedExamForSyllabus] = useState<ExamItem | null>(null);
  const [selectedSyllabus, setSelectedSyllabus] = useState<any>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [pendingPath, setPendingPath] = useState('/exams');

  const { data: categories, error, isLoading } = useSWR('/exams/', fetcher);
  const { data: syllabusList } = useSWR('/syllabuses/', fetcher);

  useEffect(() => {
    const scores: Record<string, number> = {};
    if (typeof window === 'undefined') return;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('best_score_')) {
        const examId = key.replace('best_score_', '');
        const val = localStorage.getItem(key);
        if (val) scores[examId] = parseFloat(val);
      }
    }
    setBestScores(scores);
  }, []);

  const populatedCategories = useMemo(() => {
    if (!Array.isArray(categories)) return [];
    return categories.filter((cat: any) => Array.isArray(cat.exams) && cat.exams.length > 0);
  }, [categories]);

  const paperCount = useMemo(
    () => populatedCategories.reduce((n: number, cat: any) => n + cat.exams.length, 0),
    [populatedCategories],
  );

  const filteredCategories = useMemo(() => {
    let result = populatedCategories;
    if (selectedCategory !== 'All') {
      result = result.filter((cat: any) => cat.name === selectedCategory);
    }
    const q = searchQuery.toLowerCase().trim();
    if (!q) return result;
    return result
      .map((category: any) => {
        const exams = category.exams.filter((exam: ExamItem) => {
          const hay = `${exam.name} ${exam.year ?? ''} ${exam.slug ?? ''} ${exam.category_number ?? ''}`.toLowerCase();
          return hay.includes(q);
        });
        return { ...category, exams };
      })
      .filter((category: any) => category.exams.length > 0);
  }, [populatedCategories, searchQuery, selectedCategory]);

  const categoryNames = useMemo(() => {
    return ['All', ...populatedCategories.map((c: any) => c.name)];
  }, [populatedCategories]);

  const featuredExam = useMemo(() => {
    if (!populatedCategories.length) return null;

    if (profile?.preferred_exams && profile.preferred_exams.length > 0) {
      const preferredIds = new Set(profile.preferred_exams.map((pe: any) => pe.id));
      const preferredSlugs = new Set(profile.preferred_exams.map((pe: any) => (pe.slug || '').toLowerCase()));
      const preferredNames = profile.preferred_exams.map((pe: any) => (pe.name || '').toLowerCase());

      for (const cat of populatedCategories) {
        const idMatch = cat.exams.find((exam: ExamItem) => preferredIds.has(exam.id));
        if (idMatch) return { ...idMatch, categoryName: cat.name };
        const slugMatch = cat.exams.find((exam: ExamItem) => preferredSlugs.has((exam.slug || '').toLowerCase()));
        if (slugMatch) return { ...slugMatch, categoryName: cat.name };
        const nameMatch = cat.exams.find((exam: ExamItem) => {
          const examNameLower = (exam.name || '').toLowerCase();
          return preferredNames.some((pn: string) => {
            const keywords = pn.replace(/[()]/g, '').split(/\s+/).filter((w: string) => w.length >= 3);
            return keywords.some((kw: string) => examNameLower.includes(kw));
          });
        });
        if (nameMatch) return { ...nameMatch, categoryName: cat.name };
      }
    }

    const ldc = populatedCategories
      .flatMap((cat: any) => cat.exams.map((exam: ExamItem) => ({ ...exam, categoryName: cat.name })))
      .find((exam: ExamItem) => /ldc|lower division clerk/i.test(exam.name));
    if (ldc) return ldc;
    const first = populatedCategories[0].exams[0];
    return first ? { ...first, categoryName: populatedCategories[0].name } : null;
  }, [populatedCategories, profile]);

  const goAfterAuth = (path: string) => {
    router.push(`/login?next=${encodeURIComponent(path)}`);
  };

  const startMock = (exam: ExamItem) => {
    const path = mockPath(exam);
    setExamId(String(exam.id));
    if (!user) {
      setPendingPath(path);
      setAuthDialogOpen(true);
      return;
    }
    router.push(path);
  };

  const handleOpenSyllabus = (exam: ExamItem) => {
    const syllabusMatch = syllabusList?.find((s: any) => s.exam === exam.id);
    setSelectedSyllabus(syllabusMatch || null);
    setSelectedExamForSyllabus(exam);
    setSyllabusOpen(true);
  };

  const syllabusWeightRows = useMemo(() => {
    const fromApi = selectedSyllabus?.subject_weights;
    if (Array.isArray(fromApi) && fromApi.length) return fromApi;
    return weightageFor(selectedExamForSyllabus);
  }, [selectedSyllabus, selectedExamForSyllabus]);

  if (error) {
    return (
      <Box sx={{ py: 4, px: { xs: 0.5, sm: 1 } }}>
        <Alert severity="error" variant="filled">
          Could not load mock papers. Refresh the page and try again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 8 }}>
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: { xs: '20px', md: '28px' },
          mb: 3.5,
          background: `linear-gradient(165deg, ${GREEN} 0%, #166534 48%, #134E2A 100%)`,
          '&::after': {
            content: '""',
            position: 'absolute',
            width: 380,
            height: 380,
            right: -90,
            bottom: -140,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${AMBER} 0%, rgba(245,158,11,0) 68%)`,
            opacity: 0.28,
            pointerEvents: 'none',
          },
        }}
      >
        <Box sx={{ p: { xs: 3, sm: 4, md: 5 }, position: 'relative', zIndex: 1 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#FCD34D', mb: 1.25 }}>
                Kerala PSC mock papers
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Cabinet Grotesk', sans-serif",
                  fontWeight: 900,
                  fontSize: { xs: '1.85rem', sm: '2.35rem', md: '2.7rem' },
                  lineHeight: 1.12,
                  letterSpacing: '-0.03em',
                  color: '#fff',
                  mb: 1.5,
                }}
              >
                Sit a full paper the way the real exam runs.
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.86)', fontSize: { xs: '0.95rem', sm: '1.05rem' }, maxWidth: 520, lineHeight: 1.6, mb: 3 }}>
                Pick your post, start a timed mock with negative marking, then review the misses. Practice sets stay on Daily Quiz — this page is the full paper.
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  maxWidth: 480,
                  borderRadius: '16px',
                  bgcolor: '#fff',
                  border: '1.5px solid rgba(255,255,255,0.2)',
                }}
              >
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search LDC, LGS, Police, KAS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { border: 'none' },
                      borderRadius: '16px',
                      fontSize: '1rem',
                      py: 0.4,
                      px: 1.5,
                      fontWeight: 600,
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: GREEN }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                {[
                  { label: 'Papers on this page', val: isLoading ? '—' : String(paperCount), icon: <AssignmentIcon sx={{ fontSize: 20 }} /> },
                  { label: 'Official timer', val: `${examDuration(featuredExam)}m`, icon: <TimerIcon sx={{ fontSize: 20 }} /> },
                  { label: 'Negative mark', val: '-0.33', icon: <GavelOutlined sx={{ fontSize: 20 }} /> },
                  { label: 'Paper language', val: 'EN + ML', icon: <TranslateOutlined sx={{ fontSize: 20 }} /> },
                ].map((stat) => (
                  <Box
                    key={stat.label}
                    sx={{
                      p: 1.75,
                      borderRadius: '14px',
                      bgcolor: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      color: '#fff',
                    }}
                  >
                    <Box sx={{ color: '#FCD34D', mb: 0.75 }}>{stat.icon}</Box>
                    <Typography sx={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 900, fontSize: '1.25rem' }}>{stat.val}</Typography>
                    <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.75)', fontWeight: 600, mt: 0.25 }}>{stat.label}</Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {featuredExam && !searchQuery && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: '24px',
            mb: 3.5,
            bgcolor: isDark ? '#161B22' : '#FFFFFF',
            border: '1.5px solid',
            borderColor: isDark ? 'rgba(245,158,11,0.35)' : 'rgba(217,119,6,0.28)',
            boxShadow: isDark ? '0 18px 50px rgba(0,0,0,0.35)' : '0 12px 36px rgba(245,158,11,0.1)',
          }}
        >
          <Grid container spacing={2.5} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <Chip
                icon={<WorkspacePremiumIcon sx={{ color: `${AMBER} !important`, fontSize: '0.95rem !important' }} />}
                label={profile?.preferred_exams?.length ? 'Your exam paper' : 'Start with this paper'}
                sx={{ bgcolor: 'rgba(245,158,11,0.14)', color: isDark ? '#FCD34D' : '#92400E', fontWeight: 800, mb: 1.5 }}
              />
              <Typography sx={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 900, fontSize: { xs: '1.35rem', sm: '1.7rem' }, color: 'text.primary' }}>
                {featuredExam.name}
              </Typography>
              <Typography sx={{ color: 'text.secondary', mt: 0.75, maxWidth: 580, lineHeight: 1.55 }}>
                Full mock: {examQuestionCount(featuredExam)} MCQs, {examDuration(featuredExam)} minutes, Kerala PSC +1 / −0.33 marking. After login we open the paper, not a 15-question drill.
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ pt: 1.5 }}>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <TimerIcon sx={{ color: GREEN_LIGHT, fontSize: 18 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>{examDuration(featuredExam)} MINS</Typography>
                </Stack>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <AssignmentIcon sx={{ color: GREEN_LIGHT, fontSize: 18 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>{examQuestionCount(featuredExam)} MCQS</Typography>
                </Stack>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <CalendarTodayIcon sx={{ color: AMBER, fontSize: 18 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>YEAR {featuredExam.year}</Typography>
                </Stack>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={1.25} sx={{ width: '100%', maxWidth: { md: 280 }, ml: { md: 'auto' } }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => startMock(featuredExam)}
                  startIcon={<PlayArrowIcon />}
                  sx={{
                    py: 1.4,
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 800,
                    background: `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})`,
                    boxShadow: '0 8px 20px rgba(27, 107, 58, 0.35)',
                    '&:hover': { background: `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})`, filter: 'brightness(1.06)' },
                  }}
                >
                  Start full mock
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handleOpenSyllabus(featuredExam)}
                  sx={{ py: 1.25, borderRadius: '12px', textTransform: 'none', fontWeight: 800, borderColor: 'divider', color: 'text.primary' }}
                >
                  Syllabus
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      )}

      {categoryNames.length > 1 && (
        <Box sx={{ display: 'flex', gap: 1, mb: 3, overflowX: 'auto', pb: 1, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
          {categoryNames.map((catName) => {
            const isSelected = selectedCategory === catName;
            return (
              <Chip
                key={catName}
                label={catName}
                onClick={() => setSelectedCategory(catName)}
                sx={{
                  py: 2.1,
                  px: 0.5,
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  borderRadius: '12px',
                  bgcolor: isSelected ? GREEN : isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                  color: isSelected ? '#fff' : 'text.primary',
                  border: '1px solid',
                  borderColor: isSelected ? GREEN : isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
                }}
              />
            );
          })}
        </Box>
      )}

      {isLoading && (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2.5 }}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Paper key={index} sx={{ p: 3, borderRadius: '20px' }}>
              <Skeleton variant="text" width="60%" height={30} sx={{ mb: 1.5 }} />
              <Skeleton variant="rectangular" height={88} sx={{ borderRadius: 3, mb: 2 }} />
              <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 2 }} />
            </Paper>
          ))}
        </Box>
      )}

      <Stack spacing={5}>
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category: any) => (
            <Box key={category.id}>
              <Box sx={{ mb: 2.25, display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box sx={{ width: 4, height: 26, borderRadius: 2, background: `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})` }} />
                <Typography sx={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: { xs: '1.25rem', sm: '1.45rem' } }}>
                  {category.name}
                </Typography>
                <Chip
                  label={`${category.exams.length} papers`}
                  size="small"
                  sx={{ bgcolor: isDark ? 'rgba(46,139,87,0.18)' : 'rgba(27,107,58,0.1)', color: isDark ? '#A7F3D0' : GREEN, fontWeight: 800 }}
                />
              </Box>
              <Grid container spacing={2.5}>
                {category.exams.map((exam: ExamItem) => {
                  const bestScore = bestScores[String(exam.id)];
                  const attempted = bestScore !== undefined;
                  return (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={exam.id}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.5,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: '20px',
                          bgcolor: isDark ? '#161B22' : '#FFFFFF',
                          border: '1.5px solid',
                          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)',
                          boxShadow: isDark ? '0 12px 28px rgba(0,0,0,0.28)' : '0 10px 28px rgba(15,23,42,0.05)',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${GREEN}, ${GREEN_LIGHT})` }} />
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.25, pt: 0.5 }}>
                          <Chip
                            label={`YEAR ${exam.year ?? '—'}`}
                            size="small"
                            sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9', fontSize: '0.65rem', fontWeight: 800, height: 22 }}
                          />
                          <Chip
                            label={attempted ? `Best: ${bestScore}%` : 'Not attempted'}
                            size="small"
                            sx={{
                              bgcolor: attempted ? 'rgba(34,197,94,0.12)' : isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                              color: attempted ? '#16A34A' : 'text.secondary',
                              fontSize: '0.65rem',
                              fontWeight: 800,
                              height: 22,
                            }}
                          />
                        </Stack>
                        <Typography
                          component="button"
                          onClick={() => router.push(examHubPath(exam))}
                          sx={{
                            fontFamily: "'Cabinet Grotesk', sans-serif",
                            fontWeight: 800,
                            fontSize: '1.12rem',
                            lineHeight: 1.3,
                            mb: 2,
                            textAlign: 'left',
                            border: 0,
                            background: 'none',
                            cursor: 'pointer',
                            color: 'text.primary',
                            p: 0,
                            '&:hover': { color: GREEN },
                          }}
                        >
                          {exam.name}
                        </Typography>
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 1,
                            p: 1.25,
                            borderRadius: '12px',
                            bgcolor: isDark ? 'rgba(255,255,255,0.04)' : '#F8FAFC',
                            border: '1px solid',
                            borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#E2E8F0',
                            mb: 2,
                          }}
                        >
                          <Stack alignItems="center">
                            <TimerIcon sx={{ color: GREEN_LIGHT, fontSize: 16, mb: 0.35 }} />
                            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800 }}>{examDuration(exam)}m</Typography>
                            <Typography sx={{ fontSize: '0.55rem', color: 'text.secondary' }}>Duration</Typography>
                          </Stack>
                          <Stack alignItems="center" sx={{ borderLeft: '1px solid', borderRight: '1px solid', borderColor: 'divider' }}>
                            <AssignmentIcon sx={{ color: GREEN_LIGHT, fontSize: 16, mb: 0.35 }} />
                            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800 }}>{examQuestionCount(exam)}</Typography>
                            <Typography sx={{ fontSize: '0.55rem', color: 'text.secondary' }}>MCQs</Typography>
                          </Stack>
                          <Stack alignItems="center">
                            <GavelOutlined sx={{ color: AMBER, fontSize: 16, mb: 0.35 }} />
                            <Typography sx={{ fontSize: '0.72rem', fontWeight: 800 }}>-0.33</Typography>
                            <Typography sx={{ fontSize: '0.55rem', color: 'text.secondary' }}>Wrong</Typography>
                          </Stack>
                        </Box>
                        <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
                          <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => handleOpenSyllabus(exam)}
                            sx={{ py: 1, fontSize: '0.78rem', borderRadius: '12px', textTransform: 'none', fontWeight: 800, borderColor: 'divider', color: 'text.primary' }}
                          >
                            Syllabus
                          </Button>
                          <Button
                            variant="contained"
                            fullWidth
                            onClick={() => startMock(exam)}
                            startIcon={<PlayArrowIcon sx={{ fontSize: '0.95rem !important' }} />}
                            sx={{
                              py: 1,
                              fontSize: '0.78rem',
                              borderRadius: '12px',
                              textTransform: 'none',
                              fontWeight: 800,
                              background: `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})`,
                              '&:hover': { background: `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})`, filter: 'brightness(1.06)' },
                            }}
                          >
                            Start mock
                          </Button>
                        </Stack>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          ))
        ) : (
          !isLoading && (
            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '20px' }}>
              <Typography sx={{ color: 'text.secondary', fontWeight: 700 }}>No mock papers match that search.</Typography>
              <Button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }} sx={{ mt: 1.5, textTransform: 'none', fontWeight: 800, color: GREEN }}>
                Clear filters
              </Button>
            </Paper>
          )
        )}
      </Stack>

      <Dialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: isDark ? '#161B22' : '#FFFFFF',
            backgroundImage: 'none',
            color: 'text.primary',
            borderRadius: '24px',
            p: 1.5,
            maxWidth: 420,
            boxShadow: '0 28px 64px rgba(15,23,42,0.28)',
          },
        }}
      >
        <DialogTitle sx={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 900, textAlign: 'center', fontSize: '1.4rem', pb: 1, color: 'text.primary' }}>
          Log in to start the mock
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6, fontWeight: 500 }}>
            Full papers need an account so we can save your score, XP, and the questions you miss. After login we open this mock directly.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ flexDirection: 'column', gap: 1.25, px: 3, pb: 3 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => goAfterAuth(pendingPath)}
            sx={{ py: 1.3, borderRadius: '12px', fontWeight: 800, textTransform: 'none', color: '#fff', background: `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})` }}
          >
            Continue to login
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => router.push(`/register?next=${encodeURIComponent(pendingPath)}`)}
            sx={{ py: 1.3, borderRadius: '12px', fontWeight: 800, textTransform: 'none', mt: '0 !important', borderColor: '#CBD5E1', color: 'text.primary' }}
          >
            Create a free account
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={syllabusOpen}
        onClose={() => setSyllabusOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: isDark ? '#161B22' : '#FFFFFF', backgroundImage: 'none', borderRadius: '24px', p: 1 } }}
      >
        <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ color: GREEN, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Exam syllabus
            </Typography>
            <Typography variant="h5" sx={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 900, pr: 4 }}>
              {selectedExamForSyllabus?.name}
            </Typography>
          </Stack>
          <IconButton onClick={() => setSyllabusOpen(false)} sx={{ position: 'absolute', right: 16, top: 16 }}>
            <Typography sx={{ fontSize: '1.25rem' }}>✕</Typography>
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 3 }}>
          {selectedSyllabus?.details ? (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                Structure
              </Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.7, bgcolor: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', p: 2, borderRadius: '12px' }}>
                {selectedSyllabus.details}
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1} alignItems="center" sx={{ py: 2, textAlign: 'center', mb: 2 }}>
              <SchoolIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
              <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 360 }}>
                Chapter notes are still being attached for this paper. You can start the mock with the official mark split below.
              </Typography>
            </Stack>
          )}
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
            Subject weightage
          </Typography>
          <Stack spacing={1.5}>
            {syllabusWeightRows.map((sub: any, idx: number) => (
              <Box key={`${sub.subject}-${idx}`}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{sub.subject}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: GREEN }}>{sub.weight}{typeof sub.weight === 'number' ? '%' : ''}</Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={typeof sub.weight === 'number' ? Math.min(100, sub.weight) : 0}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: isDark ? 'rgba(255,255,255,0.06)' : '#E2E8F0',
                    '& .MuiLinearProgress-bar': { borderRadius: 3, background: `linear-gradient(90deg, ${GREEN}, ${GREEN_LIGHT})` },
                  }}
                />
              </Box>
            ))}
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          {selectedExamForSyllabus?.slug && (
            <Button
              variant="outlined"
              startIcon={<MenuBookIcon />}
              onClick={() => router.push(examHubPath(selectedExamForSyllabus))}
              sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 800 }}
            >
              Open exam page
            </Button>
          )}
          <Button
            variant="contained"
            onClick={() => {
              setSyllabusOpen(false);
              if (selectedExamForSyllabus) startMock(selectedExamForSyllabus);
            }}
            sx={{ borderRadius: '12px', textTransform: 'none', fontWeight: 800, background: `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})` }}
          >
            Start full mock
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
