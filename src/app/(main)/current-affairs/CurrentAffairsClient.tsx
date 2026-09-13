'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Box, Typography, CircularProgress, Stack, IconButton, Button, Dialog, DialogContent, DialogTitle, Radio, RadioGroup, FormControlLabel, Chip, Alert
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useAppContext } from '@/context/AppContext';

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
      return null;
    }
  }
  if (!mcq || typeof mcq !== 'object') return null;

  let options: string[] = [];
  if (Array.isArray(mcq.options)) {
    options = mcq.options.map((opt: unknown) => String(opt || '')).filter(Boolean);
  } else if (mcq.options && typeof mcq.options === 'object') {
    options = ['A', 'B', 'C', 'D']
      .map((letter) => String(mcq.options[letter] || mcq.options[letter.toLowerCase()] || ''))
      .filter(Boolean);
  }
  if (options.length < 4) return null;

  let correctIndex = typeof mcq.correct_index === 'number' ? mcq.correct_index : -1;
  const letter = String(mcq.correct_answer || '').trim().toUpperCase();
  if (correctIndex < 0 && ['A', 'B', 'C', 'D'].includes(letter)) {
    correctIndex = letter.charCodeAt(0) - 65;
  }
  if (correctIndex < 0 || correctIndex > 3) return null;
  if (typeof mcq.question !== 'string' || !mcq.question.trim()) return null;

  return {
    question: mcq.question,
    options,
    correct_index: correctIndex,
    explanation: mcq.explanation || '',
  };
}

function localISODate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateLabel(dateStr: string) {
  return new Date(`${dateStr}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function unwrapAffairs(payload: any): any[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

export default function CurrentAffairsClient() {
  const router = useRouter();
  const { fetcher } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(localISODate);
  const [savedArticles, setSavedArticles] = useState<number[]>([]);
  const [activeMcqNews, setActiveMcqNews] = useState<any | null>(null);
  const [mcqAnswer, setMcqAnswer] = useState<string>('');
  const [showExplanation, setShowExplanation] = useState(false);

  const { data, error, isLoading } = useSWR(
    '/public/current-affairs/',
    fetcher
  );
  const allNews = unwrapAffairs(data);

  useEffect(() => {
    if (allNews.length === 0) return;
    const dates = Array.from(new Set(allNews.map((n: any) => n.publication_date)))
      .filter(Boolean)
      .sort()
      .reverse() as string[];
    if (dates.length > 0 && !dates.includes(selectedDate)) {
      setSelectedDate(dates[0]);
    }
  }, [allNews, selectedDate]);

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

  const filteredNews = allNews.filter((item: any) => item.publication_date === selectedDate);
  const displayNews = filteredNews.length > 0 ? filteredNews : allNews.slice(0, 10);
  const dateOptions = Array.from(new Set(allNews.map((n: any) => n.publication_date)))
    .filter(Boolean)
    .sort()
    .reverse()
    .slice(0, 7) as string[];
  const weekCutoff = new Date();
  weekCutoff.setDate(weekCutoff.getDate() - 7);
  const weekHighlight = allNews
    .filter((item: any) => item.publication_date && new Date(`${item.publication_date}T12:00:00`) >= weekCutoff)
    .sort((a: any, b: any) => {
      const rank = (item: any) => (item.psc_likelihood === 'high' ? 0 : item.psc_likelihood === 'medium' ? 1 : 2);
      return rank(a) - rank(b);
    })
    .slice(0, 3);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', pb: 6 }}>
      {/* Title */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Current Affairs
        </Typography>
        <Typography variant="h4" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 950, color: 'text.primary', mt: 0.5 }}>
          Today's PSC news
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', mt: 0.5 }}>
          Read the day's news, practise the MCQ, then take this week's quiz. Tags mark items more likely to appear in Kerala PSC.
        </Typography>
      </Box>

      {/* Date Picker */}
      <Stack direction="row" spacing={1} overflow="auto" sx={{ pb: 2, mb: 4, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
        {dateOptions.map((dateStr) => {
          const isSelected = selectedDate === dateStr;
          const label = dateLabel(dateStr);
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
              This week's quiz
            </Typography>
          </Stack>
          {weekHighlight.length > 0 ? (
            <Stack spacing={0.5}>
              {weekHighlight.map((item: any) => (
                <Typography key={item.id} sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.6 }}>
                  • {item.title}
                </Typography>
              ))}
            </Stack>
          ) : (
            <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.6 }}>
              Recent Current Affairs questions from this week. Same A–D pattern as the PSC paper.
            </Typography>
          )}
          <Button
            variant="text"
            size="small"
            onClick={() => router.push('/quiz?current_affairs=weekly')}
            sx={{ color: '#F59E0B', textTransform: 'none', fontWeight: 700, mt: 1.5, p: 0 }}
          >
            Take this week's Current Affairs quiz →
          </Button>
        </Box>
      </motion.div>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '16px' }}>
          Could not load Current Affairs. Check your connection and try again.
        </Alert>
      )}
      {!error && displayNews.length === 0 && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: '16px' }}>
          No Current Affairs for this date yet. Try another day, or take this week’s quiz above.
        </Alert>
      )}

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
                          label="Likely in PSC"
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
                        Practice this question
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
                        Read the note →
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
                💡 Practice this question
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
