'use client';

import { Box, Typography, useTheme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useEffect } from 'react';
import { getKpscOptions, KPSC_LETTERS, type KpscLetter } from '@/lib/questionSanitizer';

type Props = {
  options: unknown;
  selected?: string;
  correctAnswer?: string;
  revealed?: boolean;
  disabled?: boolean;
  onSelect?: (key: string) => void;
  enableKeys?: boolean;
};

function optionStyle(args: {
  isDark: boolean;
  revealed: boolean;
  selected: boolean;
  correct: boolean;
}) {
  const { isDark, revealed, selected, correct } = args;
  if (revealed && correct) {
    return { border: '2px solid #22c55e', background: 'rgba(34,197,94,0.1)', opacity: 1 };
  }
  if (revealed && selected && !correct) {
    return { border: '2px solid #EF4444', background: 'rgba(239,68,68,0.1)', opacity: 1 };
  }
  if (revealed) {
    return {
      border: isDark ? '2px solid rgba(255,255,255,0.04)' : '2px solid rgba(0,0,0,0.04)',
      background: isDark ? '#1C2230' : '#F1F5F9',
      opacity: 0.55,
    };
  }
  if (selected) {
    return { border: '2px solid #2E8B57', background: 'rgba(27,107,58,0.15)', opacity: 1 };
  }
  return {
    border: `2px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
    background: isDark ? '#1C2230' : '#F1F5F9',
    opacity: 1,
  };
}

export default function KpscOptionList({
  options,
  selected,
  correctAnswer,
  revealed = false,
  disabled = false,
  onSelect,
  enableKeys = false,
}: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const items = getKpscOptions(options).filter((opt) => opt.text);

  useEffect(() => {
    if (!enableKeys || disabled || !onSelect) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      const key = event.key.toUpperCase();
      const fromNumber = event.key === '1' ? 'A' : event.key === '2' ? 'B' : event.key === '3' ? 'C' : event.key === '4' ? 'D' : '';
      const letter = (KPSC_LETTERS as readonly string[]).includes(key) ? key : fromNumber;
      if (letter) {
        event.preventDefault();
        onSelect(letter);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enableKeys, disabled, onSelect]);

  return (
    <Box role="radiogroup" aria-label="Kerala PSC options" sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      {items.map((opt) => {
        const isSelected = selected === opt.key;
        const isCorrect = correctAnswer === opt.key;
        return (
          <Box
            key={opt.key}
            role="radio"
            aria-checked={isSelected}
            tabIndex={disabled ? -1 : 0}
            onClick={() => !disabled && onSelect?.(opt.key)}
            onKeyDown={(event) => {
              if (disabled) return;
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect?.(opt.key);
              }
            }}
            sx={{
              minHeight: 56,
              px: 2,
              py: 1.5,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: disabled ? 'default' : 'pointer',
              transition: 'all 0.2s ease',
              userSelect: 'none',
              ...optionStyle({ isDark, revealed, selected: isSelected, correct: isCorrect }),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, pr: 1 }}>
              <Box
                aria-hidden
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  flexShrink: 0,
                  mt: '2px',
                  border: '2px solid',
                  borderColor: isSelected || (revealed && isCorrect) ? '#2E8B57' : 'rgba(136,146,164,0.45)',
                  background: isSelected || (revealed && isCorrect) ? 'rgba(46,139,87,0.18)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  color: isSelected || (revealed && isCorrect) ? '#2E8B57' : 'text.secondary',
                }}
              >
                {opt.key}
              </Box>
              <Typography sx={{ fontSize: '0.95rem', color: 'text.primary', lineHeight: 1.55 }}>
                {opt.text}
              </Typography>
            </Box>
            {revealed && isCorrect && <CheckCircleIcon sx={{ fontSize: 20, color: '#22c55e', flexShrink: 0 }} />}
            {revealed && isSelected && !isCorrect && <CancelIcon sx={{ fontSize: 20, color: '#EF4444', flexShrink: 0 }} />}
          </Box>
        );
      })}
      {enableKeys && !disabled && (
        <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', pl: 0.5 }}>
          Tip: press A–D or 1–4, like the OMR sheet
        </Typography>
      )}
    </Box>
  );
}

export function kpscLetterLabel(key: string): KpscLetter | string {
  return String(key || '').toUpperCase();
}
