'use client';

import {
  Container,
  Box,
  Typography,
  Button,
  Stack,
  Chip,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import React from 'react';

const Icons = {
  Brain: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
      <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
      <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
      <path d="M6 18a4 4 0 0 1-1.967-.516" />
      <path d="M19.967 17.484A4 4 0 0 1 18 18" />
    </svg>
  ),
  ClipboardCheck: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  ),
  Newspaper: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" />
    </svg>
  ),
  Bot: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" /><path d="M20 14h2" />
      <path d="M15 13v2" /><path d="M9 13v2" />
    </svg>
  ),
  Trophy: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  ),
  Zap: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
    </svg>
  ),
  Repeat: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m17 2 4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="m7 22-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  Timer: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2h4" /><path d="M12 14v-4" /><circle cx="12" cy="14" r="8" />
    </svg>
  ),
  Filter: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  ),
  Sparkles: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" /><path d="M22 5h-4" /><path d="M4 17v2" /><path d="M5 18H3" />
    </svg>
  ),
  BarChart: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  ),
  Scroll: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4" />
      <path d="M19 3H8.5C7.1 3 6 4.1 6 5.5" />
    </svg>
  ),
};

const featuresList = [
  {
    Icon: Icons.Brain,
    title: 'Psychology-Driven Daily Quiz',
    tagline: 'Build habit, stay consistent',
    desc: 'Our spaced-repetition algorithm feeds you bite-sized daily quizzes that optimize memory retention.',
    color: '#16a34a',
    details: [
      '10 highly relevant questions daily',
      'Instant Malayalam & English explanations',
      'Personalized difficulty levels',
      'Streak tracking with badges',
    ],
    insight: {
      Icon: Icons.Repeat,
      title: 'Built on cognitive science',
      subtitle: 'Spaced repetition + active recall system',
      color: '#16a34a',
    },
  },
  {
    Icon: Icons.ClipboardCheck,
    title: 'Full-Length Mock Tests',
    tagline: 'Simulate real exam pressure',
    desc: 'Practice under real time constraints with official KPSC patterns.',
    color: '#7c3aed',
    details: [
      'Official timer & scoring',
      'Rank tracking system',
      'Previous year papers',
      'Auto error bookmarking',
    ],
    insight: {
      Icon: Icons.Timer,
      title: 'Real exam simulation',
      subtitle: 'Build speed + accuracy under pressure',
      color: '#7c3aed',
    },
  },
  {
    Icon: Icons.Newspaper,
    title: 'Interactive Current Affairs',
    tagline: 'Exam-focused daily news',
    desc: 'News curated and tagged for PSC relevance — no noise, just what matters.',
    color: '#0369a1',
    details: [
      'Daily PSC summaries',
      'MCQ integration',
      'Historical tagging',
      'Bookmark system',
    ],
    insight: {
      Icon: Icons.Filter,
      title: 'Smart news filtering',
      subtitle: 'Only exam-relevant content shown',
      color: '#0369a1',
    },
  },
  {
    Icon: Icons.Bot,
    title: 'AI Doubt Solver',
    tagline: '24/7 personal tutor',
    desc: 'Instant explanations in Malayalam + English, powered by AI.',
    color: '#dc2626',
    details: [
      'Step-by-step answers',
      'Math problem solving',
      'Concept breakdowns',
      'Instant help system',
    ],
    insight: {
      Icon: Icons.Sparkles,
      title: 'AI-powered learning',
      subtitle: 'Instant concept clarity anytime',
      color: '#dc2626',
    },
  },
  {
    Icon: Icons.Trophy,
    title: 'Leaderboard System',
    tagline: 'Competitive learning',
    desc: 'Track your rank across Kerala and stay motivated with gamified progress.',
    color: '#b45309',
    details: [
      'District ranking',
      'Mock test leaderboard',
      'Weekly badges',
      'XP tracking',
    ],
    insight: {
      Icon: Icons.BarChart,
      title: 'Gamified system',
      subtitle: 'XP + ranks + motivation loop',
      color: '#b45309',
    },
  },
  {
    Icon: Icons.Zap,
    title: 'Infinite Study Feed',
    tagline: 'Microlearning feed',
    desc: 'Instagram-style PSC learning — turn your scrolling habit into studying.',
    color: '#0891b2',
    details: [
      'Short facts',
      'MCQ polls',
      'Infographics',
      'Save cards',
    ],
    insight: {
      Icon: Icons.Scroll,
      title: 'Social learning UX',
      subtitle: 'Turn scrolling into studying',
      color: '#0891b2',
    },
  },
];

