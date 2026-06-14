'use client';

import { useState } from 'react';
import {
  AppBar, Toolbar, IconButton, Box, Typography,
  Badge, Avatar, Tooltip, Popover, List, ListItem, ListItemButton,
  ListItemText, Divider, CircularProgress, Button
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import BoltIcon from '@mui/icons-material/Bolt';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/AppContext';
import { drawerWidth } from './Sidebar';

interface MainHeaderProps {
  onDrawerToggle: () => void;
}

export default function MainHeader({ onDrawerToggle }: MainHeaderProps) {
  const { user, profile, logout, unreadCount, messages, markAsRead, isLoading, themeMode, toggleThemeMode } = useAppContext();
  const router = useRouter();
  const [notifAnchor, setNotifAnchor] = useState<HTMLButtonElement | null>(null);
  const [profileAnchor, setProfileAnchor] = useState<HTMLButtonElement | null>(null);

  const streak = profile?.current_streak || 0;
  const xp = profile?.total_xp || 0;

  const handleLogout = () => {
    setProfileAnchor(null);
    logout();
    router.push('/login');
  };

  if (isLoading) return null;

  return (
    <AppBar
      position="fixed"
      sx={{
        width: user ? { lg: `calc(100% - ${drawerWidth}px)` } : '100%',
        ml: user ? { lg: `${drawerWidth}px` } : 0,
        background: themeMode === 'dark' ? 'rgba(15,17,23,0.85)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
        boxShadow: 'none',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64, px: { xs: 2, sm: 3 } }}>
        {/* Left: Menu toggle (mobile) + Brand on mobile */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={onDrawerToggle}
            edge="start"
            sx={{ display: { lg: 'none' }, color: themeMode === 'dark' ? '#8892A4' : '#64748B' }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            sx={{
              display: { lg: 'none' },
              fontFamily: "'Cabinet Grotesk', sans-serif",
              fontWeight: 800, fontSize: '1rem',
              color: themeMode === 'dark' ? '#F0F4F8' : '#0F172A', letterSpacing: '-0.02em',
            }}
          >
            KPSC Master
          </Typography>
        </Box>

        {/* Center: Streak Badge (clickable) */}
        {user && streak > 0 && (
          <Box
            onClick={() => router.push('/analytics')}
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.75,
              background: 'rgba(255, 107, 43, 0.12)',
              border: '1px solid rgba(255, 107, 43, 0.3)',
              borderRadius: '20px', px: 1.5, py: 0.5,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': { background: 'rgba(255, 107, 43, 0.2)' },
            }}
          >
            <LocalFireDepartmentIcon sx={{
              fontSize: 18, color: '#FF6B2B',
              animation: 'flamePulse 1.5s ease-in-out infinite',
            }} />
            <Typography sx={{
              fontSize: '0.8rem', fontWeight: 700,
              color: '#FF6B2B', fontFamily: "'JetBrains Mono'",
            }}>
              {streak} day{streak !== 1 ? 's' : ''}
            </Typography>
          </Box>
        )}

        {/* Right: XP + Notifications + Avatar */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* XP Counter */}
          {user && (
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 0.5,
              background: 'rgba(139, 92, 246, 0.1)',
              border: '1px solid rgba(139, 92, 246, 0.25)',
              borderRadius: '20px', px: 1.25, py: 0.4,
            }}>
              <BoltIcon sx={{ fontSize: 14, color: '#8B5CF6' }} />
              <Typography sx={{
                fontSize: '0.75rem', fontWeight: 700,
                color: '#a78bfa', fontFamily: "'JetBrains Mono'",
              }}>
                {xp.toLocaleString()}
              </Typography>
            </Box>
          )}

          {/* Notifications */}
          {user && (
            <Tooltip title="Notifications">
              <IconButton
                onClick={(e) => setNotifAnchor(e.currentTarget)}
                sx={{ color: themeMode === 'dark' ? '#8892A4' : '#64748B', '&:hover': { color: themeMode === 'dark' ? '#F0F4F8' : '#0F172A' } }}
              >
                <Badge badgeContent={unreadCount || 0} color="error" max={9}>
                  <NotificationsIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>
          )}

          {/* Theme Toggler */}
          <Tooltip title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton
              onClick={toggleThemeMode}
              sx={{ color: themeMode === 'dark' ? '#8892A4' : '#64748B', '&:hover': { color: themeMode === 'dark' ? '#F0F4F8' : '#0F172A' } }}
            >
              {themeMode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
            </IconButton>
          </Tooltip>

          {/* User Avatar */}
          {user ? (
            <Tooltip title={profile?.user?.username || user.username}>
              <IconButton onClick={(e) => setProfileAnchor(e.currentTarget)} sx={{ p: 0 }}>
                <Avatar
                  src={profile?.profile_photo || undefined}
                  alt={user.username}
                  sx={{
                    width: 34, height: 34,
                    border: '2px solid rgba(46, 139, 87, 0.5)',
                    background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
                    fontSize: '0.85rem', fontWeight: 700,
                  }}
                >
                  {user.username?.[0]?.toUpperCase()}
                </Avatar>
              </IconButton>
            </Tooltip>
          ) : (
            <Button
              variant="contained"
              size="small"
              onClick={() => router.push('/login')}
              sx={{ py: 0.5, px: 2, fontSize: '0.8rem' }}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>

      {/* Notifications Popover */}
      <Popover
        open={Boolean(notifAnchor)}
        anchorEl={notifAnchor}
        onClose={() => setNotifAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: 320, mt: 1,
            background: '#161B22',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            maxHeight: 400, overflowY: 'auto',
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Typography sx={{ fontWeight: 700, color: '#F0F4F8', fontFamily: "'Cabinet Grotesk'" }}>
            Notifications
          </Typography>
        </Box>
        {messages.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '1.5rem', mb: 1 }}>🔔</Typography>
            <Typography sx={{ color: '#8892A4', fontSize: '0.875rem' }}>
              You're all caught up! Come back after today's quiz.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {messages.slice(0, 10).map((msg: any, i: number) => (
              <ListItem
                key={msg.id}
                onClick={() => markAsRead(msg.id)}
                sx={{
                  cursor: 'pointer', py: 1.5, px: 2,
                  background: !msg.read_by?.includes(user?.id) ? 'rgba(27,107,58,0.08)' : 'transparent',
                  '&:hover': { background: 'rgba(255,255,255,0.04)' },
                  borderBottom: i < messages.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
              >
                <ListItemText
                  primary={msg.subject || msg.title || 'Notification'}
                  secondary={msg.body || msg.content || ''}
                  primaryTypographyProps={{ sx: { fontSize: '0.875rem', fontWeight: 600, color: '#F0F4F8' } }}
                  secondaryTypographyProps={{ sx: { fontSize: '0.8rem', color: '#8892A4', mt: 0.25 } }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Popover>

      {/* Profile Popover */}
      <Popover
        open={Boolean(profileAnchor)}
        anchorEl={profileAnchor}
        onClose={() => setProfileAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            width: 220, mt: 1,
            background: '#161B22',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
          }
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <Typography sx={{ fontWeight: 700, color: '#F0F4F8', fontSize: '0.9rem' }}>
            {user?.username}
          </Typography>
          <Typography sx={{ color: '#8892A4', fontSize: '0.75rem' }}>
            {user?.email}
          </Typography>
        </Box>
        <List disablePadding sx={{ p: 1 }}>
          {[
            { label: '👤 Profile', path: '/profile' },
            { label: '📊 Analytics', path: '/analytics' },
            { label: '⚙️ Settings', path: '/settings' },
          ].map(item => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => { router.push(item.path); setProfileAnchor(null); }}
                sx={{ borderRadius: '10px', py: 0.75 }}
              >
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ sx: { fontSize: '0.875rem', color: '#F0F4F8' } }}
                />
              </ListItemButton>
            </ListItem>
          ))}
          <Divider sx={{ my: 0.5, borderColor: 'rgba(255,255,255,0.06)' }} />
          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogout}
              sx={{ borderRadius: '10px', py: 0.75, color: '#EF4444' }}
            >
              <ListItemText
                primary="🚪 Logout"
                primaryTypographyProps={{ sx: { fontSize: '0.875rem', color: '#EF4444' } }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Popover>
    </AppBar>
  );
}