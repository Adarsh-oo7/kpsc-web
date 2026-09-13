'use client';

import useSWR from 'swr';
import { Box, Typography, Button, Paper, List, ListItem, ListItemText, ListItemAvatar, Avatar, Stack, CircularProgress, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import { useAppContext } from '@/context/AppContext'; // Import the global context
import apiClient from '@/lib/apiClient';
import { InstitutePageHeader, asList, GREEN, GREEN_LIGHT } from '@/components/institute/pageChrome';

export default function ManageRequestsPage() {
    // Get the universal fetcher from our global context.
    // This is the single source of truth for making GET requests.
    const { fetcher } = useAppContext();

    // Use the context's fetcher and the short URL. This will now work correctly.
    const { data: requestsRaw, error, isLoading, mutate } = useSWR('/institute/join-requests/', fetcher);
    const requests = asList(requestsRaw);

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
            <InstitutePageHeader
                title="Join requests"
                subtitle="Students who asked to join this academy from the public Institutes page."
            />
            <Paper sx={{ borderRadius: 4, p: 2, bgcolor: 'background.paper' }}>
                <List>
                    {requests.length > 0 ? requests.map((req: any) => (
                        <ListItem key={req.id} divider sx={{py: 2}}>
                            <ListItemAvatar>
                                <Avatar src={req.profile_photo || ''} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={req.user?.username || 'Unknown User'}
                                secondary={req.user?.email || ''}
                            />
                            <Stack direction="row" spacing={1}>
                                <Button variant="contained" onClick={() => handleProcessRequest(req.id, 'approve')} sx={{ textTransform: 'none', fontWeight: 800, background: `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})` }}>
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