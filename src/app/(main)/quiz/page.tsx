'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Box, Typography, RadioGroup, FormControlLabel, Radio, Alert,
  CircularProgress, Button, Stack, Paper, AppBar, Toolbar, Chip, Grid, Divider
} from '@mui/material';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';
import { motion } from 'framer-motion';

// --- Icon Imports ---
import TimerIcon from '@mui/icons-material/Timer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// --- Type Definitions ---
interface ResultData {
  results: { score: number; total: number; correct: number; wrong: number; unanswered: number; };
  questions: any[];
  timeTaken: number;
}
interface UserAnswers { [questionId: string]: string; }


export default function ScrollingQuizPage() {
  const { fetcher, setExamId, setTopicId } = useAppContext();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const quizDuration = 15 * 60; // 15 minutes in seconds

  const [answers, setAnswers] = useState<UserAnswers>({});
  const [isFinished, setIsFinished] = useState(false);
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // CORRECTED: Timer state is now managed by the main component
  const [timeLeft, setTimeLeft] = useState(quizDuration);
  
  const topOfPageRef = useRef<HTMLDivElement>(null);

  const apiUrl = useMemo(() => {
    const examIdFromUrl = searchParams.get('exam_id');
    const topicIdFromUrl = searchParams.get('topic_id');
    if (examIdFromUrl) setExamId(examIdFromUrl);
    if (topicIdFromUrl) setTopicId(topicIdFromUrl);
    if (!examIdFromUrl && !topicIdFromUrl) return null;

    const params = new URLSearchParams();
    if (examIdFromUrl) params.append('exam_id', examIdFromUrl);
    if (topicIdFromUrl) params.append('topic_id', topicIdFromUrl);
    params.append('limit', '15');
    return `/questions/?${params.toString()}`;
  }, [searchParams, setExamId, setTopicId]);

  const { data: questions, error, isLoading } = useSWR(apiUrl, fetcher, { revalidateOnFocus: false });

  // CORRECTED: This function is now stable and includes all dependencies
  const handleSubmit = useCallback(async () => {
    if (isFinished) return;
    if (!window.confirm("Are you sure you want to finish the quiz?")) {
        setIsSubmitting(false); // Make sure to reset submitting state if user cancels
        return;
    };
    
    setIsSubmitting(true);
    // CORRECTED: Time calculation is now direct and reliable
    const timeTaken = quizDuration - timeLeft;
    
    try {
      // CORRECTED: Send the full list of question IDs for proper review
      const allQuestionIds = questions?.map((q: any) => q.id) || [];
      const response = await apiClient.post('/submit-exam/', { 
        answers,
        question_ids: allQuestionIds
      });
      
      setResultData({ ...response.data, timeTaken });
      setIsFinished(true);
      topOfPageRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      alert("There was an error submitting your quiz.");
      setIsSubmitting(false);
    }
  }, [answers, timeLeft, isFinished, questions, quizDuration]);

  // CORRECTED: Timer logic is now inside the main component
  useEffect(() => {
    if (isLoading || isFinished) return;
    if (timeLeft <= 0) {
      alert("Time is up! Your quiz will be submitted automatically.");
      handleSubmit();
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft(prevTime => prevTime > 0 ? prevTime - 1 : 0);
    }, 1000);
    return () => clearInterval(timerId);
  }, [isLoading, isFinished, timeLeft, handleSubmit]);


  if (isLoading) return <CircularProgress sx={{display: 'block', mx: 'auto', mt: 4}} />;
  if (error) return <Alert severity="error">Could not load quiz questions.</Alert>;
  if (!apiUrl || !questions || questions.length === 0) return <Alert severity="info">No questions available for this selection.</Alert>;

  // Format time for display
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  // --- RENDER THE RESULTS SCREEN ---
  if (isFinished && resultData) {
    const { results, questions: resultQuestions } = resultData;
    const timeTakenMinutes = Math.floor(resultData.timeTaken / 60);
    const timeTakenSeconds = resultData.timeTaken % 60;
    return (
      <Box ref={topOfPageRef} sx={{color: 'text.primary'}}>
        <Paper sx={{ p: {xs: 2, md: 4}, textAlign: 'center', borderRadius: 4, bgcolor: 'background.paper' }}>
            <EmojiEventsIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>Quiz Results</Typography>
            <Typography variant="h2" sx={{ fontWeight: 'bold', color: 'primary.light' }}>{results.score}</Typography>
            <Typography variant="h6" color="text.secondary">Final Score</Typography>
            
            <Grid container spacing={2} sx={{ my: 4 }}>
                <Grid item xs={6} sm={3}><Paper elevation={2} sx={{p:2}}><Typography color="success.main" variant="h5">{results.correct}</Typography><Typography>Correct</Typography></Paper></Grid>
                <Grid item xs={6} sm={3}><Paper elevation={2} sx={{p:2}}><Typography color="error.main" variant="h5">{results.wrong}</Typography><Typography>Wrong</Typography></Paper></Grid>
                <Grid item xs={6} sm={3}><Paper elevation={2} sx={{p:2}}><Typography color="text.secondary" variant="h5">{results.unanswered}</Typography><Typography>Unanswered</Typography></Paper></Grid>
                <Grid item xs={6} sm={3}><Paper elevation={2} sx={{p:2}}><Typography color="info.main" variant="h5">{timeTakenMinutes}m {timeTakenSeconds}s</Typography><Typography>Time Taken</Typography></Paper></Grid>
            </Grid>
            <Button variant="contained" size="large" onClick={() => router.push('/exams')}>Try Another Challenge</Button>
        </Paper>
        
        <Box mt={5}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, color: 'white' }}>Review Your Answers</Typography>
            <Stack spacing={2}>
                {resultQuestions.map((q: any, index: number) => {
                    const userAnswerKey = answers[q.id];
                    const isCorrect = userAnswerKey === q.correct_answer;
                    return (
                        <Paper key={q.id} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{index + 1}. {q.text}</Typography>
                            <Stack spacing={1} my={2}>
                                {Object.entries(q.options).map(([key, value]) => {
                                    let icon = <HelpOutlineIcon color="disabled" sx={{visibility: 'hidden'}}/>;
                                    if (key === q.correct_answer) icon = <CheckCircleIcon color="success"/>;
                                    if (key === userAnswerKey && !isCorrect) icon = <CancelIcon color="error"/>;
                                    return (
                                        <Paper key={key} variant="outlined" sx={{p: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, borderColor: key === q.correct_answer ? 'success.main' : 'divider', bgcolor: key === userAnswerKey ? 'action.hover' : 'transparent'}}>
                                            {icon}
                                            <Typography>{value as string}</Typography>
                                        </Paper>
                                    );
                                })}
                            </Stack>
                            {!userAnswerKey && <Alert severity='warning' sx={{mb: 2}}>You did not answer this question.</Alert>}
                            {q.explanation && <Alert severity="info" icon={false}><strong>Explanation:</strong> {q.explanation}</Alert>}
                        </Paper>
                    );
                })}
            </Stack>
        </Box>
      </Box>
    );
  }

  // --- RENDER THE QUIZ IN PROGRESS ---
  return (
    <Box ref={topOfPageRef}>
      <AppBar position="sticky" sx={{ top: 80, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 3, mb: 4 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            {questions.length}-Question Challenge
          </Typography>
          <Chip icon={<TimerIcon />} label={`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
            color={timeLeft < 60 ? "error" : "primary"} sx={{ fontSize: '1.1rem', p: 2.5, fontWeight: 'bold' }} />
        </Toolbar>
      </AppBar>
      <motion.div initial={{opacity: 0}} animate={{opacity: 1}}>
        <Stack spacing={3}>
            {questions.map((question: any, index: number) => (
            <Paper key={question.id} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>{index + 1}. {question.text}</Typography>
                <RadioGroup
                    value={answers[question.id] || ''}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
                >
                <Stack spacing={1}>
                    {Object.entries(question.options).map(([key, value]) => (
                    <FormControlLabel key={key} value={key} control={<Radio />} label={value as string} />
                    ))}
                </Stack>
                </RadioGroup>
            </Paper>
            ))}
            <Button
                variant="contained" color="success" size="large" onClick={handleSubmit}
                disabled={isSubmitting} sx={{ py: 2, fontSize: '1.2rem', mt: 2 }}
            >
            {isSubmitting ? <CircularProgress size={28} color="inherit" /> : 'Finish & Submit Quiz'}
            </Button>
        </Stack>
      </motion.div>
    </Box>
  );
}