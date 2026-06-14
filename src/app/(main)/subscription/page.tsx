'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Box, Typography, CircularProgress, Stack, Grid, Button, Card, CardContent, Divider, Chip, useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { useAppContext } from '@/context/AppContext';

export default function SubscriptionPage() {
  const { user, fetcher, profile, isLoading: ctxLoading } = useAppContext();
  const router = useRouter();
  const theme = useTheme();
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro' | null>(null);
  const [loadingPay, setLoadingPay] = useState(false);

  useEffect(() => {
    if (!ctxLoading && !user) router.push('/login');
  }, [user, ctxLoading, router]);

  // Fetch progress to see today's question count
  const { data: dashData } = useSWR(user ? '/my-progress-dashboard/' : null, fetcher);
  const questionsToday = dashData?.overall_stats?.total_answered || 0;

  const handleCheckout = (plan: 'basic' | 'pro') => {
    setSelectedPlan(plan);
    setLoadingPay(true);
    // Simulated checkout completion
    setTimeout(() => {
      alert(`Thank you! Simulated payment for KPSC Master ${plan.toUpperCase()} plan completed successfully!`);
      setLoadingPay(false);
      setSelectedPlan(null);
    }, 1500);
  };

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
          p: 3,
          background: 'linear-gradient(135deg, rgba(27, 107, 58, 0.2), rgba(124, 58, 237, 0.15))',
          border: '1px solid rgba(46, 139, 87, 0.25)',
          borderRadius: '20px',
          mb: 4,
          textAlign: 'center'
        }}>
          <Typography sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, fontSize: { xs: '1.25rem', md: '1.5rem' }, color: 'text.primary' }}>
            You answered {questionsToday} questions today. Pro users answered 47.
          </Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', mt: 1 }}>
            Unlock unlimited cards, official exam mock tests, and instant AI doubt explanations.
          </Typography>
        </Box>
      </motion.div>

      {/* Pricing Title */}
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography sx={{ fontSize: '0.8rem', color: '#8B5CF6', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Flexible Plans 💎
        </Typography>
        <Typography variant="h4" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, color: 'text.primary', mt: 0.5 }}>
          Invest in Your Success
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', mt: 1 }}>
          Choose the speed of your preparation. Change plans anytime.
        </Typography>
      </Box>

      {/* Grid of Plans */}
      <Grid container spacing={3} alignItems="stretch" sx={{ mb: 6 }}>
        {/* FREE PLAN */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{
            height: '100%',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '16px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 700, color: 'text.secondary' }}>
                Free Plan
              </Typography>
              <Typography variant="h4" sx={{ fontFamily: "'JetBrains Mono'", fontWeight: 900, color: 'text.primary', my: 2 }}>
                ₹0
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem', mb: 3 }}>
                Get a taste of daily Kerala PSC preparation
              </Typography>
              <Divider sx={{ borderColor: 'divider', mb: 3 }} />
              
              <Stack spacing={1.5}>
                <FeatureItem label="15 study cards / day" active />
                <FeatureItem label="1 mock test / month" active />
                <FeatureItem label="No AI doubts" active={false} />
                <FeatureItem label="Basic stats only" active={false} />
                <FeatureItem label="No streak freeze" active={false} />
              </Stack>
            </CardContent>
            
            <Box sx={{ p: 3, pt: 0 }}>
              <Button fullWidth disabled variant="outlined" sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '10px' }}>
                Current Plan
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* BASIC PLAN */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{
            height: '100%',
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '16px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 700, color: 'text.primary' }}>
                Basic Plan
              </Typography>
              <Typography variant="h4" sx={{ fontFamily: "'JetBrains Mono'", fontWeight: 900, color: 'text.primary', my: 2 }}>
                ₹99<Typography component="span" sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>/month</Typography>
              </Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem', mb: 3 }}>
                For light daily study and reviews
              </Typography>
              <Divider sx={{ borderColor: 'divider', mb: 3 }} />
              
              <Stack spacing={1.5}>
                <FeatureItem label="40 study cards / day" active />
                <FeatureItem label="5 mock tests / month" active />
                <FeatureItem label="No AI doubts" active={false} />
                <FeatureItem label="Enhanced stats page" active />
                <FeatureItem label="1 streak freeze / month" active />
              </Stack>
            </CardContent>
            
            <Box sx={{ p: 3, pt: 0 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleCheckout('basic')}
                disabled={loadingPay}
                sx={{
                  color: '#2E8B57', borderColor: '#2E8B57',
                  '&:hover': { borderColor: '#1B6B3A', background: 'rgba(46,139,87,0.04)' },
                  textTransform: 'none', fontWeight: 700, borderRadius: '10px'
                }}
              >
                {selectedPlan === 'basic' && loadingPay ? <CircularProgress size={20} /> : 'Upgrade to Basic'}
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* PRO PLAN (MOST POPULAR) */}
        <Grid size={{ xs: 12, md: 4 }}>
          <motion.div style={{ height: '100%' }} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
            <Card sx={{
              height: '100%',
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, #161B22 0%, #1C2230 100%)' 
                : 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)',
              border: '2px solid #2E8B57',
              borderRadius: '16px',
              position: 'relative',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              boxShadow: '0 8px 32px rgba(46, 139, 87, 0.15)'
            }}>
              {/* Pinned Tag */}
              <Chip
                label="MOST POPULAR"
                size="small"
                icon={<WorkspacePremiumIcon sx={{ '&&': { color: '#0F1117', fontSize: 13 } }} />}
                sx={{
                  position: 'absolute', top: 12, right: 12,
                  bgcolor: '#F59E0B', color: '#0F1117', fontWeight: 900, fontSize: '0.65rem',
                  '& .MuiChip-icon': { color: '#0F1117' }
                }}
              />

              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, color: '#2E8B57' }}>
                  Pro Topper
                </Typography>
                <Typography variant="h4" sx={{ fontFamily: "'JetBrains Mono'", fontWeight: 900, color: 'text.primary', my: 2 }}>
                  ₹199<Typography component="span" sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>/month</Typography>
                </Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem', mb: 3 }}>
                  Ultimate package for full-time aspirants
                </Typography>
                <Divider sx={{ borderColor: 'divider', mb: 3 }} />
                
                <Stack spacing={1.5}>
                  <FeatureItem label="Unlimited study cards" active />
                  <FeatureItem label="Unlimited mock tests" active />
                  <FeatureItem label="Unlimited AI explanations" active />
                  <FeatureItem label="Full analytics & heatmap" active />
                  <FeatureItem label="2 streak freezes / month" active />
                  <FeatureItem label="District Topper status badge" active />
                </Stack>
              </CardContent>
              
              <Box sx={{ p: 3, pt: 0 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handleCheckout('pro')}
                  disabled={loadingPay}
                  sx={{
                    background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
                    textTransform: 'none', fontWeight: 800, borderRadius: '10px', py: 1,
                    boxShadow: '0 4px 14px rgba(46, 139, 87, 0.4)'
                  }}
                >
                  {selectedPlan === 'pro' && loadingPay ? <CircularProgress size={20} /> : 'Go Pro — 7 Day Free Trial'}
                </Button>
              </Box>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Annual Save Callout */}
      <Box sx={{
        p: 2.5,
        background: 'rgba(245, 158, 11, 0.08)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        borderRadius: '16px',
        textAlign: 'center',
        mb: 4
      }}>
        <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#F59E0B' }}>
          ⚡ Best Value: Annual Pro — ₹999/year. Save ₹1,389 (58% off)
        </Typography>
      </Box>

      {/* Social Proof */}
      <Typography sx={{ textAlign: 'center', color: 'text.secondary', fontSize: '0.8rem' }}>
        🤝 Joined by 1,200+ aspirants this week. Cancel anytime from profile settings.
      </Typography>
    </Box>
  );
}

function FeatureItem({ label, active }: { label: string; active: boolean }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.25}>
      {active ? (
        <CheckIcon sx={{ color: '#2E8B57', fontSize: 16 }} />
      ) : (
        <CloseIcon sx={{ color: '#E53E3E', fontSize: 16 }} />
      )}
      <Typography sx={{
        fontSize: '0.825rem',
        color: active ? 'text.primary' : 'text.disabled',
        fontWeight: active ? 500 : 400
      }}>
        {label}
      </Typography>
    </Stack>
  );
}
