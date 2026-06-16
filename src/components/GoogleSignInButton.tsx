'use client';

import { useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';

interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => void;
  onError: (error: string) => void;
}

export default function GoogleSignInButton({ onSuccess, onError }: GoogleSignInButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const initializeGoogleSignIn = () => {
      const google = (window as any).google;
      if (google && google.accounts && google.accounts.id) {
        clearInterval(intervalId);

        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        if (!clientId) {
          console.error("NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured in .env.local");
          onError("Google client ID not configured.");
          return;
        }

        try {
          google.accounts.id.initialize({
            client_id: clientId,
            callback: (response: any) => {
              if (response.credential) {
                onSuccess(response.credential);
              } else {
                onError("Failed to obtain credential from Google.");
              }
            },
          });

          if (containerRef.current) {
            google.accounts.id.renderButton(containerRef.current, {
              type: 'standard',
              theme: 'outline',
              size: 'large',
              text: 'signin_with',
              shape: 'rectangular',
              width: containerRef.current.offsetWidth || 340,
            });
          }
        } catch (err: any) {
          console.error("Error initializing Google Identity Services:", err);
          onError("Error loading Google Sign-In.");
        }
      }
    };

    // Script might take a moment to load async defer
    intervalId = setInterval(initializeGoogleSignIn, 100);

    return () => {
      clearInterval(intervalId);
    };
  }, [onSuccess, onError]);

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 1 }}>
      <div 
        ref={containerRef} 
        id="google-signin-btn-container" 
        style={{ width: '100%', minHeight: '40px' }} 
      />
    </Box>
  );
}
