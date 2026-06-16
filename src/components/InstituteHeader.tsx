'use client';

import Image from 'next/image';
import { AppBar, Toolbar, Box, Button, IconButton, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import ProfileMenu from '@/components/ProfileMenu';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuIcon from '@mui/icons-material/Menu';
import { instituteDrawerWidth } from './InstituteSidebar';

interface InstituteHeaderProps {
  onDrawerToggle: () => void;
}

export default function InstituteHeader({ onDrawerToggle }: InstituteHeaderProps) {
  const router = useRouter();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: '#0D1117',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        width: { lg: `calc(100% - ${instituteDrawerWidth}px)` },
        ml: { lg: `${instituteDrawerWidth}px` },
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 64, sm: 64 } }}>
        {/* Mobile hamburger + logo */}
        <Box sx={{ display: { lg: 'none' }, alignItems: 'center', gap: 1.5, mr: 2, display: 'flex' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onDrawerToggle}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo on mobile topbar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              width: 32, height: 32,
              borderRadius: '8px',
              bgcolor: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              <Image src="/logo.png" alt="KPSC Master" width={28} height={28} style={{ objectFit: 'contain' }} />
            </Box>
            <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', color: 'white', letterSpacing: '-0.01em' }}>
              KPSC Master
            </Typography>
          </Box>
        </Box>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Right side actions */}
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<ExitToAppIcon />}
          onClick={() => router.push('/')}
          sx={{
            mr: 2,
            borderRadius: '10px',
            borderColor: 'rgba(255,255,255,0.15)',
            fontSize: '0.8rem',
            textTransform: 'none',
            '&:hover': {
              borderColor: 'rgba(255,255,255,0.35)',
              bgcolor: 'rgba(255,255,255,0.06)',
            },
          }}
        >
          Student View
        </Button>
        <ProfileMenu />
      </Toolbar>
    </AppBar>
  );
}