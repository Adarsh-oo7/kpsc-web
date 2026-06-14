'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Box, Typography, CircularProgress, Stack, Grid, Card, CardContent, LinearProgress, Tooltip, Chip, Button, useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip as ChartTooltip, Legend, Filler
} from 'chart.js';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import BarChartIcon from '@mui/icons-material/BarChart';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import { useAppContext } from '@/context/AppContext';

// Register Chart.js components
ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, ChartTooltip, Legend, Filler
);

export default function AnalyticsPage() {
  const { user, fetcher, profile, isLoading: ctxLoading } = useAppContext();
  const router = useRouter();
  const theme = useTheme();

  useEffect(() => {
    if (!ctxLoading && !user) router.push('/login');
  }, [user, ctxLoading, router]);

  // Fetch progress dashboard stats
  const { data: dashData, error, isLoading } = useSWR(
    user ? '/my-progress-dashboard/' : null,
    fetcher
  );

  const stats = dashData?.overall_stats || { total_answered: 0, correct: 0, wrong: 0, accuracy: 0, net_marks: 0 };
  const topicPerformance = dashData?.topic_performance || [];
  const weakestTopics = dashData?.weakest_topics || [];
  const strongestTopics = dashData?.strongest_topics || [];
  const heatmapData = dashData?.heatmap_data || [];
  const badges = dashData?.badges || [];

  // 1. Accuracy Line Chart Data (based on recent answer history or daily averages)
  const lineChartData = useMemo(() => {
    const dates = heatmapData.slice(-10).map((h: any) => {
      const parts = h.date.split('-');
      return `${parts[2]}/${parts[1]}`;
    });
    const counts = heatmapData.slice(-10).map((h: any) => h.count);

    return {
      labels: dates.length > 0 ? dates : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Questions Answered',
        data: counts.length > 0 ? counts : [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#2E8B57',
        backgroundColor: 'rgba(46, 139, 87, 0.12)',
        tension: 0.4,
        fill: true,
      }]
    };
  }, [heatmapData]);

  // 2. Bar Chart Data (Subject Accuracy)
  const barChartData = useMemo(() => {
    const labels = topicPerformance.map((t: any) => t.question__topic__name || 'General');
    const accuracies = topicPerformance.map((t: any) => Math.round(t.accuracy));

    return {
      labels: labels.length > 0 ? labels : ['Kerala History', 'Geography', 'Polity', 'Science', 'Current Affairs'],
      datasets: [{
        label: 'Accuracy %',
        data: accuracies.length > 0 ? accuracies : [0, 0, 0, 0, 0],
        backgroundColor: 'rgba(245, 158, 11, 0.75)',
        borderColor: '#F59E0B',
        borderWidth: 1,
        borderRadius: 8
      }]
    };
  }, [topicPerformance]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: theme.palette.divider },
        ticks: { color: theme.palette.text.secondary, font: { family: 'Satoshi' } }
      },
      x: {
        grid: { display: false },
        ticks: { color: theme.palette.text.secondary, font: { family: 'Satoshi' } }
      }
    }
  }), [theme]);

  const getHeatmapColor = (count: number) => {
    if (count === 0) return theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)';
    if (count <= 3) return 'rgba(46, 139, 87, 0.25)';
    if (count <= 10) return 'rgba(46, 139, 87, 0.55)';
    return '#1B6B3A'; // Forest Green primary
  };

  if (ctxLoading || isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={32} sx={{ color: '#2E8B57' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', pb: 6 }}>
      {/* Title */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: '0.8rem', color: 'secondary.main', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Personal Analytics 📊
        </Typography>
        <Typography variant="h4" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, color: 'text.primary', mt: 0.5 }}>
          My Performance Report
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', mt: 0.5 }}>
          Real-time insights on your exam syllabus coverage and learning velocity.
        </Typography>
      </Box>

      {/* Main KPI Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Readiness gauge */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ bgcolor: 'background.paper', borderColor: 'divider', borderRadius: '20px', height: '100%' }}>
            <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: 'text.secondary', letterSpacing: '0.04em', textTransform: 'uppercase', mb: 2 }}>
                PSC Readiness Score
              </Typography>
              
              <Box sx={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
                <CircularProgress
                  variant="determinate"
                  value={100}
                  size={120}
                  thickness={5}
                  sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', position: 'absolute' }}
                />
                <CircularProgress
                  variant="determinate"
                  value={stats.accuracy}
                  size={120}
                  thickness={5}
                  sx={{
                    color: '#2E8B57',
                    strokeLinecap: 'round',
                    animation: 'progressGrow 1.5s ease-out',
                    position: 'absolute',
                  }}
                />
                <Box sx={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h4" sx={{ fontFamily: "'JetBrains Mono'", fontWeight: 900, color: 'text.primary' }}>
                    {Math.round(stats.accuracy)}%
                  </Typography>
                  <Typography sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>Target: 80%</Typography>
                </Box>
              </Box>

              <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', mt: 1 }}>
                Based on {stats.total_answered} questions answered.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Highlight Stats */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Grid container spacing={2} sx={{ height: '100%' }}>
            <Grid size={{ xs: 6, sm: 4 }}>
              <KpiCard title="Total Answers" value={stats.total_answered} label="Practice Questions" color="#F0F4F8" />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <KpiCard title="Correct" value={stats.correct} label="XP Earned" color="#22c55e" />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <KpiCard title="Accuracy" value={`${Math.round(stats.accuracy)}%`} label="Target > 75%" color="#F59E0B" />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <KpiCard title="Net Score" value={stats.net_marks} label="PSC Scheme Penalty" color="#a78bfa" />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <KpiCard title="Streak" value={`${profile?.current_streak || 0}d`} label="Active Habit" color="#FF6B2B" />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <KpiCard title="Level" value={profile?.level || 1} label="Beginner to Master" color="#8B5CF6" />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Weakest Subject Action Card */}
      {weakestTopics.length > 0 && (
        <Box sx={{
          p: 3,
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '20px',
          mb: 4,
          display: 'flex', flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2
        }}>
          <Box>
            <Typography sx={{ fontWeight: 800, color: '#EF4444', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 1 }}>
              ⚠️ Focus Alert — {weakestTopics[0].question__topic__name} needs work
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', mt: 0.5 }}>
              Your accuracy in this subject is only {Math.round(weakestTopics[0].accuracy)}%. Focused review can save you up to {Math.round(weakestTopics[0].marks_lost)} marks in the official exam.
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => router.push('/feed')}
            sx={{
              background: '#EF4444',
              '&:hover': { background: '#dc2626' },
              textTransform: 'none', fontWeight: 700, borderRadius: '10px', flexShrink: 0
            }}
          >
            Review Weak Topics
          </Button>
        </Box>
      )}

      {/* Charts Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: 'background.paper', borderColor: 'divider', borderRadius: '20px' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, color: 'text.primary', mb: 2 }}>
                Learning Velocity (Last 10 Days)
              </Typography>
              <Box sx={{ height: 220 }}>
                <Line data={lineChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ bgcolor: 'background.paper', borderColor: 'divider', borderRadius: '20px' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, color: 'text.primary', mb: 2 }}>
                Subject Performance Accuracy
              </Typography>
              <Box sx={{ height: 220 }}>
                <Bar data={barChartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* GitHub Style Streak Heatmap */}
      <Card sx={{ bgcolor: 'background.paper', borderColor: 'divider', borderRadius: '20px', mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <LocalFireDepartmentIcon sx={{ color: '#FF6B2B' }} />
            <Typography variant="subtitle2" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, color: 'text.primary' }}>
              Study Consistency Heatmap
            </Typography>
          </Stack>
          
          <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', mb: 3 }}>
            Your daily study activity over the last 30 days. Shaded green blocks show days you answered questions.
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
            {heatmapData.map((day: any) => (
              <Tooltip key={day.date} title={`${day.date}: ${day.count} answers`}>
                <Box sx={{
                  width: 14, height: 14,
                  bgcolor: getHeatmapColor(day.count),
                  borderRadius: '3px',
                  transition: 'background-color 0.2s',
                  '&:hover': { opacity: 0.8 }
                }} />
              </Tooltip>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Badges showcase */}
      {badges.length > 0 && (
        <Card sx={{ bgcolor: 'background.paper', borderColor: 'divider', borderRadius: '20px' }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
              <WorkspacePremiumIcon sx={{ color: '#8B5CF6' }} />
              <Typography variant="subtitle2" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, color: 'text.primary' }}>
                Aspirant Achievements
              </Typography>
            </Stack>

            <Grid container spacing={2}>
              {badges.map((badge: any) => (
                <Grid size={{ xs: 6, sm: 3 }} key={badge.id}>
                  <Box sx={{
                    p: 2,
                    bgcolor: 'surface.card',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '16px',
                    textAlign: 'center',
                    opacity: badge.earned ? 1 : 0.35,
                    filter: badge.earned ? 'none' : 'grayscale(100%)',
                    transition: 'all 0.3s ease'
                  }}>
                    <Typography sx={{ fontSize: '2rem', mb: 1 }}>{badge.icon}</Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', color: 'text.primary' }}>
                      {badge.name}
                    </Typography>
                    <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', mt: 0.5 }}>
                      {badge.description}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

function KpiCard({ title, value, label, color }: { title: string; value: any; label: string; color: string }) {
  return (
    <Card sx={{ bgcolor: 'surface.card', borderColor: 'divider', borderRadius: '16px', height: '100%' }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </Typography>
        <Typography variant="h5" sx={{ fontFamily: "'JetBrains Mono'", fontWeight: 900, color, my: 0.5 }}>
          {value}
        </Typography>
        <Typography sx={{ fontSize: '0.6rem', color: 'text.disabled' }}>
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}