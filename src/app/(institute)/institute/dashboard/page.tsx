'use client';

import { useMemo, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Box, Typography, Grid, Button, CircularProgress, Card, CardContent, Stack, Alert, Chip,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import GroupsIcon from '@mui/icons-material/Groups';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CampaignIcon from '@mui/icons-material/Campaign';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import { useAppContext } from '@/context/AppContext';

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
  const { data: studentsRaw, isLoading: studentsLoading, error: studentsError } = useSWR('/institute/students/', fetcher);
  const { data: batchesRaw, error: batchesError } = useSWR('/institute/batches/', fetcher);
  const { data: questionsRaw } = useSWR('/institute/questions/', fetcher);
  const { data: requestsRaw } = useSWR('/institute/join-requests/', fetcher);
  const { data: notesRaw } = useSWR('/institute/notes/', fetcher);

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

  return (
    <Box sx={{ maxWidth: 1080, mx: 'auto', pb: 6 }}>
      <Box
        sx={{
          mb: 3.5,
          p: { xs: 2.5, md: 3.5 },
          borderRadius: '24px',
          background: `linear-gradient(165deg, ${GREEN} 0%, #166534 55%, #134E2A 100%)`,
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#FCD34D', mb: 1 }}>
          Academy portal
        </Typography>
        <Typography sx={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 900, fontSize: { xs: '1.7rem', md: '2.1rem' }, letterSpacing: '-0.03em' }}>
          {academyTitle}
        </Typography>
        <Typography sx={{ mt: 1, color: 'rgba(255,255,255,0.86)', maxWidth: 560, lineHeight: 1.55 }}>
          Students, batches, fees, and notes for this coaching centre. Numbers here are live from your academy — not sample data.
        </Typography>
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
              <KpiCard title="Students" value={String(students.length)} label="On this academy" icon={<PeopleIcon sx={{ color: GREEN }} />} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard title="Batches" value={String(batches.length)} label={`${notes.length} notes uploaded`} icon={<GroupsIcon sx={{ color: '#8B5CF6' }} />} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard title="Fees due" value={rupees(feeStats.due)} label={`${feeStats.pendingCount} student${feeStats.pendingCount === 1 ? '' : 's'} pending`} icon={<AttachMoneyIcon sx={{ color: '#EF4444' }} />} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <KpiCard title="Join requests" value={String(requests.length)} label={`${questions.length} academy questions`} icon={<PersonSearchIcon sx={{ color: '#F59E0B' }} />} />
            </Grid>
          </Grid>

          <Card elevation={0} sx={{ border: '1.5px solid', borderColor: 'divider', borderRadius: '20px', mb: 3.5 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography sx={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, mb: 2 }}>
                Daily work
              </Typography>
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <ActionButton icon={<PersonAddIcon />} label="Add student" onClick={() => router.push('/institute/students')} />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <ActionButton icon={<CampaignIcon />} label="Message class" onClick={() => router.push('/institute/messaging')} />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <ActionButton icon={<AssignmentIcon />} label="Questions" onClick={() => router.push('/institute/questions')} />
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <ActionButton icon={<NoteAddIcon />} label="Upload notes" onClick={() => router.push('/institute/notes')} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 7 }}>
              <Card elevation={0} sx={{ border: '1.5px solid', borderColor: 'divider', borderRadius: '20px', height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography sx={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, mb: 2 }}>
                    Batches
                  </Typography>
                  {batches.length === 0 ? (
                    <Box sx={{ py: 3 }}>
                      <Typography sx={{ color: 'text.secondary', mb: 2 }}>No batches yet. Create one, then add students to it.</Typography>
                      <Button variant="contained" onClick={() => router.push('/institute/batches')} sx={{ textTransform: 'none', fontWeight: 800, background: `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})` }}>
                        Create a batch
                      </Button>
                    </Box>
                  ) : (
                    <Stack spacing={1.25}>
                      {batches.slice(0, 8).map((batch: any) => (
                        <Box
                          key={batch.id}
                          onClick={() => router.push(`/institute/batches/${batch.id}`)}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 1.5,
                            borderRadius: '12px',
                            border: '1px solid',
                            borderColor: 'divider',
                            cursor: 'pointer',
                            '&:hover': { borderColor: GREEN_LIGHT },
                          }}
                        >
                          <Box>
                            <Typography sx={{ fontWeight: 800 }}>{batch.name}</Typography>
                            <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{batch.description || 'No description'}</Typography>
                          </Box>
                          <Chip label={`${batch.student_count || 0} students`} size="small" sx={{ fontWeight: 800 }} />
                        </Box>
                      ))}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Card elevation={0} sx={{ border: '1.5px solid', borderColor: 'divider', borderRadius: '20px', height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography sx={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 800, mb: 2 }}>
                    Waiting to join
                  </Typography>
                  {requests.length === 0 ? (
                    <Typography sx={{ color: 'text.secondary' }}>
                      No pending requests. Students can ask to join from the public Institutes page.
                    </Typography>
                  ) : (
                    <Stack spacing={1.25}>
                      {requests.slice(0, 6).map((req: any) => (
                        <Box key={req.id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, p: 1.25, borderRadius: '12px', bgcolor: 'action.hover' }}>
                          <Box>
                            <Typography sx={{ fontWeight: 800 }}>{req.user?.username || 'Student'}</Typography>
                            <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{req.user?.email}</Typography>
                          </Box>
                          <Button size="small" onClick={() => router.push('/institute/requests')} sx={{ textTransform: 'none', fontWeight: 800 }}>
                            Review
                          </Button>
                        </Box>
                      ))}
                    </Stack>
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
        py: 1.4,
        borderRadius: '12px',
        textTransform: 'none',
        fontWeight: 800,
        fontSize: '0.82rem',
        color: 'text.primary',
        borderColor: 'divider',
      }}
    >
      {label}
    </Button>
  );
}
