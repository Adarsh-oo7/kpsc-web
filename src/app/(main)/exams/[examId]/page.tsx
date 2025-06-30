'use client';

import { useRouter, useParams } from 'next/navigation';
import useSWR from 'swr';
import { Box, Typography, Button, Paper, Stack, CircularProgress, Alert, Grid } from '@mui/material';
import { useAppContext } from '@/context/AppContext';
import SchoolIcon from '@mui/icons-material/School';
import TimerIcon from '@mui/icons-material/Timer';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

export default function ExamModeSelectionPage() {
    const router = useRouter();
    const params = useParams();
    const examId = params.examId;
    const { fetcher } = useAppContext();

    // We fetch the specific exam details to display its name
    const { data: exam, error, isLoading } = useSWR(`/exams/${examId}/`, fetcher);

    if (isLoading) return <CircularProgress />;
    if (error) return <Alert severity="error">Could not load exam details.</Alert>;

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>{exam?.name}</Typography>
            <Typography variant="h6" sx={{ mb: 4, color: 'text.secondary' }}>How would you like to practice?</Typography>

            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center', height: '100%' }}>
                        <LibraryBooksIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>Study Mode</Typography>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>
                            Go through all questions like flashcards. See answers and explanations instantly. Perfect for learning.
                        </Typography>
                        <Button variant="outlined" size="large" onClick={() => router.push(`/exam/${examId}/study`)}>Start Studying</Button>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center', height: '100%' }}>
                        <TimerIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>Quiz Mode</Typography>
                        <Typography color="text.secondary" sx={{ mb: 3 }}>
                            Take a timed quiz with 15 random questions from this exam. No immediate feedback until the end.
                        </Typography>
                        <Button variant="contained" size="large" onClick={() => router.push(`/quiz?exam_id=${examId}&limit=15`)}>Start Timed Quiz</Button>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}