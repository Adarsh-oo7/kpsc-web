// app/(main)/features/page.tsx

'use client';

import { Container, Box, Typography, Grid, Button, Stack, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const featuresList = [
  {
    emoji: '📚',
    title: 'Psychology-Driven Daily Quiz',
    tagline: 'Build habit, stay consistent',
    desc: 'Our spaced-repetition algorithm feeds you bite-sized daily quizzes that optimize memory retention. Answer daily, keep your streak alive, and climb the ranks without feeling burned out.',
    color: '#1B6B3A',
    details: ['10 highly relevant questions daily', 'Instant detailed Malayalam & English explanations', 'Personalized difficulty levels', 'Streak tracking with streak badges']
  },
  {
    emoji: '📝',
    title: 'Full-Length Mock Tests',
    tagline: 'Simulate the real exam hall pressure',
    desc: 'Practice under real time constraints with official KPSC weightages. Choose from LDC, LGS, Degree Level, and 12+ other categories. Your performance profile will highlight weak areas automatically.',
    color: '#7C3AED',
    details: ['Official timer & marks calculation', 'District-wise & State-wide rank lists', 'Previous year papers in simulated exam format', 'Automatic wrong answers bookmarking']
  },
  {
    emoji: '📰',
    title: 'Interactive Current Affairs',
    tagline: 'KPSC-probabilty tagged daily news',
    desc: 'Don’t just read news — interact with it. Our team curates daily news articles and tags them with probable exam questions. Answer daily current affairs MCQs to lock in the information.',
    color: '#2563EB',
    details: ['Daily summaries curated specifically for Kerala PSC', 'Integrated multiple choice questions', 'Tagging by historical relevance', 'Bookmark important news for revision']
  },
  {
    emoji: '🤖',
    title: 'AI Explanations & Doubt Solving',
    tagline: 'Your personal PSC tutor, 24/7',
    desc: 'Stuck on a tough question? Our custom-trained AI explains answers in clear Malayalam and English. Ask follow-up questions to clarify concepts on history, science, math, or grammar.',
    color: '#DC2626',
    details: ['Detailed bilingual explanations', 'Step-by-step math problem solving', 'Context-specific history snippets', 'Doubt clearing helper inside every question']
  },
  {
    emoji: '🏆',
    title: 'Kerala-Wide Leaderboard',
    tagline: 'Stay motivated through competitive spirit',
    desc: 'Healthy competition drives consistent studying. View your daily, weekly, and district rankings. Watch your name climb the board as you answer questions correctly and build XP.',
    color: '#D97706',
    details: ['Filter rankings by your district', 'Separate leaderboard for mock exams', 'Weekly topper badges and certificates', 'Track study time compared to peers']
  },
  {
    emoji: '⚡',
    title: 'Infinite Study Feed',
    tagline: 'Microlearning in a modern social feed format',
    desc: 'Replace doomscrolling with microlearning. Swipe through an Instagram-like study feed containing quick facts, community polls, quick questions, and high-yield PSC study cards.',
    color: '#0891B2',
    details: ['Short, highly informative facts', 'Community MCQ polls and discussions', 'Visual infographics and memory maps', 'Save card options for offline revision']
  }
];

export default function FeaturesPage() {
  const router = useRouter();

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 8 }, pb: { xs: 8, md: 12 } }}>
      {/* Header section */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Chip
            label="✨ Advanced Platform Features"
            sx={{
              background: 'rgba(27,107,58,0.12)',
              border: '1px solid rgba(46,139,87,0.25)',
              color: '#2E8B57',
              fontWeight: 800,
              fontSize: '0.75rem',
              height: 32,
              mb: 3
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontFamily: "'Cabinet Grotesk', sans-serif",
              fontWeight: 900,
              fontSize: { xs: '2.2rem', sm: '3rem', md: '3.6rem' },
              color: 'text.primary',
              letterSpacing: '-0.02em',
              mb: 2
            }}
          >
            Study Smarter, Not Harder
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              maxWidth: 600,
              mx: 'auto',
              fontSize: { xs: '1rem', sm: '1.1rem' },
              lineHeight: 1.6
            }}
          >
            Discover the scientific features designed specifically to help you build consistency, track progress, and ace the Kerala PSC exams.
          </Typography>
        </motion.div>
      </Box>

      {/* Features Detail Grid */}
      <Stack spacing={8}>
        {featuresList.map((f, i) => {
          const isEven = i % 2 === 0;
          return (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            >
              <Grid
                container
                spacing={{ xs: 4, md: 8 }}
                sx={{
                  alignItems: 'center',
                  flexDirection: isEven ? 'row' : 'row-reverse',
                }}
              >
                {/* Visual Card Representation */}
                <Grid size={{ xs: 12, md: 5 }}>
                  <Box
                    sx={{
                      p: 5,
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: '28px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      aspectRatio: '1.1/1',
                      boxShadow: `0 10px 40px rgba(0,0,0,0.02)`,
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '4px',
                        background: `linear-gradient(90deg, ${f.color}, ${f.color}80)`,
                      }
                    }}
                  >
                    <Box
                      sx={{
                        width: 90,
                        height: 90,
                        borderRadius: '24px',
                        background: `${f.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3.2rem',
                        mb: 3,
                        boxShadow: `0 8px 20px ${f.color}10`,
                      }}
                    >
                      {f.emoji}
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontFamily: "'Cabinet Grotesk', sans-serif",
                        fontWeight: 800,
                        color: 'text.primary',
                        textAlign: 'center',
                        mb: 1
                      }}
                    >
                      {f.title.split(' ').slice(-2).join(' ')}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: f.color,
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {f.tagline}
                    </Typography>
                  </Box>
                </Grid>

                {/* Feature Content */}
                <Grid size={{ xs: 12, md: 7 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          bgcolor: `${f.color}15`,
                          color: f.color,
                          fontSize: '1.25rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {i + 1}
                      </Box>
                      <Typography
                        variant="h4"
                        sx={{
                          fontFamily: "'Cabinet Grotesk', sans-serif",
                          fontWeight: 900,
                          fontSize: '1.75rem',
                          color: 'text.primary',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {f.title}
                      </Typography>
                    </Box>

                    <Typography
                      variant="body1"
                      sx={{
                        color: 'text.secondary',
                        mb: 3.5,
                        fontSize: '1rem',
                        lineHeight: 1.6,
                      }}
                    >
                      {f.desc}
                    </Typography>

                    <Grid container spacing={1.5} sx={{ mb: 4 }}>
                      {f.details.map((detail, idx) => (
                        <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
                            <Box sx={{ color: f.color, mt: 0.25, fontSize: '1rem' }}>✓</Box>
                            <Typography sx={{ fontSize: '0.85rem', color: 'text.primary', fontWeight: 500 }}>
                              {detail}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </motion.div>
          );
        })}
      </Stack>

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
