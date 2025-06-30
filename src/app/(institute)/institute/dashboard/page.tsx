// app/(institute)/institute/dashboard/page.tsx

'use client';

import { Box, Typography, Grid, Paper, Button, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

// --- CORRECTED: Added necessary icon imports ---
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';

const fetcher = async (url: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('Not authenticated');
    const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${url}`;
    const res = await fetch(fullUrl, { 
        headers: { Authorization: `Bearer ${token}` } 
    });
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
};

// Reusable stat card for the dashboard
const StatCard = ({ title, value, icon }: any) => (
    <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', borderRadius: 4, height: '100%' }}>
        {icon}
        <Box ml={2}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{value}</Typography>
            <Typography color="text.secondary">{title}</Typography>
        </Box>
    </Paper>
);

export default function InstituteDashboard() {
    const router = useRouter();

    // Fetch stats for the dashboard
    const { data: students, isLoading: studentsLoading } = useSWR('/api/institute/students/', fetcher);
    const { data: questions, isLoading: questionsLoading } = useSWR('/api/institute/questions/', fetcher);

    return (
        <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, color: 'white' }}>
                Institute Dashboard
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <StatCard 
                        title="Total Students" 
                        value={studentsLoading ? <CircularProgress size={24} /> : students?.length || 0} 
                        icon={<PeopleIcon color="primary" sx={{ fontSize: 40 }} />} 
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <StatCard 
                        title="Custom Questions" 
                        value={questionsLoading ? <CircularProgress size={24} /> : questions?.length || 0} 
                        icon={<SchoolIcon color="primary" sx={{ fontSize: 40 }} />} 
                    />
                </Grid>
                {/* You can add more stat cards here for Topics, Messages, etc. */}
            </Grid>
            
            <Box mt={4}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'white' }}>
                    Quick Actions
                </Typography>
                <Grid container spacing={2}>
                    <Grid item>
                        <Button variant="contained" size="large" onClick={() => router.push('/institute/students')}>Manage Students</Button>
                    </Grid>
                     <Grid item>
                        <Button variant="contained" size="large" onClick={() => router.push('/institute/questions')}>Manage Questions</Button>
                    </Grid>
                    <Grid item>
                        <Button variant="contained" size="large" onClick={() => router.push('/institute/customization')}>Customize Page</Button>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}