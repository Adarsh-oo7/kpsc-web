'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Typography } from '@mui/material';
import { useAppContext } from '@/context/AppContext';
import VfaPaywallDialog, { gateVfaStart, VfaAccess } from '@/components/VfaPaywallDialog';

const quizPath = '/quiz?mode=mock&exam_id=village-field-assistant';

export default function VfaStartButton() {
  const router = useRouter();
  const { user } = useAppContext();
  const [open, setOpen] = useState(false);
  const [access, setAccess] = useState<VfaAccess | null>(null);
  const [busy, setBusy] = useState(false);

  const start = async () => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(quizPath)}`);
      return;
    }
    setBusy(true);
    const gate = await gateVfaStart({ slug: 'village-field-assistant', name: 'Village Field Assistant' });
    setBusy(false);
    if (!gate.allowed) {
      setAccess(gate.access);
      setOpen(true);
      return;
    }
    router.push(quizPath);
  };

  return (
    <>
      <Button
        variant="contained"
        fullWidth
        onClick={start}
        disabled={busy}
        sx={{
          py: 2.2,
          px: 4,
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
          fontWeight: 900,
          fontSize: '1.05rem',
          textTransform: 'none',
          boxShadow: '0 8px 32px rgba(59,130,246,0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 40px rgba(59,130,246,0.4)',
          },
        }}
      >
        {busy ? 'Checking…' : 'Start VFA mock — 2 sets free'}
      </Button>
      <Typography sx={{ color: 'text.secondary', fontSize: '0.78rem', mt: 1, textAlign: 'center' }}>
        After 2 free sets, unlock all VFA papers for <s>₹499</s> <strong>₹29</strong>
      </Typography>
      <VfaPaywallDialog
        open={open}
        onClose={() => setOpen(false)}
        access={access}
        onUnlocked={() => router.push(quizPath)}
      />
    </>
  );
}
