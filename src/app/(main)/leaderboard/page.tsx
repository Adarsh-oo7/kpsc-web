'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Box, Typography, CircularProgress, Stack, Tab, Tabs, Avatar, Divider, Chip
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import BoltIcon from '@mui/icons-material/Bolt';
import PlaceIcon from '@mui/icons-material/Place';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useAppContext } from '@/context/AppContext';

export default function LeaderboardPage() {
  const { user, fetcher, isLoading: ctxLoading } = useAppContext();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (!ctxLoading && !user) router.push('/login');
  }, [user, ctxLoading, router]);

  const { data, error, isLoading } = useSWR(
    user ? '/leaderboard/' : null,
    fetcher
  );

  if (ctxLoading || isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={32} sx={{ color: '#2E8B57' }} />
      </Box>
    );
  }

  const allKeralaList = data?.all_kerala || [];
  const districtList = data?.district || [];
  const batchList = data?.batch || [];

  // Determine current list based on selected tab
  let currentList = allKeralaList;
  let userPos = data?.user_position;
  if (activeTab === 1) {
    currentList = districtList;
    userPos = data?.user_position_district || data?.user_position;
  } else if (activeTab === 2) {
    currentList = batchList;
    userPos = data?.user_position_batch || data?.user_position;
  }

  const topThree = currentList.slice(0, 3);
  const remainingUsers = currentList.slice(3);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <Box sx={{ maxWidth: 650, mx: 'auto', pb: 10, position: 'relative' }}>
      {/* Title */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: '0.8rem', color: '#8B5CF6', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Leaderboard 🏆
        </Typography>
        <Typography variant="h4" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, color: '#F0F4F8', mt: 0.5 }}>
          Top Aspirants
        </Typography>
        <Typography sx={{ color: '#8892A4', fontSize: '0.9rem', mt: 0.5 }}>
          Compare progress with Kerala's brightest and stay ahead of the curve.
        </Typography>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(e, v) => setActiveTab(v)}
        variant="fullWidth"
        sx={{
          mb: 4,
          background: 'rgba(255,255,255,0.02)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.06)',
          p: 0.5,
          '& .MuiTabs-indicator': {
            background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
            borderRadius: '8px',
            height: '100%',
            opacity: 0.15,
            zIndex: 0,
          },
          '& .MuiTab-root': {
            fontFamily: "'Satoshi', sans-serif",
            fontWeight: 700,
            fontSize: '0.85rem',
            color: '#8892A4',
            zIndex: 1,
            borderRadius: '8px',
            transition: 'color 0.2s ease',
            '&.Mui-selected': {
              color: '#F0F4F8',
            }
          }
        }}
      >
        <Tab label="Statewide" />
        <Tab label="My District" />
        <Tab label="My Batch" />
      </Tabs>

      {currentList.length === 0 ? (
        <Box sx={{
          textAlign: 'center', py: 8, px: 3,
          background: '#161B22', borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>🏆</Typography>
          <Typography sx={{ fontWeight: 700, color: '#F0F4F8', fontFamily: "'Cabinet Grotesk'", mb: 0.5 }}>
            No Leaderboard Activity
          </Typography>
          <Typography sx={{ color: '#8892A4', fontSize: '0.875rem' }}>
            Answer 10 questions to enter the ranking and unlock this board!
          </Typography>
        </Box>
      ) : (
        <>
          {/* Top 3 podium */}
          <GridPodium topThree={topThree} getRankBadge={getRankBadge} />

          {/* Leaderboard List */}
          <Stack spacing={1} sx={{ mt: 3 }}>
            <AnimatePresence mode="popLayout">
              {remainingUsers.map((p: any, idx: number) => {
                const isCurrentUser = p.username === user?.username;
                return (
                  <motion.div
                    key={p.username}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <Box sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      p: 2,
                      background: isCurrentUser ? 'rgba(27, 107, 58, 0.12)' : '#161B22',
                      border: isCurrentUser ? '1px solid rgba(46, 139, 87, 0.4)' : '1px solid rgba(255,255,255,0.05)',
                      borderRadius: '14px',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateX(4px)' }
                    }}>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography sx={{
                          fontFamily: "'JetBrains Mono'", fontWeight: 700, color: '#8892A4',
                          width: 24, fontSize: '0.9rem', textAlign: 'center'
                        }}>
                          {p.rank}
                        </Typography>
                        <Avatar
                          src={p.avatar || undefined}
                          sx={{
                            width: 38, height: 38,
                            bgcolor: isCurrentUser ? '#1B6B3A' : '#1C2230',
                            border: '1px solid rgba(255,255,255,0.08)',
                            fontWeight: 700, fontSize: '0.9rem', color: '#F0F4F8'
                          }}
                        >
                          {p.username[0].toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#F0F4F8' }}>
                            {p.username}
                          </Typography>
                          <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.25 }}>
                            <PlaceIcon sx={{ fontSize: 12, color: '#8892A4' }} />
                            <Typography sx={{ fontSize: '0.7rem', color: '#8892A4' }}>
                              {p.place}
                            </Typography>
                            <Chip
                              label={`Lv.${p.level}`}
                              size="small"
                              sx={{
                                height: 16, fontSize: '0.65rem', fontWeight: 700,
                                bgcolor: 'rgba(255,255,255,0.04)', color: '#8892A4',
                                border: '1px solid rgba(255,255,255,0.08)', ml: 1
                              }}
                            />
                          </Stack>
                        </Box>
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={2.5}>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <LocalFireDepartmentIcon sx={{ fontSize: 16, color: '#FF6B2B' }} />
                          <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#FF6B2B', fontFamily: "'JetBrains Mono'" }}>
                            {p.streak}d
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 70, justifyContent: 'flex-end' }}>
                          <BoltIcon sx={{ fontSize: 16, color: '#8B5CF6' }} />
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#a78bfa', fontFamily: "'JetBrains Mono'" }}>
                            {p.xp.toLocaleString()}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Box>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </Stack>
        </>
      )}

      {/* Pinned position at bottom */}
      {userPos && (
        <Box sx={{
          position: 'fixed',
          bottom: 0,
          left: { lg: 272 }, // matching sidebar width
          right: 0,
          background: 'rgba(22, 27, 34, 0.95)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(27, 107, 58, 0.4)',
          p: 2,
          zIndex: 10,
          boxShadow: '0 -8px 24px rgba(0,0,0,0.4)'
        }}>
          <Box sx={{ maxWidth: 650, mx: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography sx={{
                fontFamily: "'JetBrains Mono'", fontWeight: 900,
                fontSize: '1rem', color: '#1B6B3A', background: 'rgba(27, 107, 58, 0.15)',
                border: '1px solid rgba(27, 107, 58, 0.3)',
                borderRadius: '8px', px: 1.25, py: 0.25
              }}>
                #{userPos.rank}
              </Typography>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: '#F0F4F8', display: 'flex', alignItems: 'center', gap: 1 }}>
                  Your Position
                  <Chip
                    size="small"
                    icon={<ArrowUpwardIcon sx={{ '&&': { color: '#22c55e', fontSize: 12 } }} />}
                    label={userPos.places_gained || "+3"}
                    sx={{
                      height: 18, fontSize: '0.65rem', fontWeight: 700,
                      bgcolor: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)'
                    }}
                  />
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#8892A4', mt: 0.25 }}>
                  Keep answering questions to push past next rank!
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={2.5}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <LocalFireDepartmentIcon sx={{ fontSize: 16, color: '#FF6B2B' }} />
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#FF6B2B', fontFamily: "'JetBrains Mono'" }}>
                  {userPos.streak}d
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <BoltIcon sx={{ fontSize: 16, color: '#8B5CF6' }} />
                <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#a78bfa', fontFamily: "'JetBrains Mono'" }}>
                  {userPos.xp.toLocaleString()} XP
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Box>
      )}
    </Box>
  );
}

