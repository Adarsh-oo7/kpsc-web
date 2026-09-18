'use client';

import { useState } from 'react';
import {
  Dialog, DialogContent, Button, Typography, Stack, Box, Chip, CircularProgress, Alert,
} from '@mui/material';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import apiClient from '@/lib/apiClient';
import { useAppContext } from '@/context/AppContext';

const GREEN = '#1B6B3A';
const GREEN_LIGHT = '#2E8B57';
const AMBER = '#F59E0B';

export type VfaAccess = {
  unlocked?: boolean;
  free_sets?: number;
  sets_used?: number;
  sets_remaining?: number;
  can_attempt?: boolean;
  price?: number;
  compare_at?: number;
  plan_id?: number | null;
  plan_slug?: string;
  plan_name?: string;
  detail?: string;
};

const loadRazorpayScript = () =>
  new Promise<boolean>((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export async function fetchVfaAccess(): Promise<VfaAccess | null> {
  try {
    const res = await apiClient.get('/subscriptions/vfa-access/');
    return res.data;
  } catch {
    return null;
  }
}

export async function gateVfaStart(exam?: { name?: string; slug?: string } | null): Promise<{ allowed: boolean; access: VfaAccess | null }> {
  if (!isVfaExamLike(exam)) return { allowed: true, access: null };
  const access = await fetchVfaAccess();
  if (!access) return { allowed: true, access: null };
  return { allowed: Boolean(access.can_attempt || access.unlocked), access };
}

function isVfaExamLike(exam?: { name?: string; slug?: string } | string | null) {
  if (!exam) return false;
  const hay = typeof exam === 'string' ? exam : `${exam.name || ''} ${exam.slug || ''}`;
  const lower = hay.toLowerCase();
  return lower.includes('village field') || lower.includes('village-field') || /\bvfa\b/.test(lower);
}

export default function VfaPaywallDialog({
  open,
  onClose,
  access,
  onUnlocked,
}: {
  open: boolean;
  onClose: () => void;
  access?: VfaAccess | null;
  onUnlocked?: () => void;
}) {
  const { user } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const price = Number(access?.price ?? 29);
  const compareAt = Number(access?.compare_at ?? 499);
  const used = Number(access?.sets_used ?? 2);

  const handlePay = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.post('/subscriptions/checkout/create-session/', {
        plan_slug: access?.plan_slug || 'vfa-unlock',
        plan_id: access?.plan_id,
      });
      const order = res.data;
      if (String(order.order_id || '').startsWith('order_mock_')) {
        await apiClient.post('/subscriptions/checkout/verify/', {
          order_id: order.order_id,
          payment_id: `pay_mock_${Date.now()}`,
        });
        onUnlocked?.();
        onClose();
        setLoading(false);
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError('Could not load Razorpay. Check your connection and try again.');
        setLoading(false);
        return;
      }

      const paymentObject = new (window as any).Razorpay({
        key: order.key,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'KPSC Master',
        description: 'VFA Full Unlock — all mock sets',
        order_id: order.order_id,
        prefill: {
          name: user?.username || '',
          email: user?.email || '',
        },
        theme: { color: GREEN },
        handler: async (response: any) => {
          try {
            await apiClient.post('/subscriptions/checkout/verify/', {
              order_id: order.order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            onUnlocked?.();
            onClose();
          } catch {
            setError('Payment went through, but confirmation failed. Refresh and try a VFA set. If it is still locked, contact support.');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });
      paymentObject.open();
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Could not start payment. Try again.');
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: '24px',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #0F3D24 0%, #102116 42%, #0B1220 100%)',
          color: '#fff',
        },
      }}
    >
      <IconButton
        onClick={onClose}
        disabled={loading}
        sx={{ position: 'absolute', right: 8, top: 8, color: 'rgba(255,255,255,0.7)' }}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
        <Chip
          label={`${used} free VFA sets used`}
          sx={{ bgcolor: 'rgba(245,158,11,0.18)', color: AMBER, fontWeight: 800, mb: 2 }}
        />
        <Typography sx={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 900, fontSize: '1.55rem', lineHeight: 1.2, mb: 1 }}>
          Unlock all VFA mock sets
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.92rem', mb: 3 }}>
          Village Field Assistant papers after the 2 free sets need a one-time unlock.
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography
            component="span"
            sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '1.15rem', fontWeight: 700, textDecoration: 'line-through', mr: 1.25 }}
          >
            ₹{compareAt}
          </Typography>
          <Typography
            component="span"
            sx={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 950, fontSize: '3rem', lineHeight: 1, color: '#FDE68A' }}
          >
            ₹{price}
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem', mt: 0.75, fontWeight: 700 }}>
            one-time · full VFA unlock
          </Typography>
        </Box>

        <Stack spacing={1} sx={{ textAlign: 'left', mb: 3, px: 0.5 }}>
          {['Unlimited VFA mock tests', 'Bilingual papers + AI explanations', 'Valid through this VFA exam season'].map((item) => (
            <Typography key={item} sx={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.86)' }}>
              ✓ {item}
            </Typography>
          ))}
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2, textAlign: 'left', borderRadius: '12px' }}>{error}</Alert>}

        <Button
          fullWidth
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <LockOpenIcon />}
          onClick={handlePay}
          disabled={loading}
          sx={{
            py: 1.4,
            borderRadius: '14px',
            textTransform: 'none',
            fontWeight: 900,
            fontSize: '1rem',
            background: `linear-gradient(135deg, ${AMBER}, #D97706)`,
            boxShadow: '0 10px 24px rgba(245,158,11,0.35)',
            '&:hover': { background: '#D97706' },
          }}
        >
          {loading ? 'Opening payment…' : `Pay ₹${price} · Unlock VFA`}
        </Button>
        <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', mt: 1.5 }}>
          Secure checkout with Razorpay
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
