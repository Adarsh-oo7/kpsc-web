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
import { alpha } from '@mui/material/styles';

interface MCQ {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

function getParsedMcq(newsItem: any): MCQ | null {
  if (!newsItem || !newsItem.mcq) return null;
  let mcq = newsItem.mcq;
  if (typeof mcq === 'string') {
    try {
      mcq = JSON.parse(mcq);
    } catch (e) {
      console.error("Failed to parse MCQ JSON string:", e);
      return null;
    }
  }
  if (
    mcq &&
    typeof mcq.question === 'string' &&
    Array.isArray(mcq.options) &&
    mcq.options.length >= 3 &&
    typeof mcq.correct_index === 'number'
  ) {
    return mcq as MCQ;
  }
  return null;
}

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

  // Automatically select the most recent date with news if selectedDate has no news
  useEffect(() => {
    if (data && data.length > 0) {
      const dates = Array.from(new Set(data.map((n: any) => n.publication_date)))
        .sort()
        .reverse() as string[];
      if (dates.length > 0 && !dates.includes(selectedDate)) {
        setSelectedDate(dates[0]);
      }
    }
  }, [data, selectedDate]);

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
        <Typography variant="h4" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 950, color: 'text.primary', mt: 0.5 }}>
          Daily News Feed
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', mt: 0.5 }}>
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
                color: isSelected ? 'common.white' : 'text.secondary',
                background: isSelected ? 'linear-gradient(135deg, #1B6B3A, #2E8B57)' : 'transparent',
                borderColor: isSelected ? '#2E8B57' : 'divider',
                '&:hover': {
                  borderColor: isSelected ? '#2E8B57' : 'action.selected',
                  background: isSelected ? 'linear-gradient(135deg, #1B6B3A, #2E8B57)' : 'action.hover',
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
          background: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(217, 119, 6, 0.12) 0%, rgba(21, 23, 27, 0.5) 100%)'
            : 'linear-gradient(135deg, rgba(217, 119, 6, 0.08) 0%, rgba(245, 158, 11, 0.02) 100%)',
          border: '1px solid rgba(217, 119, 6, 0.3)',
          borderRadius: '20px',
          mb: 4
        }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
            <EmojiEventsIcon sx={{ color: '#F59E0B' }} />
            <Typography variant="subtitle1" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, color: 'text.primary' }}>
              Weekly Digest Overview
            </Typography>
          </Stack>
          <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.6 }}>
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
                  background: 'background.paper',
                  border: '1px solid',
                  borderColor: isHighChance ? 'rgba(245, 158, 11, 0.3)' : 'divider',
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
                        bgcolor: 'action.hover', color: 'text.secondary',
                        border: '1px solid', borderColor: 'divider'
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
                      <IconButton onClick={() => toggleSaveArticle(news.id)} sx={{ p: 0.5, color: isSaved ? 'secondary.main' : 'text.secondary' }}>
                        {isSaved ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
                      </IconButton>
                    </Stack>
                  </Stack>

                  {/* Headline */}
                  <Typography variant="h6" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, color: 'text.primary', lineHeight: 1.4, mb: 1.5 }}>
                    {news.title}
                  </Typography>

                  {/* Summary Content */}
                  <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.6, mb: 2.5 }}>
                    {news.content}
                  </Typography>

                  {/* Actions Row */}
                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    {getParsedMcq(news) && (
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
                    )}
                    {news.slug && (
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => router.push(`/current-affairs/${news.slug}`)}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 700,
                          color: 'text.secondary',
                          '&:hover': { color: 'text.primary' }
                        }}
                      >
                        Read Full Analysis →
                      </Button>
                    )}
                  </Stack>
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
            background: 'background.paper',
            border: '1px solid', borderColor: 'divider',
            borderRadius: '20px',
            maxWidth: 500,
            p: 2
          }
        }}
      >
        {activeMcqNews && (() => {
          const mcqData = getParsedMcq(activeMcqNews);
          if (!mcqData) return null;

          const isAnswerSelected = mcqAnswer !== '';
          const isCorrect = isAnswerSelected && Number(mcqAnswer) === mcqData.correct_index;

          return (
            <>
              <DialogTitle sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, color: 'text.primary', pb: 1 }}>
                💡 Practice MCQ
              </DialogTitle>
              <DialogContent>
                <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary', mb: 3 }}>
                  Based on: "{activeMcqNews.title}"
                </Typography>

                <Typography sx={{ fontWeight: 700, color: 'text.primary', mb: 2.5 }}>
                  Question: {mcqData.question}
                </Typography>

                <RadioGroup 
                  value={mcqAnswer} 
                  onChange={(e) => { 
                    setMcqAnswer(e.target.value); 
                    setShowExplanation(true); 
                  }}
                >
                  {mcqData.options.map((option: string, index: number) => {
                    const letters = ['A', 'B', 'C', 'D'];
                    const letter = letters[index] || String(index + 1);
                    return (
                      <FormControlLabel
                        key={index}
                        value={String(index)}
                        control={<Radio sx={{ color: 'text.secondary', '&.Mui-checked': { color: '#2E8B57' } }} />}
                        label={<Typography sx={{ color: 'text.primary', fontSize: '0.875rem' }}>{letter}) {option}</Typography>}
                        sx={{ mb: 1 }}
                      />
                    );
                  })}
                </RadioGroup>

                {showExplanation && isAnswerSelected && (
                  <Box sx={{
                    mt: 3, p: 2,
                    background: isCorrect ? 'rgba(46,139,87,0.1)' : 'rgba(239,68,68,0.1)',
                    border: isCorrect ? '1px solid rgba(46,139,87,0.2)' : '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '12px',
                  }}>
                    <Typography sx={{ fontWeight: 800, color: isCorrect ? '#22c55e' : '#EF4444', fontSize: '0.85rem', mb: 0.5 }}>
                      {isCorrect ? '✓ Correct Answer!' : `✗ Incorrect Answer (Correct option is ${['A', 'B', 'C', 'D'][mcqData.correct_index]})`}
                    </Typography>
                    <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', lineHeight: 1.5 }}>
                      {mcqData.explanation}
                    </Typography>
                  </Box>
                )}

                <Button
                  fullWidth
                  onClick={() => setActiveMcqNews(null)}
                  sx={{
                    mt: 3, textTransform: 'none', fontWeight: 700, borderRadius: '10px',
                    bgcolor: 'action.hover', color: 'text.primary',
                    '&:hover': { bgcolor: 'action.selected' }
                  }}
                >
                  Close
                </Button>
              </DialogContent>
            </>
          );
        })()}
      </Dialog>
    </Box>
  );
}
