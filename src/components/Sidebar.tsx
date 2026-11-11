'use client';

import { usePathname, useRouter } from 'next/navigation';
import NextLink from 'next/link';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Box, Typography, Divider, useTheme, useMediaQuery, Avatar, LinearProgress, Chip
} from '@mui/material';
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image';

// Icons
import HomeIcon from '@mui/icons-material/Home';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import QuizIcon from '@mui/icons-material/Quiz';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CancelIcon from '@mui/icons-material/Cancel';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import ForumIcon from '@mui/icons-material/Forum';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonIcon from '@mui/icons-material/Person';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import BoltIcon from '@mui/icons-material/Bolt';
import SchoolIcon from '@mui/icons-material/School';

export const drawerWidth = 272;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

const navItems = [
  { text: 'Home', icon: <HomeIcon />, path: '/home', section: 'study' },
  { text: 'Syllabus', icon: <MenuBookIcon />, path: '/topics', section: 'study' },
  { text: 'Study Feed', icon: <DynamicFeedIcon />, path: '/feed', section: 'study' },
  { text: 'Daily Quiz', icon: <QuizIcon />, path: '/quiz', section: 'study' },
  { text: 'Mock Tests', icon: <AssignmentIcon />, path: '/exams', section: 'study' },
  { text: 'Current Affairs', icon: <NewspaperIcon />, path: '/current-affairs', section: 'study' },
  { divider: true, label: 'Progress', section: 'progress' },
  { text: 'Leaderboard', icon: <LeaderboardIcon />, path: '/leaderboard', section: 'progress' },
  { text: 'Analytics', icon: <BarChartIcon />, path: '/analytics', section: 'progress' },
  { text: 'Goals', icon: <TrackChangesIcon />, path: '/goals', section: 'progress' },
  { text: 'Saved Questions', icon: <BookmarkIcon />, path: '/saved', section: 'progress' },
  { text: 'Wrong Answers', icon: <CancelIcon />, path: '/wrong-answers', section: 'progress' },
  { divider: true, label: 'Community', section: 'community' },
  { text: 'Community', icon: <ForumIcon />, path: '/community', section: 'community' },
  { text: 'Notifications', icon: <NotificationsIcon />, path: '/notifications', section: 'community' },
  { divider: true, label: 'Account', section: 'account' },
  { text: 'Subscription', icon: <WorkspacePremiumIcon />, path: '/subscription', section: 'account' },
  { text: 'Profile', icon: <PersonIcon />, path: '/profile', section: 'account' },
];

const LEVEL_NAMES = [
  '', 'Beginner', 'Aspirant', 'Serious Prep', 'Active Learner',
  'PSC Ready', 'PSC Scholar', 'PSC Expert', 'District Topper', 'Kerala Topper', 'PSC Master'
];

