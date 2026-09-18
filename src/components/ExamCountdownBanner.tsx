'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import DateRangeIcon from '@mui/icons-material/DateRange';
import AssignmentIcon from '@mui/icons-material/Assignment';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StartLearningModal from '@/components/StartLearningModal';
import { useRouter } from 'next/navigation';
import { CatalogExam, approxExamDate, formatCatalogExamDate, parseExamDate } from '@/lib/exams';
import { formatVfaCatalogDate, isVfaExam, resolveVfaExamDate, vfaDistrictName, vfaPhaseForDistrict, VFA_DATE_SUMMARY_LONG } from '@/lib/vfaSchedule';

const GREEN = '#1B6B3A';
const GREEN_LIGHT = '#2E8B57';

interface ExamCountdownBannerProps {
  primaryExam?: {
    id: number;
    name: string;
    slug?: string;
    category_number?: string;
    expected_exam_date?: string;
  };
  availableExams?: CatalogExam[];
  onExamChange?: (examId: number) => Promise<void> | void;
  changingExam?: boolean;
  changeError?: string;
  district?: string | null;
}

const defaultDates: Record<string, string> = {
  'Company Board LGS': '2026-07-18',
  'Last Grade Servant': '2026-08-01',
  LGS: '2026-08-01',
  'Lower Division Clerk': '2026-08-15',
  LDC: '2026-08-15',
  'Village Field Assistant': '2026-09-19',
  VFA: '2026-09-19',
  'KSEB Electricity Worker': '2026-09-05',
  'Fire & Rescue Officer': '2026-09-26',
  Fireman: '2026-09-26',
  'KSRTC Conductor': '2026-10-03',
  'Degree Level': '2026-10-10',
  'University LGS': '2026-10-24',
  'Secretariat Assistant': '2026-11-07',
  'Sub Inspector of Police': '2026-11-21',
  'SI Police': '2026-11-21',
  'Civil Excise Officer': '2026-12-05',
};

const defaultCategoryNumbers: Record<string, string> = {
  'Company Board LGS': 'Cat. No. 423/2023',
  'Last Grade Servant': 'Cat. No. 701/2024',
  LGS: 'Cat. No. 701/2024',
  'Lower Division Clerk': 'Cat. No. 501/2023',
  LDC: 'Cat. No. 501/2023',
  'Village Field Assistant': 'Cat. No. 571/2023',
  VFA: 'Cat. No. 571/2023',
  'KSEB Electricity Worker': 'Cat. No. 612/2023',
  'Fire & Rescue Officer': 'Cat. No. 330/2024',
  'KSRTC Conductor': 'Cat. No. 410/2024',
  'Degree Level': 'Cat. No. 112/2024',
  'University LGS': 'Cat. No. 215/2024',
  'Secretariat Assistant': 'Cat. No. 089/2024',
  'Sub Inspector of Police': 'Cat. No. 045/2024',
  'Civil Excise Officer': 'Cat. No. 198/2024',
};

function lookupByName(table: Record<string, string>, name?: string) {
  if (!name) return undefined;
  if (table[name]) return table[name];
  const lower = name.toLowerCase();
  const match = Object.entries(table).find(([key]) => lower.includes(key.toLowerCase()));
  return match?.[1];
}

function resolveExamDate(raw?: string | null, name?: string, slug?: string, district?: string | null) {
  if (isVfaExam({ name, slug })) {
    return parseExamDate(resolveVfaExamDate(district)) || parseExamDate('2026-09-19')!;
  }
  const fromApi = parseExamDate(raw) || parseExamDate(approxExamDate({ name, slug, expected_exam_date: raw }, district));
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (fromApi && fromApi >= now) return fromApi;
  const fallback = parseExamDate(lookupByName(defaultDates, name) || '2026-08-15');
  if (fallback && fallback >= now) return fallback;
  if (fallback) {
    fallback.setFullYear(now.getFullYear() + 1);
    return fallback;
  }
  return new Date(now.getFullYear(), 7, 15);
}

