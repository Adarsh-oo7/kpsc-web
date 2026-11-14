'use client';

import useSWR from 'swr';
import { Box, Typography, Button, Paper, List, ListItem, ListItemText, ListItemAvatar, Avatar, Stack, CircularProgress, Alert } from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
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
                                primary={
                                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                        <Typography sx={{ fontWeight: 800 }}>{req.full_name || req.user?.username || 'Unknown User'}</Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>@{req.user?.username}</Typography>
                                    </Stack>
                                }
                                secondary={
                                    <Stack direction="column" spacing={0.3} sx={{ mt: 0.5 }}>
                                        {req.user?.email && (
                                            <Typography variant="caption" color="text.secondary">{req.user.email}</Typography>
                                        )}
                                        {req.phone_number ? (
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="caption" sx={{ color: '#16a34a', fontWeight: 800 }}>
                                                    📱 WhatsApp: +91 {req.phone_number}
                                                </Typography>
                                                <Button
                                                    size="small"
                                                    component="a"
                                                    href={`https://wa.me/91${req.phone_number}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    startIcon={<WhatsAppIcon sx={{ fontSize: '14px !important' }} />}
                                                    sx={{
                                                        color: '#16a34a',
                                                        fontSize: '0.72rem',
                                                        fontWeight: 800,
                                                        py: 0,
                                                        px: 0.75,
                                                        minWidth: 0,
                                                        textTransform: 'none',
                                                        borderRadius: '6px',
                                                        bgcolor: 'rgba(22, 163, 74, 0.08)',
                                                        '&:hover': { bgcolor: 'rgba(22, 163, 74, 0.16)' }
                                                    }}
                                                >
                                                    WhatsApp
                                                </Button>
                                            </Stack>
                                        ) : (
                                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                                No WhatsApp number provided
                                            </Typography>
                                        )}
                                    </Stack>
                                }
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