export default function FeaturesPage() {
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-timeline-item]');
      let current = 0;
      sections.forEach((sec, i) => {
        const rect = sec.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.5) current = i;
      });
      setActiveIndex(current);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Theme-aware surface colors
  const cardBg = theme.palette.background.paper;
  const cardBgInactive = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.6)';
  const dividerColor = theme.palette.divider;
  const dotInactiveColor = isDark ? '#4b5563' : '#d1d5db';
  const dotRingInactive = isDark
    ? `0 0 0 3px ${theme.palette.background.default}, 0 0 0 4px #374151`
    : `0 0 0 3px ${theme.palette.background.default}, 0 0 0 4px #e5e7eb`;
  const insightBgInactive = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(248,248,248,0.8)';
  const insightIconBgInactive = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const insightBorderInactive = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const lineColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)';
  const outlinedBorderColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>

      {/* HEADER */}
      <Box textAlign="center" mb={8}>
        <Chip
          label="✨ Advanced Features"
          sx={{
            bgcolor: 'rgba(22,163,74,0.12)',
            color: '#16a34a',
            fontWeight: 700,
            fontSize: '0.78rem',
            letterSpacing: '0.04em',
            mb: 2.5,
            px: 1,
          }}
        />
        <Typography
          variant="h2"
          fontWeight={900}
          sx={{
            letterSpacing: '-0.03em',
            lineHeight: 1.1,

            // 🔥 Responsive font size
            fontSize: {
              xs: '2rem',     // mobile
              sm: '2.5rem',   // small tablets
              md: '3rem',     // tablets
              lg: '3.75rem',  // laptops
              xl: '4.5rem',   // large screens
            },
          }}
        >
          Study Smarter, Not Harder
        </Typography>

        <Typography
          color="text.secondary"
          sx={{
            maxWidth: {
              xs: '100%',
              sm: 480,
              md: 540,
            },
            mx: 'auto',
            mt: {
              xs: 1.5,
              sm: 2,
              md: 2.5,
            },

            fontSize: {
              xs: '0.9rem',
              sm: '1rem',
              md: '1.05rem',
              lg: '1.1rem',
            },

            lineHeight: 1.7,
            px: { xs: 1, sm: 0 }, // padding for mobile readability
          }}
        >
          Scientifically designed PSC preparation platform built for Kerala aspirants
        </Typography>
      </Box>

      {/* TIMELINE */}
      <Box sx={{ position: 'relative', py: 10 }}>

        {/* CENTER LINE */}
        <Box sx={{
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          width: '2px',
          background: `linear-gradient(to bottom, transparent, ${lineColor} 5%, ${lineColor} 95%, transparent)`,
          transform: 'translateX(-50%)',
          display: { xs: 'none', md: 'block' },
        }} />

        {/* PROGRESS LINE */}
        <Box sx={{
          position: 'absolute',
          left: '50%',
          top: 0,
          width: '2px',
          background: 'linear-gradient(to bottom, #16a34a, #0891b2)',
          transform: 'translateX(-50%)',
          height: `${((activeIndex + 1) / featuresList.length) * 100}%`,
          transition: 'height 0.5s ease',
          display: { xs: 'none', md: 'block' },
          borderRadius: '999px',
        }} />

        <Stack spacing={12}>
          {featuresList.map((f, i) => {
            const isLeft = i % 2 === 0;
            const isActive = i === activeIndex;

            const FeatureIcon = f.Icon;
            const InsightIcon = f.insight.Icon;

            // Per-card theme-aware values
            const cardBackground = isActive
              ? isDark
                ? `linear-gradient(160deg, ${theme.palette.background.paper} 60%, ${f.color}12)`
                : `linear-gradient(160deg, #ffffff 60%, ${f.color}08)`
              : cardBgInactive;

            const cardBorder = isActive ? `${f.color}40` : dividerColor;
            const cardShadow = isActive
              ? `0 20px 60px ${f.color}20, 0 4px 16px ${f.color}12`
              : isDark
                ? '0 2px 12px rgba(0,0,0,0.3)'
                : '0 2px 12px rgba(0,0,0,0.04)';

            const iconBg = isActive
              ? `linear-gradient(135deg, ${f.color}22, ${f.color}10)`
              : isDark
                ? `${f.color}18`
                : `${f.color}14`;

            const insightBg = isActive
              ? isDark
                ? `linear-gradient(135deg, ${f.insight.color}18, ${theme.palette.background.paper})`
                : `linear-gradient(135deg, ${f.insight.color}12, #ffffff)`
              : insightBgInactive;

            const Card = (
              <motion.div
                initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <Box sx={{
                  borderRadius: '20px',
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: cardBorder,
                  boxShadow: cardShadow,
                  transform: isActive ? 'scale(1.02)' : 'scale(0.99)',
                  opacity: isActive ? 1 : 0.6,
                  transition: 'all 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
                  background: cardBackground,
                }}>
                  {/* Top accent bar */}
                  <Box sx={{
                    height: '3px',
                    background: isActive
                      ? `linear-gradient(90deg, ${f.color}, ${f.color}55)`
                      : 'transparent',
                    transition: 'background 0.4s ease',
                  }} />

                  <Box sx={{ p: { xs: 3, md: 3.5 } }}>
                    {/* Icon + title */}
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                      <Box sx={{
                        width: 48,
                        height: 48,
                        borderRadius: '14px',
                        background: iconBg,
                        border: `1px solid ${f.color}25`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: f.color,
                        flexShrink: 0,
                        transition: 'all 0.4s ease',
                        boxShadow: isActive ? `0 4px 12px ${f.color}22` : 'none',
                      }}>
                        <FeatureIcon />
                      </Box>
                      <Box sx={{ pt: 0.25 }}>
                        <Typography
                          fontWeight={800}
                          fontSize="1.05rem"
                          letterSpacing="-0.02em"
                          lineHeight={1.3}
                          color="text.primary"
                        >
                          {f.title}
                        </Typography>
                        <Typography
                          fontSize="0.75rem"
                          fontWeight={600}
                          sx={{
                            color: f.color,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                            mt: 0.25,
                            opacity: isActive ? 1 : 0.7,
                          }}
                        >
                          {f.tagline}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Description */}
                    <Typography
                      color="text.secondary"
                      fontSize="0.875rem"
                      lineHeight={1.65}
                      mb={2.5}
                    >
                      {f.desc}
                    </Typography>

                    {/* Divider */}
                    <Box sx={{ height: '1px', bgcolor: dividerColor, mb: 2 }} />

                    {/* Details grid */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                      {f.details.map((d, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{
                            width: 5,
                            height: 5,
                            borderRadius: '50%',
                            bgcolor: f.color,
                            flexShrink: 0,
                            opacity: isActive ? 1 : 0.5,
                          }} />
                          <Typography fontSize="0.8rem" color="text.secondary" lineHeight={1.4}>
                            {d}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </motion.div>
            );

            const InsightPanel = (
              <motion.div
                initial={{ opacity: 0, x: isLeft ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <Box sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  background: insightBg,
                  border: '1px solid',
                  borderColor: isActive ? `${f.insight.color}28` : insightBorderInactive,
                  backdropFilter: 'blur(12px)',
                  display: 'flex',
                  gap: 2,
                  alignItems: 'center',
                  transition: 'all 0.45s ease',
                  opacity: isActive ? 1 : 0.5,
                  boxShadow: isActive ? `0 8px 24px ${f.insight.color}14` : 'none',
                }}>
                  <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '12px',
                    background: isActive
                      ? `linear-gradient(135deg, ${f.insight.color}28, ${f.insight.color}12)`
                      : insightIconBgInactive,
                    border: `1px solid ${f.insight.color}22`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isActive ? f.insight.color : 'text.disabled',
                    flexShrink: 0,
                    transition: 'all 0.4s ease',
                  }}>
                    <InsightIcon />
                  </Box>
                  <Box>
                    <Typography
                      fontWeight={700}
                      fontSize="0.875rem"
                      letterSpacing="-0.01em"
                      color="text.primary"
                    >
                      {f.insight.title}
                    </Typography>
                    <Typography fontSize="0.775rem" color="text.secondary" mt={0.25} lineHeight={1.4}>
                      {f.insight.subtitle}
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            );

            return (
              <Box key={f.title} data-timeline-item>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 80px 1fr' },
                  alignItems: 'center',
                  gap: { xs: 2, md: 0 },
                }}>

                  {/* LEFT COLUMN */}
                  <Box sx={{ gridColumn: { xs: '1', md: '1' }, gridRow: { md: 1 } }}>
                    {isLeft ? Card : InsightPanel}
                  </Box>

                  {/* DOT */}
                  <Box sx={{
                    gridColumn: '2',
                    gridRow: { md: 1 },
                    display: { xs: 'none', md: 'flex' },
                    justifyContent: 'center',
                    alignSelf: 'center',
                  }}>
                    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isActive && (
                        <Box sx={{
                          position: 'absolute',
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          bgcolor: `${f.color}20`,
                          animation: 'pulse 1.8s ease-in-out infinite',
                          '@keyframes pulse': {
                            '0%, 100%': { transform: 'scale(1)', opacity: 1 },
                            '50%': { transform: 'scale(1.4)', opacity: 0.4 },
                          },
                        }} />
                      )}
                      <Box sx={{
                        width: isActive ? 16 : 10,
                        height: isActive ? 16 : 10,
                        borderRadius: '50%',
                        bgcolor: isActive ? f.color : dotInactiveColor,
                        boxShadow: isActive
                          ? `0 0 0 3px ${theme.palette.background.default}, 0 0 0 5px ${f.color}44`
                          : dotRingInactive,
                        transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
                        position: 'relative',
                        zIndex: 1,
                      }} />
                    </Box>
                  </Box>

                  {/* RIGHT COLUMN */}
                  <Box sx={{ gridColumn: { xs: '1', md: '3' }, gridRow: { md: 1 } }}>
                    {isLeft ? InsightPanel : Card}
                  </Box>

                </Box>
              </Box>
            );
          })}
        </Stack>
      </Box>

      {/* Bottom CTA */}
      <Box sx={{
        mt: 12,
        p: { xs: 4, md: 6 },
        background: isDark
          ? 'linear-gradient(135deg, rgba(22,163,74,0.1) 0%, rgba(8,145,178,0.08) 100%)'
          : 'linear-gradient(135deg, rgba(22,163,74,0.07) 0%, rgba(8,145,178,0.05) 100%)',
        border: '1px solid',
        borderColor: 'rgba(22,163,74,0.18)',
        borderRadius: '28px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Box sx={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(22,163,74,0.1), transparent 70%)',
          pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', bottom: -40, left: -40,
          width: 160, height: 160, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(8,145,178,0.1), transparent 70%)',
          pointerEvents: 'none',
        }} />

        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            letterSpacing: '-0.03em',
            lineHeight: 1.2,

            mb: { xs: 1, sm: 1.2, md: 1.5 },

            fontSize: {
              xs: '1.4rem',   // small phones
              sm: '1.8rem',   // large phones
              md: '2.2rem',   // tablets
              lg: '2.6rem',   // desktop
            },

            px: { xs: 1, sm: 0 }, // prevent edge clipping
            textAlign: 'center',

            position: 'relative',
          }}
        >
          Ready to Start Preparing?
        </Typography>

        <Typography
          sx={{
            color: 'text.secondary',

            mb: { xs: 3, md: 4 },

            maxWidth: {
              xs: '100%',
              sm: 420,
              md: 460,
            },

            mx: 'auto',

            fontSize: {
              xs: '0.85rem',
              sm: '0.95rem',
              md: '1rem',
            },

            lineHeight: 1.7,

            px: { xs: 1.5, sm: 0 }, // better mobile readability
            textAlign: 'center',

            position: 'relative',
          }}
        >
          Get access to all basic features immediately. No signup required to attempt today's daily quiz.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center', position: 'relative' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push('/register')}
            endIcon={<ArrowForwardIcon />}
            sx={{
              py: 1.5,
              px: 4,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              fontWeight: 700,
              fontSize: '0.9rem',
              boxShadow: '0 4px 16px rgba(22,163,74,0.3)',
              '&:hover': {
                boxShadow: '0 6px 20px rgba(22,163,74,0.4)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Register Free Account
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => router.push('/login')}
            sx={{
              py: 1.5,
              px: 4,
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.9rem',
              borderColor: outlinedBorderColor,
              color: 'text.primary',
              '&:hover': {
                borderColor: '#16a34a',
                color: '#16a34a',
                bgcolor: 'rgba(22,163,74,0.06)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Log In
          </Button>
        </Stack>
      </Box>

    </Container>
  );
}