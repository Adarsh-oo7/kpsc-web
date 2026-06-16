// app/(institute)/institute/topics/page.tsx

'use client';

import { useState } from 'react';
import useSWR from 'swr';
import apiClient from '@/lib/apiClient';
import { useAppContext } from '@/context/AppContext';
import {
  Box, Typography, Button, CircularProgress, Alert, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton, Tooltip,
} from '@mui/material';
import { motion } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';



interface Topic {
    id: number;
    name: string;
}

// FIXED: Correct URL (no /api/ prefix, apiClient baseURL already includes /api)
const API_URL = '/institute/topics/';

export default function ManageTopicsPage() {
    // FIXED: Use context fetcher for proper auth
    const { fetcher } = useAppContext();
    const { data: topics, error, isLoading, mutate } = useSWR<Topic[]>(API_URL, fetcher);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
    const [topicName, setTopicName] = useState('');
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOpenDialog = (topic: Topic | null = null) => {
        setCurrentTopic(topic);
        setTopicName(topic ? topic.name : '');
        setFormError('');
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setCurrentTopic(null);
        setTopicName('');
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setFormError('');

        const payload = { name: topicName };
        const url = currentTopic ? `${API_URL}${currentTopic.id}/` : API_URL;
        const method = currentTopic ? 'patch' : 'post';

        try {
            await apiClient({ method, url, data: payload });
            mutate(); // Re-fetch the topic list
            handleCloseDialog();
        } catch (err: any) {
            setFormError(err.response?.data?.name?.[0] || 'An error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (topicId: number) => {
        if (window.confirm('Are you sure you want to delete this topic?')) {
            try {
                await apiClient.delete(`${API_URL}${topicId}/`);
                mutate();
            } catch (err) {
                alert('Failed to delete topic.');
            }
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                    Manage Topics
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                    Add New Topic
                </Button>
            </Box>

            {isLoading && <CircularProgress />}
            {error && <Alert severity="error">Failed to load topics. Please try again.</Alert>}

            <Paper sx={{ borderRadius: 4, overflow: 'hidden', bgcolor: 'background.paper' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Topic ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Topic Name</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {topics?.map((topic) => (
                                <TableRow key={topic.id} hover>
                                    <TableCell>#{topic.id}</TableCell>
                                    <TableCell>{topic.name}</TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Edit Topic">
                                            <IconButton onClick={() => handleOpenDialog(topic)} color="primary">
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete Topic">
                                            <IconButton onClick={() => handleDelete(topic.id)} color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!topics || topics.length === 0) && !isLoading && (
                                <TableRow>
                                    <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                                        <Typography color="text.secondary">
                                            No topics yet. Add your first topic!
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Add/Edit Topic Dialog */}
            <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>{currentTopic ? 'Edit Topic' : 'Add a New Topic'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
                        <TextField
                            autoFocus
                            margin="dense"
                            id="name"
                            label="Topic Name"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={topicName}
                            onChange={(e) => setTopicName(e.target.value)}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting}>
                        {isSubmitting ? <CircularProgress size={24} /> : (currentTopic ? 'Save Changes' : 'Add Topic')}
                    </Button>
                </DialogActions>
            </Dialog>
        </motion.div>
    );
}