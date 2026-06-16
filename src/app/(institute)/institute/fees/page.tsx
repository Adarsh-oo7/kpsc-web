'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import {
  Box, Typography, Grid, Card, CardContent, CircularProgress, Alert, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, InputAdornment, IconButton, Tooltip, Stack, Chip, Avatar, Button
} from '@mui/material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import SearchIcon from '@mui/icons-material/Search';
import PaymentsIcon from '@mui/icons-material/Payments';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useAppContext } from '@/context/AppContext';

export default function GeneralFeesDashboard() {
  const { fetcher } = useAppContext();
  const router = useRouter();
  
  // Fetch the list of all students under this institute
  const { data: students, error, isLoading } = useSWR('/institute/students/', fetcher);
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate aggregated stats
  const stats = useMemo(() => {
    if (!students || students.length === 0) {
      return { totalAssigned: 0, totalPaid: 0, totalOutstanding: 0 };
    }
    
    return students.reduce((acc: any, student: any) => {
      const feeStatus = student.fee_status;
      if (feeStatus) {
        acc.totalAssigned += Number(feeStatus.total_fees || 0);
        acc.totalPaid += Number(feeStatus.amount_paid || 0);
        acc.totalOutstanding += Number(feeStatus.balance_due || 0);
      }
      return acc;
    }, { totalAssigned: 0, totalPaid: 0, totalOutstanding: 0 });
  }, [students]);

  // Filter students by search query
  const filteredStudents = useMemo(() => {
    if (!students) return [];
    if (!searchQuery.trim()) return students;
    return students.filter((profile: any) =>
      profile.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]);

  if (isLoading) return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />;
  if (error) return <Alert severity="error">Failed to load students fee details.</Alert>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
          Fee Management
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'grey.300' }}>
          Track tuition dues, process offline payments, and manage invoices across all students.
        </Typography>
      </Box>

      {/* KPI Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ background: '#161B22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#8892A4', textTransform: 'uppercase' }}>
                  Total Fees Assigned
                </Typography>
                <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'rgba(139,92,246,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AttachMoneyIcon sx={{ color: '#8B5CF6' }} />
                </Box>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#F0F4F8' }}>
                ₹{stats.totalAssigned.toLocaleString('en-IN')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ background: '#161B22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#8892A4', textTransform: 'uppercase' }}>
                  Total Collected
                </Typography>
                <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'rgba(46,139,87,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircleOutlineIcon sx={{ color: '#2E8B57' }} />
                </Box>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#F0F4F8' }}>
                ₹{stats.totalPaid.toLocaleString('en-IN')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ background: '#161B22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#8892A4', textTransform: 'uppercase' }}>
                  Outstanding Dues
                </Typography>
                <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ErrorOutlineIcon sx={{ color: '#EF4444' }} />
                </Box>
              </Stack>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#F0F4F8' }}>
                ₹{stats.totalOutstanding.toLocaleString('en-IN')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search Input */}
      <Paper sx={{ p: 2, mb: 4, borderRadius: 4, bgcolor: 'background.paper' }}>
        <TextField
          fullWidth
          placeholder="Search students by name or username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'grey.500' }} />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Students Fee Table */}
      <Paper sx={{ borderRadius: 4, bgcolor: 'background.paper', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Student</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Total Dues</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Paid Amount</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Remaining Balance</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((profile: any) => {
                  const balance = Number(profile.fee_status?.balance_due || 0);
                  const total = Number(profile.fee_status?.total_fees || 0);
                  const paid = Number(profile.fee_status?.amount_paid || 0);
                  
                  let statusColor: 'success' | 'error' | 'warning' | 'default' = 'default';
                  let statusLabel = 'Not Assigned';
                  
                  if (total > 0) {
                    if (balance <= 0) {
                      statusColor = 'success';
                      statusLabel = 'Paid';
                    } else if (paid > 0) {
                      statusColor = 'warning';
                      statusLabel = 'Partial';
                    } else {
                      statusColor = 'error';
                      statusLabel = 'Unpaid';
                    }
                  }

                  return (
                    <TableRow key={profile.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar src={profile.profile_photo || ''} sx={{ width: 40, height: 40 }} />
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'white' }}>
                              {profile.user.full_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              @{profile.user.username}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ color: 'white' }}>₹{total.toLocaleString('en-IN')}</TableCell>
                      <TableCell sx={{ color: '#2E8B57' }}>₹{paid.toLocaleString('en-IN')}</TableCell>
                      <TableCell sx={{ color: balance > 0 ? '#EF4444' : 'grey.400' }}>
                        ₹{balance.toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell>
                        <Chip label={statusLabel} color={statusColor} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Manage Student Fees">
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<PaymentsIcon />}
                            onClick={() => router.push(`/institute/students/${profile.id}/fees`)}
                          >
                            Manage
                          </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">
                      No students found matching the filter.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </motion.div>
  );
}
