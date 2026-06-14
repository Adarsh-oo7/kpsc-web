'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Box, Typography, Button, CircularProgress, Grid,
  LinearProgress, Stack, Chip, Avatar, IconButton
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import BoltIcon from '@mui/icons-material/Bolt';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import QuizIcon from '@mui/icons-material/Quiz';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';

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

function CircularProgressRing({ value, size = 80, color = '#2E8B57', label }: { value: number; size?: number; color?: string; label?: string }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - value / 100);
  return (
    <Box sx={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(136,146,164,0.15)" strokeWidth={8} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <Box sx={{ textAlign: 'center', zIndex: 1 }}>
        <Typography sx={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: '0.9rem', color: 'text.primary', lineHeight: 1 }}>
          {value}%
        </Typography>
        {label && <Typography sx={{ fontSize: '0.55rem', color: 'text.secondary' }}>{label}</Typography>}
      </Box>
    </Box>
  );
}

// Swipeable hero strip cards
function HeroCard({ card, isActive }: { card: any; isActive: boolean }) {
  const router = useRouter();
  return (
    <motion.div
      animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.95 }}
      transition={{ duration: 0.3 }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Box sx={{
        height: '100%',
        background: card.gradient,
        borderRadius: '20px',
        border: card.border,
        p: 3,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <Box>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: 'text.secondary', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {card.label}
          </Typography>
          <Typography sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, fontSize: '1.15rem', color: 'text.primary', mt: 0.5, lineHeight: 1.3 }}>
            {card.title}
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', mt: 0.75, lineHeight: 1.5 }}>
            {card.subtitle}
          </Typography>
        </Box>
        {card.action && (
          <Button
            size="small"
            variant="outlined"
            onClick={() => router.push(card.action.path)}
            sx={{ alignSelf: 'flex-start', color: card.actionColor, borderColor: card.actionColor, fontSize: '0.75rem', py: 0.5, px: 1.5, borderRadius: '8px', mt: 1 }}
          >
            {card.action.label}
          </Button>
        )}
        {card.progress !== undefined && (
          <Box>
            <LinearProgress
              variant="determinate"
              value={card.progress}
              sx={{
                height: 6, borderRadius: 3, mt: 1.5,
                bgcolor: 'rgba(136, 146, 164, 0.15)',
                '& .MuiLinearProgress-bar': { background: card.progressColor, borderRadius: 3 }
              }}
            />
            <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', mt: 0.5 }}>
              {card.progressLabel}
            </Typography>
          </Box>
        )}
      </Box>
    </motion.div>
  );
}

const quickActions = [
  { label: 'Daily Quiz', icon: <QuizIcon />, path: '/quiz', color: '#1B6B3A', bg: 'rgba(27,107,58,0.15)', border: 'rgba(46,139,87,0.2)' },
  { label: 'Mock Tests', icon: <AssignmentIcon />, path: '/exams', color: '#7C3AED', bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.2)' },
  { label: 'Current Affairs', icon: <NewspaperIcon />, path: '/current-affairs', color: '#2563EB', bg: 'rgba(37,99,235,0.15)', border: 'rgba(37,99,235,0.2)' },
  { label: 'Leaderboard', icon: <LeaderboardIcon />, path: '/leaderboard', color: '#D97706', bg: 'rgba(217,119,6,0.15)', border: 'rgba(217,119,6,0.2)' },
];

