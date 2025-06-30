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

// Define and export the drawer width for consistent layout
export const instituteDrawerWidth = 280;

interface InstituteSidebarProps {
  onNavigate: (path: string) => void;
}

// These are the links for the institute portal sidebar
const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/institute/dashboard' },
  { text: 'Students', icon: <PeopleIcon />, path: '/institute/students' },
  { text: 'Questions', icon: <LibraryBooksIcon />, path: '/institute/questions' },
  { text: 'Topics', icon: <CategoryIcon />, path: '/institute/topics' },
  { text: 'Messaging', icon: <EmailIcon />, path: '/institute/messaging' },
  { text: 'Fee Management', icon: <PaymentsIcon />, path: '/institute/fees' }, // Assuming a future fees overview page
  { text: 'Customization', icon: <StyleIcon />, path: '/institute/customization' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/institute/settings' },
];

const DrawerContent = ({ onNavigate }: { onNavigate: (path: string) => void }) => (
    <div>
        <Box sx={{ p: 2, bgcolor: 'primary.dark', color: 'white' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Institute Portal
            </Typography>
        </Box>
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }}/>
        <List>
            {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
                <ListItemButton onClick={() => onNavigate(item.path)}>
                <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
                </ListItemButton>
            </ListItem>
            ))}
        </List>
    </div>
);


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
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    borderRight: 'none'
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
            bgcolor: 'background.paper',
            color: 'text.primary',
        },
      }}
    >
      <DrawerContent onNavigate={onNavigate} />
    </Drawer>
  );
}