'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Tabs,
  Tab,
  Avatar,
  Chip,
  InputAdornment,
  IconButton,
  Tooltip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import PaymentsIcon from '@mui/icons-material/Payments';
import DeleteIcon from '@mui/icons-material/Delete';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';
import { InstitutePageHeader, greenCtaSx } from '@/components/institute/pageChrome';

const initialCreateFormState = {
  username: '',
  email: '',
  password: '',
  first_name: '',
  last_name: '',
};
const initialAddFormState = { username: '' };

export default function ManageStudentsPage() {
  const { fetcher } = useAppContext();
  const router = useRouter();
  const { data: students, error, isLoading, mutate } = useSWR('/institute/students/', fetcher);
  const studentList = Array.isArray(students) ? students : [];

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<{ id: number; name: string } | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [createForm, setCreateForm] = useState(initialCreateFormState);
  const [addForm, setAddForm] = useState(initialAddFormState);
  const [searchQuery, setSearchQuery] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Student Detailed Results Dialog state
  const [resultsDialogOpen, setResultsDialogOpen] = useState(false);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [selectedStudentResults, setSelectedStudentResults] = useState<any>(null);
  const [selectedTestFilter, setSelectedTestFilter] = useState<string>('all');
  const [activeAnswerSheet, setActiveAnswerSheet] = useState<any>(null);
  const [answerSheetDialogOpen, setAnswerSheetDialogOpen] = useState(false);

  const filteredStudents = useMemo(() => {
    if (!studentList.length) return [];
    if (!searchQuery.trim()) return studentList;
    return studentList.filter(
      (profile: any) =>
        (profile.user?.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (profile.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (profile.user?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [studentList, searchQuery]);

  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setFormError('');
    setCreateForm(initialCreateFormState);
    setAddForm(initialAddFormState);
    setTabValue(0);
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setFormError('');
  };

  const handleCreateFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCreateForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateStudent = async () => {
    setIsSubmitting(true);
    setFormError('');
    try {
      await apiClient.post('/institute/students/', createForm);
      mutate();
      handleCloseDialog();
    } catch (err: any) {
      setFormError(
        err.response?.data?.username?.[0] ||
          err.response?.data?.error ||
          'Failed to create student.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddExistingStudent = async () => {
    setIsSubmitting(true);
    setFormError('');
    try {
      await apiClient.post('/institute/students/add-by-username/', addForm);
      mutate();
      handleCloseDialog();
    } catch (err: any) {
      setFormError(
        err.response?.data?.username?.[0] || 'User not found or already in an institute.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDeleteDialog = (profile: any) => {
    setStudentToDelete({
      id: profile.id,
      name: profile.user.full_name || profile.user.username,
    });
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setStudentToDelete(null);
  };

  const handleDeleteStudent = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/institute/students/${studentToDelete.id}/`);
      mutate();
      handleCloseDeleteDialog();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to remove student from institute.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewResults = async (studentProfileId: number) => {
    setResultsDialogOpen(true);
    setResultsLoading(true);
    setSelectedStudentResults(null);
    setSelectedTestFilter('all');
    setActiveAnswerSheet(null);
    try {
      const res = await apiClient.get(`/institute/students/${studentProfileId}/results/`);
      setSelectedStudentResults(res.data);
    } catch {
      alert('Could not load student test results.');
      setResultsDialogOpen(false);
    } finally {
      setResultsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <InstitutePageHeader
        title="Students, Leaderboard & Test Results"
        subtitle={`${studentList.length} student${studentList.length !== 1 ? 's' : ''} enrolled — ranked by Academy Score, Tests Attended & Accuracy.`}
        action={
          <Button variant="contained" onClick={handleOpenDialog} startIcon={<AddIcon />} sx={greenCtaSx}>
            Add student
          </Button>
        }
      />

      <Paper sx={{ p: 2, mb: 4, borderRadius: 4, bgcolor: 'background.paper' }}>
        <TextField
          fullWidth
          placeholder="Search by name, username, or email..."
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

      {isLoading && <CircularProgress sx={{ display: 'block', mx: 'auto' }} />}
      {error && <Alert severity="error">Failed to load students.</Alert>}

      {!isLoading && !error && (
        <Paper sx={{ borderRadius: 4, bgcolor: 'background.paper', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Rank</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Academy Score</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Questions Solved</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Accuracy</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Tests Attended</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Fee Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStudents && filteredStudents.length > 0 ? (
                  filteredStudents.map((profile: any, idx: number) => {
                    const st = profile.performance_stats || {};
                    const rank = profile.rank || idx + 1;
                    return (
                      <TableRow
                        key={profile.user.id}
                        hover
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell>
                          <Chip
                            label={`#${rank}`}
                            size="small"
                            sx={{
                              fontWeight: 900,
                              bgcolor:
                                rank === 1
                                  ? '#F59E0B'
                                  : rank === 2
                                  ? '#94A3B8'
                                  : rank === 3
                                  ? '#D97706'
                                  : 'action.selected',
                              color: rank <= 3 ? '#fff' : 'text.primary',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar src={profile.profile_photo || ''} sx={{ width: 40, height: 40, mr: 2 }} />
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {profile.user.full_name ||
                                  `${profile.user.first_name} ${profile.user.last_name}`.trim() ||
                                  profile.user.username}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                @{profile.user.username} • {profile.user.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 800, color: (st.academy_score ?? 0) >= 0 ? '#1B6B3A' : '#DC2626' }}>
                            {(st.academy_score ?? 0) > 0 ? `+${st.academy_score}` : (st.academy_score ?? 0)} pts
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Academy tests
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {st.academy_attempted ?? 0} solved
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {st.academy_correct ?? 0} correct • {st.academy_wrong ?? 0} wrong
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${st.academy_accuracy ?? 0}%`}
                            size="small"
                            color={(st.academy_accuracy ?? 0) >= 70 ? 'success' : (st.academy_accuracy ?? 0) >= 40 ? 'warning' : 'default'}
                            variant="outlined"
                            sx={{ fontWeight: 800 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Chip
                            label={`${st.tests_attended ?? 0} tests`}
                            size="small"
                            color={(st.tests_attended ?? 0) > 0 ? 'primary' : 'default'}
                            variant="outlined"
                            sx={{ fontWeight: 800 }}
                          />
                        </TableCell>
                        <TableCell>
                          {profile.fee_status ? (
                            <Chip
                              label={`₹${profile.fee_status.balance_due} Due`}
                              color={profile.fee_status.balance_due > 0 ? 'error' : 'success'}
                              size="small"
                              variant="outlined"
                            />
                          ) : (
                            <Chip label="Not Set" size="small" />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<AssessmentIcon />}
                              onClick={() => handleViewResults(profile.id)}
                              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px' }}
                            >
                              Results
                            </Button>
                            <Tooltip title="Manage Fees">
                              <IconButton color="primary" onClick={() => router.push(`/institute/students/${profile.id}/fees`)}>
                                <PaymentsIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Remove Student from Institute">
                              <IconButton color="error" onClick={() => handleOpenDeleteDialog(profile)}>
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery ? 'No students match your search.' : 'No students have been added yet.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Detailed Student Results Dialog */}
      <Dialog
        open={resultsDialogOpen}
        onClose={() => setResultsDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ fontWeight: 900 }}>
          {selectedStudentResults?.student
            ? `Student Performance Report — ${
                selectedStudentResults.student.user?.full_name ||
                selectedStudentResults.student.user?.username
              }`
            : 'Student Performance Report'}
        </DialogTitle>
        <DialogContent dividers>
          {resultsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : selectedStudentResults ? (
            <Stack spacing={3}>
              {/* Summary KPIs */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 2 }}>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: '14px' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                    ACADEMY TEST SCORE
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: (selectedStudentResults.student.performance_stats?.academy_score ?? 0) >= 0 ? 'success.main' : 'error.main' }}>
                    {selectedStudentResults.student.performance_stats?.academy_score ?? 0} pts
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedStudentResults.student.performance_stats?.academy_correct ?? 0} correct • {selectedStudentResults.student.performance_stats?.academy_wrong ?? 0} wrong
                  </Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: '14px' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                    ACADEMY QUESTIONS
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    {selectedStudentResults.student.performance_stats?.academy_attempted ?? 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total academy attempts
                  </Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: '14px' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                    ACADEMY ACCURACY
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: 'success.main' }}>
                    {selectedStudentResults.student.performance_stats?.academy_accuracy ?? 0}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedStudentResults.student.performance_stats?.academy_correct ?? 0} / {selectedStudentResults.student.performance_stats?.academy_attempted ?? 0} correct
                  </Typography>
                </Paper>
                <Paper variant="outlined" sx={{ p: 2, borderRadius: '14px' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
                    TESTS ATTENDED
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#3B82F6' }}>
                    {selectedStudentResults.student.performance_stats?.tests_attended ?? selectedStudentResults.test_attempts?.length ?? 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Completed mock tests
                  </Typography>
                </Paper>
              </Box>

              {/* Mock Tests Attended & Scores Table */}
              <Box>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      Mock Tests Attended & Detailed Results
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Select any test to inspect the student's question-by-question answer sheet
                    </Typography>
                  </Box>

                  {selectedStudentResults.test_attempts && selectedStudentResults.test_attempts.length > 0 && (
                    <FormControl size="small" sx={{ minWidth: 260 }}>
                      <InputLabel>Filter by Mock Test</InputLabel>
                      <Select
                        value={selectedTestFilter}
                        label="Filter by Mock Test"
                        onChange={(e) => setSelectedTestFilter(e.target.value)}
                      >
                        <MenuItem value="all">
                          All Attended Tests ({selectedStudentResults.test_attempts.length})
                        </MenuItem>
                        {selectedStudentResults.test_attempts.map((att: any) => (
                          <MenuItem key={att.id} value={att.id.toString()}>
                            {att.test_title} ({att.score > 0 ? `+${att.score}` : att.score} pts)
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </Stack>

                {selectedStudentResults.test_attempts && selectedStudentResults.test_attempts.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '12px' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800 }}>Test Name</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800 }}>Score (Net)</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800 }}>Attempted</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800 }}>Correct</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800 }}>Wrong</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800 }}>Accuracy</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800 }}>Answer Sheet</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedStudentResults.test_attempts
                          .filter((att: any) => (selectedTestFilter === 'all' ? true : att.id.toString() === selectedTestFilter))
                          .map((att: any) => (
                            <TableRow key={att.id} hover>
                              <TableCell sx={{ fontWeight: 800 }}>{att.test_title}</TableCell>
                              <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                                {new Date(att.completed_at).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 900, color: att.score >= 0 ? '#1B6B3A' : '#DC2626' }}>
                                {att.score > 0 ? `+${att.score}` : att.score} pts
                              </TableCell>
                              <TableCell align="right">{att.attempted} / {att.total_questions}</TableCell>
                              <TableCell align="right" sx={{ color: 'success.main', fontWeight: 700 }}>{att.correct}</TableCell>
                              <TableCell align="right" sx={{ color: 'error.main', fontWeight: 700 }}>{att.wrong}</TableCell>
                              <TableCell align="right">
                                <Chip
                                  label={`${att.accuracy}%`}
                                  size="small"
                                  variant="outlined"
                                  color={att.accuracy >= 70 ? 'success' : 'default'}
                                  sx={{ fontWeight: 800 }}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<FormatListNumberedIcon />}
                                  onClick={() => {
                                    setActiveAnswerSheet(att);
                                    setAnswerSheetDialogOpen(true);
                                  }}
                                  sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px', whiteSpace: 'nowrap' }}
                                >
                                  View Answers
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity="info" sx={{ borderRadius: '12px' }}>
                    No mock test attempts recorded yet for this student. Once the student completes tests in RankUp, their test scorecards and accuracy breakdown will be listed here.
                  </Alert>
                )}
              </Box>

              {/* Topic Breakdown */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
                  Topic-wise Performance Breakdown
                </Typography>
                {selectedStudentResults.topic_breakdown?.length > 0 ? (
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '12px' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800 }}>Topic</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800 }}>Attempted</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800 }}>Correct</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800 }}>Wrong</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800 }}>Accuracy</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 800 }}>Net Marks</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedStudentResults.topic_breakdown.map((row: any, i: number) => (
                          <TableRow key={i}>
                            <TableCell>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {row.topic_name}
                                </Typography>
                                {row.is_academy_topic && (
                                  <Chip label="Academy" size="small" color="primary" variant="outlined" />
                                )}
                              </Stack>
                            </TableCell>
                            <TableCell align="right">{row.attempted}</TableCell>
                            <TableCell align="right" sx={{ color: 'success.main', fontWeight: 700 }}>
                              {row.correct}
                            </TableCell>
                            <TableCell align="right" sx={{ color: 'error.main' }}>
                              {row.wrong}
                            </TableCell>
                            <TableCell align="right">
                              <Chip label={`${row.accuracy}%`} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800 }}>
                              {row.net_marks}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    This student has not attempted any questions yet.
                  </Typography>
                )}
              </Box>

              <Divider />

              {/* Recent Question Attempts */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
                  Recent Test & Question Attempts
                </Typography>
                {selectedStudentResults.recent_attempts?.length > 0 ? (
                  <Stack spacing={1.25}>
                    {selectedStudentResults.recent_attempts.slice(0, 15).map((att: any) => (
                      <Paper key={att.id} variant="outlined" sx={{ p: 1.5, borderRadius: '12px' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {att.question_text}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Topic: {att.topic_name} • Selected: Option {att.selected_option} • Correct: Option{' '}
                              {att.correct_answer}
                            </Typography>
                          </Box>
                          {att.is_correct ? (
                            <Chip
                              icon={<CheckCircleIcon />}
                              label="Correct"
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          ) : (
                            <Chip
                              icon={<CancelIcon />}
                              label="Wrong"
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                          )}
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No recent question attempts recorded yet.
                  </Typography>
                )}
              </Box>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setResultsDialogOpen(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for Adding Students */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Add a Student to Your Institute</DialogTitle>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="Create New Student" />
            <Tab label="Add Existing Student" />
          </Tabs>
        </Box>
        {tabValue === 0 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateStudent();
            }}
          >
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create a new account for a student.
              </Typography>
              <Stack spacing={2} sx={{ mt: 1 }}>
                {formError && <Alert severity="error">{formError}</Alert>}
                <TextField
                  name="first_name"
                  label="First Name"
                  value={createForm.first_name}
                  onChange={handleCreateFormChange}
                  fullWidth
                  autoFocus
                />
                <TextField
                  name="last_name"
                  label="Last Name"
                  value={createForm.last_name}
                  onChange={handleCreateFormChange}
                  fullWidth
                />
                <TextField
                  name="username"
                  label="Username"
                  value={createForm.username}
                  onChange={handleCreateFormChange}
                  fullWidth
                  required
                />
                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  value={createForm.email}
                  onChange={handleCreateFormChange}
                  fullWidth
                  required
                />
                <TextField
                  name="password"
                  label="Password"
                  type="password"
                  value={createForm.password}
                  onChange={handleCreateFormChange}
                  fullWidth
                  required
                  helperText="At least 8 characters."
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? <CircularProgress size={24} /> : 'Create Student'}
              </Button>
            </DialogActions>
          </form>
        )}
        {tabValue === 1 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAddExistingStudent();
            }}
          >
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Search by exact username to add a student who has already registered.
              </Typography>
              <Stack spacing={2} sx={{ mt: 1 }}>
                {formError && <Alert severity="error">{formError}</Alert>}
                <TextField
                  name="username"
                  label="Student's Username"
                  value={addForm.username}
                  onChange={(e) => setAddForm({ username: e.target.value })}
                  fullWidth
                  required
                  autoFocus
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? <CircularProgress size={24} /> : 'Search & Add Student'}
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ color: 'error.main' }}>Remove Student</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove <strong>{studentToDelete?.name}</strong> from your institute? This will unlink them from your institute but will not delete their account.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteStudent} variant="contained" color="error" disabled={isDeleting}>
            {isDeleting ? <CircularProgress size={24} /> : 'Remove Student'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Answer Sheet Modal for Specific Test Attempt */}
      <Dialog
        open={answerSheetDialogOpen}
        onClose={() => setAnswerSheetDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 900, pb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>
                {activeAnswerSheet?.test_title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Answer Sheet for {selectedStudentResults?.student?.user?.full_name || selectedStudentResults?.student?.user?.username} • Kerala PSC Scheme (+1.0 / -0.33)
              </Typography>
            </Box>
            <Chip
              label={`Score: ${activeAnswerSheet?.score > 0 ? `+${activeAnswerSheet?.score}` : activeAnswerSheet?.score} pts`}
              color="primary"
              sx={{ fontWeight: 900, fontSize: '0.9rem', px: 1 }}
            />
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {activeAnswerSheet && (
            <Stack spacing={2.5}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: '14px', bgcolor: 'rgba(27, 107, 58, 0.05)' }}>
                <Stack direction="row" spacing={2} justifyContent="space-around" flexWrap="wrap" useFlexGap>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: 'success.main' }}>
                      {activeAnswerSheet.correct}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      Correct (+1.0)
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: 'error.main' }}>
                      {activeAnswerSheet.wrong}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      Wrong (-0.33)
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: 'text.secondary' }}>
                      {activeAnswerSheet.unanswered ?? (activeAnswerSheet.total_questions - (activeAnswerSheet.correct + activeAnswerSheet.wrong))}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                      Unanswered (0)
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main' }}>
                      {activeAnswerSheet.accuracy}%
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

              {activeAnswerSheet.details && activeAnswerSheet.details.length > 0 ? (
                <Stack spacing={2}>
                  {activeAnswerSheet.details.map((det: any, idx: number) => {
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
                          <Typography variant="body2" sx={{ color: isCorrect ? 'success.main' : isUnanswered ? 'text.secondary' : 'error.main', fontWeight: 700 }}>
                            Student's Choice: {det.selected_option ? `Option ${det.selected_option}` : 'None'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 800 }}>
                            Correct Answer: Option {det.correct_answer}
                          </Typography>
                        </Stack>
                        {det.explanation && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontStyle: 'italic', bgcolor: 'action.hover', p: 1, borderRadius: '8px' }}>
                            💡 {det.explanation}
                          </Typography>
                        )}
                      </Paper>
                    );
                  })}
                </Stack>
              ) : (
                <Alert severity="info">
                  Detailed question breakdown is not available for this legacy attempt.
                </Alert>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAnswerSheetDialogOpen(false)} variant="contained" sx={greenCtaSx}>
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}
