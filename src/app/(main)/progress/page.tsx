'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Box, Typography, Grid, Paper, CircularProgress, Alert, Stack, Button, Tabs, Tab, useTheme, Divider, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { motion } from 'framer-motion';

// --- Icon Imports ---
import ShowChartIcon from '@mui/icons-material/ShowChart';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

// --- Reusable Components ---
const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', borderRadius: 4, height: '100%', bgcolor: 'background.paper' }}>
        {icon}
        <Box ml={2}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{value}</Typography>
            <Typography color="text.secondary">{title}</Typography>
        </Box>
    </Paper>
);

const TopicFeedbackItem = ({ topic, isStrength }: { topic: any, isStrength: boolean }) => {
    const router = useRouter();
    const { setTopicId } = useAppContext();
    const handlePractice = () => {
        const topicId = topic.question__topic__id;
        if (topicId) {
            setTopicId(topicId.toString());
            router.push(`/quiz?topic_id=${topicId}&limit=10`);
        }
    };
    return (
        <Paper variant="outlined" sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 2 }}>
            <Box>
                <Typography sx={{fontWeight: 'bold'}}>{topic.question__topic__name}</Typography>
                <Typography variant="body2" color={isStrength ? 'success.main' : 'error.main'}>
                    {isStrength ? `Accuracy: ${topic.accuracy.toFixed(0)}%` : `Marks Lost: ${topic.marks_lost.toFixed(2)}`}
                </Typography>
            </Box>
            {!isStrength && <Button size="small" onClick={handlePractice}>Practice</Button>}
        </Paper>
    );
};

// --- Main Page Component ---
export default function ProgressPage() {
    const { fetcher } = useAppContext();
    const router = useRouter();
    const { data, error, isLoading } = useSWR('/my-progress-dashboard/', fetcher);
    const [tabIndex, setTabIndex] = useState(0);
    const theme = useTheme();

    if (isLoading) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;
    if (error) return <Alert severity="error">Could not load progress data.</Alert>;
    if (!data || data.message) {
        return (
            <Alert severity="info" action={<Button onClick={() => router.push('/profile')}>Set Focus Exam</Button>}>
                {data?.message || "Set a focus exam in your profile to see personalized feedback."}
            </Alert>
        );
    }

    const { overall_stats, topic_performance, exam_performance, strongest_topics, weakest_topics, target_exam_name } = data;
    const overallData = [{ name: 'Correct', value: overall_stats.correct }, { name: 'Wrong', value: overall_stats.wrong }];
    const COLORS = [theme.palette.success.light, theme.palette.error.light];

    return (
        <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>Your Performance Report</Typography>
                    <Typography variant="h6" sx={{ color: 'text.secondary' }}>Analysis for: {target_exam_name}</Typography>
                </Box>
                <Button variant="outlined" onClick={() => router.push('/profile')}>Change Focus Exam</Button>
            </Box>
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid xs={12} sm={6} md={3}><StatCard title="Net Marks" value={overall_stats.net_marks} icon={<GpsFixedIcon color="primary" sx={{ fontSize: 40 }} />} /></Grid>
                <Grid xs={12} sm={6} md={3}><StatCard title="Accuracy" value={`${overall_stats.accuracy.toFixed(1)}%`} icon={<ShowChartIcon color="primary" sx={{ fontSize: 40 }} />} /></Grid>
                <Grid xs={12} sm={6} md={3}><StatCard title="Correct" value={overall_stats.correct} icon={<CheckCircleOutlineIcon color="success" sx={{ fontSize: 40 }} />} /></Grid>
                <Grid xs={12} sm={6} md={3}><StatCard title="Wrong" value={overall_stats.wrong} icon={<CancelOutlinedIcon color="error" sx={{ fontSize: 40 }} />} /></Grid>
            </Grid>

            <Paper sx={{p: 3, borderRadius: 4, bgcolor: 'background.paper', mb: 4}}>
                <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>Your Personalized Study Plan</Typography>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" sx={{display: 'flex', alignItems: 'center', mb: 2}}><LightbulbIcon color="warning" sx={{mr: 1}}/> Focus On These Topics</Typography>
                        <Stack spacing={1.5}>
                             {weakest_topics.length > 0 ? weakest_topics.map((topic: any) => <TopicFeedbackItem key={topic.question__topic__name} topic={topic} isStrength={false} />) : <Typography color="text.secondary" sx={{pl:1}}>Great job! No specific weak areas found.</Typography>}
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" sx={{display: 'flex', alignItems: 'center', mb: 2}}><FitnessCenterIcon color="success" sx={{mr: 1}}/> Your Strengths</Typography>
                        <Stack spacing={1.5}>
                            {strongest_topics.map((topic: any) => <TopicFeedbackItem key={topic.question__topic__name} topic={topic} isStrength={true} />)}
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>

            <Paper sx={{ p: 3, borderRadius: 4, height: '500px', bgcolor: 'background.paper' }}>
                <Tabs value={tabIndex} onChange={(e, newValue) => setTabIndex(newValue)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label="Performance by Topic" />
                    <Tab label="Performance by Exam" />
                </Tabs>
                {tabIndex === 0 && (
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={topic_performance} layout="vertical" margin={{ left: 100 }}>
                            <XAxis type="number" stroke={theme.palette.text.secondary} domain={[0, 100]} unit="%" />
                            <YAxis dataKey="question__topic__name" type="category" stroke={theme.palette.text.secondary} width={120} tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '8px' }} formatter={(value: number) => [`${value.toFixed(1)}%`, 'Accuracy']} />
                            <Bar dataKey="accuracy" fill={theme.palette.primary.light} barSize={15} radius={[0, 5, 5, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
                {tabIndex === 1 && (
                    <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={exam_performance} layout="vertical" margin={{ left: 100 }}>
                            <XAxis type="number" stroke={theme.palette.text.secondary} domain={[0, 100]} unit="%" />
                            <YAxis dataKey="question__exam__name" type="category" stroke={theme.palette.text.secondary} width={120} tick={{ fontSize: 12 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '8px' }} formatter={(value: number) => [`${value.toFixed(1)}%`, 'Accuracy']} />
                            <Bar dataKey="accuracy" fill={theme.palette.secondary.main} barSize={15} radius={[0, 5, 5, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </Paper>
        </motion.div>
    );
}