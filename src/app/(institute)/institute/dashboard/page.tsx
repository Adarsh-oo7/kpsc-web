'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Box,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Alert,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import GroupsIcon from '@mui/icons-material/Groups';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CampaignIcon from '@mui/icons-material/Campaign';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import QuizIcon from '@mui/icons-material/Quiz';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import SchoolIcon from '@mui/icons-material/School';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';

const GREEN = '#1B6B3A';
const GREEN_LIGHT = '#2E8B57';

function asList(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function rupees(n: number) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
}

export default function InstituteDashboard() {
  const router = useRouter();
  const { fetcher, profile } = useAppContext();
  const instituteName = profile?.institute?.name;

  const { data: academy, error: academyError } = useSWR('/institute/my-institute/', fetcher);
  const {
    data: studentsRaw,
    isLoading: studentsLoading,
    error: studentsError,
    mutate: mutateStudents,
  } = useSWR('/institute/students/', fetcher);
  const { data: batchesRaw, error: batchesError } = useSWR('/institute/batches/', fetcher);
  const { data: questionsRaw } = useSWR('/institute/questions/', fetcher);
  const { data: requestsRaw, mutate: mutateRequests } = useSWR('/institute/join-requests/', fetcher);
  const { data: notesRaw } = useSWR('/institute/notes/', fetcher);

  const [copied, setCopied] = useState(false);
  const [processingReqId, setProcessingReqId] = useState<number | null>(null);

  const students = asList(studentsRaw);
  const batches = asList(batchesRaw);
  const questions = asList(questionsRaw);
  const requests = asList(requestsRaw);
  const notes = asList(notesRaw);
  const loading = studentsLoading && !studentsRaw;
  const loadError = academyError || studentsError || batchesError;

  const feeStats = useMemo(() => {
    return students.reduce(
      (acc, student: any) => {
        const fee = student.fee_status || {};
        acc.due += Number(fee.balance_due || 0);
        acc.paid += Number(fee.amount_paid || 0);
        if (Number(fee.balance_due || 0) > 0) acc.pendingCount += 1;
        return acc;
      },
      { due: 0, paid: 0, pendingCount: 0 },
    );
  }, [students]);

  const academyTitle = academy?.name || instituteName || 'Your academy';
  const academySlug = academy?.slug || profile?.institute?.slug || '';
  const primaryColor = academy?.primary_color || GREEN;
  const accentColor = academy?.accent_color || '#F59E0B';
  const studentPortalUrl = academySlug
    ? `https://www.kpscmaster.in/institute/${academySlug}`
    : '';

  const handleCopyPortalLink = () => {
    if (!studentPortalUrl) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(studentPortalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleQuickProcessRequest = async (reqId: number, action: 'approve' | 'decline') => {
    setProcessingReqId(reqId);
    try {
      await apiClient.post(`/institute/join-requests/${reqId}/${action}/`);
      await mutateRequests();
      await mutateStudents();
    } catch {
      alert(`Failed to ${action} join request.`);
    } finally {
      setProcessingReqId(null);
    }
  };

  return (
    <Box sx={{ maxWidth: 1080, mx: 'auto', pb: 6 }}>
      <Box
        sx={{
          mb: 3.5,
          p: { xs: 2.5, md: 3.5 },
          borderRadius: '24px',
          background: `linear-gradient(155deg, ${primaryColor} 0%, #0D1117 100%)`,
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2.5}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={academy?.logo || ''}
              alt={academyTitle}
              variant="rounded"
              sx={{
                width: 72,
                height: 72,
                borderRadius: '16px',
                bgcolor: 'rgba(255,255,255,0.14)',
                border: `2px solid ${accentColor}`,
              }}
            >
              <SchoolIcon sx={{ fontSize: 36 }} />
            </Avatar>
            <Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: accentColor, mb: 0.5 }}>
                Academy Admin Portal
              </Typography>
              <Typography sx={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 900, fontSize: { xs: '1.7rem', md: '2.1rem' }, letterSpacing: '-0.03em' }}>
                {academyTitle}
              </Typography>
              <Typography sx={{ mt: 0.5, color: 'rgba(255,255,255,0.86)', maxWidth: 560, lineHeight: 1.5, fontSize: '0.92rem' }}>
                {academy?.tagline || 'Manage students, test questions, join requests, leaderboard results, and batches.'}
              </Typography>
            </Box>
          </Stack>

          {studentPortalUrl && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: '16px',
                bgcolor: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                width: { xs: '100%', md: 'auto' },
                minWidth: { md: 340 },
              }}
            >
              <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: accentColor, mb: 0.75 }}>
                Shareable Student Login & Test Link
              </Typography>
              <Box
                sx={{
                  px: 1.25,
                  py: 0.75,
                  mb: 1.25,
                  borderRadius: '8px',
                  bgcolor: 'rgba(0,0,0,0.28)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: '0.78rem', sm: '0.82rem' },
                    fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: '#fff',
                    wordBreak: 'break-all',
                  }}
                >
                  {studentPortalUrl}
                </Typography>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  fullWidth
                  startIcon={<ContentCopyIcon sx={{ fontSize: '15px !important' }} />}
                  onClick={handleCopyPortalLink}
                  sx={{
                    bgcolor: accentColor,
                    color: '#091E42',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    textTransform: 'none',
                    borderRadius: '10px',
                    py: 0.75,
                    whiteSpace: 'nowrap',
                    '&:hover': { bgcolor: '#fbbf24' },
                  }}
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  fullWidth
                  endIcon={<OpenInNewIcon sx={{ fontSize: '15px !important' }} />}
                  onClick={() => router.push(`/institute/${academySlug}`)}
                  sx={{
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,0.4)',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    textTransform: 'none',
                    borderRadius: '10px',
                    py: 0.75,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Preview Portal
                </Button>
              </Box>
            </Paper>
          )}
        </Stack>
      </Box>

      {loadError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '14px' }}>
          Could not load academy data. Refresh, or log in again from Institute Login.
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: GREEN_LIGHT }} />
        </Box>
      ) : (
        <>
          <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard title="Students" value={String(students.length)} label="Enrolled in academy" icon={<PeopleIcon sx={{ color: GREEN }} />} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard title="Join requests" value={String(requests.length)} label="Waiting for approval" icon={<PersonSearchIcon sx={{ color: '#F59E0B' }} />} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard title="Test Questions" value={String(questions.length)} label="In academy question bank" icon={<AssignmentIcon sx={{ color: '#3B82F6' }} />} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard title="Batches & Fees" value={String(batches.length)} label={`Fees due: ${rupees(feeStats.due)}`} icon={<GroupsIcon sx={{ color: '#8B5CF6' }} />} />
            </Grid>
          </Grid>

          <Card elevation={0} sx={{ border: '1.5px solid', borderColor: 'divider', borderRadius: '20px', mb: 3.5 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, mb: 2 }}>
                Quick Actions
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 6, sm: 2.4 }}>
                  <ActionButton icon={<QuizIcon />} label="Mock Tests" onClick={() => router.push('/institute/mock-tests')} />
                </Grid>
                <Grid size={{ xs: 6, sm: 2.4 }}>
                  <ActionButton icon={<AssignmentIcon />} label="Add Questions" onClick={() => router.push('/institute/questions')} />
                </Grid>
                <Grid size={{ xs: 6, sm: 2.4 }}>
                  <ActionButton icon={<PersonAddIcon />} label="Students & Results" onClick={() => router.push('/institute/students')} />
                </Grid>
                <Grid size={{ xs: 6, sm: 2.4 }}>
                  <ActionButton icon={<PersonSearchIcon />} label={`Join Requests (${requests.length})`} onClick={() => router.push('/institute/requests')} />
                </Grid>
                <Grid size={{ xs: 6, sm: 2.4 }}>
                  <ActionButton icon={<NoteAddIcon />} label="Upload Notes" onClick={() => router.push('/institute/notes')} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
            {/* Pending Join Requests with 1-Click Approve/Decline */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Card elevation={0} sx={{ border: '1.5px solid', borderColor: 'divider', borderRadius: '20px', height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography sx={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800 }}>
                      Students Waiting to Join ({requests.length})
                    </Typography>
                    {requests.length > 0 && (
                      <Button size="small" onClick={() => router.push('/institute/requests')} sx={{ textTransform: 'none', fontWeight: 700 }}>
                        View all
                      </Button>
                    )}
                  </Stack>
                  {requests.length === 0 ? (
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.92rem' }}>
                      No pending join requests right now. Share your student portal link above so students can log in and request to join {academyTitle}.
                    </Typography>
                  ) : (
                    <Stack spacing={1.25}>
                      {requests.slice(0, 6).map((req: any) => (
                        <Box
                          key={req.id}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 1,
                            p: 1.5,
                            borderRadius: '12px',
                            bgcolor: 'action.hover',
                          }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 800 }} noWrap>
                              {req.user?.full_name || req.user?.username || 'Student'}
                            </Typography>
                            <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }} noWrap>
                              @{req.user?.username} • {req.user?.email}
                            </Typography>
                          </Box>
                          <Stack direction="row" spacing={0.75}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              disabled={processingReqId === req.id}
                              startIcon={<CheckIcon />}
                              onClick={() => handleQuickProcessRequest(req.id, 'approve')}
                              sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '8px' }}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              disabled={processingReqId === req.id}
                              onClick={() => handleQuickProcessRequest(req.id, 'decline')}
                              sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '8px', minWidth: 36, px: 1 }}
                            >
                              <CloseIcon fontSize="small" />
                            </Button>
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Student Leaderboard & Test Results Summary */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Card elevation={0} sx={{ border: '1.5px solid', borderColor: 'divider', borderRadius: '20px', height: '100%' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap spacing={1} sx={{ mb: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <EmojiEventsIcon sx={{ color: '#F59E0B' }} />
                      <Typography sx={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, fontSize: { xs: '0.98rem', sm: '1.08rem' } }}>
                        {academyTitle} — Student Leaderboard
                      </Typography>
                    </Stack>
                    <Button size="small" onClick={() => router.push('/institute/students')} sx={{ textTransform: 'none', fontWeight: 800, fontSize: '0.8rem' }}>
                      Detailed Results →
                    </Button>
                  </Stack>

                  <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary', mb: 2 }}>
                    Exclusive Academy Ranking: Computed strictly from tests and questions updated by {academyTitle} admin.
                  </Typography>

                  {students.length === 0 ? (
                    <Box sx={{ py: 2 }}>
                      <Typography sx={{ color: 'text.secondary', mb: 2 }}>
                        No students enrolled yet. Approve join requests or add students to track their test scores, accuracy, and leaderboard rank.
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={() => router.push('/institute/students')}
                        sx={{ textTransform: 'none', fontWeight: 800, background: `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})` }}
                      >
                        Add or Manage Students
                      </Button>
                    </Box>
                  ) : (
                    <TableContainer sx={{ overflowX: 'auto' }}>
                      <Table size="small" sx={{ minWidth: 500 }}>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 800 }}>Rank</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Student</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800 }}>Academy Score</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800 }}>Solved</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800 }}>Accuracy</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800 }}>Tests Attended</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {students.slice(0, 8).map((s: any, idx: number) => {
                            const st = s.performance_stats || {};
                            const rank = s.rank || idx + 1;
                            const academyScore = st.academy_score !== undefined && st.academy_score !== null
                              ? st.academy_score
                              : (st.net_marks ?? 0);
                            const solvedCount = st.academy_attempted || st.total_attempted || 0;
                            const accuracyPct = st.academy_accuracy !== undefined && (st.academy_attempted || 0) > 0
                              ? st.academy_accuracy
                              : (st.accuracy ?? 0);

                            return (
                              <TableRow
                                key={s.id}
                                hover
                                sx={{ cursor: 'pointer' }}
                                onClick={() => router.push('/institute/students')}
                              >
                                <TableCell sx={{ fontWeight: 900 }}>
                                  <Chip
                                    label={`#${rank}`}
                                    size="small"
                                    sx={{
                                      fontWeight: 900,
                                      bgcolor: rank === 1 ? '#FEF3C7' : rank === 2 ? '#E2E8F0' : rank === 3 ? '#FFEDD5' : 'action.hover',
                                      color: rank === 1 ? '#D97706' : rank === 2 ? '#475569' : rank === 3 ? '#C2410C' : 'text.primary',
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                    {s.user?.full_name || s.user?.username}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    @{s.user?.username}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 900, color: academyScore >= 0 ? '#1B6B3A' : '#DC2626', fontSize: '0.92rem' }}>
                                  {academyScore > 0 ? `+${academyScore}` : academyScore} pts
                                </TableCell>
                                <TableCell align="right">{solvedCount}</TableCell>
                                <TableCell align="right">
                                  <Chip
                                    label={`${accuracyPct}%`}
                                    size="small"
                                    color={accuracyPct >= 70 ? 'success' : accuracyPct >= 40 ? 'warning' : 'default'}
                                    variant="outlined"
                                    sx={{ fontWeight: 800 }}
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <Chip
                                    label={`${st.tests_attended ?? 0} tests`}
                                    size="small"
                                    color={(st.tests_attended ?? 0) > 0 ? 'primary' : 'default'}
                                    variant="outlined"
                                    sx={{ fontWeight: 800 }}
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
}

function KpiCard({ title, value, label, icon }: { title: string; value: string; label: string; icon: ReactNode }) {
  return (
    <Card elevation={0} sx={{ border: '1.5px solid', borderColor: 'divider', borderRadius: '20px', height: '100%' }}>
      <CardContent sx={{ p: 2.5 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {title}
          </Typography>
          <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'rgba(27,107,58,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {icon}
          </Box>
        </Stack>
        <Typography sx={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 900, fontSize: '1.55rem', color: 'text.primary' }}>
          {value}
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.5 }}>
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

function ActionButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <Button
      fullWidth
      variant="outlined"
      onClick={onClick}
      startIcon={icon}
      sx={{
        py: 1.25,
        px: { xs: 1.25, sm: 1.5 },
        borderRadius: '12px',
        textTransform: 'none',
        fontWeight: 700,
        fontSize: { xs: '0.78rem', sm: '0.84rem' },
        whiteSpace: 'nowrap',
        borderColor: 'divider',
        color: 'text.primary',
        justifyContent: 'flex-start',
        '&:hover': { borderColor: GREEN_LIGHT, bgcolor: 'rgba(46,139,87,0.06)' },
      }}
    >
      {label}
    </Button>
  );
}
