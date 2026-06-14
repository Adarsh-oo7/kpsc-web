'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
  Box, Typography, Button, CircularProgress, Alert, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableRow, TableHead, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';

export default function BatchesPage() {
  const { fetcher } = useAppContext();
  const router = useRouter();

  const { data: batches, error, isLoading, mutate } = useSWR('/institute/batches/', fetcher);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setForm({ name: '', description: '' });
    setFormError('');
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateBatch = async () => {
    setIsSubmitting(true);
    setFormError('');
    try {
      await apiClient.post('/institute/batches/', form);
      mutate();
      handleCloseDialog();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to create batch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />;
  if (error) return <Alert severity="error">Failed to load batches.</Alert>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
            Batch Management
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'grey.300' }}>
            Organize student cohorts, track attendance, and assign notes
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleOpenDialog}
        >
          Create Batch
        </Button>
      </Box>

      {/* Batches Table */}
      <Paper sx={{ borderRadius: 4, bgcolor: 'background.paper', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Batch Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Students Count</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Created Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {batches?.map((batch: any) => (
                <TableRow key={batch.id} hover>
                  <TableCell sx={{ fontWeight: '600' }}>{batch.name}</TableCell>
                  <TableCell>{batch.description || 'No description'}</TableCell>
                  <TableCell>{batch.student_count || 0} students</TableCell>
                  <TableCell>{new Date(batch.created_at).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button 
                        size="small" 
                        startIcon={<VisibilityIcon />} 
                        onClick={() => router.push(`/institute/batches/${batch.id}`)}
                        variant="outlined"
                      >
                        Details
                      </Button>
                      <Button 
                        size="small" 
                        color="warning"
                        startIcon={<CalendarMonthIcon />} 
                        onClick={() => router.push(`/institute/batches/${batch.id}/attendance`)}
                        variant="outlined"
                      >
                        Attendance
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {batches?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      No batches found. Create your first batch to add students!
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create Batch Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Create New Batch</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField 
              name="name" 
              label="Batch Name" 
              value={form.name} 
              onChange={handleFormChange}
              fullWidth
              required
              autoFocus
              placeholder="e.g. LDC Batch 2026"
            />
            <TextField 
              name="description" 
              label="Description" 
              value={form.description} 
              onChange={handleFormChange}
              fullWidth
              multiline
              rows={3}
              placeholder="Optional batch details..."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateBatch} 
            variant="contained" 
            disabled={isSubmitting || !form.name}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}
