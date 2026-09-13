'use client';

import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export const GREEN = '#1B6B3A';
export const GREEN_LIGHT = '#2E8B57';

export const greenCtaSx = {
  textTransform: 'none' as const,
  fontWeight: 800,
  borderRadius: '12px',
  px: 2.2,
  background: `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})`,
  boxShadow: '0 8px 18px rgba(27,107,58,0.22)',
  '&:hover': {
    background: `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})`,
    filter: 'brightness(1.06)',
  },
};

export function asList(data: unknown): any[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray((data as { results?: unknown }).results)) {
    return (data as { results: any[] }).results;
  }
  return [];
}

export function InstitutePageHeader({
  eyebrow = 'Academy portal',
  title,
  subtitle,
  action,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
        mb: 3.5,
        flexWrap: 'wrap',
      }}
    >
      <Box>
        <Typography
          sx={{
            fontSize: '0.72rem',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: GREEN,
            mb: 0.5,
          }}
        >
          {eyebrow}
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Cabinet Grotesk', sans-serif",
            fontWeight: 900,
            fontSize: { xs: '1.55rem', md: '1.85rem' },
            letterSpacing: '-0.03em',
            color: 'text.primary',
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ color: 'text.secondary', mt: 0.5, maxWidth: 560, lineHeight: 1.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}
