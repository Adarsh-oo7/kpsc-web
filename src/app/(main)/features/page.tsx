'use client';

import {
  Container,
  Box,
  Typography,
  Button,
  Stack,
  Chip,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import React from 'react';

const featuresList = [
  {
    emoji: '📚',
    title: 'Psychology-Driven Daily Quiz',
    tagline: 'Build habit, stay consistent',
    desc: 'Our spaced-repetition algorithm feeds you bite-sized daily quizzes that optimize memory retention.',
    color: '#1B6B3A',
    details: [
      '10 highly relevant questions daily',
      'Instant Malayalam & English explanations',
      'Personalized difficulty levels',
      'Streak tracking with badges',
    ],
    insight: {
      icon: '🧠',
      title: 'Built on cognitive science',
      subtitle: 'Spaced repetition + active recall system',
    },
  },
  {
    emoji: '📝',
    title: 'Full-Length Mock Tests',
    tagline: 'Simulate real exam pressure',
    desc: 'Practice under real time constraints with official KPSC patterns.',
    color: '#7C3AED',
    details: [
      'Official timer & scoring',
      'Rank tracking system',
      'Previous year papers',
      'Auto error bookmarking',
    ],
    insight: {
      icon: '⏱️',
      title: 'Real exam simulation',
      subtitle: 'Build speed + accuracy under pressure',
    },
  },
  {
    emoji: '📰',
    title: 'Interactive Current Affairs',
    tagline: 'Exam-focused daily news',
    desc: 'News curated and tagged for PSC relevance.',
    color: '#2563EB',
    details: [
      'Daily PSC summaries',
      'MCQ integration',
      'Historical tagging',
      'Bookmark system',
    ],
    insight: {
      icon: '🗞️',
      title: 'Smart news filtering',
      subtitle: 'Only exam-relevant content shown',
    },
  },
  {
    emoji: '🤖',
    title: 'AI Doubt Solver',
    tagline: '24/7 personal tutor',
    desc: 'Instant explanations in Malayalam + English.',
    color: '#DC2626',
    details: [
      'Step-by-step answers',
      'Math problem solving',
      'Concept breakdowns',
      'Instant help system',
    ],
    insight: {
      icon: '🤖',
      title: 'AI-powered learning',
      subtitle: 'Instant concept clarity anytime',
    },
  },
  {
    emoji: '🏆',
    title: 'Leaderboard System',
    tagline: 'Competitive learning',
    desc: 'Track your rank across Kerala.',
    color: '#D97706',
    details: [
      'District ranking',
      'Mock test leaderboard',
      'Weekly badges',
      'XP tracking',
    ],
    insight: {
      icon: '📊',
      title: 'Gamified system',
      subtitle: 'XP + ranks + motivation loop',
    },
  },
  {
    emoji: '⚡',
    title: 'Infinite Study Feed',
    tagline: 'Microlearning feed',
    desc: 'Instagram-style PSC learning experience.',
    color: '#0891B2',
    details: [
      'Short facts',
      'MCQ polls',
      'Infographics',
      'Save cards',
    ],
    insight: {
      icon: '⚡',
      title: 'Social learning UX',
      subtitle: 'Turn scrolling into studying',
    },
  },
];

export default function FeaturesPage() {
  const router = useRouter();
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

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>

      {/* HEADER */}
      <Box textAlign="center" mb={8}>
        <Chip
          label="✨ Advanced Features"
          sx={{
            bgcolor: 'rgba(27,107,58,0.12)',
            color: '#2E8B57',
            fontWeight: 800,
            mb: 2,
          }}
        />

        <Typography variant="h2" fontWeight={900}>
          Study Smarter, Not Harder
        </Typography>

        <Typography color="text.secondary" maxWidth={600} mx="auto" mt={2}>
          Scientifically designed PSC preparation platform
        </Typography>
      </Box>

      {/* TIMELINE */}
      <Box sx={{ position: 'relative', py: 10 }}>

        {/* CENTER LINE */}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: '2px',
            bgcolor: 'rgba(0,0,0,0.08)',
            transform: 'translateX(-50%)',
          }}
        />


        {/* PROGRESS LINE */}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: 0,
            width: '2px',
            bgcolor: '#2E8B57',
            transform: 'translateX(-50%)',
            height: `${((activeIndex + 1) / featuresList.length) * 100}%`,
            transition: 'height 0.5s ease',
          }}
        />

        <Stack spacing={14}>

          {featuresList.map((f, i) => {
            const isLeft = i % 2 === 0;
            const isActive = i === activeIndex;

            return (
              <motion.div
                key={f.title}
                data-timeline-item
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.4 }}
              >

                {/* GRID LAYOUT (FIXED NO OVERLAP) */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 80px 1fr' },
                    alignItems: 'center',
                  }}
                >

                  {/* CARD */}
                  <Box
                    sx={{
                      gridColumn: { xs: '1', md: isLeft ? '1' : '3' },
                      p: 4,
                      borderRadius: 4,
                      alignSelf: 'center',
                      bgcolor: isActive ? 'background.paper' : 'rgba(255,255,255,0.6)',
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: isActive
                        ? '0 25px 60px rgba(0,0,0,0.08)'
                        : '0 10px 30px rgba(0,0,0,0.03)',
                      transform: isActive ? 'scale(1.02)' : 'scale(0.98)',
                      opacity: isActive ? 1 : 0.7,
                      transition: 'all 0.4s ease',
                    }}
                  >

                    <Typography fontWeight={900} fontSize="1.4rem">
                      {f.title}
                    </Typography>

                    <Typography color="text.secondary" mt={1} mb={2}>
                      {f.desc}
                    </Typography>

                    {f.details.map((d, idx) => (
                      <Box key={idx} display="flex" gap={1}>
                        <Box sx={{ color: f.color }}>●</Box>
                        <Typography fontSize="0.9rem">{d}</Typography>
                      </Box>
                    ))}

                  </Box>

                  {/* DOT */}
                  <Box
                    sx={{
                      gridColumn: '2',
                      display: { xs: 'none', md: 'flex' },
                      justifyContent: 'center',
                      alignSelf: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        width: isActive ? 18 : 12,
                        height: isActive ? 18 : 12,
                        borderRadius: '50%',
                        bgcolor: isActive ? f.color : '#ccc',
                        boxShadow: isActive
                          ? `0 0 0 8px ${f.color}25`
                          : '0 0 0 4px rgba(0,0,0,0.05)',
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </Box>

                  {/* INSIGHT PANEL (FIXED NO OVERLAP) */}
                  <Box
                    sx={{
                      gridColumn: { xs: '1', md: isLeft ? '3' : '1' },
                      display: { xs: 'none', md: 'block' },
                      alignSelf: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        p: 3,
                        borderRadius: 4,
                        bgcolor: 'rgba(255,255,255,0.6)',
                        border: '1px solid rgba(0,0,0,0.06)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        gap: 2,
                        alignItems: 'flex-start',
                      }}
                    >
                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: 2,
                          bgcolor: `${f.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {f.insight.icon}
                      </Box>

                      <Box>
                        <Typography fontWeight={800} fontSize="0.95rem">
                          {f.insight.title}
                        </Typography>
                        <Typography fontSize="0.8rem" color="text.secondary">
                          {f.insight.subtitle}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                </Box>
              </motion.div>
            );
          })}
        </Stack>
      </Box>

      {/* Bottom CTA block */}
      <Box
        sx={{
          mt: 12,
          p: { xs: 4, md: 6 },
          background: 'linear-gradient(135deg, rgba(27,107,58,0.12), rgba(27,107,58,0.03))',
          border: '1px solid rgba(46,139,87,0.2)',
          borderRadius: '28px',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontFamily: "'Cabinet Grotesk', sans-serif",
            fontWeight: 900,
            mb: 2,
            fontSize: { xs: '1.6rem', sm: '2rem', md: '2.4rem' }
          }}
        >
          Ready to Start Preparing?
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            mb: 4,
            maxWidth: 480,
            mx: 'auto',
            fontSize: '0.9rem',
            lineHeight: 1.6
          }}
        >
          Get access to all basic features immediately. No signup required to attempt today's daily quiz.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => router.push('/register')}
            endIcon={<ArrowForwardIcon />}
            sx={{
              py: 1.5,
              px: 4,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
              fontWeight: 700,
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
            }}
          >
            Log In
          </Button>
        </Stack>
      </Box>

    </Container>
  );
}