'use client';

import { AppBar, Toolbar, Box, Button, IconButton } from '@mui/material';
import { useRouter } from 'next/navigation';
import ProfileMenu from '@/components/ProfileMenu';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import MenuIcon from '@mui/icons-material/Menu';
import { instituteDrawerWidth } from './InstituteSidebar'; // Import width

interface InstituteHeaderProps {
  onDrawerToggle: () => void;
}

export default function InstituteHeader({ onDrawerToggle }: InstituteHeaderProps) {
    const router = useRouter();

    return (
        <AppBar
          position="fixed"
          sx={{
            bgcolor: 'primary.main',
            boxShadow: 2,
            // Adjust width and position for the permanent sidebar on large screens
            width: { lg: `calc(100% - ${instituteDrawerWidth}px)` },
            ml: { lg: `${instituteDrawerWidth}px` },
          }}
        >
            <Toolbar>
              {/* Hamburger icon for mobile */}
              <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={onDrawerToggle}
                  sx={{ mr: 2, display: { lg: 'none' } }}
              >
                  <MenuIcon />
              </IconButton>

              {/* This Box pushes subsequent items to the right */}
              <Box sx={{ flexGrow: 1 }} />

              <Button
                variant="outlined"
                color="inherit"
                startIcon={<ExitToAppIcon />}
                onClick={() => router.push('/')}
                sx={{ 
                  mr: 2, 
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Student View
              </Button>
              <ProfileMenu />
            </Toolbar>
        </AppBar>
    );
}