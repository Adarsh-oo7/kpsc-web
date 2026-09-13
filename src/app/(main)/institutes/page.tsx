'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
  Box, Typography, Button, CircularProgress, Alert, Paper, Grid, Avatar, Chip, Stack,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';

const GREEN = '#1B6B3A';
const GREEN_LIGHT = '#2E8B57';

export default function BrowseInstitutesPage() {
  const { profile, user, fetcher, refreshProfile } = useAppContext();
  const router = useRouter();
  const [requestStatus, setRequestStatus] = useState<{ [key: number]: 'sending' | 'sent' | 'error' }>({});
  const { data: institutes, error, isLoading } = useSWR('/institute/public/list/', fetcher);

  const list = (Array.isArray(institutes) ? institutes : institutes?.results || []).filter(
    (item: any) => (item?.name || '').trim() && !/^Institute \d+$/.test(item.name),
  );

  const handleRequestJoin = async (instituteId: number) => {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent('/institutes')}`);
      return;
    }
    setRequestStatus((prev) => ({ ...prev, [instituteId]: 'sending' }));
    try {
      await apiClient.post('/institute-join-request/', { institute: instituteId });
      setRequestStatus((prev) => ({ ...prev, [instituteId]: 'sent' }));
      await refreshProfile();
    } catch {
      setRequestStatus((prev) => ({ ...prev, [instituteId]: 'error' }));
    }
  };

  return (
    <Box sx={{ pb: 8 }}>
      <Paper
        elevation={0}
        sx={{
          mb: 3.5,
          p: { xs: 3, md: 4.5 },
          borderRadius: '24px',
          background: `linear-gradient(165deg, ${GREEN} 0%, #166534 50%, #134E2A 100%)`,
          color: '#fff',
        }}
      >
        <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#FCD34D', mb: 1 }}>
          Coaching centres
        </Typography>
        <Typography sx={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 900, fontSize: { xs: '1.7rem', md: '2.3rem' }, letterSpacing: '-0.03em' }}>
          Find your academy on KPSC Master.
        </Typography>
        <Typography sx={{ mt: 1.25, color: 'rgba(255,255,255,0.86)', maxWidth: 540, lineHeight: 1.55 }}>
          Join your coaching centre to get their notes, batches, and fee records. Academy owners register from Institute Login.
        </Typography>
      </Paper>

      {profile?.join_request_status && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: '14px' }}>{profile.join_request_status}</Alert>
      )}

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: GREEN_LIGHT }} />
        </Box>
      )}
      {error && <Alert severity="error" sx={{ borderRadius: '14px' }}>Could not load institutes.</Alert>}

      {!isLoading && !error && list.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: '20px' }}>
          <Typography sx={{ color: 'text.secondary', fontWeight: 700, mb: 2 }}>No academies listed yet.</Typography>
          <Button onClick={() => router.push('/institute/register')} sx={{ textTransform: 'none', fontWeight: 800, color: GREEN }}>
            Register your academy
          </Button>
        </Paper>
      )}

      <Grid container spacing={2.5}>
        {list.map((institute: any) => {
          const isMember = profile?.institute?.id === institute.id;
          const pending = profile?.join_request_status?.includes(institute.name) || requestStatus[institute.id] === 'sent';
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={institute.id}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  height: '100%',
                  borderRadius: '20px',
                  border: '1.5px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar src={institute.logo || ''} sx={{ width: 52, height: 52, bgcolor: 'rgba(27,107,58,0.12)', color: GREEN }}>
                    {(institute.name || 'A').slice(0, 1)}
                  </Avatar>
                  <Box>
                    <Typography
                      component={institute.slug ? 'a' : 'span'}
                      href={institute.slug ? `/institute/${institute.slug}` : undefined}
                      sx={{ fontWeight: 800, lineHeight: 1.3, color: 'text.primary', textDecoration: 'none', '&:hover': { color: GREEN } }}
                    >
                      {institute.name}
                    </Typography>
                    {institute.tagline && (
                      <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{institute.tagline}</Typography>
                    )}
                  </Box>
                </Stack>
                {isMember ? (
                  <Chip label="You are a member" color="success" sx={{ fontWeight: 800, alignSelf: 'flex-start' }} />
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => handleRequestJoin(institute.id)}
                    disabled={requestStatus[institute.id] === 'sending' || pending}
                    sx={{
                      mt: 'auto',
                      textTransform: 'none',
                      fontWeight: 800,
                      borderRadius: '12px',
                      background: `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})`,
                    }}
                  >
                    {requestStatus[institute.id] === 'sending' ? 'Sending…' : pending ? 'Request sent' : requestStatus[institute.id] === 'error' ? 'Try again' : 'Request to join'}
                  </Button>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
