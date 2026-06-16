// app/(institute)/institute/messaging/page.tsx

'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import apiClient from '@/lib/apiClient';
import {
  Box, Typography, Button, Alert, CircularProgress, Grid, Paper, TextField,
  Select, MenuItem, InputLabel, FormControl, RadioGroup, Radio, FormControlLabel,
  Stack, IconButton
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import SendIcon from '@mui/icons-material/Send';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ClearIcon from '@mui/icons-material/Clear';

// --- Helper Fetcher (uses apiClient — auth headers injected automatically) ---
const fetcher = (url: string) => apiClient.get(url).then(r => r.data);

const initialFormState = {
    subject: '',
    body: '',
    recipientType: 'all', // 'all' or 'single'
    singleRecipient: '', // Will hold the user ID
    image: null as File | null,
};

export default function MessagingPage() {
    const [formState, setFormState] = useState(initialFormState);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSending, setIsSending] = useState(false);

    // Fetch the list of students to populate the dropdown
    const { data: students, error: studentsError } = useSWR('/institute/students/', fetcher);

    const handleFormChange = (e: React.ChangeEvent<any>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormState(prev => ({ ...prev, image: file }));
            setImagePreview(URL.createObjectURL(file));
        }
    };
    
    const clearImage = () => {
        setFormState(prev => ({ ...prev, image: null }));
        setImagePreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        setError('');
        setSuccess('');

        const data = new FormData();
        data.append('subject', formState.subject);
        data.append('body', formState.body);

        if (formState.image) {
            data.append('image', formState.image);
        }

        // Determine the recipients
        if (formState.recipientType === 'all' && students) {
            students.forEach((student: any) => data.append('recipients', student.user.id));
        } else if (formState.recipientType === 'single' && formState.singleRecipient) {
            data.append('recipients', formState.singleRecipient);
        } else {
             setError('Please select recipients.');
             setIsSending(false);
             return;
        }

        try {
            await apiClient.post('/institute/messages/send/', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setSuccess('Message sent successfully!');
            setFormState(initialFormState); // Reset form
            clearImage();
        } catch (err) {
            setError('Failed to send message. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, color: 'white' }}>
                Send Message / Notification
            </Typography>

            <Paper component="form" onSubmit={handleSubmit} sx={{ p: 4, borderRadius: 4 }}>
                <Grid container spacing={3}>
                    {/* Recipient Selection */}
                    <Grid size={{ xs: 12 }}>
                        <FormControl>
                            <RadioGroup row name="recipientType" value={formState.recipientType} onChange={handleFormChange}>
                                <FormControlLabel value="all" control={<Radio />} label="All Students" />
                                <FormControlLabel value="single" control={<Radio />} label="Single Student" />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                    
                    <AnimatePresence>
                        {formState.recipientType === 'single' && (
                            <Grid size={{ xs: 12 }} component={motion.div} initial={{opacity:0, height: 0}} animate={{opacity:1, height: 'auto'}} exit={{opacity:0, height: 0}}>
                                <FormControl fullWidth>
                                    <InputLabel>Select a Student</InputLabel>
                                    <Select name="singleRecipient" value={formState.singleRecipient} label="Select a Student" onChange={(e) => handleFormChange(e as any)}>
                                        {students?.map((profile: any) => (
                                            <MenuItem key={profile.user.id} value={profile.user.id}>
                                                {profile.user.username} ({profile.user.email})
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}
                    </AnimatePresence>

                    {/* Message Fields */}
                    <Grid size={{ xs: 12 }}>
                        <TextField name="subject" label="Subject" value={formState.subject} onChange={handleFormChange} fullWidth required />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TextField name="body" label="Message Body" value={formState.body} onChange={handleFormChange} multiline rows={8} fullWidth required />
                    </Grid>

                    {/* Image Upload */}
                    <Grid size={{ xs: 12 }}>
                        {imagePreview ? (
                            <Box sx={{ position: 'relative', width: 'fit-content' }}>
                                <img src={imagePreview} alt="Preview" height="100" style={{ borderRadius: '8px' }}/>
                                <IconButton onClick={clearImage} size="small" sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}>
                                    <ClearIcon fontSize="small"/>
                                </IconButton>
                            </Box>
                        ) : (
                            <Button variant="outlined" component="label" startIcon={<PhotoCamera />}>
                                Attach Image
                                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                            </Button>
                        )}
                    </Grid>
                    
                    {/* Submit and Feedback */}
                    <Grid size={{ xs: 12 }}>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                        <Button type="submit" variant="contained" size="large" endIcon={<SendIcon />} disabled={isSending}>
                            {isSending ? <CircularProgress size={24} /> : 'Send Message'}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </motion.div>
    );
}