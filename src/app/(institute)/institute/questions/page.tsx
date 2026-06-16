'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import {
  Box, Typography, Button, CircularProgress, Alert, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack,
  Chip, IconButton, Tooltip, InputAdornment, FormControl, InputLabel, Select, MenuItem,
  RadioGroup, Radio, FormControlLabel, FormLabel, Grid
} from '@mui/material';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';

const DIFFICULTY_COLORS: Record<string, 'success' | 'warning' | 'error'> = {
  easy: 'success',
  medium: 'warning',
  hard: 'error',
};

const initialFormState = {
  question_text: '',
  option_a: '',
  option_b: '',
  option_c: '',
  option_d: '',
  correct_answer: 'A',
  explanation: '',
  difficulty: 'medium',
  topic: '',
};

export default function ManageQuestionsPage() {
  const { fetcher } = useAppContext();

  // FIXED: Use context fetcher and correct URL (no /api/ prefix)
  const { data: questions, error, isLoading, mutate } = useSWR('/institute/questions/', fetcher, { fallbackData: [] });
  const { data: topics } = useSWR('/institute/topics/', fetcher, { fallbackData: [] });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [questionToDelete, setQuestionToDelete] = useState<any>(null);
  const [form, setForm] = useState(initialFormState);
  const [searchQuery, setSearchQuery] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredQuestions = useMemo(() => {
    if (!questions) return [];
    if (!searchQuery.trim()) return questions;
    return questions.filter((q: any) =>
      (q.question_text || q.text || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [questions, searchQuery]);

  const handleOpenDialog = (question?: any) => {
    if (question) {
      setEditingQuestion(question);
      setForm({
        question_text: question.question_text || question.text || '',
        option_a: question.option_a || (question.options && question.options['A']) || '',
        option_b: question.option_b || (question.options && question.options['B']) || '',
        option_c: question.option_c || (question.options && question.options['C']) || '',
        option_d: question.option_d || (question.options && question.options['D']) || '',
        correct_answer: question.correct_answer || 'A',
        explanation: question.explanation || '',
        difficulty: question.difficulty || 'medium',
        topic: question.topic?.toString() || '',
      });
    } else {
      setEditingQuestion(null);
      setForm(initialFormState);
    }
    setFormError('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingQuestion(null);
    setForm(initialFormState);
    setFormError('');
  };

  const handleFormChange = (e: any) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.question_text || !form.option_a || !form.option_b || !form.option_c || !form.option_d) {
      setFormError('Question text and all 4 options are required.');
      return;
    }
    setIsSubmitting(true);
    setFormError('');
    try {
      const payload = {
        ...form,
        topic: form.topic || null,
      };
      if (editingQuestion) {
        await apiClient.patch(`/institute/questions/${editingQuestion.id}/`, payload);
      } else {
        await apiClient.post('/institute/questions/', payload);
      }
      mutate();
      handleCloseDialog();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || err.response?.data?.question_text?.[0] || 'Failed to save question.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDeleteDialog = (question: any) => {
    setQuestionToDelete(question);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!questionToDelete) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/institute/questions/${questionToDelete.id}/`);
      mutate();
      setDeleteDialogOpen(false);
      setQuestionToDelete(null);
    } catch {
      alert('Failed to delete question.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>Question Bank</Typography>
          <Typography variant="subtitle2" sx={{ color: 'grey.400', mt: 0.5 }}>
            Create and manage custom mock-test questions for your students
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Question
        </Button>
      </Box>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 4, bgcolor: 'background.paper' }}>
        <TextField
          fullWidth
          placeholder="Search questions by text..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
        />
      </Paper>

      {isLoading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />}
      {error && <Alert severity="error">Failed to load questions.</Alert>}

      {/* Questions Table */}
      {!isLoading && (
        <Paper sx={{ borderRadius: 4, bgcolor: 'background.paper', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Question</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Topic</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Difficulty</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Answer</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredQuestions.length > 0 ? filteredQuestions.map((q: any, idx: number) => {
                  const qText = q.question_text || q.text || '';
                  return (
                    <TableRow key={q.id} hover>
                      <TableCell sx={{ color: 'grey.500', fontSize: '0.8rem' }}>{idx + 1}</TableCell>
                      <TableCell sx={{ maxWidth: 350 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'white', lineHeight: 1.4 }}>
                          {qText.length > 100 ? `${qText.slice(0, 100)}...` : qText}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {topics?.find((t: any) => t.id === q.topic)?.name ? (
                          <Chip label={topics.find((t: any) => t.id === q.topic).name} size="small" variant="outlined" />
                        ) : (
                          <Typography variant="caption" color="text.secondary">—</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={q.difficulty || 'medium'}
                          size="small"
                          color={DIFFICULTY_COLORS[q.difficulty] || 'warning'}
                          variant="outlined"
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip label={`Option ${q.correct_answer}`} size="small" color="success" />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Edit">
                            <IconButton size="small" color="primary" onClick={() => handleOpenDialog(q)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => handleOpenDeleteDialog(q)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                }) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        {searchQuery ? 'No questions match your search.' : 'No questions yet. Add your first question!'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="md">
        <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add New Question'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}

            <TextField
              name="question_text"
              label="Question Text *"
              value={form.question_text}
              onChange={handleFormChange}
              fullWidth
              multiline
              rows={3}
              autoFocus
              placeholder="Enter your question here..."
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField name="option_a" label="Option A *" value={form.option_a} onChange={handleFormChange} fullWidth required />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField name="option_b" label="Option B *" value={form.option_b} onChange={handleFormChange} fullWidth required />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField name="option_c" label="Option C *" value={form.option_c} onChange={handleFormChange} fullWidth required />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField name="option_d" label="Option D *" value={form.option_d} onChange={handleFormChange} fullWidth required />
              </Grid>
            </Grid>

            <FormControl>
              <FormLabel>Correct Answer</FormLabel>
              <RadioGroup row name="correct_answer" value={form.correct_answer} onChange={handleFormChange}>
                {['A', 'B', 'C', 'D'].map(label => (
                  <FormControlLabel key={label} value={label} control={<Radio color="success" />} label={`Option ${label}`} />
                ))}
              </RadioGroup>
            </FormControl>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Difficulty</InputLabel>
                  <Select name="difficulty" value={form.difficulty} label="Difficulty" onChange={handleFormChange}>
                    <MenuItem value="easy">Easy</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="hard">Hard</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Topic (Optional)</InputLabel>
                  <Select name="topic" value={form.topic} label="Topic (Optional)" onChange={handleFormChange}>
                    <MenuItem value="">No Topic</MenuItem>
                    {topics?.map((t: any) => (
                      <MenuItem key={t.id} value={t.id.toString()}>{t.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              name="explanation"
              label="Explanation (Optional)"
              value={form.explanation}
              onChange={handleFormChange}
              fullWidth
              multiline
              rows={2}
              placeholder="Explain why this is the correct answer..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : (editingQuestion ? 'Save Changes' : 'Add Question')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: 'error.main' }}>Delete Question</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to permanently delete this question? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error" disabled={isDeleting}>
            {isDeleting ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}