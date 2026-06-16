'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Box, Typography, CircularProgress, Stack, Tab, Tabs, Avatar, Divider, Chip,
  Grid, Button, Dialog, DialogTitle, DialogContent, TextField, IconButton,
  InputAdornment, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import BoltIcon from '@mui/icons-material/Bolt';
import PlaceIcon from '@mui/icons-material/Place';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import GroupIcon from '@mui/icons-material/Group';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';

export default function LeaderboardPage() {
  const { user, fetcher, isLoading: ctxLoading } = useAppContext();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);

  // Friends Modal State
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [modalFriends, setModalFriends] = useState<any[]>([]);
  const [isLoadingFriends, setIsLoadingFriends] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!ctxLoading && !user) router.push('/login');
  }, [user, ctxLoading, router]);

  const { data, error, isLoading, mutate } = useSWR(
    user ? '/leaderboard/' : null,
    fetcher
  );

  // Fetch current friends list for the modal
  const fetchFriendsList = async () => {
    setIsLoadingFriends(true);
    try {
      const res = await apiClient.get('/friends/');
      setModalFriends(res.data.friends || []);
    } catch (err) {
      console.error('Failed to fetch friends list:', err);
    } finally {
      setIsLoadingFriends(false);
    }
  };

  useEffect(() => {
    if (showFriendsModal && user) {
      fetchFriendsList();
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [showFriendsModal]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await apiClient.get(`/users/search/?q=${encodeURIComponent(searchQuery)}`);
      setSearchResults(res.data.users || []);
    } catch (err) {
      console.error('Failed to search users:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFriend = async (friendUsername: string) => {
    setActionLoading(friendUsername);
    try {
      await apiClient.post('/friends/', { username: friendUsername });
      
      // Update local state in modal search results
      setSearchResults(prev =>
        prev.map(u => (u.username === friendUsername ? { ...u, is_friend: true } : u))
      );

      // Refresh list of friends and leaderboard data
      fetchFriendsList();
      mutate();
    } catch (err) {
      console.error('Failed to add friend:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveFriend = async (friendUsername: string) => {
    setActionLoading(friendUsername);
    try {
      await apiClient.delete(`/friends/?username=${encodeURIComponent(friendUsername)}`);
      
      // Update local state in modal search results
      setSearchResults(prev =>
        prev.map(u => (u.username === friendUsername ? { ...u, is_friend: false } : u))
      );

      // Refresh list of friends and leaderboard data
      fetchFriendsList();
      mutate();
    } catch (err) {
      console.error('Failed to remove friend:', err);
    } finally {
      setActionLoading(null);
    }
  };

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
  const friendsList = data?.friends || [];

  // Determine current list based on selected tab
  let currentList = allKeralaList;
  let userPos = data?.user_position;

  if (activeTab === 1) {
    currentList = districtList;
    userPos = data?.user_position_district || data?.user_position;
  } else if (activeTab === 2) {
    currentList = batchList;
    userPos = data?.user_position_batch || data?.user_position;
  } else if (activeTab === 3) {
    currentList = friendsList;
    userPos = data?.user_position_friends || data?.user_position;
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
      
      {/* Title Header with Manage Friends Action */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: '0.8rem', color: '#8B5CF6', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Leaderboard 🏆
          </Typography>
          <Typography variant="h4" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, color: '#F0F4F8', mt: 0.5 }}>
            Top Aspirants
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<GroupIcon />}
          onClick={() => setShowFriendsModal(true)}
          sx={{
            color: '#2E8B57',
            borderColor: '#2E8B57',
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: '10px',
            '&:hover': {
              borderColor: '#1B6B3A',
              background: 'rgba(27, 107, 58, 0.08)'
            }
          }}
        >
          Manage Friends
        </Button>
      </Stack>

      <Typography sx={{ color: '#8892A4', fontSize: '0.9rem', mb: 3.5 }}>
        Compare progress with Kerala's brightest and stay ahead of the curve.
      </Typography>

      {/* Tabs including Friends */}
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
            fontSize: '0.825rem',
            color: '#8892A4',
            zIndex: 1,
            borderRadius: '8px',
            transition: 'color 0.2s ease',
            minWidth: 0,
            px: 1,
            '&.Mui-selected': {
              color: '#F0F4F8',
            }
          }
        }}
      >
        <Tab label="Statewide" />
        <Tab label="My District" />
        <Tab label="My Batch" />
        <Tab label="Friends Graph" />
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
            {activeTab === 3 
              ? "Add study partners via the 'Manage Friends' button to see them on your Friends leaderboard!"
              : "Answer 10 questions to enter the ranking and unlock this board!"}
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

      {/* Friends Management Dialog Modal */}
      <Dialog
        open={showFriendsModal}
        onClose={() => setShowFriendsModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#161B22',
            backgroundImage: 'none',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.08)'
          }
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, color: '#F0F4F8' }}>
            Manage Study Partners
          </Typography>
          <IconButton onClick={() => setShowFriendsModal(false)} sx={{ color: '#8892A4' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: 'rgba(255,255,255,0.06)', p: 2.5, pb: 4 }}>
          {/* User Search Form */}
          <form onSubmit={handleSearch} style={{ marginBottom: '24px' }}>
            <Stack direction="row" spacing={1.5}>
              <TextField
                placeholder="Search usernames..."
                fullWidth
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#8892A4', fontSize: 20 }} />
                    </InputAdornment>
                  )
                }}
                sx={{
                  '& input': { color: '#F0F4F8' },
                  '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                  '&.Mui-focused fieldset': { borderColor: '#2E8B57' },
                  bgcolor: 'rgba(255,255,255,0.01)',
                  borderRadius: '10px'
                }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={isSearching}
                sx={{
                  bgcolor: '#2E8B57',
                  textTransform: 'none',
                  fontWeight: 700,
                  px: 3,
                  borderRadius: '10px',
                  '&:hover': { bgcolor: '#1B6B3A' }
                }}
              >
                Search
              </Button>
            </Stack>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5 }}>
                Search Results
              </Typography>
              <List disablePadding>
                {searchResults.map((u) => (
                  <ListItem
                    key={u.username}
                    disableGutters
                    sx={{
                      p: 1.5,
                      bgcolor: 'rgba(255,255,255,0.01)',
                      border: '1px solid rgba(255,255,255,0.04)',
                      borderRadius: '12px',
                      mb: 1
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar src={u.profile_photo || undefined} sx={{ bgcolor: '#1B6B3A' }}>
                        {u.username[0].toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography sx={{ color: '#F0F4F8', fontWeight: 700, fontSize: '0.9rem' }}>{u.username}</Typography>}
                      secondary={<Typography sx={{ color: '#8892A4', fontSize: '0.75rem' }}>{u.district_display || 'Kerala'}</Typography>}
                    />
                    <ListItemSecondaryAction>
                      {u.is_friend ? (
                        <IconButton
                          edge="end"
                          color="error"
                          onClick={() => handleRemoveFriend(u.username)}
                          disabled={actionLoading === u.username}
                        >
                          <PersonRemoveIcon />
                        </IconButton>
                      ) : (
                        <IconButton
                          edge="end"
                          sx={{ color: '#2E8B57' }}
                          onClick={() => handleAddFriend(u.username)}
                          disabled={actionLoading === u.username}
                        >
                          <PersonAddIcon />
                        </IconButton>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Current Friends List */}
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#8892A4', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1.5 }}>
              Current Friends ({modalFriends.length})
            </Typography>

            {isLoadingFriends ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={20} sx={{ color: '#2E8B57' }} />
              </Box>
            ) : modalFriends.length === 0 ? (
              <Typography sx={{ color: '#8892A4', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center', py: 2 }}>
                You haven't added any study partners yet.
              </Typography>
            ) : (
              <List disablePadding>
                {modalFriends.map((f) => (
                  <ListItem
                    key={f.username}
                    disableGutters
                    sx={{
                      p: 1.5,
                      bgcolor: 'rgba(255,255,255,0.01)',
                      border: '1px solid rgba(255,255,255,0.04)',
                      borderRadius: '12px',
                      mb: 1
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar src={f.profile_photo || undefined} sx={{ bgcolor: '#8B5CF6' }}>
                        {f.username[0].toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography sx={{ color: '#F0F4F8', fontWeight: 700, fontSize: '0.9rem' }}>{f.username}</Typography>}
                      secondary={<Typography sx={{ color: '#8892A4', fontSize: '0.75rem' }}>{f.district_display || 'Kerala'} • {f.xp} XP</Typography>}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => handleRemoveFriend(f.username)}
                        disabled={actionLoading === f.username}
                      >
                        <PersonRemoveIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </DialogContent>
      </Dialog>
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