function DrawerContent({ onNavigate }: { onNavigate: (path: string) => void }) {
  const pathname = usePathname();
  const { profile, themeMode } = useAppContext();

  const xp = profile?.total_xp || 0;
  const level = profile?.level || 1;
  const streak = profile?.current_streak || 0;
  const xpInLevel = xp % 100;
  const levelName = LEVEL_NAMES[Math.min(level, 10)] || 'PSC Master';
  const institute = profile?.institute;
  const brandName = institute?.name || 'KPSC Master';
  const brandLogo = institute?.logo || '';
  const brandSub = institute ? 'Powered by KPSC Master' : 'Kerala PSC Prep Platform';

  return (
    <Box suppressHydrationWarning sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Brand Header */}
      <Box suppressHydrationWarning sx={{
        p: 2.5,
        background: themeMode === 'dark' ? 'linear-gradient(135deg, #0F1117 0%, #161B22 100%)' : 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)',
        borderBottom: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
      }}>
        <Box
          suppressHydrationWarning
          onClick={() => onNavigate(institute ? `/${institute.slug}/dashboard` : '/home')}
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, cursor: 'pointer' }}
        >
          <Box sx={{
            width: 36, height: 36,
            borderRadius: '10px',
            overflow: 'hidden',
            bgcolor: 'white',
            position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}>
            {brandLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={brandLogo}
                alt={brandName}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Image
                src="/KPSC MASTER.png"
                alt="KPSC Master Logo"
                width={36}
                height={36}
                style={{ objectFit: 'contain' }}
              />
            )}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{
              fontFamily: "'Cabinet Grotesk', sans-serif",
              fontWeight: 800, fontSize: '1.05rem',
              color: themeMode === 'dark' ? '#F0F4F8' : '#0F172A', letterSpacing: '-0.02em', lineHeight: 1.1,
            }} noWrap>
              {brandName}
            </Typography>
            <Typography sx={{ fontSize: '0.68rem', color: institute ? '#F59E0B' : (themeMode === 'dark' ? '#8892A4' : '#64748B'), fontWeight: 600 }} noWrap>
              {brandSub}
            </Typography>
          </Box>
        </Box>

        {/* User XP / Streak bar (shown only for regular KPSC Master students without an institute) */}
        {profile && !profile.institute && (
          <Box sx={{
            background: themeMode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
            border: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
            borderRadius: '12px',
            p: 1.5,
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <BoltIcon sx={{ fontSize: 14, color: '#8B5CF6' }} />
                <Typography sx={{ fontSize: '0.7rem', color: '#a78bfa', fontWeight: 700, fontFamily: "'JetBrains Mono'" }}>
                  {xp} XP
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocalFireDepartmentIcon sx={{ fontSize: 14, color: '#FF6B2B' }} />
                <Typography sx={{ fontSize: '0.7rem', color: '#FF6B2B', fontWeight: 700, fontFamily: "'JetBrains Mono'" }}>
                  {streak}d
                </Typography>
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={xpInLevel}
              sx={{
                height: 4, borderRadius: 4,
                bgcolor: 'rgba(255,255,255,0.06)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #8B5CF6, #2E8B57)',
                  borderRadius: 4,
                }
              }}
            />
            <Typography sx={{ fontSize: '0.65rem', color: '#4A5568', mt: 0.5 }}>
              Lv.{level} {levelName}
            </Typography>
          </Box>
        )}

        {/* Academy badge for enrolled institute students (replaces generic XP bar) */}
        {profile && profile.institute && (
          <Box sx={{
            background: themeMode === 'dark' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.06)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '12px',
            p: 1.5,
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <SchoolIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
                <Typography sx={{ fontSize: '0.75rem', color: '#F59E0B', fontWeight: 800 }}>
                  Enrolled Student
                </Typography>
              </Box>
              <Chip
                label="Active"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  bgcolor: 'rgba(245, 158, 11, 0.18)',
                  color: '#F59E0B',
                }}
              />
            </Box>
            <Typography sx={{ fontSize: '0.72rem', color: themeMode === 'dark' ? '#94A3B8' : '#64748B', mt: 0.75, fontWeight: 600 }}>
              {profile.institute.name} Academy Portal
            </Typography>
          </Box>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1, px: 1 }}>
        {profile?.institute && (
          <Box sx={{ mb: 1, px: 0.5 }}>
            <ListItemButton
              onClick={() => onNavigate(`/${profile.institute.slug}/dashboard`)}
              sx={{
                borderRadius: '12px',
                py: 1,
                px: 1.5,
                background: 'linear-gradient(135deg, rgba(13, 71, 161, 0.18), rgba(245, 158, 11, 0.12))',
                border: '1.5px solid #F59E0B',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(13, 71, 161, 0.28), rgba(245, 158, 11, 0.2))',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: '#F59E0B' }}>
                <SchoolIcon />
              </ListItemIcon>
              <ListItemText
                primary={profile.institute.name}
                secondary="Academy Portal & Tests"
                primaryTypographyProps={{
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  color: '#F59E0B',
                }}
                secondaryTypographyProps={{
                  fontSize: '0.68rem',
                  color: 'text.secondary',
                }}
              />
            </ListItemButton>
          </Box>
        )}
        <List disablePadding>
          {(profile?.institute
            ? [
                { text: 'Academy Portal', icon: <SchoolIcon sx={{ color: '#F59E0B' }} />, path: `/${profile.institute.slug}/dashboard` },
                { text: 'Mock Tests & MCQs', icon: <QuizIcon sx={{ color: '#F59E0B' }} />, path: `/${profile.institute.slug}/dashboard` },
                { text: 'Batch Leaderboard', icon: <LeaderboardIcon sx={{ color: '#F59E0B' }} />, path: `/${profile.institute.slug}/dashboard` },
                { text: 'Study Notes & Materials', icon: <MenuBookIcon sx={{ color: '#F59E0B' }} />, path: `/${profile.institute.slug}/dashboard` },
                { divider: true, label: 'Account', section: 'account' },
                { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
              ]
            : navItems
          ).map((item, idx) => {
            if ('divider' in item && item.divider) {
              return (
                <Box key={idx} sx={{ px: 1, pt: 2, pb: 0.5 }}>
                  <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: themeMode === 'dark' ? '#4A5568' : '#64748B', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {item.label}
                  </Typography>
                </Box>
              );
            }
            const path = item.path;
            if (!path) return null;
            const isActive = pathname === path || (path !== '/' && pathname?.startsWith(path));
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.25 }}>
                <ListItemButton
                  onClick={() => onNavigate(item.path!)}
                  selected={isActive}
                  sx={{
                    borderRadius: '10px',
                    py: 1,
                    px: 1.5,
                    minHeight: 44,
                    '& .MuiListItemIcon-root': {
                      color: isActive ? '#2E8B57' : (themeMode === 'dark' ? '#4A5568' : '#64748B'),
                      minWidth: 36,
                      transition: 'color 0.2s ease',
                    },
                    '& .MuiListItemText-primary': {
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive 
                        ? (themeMode === 'dark' ? '#F0F4F8' : '#2E8B57') 
                        : (themeMode === 'dark' ? '#8892A4' : '#475569'),
                      fontFamily: "'Satoshi', sans-serif",
                      transition: 'all 0.2s ease',
                    },
                    ...(isActive ? {
                      background: themeMode === 'dark' ? 'rgba(27, 107, 58, 0.18)' : 'rgba(27, 107, 58, 0.08)',
                      borderLeft: '3px solid #2E8B57',
                      pl: '13px',
                    } : {}),
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
 
      {/* Footer */}
      <Box sx={{ p: 2, borderTop: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)', textAlign: 'center' }}>
        <Typography sx={{ fontSize: '0.65rem', color: themeMode === 'dark' ? '#4A5568' : '#64748B', lineHeight: 1.5 }}>
          © 2026 KPSC Master
        </Typography>
        <Typography
          component={NextLink}
          href="/about"
          sx={{
            display: 'block',
            fontSize: '0.6rem',
            color: themeMode === 'dark' ? '#4A5568' : '#64748B',
            mt: 0.5,
            lineHeight: 1.45,
            textDecoration: 'none',
            '&:hover': { color: '#2E8B57' },
          }}
        >
          About the platform
        </Typography>
      </Box>
    </Box>
  );
}

export default function Sidebar({ open, onClose, onNavigate }: SidebarProps) {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  const router = useRouter();
  const { themeMode } = useAppContext();

  const handleNavigate = (path: string) => {
    router.push(path);
    onNavigate(path);
  };

  const drawerSx = {
    width: drawerWidth,
    flexShrink: 0,
    [`& .MuiDrawer-paper`]: {
      width: drawerWidth,
      boxSizing: 'border-box',
      background: themeMode === 'dark' ? '#0F1117' : '#ffffff',
      border: 'none',
      borderRight: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
    },
  };

  if (isLargeScreen) {
    return (
      <Drawer variant="permanent" sx={drawerSx}>
        <DrawerContent onNavigate={handleNavigate} />
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{ display: { xs: 'block', lg: 'none' }, ...drawerSx }}
    >
      <DrawerContent onNavigate={handleNavigate} />
    </Drawer>
  );
}