'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import {
  Box, Typography, Button, CircularProgress, Alert, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack,
  Chip, IconButton, Tooltip, InputAdornment, FormControl, InputLabel, Select, MenuItem, Menu,
  RadioGroup, Radio, FormControlLabel, Switch, Tabs, Tab, Checkbox, ListItemText, Divider
} from '@mui/material';
import * as XLSX from 'xlsx';
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
import CancelIcon from '@mui/icons-material/Cancel';
import AssessmentIcon from '@mui/icons-material/Assessment';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import FilterListIcon from '@mui/icons-material/FilterList';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import TableChartIcon from '@mui/icons-material/TableChart';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';
import { apiErrorMessage } from '@/lib/auth';
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
  const [questionSuccessMsg, setQuestionSuccessMsg] = useState('');
  const [questionSubmitted, setQuestionSubmitted] = useState(false);

  // Submissions & Leaderboard modal state
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [activeTestSubmissions, setActiveTestSubmissions] = useState<any>(null);
  const [activeStudentAnswerSheet, setActiveStudentAnswerSheet] = useState<any>(null);
  const [studentAnswerSheetOpen, setStudentAnswerSheetOpen] = useState(false);

  // Leaderboard modal filtering and sorting state
  const [lbSearch, setLbSearch] = useState('');
  const [lbRankPreset, setLbRankPreset] = useState<'all' | 'top3' | 'top10' | 'top25' | 'custom'>('all');
  const [lbMinRank, setLbMinRank] = useState('');
  const [lbMaxRank, setLbMaxRank] = useState('');
  const [lbMinScore, setLbMinScore] = useState('');
  const [lbMaxScore, setLbMaxScore] = useState('');
  const [lbSortBy, setLbSortBy] = useState('rank_asc');

  const filteredAndSortedSubmissions = useMemo(() => {
    const list = activeTestSubmissions?.submissions || [];
    if (!list.length) return [];

    let result = [...list];

    // Search query filter (name, username, email, phone_number)
    if (lbSearch.trim()) {
      const q = lbSearch.toLowerCase();
      result = result.filter((s: any) =>
        (s.student_name || '').toLowerCase().includes(q) ||
        (s.username || '').toLowerCase().includes(q) ||
        (s.email || '').toLowerCase().includes(q) ||
        (s.phone_number || '').toLowerCase().includes(q)
      );
    }

    // Rank Filter: Presets or Custom
    if (lbRankPreset === 'top3') {
      result = result.filter((s: any) => s.rank <= 3);
    } else if (lbRankPreset === 'top10') {
      result = result.filter((s: any) => s.rank <= 10);
    } else if (lbRankPreset === 'top25') {
      result = result.filter((s: any) => s.rank <= 25);
    } else if (lbRankPreset === 'custom') {
      if (lbMinRank.trim() !== '') {
        const minR = Number(lbMinRank);
        if (!isNaN(minR)) result = result.filter((s: any) => s.rank >= minR);
      }
      if (lbMaxRank.trim() !== '') {
        const maxR = Number(lbMaxRank);
        if (!isNaN(maxR)) result = result.filter((s: any) => s.rank <= maxR);
      }
    }

    // Marks / Score between filter
    if (lbMinScore.trim() !== '') {
      const minS = Number(lbMinScore);
      if (!isNaN(minS)) result = result.filter((s: any) => Number(s.score) >= minS);
    }
    if (lbMaxScore.trim() !== '') {
      const maxS = Number(lbMaxScore);
      if (!isNaN(maxS)) result = result.filter((s: any) => Number(s.score) <= maxS);
    }

    // Sorting
    result.sort((a: any, b: any) => {
      switch (lbSortBy) {
        case 'rank_asc':
          return (a.rank ?? 999999) - (b.rank ?? 999999);
        case 'rank_desc':
          return (b.rank ?? 0) - (a.rank ?? 0);
        case 'score_desc':
          return (b.score ?? 0) - (a.score ?? 0);
        case 'score_asc':
          return (a.score ?? 0) - (b.score ?? 0);
        case 'accuracy_desc':
          return (b.accuracy ?? 0) - (a.accuracy ?? 0);
        case 'name_asc':
          return (a.student_name || a.username || '').localeCompare(b.student_name || b.username || '');
        case 'date_desc':
          return new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime();
        case 'date_asc':
          return new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime();
        default:
          return (a.rank ?? 999999) - (b.rank ?? 999999);
      }
    });

    return result;
  }, [activeTestSubmissions, lbSearch, lbRankPreset, lbMinRank, lbMaxRank, lbMinScore, lbMaxScore, lbSortBy]);

  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
  const exportMenuOpen = Boolean(exportAnchorEl);

  const handleOpenExportMenu = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleCloseExportMenu = () => {
    setExportAnchorEl(null);
  };

  const handleExportExcel = () => {
    handleCloseExportMenu();
    if (!filteredAndSortedSubmissions || filteredAndSortedSubmissions.length === 0) return;

    const data = filteredAndSortedSubmissions.map((sub: any) => {
      const formattedDate = sub.completed_at
        ? new Date(sub.completed_at).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })
        : '';

      return {
        'Rank': sub.rank,
        'Student Name': sub.student_name,
        'Username': sub.username,
        'Email': sub.email || '',
        'WhatsApp Number': sub.phone_number ? `+91 ${sub.phone_number}` : '',
        'Net Score (Marks)': sub.score,
        'Total Questions': sub.total_questions,
        'Correct Answers': sub.correct ?? sub.correct_answers ?? 0,
        'Wrong Answers': sub.wrong ?? 0,
        'Unanswered': sub.unanswered ?? 0,
        'Accuracy (%)': `${sub.accuracy}%`,
        'Tab Switches': sub.tab_switches ?? 0,
        'Submitted At': formattedDate,
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);

    // Auto-fit column widths
    worksheet['!cols'] = [
      { wch: 8 },  // Rank
      { wch: 25 }, // Student Name
      { wch: 20 }, // Username
      { wch: 28 }, // Email
      { wch: 18 }, // WhatsApp Number
      { wch: 18 }, // Net Score
      { wch: 15 }, // Total Questions
      { wch: 16 }, // Correct Answers
      { wch: 15 }, // Wrong Answers
      { wch: 14 }, // Unanswered
      { wch: 14 }, // Accuracy
      { wch: 14 }, // Tab Switches
      { wch: 24 }, // Submitted At
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');

    const cleanTestTitle = (activeTest?.title || 'Mock_Test')
      .replace(/[^a-zA-Z0-9_\u0D00-\u0D7F]/g, '_')
      .replace(/__+/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `${cleanTestTitle}_Results_${dateStr}.xlsx`);
  };

  const handleExportCsv = () => {
    handleCloseExportMenu();
    if (!filteredAndSortedSubmissions || filteredAndSortedSubmissions.length === 0) return;

    const headers = [
      'Rank',
      'Student Name',
      'Username',
      'Email',
      'WhatsApp Number',
      'Net Score (Marks)',
      'Total Questions',
      'Correct Answers',
      'Wrong Answers',
      'Unanswered',
      'Accuracy (%)',
      'Tab Switches',
      'Submitted At',
    ];

    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = filteredAndSortedSubmissions.map((sub: any) => {
      const formattedDate = sub.completed_at
        ? new Date(sub.completed_at).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })
        : '';

      return [
        escapeCsv(sub.rank),
        escapeCsv(sub.student_name),
        escapeCsv(sub.username),
        escapeCsv(sub.email || ''),
        escapeCsv(sub.phone_number ? `+91${sub.phone_number}` : ''),
        escapeCsv(sub.score),
        escapeCsv(sub.total_questions),
        escapeCsv(sub.correct ?? sub.correct_answers ?? 0),
        escapeCsv(sub.wrong ?? 0),
        escapeCsv(sub.unanswered ?? 0),
        escapeCsv(`${sub.accuracy}%`),
        escapeCsv(sub.tab_switches ?? 0),
        escapeCsv(formattedDate),
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const cleanTestTitle = (activeTest?.title || 'Mock_Test')
      .replace(/[^a-zA-Z0-9_\u0D00-\u0D7F]/g, '_')
      .replace(/__+/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute('download', `${cleanTestTitle}_Results_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
    setQuestionSuccessMsg('');
    setQuestionSubmitted(false);
    setSelectedBankIds([]);
    setNewQuestionForm({
      ...initialQuestionForm,
      topic: topics.length > 0 ? topics[0].id.toString() : '',
    });
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
    setQuestionError('');
    setQuestionSuccessMsg('');
    setQuestionSubmitted(false);
    mutate();
  };

  const handleCreateQuestionForTest = async () => {
    setQuestionSubmitted(true);
    if (!newQuestionForm.question_text?.trim() || !newQuestionForm.option_a?.trim() || !newQuestionForm.option_b?.trim() || !newQuestionForm.option_c?.trim() || !newQuestionForm.option_d?.trim()) {
      setQuestionError('Question text and all 4 options (A, B, C, D) are required. Please fill in the highlighted fields.');
      return;
    }
    if (!activeTest?.id) {
      setQuestionError('No active mock test selected.');
      return;
    }
    setIsSavingQuestion(true);
    setQuestionError('');
    setQuestionSuccessMsg('');
    try {
      const payload: any = {
        question_text: newQuestionForm.question_text.trim(),
        option_a: newQuestionForm.option_a.trim(),
        option_b: newQuestionForm.option_b.trim(),
        option_c: newQuestionForm.option_c.trim(),
        option_d: newQuestionForm.option_d.trim(),
        correct_answer: newQuestionForm.correct_answer || 'A',
        difficulty: newQuestionForm.difficulty || 'medium',
        explanation: newQuestionForm.explanation?.trim() || '',
      };
      if (newQuestionForm.topic) {
        payload.topic = Number(newQuestionForm.topic);
      }
      const resAdd = await apiClient.post(`/institute/mock-tests/${activeTest.id}/add-question/`, payload);
      // Reload active test detail
      const res = await apiClient.get(`/institute/mock-tests/${activeTest.id}/`);
      setActiveTestDetail(res.data);
      setNewQuestionForm({
        ...initialQuestionForm,
        topic: topics.length > 0 ? topics[0].id.toString() : '',
      });
      setQuestionSubmitted(false);
      setQuestionSuccessMsg(`Question added successfully! Test now has ${resAdd.data?.question_count ?? (res.data?.questions_list?.length || 1)} questions.`);
      setQuestionsTab(0);
      mutate();
    } catch (err: any) {
      setQuestionError(apiErrorMessage(err, 'Failed to add question to test.'));
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
      setQuestionError(apiErrorMessage(err, 'Failed to attach questions.'));
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
    } catch (err: any) {
      alert(apiErrorMessage(err, 'Failed to remove question.'));
    }
  };

  const handleOpenSubmissions = async (test: any) => {
    setActiveTest(test);
    setSubmissionsModalOpen(true);
    setSubmissionsLoading(true);
    setActiveTestSubmissions(null);
    try {
      const res = await apiClient.get(`/institute/mock-tests/${test.id}/submissions/`);
      setActiveTestSubmissions(res.data);
    } catch {
      alert('Failed to load test submissions.');
      setSubmissionsModalOpen(false);
    } finally {
      setSubmissionsLoading(false);
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
                              color="primary"
                              startIcon={<AssessmentIcon />}
                              onClick={() => handleOpenSubmissions(test)}
                              sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px' }}
                            >
                              Results ({test.total_attempts ?? 0})
                            </Button>
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

            <Box sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: 'text.secondary', fontSize: '0.82rem' }}>
                ⚡ Time per Question Presets (Set by Admin):
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                {[
                  { label: 'Off (Total Timer Only)', val: 0 },
                  { label: '15s / Q', val: 15 },
                  { label: '20s / Q', val: 20 },
                  { label: '25s / Q (PSC Standard)', val: 25 },
                  { label: '30s / Q', val: 30 },
                  { label: '45s / Q', val: 45 },
                  { label: '60s / Q', val: 60 },
                  { label: '90s / Q', val: 90 },
                ].map((preset) => {
                  const isSelected = Number(testForm.time_limit_per_question) === preset.val;
                  return (
                    <Chip
                      key={preset.val}
                      label={preset.label}
                      clickable
                      color={isSelected ? 'primary' : 'default'}
                      variant={isSelected ? 'filled' : 'outlined'}
                      onClick={() => {
                        const val = preset.val;
                        setTestForm((prev) => {
                          const updated = { ...prev, time_limit_per_question: val };
                          if (val > 0) {
                            const estMins = Math.max(1, Math.ceil((20 * val) / 60));
                            if (prev.duration_minutes === 60 || prev.duration_minutes === 0) {
                              updated.duration_minutes = estMins;
                            }
                          }
                          return updated;
                        });
                      }}
                      sx={{
                        fontWeight: isSelected ? 800 : 500,
                        fontSize: '0.78rem',
                      }}
                    />
                  );
                })}
              </Stack>
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Per-Question Timer (Seconds)"
                name="time_limit_per_question"
                type="number"
                value={testForm.time_limit_per_question}
                onChange={handleFormChange}
                fullWidth
                helperText="Custom seconds for each question (e.g. 25). Set 0 to disable."
              />
              <TextField
                label="Total Test Duration (Minutes)"
                name="duration_minutes"
                type="number"
                value={testForm.duration_minutes}
                onChange={handleFormChange}
                fullWidth
                helperText="Overall test window (e.g. 9 mins for 20 Qs × 25s, or 60 mins)."
              />
            </Stack>

            {Number(testForm.time_limit_per_question) > 0 && (
              <Alert severity="info" sx={{ py: 0.5, px: 1.5, borderRadius: '10px', fontSize: '0.8rem' }}>
                ⏱️ <strong>{testForm.time_limit_per_question}s per question mode active.</strong> Students get {testForm.time_limit_per_question} seconds per question (e.g. 20 Qs × {testForm.time_limit_per_question}s = {20 * Number(testForm.time_limit_per_question)}s / ~{Math.ceil((20 * Number(testForm.time_limit_per_question)) / 60)} mins total).
              </Alert>
            )}

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
          {questionSuccessMsg && <Alert severity="success" sx={{ mb: 2 }}>{questionSuccessMsg}</Alert>}

          {/* TAB 0: Current Questions in Test */}
          {questionsTab === 0 && (
            <Box>
              {activeTestDetail?.questions_list?.length > 0 ? (
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                      {activeTestDetail.questions_list.length} questions currently in this test:
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          setQuestionsTab(1);
                          setQuestionError('');
                          setQuestionSuccessMsg('');
                        }}
                        sx={greenCtaSx}
                      >
                        Add Question
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          setQuestionsTab(2);
                          setQuestionError('');
                          setQuestionSuccessMsg('');
                        }}
                      >
                        Pick from Bank
                      </Button>
                    </Stack>
                  </Box>

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
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setQuestionsTab(1);
                      setQuestionError('');
                      setQuestionSuccessMsg('');
                    }}
                    sx={{ ...greenCtaSx, mt: 2 }}
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
                label="Question Text *"
                multiline
                rows={3}
                fullWidth
                required
                error={questionSubmitted && !newQuestionForm.question_text.trim()}
                helperText={questionSubmitted && !newQuestionForm.question_text.trim() ? 'Question text is required' : undefined}
                value={newQuestionForm.question_text}
                onChange={(e) => {
                  setNewQuestionForm({ ...newQuestionForm, question_text: e.target.value });
                  if (questionError) setQuestionError('');
                }}
                placeholder="Type question here..."
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Option A *"
                  fullWidth
                  required
                  error={questionSubmitted && !newQuestionForm.option_a.trim()}
                  helperText={questionSubmitted && !newQuestionForm.option_a.trim() ? 'Option A is required' : undefined}
                  value={newQuestionForm.option_a}
                  onChange={(e) => {
                    setNewQuestionForm({ ...newQuestionForm, option_a: e.target.value });
                    if (questionError) setQuestionError('');
                  }}
                />
                <TextField
                  label="Option B *"
                  fullWidth
                  required
                  error={questionSubmitted && !newQuestionForm.option_b.trim()}
                  helperText={questionSubmitted && !newQuestionForm.option_b.trim() ? 'Option B is required' : undefined}
                  value={newQuestionForm.option_b}
                  onChange={(e) => {
                    setNewQuestionForm({ ...newQuestionForm, option_b: e.target.value });
                    if (questionError) setQuestionError('');
                  }}
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Option C *"
                  fullWidth
                  required
                  error={questionSubmitted && !newQuestionForm.option_c.trim()}
                  helperText={questionSubmitted && !newQuestionForm.option_c.trim() ? 'Option C is required' : undefined}
                  value={newQuestionForm.option_c}
                  onChange={(e) => {
                    setNewQuestionForm({ ...newQuestionForm, option_c: e.target.value });
                    if (questionError) setQuestionError('');
                  }}
                />
                <TextField
                  label="Option D *"
                  fullWidth
                  required
                  error={questionSubmitted && !newQuestionForm.option_d.trim()}
                  helperText={questionSubmitted && !newQuestionForm.option_d.trim() ? 'Option D is required' : undefined}
                  value={newQuestionForm.option_d}
                  onChange={(e) => {
                    setNewQuestionForm({ ...newQuestionForm, option_d: e.target.value });
                    if (questionError) setQuestionError('');
                  }}
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
                    <MenuItem value=""><em>Academy Practice (Auto)</em></MenuItem>
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

              {questionError && <Alert severity="error">{questionError}</Alert>}

              <Button
                variant="contained"
                onClick={handleCreateQuestionForTest}
                disabled={isSavingQuestion}
                sx={{ ...greenCtaSx, alignSelf: { xs: 'stretch', sm: 'flex-start' }, mt: 1, py: 1.25, px: 3, fontWeight: 800 }}
              >
                {isSavingQuestion ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Save & Add to Mock Test'}
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
        <DialogActions sx={{ p: 2, px: 3, justifyContent: 'space-between', bgcolor: 'action.hover' }}>
          <Button
            onClick={() => {
              if (questionsTab !== 0) {
                setQuestionsTab(0);
                setQuestionError('');
              } else {
                handleCloseQuestionsModal();
              }
            }}
            color="inherit"
            sx={{ fontWeight: 700 }}
          >
            {questionsTab === 0 ? 'Close' : '← Back to Questions'}
          </Button>

          <Stack direction="row" spacing={1.5} alignItems="center">
            {questionsTab === 1 && (
              <Button
                variant="contained"
                onClick={handleCreateQuestionForTest}
                disabled={isSavingQuestion}
                sx={greenCtaSx}
              >
                {isSavingQuestion ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Save & Add Question'}
              </Button>
            )}

            {questionsTab === 2 && (
              <Button
                variant="contained"
                onClick={handleAttachBankQuestions}
                disabled={isSavingQuestion || !selectedBankIds.length}
                sx={greenCtaSx}
              >
                {isSavingQuestion ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : `Add Selected (${selectedBankIds.length}) to Test`}
              </Button>
            )}

            {questionsTab === 0 && (
              <Button onClick={handleCloseQuestionsModal} variant="contained" sx={greenCtaSx}>
                Done
              </Button>
            )}
          </Stack>
        </DialogActions>
      </Dialog>

      {/* Submissions & Leaderboard Modal */}
      <Dialog
        open={submissionsModalOpen}
        onClose={() => setSubmissionsModalOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontWeight: 900, pb: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                Test Results & Leaderboard — {activeTest?.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Detailed student submissions ranked by Net Score and Accuracy
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<FileDownloadIcon />}
                endIcon={<KeyboardArrowDownIcon />}
                onClick={handleOpenExportMenu}
                disabled={!filteredAndSortedSubmissions || filteredAndSortedSubmissions.length === 0}
                sx={{
                  textTransform: 'none',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  borderRadius: '9px',
                  px: 1.5,
                  py: 0.6,
                }}
              >
                Export ({filteredAndSortedSubmissions.length})
              </Button>
              <Chip
                label={`${activeTestSubmissions?.test?.total_submissions ?? activeTestSubmissions?.total_submissions ?? activeTestSubmissions?.submissions?.length ?? 0} Submissions`}
                color="primary"
                sx={{ fontWeight: 800 }}
              />
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 1.5, sm: 3 } }}>
          {submissionsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
              <CircularProgress />
            </Box>
          ) : !activeTestSubmissions?.submissions || activeTestSubmissions.submissions.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: '12px' }}>
              No students have completed this mock test yet. As soon as enrolled students submit, their live scores and answer sheets will appear here.
            </Alert>
          ) : (
            <>
              {/* Filter & Sort Controls */}
              <Paper
                elevation={0}
                variant="outlined"
                sx={{
                  mb: 2.5,
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: '16px',
                  bgcolor: 'action.hover',
                }}
              >
                <Stack spacing={1.75}>
                  {/* Top Bar: Search + Quick Rank Presets + Sort Dropdown */}
                  <Stack
                    direction={{ xs: 'column', lg: 'row' }}
                    spacing={1.5}
                    alignItems={{ xs: 'stretch', lg: 'center' }}
                    justifyContent="space-between"
                  >
                    <TextField
                      size="small"
                      placeholder="Search student by name, username, email..."
                      value={lbSearch}
                      onChange={(e) => setLbSearch(e.target.value)}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                            </InputAdornment>
                          ),
                          sx: { borderRadius: '10px', bgcolor: 'background.paper', fontSize: '0.85rem' },
                        },
                      }}
                      sx={{ minWidth: { md: 280 } }}
                    />

                    {/* Quick Rank Chips */}
                    <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', mr: 0.5 }}>
                        Rank:
                      </Typography>
                      {[
                        { id: 'all', label: 'All Ranks' },
                        { id: 'top3', label: 'Top 3 🏆' },
                        { id: 'top10', label: 'Top 10' },
                        { id: 'top25', label: 'Top 25' },
                        { id: 'custom', label: 'Custom Range' },
                      ].map((chip) => (
                        <Chip
                          key={chip.id}
                          label={chip.label}
                          size="small"
                          clickable
                          color={lbRankPreset === chip.id ? 'primary' : 'default'}
                          variant={lbRankPreset === chip.id ? 'filled' : 'outlined'}
                          onClick={() => setLbRankPreset(chip.id as any)}
                          sx={{ fontWeight: 800, fontSize: '0.72rem', height: 26 }}
                        />
                      ))}
                    </Stack>

                    {/* Sort Dropdown */}
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                      <InputLabel sx={{ fontSize: '0.85rem' }}>Sort By</InputLabel>
                      <Select
                        value={lbSortBy}
                        label="Sort By"
                        onChange={(e) => setLbSortBy(e.target.value)}
                        sx={{ borderRadius: '10px', bgcolor: 'background.paper', fontSize: '0.85rem' }}
                      >
                        <MenuItem value="rank_asc">Rank (1st to Last)</MenuItem>
                        <MenuItem value="rank_desc">Rank (Last to 1st)</MenuItem>
                        <MenuItem value="score_desc">Score (Highest First)</MenuItem>
                        <MenuItem value="score_asc">Score (Lowest First)</MenuItem>
                        <MenuItem value="accuracy_desc">Accuracy (High to Low)</MenuItem>
                        <MenuItem value="date_desc">Submitted (Newest First)</MenuItem>
                        <MenuItem value="date_asc">Submitted (Oldest First)</MenuItem>
                        <MenuItem value="name_asc">Student Name (A–Z)</MenuItem>
                      </Select>
                    </FormControl>
                  </Stack>

                  {/* Bottom Bar: Range Filters (Rank Between & Marks Between) + Active Count & Reset */}
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                    alignItems={{ xs: 'flex-start', md: 'center' }}
                    justifyContent="space-between"
                  >
                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
                      {lbRankPreset === 'custom' && (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                            Rank Between:
                          </Typography>
                          <TextField
                            size="small"
                            placeholder="Min"
                            type="number"
                            value={lbMinRank}
                            onChange={(e) => setLbMinRank(e.target.value)}
                            sx={{ width: 80, '& input': { py: 0.5, fontSize: '0.82rem' }, bgcolor: 'background.paper', borderRadius: '8px' }}
                          />
                          <Typography variant="caption" color="text.secondary">to</Typography>
                          <TextField
                            size="small"
                            placeholder="Max"
                            type="number"
                            value={lbMaxRank}
                            onChange={(e) => setLbMaxRank(e.target.value)}
                            sx={{ width: 80, '& input': { py: 0.5, fontSize: '0.82rem' }, bgcolor: 'background.paper', borderRadius: '8px' }}
                          />
                        </Stack>
                      )}

                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                          Marks Between:
                        </Typography>
                        <TextField
                          size="small"
                          placeholder="Min Score"
                          type="number"
                          value={lbMinScore}
                          onChange={(e) => setLbMinScore(e.target.value)}
                          sx={{ width: 95, '& input': { py: 0.5, fontSize: '0.82rem' }, bgcolor: 'background.paper', borderRadius: '8px' }}
                        />
                        <Typography variant="caption" color="text.secondary">to</Typography>
                        <TextField
                          size="small"
                          placeholder="Max Score"
                          type="number"
                          value={lbMaxScore}
                          onChange={(e) => setLbMaxScore(e.target.value)}
                          sx={{ width: 95, '& input': { py: 0.5, fontSize: '0.82rem' }, bgcolor: 'background.paper', borderRadius: '8px' }}
                        />
                      </Stack>
                    </Stack>

                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: { xs: '100%', md: 'auto' }, justifyContent: 'space-between' }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                        Showing {filteredAndSortedSubmissions.length} of {activeTestSubmissions.submissions.length} students
                      </Typography>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          startIcon={<FileDownloadIcon sx={{ fontSize: '16px !important' }} />}
                          endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '14px !important' }} />}
                          onClick={handleOpenExportMenu}
                          disabled={!filteredAndSortedSubmissions || filteredAndSortedSubmissions.length === 0}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                            borderRadius: '8px',
                            px: 1.25,
                            py: 0.4,
                          }}
                        >
                          Export ({filteredAndSortedSubmissions.length})
                        </Button>

                        {(lbSearch || lbRankPreset !== 'all' || lbMinRank || lbMaxRank || lbMinScore || lbMaxScore || lbSortBy !== 'rank_asc') && (
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => {
                              setLbSearch('');
                              setLbRankPreset('all');
                              setLbMinRank('');
                              setLbMaxRank('');
                              setLbMinScore('');
                              setLbMaxScore('');
                              setLbSortBy('rank_asc');
                            }}
                            sx={{ textTransform: 'none', fontWeight: 800, fontSize: '0.78rem', color: 'error.main', p: 0 }}
                          >
                            Clear Filters
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  </Stack>
                </Stack>
              </Paper>

              {filteredAndSortedSubmissions.length === 0 ? (
                <Alert severity="warning" sx={{ borderRadius: '12px' }}>
                  No student submissions match your current rank, score, or search filters.
                </Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '14px', overflow: 'hidden' }}>
                  <Table>
                    <TableHead sx={{ bgcolor: 'action.hover' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 800, width: 80 }}>Rank</TableCell>
                        <TableCell sx={{ fontWeight: 800 }}>Student</TableCell>
                        <TableCell sx={{ fontWeight: 800 }} align="center">Score (Net)</TableCell>
                        <TableCell sx={{ fontWeight: 800 }} align="center">Correct / Total</TableCell>
                        <TableCell sx={{ fontWeight: 800 }} align="center">Accuracy</TableCell>
                        <TableCell sx={{ fontWeight: 800 }} align="center">Submitted At</TableCell>
                        <TableCell sx={{ fontWeight: 800 }} align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredAndSortedSubmissions.map((sub: any) => {
                        const whatsappMsg = `Hello ${sub.student_name}! Regarding your result in "${activeTest?.title}":\nYour Score: ${sub.score} pts (Rank #${sub.rank}, Accuracy: ${sub.accuracy}%).\nGreat job from your academy admin!`;
                        const whatsappUrl = sub.phone_number
                          ? `https://wa.me/91${sub.phone_number}?text=${encodeURIComponent(whatsappMsg)}`
                          : null;

                        return (
                          <TableRow key={sub.id} hover>
                            <TableCell>
                              <Chip
                                label={`#${sub.rank}`}
                                size="small"
                                sx={{
                                  fontWeight: 900,
                                  bgcolor: sub.rank === 1 ? '#F59E0B' : sub.rank === 2 ? '#94A3B8' : sub.rank === 3 ? '#B45309' : 'action.selected',
                                  color: sub.rank <= 3 ? '#fff' : 'inherit',
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                {sub.student_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                @{sub.username} {sub.email ? `• ${sub.email}` : ''}
                              </Typography>
                              {sub.phone_number && (
                                <Typography variant="caption" sx={{ display: 'block', color: '#16a34a', fontWeight: 800, mt: 0.25 }}>
                                  📱 +91 {sub.phone_number}
                                </Typography>
                              )}
                              {Number(sub.tab_switches) > 0 && (
                                <Typography variant="caption" sx={{ display: 'block', color: '#EF4444', fontWeight: 800, mt: 0.25 }}>
                                  ⚠️ {sub.tab_switches} Tab {sub.tab_switches === 1 ? 'Switch' : 'Switches'}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={`${sub.score > 0 ? `+${sub.score}` : sub.score} pts`}
                                size="small"
                                color={sub.score > 0 ? 'success' : 'default'}
                                sx={{ fontWeight: 800 }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                {sub.correct ?? sub.correct_answers ?? 0} / {sub.total_questions}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={`${sub.accuracy}%`}
                                size="small"
                                variant="outlined"
                                color={sub.accuracy >= 70 ? 'success' : sub.accuracy >= 40 ? 'warning' : 'error'}
                                sx={{ fontWeight: 800 }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="caption" color="text.secondary">
                                {sub.completed_at ? new Date(sub.completed_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                                {whatsappUrl ? (
                                  <Tooltip title={`Chat with ${sub.student_name} on WhatsApp (+91 ${sub.phone_number})`}>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      component="a"
                                      href={whatsappUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      startIcon={<WhatsAppIcon sx={{ fontSize: '15px !important' }} />}
                                      sx={{
                                        bgcolor: '#25D366',
                                        color: '#fff',
                                        fontWeight: 800,
                                        fontSize: '0.75rem',
                                        textTransform: 'none',
                                        borderRadius: '8px',
                                        px: 1.25,
                                        py: 0.5,
                                        boxShadow: '0 2px 8px rgba(37, 211, 102, 0.35)',
                                        '&:hover': { bgcolor: '#128C7E' },
                                      }}
                                    >
                                      WhatsApp
                                    </Button>
                                  </Tooltip>
                                ) : (
                                  <Tooltip title="Student has not linked WhatsApp number yet">
                                    <span>
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        disabled
                                        startIcon={<WhatsAppIcon sx={{ fontSize: '15px !important' }} />}
                                        sx={{
                                          textTransform: 'none',
                                          fontSize: '0.72rem',
                                          fontWeight: 700,
                                          borderRadius: '8px',
                                          px: 1,
                                          py: 0.45,
                                        }}
                                      >
                                        No Phone
                                      </Button>
                                    </span>
                                  </Tooltip>
                                )}

                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  onClick={() => {
                                    setActiveStudentAnswerSheet(sub);
                                    setStudentAnswerSheetOpen(true);
                                  }}
                                  sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px', whiteSpace: 'nowrap' }}
                                >
                                  Inspect Answer Sheet
                                </Button>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
            <Button
              variant="contained"
              color="success"
              startIcon={<TableChartIcon />}
              onClick={handleExportExcel}
              disabled={!filteredAndSortedSubmissions || filteredAndSortedSubmissions.length === 0}
              sx={{
                textTransform: 'none',
                fontWeight: 800,
                borderRadius: '9px',
                px: 2,
                py: 0.8,
              }}
            >
              Export Excel (.xlsx)
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportCsv}
              disabled={!filteredAndSortedSubmissions || filteredAndSortedSubmissions.length === 0}
              sx={{
                textTransform: 'none',
                fontWeight: 800,
                borderRadius: '9px',
                px: 2,
                py: 0.8,
              }}
            >
              Export CSV (.csv)
            </Button>
          </Stack>
          <Button onClick={() => setSubmissionsModalOpen(false)} variant="contained" sx={greenCtaSx}>
            Close
          </Button>
        </DialogActions>

        {/* Export Format Dropdown Menu */}
        <Menu
          anchorEl={exportAnchorEl}
          open={exportMenuOpen}
          onClose={handleCloseExportMenu}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
              minWidth: 230,
            },
          }}
        >
          <MenuItem onClick={handleExportExcel} sx={{ py: 1.25, gap: 1.5 }}>
            <TableChartIcon sx={{ color: '#16a34a', fontSize: 22 }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                Export as Excel (.xlsx)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Formatted spreadsheet for Excel & Sheets
              </Typography>
            </Box>
          </MenuItem>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={handleExportCsv} sx={{ py: 1.25, gap: 1.5 }}>
            <FileDownloadIcon sx={{ color: 'primary.main', fontSize: 22 }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                Export as CSV (.csv)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Standard comma-separated file
              </Typography>
            </Box>
          </MenuItem>
        </Menu>
      </Dialog>

      {/* Answer Sheet Inspection Dialog */}
      <Dialog
        open={studentAnswerSheetOpen}
        onClose={() => setStudentAnswerSheetOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontWeight: 900, pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            Student Answer Sheet — {activeStudentAnswerSheet?.student_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Test: {activeTest?.title} • Submitted at: {activeStudentAnswerSheet?.completed_at ? new Date(activeStudentAnswerSheet.completed_at).toLocaleString('en-IN') : '—'}
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {activeStudentAnswerSheet && (
            <Stack spacing={2.5}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: '12px', bgcolor: 'action.hover' }}>
                <Stack direction="row" justifyContent="space-around" alignItems="center">
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main' }}>
                      {activeStudentAnswerSheet.score} pts
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      Net Score
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: 'success.main' }}>
                      {activeStudentAnswerSheet.correct ?? activeStudentAnswerSheet.correct_answers ?? 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      Correct (+1.0)
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: 'error.main' }}>
                      {activeStudentAnswerSheet.wrong ?? activeStudentAnswerSheet.wrong_answers ?? Math.max(0, (activeStudentAnswerSheet.total_questions || 0) - ((activeStudentAnswerSheet.correct ?? activeStudentAnswerSheet.correct_answers) || 0))}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      Wrong (-0.33)
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: 'info.main' }}>
                      {activeStudentAnswerSheet.accuracy}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      Accuracy
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: '0.04em' }}>
                DETAILED QUESTION & ANSWER BREAKDOWN
              </Typography>

              {(() => {
                const results = Array.isArray(activeStudentAnswerSheet.details)
                  ? activeStudentAnswerSheet.details
                  : (activeStudentAnswerSheet.details?.results || []);

                if (!results.length) {
                  return (
                    <Alert severity="info" sx={{ borderRadius: '12px' }}>
                      Detailed question breakdown is not available for this attempt.
                    </Alert>
                  );
                }

                return (
                  <Stack spacing={2}>
                    {results.map((det: any, idx: number) => {
                      const isCorrect = det.is_correct;
                      const isUnanswered = det.unanswered || !det.selected_option;
                      return (
                        <Paper
                          key={idx}
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: '14px',
                            borderLeft: '4px solid',
                            borderLeftColor: isCorrect ? '#2E8B57' : isUnanswered ? '#94A3B8' : '#EF4444',
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                            <Chip label={`Q${idx + 1}`} size="small" sx={{ fontWeight: 800 }} />
                            <Chip
                              label={isCorrect ? '+1.0 Mark (Correct)' : isUnanswered ? '0 Marks (Unanswered)' : '-0.33 Mark (Wrong)'}
                              size="small"
                              color={isCorrect ? 'success' : isUnanswered ? 'default' : 'error'}
                              sx={{ fontWeight: 800 }}
                            />
                          </Stack>
                          <Typography variant="body1" sx={{ fontWeight: 700, mb: 1 }}>
                            {det.question_text}
                          </Typography>
                          <Stack direction="row" spacing={3} sx={{ mb: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                color: isCorrect ? 'success.main' : isUnanswered ? 'text.secondary' : 'error.main',
                                fontWeight: 700,
                              }}
                            >
                              Student's Choice: {det.selected_option ? `Option ${det.selected_option}` : 'None (Unanswered)'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 800 }}>
                              Correct Answer: Option {det.correct_answer}
                            </Typography>
                          </Stack>
                          {det.explanation && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block', fontStyle: 'italic', bgcolor: 'action.hover', p: 1, borderRadius: '8px' }}
                            >
                              💡 {det.explanation}
                            </Typography>
                          )}
                        </Paper>
                      );
                    })}
                  </Stack>
                );
              })()}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setStudentAnswerSheetOpen(false)} variant="contained" sx={greenCtaSx}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}

