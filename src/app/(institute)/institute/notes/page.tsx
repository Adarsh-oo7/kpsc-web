'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
  Box, Typography, Button, CircularProgress, Alert, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack,
  FormControl, InputLabel, Select, MenuItem, IconButton, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import { motion } from 'framer-motion';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';

export default function NotesPage() {
  const { fetcher } = useAppContext();

  // Filter state
  const [filterBatchId, setFilterBatchId] = useState('');

  // Fetch notes list (scoped by batch if selected)
  const { data: notes, error: notesError, isLoading: notesLoading, mutate: mutateNotes } = useSWR(
    `/institute/notes/${filterBatchId ? `?batch_id=${filterBatchId}` : ''}`,
    fetcher
  );

  // Fetch batches list for filter and form dropdowns
  const { data: batches } = useSWR('/institute/batches/', fetcher);

  // Form states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', batch_id: '' });
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setForm({ title: '', description: '', batch_id: '' });
    setFile(null);
    setFormError('');
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadNote = async () => {
    if (!form.title || !file) return;
    setIsSubmitting(true);
    setFormError('');
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      if (form.batch_id) {
        formData.append('batch', form.batch_id);
      }
      formData.append('file', file);

      await apiClient.post('/institute/notes/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      mutateNotes();
      handleCloseDialog();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to upload study note.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Are you sure you want to delete this study note?')) return;
    try {
      await apiClient.delete(`/institute/notes/${noteId}/`);
      mutateNotes();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete note.');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
            Study Materials (Notes)
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'grey.300' }}>
            Upload notes, lectures, or syllabuses in PDF/Image formats
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleOpenDialog}
          sx={{ mt: { xs: 2, sm: 0 } }}
        >
          Upload Note
        </Button>
      </Box>

      {/* Filter and Content */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, maxWidth: 300 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="batch-filter-label" sx={{ color: 'grey.400' }}>Filter by Batch</InputLabel>
          <Select
            labelId="batch-filter-label"
            value={filterBatchId}
            label="Filter by Batch"
            onChange={(e) => setFilterBatchId(e.target.value as string)}
            sx={{ color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.2)' } }}
          >
            <MenuItem value="">All Batches</MenuItem>
            {batches?.map((b: any) => (
              <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {notesLoading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />}
      {notesError && <Alert severity="error">Failed to load study notes.</Alert>}

      {/* Notes Table */}
      {!notesLoading && (
        <Paper sx={{ borderRadius: 4, bgcolor: 'background.paper', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Batch Scoped</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Uploaded Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notes?.map((note: any) => (
                  <TableRow key={note.id} hover>
                    <TableCell sx={{ fontWeight: '600' }}>{note.title}</TableCell>
                    <TableCell>{note.description || 'No description'}</TableCell>
                    <TableCell>
                      {note.batch ? (
                        <Chip label={batches?.find((b: any) => b.id === note.batch)?.name || 'Scoped'} size="small" variant="outlined" />
                      ) : (
                        <Chip label="All Students" size="small" color="primary" variant="outlined" />
                      )}
                    </TableCell>
                    <TableCell>{new Date(note.created_at).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <IconButton 
                          component="a" 
                          href={note.file_url || '#'} 
                          target="_blank" 
                          download
                          size="small"
                          sx={{ color: 'primary.light' }}
                        >
                          <DownloadIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteNote(note.id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {notes?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <Typography color="text.secondary">
                        No study materials uploaded yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Upload Note Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Upload Study Material</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField 
              name="title" 
              label="Title" 
              value={form.title} 
              onChange={handleFormChange}
              fullWidth
              required
              autoFocus
              placeholder="e.g. Kerala History Notes - Part 1"
            />
            <TextField 
              name="description" 
              label="Description" 
              value={form.description} 
              onChange={handleFormChange}
              fullWidth
              multiline
              rows={2}
              placeholder="Brief details about the file content..."
            />
            <FormControl fullWidth>
              <InputLabel id="batch-select-label">Scoped Batch (Optional)</InputLabel>
              <Select
                labelId="batch-select-label"
                value={form.batch_id}
                label="Scoped Batch (Optional)"
                onChange={(e) => setForm(prev => ({ ...prev, batch_id: e.target.value as string }))}
              >
                <MenuItem value="">Available to all students</MenuItem>
                {batches?.map((b: any) => (
                  <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              component="label"
              sx={{ py: 1.5 }}
            >
              {file ? `File: ${file.name}` : 'Choose Note File (PDF/Word/Image)'}
              <input
                type="file"
                hidden
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.png,.jpeg"
              />
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleUploadNote} 
            variant="contained" 
            disabled={isSubmitting || !form.title || !file}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
}
