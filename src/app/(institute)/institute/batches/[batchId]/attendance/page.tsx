'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import {
  Box, Typography, Button, CircularProgress, Alert, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, RadioGroup, FormControlLabel, Radio, Stack, TextField
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';

export default function BatchAttendancePage() {
  const { fetcher } = useAppContext();
  const params = useParams();
  const router = useRouter();
  const batchId = params?.batchId;

  // Track the selected date, defaults to today's local date (YYYY-MM-DD)
  const getTodayDateString = () => {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };

  const [date, setDate] = useState(getTodayDateString());
  const [attendanceSheet, setAttendanceSheet] = useState<Record<number, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  // Fetch batch details
  const { data: batch, error: batchError, isLoading: batchLoading } = useSWR(
    batchId ? `/institute/batches/${batchId}/` : null,
    fetcher
  );

  // Fetch attendance for the specific batch & date
  const { data: attendanceData, error: attendanceError, isLoading: attendanceLoading, mutate } = useSWR(
    batchId ? `/institute/batches/${batchId}/attendance/?date=${date}` : null,
    fetcher
  );

  // Sync state when attendanceData is loaded
  useEffect(() => {
    if (attendanceData?.attendance) {
      const sheet: Record<number, string> = {};
      attendanceData.attendance.forEach((student: any) => {
        sheet[student.student_profile_id] = student.status === 'unmarked' ? 'present' : student.status;
      });
      setAttendanceSheet(sheet);
    }
  }, [attendanceData]);

  const handleStatusChange = (studentProfileId: number, status: string) => {
    setAttendanceSheet(prev => ({ ...prev, [studentProfileId]: status }));
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    setSaveSuccess('');
    setSaveError('');
    try {
      await apiClient.post(`/institute/batches/${batchId}/attendance/`, {
        date: date,
        attendance: attendanceSheet
      });
      setSaveSuccess('Attendance recorded successfully!');
      mutate();
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err: any) {
      setSaveError(err.response?.data?.error || 'Failed to save attendance.');
    } finally {
      setIsSaving(false);
    }
  };

  if (batchLoading) return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />;
  if (batchError) return <Alert severity="error">Failed to load batch details.</Alert>;
  if (!batch) return <Alert severity="error">Batch not found.</Alert>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <IconButton onClick={() => router.push('/institute/batches')} sx={{ mr: 2, color: 'white' }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
            Roll Call: {batch.name}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'grey.300' }}>
            Mark student attendance daily
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} sx={{ mt: { xs: 2, sm: 0 } }}>
          <TextField 
            type="date"
            label="Attendance Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 1, '& input': { color: 'white' } }}
          />
          <Button 
            variant="contained" 
            startIcon={<SaveIcon />} 
            onClick={handleSaveAttendance}
            disabled={isSaving || batch.students?.length === 0}
          >
            {isSaving ? 'Saving...' : 'Save Roll'}
          </Button>
        </Stack>
      </Box>

      {saveSuccess && <Alert severity="success" sx={{ mb: 3 }}>{saveSuccess}</Alert>}
      {saveError && <Alert severity="error" sx={{ mb: 3 }}>{saveError}</Alert>}

      {/* Attendance Sheet */}
      {attendanceLoading ? (
        <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />
      ) : (
        <Paper sx={{ borderRadius: 4, bgcolor: 'background.paper', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Full Name</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>Attendance Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceData?.attendance?.map((student: any) => (
                  <TableRow key={student.student_profile_id} hover>
                    <TableCell sx={{ fontWeight: '600' }}>{student.username}</TableCell>
                    <TableCell>{student.full_name || 'N/A'}</TableCell>
                    <TableCell align="center">
                      <RadioGroup
                        row
                        value={attendanceSheet[student.student_profile_id] || 'present'}
                        onChange={(e) => handleStatusChange(student.student_profile_id, e.target.value)}
                        sx={{ justifyContent: 'center' }}
                      >
                        <FormControlLabel value="present" control={<Radio color="success" />} label="Present" />
                        <FormControlLabel value="absent" control={<Radio color="error" />} label="Absent" />
                        <FormControlLabel value="late" control={<Radio color="warning" />} label="Late" />
                        <FormControlLabel value="excused" control={<Radio color="info" />} label="Excused" />
                      </RadioGroup>
                    </TableCell>
                  </TableRow>
                ))}
                {attendanceData?.attendance?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        Please enroll students in this batch first to take attendance.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </motion.div>
  );
}
