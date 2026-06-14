'use client';

import { useState } from 'react';
import useSWR from 'swr';
import apiClient from '@/lib/apiClient';
import {
  Box, Typography, Button, CircularProgress, Alert, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack,
  Select, MenuItem, InputLabel, FormControl, RadioGroup, Radio, FormLabel,FormControlLabel,
  Grid // CORRECTED: Added Grid to the import list
} from '@mui/material';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';

// --- Helper Fetcher (uses apiClient — auth headers injected automatically) ---
const fetcher = (url: string) => apiClient.get(url).then(r => r.data);

const initialFormState = {
    text: '',
    options: ['', '', '', ''],
    correct_answer: 'A',
    explanation: '',
    difficulty: 'medium',
    exam: '',
    topic: '',
};

export default function ManageQuestionsPage() {
    // SWR hooks to fetch all necessary data
    const { data: questions, error: questionsError, isLoading: questionsLoading, mutate: mutateQuestions } = useSWR('/api/institute/questions/', fetcher);
    const { data: exams, error: examsError } = useSWR('/api/exams/', fetcher);
    const { data: topics, error: topicsError } = useSWR('/api/institute/topics/', fetcher);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [formState, setFormState] = useState(initialFormState);
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOpenDialog = () => setDialogOpen(true);
    const handleCloseDialog = () => {
        setDialogOpen(false);
        setFormState(initialFormState);
        setFormError('');
    };

    const handleFormChange = (e: React.ChangeEvent<any>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...formState.options];
        newOptions[index] = value;
        setFormState(prev => ({ ...prev, options: newOptions }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setFormError('');

        const optionsPayload = {
            'A': formState.options[0],
            'B': formState.options[1],
            'C': formState.options[2],
            'D': formState.options[3],
        };

        const payload = { ...formState, options: optionsPayload };

        try {
            await apiClient.post('/institute/questions/', payload);
            mutateQuestions();
            handleCloseDialog();
        } catch (err: any) {
            setFormError(err.response?.data?.detail || 'Failed to add question. Please check all fields.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>Manage Questions</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog}>
                    Add New Question
                </Button>
            </Box>

            {(questionsLoading) && <CircularProgress />}
            {(questionsError || examsError || topicsError) && <Alert severity="error">Failed to load necessary data.</Alert>}

            <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Question Text</TableCell>
                                <TableCell>Topic</TableCell>
                                <TableCell>Difficulty</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {questions?.map((q: any) => (
                                <TableRow key={q.id} hover>
                                    <TableCell sx={{ maxWidth: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {q.text}
                                    </TableCell>
                                    <TableCell>{topics?.find((t: any) => t.id === q.topic)?.name || 'N/A'}</TableCell>
                                    <TableCell sx={{ textTransform: 'capitalize' }}>{q.difficulty}</TableCell>
                                    <TableCell align="right">
                                        <Button size="small" sx={{ mr: 1 }}>Edit</Button>
                                        <Button size="small" color="error">Delete</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="md">
                <DialogTitle>Add a New Question</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        {formError && <Alert severity="error">{formError}</Alert>}
                        <TextField name="text" label="Question Text" value={formState.text} onChange={handleFormChange} multiline rows={3} fullWidth />
                        <Grid container spacing={2}>
                            {formState.options.map((option, index) => (
                                <Grid size={{ xs: 12, sm: 6 }} key={index}>
                                    <TextField label={`Option ${String.fromCharCode(65 + index)}`} value={option} onChange={(e) => handleOptionChange(index, e.target.value)} fullWidth />
                                </Grid>
                            ))}
                        </Grid>
                        <FormControl>
                            <FormLabel>Correct Answer</FormLabel>
                            <RadioGroup row name="correct_answer" value={formState.correct_answer} onChange={handleFormChange}>
                                {['A', 'B', 'C', 'D'].map(label => (
                                    <FormControlLabel key={label} value={label} control={<Radio />} label={label} />
                                ))}
                            </RadioGroup>
                        </FormControl>
                        <TextField name="explanation" label="Explanation (Optional)" value={formState.explanation} onChange={handleFormChange} multiline rows={2} fullWidth />
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Difficulty</InputLabel>
                                    <Select name="difficulty" label="Difficulty" value={formState.difficulty} onChange={(e) => handleFormChange(e as any)}>
                                        <MenuItem value="easy">Easy</MenuItem>
                                        <MenuItem value="medium">Medium</MenuItem>
                                        <MenuItem value="hard">Hard</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Exam</InputLabel>
                                    <Select name="exam" label="Exam" value={formState.exam} onChange={(e) => handleFormChange(e as any)}>
                                        {exams?.map((exam: any) => <MenuItem key={exam.id} value={exam.id}>{exam.name}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Topic</InputLabel>
                                    <Select name="topic" label="Topic" value={formState.topic} onChange={(e) => handleFormChange(e as any)}>
                                        {topics?.map((topic: any) => <MenuItem key={topic.id} value={topic.id}>{topic.name}</MenuItem>)}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={24} /> : 'Save Question'}
                    </Button>
                </DialogActions>
            </Dialog>
        </motion.div>
    );
}