function GridPodium({ topThree, getRankBadge }: any) {
  if (topThree.length === 0) return null;

  // Re-order to: [2nd, 1st, 3rd] for classic podium display
  const podiumOrder = [];
  if (topThree[1]) podiumOrder.push({ ...topThree[1], isSecond: true });
  if (topThree[0]) podiumOrder.push({ ...topThree[0], isFirst: true });
  if (topThree[2]) podiumOrder.push({ ...topThree[2], isThird: true });

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: '1fr 1.1fr 1fr',
      alignItems: 'end',
      gap: { xs: 1, sm: 2 },
      mt: 4, mb: 2,
      px: { xs: 1, sm: 3 }
    }}>
      {podiumOrder.map((p) => {
        let height = 120;
        let scale = 0.9;
        let ringColor = 'rgba(255,255,255,0.06)';
        let badgeBg = 'rgba(255,255,255,0.1)';
        let emoji = '🥈';

        if (p.isFirst) {
          height = 160;
          scale = 1.05;
          ringColor = '#F59E0B';
          badgeBg = 'rgba(245, 158, 11, 0.1)';
          emoji = '🥇';
        } else if (p.isThird) {
          height = 100;
          scale = 0.85;
          ringColor = '#CD7F32';
          badgeBg = 'rgba(205, 127, 50, 0.1)';
          emoji = '🥉';
        }

        return (
          <motion.div
            key={p.username}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale }}
            transition={{ type: 'spring', stiffness: 80 }}
          >
            <Box sx={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              background: p.isFirst ? 'rgba(245, 158, 11, 0.04)' : 'transparent',
              border: p.isFirst ? '1px solid rgba(245, 158, 11, 0.12)' : 'none',
              borderRadius: '16px',
              p: 1.5,
              textAlign: 'center',
            }}>
              {/* Avatar stack */}
              <Box sx={{ position: 'relative', mb: 1.5 }}>
                <Avatar
                  src={p.avatar || undefined}
                  sx={{
                    width: p.isFirst ? 64 : 52,
                    height: p.isFirst ? 64 : 52,
                    border: `2px solid ${ringColor}`,
                    background: '#1C2230',
                    fontSize: p.isFirst ? '1.5rem' : '1.2rem',
                    fontWeight: 700,
                  }}
                >
                  {p.username[0].toUpperCase()}
                </Avatar>
                <Box sx={{
                  position: 'absolute',
                  bottom: -8, left: '50%', transform: 'translateX(-50%)',
                  background: '#161B22',
                  border: `1px solid ${ringColor}`,
                  borderRadius: '50%',
                  width: 22, height: 22,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem',
                }}>
                  {emoji}
                </Box>
              </Box>

              <Typography noWrap sx={{ fontWeight: 800, fontSize: p.isFirst ? '0.95rem' : '0.85rem', color: '#F0F4F8' }}>
                {p.username}
              </Typography>
              <Typography sx={{ fontSize: '0.65rem', color: '#8892A4', mb: 1 }}>
                {p.place}
              </Typography>

              {/* XP display box */}
              <Box sx={{
                background: badgeBg,
                border: `1px solid ${ringColor}33`,
                borderRadius: '8px',
                py: 0.5, px: 1,
                display: 'inline-flex', alignItems: 'center', gap: 0.25
              }}>
                <BoltIcon sx={{ fontSize: 13, color: p.isFirst ? '#F59E0B' : '#a78bfa' }} />
                <Typography sx={{
                  fontSize: '0.75rem', fontWeight: 800,
                  color: p.isFirst ? '#F59E0B' : '#a78bfa',
                  fontFamily: "'JetBrains Mono'",
                }}>
                  {p.xp}
                </Typography>
              </Box>
            </Box>
          </motion.div>
        );
      })}
    </Box>
  );
}
