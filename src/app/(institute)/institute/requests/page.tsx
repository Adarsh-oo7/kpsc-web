'use client';

import useSWR from 'swr';
import { Box, Typography, Button, Paper, List, ListItem, ListItemText, ListItemAvatar, Avatar, Stack, CircularProgress, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { useAppContext } from '@/context/AppContext'; // Import the global context
import apiClient from '@/lib/apiClient'; // Import the central API client

export default function ManageRequestsPage() {
    // Get the universal fetcher from our global context.
    // This is the single source of truth for making GET requests.
    const { fetcher } = useAppContext();

    // Use the context's fetcher and the short URL. This will now work correctly.
    const { data: requests, error, isLoading, mutate } = useSWR('/institute/join-requests/', fetcher);

    const handleProcessRequest = async (requestId: number, action: 'approve' | 'decline') => {
        try {
            // Use the apiClient for POST requests. It handles the full URL and auth token.
            await apiClient.post(`/institute/join-requests/${requestId}/${action}/`);
            mutate(); // Refresh the list of requests on success
        } catch (err) {
            alert(`Failed to ${action} request.`);
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
            </Box>
        );
    }
    
    if (error) return <Alert severity="error">Failed to load join requests.</Alert>;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, color: 'white' }}>
                Student Join Requests
            </Typography>
            <Paper sx={{ borderRadius: 4, p: 2, bgcolor: 'background.paper' }}>
                <List>
                    {requests && requests.length > 0 ? requests.map((req: any) => (
                        <ListItem key={req.id} divider sx={{py: 2}}>
                            <ListItemAvatar>
                                <Avatar src={req.student_profile.profile_photo || ''} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={req.student_profile.user.username}
                                secondary={req.student_profile.user.email}
                            />
                            <Stack direction="row" spacing={1}>
                                <Button variant="contained" color="success" onClick={() => handleProcessRequest(req.id, 'approve')}>
                                    Approve
                                </Button>
                                <Button variant="outlined" color="error" onClick={() => handleProcessRequest(req.id, 'decline')}>
                                    Decline
                                </Button>
                            </Stack>
                        </ListItem>
                    )) : (
                        <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                            You have no pending join requests.
                        </Typography>
                    )}
                </List>
            </Paper>
        </motion.div>
    );
}