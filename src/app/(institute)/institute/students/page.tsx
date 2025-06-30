'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import {
  Box, Typography, Button, CircularProgress, Alert, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack,
  Tabs, Tab, Avatar, Chip, InputAdornment, IconButton, Tooltip
} from '@mui/material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import PaymentsIcon from '@mui/icons-material/Payments';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';

// Initial state for the student creation form
const initialCreateFormState = { 
    username: '', email: '', password: '', 
    first_name: '', last_name: '' 
};
const initialAddFormState = { username: '' };

export default function ManageStudentsPage() {
    // Get the universal fetcher from the global context
    const { fetcher } = useAppContext();
    const router = useRouter();
    const { data: students, error, isLoading, mutate } = useSWR('/institute/students/', fetcher);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [createForm, setCreateForm] = useState(initialCreateFormState);
    const [addForm, setAddForm] = useState(initialAddFormState);
    const [searchQuery, setSearchQuery] = useState('');
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Client-side filtering logic for the search field
    const filteredStudents = useMemo(() => {
        if (!students) return [];
        if (!searchQuery.trim()) return students;
        return students.filter((profile: any) =>
            profile.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            profile.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            profile.user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [students, searchQuery]);

    const handleOpenDialog = () => setDialogOpen(true);
    const handleCloseDialog = () => {
        setDialogOpen(false);
        setFormError('');
        setCreateForm(initialCreateFormState);
        setAddForm(initialAddFormState);
        setTabValue(0);
    };
    
    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
        setFormError('');
    };

    const handleCreateFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCreateForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCreateStudent = async () => {
        setIsSubmitting(true);
        setFormError('');
        try {
            await apiClient.post('/institute/students/', createForm);
            mutate(); // Refresh the student list
            handleCloseDialog();
        } catch (err: any) {
            setFormError(err.response?.data?.username?.[0] || err.response?.data?.error || 'Failed to create student.');
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
            setFormError(err.response?.data?.username?.[0] || 'User not found or already in an institute.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>Manage Students</Typography>
                <Button variant="contained" onClick={handleOpenDialog} startIcon={<AddIcon />}>Add Student</Button>
            </Box>

            <Paper sx={{ p: 2, mb: 4, borderRadius: 4, bgcolor: 'background.paper' }}>
                <TextField
                    fullWidth
                    placeholder="Search by name, username, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>),
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
                                    <TableCell sx={{ fontWeight: 'bold' }}>Student Name</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Fee Status</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredStudents && filteredStudents.length > 0 ? filteredStudents.map((profile: any) => (
                                    <TableRow key={profile.user.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar src={profile.profile_photo || ''} sx={{ width: 40, height: 40, mr: 2 }} />
                                                <Box>
                                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{profile.user.full_name}</Typography>
                                                    <Typography variant="body2" color="text.secondary">{profile.user.email}</Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{profile.user.username}</TableCell>
                                        <TableCell>
                                            {profile.fee_status ? (
                                                <Chip
                                                    label={`₹${profile.fee_status.balance_due} Due`}
                                                    color={profile.fee_status.balance_due > 0 ? "error" : "success"}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            ) : (
                                                <Chip label="Not Set" size="small" />
                                            )}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Manage Fees">
                                                <IconButton color="primary" onClick={() => router.push(`/institute/students/${profile.id}/fees`)}>
                                                    <PaymentsIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Student (Coming Soon)">
                                                <IconButton color="error">
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {searchQuery ? "No students match your search." : "No students have been added yet."}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            )}

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
                    <form onSubmit={(e) => { e.preventDefault(); handleCreateStudent(); }}>
                        <DialogContent>
                            <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>Create a new account for a student.</Typography>
                            <Stack spacing={2} sx={{ mt: 1 }}>
                                {formError && <Alert severity="error">{formError}</Alert>}
                                <TextField name="first_name" label="First Name" value={createForm.first_name} onChange={handleCreateFormChange} fullWidth autoFocus/>
                                <TextField name="last_name" label="Last Name" value={createForm.last_name} onChange={handleCreateFormChange} fullWidth />
                                <TextField name="username" label="Username" value={createForm.username} onChange={handleCreateFormChange} fullWidth required />
                                <TextField name="email" label="Email" type="email" value={createForm.email} onChange={handleCreateFormChange} fullWidth required />
                                <TextField name="password" label="Password" type="password" value={createForm.password} onChange={handleCreateFormChange} fullWidth required helperText="Password must be secure."/>
                            </Stack>
                        </DialogContent>
                        <DialogActions sx={{ p: 3 }}>
                            <Button onClick={handleCloseDialog}>Cancel</Button>
                            <Button type="submit" variant="contained" disabled={isSubmitting}>
                                {isSubmitting ? <CircularProgress size={24}/> : 'Create Student'}
                            </Button>
                        </DialogActions>
                    </form>
                )}
                {tabValue === 1 && (
                     <form onSubmit={(e) => { e.preventDefault(); handleAddExistingStudent(); }}>
                         <DialogContent>
                            <Typography variant="body2" color="text.secondary" sx={{mb: 2}}>Search by exact username to add a student who has already registered.</Typography>
                             <Stack spacing={2} sx={{ mt: 1 }}>
                                 {formError && <Alert severity="error">{formError}</Alert>}
                                 <TextField name="username" label="Student's Username" value={addForm.username} onChange={(e) => setAddForm({username: e.target.value})} fullWidth required autoFocus/>
                             </Stack>
                         </DialogContent>
                         <DialogActions sx={{ p: 3 }}>
                             <Button onClick={handleCloseDialog}>Cancel</Button>
                             <Button type="submit" variant="contained" disabled={isSubmitting}>
                                {isSubmitting ? <CircularProgress size={24}/> : 'Search & Add Student'}
                             </Button>
                         </DialogActions>
                     </form>
                )}
            </Dialog>
        </motion.div>
    );
}