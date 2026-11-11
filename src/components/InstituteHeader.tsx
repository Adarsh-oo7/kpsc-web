'use client';

import Image from 'next/image';
import { AppBar, Toolbar, Box, Button, IconButton, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import ProfileMenu from '@/components/ProfileMenu';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuIcon from '@mui/icons-material/Menu';
import { instituteDrawerWidth } from './InstituteSidebar';
import { useAppContext } from '@/context/AppContext';

interface InstituteHeaderProps {
  onDrawerToggle: () => void;
}

export default function InstituteHeader({ onDrawerToggle }: InstituteHeaderProps) {
  const router = useRouter();
  const { profile } = useAppContext();
  const instSlug = profile?.institute?.slug;
  const instName = profile?.institute?.name || 'Academy Portal';
  const instLogo = profile?.institute?.logo;

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
      <Toolbar sx={{ minHeight: { xs: 60, sm: 64 }, px: { xs: 1.5, sm: 3 } }}>
        {/* Mobile hamburger + logo */}
        <Box sx={{ display: { lg: 'none', xs: 'flex' }, alignItems: 'center', gap: 1, mr: 1, minWidth: 0 }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onDrawerToggle}
            sx={{ p: 0.75 }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo on mobile topbar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <Box sx={{
              width: 30, height: 30,
              borderRadius: '8px',
              bgcolor: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              {instLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={instLogo} alt={instName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Image src="/KPSC MASTER.png" alt="Logo" width={26} height={26} style={{ objectFit: 'contain' }} />
              )}
            </Box>
            <Typography noWrap sx={{ fontWeight: 800, fontSize: '0.88rem', color: 'white', letterSpacing: '-0.01em' }}>
              {instName}
            </Typography>
          </Box>
        </Box>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Right side actions */}
        <Button
          variant="outlined"
          color="inherit"
          size="small"
          startIcon={<ExitToAppIcon sx={{ fontSize: '16px !important' }} />}
          onClick={() => router.push(instSlug ? `/institute/${instSlug}` : '/')}
          sx={{
            mr: { xs: 1, sm: 2 },
            px: { xs: 1.25, sm: 1.75 },
            py: 0.6,
            borderRadius: '10px',
            borderColor: 'rgba(255,255,255,0.18)',
            fontSize: { xs: '0.75rem', sm: '0.8rem' },
            fontWeight: 700,
            textTransform: 'none',
            whiteSpace: 'nowrap',
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