'use client';

import { useRouter } from 'next/navigation';
import { AppBar, Toolbar, Typography, Box, IconButton, Button, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import LoginIcon from '@mui/icons-material/Login';
import ProfileMenu from '@/components/ProfileMenu';
import NotificationsMenu from '@/components/NotificationsMenu';
import { useAppContext } from '@/context/AppContext';
import { drawerWidth } from './Sidebar';

interface MainHeaderProps {
  onDrawerToggle: () => void;
}

export default function MainHeader({ onDrawerToggle }: MainHeaderProps) {
  const router = useRouter();
  const { user, isInstituteOwner } = useAppContext();

  return (
    <AppBar
      position="fixed"
      sx={{
        // The background now comes from the main theme file
        background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        width: { lg: `calc(100% - ${drawerWidth}px)` },
        ml: { lg: `${drawerWidth}px` },
      }}
    >
      <Toolbar>
        <IconButton color="inherit" onClick={onDrawerToggle} sx={{ mr: 2, display: { lg: 'none' } }}>
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          KPSC Quiz App
        </Typography>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isInstituteOwner && (
            <Tooltip title="Institute Portal" arrow>
              <IconButton color="inherit" onClick={() => router.push('/institute/dashboard')}>
                <CorporateFareIcon />
              </IconButton>
            </Tooltip>
          )}
          
          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <NotificationsMenu />
              <ProfileMenu />
            </Box>
          ) : (
            <Button color="inherit" variant="outlined" startIcon={<LoginIcon />} onClick={() => router.push('/login')}>
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}