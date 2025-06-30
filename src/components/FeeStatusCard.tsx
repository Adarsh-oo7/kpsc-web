// src/components/FeeStatusCard.tsx

'use client';

import useSWR from 'swr';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';

const fetcher = async (url: string) => { /* ... fetcher logic ... */ };

export default function FeeStatusCard() {
    // This assumes you have a new student-facing endpoint for fees
    const { data: feeData, isLoading } = useSWR('/api/my-fees/', fetcher);

    if (isLoading || !feeData) return <Typography>Loading fee status...</Typography>;

    return (
        <Paper elevation={4} sx={{ p: 3, borderRadius: 4, background: 'linear-gradient(135deg, #424242, #212121)' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white', mb: 2 }}>
                Fee Status
            </Typography>
            <Typography variant="h4" sx={{ color: feeData.balance_due > 0 ? 'error.light' : 'success.light' }}>
                ₹{feeData.balance_due}
            </Typography>
            <Typography variant="body1" color="text.secondary">
                Balance Due
            </Typography>
            {feeData.due_date && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Next due date: {new Date(feeData.due_date).toLocaleDateString()}
                </Typography>
            )}
        </Paper>
    );
}