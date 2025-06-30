'use client';

import { Box, Typography, CircularProgress } from '@mui/material';
import useSWR from 'swr';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { useMemo } from 'react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const fetcher = async (url: string) => {
  const token = localStorage.getItem('access_token');
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
};

export default function Analytics() {
  const { data: progress, error, isLoading } = useSWR<
    { quizzes_completed: number; total_score: number; total_questions: number }
  >(`${process.env.NEXT_PUBLIC_API_URL}/user/progress/`, fetcher);

  // Memoize chart data to prevent unnecessary re-renders
  const barChartData = useMemo(() => ({
    labels: ['Quizzes Completed', 'Total Score', 'Accuracy (%)'],
    datasets: [{
      label: 'Your Performance',
      data: [
        progress?.quizzes_completed ?? 0,
        progress?.total_score ?? 0,
        progress?.total_questions ? (progress.total_score / progress.total_questions) * 100 : 0
      ],
      backgroundColor: ['#2196F3', '#4CAF50', '#FFC107'],
      borderColor: ['#1976D2', '#388E3C', '#FFA000'],
      borderWidth: 1
    }]
  }), [progress]);

  const lineChartData = useMemo(() => ({
    labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
    datasets: [{
      label: 'Score',
      data: progress?.total_score ? [
        progress.total_score - 4,
        progress.total_score - 3,
        progress.total_score - 2,
        progress.total_score - 1,
        progress.total_score
      ] : [0, 0, 0, 0, 0],
      borderColor: '#2196F3',
      backgroundColor: 'rgba(33, 150, 243, 0.2)',
      fill: true
    }]
  }), [progress]);

  const chartOptions = {
    scales: {
      y: {
        beginAtZero: true
      }
    },
    maintainAspectRatio: false
  };

  if (isLoading) {
    return (
      <Box className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="p-6 bg-gray-50 min-h-screen">
        <Typography color="error">Failed to load analytics data</Typography>
      </Box>
    );
  }

  return (
    <Box className="p-6 bg-gray-50 min-h-screen">
      <Typography variant="h4" className="text-gray-800 font-bold mb-6">
        Analytics
      </Typography>
      {progress && (
        <>
          <Typography variant="body1" className="text-gray-600 mb-4">
            Performance Overview
          </Typography>
          <Box sx={{ height: '300px', mb: 6 }}>
            <Bar data={barChartData} options={chartOptions} />
          </Box>
          <Typography variant="body1" className="text-gray-600 mb-4">
            Progress Over Time
          </Typography>
          <Box sx={{ height: '300px' }}>
            <Line data={lineChartData} options={chartOptions} />
          </Box>
        </>
      )}
    </Box>
  );
}