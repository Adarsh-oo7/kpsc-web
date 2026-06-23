'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Box, Typography, CircularProgress, Stack, Grid, Card, CardContent, Button, useTheme, Alert, Chip, Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import CheckIcon from '@mui/icons-material/Check';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import StarIcon from '@mui/icons-material/Star';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';

// Razorpay checkout script helper
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function SubscriptionClient() {
  const { user, fetcher, isLoading: ctxLoading } = useAppContext();
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [checkoutLoading, setCheckoutLoading] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!ctxLoading && !user) router.push('/login');
  }, [user, ctxLoading, router]);

  // APIs
  const { data: plansData, error: plansError } = useSWR(user ? '/subscriptions/plans/?type=student' : null, fetcher);
  const { data: subData, mutate: mutateSub } = useSWR(user ? '/subscriptions/my-subscription/' : null, fetcher, {
    shouldRetryOnError: false
  });

  if (ctxLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={32} sx={{ color: '#2E8B57' }} />
      </Box>
    );
  }

  const handleSubscribe = async (plan: any) => {
    setCheckoutLoading(plan.id);
    setMessage(null);
    try {
      // Create checkout session in backend
      const res = await apiClient.post('/subscriptions/checkout/create-session/', { plan_id: plan.id });
      const orderData = res.data;

      // Handle local mock mode
      if (orderData.order_id.startsWith('order_mock_')) {
        const confirmMock = window.confirm(
          `[TEST MODE] Mock checkout session created successfully.\nOrder ID: ${orderData.order_id}\n\nWould you like to simulate a successful payment?`
        );
        if (confirmMock) {
          try {
            await apiClient.post('/subscriptions/checkout/webhook/', {
              order_id: orderData.order_id,
              payment_id: `pay_mock_${Math.random().toString(36).substring(7)}`,
              status: 'captured'
            });
            setMessage({ type: 'success', text: `Mock payment successful! ${plan.name} has been activated.` });
            mutateSub();
          } catch (err) {
            setMessage({ type: 'error', text: 'Mock validation failed.' });
          }
        }
        setCheckoutLoading(null);
        return;
      }

      // Load SDK and open Razorpay
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        setMessage({ type: 'error', text: 'Failed to load Razorpay payment SDK.' });
        setCheckoutLoading(null);
        return;
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "KPSC Master",
        description: `${plan.name} Subscription`,
        order_id: orderData.order_id,
        handler: async function (response: any) {
          try {
            await apiClient.post('/subscriptions/checkout/webhook/', {
              order_id: orderData.order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              status: 'success'
            });
            setMessage({ type: 'success', text: `Payment successful! Your ${plan.name} plan is now active.` });
            mutateSub();
          } catch (err) {
            setMessage({ type: 'error', text: 'Failed to confirm payment status with server.' });
          }
        },
        prefill: {
          name: user?.username || "",
          email: user?.email || ""
        },
        theme: {
          color: "#2E8B57"
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to initiate checkout. Please try again.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setCheckoutLoading(null);
    }
  };

  const getPlanIcon = (slug: string) => {
    if (slug === 'pro-yearly') return <StarIcon sx={{ color: '#F59E0B', fontSize: 32 }} />;
    if (slug === 'pro-monthly') return <FlashOnIcon sx={{ color: '#8B5CF6', fontSize: 32 }} />;
    return <CalendarTodayIcon sx={{ color: '#2E8B57', fontSize: 32 }} />;
  };

  const getPlanBadge = (slug: string) => {
    if (slug === 'pro-yearly') return <Chip label="Best Value" size="small" sx={{ bgcolor: '#F59E0B', color: '#0F1117', fontWeight: 900, borderRadius: '6px' }} />;
    if (slug === 'pro-monthly') return <Chip label="Most Popular" size="small" sx={{ bgcolor: '#8B5CF6', color: 'white', fontWeight: 800, borderRadius: '6px' }} />;
    return <Chip label="Free Tier" size="small" variant="outlined" sx={{ color: 'text.secondary', borderColor: theme.palette.divider, borderRadius: '6px' }} />;
  };

  const getFeaturesList = (slug: string) => {
    if (slug === 'pro-yearly') {
      return [
        "Everything in Pro Monthly plan",
        "Full access to premium Mock Tests",
        "Previous Year Papers database",
        "Symmetrical Friends rankings leaderboard",
        "Priority premium academic support"
      ];
    }
    if (slug === 'pro-monthly') {
      return [
        "Unlimited study feed cards daily",
        "Detailed AI Explanations (Mal. & Eng.)",
        "Activity Heatmap contribution calendar",
        "Advanced progress dashboard & stats",
        "Level certifications unlocking"
      ];
    }
    return [
      "15 daily study feed cards limit",
      "Basic questions access (No AI doubts)",
      "Standard All-Kerala Leaderboard view"
    ];
  };

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', pb: 8, px: 2 }}>
      {/* Title */}
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography variant="h4" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 950, color: 'text.primary', mb: 1 }}>
          Choose Your Preparation Power
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.95rem' }}>
          Select the subscription level that matches your Kerala PSC exam goals.
        </Typography>
      </Box>

      {message && (
        <Alert severity={message.type} sx={{ mb: 4, borderRadius: '12px' }}>
          {message.text}
        </Alert>
      )}

      {/* Current Subscription Status */}
      {subData && subData.status === 'active' && (
        <Card sx={{
          background: isDark 
            ? 'linear-gradient(135deg, rgba(27, 107, 58, 0.15) 0%, rgba(28, 34, 48, 0.5) 100%)' 
            : 'linear-gradient(135deg, rgba(27, 107, 58, 0.08) 0%, rgba(248, 250, 252, 0.9) 100%)',
          border: '1px solid rgba(46, 139, 87, 0.3)',
          borderRadius: '20px',
          mb: 5
        }}>
          <CardContent sx={{ p: 3, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
            <Box>
              <Typography sx={{ color: '#2E8B57', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                CURRENT SUBSCRIPTION
              </Typography>
              <Typography variant="h6" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, color: 'text.primary', mt: 0.5 }}>
                {subData.plan_name} Active Plan 💎
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                Subscription Ends
              </Typography>
              <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: '0.9rem', fontFamily: "'JetBrains Mono'" }}>
                {new Date(subData.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Grid of Plans */}
      <Grid container spacing={3} alignItems="stretch">
        {plansData ? (
          plansData.map((plan: any) => {
            const isCurrent = subData && subData.plan === plan.id && subData.status === 'active';
            const features = getFeaturesList(plan.slug);
            return (
              <Grid size={{ xs: 12, md: 4 }} key={plan.id}>
                <Card sx={{
                  background: isCurrent 
                    ? (isDark ? 'linear-gradient(180deg, #111A16 0%, #0F1219 100%)' : 'linear-gradient(180deg, #E8F5E9 0%, #FFFFFF 100%)')
                    : 'background.paper',
                  border: isCurrent ? '2px solid #2E8B57' : `1px solid ${theme.palette.divider}`,
                  borderRadius: '24px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)'
                  }
                }}>
                  <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                      {getPlanIcon(plan.slug)}
                      {getPlanBadge(plan.slug)}
                    </Stack>

                    <Typography variant="h5" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, color: 'text.primary', mb: 1 }}>
                      {plan.name}
                    </Typography>

                    {/* Price */}
                    <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                      <Typography variant="h4" sx={{ fontFamily: "'JetBrains Mono'", fontWeight: 900, color: 'text.primary' }}>
                        ₹{parseInt(plan.price)}
                      </Typography>
                      <Typography sx={{ color: 'text.secondary', ml: 0.5, fontSize: '0.85rem' }}>
                        /{plan.interval === 'month' ? 'month' : plan.interval === 'year' ? 'year' : 'forever'}
                      </Typography>
                    </Box>

                    <Divider sx={{ borderColor: 'divider', mb: 3 }} />

                    {/* Feature List */}
                    <Stack spacing={2} sx={{ flexGrow: 1, mb: 4 }}>
                      {features.map((feat, fIdx) => (
                        <Stack key={fIdx} direction="row" spacing={1.5} alignItems="flex-start">
                          <CheckIcon sx={{ color: plan.slug === 'free' ? 'text.secondary' : '#2E8B57', fontSize: 18, mt: 0.2 }} />
                          <Typography sx={{ color: 'text.primary', fontSize: '0.85rem', lineHeight: 1.4 }}>
                            {feat}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>

                    {/* Action Button */}
                    {plan.slug === 'free' ? (
                      <Button
                        variant="outlined"
                        fullWidth
                        disabled
                        sx={{
                          borderColor: 'divider',
                          color: 'text.disabled',
                          textTransform: 'none',
                          borderRadius: '12px',
                          fontWeight: 700,
                          py: 1.25
                        }}
                      >
                        Default Tier
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleSubscribe(plan)}
                        disabled={isCurrent || checkoutLoading !== null}
                        sx={{
                          background: isCurrent 
                            ? 'rgba(46, 139, 87, 0.1)'
                            : plan.slug === 'pro-yearly'
                              ? 'linear-gradient(135deg, #F59E0B, #D97706)'
                              : 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                          color: isCurrent ? '#2E8B57' : 'white',
                          border: isCurrent ? '1px solid #2E8B57' : 'none',
                          textTransform: 'none',
                          borderRadius: '12px',
                          fontWeight: 800,
                          py: 1.25,
                          '&:hover': {
                            background: plan.slug === 'pro-yearly' ? '#D97706' : '#6D28D9'
                          }
                        }}
                      >
                        {checkoutLoading === plan.id ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : isCurrent ? (
                          'Currently Active'
                        ) : (
                          `Get Started`
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', py: 4 }}>
            <CircularProgress size={24} sx={{ color: '#2E8B57' }} />
          </Box>
        )}
      </Grid>
    </Box>
  );
}
