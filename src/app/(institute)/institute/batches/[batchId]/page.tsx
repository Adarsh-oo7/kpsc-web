'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
  Box, Typography, Button, CircularProgress, Alert, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem,
  FormControl, InputLabel, Stack, IconButton, Chip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';

export default function BatchDetailPage() {
  const { fetcher } = useAppContext();
  const params = useParams();
  const router = useRouter();
  const batchId = params?.batchId;

  // Fetch batch details (students are nested)
  const { data: batch, error: batchError, isLoading: batchLoading, mutate: mutateBatch } = useSWR(
    batchId ? `/institute/batches/${batchId}/` : null,
    fetcher
  );

  // Fetch all institute students to allow selection
  const { data: allStudents, error: studentsError } = useSWR('/institute/students/', fetcher);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');

  const handleOpenAddDialog = () => setAddDialogOpen(true);
  const handleCloseAddDialog = () => {
    setAddDialogOpen(false);
    setSelectedStudentId('');
    setActionError('');
  };

  const handleAddStudent = async () => {
    if (!selectedStudentId) return;
    setIsSubmitting(true);
    setActionError('');
    try {
      await apiClient.post(`/institute/batches/${batchId}/members/`, {
        student_profile_id: selectedStudentId
      });
      mutateBatch();
      handleCloseAddDialog();
    } catch (err: any) {
      setActionError(err.response?.data?.error || 'Failed to add student to batch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveStudent = async (studentProfileId: number) => {
    if (!confirm('Are you sure you want to remove this student from the batch?')) return;
    try {
      await apiClient.delete(`/institute/batches/${batchId}/members/`, {
        data: { student_profile_id: studentProfileId }
      });
      mutateBatch();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to remove student.');
    }
  };

  if (batchLoading) return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />;
  if (batchError) return <Alert severity="error">Failed to load batch details.</Alert>;
  if (!batch) return <Alert severity="error">Batch not found.</Alert>;

  // Filter students who are NOT currently in the batch
  const enrolledIds = new Set(batch.students?.map((s: any) => s.id) || []);
  const availableStudents = allStudents?.filter((s: any) => !enrolledIds.has(s.id)) || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <IconButton onClick={() => router.push('/institute/batches')} sx={{ mr: 2, color: 'white' }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
            Batch: {batch.name}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'grey.300' }}>
            {batch.description || 'No description provided.'}
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<PersonAddIcon />} 
          onClick={handleOpenAddDialog}
        >
          Add Student
        </Button>
      </Box>

      {/* Enrolled Students Table */}
      <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}>
        Enrolled Students ({batch.students?.length || 0})
      </Typography>
      
      <Paper sx={{ borderRadius: 4, bgcolor: 'background.paper', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Full Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Qualifications</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {batch.students?.map((student: any) => (
                <TableRow key={student.id} hover>
                  <TableCell sx={{ fontWeight: '600' }}>{student.user.username}</TableCell>
                  <TableCell>{student.user.first_name || student.user.last_name ? `${student.user.first_name} ${student.user.last_name}` : 'N/A'}</TableCell>
                  <TableCell>{student.user.email}</TableCell>
                  <TableCell>{student.qualifications || 'N/A'}</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      color="error" 
                      onClick={() => handleRemoveStudent(student.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {batch.students?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      No students enrolled in this batch yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add Student Dialog */}
      <Dialog open={addDialogOpen} onClose={handleCloseAddDialog} fullWidth maxWidth="xs">
        <DialogTitle>Enroll Student in Batch</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {actionError && <Alert severity="error">{actionError}</Alert>}
            <FormControl fullWidth>
              <InputLabel id="student-select-label">Select Student</InputLabel>
              <Select
                labelId="student-select-label"
                value={selectedStudentId}
                label="Select Student"
                onChange={(e) => setSelectedStudentId(e.target.value as string)}
              >
                {availableStudents.map((student: any) => (
                  <MenuItem key={student.id} value={student.id}>
                    {student.user.username} ({student.user.email})
                  </MenuItem>
                ))}
                {availableStudents.length === 0 && (
                  <MenuItem disabled value="">
                    No available students to add
                  </MenuItem>
                )}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button 
            onClick={handleAddStudent} 
            variant="contained" 
            disabled={isSubmitting || !selectedStudentId}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Enroll'}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}
