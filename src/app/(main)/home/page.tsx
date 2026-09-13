'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Box, Typography, Button, CircularProgress, Grid,
  LinearProgress, Stack, useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import BoltIcon from '@mui/icons-material/Bolt';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import QuizIcon from '@mui/icons-material/Quiz';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';
import MasterPlanRoadmap from '@/components/MasterPlanRoadmap';
import ExamCountdownBanner from '@/components/ExamCountdownBanner';
import WeakAreaInterventionCard from '@/components/WeakAreaInterventionCard';
import OfficialSyllabusCard from '@/components/OfficialSyllabusCard';

// ============================================================
// Sub-components
// ============================================================

function StatBadge({ icon, value, label, color }: any) {
  return (
    <Box sx={{
      flex: 1, p: 2,
      bgcolor: 'surface.card',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: '12px',
      textAlign: 'center',
    }}>
      <Box sx={{ color, fontSize: '1.25rem', mb: 0.5 }}>{icon}</Box>
      <Typography sx={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: '1.25rem', color: 'text.primary' }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', mt: 0.25 }}>{label}</Typography>
    </Box>
  );
}

const quickActions = [
  { label: 'Daily Quiz', icon: <QuizIcon />, path: '/quiz', color: '#1B6B3A', bg: 'rgba(27,107,58,0.15)', border: 'rgba(46,139,87,0.2)' },
  { label: 'Mock Tests', icon: <AssignmentIcon />, path: '/exams', color: '#7C3AED', bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.2)' },
  { label: 'Current Affairs', icon: <NewspaperIcon />, path: '/current-affairs', color: '#2563EB', bg: 'rgba(37,99,235,0.15)', border: 'rgba(37,99,235,0.2)' },
  { label: 'Leaderboard', icon: <LeaderboardIcon />, path: '/leaderboard', color: '#D97706', bg: 'rgba(217,119,6,0.15)', border: 'rgba(217,119,6,0.2)' },
];

