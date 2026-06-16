'use client';

import Image from 'next/image';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Typography, Divider, useTheme, useMediaQuery } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import CategoryIcon from '@mui/icons-material/Category';
import EmailIcon from '@mui/icons-material/Email';
import StyleIcon from '@mui/icons-material/Style';
import SettingsIcon from '@mui/icons-material/Settings';
import PaymentsIcon from '@mui/icons-material/Payments';
import GroupsIcon from '@mui/icons-material/Groups';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import { usePathname } from 'next/navigation';

export const instituteDrawerWidth = 280;

interface InstituteSidebarProps {
  onNavigate: (path: string) => void;
}

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/institute/dashboard' },
  { text: 'Students', icon: <PeopleIcon />, path: '/institute/students' },
  { text: 'Batches', icon: <GroupsIcon />, path: '/institute/batches' },
  { text: 'Study Materials', icon: <DescriptionIcon />, path: '/institute/notes' },
  { text: 'Questions', icon: <LibraryBooksIcon />, path: '/institute/questions' },
  { text: 'Topics', icon: <CategoryIcon />, path: '/institute/topics' },
  { text: 'Messaging', icon: <EmailIcon />, path: '/institute/messaging' },
  { text: 'Fee Management', icon: <PaymentsIcon />, path: '/institute/fees' },
  { text: 'Join Requests', icon: <PersonSearchIcon />, path: '/institute/requests' },
  { text: 'Customization', icon: <StyleIcon />, path: '/institute/customization' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/institute/settings' },
];

const DrawerContent = ({ onNavigate }: { onNavigate: (path: string) => void }) => {
  const pathname = usePathname();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo Header */}
      <Box sx={{
        px: 2.5, py: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        background: 'linear-gradient(180deg, #0D1117 0%, #111820 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        minHeight: 72,
      }}>
        {/* Logo Image */}
        <Box sx={{
          width: 44,
          height: 44,
          borderRadius: '10px',
          overflow: 'hidden',
          bgcolor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
        }}>
          <Image
            src="/logo.png"
            alt="KPSC Master Logo"
            width={40}
            height={40}
            style={{ objectFit: 'contain' }}
          />
        </Box>

        {/* Brand Text */}
        <Box>
          <Typography sx={{
            fontSize: '0.95rem',
            fontWeight: 800,
            color: '#F0F4F8',
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
          }}>
            KPSC Master
          </Typography>
          <Typography sx={{
            fontSize: '0.65rem',
            color: '#2E8B57',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}>
            Institute Portal
          </Typography>
        </Box>
      </Box>

      {/* Nav Items */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1, pt: 1.5 }}>
        <List disablePadding>
          {menuItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => onNavigate(item.path)}
                  sx={{
                    borderRadius: '10px',
                    py: 1,
                    px: 1.5,
                    backgroundColor: isActive ? 'rgba(46,139,87,0.15)' : 'transparent',
                    '&:hover': {
                      backgroundColor: isActive ? 'rgba(46,139,87,0.2)' : 'rgba(255,255,255,0.04)',
                    },
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? '#2E8B57' : 'rgba(255,255,255,0.45)', minWidth: 36 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#F0F4F8' : 'rgba(255,255,255,0.6)',
                    }}
                  />
                  {isActive && (
                    <Box sx={{ width: 3, height: 18, borderRadius: 2, bgcolor: '#2E8B57', ml: 1 }} />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{
        p: 2,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
      }}>
        <Box sx={{
          width: 32, height: 32,
          borderRadius: '8px',
          overflow: 'hidden',
          bgcolor: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Image src="/logo.png" alt="logo" width={28} height={28} style={{ objectFit: 'contain' }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.3 }}>
            Powered by
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>
            KPSC Master
          </Typography>
        </Box>
      </Box>
    </div>
  );
};

export default function InstituteSidebar({ open, onClose, onNavigate }: InstituteSidebarProps & { open: boolean, onClose: () => void }) {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

  if (isLargeScreen) {
    return (
      <Drawer
        variant="permanent"
        sx={{
          width: instituteDrawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: instituteDrawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#0D1117',
            color: 'text.primary',
            borderRight: '1px solid rgba(255,255,255,0.06)',
          },
        }}
      >
        <DrawerContent onNavigate={onNavigate} />
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: 'block', lg: 'none' },
        [`& .MuiDrawer-paper`]: {
          boxSizing: 'border-box',
          width: instituteDrawerWidth,
          bgcolor: '#0D1117',
          color: 'text.primary',
        },
      }}
    >
      <DrawerContent onNavigate={onNavigate} />
    </Drawer>
  );
}