// ============================================================
// Main Component
// ============================================================
export default function HomePage() {
  const { profile, fetcher, user, isLoading: ctxLoading } = useAppContext();
  const router = useRouter();
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    if (!ctxLoading && !user) router.push('/login');
  }, [user, ctxLoading, router]);

  // Fetch progress dashboard
  const { data: dashData, isLoading: dashLoading } = useSWR(
    user ? '/my-progress-dashboard/' : null, fetcher
  );

  const streak = profile?.current_streak || 0;
  const xp = profile?.total_xp || 0;
  const level = profile?.level || 1;
  const xpInLevel = xp % 100;
  const username = profile?.user?.first_name || profile?.user?.username || 'Student';

  // Today's goal progress (answered / target)
  const answeredToday = dashData?.questions_today || 0;
  const dailyGoal = 20;
  const goalProgress = Math.min(Math.round((answeredToday / dailyGoal) * 100), 100);

  // Leaderboard position (placeholder - will come from leaderboard API)
  const leaderboardPos = dashData?.leaderboard_position || null;

  const heroCards = [
    {
      label: "Today's Goal",
      title: `You've answered ${answeredToday}/${dailyGoal} questions today`,
      subtitle: goalProgress >= 100 ? "🎉 Daily goal achieved! Amazing work!" : `${dailyGoal - answeredToday} more to hit your daily goal`,
      gradient: 'linear-gradient(135deg, rgba(27,107,58,0.25), rgba(27,107,58,0.1))',
      border: '1px solid rgba(46,139,87,0.2)',
      textMuted: '#8892A4',
      progress: goalProgress,
      progressColor: 'linear-gradient(90deg, #1B6B3A, #22c55e)',
      progressLabel: `${goalProgress}% of daily goal`,
      action: { label: 'Keep Going →', path: '/feed' },
      actionColor: '#2E8B57',
    },
    {
      label: streak > 0 ? `🔥 ${streak}-Day Streak` : 'Start Your Streak',
      title: streak > 0
        ? (answeredToday === 0 ? `⚠️ Study now or lose your ${streak}-day streak!` : `Streak safe! Keep the fire going 🔥`)
        : 'Start your first streak today!',
      subtitle: streak > 0 && answeredToday === 0
        ? 'You have not studied today. Answer 1 question to save it.'
        : `Longest: ${profile?.longest_streak || 0} days`,
      gradient: streak > 0 && answeredToday === 0
        ? 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05))'
        : 'linear-gradient(135deg, rgba(255,107,43,0.2), rgba(255,107,43,0.05))',
      border: streak > 0 && answeredToday === 0 ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,107,43,0.3)',
      textMuted: '#8892A4',
      action: { label: 'Study Now →', path: '/feed' },
      actionColor: '#FF6B2B',
    },
    {
      label: 'Leaderboard',
      title: leaderboardPos ? `You're #${leaderboardPos} in Kerala 📍` : 'Join the Leaderboard',
      subtitle: leaderboardPos ? 'Answer more questions to climb up!' : 'Answer 10 questions to enter the ranking',
      gradient: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
      border: '1px solid rgba(245,158,11,0.2)',
      textMuted: '#8892A4',
      action: { label: 'View Leaderboard →', path: '/leaderboard' },
      actionColor: '#F59E0B',
    },
  ];

  // Auto-cycle hero cards
  useEffect(() => {
    const id = setInterval(() => setHeroIndex(prev => (prev + 1) % heroCards.length), 4000);
    return () => clearInterval(id);
  }, [heroCards.length]);

  if (ctxLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'} 👋
          </Typography>
          <Typography variant="h3" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, color: 'text.primary', mt: 0.5, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
            {username}
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>
            {answeredToday === 0 ? "Ready to start your study session?" : `You've studied ${answeredToday} questions today. Keep going!`}
          </Typography>
        </Box>
      </motion.div>

      {/* Stat Badges */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
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

      {/* Hero Swipeable Strip */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }}>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ position: 'relative', height: 180, mb: 1.5 }}>
            {heroCards.map((card, i) => (
              <HeroCard key={i} card={card} isActive={i === heroIndex} />
            ))}
          </Box>
          {/* Dots + arrows */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => setHeroIndex(prev => (prev - 1 + heroCards.length) % heroCards.length)}
              sx={{ color: '#4A5568', '&:hover': { color: '#8892A4' } }}
            >
              <ArrowBackIosNewIcon sx={{ fontSize: 12 }} />
            </IconButton>
            {heroCards.map((_, i) => (
              <Box
                key={i}
                onClick={() => setHeroIndex(i)}
                sx={{
                  width: i === heroIndex ? 20 : 6, height: 6,
                  borderRadius: '3px',
                  bgcolor: i === heroIndex ? '#2E8B57' : '#252D3D',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
              />
            ))}
            <IconButton
              size="small"
              onClick={() => setHeroIndex(prev => (prev + 1) % heroCards.length)}
              sx={{ color: '#4A5568', '&:hover': { color: '#8892A4' } }}
            >
              <ArrowForwardIosIcon sx={{ fontSize: 12 }} />
            </IconButton>
          </Box>
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

      {/* Study Feed CTA */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}>
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
              Continue Study Feed
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', mt: 0.25 }}>
              Questions, current affairs, and facts await
            </Typography>
          </Box>
          <Button
            variant="contained"
            endIcon={<PlayArrowIcon />}
            sx={{ flexShrink: 0, background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)' }}
          >
            Study
          </Button>
        </Box>
      </motion.div>
    </Box>
  );
}