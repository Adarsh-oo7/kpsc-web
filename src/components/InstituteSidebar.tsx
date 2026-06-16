'use client';

import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Typography, Divider, useTheme, useMediaQuery } from '@mui/material';
// Import icons for the institute portal
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

// Define and export the drawer width for consistent layout
export const instituteDrawerWidth = 280;

interface InstituteSidebarProps {
  onNavigate: (path: string) => void;
}

// These are the links for the institute portal sidebar
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
    <div>
      <Box sx={{ p: 2.5, background: 'linear-gradient(135deg, #0D1117 0%, #161B22 100%)', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Typography variant="subtitle2" sx={{ fontSize: '0.65rem', fontWeight: 700, color: '#2E8B57', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 0.5 }}>
          Institute Portal
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem' }}>
          Admin Dashboard
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}/>
      <List sx={{ p: 1 }}>
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
                <ListItemIcon sx={{ color: isActive ? '#2E8B57' : 'rgba(255,255,255,0.5)', minWidth: 38 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#F0F4F8' : 'rgba(255,255,255,0.65)',
                  }}
                />
                {isActive && (
                  <Box sx={{ width: 3, height: 20, borderRadius: 2, bgcolor: '#2E8B57' }} />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </div>
  );
};


export default function InstituteSidebar({ open, onClose, onNavigate }: InstituteSidebarProps & { open: boolean, onClose: () => void }) {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

  // On large screens, render a permanent, always-visible sidebar
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

  // On smaller screens, render a temporary pop-out menu
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