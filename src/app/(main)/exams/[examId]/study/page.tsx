'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { Box, Typography, Button, Paper, Alert, CircularProgress, Collapse, Stack, IconButton } from '@mui/material';
import { useAppContext } from '@/context/AppContext';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

export default function StudyModePage() {
    const params = useParams();
    const examId = params.examId;
    const { fetcher } = useAppContext();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);

    const { data: questions, error, isLoading } = useSWR(`/questions/?exam_id=${examId}`, fetcher);

    if (isLoading) return <CircularProgress />;
    if (error || !questions || questions.length === 0) return <Alert severity="error">No questions found for this exam.</Alert>;

    const currentQuestion = questions[currentIndex];
    const goToNext = () => {
        setShowAnswer(false);
        setCurrentIndex(prev => (prev + 1) % questions.length);
    };
    const goToPrev = () => {
        setShowAnswer(false);
        setCurrentIndex(prev => (prev - 1 + questions.length) % questions.length);
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, color: 'white' }}>Study Mode</Typography>
            <Paper sx={{ p: 4, borderRadius: 4 }}>
                <Typography color="text.secondary">Question {currentIndex + 1} of {questions.length}</Typography>
                <Typography variant="h5" sx={{ my: 3, minHeight: '100px' }}>{currentQuestion.text}</Typography>
                
                <Stack spacing={1} sx={{mb: 3}}>
                    {Object.entries(currentQuestion.options).map(([key, value]) => (
                        <Paper key={key} variant="outlined" sx={{ p: 2, bgcolor: showAnswer && key === currentQuestion.correct_answer ? 'success.light' : 'action.hover' }}>
                            <Typography>{value as string}</Typography>
                        </Paper>
                    ))}
                </Stack>

                <Button variant="contained" onClick={() => setShowAnswer(!showAnswer)} startIcon={<LightbulbIcon/>}>
                    {showAnswer ? "Hide Answer" : "Show Answer"}
                </Button>

                <Collapse in={showAnswer}>
                    <Alert severity="success" sx={{ mt: 3 }}>
                        <Typography fontWeight="bold">Correct Answer: {currentQuestion.correct_answer}</Typography>
                        {currentQuestion.explanation && <Typography sx={{mt: 1}}><strong>Explanation:</strong> {currentQuestion.explanation}</Typography>}
                    </Alert>
                </Collapse>
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={goToPrev}>Previous</Button>
                <Button endIcon={<ArrowForwardIcon />} onClick={goToNext}>Next</Button>
            </Box>
        </Box>
    );
}