export default function ExamCountdownBanner({
  primaryExam,
  availableExams = [],
  onExamChange,
  changingExam = false,
  changeError = '',
  district = null,
}: ExamCountdownBannerProps) {
  const examName = primaryExam?.name || 'Kerala PSC';
  const vfaExam = isVfaExam({ name: examName, slug: primaryExam?.slug });
  const targetDate = resolveExamDate(primaryExam?.expected_exam_date, examName, primaryExam?.slug, district);
  const targetDateStr = targetDate.toISOString();
  const catNumber = primaryExam?.category_number || lookupByName(defaultCategoryNumbers, examName) || 'Kerala PSC';
  const districtName = vfaDistrictName(district);
  const dateCaption = vfaExam
    ? districtName
      ? `Your VFA exam date (${districtName})`
      : 'VFA exam dates (district-wise)'
    : 'Approximate exam date';
  const dateValue = vfaExam
    ? districtName
      ? vfaPhaseForDistrict(district)?.label || formatVfaCatalogDate(district)
      : VFA_DATE_SUMMARY_LONG
    : null;

  const [mounted, setMounted] = useState(false);
  const [learningModalOpen, setLearningModalOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const calculateTimeLeft = () => {
      const difference = +targetDate - +new Date();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDateStr]);

  const filteredExams = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = query
      ? availableExams.filter((exam) => {
          const hay = `${exam.name} ${exam.category || ''} ${exam.category_number || ''}`.toLowerCase();
          return hay.includes(query);
        })
      : availableExams;
    return [...list].sort((a, b) => {
      const da = resolveExamDate(a.expected_exam_date, a.name, a.slug, district).getTime();
      const db = resolveExamDate(b.expected_exam_date, b.name, b.slug, district).getTime();
      return da - db;
    });
  }, [availableExams, search, district]);

  const handleSelect = async (examId: number) => {
    if (!onExamChange || examId === primaryExam?.id || changingExam) return;
    try {
      await onExamChange(examId);
      setPickerOpen(false);
      setSearch('');
    } catch {
      // Parent surfaces the error; keep the picker open so the student can retry.
    }
  };

  const groupedExams = useMemo(() => {
    const map = new Map<string, CatalogExam[]>();
    filteredExams.forEach((exam) => {
      const key = exam.category || 'Other PSC exams';
      const list = map.get(key) || [];
      list.push(exam);
      map.set(key, list);
    });
    return Array.from(map.entries()).map(([category, exams]) => ({ category, exams }));
  }, [filteredExams]);

  const canChange = Boolean(onExamChange) && availableExams.length > 0;

  return (
    <>
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: 5,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(27, 107, 58, 0.22) 0%, rgba(15, 23, 42, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(27, 107, 58, 0.10) 0%, #ffffff 100%)',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 12px 32px rgba(0,0,0,0.06)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Chip
                  label="Primary target exam"
                  icon={<LocalFireDepartmentIcon sx={{ fontSize: '0.85rem !important', color: `${GREEN_LIGHT} !important` }} />}
                  sx={{ bgcolor: 'rgba(46, 139, 87, 0.12)', color: GREEN_LIGHT, fontWeight: 800, fontSize: '0.75rem' }}
                />
                <Chip
                  label={catNumber}
                  icon={<AssignmentIcon sx={{ fontSize: '0.85rem !important', color: '#3B82F6 !important' }} />}
                  sx={{ bgcolor: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6', fontWeight: 800, fontSize: '0.75rem' }}
                />
                {canChange && (
                  <Button
                    size="small"
                    startIcon={changingExam ? <CircularProgress size={14} color="inherit" /> : <SwapHorizIcon />}
                    onClick={() => setPickerOpen(true)}
                    disabled={changingExam}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 800,
                      borderRadius: '10px',
                      color: GREEN,
                      border: '1.5px solid',
                      borderColor: GREEN,
                      px: 1.25,
                      py: 0.4,
                    }}
                  >
                    Change exam
                  </Button>
                )}
              </Stack>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: { xs: '1.5rem', sm: '1.85rem' },
                  lineHeight: 1.2,
                }}
              >
                {examName}
              </Typography>

              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
                <DateRangeIcon sx={{ fontSize: 16, mr: 0.75, mb: '-3px', color: GREEN_LIGHT }} />
                {dateCaption}:{' '}
                <strong>
                  {mounted
                    ? dateValue || targetDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                    : 'Upcoming 2026 session'}
                </strong>
                <Typography component="span" sx={{ display: 'block', mt: 0.4, fontSize: '0.75rem', color: 'text.secondary' }}>
                  {vfaExam
                    ? districtName
                      ? 'Kerala PSC is conducting VFA on three Saturdays. This countdown uses your profile district.'
                      : 'Set your district in Profile to see the exact Saturday for your centre. Countdown currently follows the next VFA batch.'
                    : 'PSC can shift the official date. This countdown follows the latest expected schedule for this exam.'}
                </Typography>
              </Typography>

              {changeError && (
                <Alert severity="error" sx={{ borderRadius: '12px' }}>{changeError}</Alert>
              )}

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<RocketLaunchIcon />}
                  onClick={() => setLearningModalOpen(true)}
                  sx={{
                    background: `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})`,
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: '0.85rem',
                    textTransform: 'none',
                    borderRadius: '14px',
                    px: 3,
                    py: 1.2,
                    boxShadow: '0 8px 20px rgba(27, 107, 58, 0.3)',
                    '&:hover': { background: 'linear-gradient(135deg, #166534, #1B6B3A)' },
                  }}
                >
                  Start learning
                </Button>

                <Button
                  variant="outlined"
                  endIcon={<PlayArrowIcon />}
                  onClick={() => router.push('/feed')}
                  sx={{
                    borderColor: GREEN,
                    color: GREEN,
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    textTransform: 'none',
                    borderRadius: '14px',
                    px: 2.5,
                    py: 1.2,
                    '&:hover': { borderColor: GREEN_LIGHT, bgcolor: 'rgba(46, 139, 87, 0.08)' },
                  }}
                >
                  Continue learning
                </Button>
              </Stack>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.9)',
                p: 2.5,
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                textAlign: 'center',
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Time remaining until exam
              </Typography>

              <Stack direction="row" justifyContent="center" spacing={1.5} sx={{ mt: 1.5 }}>
                {[
                  { label: 'DAYS', val: timeLeft.days },
                  { label: 'HRS', val: timeLeft.hours },
                  { label: 'MINS', val: timeLeft.minutes },
                  { label: 'SECS', val: timeLeft.seconds },
                ].map((item) => (
                  <Box
                    key={item.label}
                    sx={{
                      minWidth: 50,
                      p: 1,
                      borderRadius: 2.5,
                      bgcolor: 'rgba(46, 139, 87, 0.1)',
                      border: '1px solid rgba(46, 139, 87, 0.2)',
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 900,
                        fontSize: '1.2rem',
                        color: GREEN_LIGHT,
                        lineHeight: 1,
                      }}
                    >
                      {String(item.val).padStart(2, '0')}
                    </Typography>
                    <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: 'text.secondary', mt: 0.5 }}>
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Dialog
        open={pickerOpen}
        onClose={() => !changingExam && setPickerOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: '20px' } }}
      >
        <DialogTitle sx={{ fontWeight: 900, pr: 6 }}>
          Change target exam
          <IconButton
            onClick={() => setPickerOpen(false)}
            disabled={changingExam}
            sx={{ position: 'absolute', right: 12, top: 12 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: 'text.secondary', mb: 2, fontSize: '0.9rem' }}>
            Home, syllabus, study plan, and quiz mix follow this exam — including its approximate date.
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Search LDC, LGS, VFA, Degree..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          {changeError && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{changeError}</Alert>}
          <Stack spacing={1} sx={{ maxHeight: 420, overflowY: 'auto', pb: 1 }}>
            {filteredExams.length === 0 && (
              <Typography sx={{ color: 'text.secondary', py: 3, textAlign: 'center' }}>
                No exam matches that search.
              </Typography>
            )}
            {groupedExams.map((group) => (
              <Box key={group.category}>
                <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.secondary', px: 0.5, pt: 1, pb: 0.75 }}>
                  {group.category}
                </Typography>
                <Stack spacing={1}>
                  {group.exams.map((exam) => {
                    const selected = exam.id === primaryExam?.id;
                    const dateLabel = formatCatalogExamDate(exam, district);
                    return (
                      <Box
                        key={exam.id}
                        onClick={() => handleSelect(exam.id)}
                        sx={{
                          p: 1.75,
                          borderRadius: '14px',
                          border: '1.5px solid',
                          borderColor: selected ? GREEN : 'divider',
                          background: selected
                            ? 'linear-gradient(135deg, rgba(27,107,58,0.16), rgba(46,139,87,0.06))'
                            : 'transparent',
                          cursor: changingExam ? 'wait' : 'pointer',
                          opacity: changingExam && !selected ? 0.6 : 1,
                          '&:hover': { borderColor: GREEN_LIGHT },
                        }}
                      >
                        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 800, color: 'text.primary' }}>{exam.name}</Typography>
                            <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', mt: 0.25 }}>
                              Approx. {dateLabel}
                            </Typography>
                          </Box>
                          {selected ? (
                            <CheckCircleIcon sx={{ color: GREEN_LIGHT }} />
                          ) : changingExam ? (
                            <CircularProgress size={18} sx={{ color: GREEN_LIGHT }} />
                          ) : null}
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
            ))}
          </Stack>
        </DialogContent>
      </Dialog>

      <StartLearningModal
        open={learningModalOpen}
        onClose={() => setLearningModalOpen(false)}
        examName={examName}
      />
    </>
  );
}
