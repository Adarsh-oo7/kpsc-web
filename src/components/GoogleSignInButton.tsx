'use client';

import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

const SCRIPT_ID = 'google-gsi-client';
const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

type GoogleAccountsId = {
  initialize: (config: Record<string, unknown>) => void;
  renderButton: (el: HTMLElement, options: Record<string, unknown>) => void;
  cancel?: () => void;
};

let gsiInitClientId: string | null = null;
const gsiSuccess = { current: (_credential: string) => {} };
const gsiError = { current: (_message: string) => {} };

function googleId(): GoogleAccountsId | null {
  return (window as any).google?.accounts?.id ?? null;
}

function loadGsiScript(): Promise<void> {
  if (googleId()) return Promise.resolve();
  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Google Sign-In failed to load')), { once: true });
    });
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google Sign-In failed to load'));
    document.head.appendChild(script);
  });
}

interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => void;
  onError: (error: string) => void;
}

export default function GoogleSignInButton({ onSuccess, onError }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  gsiSuccess.current = onSuccess;
  gsiError.current = onError;

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        gsiError.current('Google Sign-In is unavailable. Create an account with email instead.');
        return;
      }

      try {
        await loadGsiScript();
        if (cancelled) return;
        const accounts = googleId();
        const container = containerRef.current;
        if (!accounts || !container) return;

        if (gsiInitClientId !== clientId) {
          gsiInitClientId = clientId;
          accounts.initialize({
            client_id: clientId,
            callback: (response: { credential?: string }) => {
              if (response.credential) gsiSuccess.current(response.credential);
              else gsiError.current('Failed to obtain credential from Google.');
            },
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: true,
            itp_support: true,
          });
        }

        container.innerHTML = '';
        accounts.renderButton(container, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          width: Math.max(container.offsetWidth || 0, 280),
        });
      } catch {
        if (!cancelled) gsiError.current('Error loading Google Sign-In.');
      }
    };

    start();
    return () => {
      cancelled = true;
      try {
        googleId()?.cancel?.();
      } catch {
        /* ignore */
      }
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, []);

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 1 }}>
      <div ref={containerRef} style={{ width: '100%', minHeight: 40 }} />
    </Box>
  );
}