export default function HomePage() {
  const theme = useTheme();
  const { profile, fetcher, user, isLoading: ctxLoading, refreshProfile } = useAppContext();
  const router = useRouter();
  const [savingMode, setSavingMode] = useState(false);

  useEffect(() => {
    if (!ctxLoading) {
      if (!user) {
        router.push('/login?next=/home');
      } else if (profile?.is_owner !== true && (!profile?.preferred_exams || profile.preferred_exams.length === 0)) {
        router.push('/onboarding');
      }
    }
  }, [user, profile, ctxLoading, router]);

  // Fetch progress dashboard
  const { data: dashData, isLoading: dashLoading } = useSWR(
    user ? '/my-progress-dashboard/' : null, fetcher
  );
  const { data: syllabusData } = useSWR(
    user ? '/syllabus-sections/' : null, fetcher
  );

  const streak = profile?.current_streak || 0;
  const xp = profile?.total_xp || 0;
  const level = profile?.level || 1;
  const username = profile?.user?.first_name || profile?.user?.username || 'Student';

  const answeredToday = dashData?.questions_today || 0;
  const dailyGoal = dashData?.daily_goal || 20;
  const goalRemaining = Math.max(0, dailyGoal - answeredToday);
  const goalProgress = Math.min(Math.round((answeredToday / dailyGoal) * 100), 100);
  const focusSection = syllabusData?.focus_section || syllabusData?.weak_sections?.[0] || dashData?.weakest_topics?.[0];
  const focusName = focusSection?.title || focusSection?.name || focusSection?.title;
  const practiceMode = profile?.practice_mode === 'focus' ? 'focus' : 'full';
  const focusQuizPath = focusSection?.key
    ? `/quiz?section=${encodeURIComponent(focusSection.key)}&limit=15`
    : '/quiz';
  const todayQuizPath = practiceMode === 'focus' ? focusQuizPath : '/quiz';

  const setPracticeMode = async (mode: 'full' | 'focus') => {
    if (mode === practiceMode || savingMode) return;
    setSavingMode(true);
    try {
      await apiClient.patch('/auth/profile/', { practice_mode: mode });
      await refreshProfile();
    } finally {
      setSavingMode(false);
    }
  };

  const mission = (() => {
    if (streak > 0 && answeredToday === 0) {
      return {
        eyebrow: `${streak}-day streak at risk`,
        title: `Save today's streak, ${username.split(' ')[0]}`,
        body: 'One PSC question keeps the chain. Rank files are built on days you did not feel like studying.',
        cta: 'Answer 1 question',
        path: '/feed',
      };
    }
    if (answeredToday < dailyGoal) {
      return {
        eyebrow: practiceMode === 'focus' ? 'Focus practice' : 'Full syllabus mix',
        title: `${goalRemaining} left for today's ${dailyGoal}-question goal`,
        body: practiceMode === 'focus' && focusName
          ? `Next set: ${focusName}. More from the sections that cost you marks.`
          : 'Mixed questions from your exam paper. Short sessions beat weekend marathons.',
        cta: practiceMode === 'focus' && focusName ? `Practice ${focusName}` : "Start today's set",
        path: todayQuizPath,
      };
    }
    if (focusSection?.key || focusSection?.slug) {
      return {
        eyebrow: 'Daily goal locked',
        title: `Raise ${focusName} — that is cut-off marks`,
        body: 'You already showed up today. One weak-section drill is how rank moves this week.',
        cta: `Drill ${focusName}`,
        path: focusSection.key
          ? `/quiz?section=${encodeURIComponent(focusSection.key)}&limit=15`
          : `/topics/${focusSection.slug}`,
      };
    }
    return {
      eyebrow: 'Daily goal locked',
      title: 'Open a mock or current affairs',
      body: "Habit is done. Growth is a full paper or today's CA set.",
      cta: 'Mock tests',
      path: '/exams',
    };
  })();

  if (ctxLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* Target Exam Goal & Live Countdown Banner */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.5 }}>
        <Box sx={{ mb: 3 }}>
          <ExamCountdownBanner
            primaryExam={profile?.primary_exam_detail || profile?.preferred_exams?.[0]}
          />
        </Box>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.45 }}>
        <Box
          sx={{
            mb: 3,
            p: { xs: 2.5, md: 3 },
            borderRadius: '20px',
            border: '1px solid rgba(46,139,87,0.28)',
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(27,107,58,0.28) 0%, rgba(15,23,42,0.9) 100%)'
                : 'linear-gradient(135deg, rgba(27,107,58,0.12) 0%, #ffffff 100%)',
          }}
        >
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1B6B3A', mb: 0.75 }}>
            {mission.eyebrow}
          </Typography>
          <Typography sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, fontSize: { xs: '1.2rem', md: '1.4rem' }, color: 'text.primary', lineHeight: 1.25 }}>
            {mission.title}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.88rem', mt: 1, lineHeight: 1.55 }}>
            {mission.body}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={goalProgress}
            sx={{
              height: 8, borderRadius: 4, mt: 2, mb: 0.75,
              bgcolor: 'rgba(136, 146, 164, 0.16)',
              '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #1B6B3A, #22c55e)', borderRadius: 4 },
            }}
          />
          <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mb: 1.5 }}>
            {answeredToday}/{dailyGoal} questions today · streak {streak} day{streak === 1 ? '' : 's'}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            {[
              { key: 'full', label: 'Full syllabus' },
              { key: 'focus', label: 'Focus areas' },
            ].map((item) => {
              const active = practiceMode === item.key;
              return (
                <Button
                  key={item.key}
                  size="small"
                  disabled={savingMode}
                  onClick={() => setPracticeMode(item.key as 'full' | 'focus')}
                  variant={active ? 'contained' : 'outlined'}
                  sx={{
                    flex: 1,
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 2,
                    py: 0.75,
                    ...(active
                      ? { background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)' }
                      : { borderColor: 'divider', color: 'text.secondary' }),
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </Stack>
          <Button
            variant="contained"
            fullWidth
            endIcon={<PlayArrowIcon />}
            onClick={() => router.push(mission.path)}
            sx={{ textTransform: 'none', fontWeight: 800, py: 1.25, borderRadius: 3, background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)' }}
          >
            {mission.cta}
          </Button>
        </Box>
      </motion.div>

      {/* Official Kerala PSC Examination Syllabus Breakdown */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
        <Box sx={{ mb: 3 }}>
          <OfficialSyllabusCard
            examName={profile?.primary_exam_detail?.name || profile?.preferred_exams?.[0]?.name || syllabusData?.exam_name || 'LGS / VFA 2026'}
            officialSyllabus={
              syllabusData?.sections?.length
                ? {
                    total_marks: syllabusData.total_marks,
                    subjects: syllabusData.sections.map((section: any) => ({
                      title: section.title,
                      marks: section.marks,
                      color: section.color,
                      topics: (section.topics || []).slice(0, 8).map((topic: any) => topic.name),
                    })),
                  }
                : profile?.primary_exam_detail?.official_syllabus
            }
            questionPattern={profile?.primary_exam_detail?.question_pattern}
          />
          <Button
            fullWidth
            variant="outlined"
            onClick={() => router.push('/topics')}
            sx={{ mt: 1.5, textTransform: 'none', fontWeight: 800, borderRadius: 3 }}
          >
            Study by syllabus section
          </Button>
        </Box>
      </motion.div>

      {/* Shared Master Study Plan Roadmap */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}>
        <Box sx={{ mb: 3 }}>
          <MasterPlanRoadmap examId={profile?.primary_exam_detail?.id || profile?.preferred_exams?.[0]?.id} />
        </Box>
      </motion.div>

      {/* Smart Weak Area Intervention Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.5 }}>
        <Box sx={{ mb: 3 }}>
          <WeakAreaInterventionCard
            weakTopics={syllabusData?.weak_sections || dashData?.weakest_topics}
            examName={profile?.primary_exam_detail?.name || profile?.preferred_exams?.[0]?.name || syllabusData?.exam_name || 'LGS 2026'}
          />
        </Box>
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
        <Typography sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', mb: 1.5 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={1.5} sx={{ mb: 3 }}>
          {quickActions.map((action, i) => (
            <Grid size={{ xs: 6, sm: 3 }} key={action.label}>
              <motion.div whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <Box
                  onClick={() => router.push(action.path)}
                  sx={{
                    p: 2, textAlign: 'center',
                    background: action.bg,
                    border: `1px solid ${action.border}`,
                    borderRadius: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Box sx={{ color: action.color, mb: 0.75, '& .MuiSvgIcon-root': { fontSize: '1.5rem' } }}>
                    {action.icon}
                  </Box>
                  <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, color: 'text.primary' }}>
                    {action.label}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* --- BOTTOM SECTION: GAMIFICATION, GOALS & MOTIVATION --- */}

      {/* Stat Badges */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.5 }}>
        <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
          <StatBadge icon={<LocalFireDepartmentIcon sx={{ fontSize: 20 }} />} value={streak} label="Day Streak" color="#FF6B2B" />
          <StatBadge icon={<BoltIcon sx={{ fontSize: 20 }} />} value={`${xp.toLocaleString()}`} label="Total XP" color="#8B5CF6" />
          <StatBadge
            icon={<Box sx={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: '0.85rem' }}>Lv</Box>}
            value={level}
            label="Level"
            color="#2E8B57"
          />
          <StatBadge
            icon={<QuizIcon sx={{ fontSize: 20 }} />}
            value={answeredToday}
            label="Today"
            color="#F59E0B"
          />
        </Stack>
      </motion.div>

      {/* Study Feed CTA */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26, duration: 0.5 }}>
        <Box
          onClick={() => router.push('/feed')}
          sx={{
            p: 3,
            background: 'linear-gradient(135deg, rgba(27,107,58,0.2), rgba(27,107,58,0.05))',
            border: '1px solid rgba(46,139,87,0.2)',
            borderRadius: '20px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            transition: 'all 0.3s ease',
            '&:hover': { border: '1px solid rgba(46,139,87,0.4)', transform: 'translateY(-2px)' },
          }}
        >
          <Box>
            <Typography sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, fontSize: '1.1rem', color: 'text.primary' }}>
              Study Feed — mix, miss, repeat
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', mt: 0.25 }}>
              New questions plus the ones you got wrong. That loop is the rank.
            </Typography>
          </Box>
          <Button
            variant="contained"
            endIcon={<PlayArrowIcon />}
            sx={{ flexShrink: 0, background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)' }}
          >
            Open
          </Button>
        </Box>
      </motion.div>
    </Box>
  );
}