'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import {
  Box, Typography, Button, CircularProgress, Alert, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack,
  Chip, IconButton, Tooltip, InputAdornment, FormControl, InputLabel, Select, MenuItem,
  RadioGroup, Radio, FormControlLabel, Switch, Tabs, Tab, Checkbox, ListItemText, Divider
} from '@mui/material';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import ReplayIcon from '@mui/icons-material/Replay';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';
import { InstitutePageHeader, greenCtaSx, asList } from '@/components/institute/pageChrome';

const initialTestForm = {
  title: '',
  description: '',
  batch: '',
  duration_minutes: 60,
  time_limit_per_question: 0,
  can_repeat: false,
  start_time: '',
  end_time: '',
  is_active: true,
};

const initialQuestionForm = {
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

export default function InstituteMockTestsPage() {
  const { fetcher } = useAppContext();

  const { data: testsRaw, error, isLoading, mutate } = useSWR('/institute/mock-tests/', fetcher);
  const { data: batchesRaw } = useSWR('/institute/batches/', fetcher);
  const { data: questionsRaw } = useSWR('/institute/questions/', fetcher);
  const { data: topicsRaw } = useSWR('/institute/topics/', fetcher);

  const tests = asList(testsRaw);
  const batches = asList(batchesRaw);
  const bankQuestions = asList(questionsRaw);
  const topics = asList(topicsRaw);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<any>(null);
  const [testForm, setTestForm] = useState(initialTestForm);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Manage Questions Modal state
  const [questionsModalOpen, setQuestionsModalOpen] = useState(false);
  const [activeTest, setActiveTest] = useState<any>(null);
  const [activeTestDetail, setActiveTestDetail] = useState<any>(null);
  const [questionsTab, setQuestionsTab] = useState(0);
  const [newQuestionForm, setNewQuestionForm] = useState(initialQuestionForm);
  const [selectedBankIds, setSelectedBankIds] = useState<number[]>([]);
  const [questionSearch, setQuestionSearch] = useState('');
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);
  const [questionError, setQuestionError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');

  const filteredTests = useMemo(() => {
    if (!tests) return [];
    if (!searchQuery.trim()) return tests;
    return tests.filter((t: any) =>
      (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tests, searchQuery]);

  // Open Create / Edit Dialog
  const handleOpenDialog = (test?: any) => {
    if (test) {
      setEditingTest(test);
      setTestForm({
        title: test.title || '',
        description: test.description || '',
        batch: test.batch ? test.batch.toString() : '',
        duration_minutes: test.duration_minutes ?? 60,
        time_limit_per_question: test.time_limit_per_question ?? 0,
        can_repeat: Boolean(test.can_repeat),
        start_time: test.start_time ? test.start_time.substring(0, 16) : '',
        end_time: test.end_time ? test.end_time.substring(0, 16) : '',
        is_active: test.is_active ?? true,
      });
    } else {
      setEditingTest(null);
      setTestForm(initialTestForm);
    }
    setFormError('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTest(null);
    setTestForm(initialTestForm);
    setFormError('');
  };

  const handleFormChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setTestForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmitTest = async () => {
    if (!testForm.title.trim()) {
      setFormError('Test title is required.');
      return;
    }
    if (testForm.start_time && testForm.end_time) {
      if (new Date(testForm.start_time) >= new Date(testForm.end_time)) {
        setFormError('End time must be after the start time.');
        return;
      }
    }
    setIsSubmitting(true);
    setFormError('');
    try {
      const payload: any = {
        title: testForm.title.trim(),
        description: testForm.description.trim(),
        batch: testForm.batch ? Number(testForm.batch) : null,
        duration_minutes: Number(testForm.duration_minutes) || 60,
        time_limit_per_question: Number(testForm.time_limit_per_question) || 0,
        can_repeat: testForm.can_repeat,
        is_active: testForm.is_active,
        start_time: testForm.start_time ? new Date(testForm.start_time).toISOString() : null,
        end_time: testForm.end_time ? new Date(testForm.end_time).toISOString() : null,
      };

      if (editingTest) {
        await apiClient.patch(`/institute/mock-tests/${editingTest.id}/`, payload);
      } else {
        await apiClient.post('/institute/mock-tests/', payload);
      }
      mutate();
      handleCloseDialog();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to save mock test.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete test
  const handleOpenDelete = (test: any) => {
    setTestToDelete(test);
    setDeleteDialogOpen(true);
  };

  const handleDeleteTest = async () => {
    if (!testToDelete) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/institute/mock-tests/${testToDelete.id}/`);
      mutate();
      setDeleteDialogOpen(false);
      setTestToDelete(null);
    } catch {
      alert('Failed to delete mock test.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Manage Questions Modal
  const handleOpenQuestionsModal = async (test: any) => {
    setActiveTest(test);
    setQuestionsModalOpen(true);
    setQuestionsTab(0);
    setQuestionError('');
    setSelectedBankIds([]);
    try {
      const res = await apiClient.get(`/institute/mock-tests/${test.id}/`);
      setActiveTestDetail(res.data);
    } catch {
      setActiveTestDetail(null);
    }
  };

  const handleCloseQuestionsModal = () => {
    setQuestionsModalOpen(false);
    setActiveTest(null);
    setActiveTestDetail(null);
    setNewQuestionForm(initialQuestionForm);
    mutate();
  };

  const handleCreateQuestionForTest = async () => {
    if (!newQuestionForm.question_text || !newQuestionForm.option_a || !newQuestionForm.option_b || !newQuestionForm.option_c || !newQuestionForm.option_d) {
      setQuestionError('Question text and all 4 options are required.');
      return;
    }
    if (!newQuestionForm.topic) {
      setQuestionError('Please select a topic.');
      return;
    }
    setIsSavingQuestion(true);
    setQuestionError('');
    try {
      const payload = {
        ...newQuestionForm,
        topic: Number(newQuestionForm.topic),
      };
      await apiClient.post(`/institute/mock-tests/${activeTest.id}/add-question/`, payload);
      // Reload active test detail
      const res = await apiClient.get(`/institute/mock-tests/${activeTest.id}/`);
      setActiveTestDetail(res.data);
      setNewQuestionForm(initialQuestionForm);
      setQuestionsTab(0);
      mutate();
    } catch (err: any) {
      setQuestionError(err.response?.data?.detail || 'Failed to add question to test.');
    } finally {
      setIsSavingQuestion(false);
    }
  };

  const handleAttachBankQuestions = async () => {
    if (!selectedBankIds.length) {
      setQuestionError('Please select at least one question from the bank.');
      return;
    }
    setIsSavingQuestion(true);
    setQuestionError('');
    try {
      await apiClient.post(`/institute/mock-tests/${activeTest.id}/manage-questions/`, {
        action: 'attach',
        question_ids: selectedBankIds,
      });
      const res = await apiClient.get(`/institute/mock-tests/${activeTest.id}/`);
      setActiveTestDetail(res.data);
      setSelectedBankIds([]);
      setQuestionsTab(0);
      mutate();
    } catch (err: any) {
      setQuestionError(err.response?.data?.detail || 'Failed to attach questions.');
    } finally {
      setIsSavingQuestion(false);
    }
  };

  const handleRemoveQuestionFromTest = async (questionId: number) => {
    try {
      await apiClient.post(`/institute/mock-tests/${activeTest.id}/manage-questions/`, {
        action: 'remove',
        question_id: questionId,
      });
      const res = await apiClient.get(`/institute/mock-tests/${activeTest.id}/`);
      setActiveTestDetail(res.data);
      mutate();
    } catch {
      alert('Failed to remove question.');
    }
  };

  const formatSchedule = (start?: string, end?: string) => {
    if (!start && !end) return 'Always Active';
    const sDate = start ? new Date(start) : null;
    const eDate = end ? new Date(end) : null;
    const timeOptions: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };

    if (sDate && eDate) {
      const sameDay = sDate.toDateString() === eDate.toDateString();
      if (sameDay) {
        return `${sDate.toLocaleDateString(undefined, dateOptions)}, ${sDate.toLocaleTimeString(undefined, timeOptions)} – ${eDate.toLocaleTimeString(undefined, timeOptions)}`;
      }
      return `${sDate.toLocaleDateString(undefined, dateOptions)} ${sDate.toLocaleTimeString(undefined, timeOptions)} – ${eDate.toLocaleDateString(undefined, dateOptions)} ${eDate.toLocaleTimeString(undefined, timeOptions)}`;
    }
    if (sDate) return `Starts: ${sDate.toLocaleDateString(undefined, dateOptions)} ${sDate.toLocaleTimeString(undefined, timeOptions)}`;
    if (eDate) return `Ends: ${eDate.toLocaleDateString(undefined, dateOptions)} ${eDate.toLocaleTimeString(undefined, timeOptions)}`;
    return 'Always Active';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <InstitutePageHeader
        title="Mock Tests & Scheduled Exams"
        subtitle="Create timed tests, schedule live attendance windows, customize question counts and manage retakes."
        action={
          <Button variant="contained" onClick={() => handleOpenDialog()} startIcon={<AddIcon />} sx={greenCtaSx}>
            Create Mock Test
          </Button>
        }
      />

      <Paper sx={{ p: 2, mb: 4, borderRadius: 4, bgcolor: 'background.paper' }}>
        <TextField
          fullWidth
          placeholder="Search mock tests by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {isLoading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 5 }} />}
      {error && <Alert severity="error">Failed to load mock tests.</Alert>}

      {!isLoading && !error && (
        <Paper sx={{ borderRadius: 4, bgcolor: 'background.paper', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Test Title</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Target Batch</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Schedule Window</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Timer / Duration</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Questions</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Retakes</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTests.length > 0 ? (
                  filteredTests.map((test: any) => {
                    const status = test.status || 'live';
                    return (
                      <TableRow key={test.id} hover>
                        <TableCell>
                          <Typography variant="body1" sx={{ fontWeight: 800 }}>
                            {test.title}
                          </Typography>
                          {test.description && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {test.description}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={test.batch_name || 'All Enrolled Students'}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <EventAvailableIcon sx={{ fontSize: 16, color: '#1B6B3A' }} />
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {formatSchedule(test.start_time, test.end_time)}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                            <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {test.time_limit_per_question > 0
                                ? `${test.time_limit_per_question}s / Q`
                                : `${test.duration_minutes} mins`}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={`${test.question_count ?? 0} Qs`}
                            size="small"
                            color={(test.question_count ?? 0) > 0 ? 'success' : 'default'}
                            variant="outlined"
                            sx={{ fontWeight: 800 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            icon={test.can_repeat ? <ReplayIcon sx={{ fontSize: 14 }} /> : undefined}
                            label={test.can_repeat ? 'Allowed' : 'Single Attempt'}
                            size="small"
                            color={test.can_repeat ? 'info' : 'default'}
                            variant="outlined"
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={
                              status === 'live'
                                ? 'Live Now'
                                : status === 'upcoming'
                                ? 'Upcoming'
                                : status === 'closed'
                                ? 'Closed'
                                : 'Inactive'
                            }
                            size="small"
                            color={
                              status === 'live'
                                ? 'success'
                                : status === 'upcoming'
                                ? 'warning'
                                : 'default'
                            }
                            sx={{ fontWeight: 800 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<FormatListNumberedIcon />}
                              onClick={() => handleOpenQuestionsModal(test)}
                              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                            >
                              Questions ({test.question_count ?? 0})
                            </Button>
                            <Tooltip title="Edit Test Settings">
                              <IconButton color="primary" onClick={() => handleOpenDialog(test)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Mock Test">
                              <IconButton color="error" onClick={() => handleOpenDelete(test)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                      <Typography variant="body1" color="text.secondary">
                        {searchQuery ? 'No mock tests match your search.' : 'No mock tests have been created yet.'}
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={() => handleOpenDialog()}
                        startIcon={<AddIcon />}
                        sx={{ ...greenCtaSx, mt: 2 }}
                      >
                        Create Your First Mock Test
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Create / Edit Mock Test Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingTest ? 'Edit Mock Test Settings' : 'Create New Mock Test'}
        </DialogTitle>
        <DialogContent dividers>
          {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="Test Title"
              name="title"
              value={testForm.title}
              onChange={handleFormChange}
              fullWidth
              required
              placeholder="e.g. RankUp Special PSC Mock Exam 1"
            />
            <TextField
              label="Description / Syllabus Covered"
              name="description"
              value={testForm.description}
              onChange={handleFormChange}
              fullWidth
              multiline
              rows={2}
              placeholder="Instructions, syllabus topics, or negative marking details..."
            />

            <FormControl fullWidth>
              <InputLabel>Target Batch</InputLabel>
              <Select
                name="batch"
                value={testForm.batch}
                label="Target Batch"
                onChange={handleFormChange}
              >
                <MenuItem value="">All Enrolled Students (No batch restriction)</MenuItem>
                {batches.map((b: any) => (
                  <MenuItem key={b.id} value={b.id.toString()}>
                    {b.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Divider>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                Duration & Time Limits
              </Typography>
            </Divider>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Total Test Duration (Minutes)"
                name="duration_minutes"
                type="number"
                value={testForm.duration_minutes}
                onChange={handleFormChange}
                fullWidth
                helperText="Whole test timer (e.g. 60 or 75 minutes)"
              />
              <TextField
                label="Per-Question Timer (Seconds)"
                name="time_limit_per_question"
                type="number"
                value={testForm.time_limit_per_question}
                onChange={handleFormChange}
                fullWidth
                helperText="Optional (e.g. 45s per Q). Set 0 to use total test timer."
              />
            </Stack>

            <Divider>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                Schedule Window (When Students Can Attend)
              </Typography>
            </Divider>

            <Typography variant="caption" color="text.secondary">
              Students will only be allowed to start and attend the test between these scheduled times (e.g. 5:00 PM to 6:00 PM). Leave blank for always active.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Start Time (Live from)"
                name="start_time"
                type="datetime-local"
                value={testForm.start_time}
                onChange={handleFormChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Time (Closes at)"
                name="end_time"
                type="datetime-local"
                value={testForm.end_time}
                onChange={handleFormChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            <Divider>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                Attempt Rules & Controls
              </Typography>
            </Divider>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={testForm.can_repeat}
                    onChange={handleFormChange}
                    name="can_repeat"
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Allow Students to Repeat / Retake Test
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Default is <strong>OFF (Single Attempt Only)</strong>. If off, students can only submit once.
                    </Typography>
                  </Box>
                }
              />
            </Paper>

            <FormControlLabel
              control={
                <Switch
                  checked={testForm.is_active}
                  onChange={handleFormChange}
                  name="is_active"
                  color="success"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Test is Active (Visible to students)
                </Typography>
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitTest}
            disabled={isSubmitting}
            sx={greenCtaSx}
          >
            {isSubmitting ? <CircularProgress size={20} /> : editingTest ? 'Update Test' : 'Create Test'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{ fontWeight: 800 }}>Delete Mock Test?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete <strong>{testToDelete?.title}</strong>? All student test attempts for this test will also be deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteTest} disabled={isDeleting}>
            {isDeleting ? <CircularProgress size={20} /> : 'Delete Test'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manage Questions for Mock Test Modal */}
      <Dialog
        open={questionsModalOpen}
        onClose={handleCloseQuestionsModal}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Manage Questions: {activeTest?.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {activeTestDetail?.questions_list?.length ?? 0} questions assigned to this mock test
              </Typography>
            </Box>
            <Chip
              label={`${activeTestDetail?.questions_list?.length ?? 0} Questions`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 800 }}
            />
          </Stack>
        </DialogTitle>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tabs value={questionsTab} onChange={(_, val) => setQuestionsTab(val)}>
            <Tab label={`Questions in Test (${activeTestDetail?.questions_list?.length ?? 0})`} />
            <Tab label="Add New Question Directly" />
            <Tab label="Pick from Question Bank" />
          </Tabs>
        </Box>

        <DialogContent dividers sx={{ minHeight: 400 }}>
          {questionError && <Alert severity="error" sx={{ mb: 2 }}>{questionError}</Alert>}

          {/* TAB 0: Current Questions in Test */}
          {questionsTab === 0 && (
            <Box>
              {activeTestDetail?.questions_list?.length > 0 ? (
                <Stack spacing={2}>
                  {activeTestDetail.questions_list.map((q: any, idx: number) => (
                    <Paper key={q.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box sx={{ flex: 1, pr: 2 }}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                            <Chip label={`Q${idx + 1}`} size="small" color="primary" sx={{ fontWeight: 800 }} />
                            {q.topic_name && <Chip label={q.topic_name} size="small" variant="outlined" />}
                            <Chip label={q.difficulty || 'medium'} size="small" variant="outlined" />
                          </Stack>
                          <Typography variant="body1" sx={{ fontWeight: 700, mb: 1.5 }}>
                            {q.question_text}
                          </Typography>
                          <Stack spacing={0.5} sx={{ pl: 1 }}>
                            {['A', 'B', 'C', 'D'].map((letter) => {
                              const optVal = q[`option_${letter.toLowerCase()}`];
                              const isCorrect = q.correct_answer === letter;
                              return (
                                <Typography
                                  key={letter}
                                  variant="body2"
                                  sx={{
                                    color: isCorrect ? 'success.main' : 'text.primary',
                                    fontWeight: isCorrect ? 800 : 400,
                                  }}
                                >
                                  <strong>{letter}.</strong> {optVal} {isCorrect && '✓ (Correct)'}
                                </Typography>
                              );
                            })}
                          </Stack>
                          {q.explanation && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
                              💡 Explanation: {q.explanation}
                            </Typography>
                          )}
                        </Box>
                        <Tooltip title="Remove from this Mock Test">
                          <IconButton color="error" size="small" onClick={() => handleRemoveQuestionFromTest(q.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    No questions have been added to this mock test yet.
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => setQuestionsTab(1)}
                    sx={{ mt: 2, borderRadius: '8px' }}
                  >
                    Add Question Now
                  </Button>
                </Box>
              )}
            </Box>
          )}

          {/* TAB 1: Add New Question */}
          {questionsTab === 1 && (
            <Stack spacing={2.5}>
              <Typography variant="subtitle2" color="text.secondary">
                Create a question specifically for this mock test. It will also be saved to your academy question bank.
              </Typography>

              <TextField
                label="Question Text"
                multiline
                rows={3}
                fullWidth
                required
                value={newQuestionForm.question_text}
                onChange={(e) => setNewQuestionForm({ ...newQuestionForm, question_text: e.target.value })}
                placeholder="Type question here..."
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Option A"
                  fullWidth
                  required
                  value={newQuestionForm.option_a}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, option_a: e.target.value })}
                />
                <TextField
                  label="Option B"
                  fullWidth
                  required
                  value={newQuestionForm.option_b}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, option_b: e.target.value })}
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Option C"
                  fullWidth
                  required
                  value={newQuestionForm.option_c}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, option_c: e.target.value })}
                />
                <TextField
                  label="Option D"
                  fullWidth
                  required
                  value={newQuestionForm.option_d}
                  onChange={(e) => setNewQuestionForm({ ...newQuestionForm, option_d: e.target.value })}
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                    Correct Answer
                  </Typography>
                  <RadioGroup
                    row
                    value={newQuestionForm.correct_answer}
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, correct_answer: e.target.value })}
                  >
                    <FormControlLabel value="A" control={<Radio />} label="Option A" />
                    <FormControlLabel value="B" control={<Radio />} label="Option B" />
                    <FormControlLabel value="C" control={<Radio />} label="Option C" />
                    <FormControlLabel value="D" control={<Radio />} label="Option D" />
                  </RadioGroup>
                </Box>

                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Topic</InputLabel>
                  <Select
                    value={newQuestionForm.topic}
                    label="Topic"
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, topic: e.target.value })}
                  >
                    {topics.map((t: any) => (
                      <MenuItem key={t.id} value={t.id.toString()}>
                        {t.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 150 }}>
                  <InputLabel>Difficulty</InputLabel>
                  <Select
                    value={newQuestionForm.difficulty}
                    label="Difficulty"
                    onChange={(e) => setNewQuestionForm({ ...newQuestionForm, difficulty: e.target.value })}
                  >
                    <MenuItem value="easy">Easy</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="hard">Hard</MenuItem>
                  </Select>
                </FormControl>
              </Stack>

              <TextField
                label="Explanation / Description (Optional)"
                multiline
                rows={2}
                fullWidth
                value={newQuestionForm.explanation}
                onChange={(e) => setNewQuestionForm({ ...newQuestionForm, explanation: e.target.value })}
                placeholder="Explain why this answer is correct..."
              />

              <Button
                variant="contained"
                onClick={handleCreateQuestionForTest}
                disabled={isSavingQuestion}
                sx={{ ...greenCtaSx, alignSelf: 'flex-start', mt: 1 }}
              >
                {isSavingQuestion ? <CircularProgress size={20} /> : 'Save & Add to Mock Test'}
              </Button>
            </Stack>
          )}

          {/* TAB 2: Pick from Question Bank */}
          {questionsTab === 2 && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                Select questions from your existing academy question bank to add to this mock test:
              </Typography>

              <TextField
                fullWidth
                size="small"
                placeholder="Search questions in bank..."
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              <Stack spacing={1} sx={{ maxHeight: 350, overflowY: 'auto' }}>
                {bankQuestions
                  .filter((bq: any) => {
                    const text = (bq.question_text || bq.text || '').toLowerCase();
                    return text.includes(questionSearch.toLowerCase());
                  })
                  .map((bq: any) => {
                    const alreadyInTest = activeTestDetail?.questions_list?.some((q: any) => q.id === bq.id);
                    const isChecked = selectedBankIds.includes(bq.id);
                    return (
                      <Paper
                        key={bq.id}
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: alreadyInTest ? 'action.hover' : isChecked ? 'rgba(27, 107, 58, 0.08)' : 'background.paper',
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                          <Checkbox
                            checked={alreadyInTest || isChecked}
                            disabled={alreadyInTest}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBankIds([...selectedBankIds, bq.id]);
                              } else {
                                setSelectedBankIds(selectedBankIds.filter((id) => id !== bq.id));
                              }
                            }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {bq.question_text || bq.text}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Correct: {bq.correct_answer} • {bq.topic_name || 'General'}
                            </Typography>
                          </Box>
                          {alreadyInTest && (
                            <Chip label="Already in Test" size="small" variant="outlined" />
                          )}
                        </Stack>
                      </Paper>
                    );
                  })}
              </Stack>

              <Button
                variant="contained"
                onClick={handleAttachBankQuestions}
                disabled={isSavingQuestion || !selectedBankIds.length}
                sx={{ ...greenCtaSx, mt: 3 }}
              >
                {isSavingQuestion ? <CircularProgress size={20} /> : `Add Selected (${selectedBankIds.length}) to Test`}
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseQuestionsModal} variant="contained" sx={greenCtaSx}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}
