// app/(main)/testimonials/page.tsx

'use client';

import { Container, Box, Typography, Grid, Avatar, Rating, Chip, Card, CardContent, Stack, Button } from '@mui/material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const extendedTestimonials = [
  {
    name: 'Rahul Krishnan',
    place: 'Thrissur',
    rank: 'LDC 2025 Rank #1',
    text: "KPSC Master's daily quiz kept me on track for 6 months. The streak mechanic genuinely worked — I couldn't let go of my 90-day streak! The daily questions are highly targeted and have the same difficulty profile as actual Kerala PSC exams.",
    rating: 5,
    avatar: 'R',
    category: 'LDC'
  },
  {
    name: 'Priya Menon',
    place: 'Kozhikode',
    rank: 'Qualified LGS (Rank #12)',
    text: "The AI Malayalam explanations are a absolute game-changer. Understood every concept without needing an offline coaching center or tutor. Scored 87/100 in my final mock test and cleared the list safely.",
    rating: 5,
    avatar: 'P',
    category: 'LGS'
  },
  {
    name: 'Amal Thomas',
    place: 'Ernakulam',
    rank: 'District Topper (Degree Level)',
    text: "The leaderboard kept me extremely competitive. When I saw I was #47, I studied 3 more hours that night to reach #40. The psychology of this app is very sound — it makes studying feel like leveling up in a game.",
    rating: 5,
    avatar: 'A',
    category: 'Degree Level'
  },
  {
    name: 'Anjali Sharma',
    place: 'Trivandrum',
    rank: 'Secretariat Assistant Selected',
    text: "The current affairs section is unmatched. The way KPSC Master merges daily news with interactive MCQs helped me score 18/20 in the general awareness section. Highly recommend the Pro subscription!",
    rating: 5,
    avatar: 'A',
    category: 'Secretariat'
  },
  {
    name: 'Sajeev Kumar',
    place: 'Palakkad',
    rank: 'Police Constable Rank #42',
    text: "Attempted over 50 mock tests on this platform before the actual exam. The timer simulation prepared me for the real exam hall pressure. The wrong answers bookmarking section helped me review my mistakes before the exam day.",
    rating: 5,
    avatar: 'S',
    category: 'Constable'
  },
  {
    name: 'Devika Raj',
    place: 'Kollam',
    rank: 'LP/UP Teacher Selected',
    text: "Being a working mother, finding blocks of time to study was difficult. The mobile-friendly quizzes and study feed allowed me to study during my commute or breaks. This app is the reason I cleared my exam.",
    rating: 4.8,
    avatar: 'D',
    category: 'LP/UP'
  }
];

export default function TestimonialsPage() {
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
            label="🏆 Student Success Stories"
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
            Real Students, Real Results
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
            Read reviews and case studies from actual students who cleared their Kerala PSC lists using KPSC Master’s study resources.
          </Typography>
        </motion.div>
      </Box>

      {/* Grid listing reviews */}
      <Grid container spacing={3.5}>
        {extendedTestimonials.map((t, i) => (
          <Grid size={{ xs: 12, md: 6 }} key={t.name}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              style={{ height: '100%' }}
            >
              <Card
                sx={{
                  height: '100%',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '24px',
                  boxShadow: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  p: 3,
                  transition: 'transform 0.3s ease, border-color 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: 'rgba(46, 139, 87, 0.3)',
                    boxShadow: '0 8px 30px rgba(27,107,58,0.05)',
                  }
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                    <Rating value={t.rating} precision={0.1} readOnly size="small" />
                    <Chip
                      label={t.category}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(27,107,58,0.08)',
                        color: '#2E8B57',
                        fontWeight: 700,
                        fontSize: '0.7rem'
                      }}
                    />
                  </Stack>
                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.95rem',
                      lineHeight: 1.7,
                      fontStyle: 'italic',
                      mb: 4
                    }}
                  >
                    "{t.text}"
                  </Typography>
                </CardContent>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 44,
                      height: 44,
                      background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
                      fontSize: '1rem',
                      fontWeight: 800
                    }}
                  >
                    {t.avatar}
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.9rem' }}>
                      {t.name}
                    </Typography>
                    <Typography sx={{ fontSize: '0.75rem', color: '#2E8B57', fontWeight: 700 }}>
                      {t.place} · {t.rank}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Platform trust details */}
      <Box
        sx={{
          mt: 10,
          p: { xs: 4, md: 5 },
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '28px',
          textAlign: 'center'
        }}
      >
        <Grid container spacing={4} sx={{ justifyContent: 'center' }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="h3" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, color: 'primary.main', mb: 1 }}>
              47,000+
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Active Aspirants across Kerala
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="h3" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, color: 'primary.main', mb: 1 }}>
              4.8 ★
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Average Student Rating
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Typography variant="h3" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, color: 'primary.main', mb: 1 }}>
              85% +
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Daily Quiz Habit Retention Rate
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Conversion Banner */}
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={() => router.push('/register')}
          endIcon={<ArrowForwardIcon />}
          sx={{
            py: 1.6,
            px: 4.5,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
            boxShadow: '0 8px 30px rgba(27,107,58,0.25)',
            fontWeight: 700
          }}
        >
          Join Our Success Stories today — Start Free
        </Button>
      </Box>
    </Container>
  );
}
