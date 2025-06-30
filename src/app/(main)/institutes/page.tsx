// app/(main)/institutes/page.tsx

'use client';

import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import {
  Box, Typography, Button, CircularProgress, Alert, Paper,
  List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';

const fetcher = (url: string) => apiClient.get(url).then(res => res.data);

export default function BrowseInstitutesPage() {
    const { profile, user } = useAppContext();
    const { mutate } = useSWRConfig();
    const [requestStatus, setRequestStatus] = useState<{ [key: number]: 'sending' | 'sent' | 'error' }>({});

    // Fetch the public list of all institutes
    const { data: institutes, error, isLoading } = useSWR('/institute/public/list/', fetcher);

    const handleRequestJoin = async (instituteId: number) => {
        if (!user) {
            alert("Please log in to send a join request.");
            return;
        }

        setRequestStatus(prev => ({ ...prev, [instituteId]: 'sending' }));

        try {
            await apiClient.post('/institute-join-request/', { institute: instituteId });
            setRequestStatus(prev => ({ ...prev, [instituteId]: 'sent' }));
            // Refresh the user's profile data to get the new pending status
            mutate('/auth/profile/');
        } catch (err) {
            setRequestStatus(prev => ({ ...prev, [instituteId]: 'error' }));
            alert("Failed to send request. You may already have a pending request or belong to an institute.");
        }
    };

    if (isLoading) return <CircularProgress />;
    if (error) return <Alert severity="error">Could not load institutes.</Alert>;

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, color: 'white' }}>
                Find Your Institute
            </Typography>

            {/* If user already has a pending request, show them the status */}
            {profile?.join_request_status && (
                <Alert severity="info" sx={{ mb: 4 }}>{profile.join_request_status}</Alert>
            )}

            <Paper sx={{ borderRadius: 4, bgcolor: 'background.paper' }}>
                <List>
                    {institutes?.map((institute: any) => (
                        <ListItem key={institute.id} divider>
                            <ListItemAvatar>
                                <Avatar src={institute.logo || ''} sx={{ width: 56, height: 56 }} />
                            </ListItemAvatar>
                            <ListItemText primary={institute.name} primaryTypographyProps={{ fontWeight: 'bold' }} />
                            
                            {/* Logic to show the correct button state */}
                            {profile?.institute?.id === institute.id ? (
                                <Button variant="contained" disabled>You are a Member</Button>
                            ) : profile?.join_request_status?.includes(institute.name) ? (
                                <Button variant="outlined" disabled>Request Pending</Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    onClick={() => handleRequestJoin(institute.id)}
                                    disabled={requestStatus[institute.id] === 'sending' || requestStatus[institute.id] === 'sent'}
                                >
                                    {requestStatus[institute.id] === 'sending' && <CircularProgress size={24} color="inherit" />}
                                    {requestStatus[institute.id] === 'sent' && 'Request Sent'}
                                    {!requestStatus[institute.id] && 'Request to Join'}
                                </Button>
                            )}
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </motion.div>
    );
}