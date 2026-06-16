'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, CircularProgress, Stack, Grid, Card, useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import CheckIcon from '@mui/icons-material/Check';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { useAppContext } from '@/context/AppContext';

export default function SubscriptionPage() {
  const { user, isLoading: ctxLoading } = useAppContext();
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    if (!ctxLoading && !user) router.push('/login');
  }, [user, ctxLoading, router]);

  if (ctxLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={32} sx={{ color: '#2E8B57' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', pb: 8 }}>
      {/* Promotion banner */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Box sx={{
          p: 4,
          background: 'linear-gradient(135deg, rgba(27, 107, 58, 0.2), rgba(124, 58, 237, 0.15))',
          border: '1px solid rgba(46, 139, 87, 0.25)',
          borderRadius: '24px',
          mb: 4,
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(46, 139, 87, 0.15)'
        }}>
          <WorkspacePremiumIcon sx={{ fontSize: 60, color: '#F59E0B', mb: 2 }} />
          <Typography sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 950, fontSize: { xs: '1.5rem', md: '2rem' }, color: 'text.primary', mb: 2 }}>
            All Premium Features Unlocked! 💎
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '1rem', maxWidth: '600px', mx: 'auto', lineHeight: 1.6 }}>
            KPSC Master is currently in beta. To support your preparation, we have unlocked **all premium benefits completely 100% free** for all users!
          </Typography>
        </Box>
      </motion.div>

      {/* Grid of Unlocked Features */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, mb: 4, textAlign: 'center' }}>
          Active Benefits on Your Account:
        </Typography>
        <Grid container spacing={3}>
          {[
            { title: "Unlimited Study Cards", desc: "Access the complete library of questions, Renaissance facts, and daily news without limits." },
            { title: "Unlimited Mock Tests", desc: "Practice and simulate as many full-length LDC, LGS, and Degree Level exams as you need." },
            { title: "AI Doubt Explanations", desc: "Get detailed Malayalam & English AI breakdowns instantly for every single question." },
            { title: "Full Analytics & Dashboard", desc: "Access subject-wise strength metrics, progress history charts, and activity heatmaps." },
            { title: "Gamification & Streak Freeze", desc: "Unlock level badges, global leaderboard rankings, and free streak freezes." },
            { title: "District Topper Status", desc: "Complete tests to earn competitive topper tags and rank among Kerala's best." }
          ].map((feat, idx) => (
            <Grid size={{ xs: 12, sm: 6 }} key={idx}>
              <Card sx={{
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                height: '100%',
                p: 3
              }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <CheckIcon sx={{ color: '#2E8B57', fontSize: 24, mt: 0.5 }} />
                  <Box>
                    <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.05rem', mb: 1 }}>
                      {feat.title}
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', lineHeight: 1.5 }}>
                      {feat.desc}
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Social Proof */}
      <Typography sx={{ textAlign: 'center', color: 'text.secondary', fontSize: '0.85rem', mt: 8 }}>
        🤝 No payment or card required. Happy learning & crack your Kerala PSC exams!
      </Typography>
    </Box>
  );
}
