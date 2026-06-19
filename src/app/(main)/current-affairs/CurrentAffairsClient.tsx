'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Box, Typography, CircularProgress, Stack, Grid, IconButton, Button, Dialog, DialogContent, DialogTitle, Radio, RadioGroup, FormControlLabel, Chip
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useAppContext } from '@/context/AppContext';

export default function CurrentAffairsClient() {
  const router = useRouter();
  const { fetcher } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [savedArticles, setSavedArticles] = useState<number[]>([]);
  const [activeMcqNews, setActiveMcqNews] = useState<any | null>(null);
  const [mcqAnswer, setMcqAnswer] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);

  // Fetch current affairs from the backend endpoint
  const { data, error, isLoading } = useSWR(
    '/public/current-affairs/',
    fetcher
  );

  const toggleSaveArticle = (id: number) => {
    setSavedArticles(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleOpenMcq = (newsItem: any) => {
    setActiveMcqNews(newsItem);
    setMcqAnswer('');
    setShowExplanation(false);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={32} sx={{ color: '#2E8B57' }} />
      </Box>
    );
  }

  // Filter items matching the selected date (or show all if none match exactly)
  const allNews = data || [];
  const filteredNews = allNews.filter((item: any) => item.publication_date === selectedDate);
  const displayNews = filteredNews.length > 0 ? filteredNews : allNews.slice(0, 10);

  // Get date choices for the selector (last 5 active dates from API, or last 5 calendar days)
  const dateOptions = Array.from(new Set(allNews.map((n: any) => n.publication_date)))
    .sort()
    .reverse()
    .slice(0, 5) as string[];

  // Fallback dates if API list is empty
  if (dateOptions.length === 0) {
    for (let i = 0; i < 5; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dateOptions.push(d.toISOString().split('T')[0]);
    }
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', pb: 6 }}>
      {/* Title */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Current Affairs 📰
        </Typography>
        <Typography variant="h4" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 950, color: '#F0F4F8', mt: 0.5 }}>
          Daily News Feed
        </Typography>
        <Typography sx={{ color: '#8892A4', fontSize: '0.9rem', mt: 0.5 }}>
          Read carefully curated news updates with probability tags indicating high-yield PSC topics.
        </Typography>
      </Box>

      {/* Date Picker */}
      <Stack direction="row" spacing={1} overflow="auto" sx={{ pb: 2, mb: 4, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
        {dateOptions.map((dateStr) => {
          const isSelected = selectedDate === dateStr;
          const dt = new Date(dateStr);
          const label = dt.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
          return (
            <Button
              key={dateStr}
              variant="outlined"
              size="small"
              onClick={() => setSelectedDate(dateStr)}
              sx={{
                flexShrink: 0,
                borderRadius: '20px',
                py: 0.75, px: 2,
                fontFamily: "'JetBrains Mono'",
                fontSize: '0.75rem',
                color: isSelected ? '#F0F4F8' : '#8892A4',
                background: isSelected ? 'linear-gradient(135deg, #1B6B3A, #2E8B57)' : 'rgba(255,255,255,0.02)',
                borderColor: isSelected ? '#2E8B57' : 'rgba(255,255,255,0.1)',
                '&:hover': {
                  borderColor: isSelected ? '#2E8B57' : 'rgba(255,255,255,0.2)',
                  background: isSelected ? 'linear-gradient(135deg, #1B6B3A, #2E8B57)' : 'rgba(255,255,255,0.04)',
                }
              }}
            >
              {label}
            </Button>
          );
        })}
      </Stack>

      {/* Weekly Digest Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Box sx={{
          p: 3,
          background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.12) 0%, rgba(21, 23, 27, 0.5) 100%)',
          border: '1px solid rgba(217, 119, 6, 0.3)',
          borderRadius: '20px',
          mb: 4
        }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
            <EmojiEventsIcon sx={{ color: '#F59E0B' }} />
            <Typography variant="subtitle1" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, color: '#F0F4F8' }}>
              Weekly Digest Overview
            </Typography>
          </Stack>
          <Typography sx={{ fontSize: '0.8rem', color: '#8892A4', lineHeight: 1.6 }}>
            • India ranking in Global Innovation Index 2026: <strong>39th Position</strong><br />
            • New Governor of Reserve Bank of India appointed<br />
            • Kerala budget proposals announce infrastructure push of ₹2.3 Lakh Cr
          </Typography>
          <Button
            variant="text"
            size="small"
            onClick={() => router.push('/quiz')}
            sx={{ color: '#F59E0B', textTransform: 'none', fontWeight: 700, mt: 1.5, p: 0 }}
          >
            Take Weekly News Quiz →
          </Button>
        </Box>
      </motion.div>

      {/* News List */}
      <Stack spacing={3}>
        <AnimatePresence mode="popLayout">
          {displayNews.map((news: any, idx: number) => {
            const isSaved = savedArticles.includes(news.id);
            const isHighChance = news.psc_likelihood === 'high';

            return (
              <motion.div
                key={news.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Box sx={{
                  p: 3,
                  background: '#161B22',
                  border: isHighChance ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '20px',
                  position: 'relative'
                }}>
                  {/* Category + Likelihood Badge */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Chip
                      label={news.category}
                      size="small"
                      sx={{
                        fontSize: '0.7rem', fontWeight: 800,
                        bgcolor: 'rgba(255,255,255,0.04)', color: '#8892A4',
                        border: '1px solid rgba(255,255,255,0.08)'
                      }}
                    />
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {isHighChance && (
                        <Chip
                          label="🔥 HIGH PSC PROBABILITY"
                          size="small"
                          sx={{
                            fontSize: '0.65rem', fontWeight: 900,
                            bgcolor: 'rgba(245,158,11,0.12)', color: '#F59E0B',
                            border: '1px solid rgba(245,158,11,0.25)'
                          }}
                        />
                      )}
                      <IconButton onClick={() => toggleSaveArticle(news.id)} sx={{ p: 0.5, color: isSaved ? '#F59E0B' : '#8892A4' }}>
                        {isSaved ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
                      </IconButton>
                    </Stack>
                  </Stack>

                  {/* Headline */}
                  <Typography variant="h6" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, color: '#F0F4F8', lineHeight: 1.4, mb: 1.5 }}>
                    {news.title}
                  </Typography>

                  {/* Summary Content */}
                  <Typography sx={{ color: '#8892A4', fontSize: '0.875rem', lineHeight: 1.6, mb: 2.5 }}>
                    {news.content}
                  </Typography>

                  {/* See MCQ Button */}
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<HelpOutlineIcon />}
                    onClick={() => handleOpenMcq(news)}
                    sx={{
                      textTransform: 'none', fontWeight: 700, borderRadius: '8px',
                      color: '#2563EB', borderColor: 'rgba(37,99,235,0.3)',
                      '&:hover': { borderColor: '#2563EB', background: 'rgba(37,99,235,0.04)' }
                    }}
                  >
                    Solve News MCQ
                  </Button>
                </Box>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </Stack>

      {/* MCQ Modal */}
      <Dialog
        open={Boolean(activeMcqNews)}
        onClose={() => setActiveMcqNews(null)}
        PaperProps={{
          sx: {
            background: '#161B22',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px',
            maxWidth: 500,
            p: 2
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, color: '#F0F4F8', pb: 1 }}>
          💡 Practice MCQ
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '0.9rem', color: '#8892A4', mb: 3 }}>
            Based on: "{activeMcqNews?.title}"
          </Typography>

          {/* Dummy MCQ Question */}
          <Typography sx={{ fontWeight: 700, color: '#F0F4F8', mb: 2.5 }}>
            Question: What rank did India achieve in the recent publication of the Global Innovation Index 2026?
          </Typography>

          <RadioGroup value={mcqAnswer} onChange={(e) => { setMcqAnswer(e.target.value); setShowExplanation(true); }}>
            <FormControlLabel
              value="A"
              control={<Radio sx={{ color: '#8892A4', '&.Mui-checked': { color: '#2E8B57' } }} />}
              label={<Typography sx={{ color: '#F0F4F8', fontSize: '0.875rem' }}>A) 35th Rank</Typography>}
              sx={{ mb: 1 }}
            />
            <FormControlLabel
              value="B"
              control={<Radio sx={{ color: '#8892A4', '&.Mui-checked': { color: '#2E8B57' } }} />}
              label={<Typography sx={{ color: '#F0F4F8', fontSize: '0.875rem' }}>B) 39th Rank (Correct)</Typography>}
              sx={{ mb: 1 }}
            />
            <FormControlLabel
              value="C"
              control={<Radio sx={{ color: '#8892A4', '&.Mui-checked': { color: '#2E8B57' } }} />}
              label={<Typography sx={{ color: '#F0F4F8', fontSize: '0.875rem' }}>C) 42nd Rank</Typography>}
              sx={{ mb: 1 }}
            />
          </RadioGroup>

          {showExplanation && (
            <Box sx={{
              mt: 3, p: 2,
              background: mcqAnswer === 'B' ? 'rgba(46,139,87,0.1)' : 'rgba(239,68,68,0.1)',
              border: mcqAnswer === 'B' ? '1px solid rgba(46,139,87,0.2)' : '1px solid rgba(239,68,68,0.2)',
              borderRadius: '12px',
            }}>
              <Typography sx={{ fontWeight: 800, color: mcqAnswer === 'B' ? '#22c55e' : '#EF4444', fontSize: '0.85rem', mb: 0.5 }}>
                {mcqAnswer === 'B' ? '✓ Correct Answer!' : '✗ Incorrect Answer'}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#8892A4', lineHeight: 1.5 }}>
                India achieved the 39th position moving up from previous records in the Global Innovation Index, highlighting major boosts in technological research and educational quality.
              </Typography>
            </Box>
          )}

          <Button
            fullWidth
            onClick={() => setActiveMcqNews(null)}
            sx={{
              mt: 3, textTransform: 'none', fontWeight: 700, borderRadius: '10px',
              bgcolor: 'rgba(255,255,255,0.04)', color: '#F0F4F8',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.06)' }
            }}
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
