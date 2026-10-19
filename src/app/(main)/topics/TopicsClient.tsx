'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import {
  Box, Typography, Alert, CircularProgress, Paper,
  TextField, InputAdornment, Container, Stack,
  Button, Chip, LinearProgress, MenuItem, Divider,
} from '@mui/material';
import { useAppContext } from '@/context/AppContext';
import SearchIcon from '@mui/icons-material/Search';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

function statusLine(section: { attempted?: number; accuracy?: number; is_weak?: boolean }) {
  if (!section.attempted) return 'Not started';
  if (section.is_weak) return `${section.accuracy}% — this part is costing marks`;
  return `${section.accuracy}% from ${section.attempted} answers`;
}

function SectionCard({
  section,
  startHere,
  showProgress,
  onSection,
  onPart,
}: {
  section: any;
  startHere: boolean;
  showProgress: boolean;
  onSection: () => void;
  onPart: (key: string) => void;
}) {
  const parts = section.subdivisions || [];
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.25 },
        borderRadius: '16px',
        border: '1px solid',
        borderColor: startHere ? 'rgba(27,107,58,0.45)' : 'divider',
        bgcolor: 'background.paper',
        borderLeft: '4px solid',
        borderLeftColor: section.color || '#1B6B3A',
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
        <Box sx={{ minWidth: 0, flex: 1 }}>
          {startHere && (
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.08em', color: '#1B6B3A', mb: 0.5 }}>
              START HERE
            </Typography>
          )}
          <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.3 }}>
            {section.title}
          </Typography>
          {section.title_ml ? (
            <Typography sx={{ color: 'text.secondary', fontSize: '0.82rem', mt: 0.25 }}>
              {section.title_ml}
            </Typography>
          ) : null}
          <Typography sx={{ color: 'text.secondary', fontSize: '0.82rem', mt: 0.75 }}>
            {showProgress ? `${statusLine(section)} · ` : ''}
            {section.marks} marks · {section.question_count || 0} questions
          </Typography>
          {showProgress && section.attempted > 0 && (
            <LinearProgress
              variant="determinate"
              value={Math.min(100, section.accuracy || 0)}
              sx={{
                mt: 1,
                maxWidth: 280,
                height: 6,
                borderRadius: 4,
                bgcolor: 'divider',
                '& .MuiLinearProgress-bar': { bgcolor: section.is_weak ? '#EF4444' : (section.color || '#1B6B3A') },
              }}
            />
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={onSection}
          sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '12px', alignSelf: { xs: 'stretch', sm: 'center' }, flexShrink: 0 }}
        >
          Practise 15
        </Button>
      </Stack>
      {parts.length > 0 && (
        <Box sx={{ mt: 1.75 }}>
          <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.06em', color: 'text.secondary', mb: 0.75 }}>
            CHAPTERS IN {section.title.toUpperCase()}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {parts.map((part: any) => (
              <Chip
                key={part.key}
                label={`${part.name} · ${part.question_count}`}
                onClick={() => onPart(part.key)}
                variant="outlined"
                sx={{ fontWeight: 700, borderRadius: '10px' }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
}

export default function TopicsClient() {
  const { fetcher, user } = useAppContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [pickedSlug, setPickedSlug] = useState(searchParams.get('exam') || '');

  const syllabusKey = pickedSlug
    ? `/syllabus-sections/?exam_slug=${encodeURIComponent(pickedSlug)}`
    : '/syllabus-sections/';
  const { data: syllabus, error, isLoading } = useSWR(syllabusKey, fetcher);

  const exams = syllabus?.available_exams || [];
  const selectedSlug = pickedSlug || syllabus?.exam_slug || '';

  const visibleSections = useMemo(() => {
    const sections = syllabus?.sections || [];
    const q = searchQuery.trim().toLowerCase();
    const matched = !q
      ? sections
      : sections
          .map((section: any) => {
            const titleHit = `${section.title} ${section.title_ml || ''}`.toLowerCase().includes(q);
            const parts = (section.subdivisions || []).filter((part: any) =>
              `${part.name} ${section.title}`.toLowerCase().includes(q)
            );
            return { ...section, subdivisions: titleHit ? section.subdivisions : parts, _hit: titleHit || parts.length > 0 };
          })
          .filter((section: any) => section._hit);
    const focusKey = syllabus?.focus_section?.key;
    if (!focusKey) return matched;
    const focus = matched.find((section: any) => section.key === focusKey);
    if (!focus) return matched;
    return [focus, ...matched.filter((section: any) => section.key !== focusKey)];
  }, [syllabus, searchQuery]);

  const openPractice = (sectionKey: string, partKey?: string) => {
    const params = new URLSearchParams({ section: sectionKey, limit: '15' });
    if (partKey) params.set('subdivision', partKey);
    if (syllabus?.exam_id) params.set('exam_id', String(syllabus.exam_id));
    else if (selectedSlug) params.set('exam', selectedSlug);
    const next = `/quiz?${params.toString()}`;
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }
    router.push(next);
  };

  const upcoming = exams.filter((exam: any) => exam.upcoming);
  const others = exams.filter((exam: any) => !exam.upcoming);
  const demandPapers = [
    { slug: 'assistant-ld-clerk-main-2026', label: '5 December syllabus' },
    { slug: 'university-assistant', label: 'University Assistant' },
  ];

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 4 } }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 800, fontSize: { xs: '1.7rem', sm: '2rem' }, lineHeight: 1.2 }}
        >
          {syllabus?.exam_name || 'Syllabus'}
        </Typography>
        <Typography sx={{ color: 'text.secondary', mt: 0.75, fontSize: '0.95rem', lineHeight: 1.5 }}>
          Subjects of this paper, with each chapter kept inside its subject
          {syllabus?.total_marks ? ` · ${syllabus.total_marks} marks` : ''}
          {syllabus?.duration_minutes ? ` · ${syllabus.duration_minutes} minutes` : ''}.
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Typography sx={{ fontWeight: 800, mb: 0.5 }}>Papers with demand, other than Village Field Assistant</Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.88rem', lineHeight: 1.55 }}>
          The large paper still ahead is on Saturday 5 December 2026. It is one common main exam for Assistant Grade II, LD Clerk, Junior Assistant and the related posts (Category 383/2025, 463/2025 and 573/2025). The biggest of those lists has 62,918 candidates. Current affairs is 15 marks and Kerala administration is 10.
          On this site, the next exam students have selected is University Assistant. Lower Division Typist is held on 11 December, district by district.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1.5 }}>
          {demandPapers.map((paper) => (
            <Button
              key={paper.slug}
              variant={selectedSlug === paper.slug ? 'contained' : 'outlined'}
              onClick={() => setPickedSlug(paper.slug)}
              sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '12px' }}
            >
              {paper.label}
            </Button>
          ))}
          <Button
            variant="text"
            onClick={() => router.push('/exams/assistant-ld-clerk-main-2026')}
            sx={{ textTransform: 'none', fontWeight: 800 }}
          >
            Open the 5 December page
          </Button>
        </Stack>
      </Paper>

      <Stack spacing={1.5} sx={{ mb: 2.5 }}>
        <TextField
          select
          fullWidth
          label="Exam"
          value={selectedSlug}
          onChange={(event) => setPickedSlug(event.target.value)}
          disabled={!exams.length}
        >
          {upcoming.map((exam: any) => (
            <MenuItem key={exam.slug} value={exam.slug}>{exam.name}</MenuItem>
          ))}
          {upcoming.length > 0 && others.length > 0 && <Divider />}
          {others.map((exam: any) => (
            <MenuItem key={exam.slug} value={exam.slug}>{exam.name}</MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          placeholder="Search a subject or chapter..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={32} /></Box>
      ) : error ? (
        <Alert severity="error">Could not load the syllabus. Refresh the page and try again.</Alert>
      ) : visibleSections.length > 0 ? (
        <Stack spacing={1.25}>
          {visibleSections.map((section: any) => (
            <SectionCard
              key={section.key}
              section={section}
              startHere={!searchQuery.trim() && section.key === syllabus?.focus_section?.key}
              showProgress={Boolean(user)}
              onSection={() => openPractice(section.key)}
              onPart={(partKey) => openPractice(section.key, partKey)}
            />
          ))}
        </Stack>
      ) : (
        <Alert severity="info">No subject or chapter matches that search.</Alert>
      )}
    </Container>
  );
}
