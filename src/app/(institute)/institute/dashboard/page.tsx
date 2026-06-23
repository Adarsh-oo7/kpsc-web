'use client';

import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Box, Typography, Grid, Button, CircularProgress, Card, CardContent, Stack, Divider
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import GradeIcon from '@mui/icons-material/Grade';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CampaignIcon from '@mui/icons-material/Campaign';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { useAppContext } from '@/context/AppContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function InstituteDashboard() {
  const router = useRouter();
  const { fetcher, user } = useAppContext();

  // Fetch stats (safely falling back to local mocks if endpoints are empty)
  const { data: students, isLoading: studentsLoading } = useSWR('/api/institute/students/', fetcher, { fallbackData: [] });
  const { data: questions, isLoading: questionsLoading } = useSWR('/api/institute/questions/', fetcher, { fallbackData: [] });

  const chartData = {
    labels: ['Batch A', 'Batch B', 'Batch C', 'Batch D'],
    datasets: [{
      label: 'Average Score %',
      data: [78, 65, 88, 72],
      backgroundColor: 'rgba(46, 139, 87, 0.75)',
      borderColor: '#2E8B57',
      borderWidth: 1,
      borderRadius: 6
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#8892A4' } },
      x: { grid: { display: false }, ticks: { color: '#8892A4' } }
    }
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto', pb: 6 }}>
      {/* Title */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: '0.8rem', color: '#2E8B57', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Institute SaaS Portal 🏢
        </Typography>
        <Typography variant="h4" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, color: '#F0F4F8', mt: 0.5 }}>
          Admin Overview
        </Typography>
        <Typography sx={{ color: '#8892A4', fontSize: '0.9rem', mt: 0.5 }}>
          Manage student databases, publish mock tests, upload PDFs, and check fee status payments.
        </Typography>
      </Box>

      {/* 4-Card KPI Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Total Students"
            value={students?.length || 148}
            label="+3 this week"
            icon={<PeopleIcon sx={{ color: '#2E8B57' }} />}
            bgColor="rgba(46,139,87,0.1)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Active Today"
            value={12}
            label="Live on App"
            icon={<SchoolIcon sx={{ color: '#8B5CF6' }} />}
            bgColor="rgba(139,92,246,0.1)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Fees Due"
            value="₹24,500"
            label="8 students pending"
            icon={<AttachMoneyIcon sx={{ color: '#EF4444' }} />}
            bgColor="rgba(239,68,68,0.1)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard
            title="Top Mock Score"
            value="96/100"
            label="Rahul, Batch C"
            icon={<GradeIcon sx={{ color: '#F59E0B' }} />}
            bgColor="rgba(245,158,11,0.1)"
          />
        </Grid>
      </Grid>

      {/* Quick Action Bar */}
      <Card sx={{ background: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '20px', mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="subtitle2" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, color: '#F0F4F8', mb: 2 }}>
            Management Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <ActionButton icon={<PersonAddIcon />} label="Add Student" onClick={() => router.push('/institute/students')} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <ActionButton icon={<CampaignIcon />} label="Broadcast" onClick={() => router.push('/institute/messaging')} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <ActionButton icon={<AssignmentIcon />} label="Questions" onClick={() => router.push('/institute/questions')} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <ActionButton icon={<NoteAddIcon />} label="Upload PDF" onClick={() => router.push('/institute/notes')} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Chart + Feed Row */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ background: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '20px', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, color: '#F0F4F8', mb: 2.5 }}>
                Batch Performance Comparison
              </Typography>
              <Box sx={{ height: 250 }}>
                <Bar data={chartData} options={chartOptions} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ background: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '20px', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, color: '#F0F4F8', mb: 2 }}>
                Real-Time Student Activity
              </Typography>
              <Stack spacing={2} sx={{ mt: 1.5 }}>
                <ActivityItem text="Anisha just joined Batch B database" time="2 mins ago" />
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.04)' }} />
                <ActivityItem text="Fee payment of ₹3,500 registered from Amal" time="15 mins ago" />
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.04)' }} />
                <ActivityItem text="Vipin completed LDC Mock test #3" time="1 hour ago" />
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.04)' }} />
                <ActivityItem text="Batch C uploaded geography renaissance note" time="3 hours ago" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

function KpiCard({ title, value, label, icon, bgColor }: any) {
  return (
    <Card sx={{ background: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '20px', height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#8892A4', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </Typography>
          <Box sx={{
            width: 36, height: 36, borderRadius: '10px',
            bgcolor: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {icon}
          </Box>
        </Stack>
        <Typography variant="h4" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, color: '#F0F4F8' }}>
          {value}
        </Typography>
        <Typography sx={{ fontSize: '0.7rem', color: '#8892A4', mt: 0.5 }}>
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

function ActionButton({ icon, label, onClick }: any) {
  return (
    <Button
      fullWidth
      variant="outlined"
      onClick={onClick}
      startIcon={icon}
      sx={{
        py: 1.5,
        borderRadius: '12px',
        textTransform: 'none',
        fontWeight: 700,
        fontSize: '0.8rem',
        color: '#F0F4F8',
        borderColor: 'rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.01)',
        '&:hover': {
          borderColor: 'rgba(255,255,255,0.2)',
          background: 'rgba(255,255,255,0.03)'
        }
      }}
    >
      {label}
    </Button>
  );
}

function ActivityItem({ text, time }: any) {
  return (
    <Box>
      <Typography sx={{ fontSize: '0.8rem', color: '#F0F4F8', fontWeight: 500 }}>
        {text}
      </Typography>
      <Typography sx={{ fontSize: '0.65rem', color: '#8892A4', mt: 0.25, fontFamily: "'JetBrains Mono'" }}>
        {time}
      </Typography>
    </Box>
  );
}