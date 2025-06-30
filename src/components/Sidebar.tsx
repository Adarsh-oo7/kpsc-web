'use client';

import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Typography, Divider, useTheme, useMediaQuery } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import QuizIcon from '@mui/icons-material/Quiz';
import HistoryIcon from '@mui/icons-material/History';
import SchoolIcon from '@mui/icons-material/School';
import CategoryIcon from '@mui/icons-material/Category';

// Define and export a constant for the drawer width.
// This allows your main layout to use the same value for perfect alignment.
export const drawerWidth = 260;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

const mainItems = [
  { text: 'Home', icon: <HomeIcon />, path: '/' },
  { text: 'Take a Quiz', icon: <QuizIcon />, path: '/quiz' },
  { text: 'Exams', icon: <SchoolIcon />, path: '/exams' },
  { text: 'Topics', icon: <CategoryIcon />, path: '/topics' },
  { text: 'Previous Papers', icon: <HistoryIcon />, path: '/previous-papers' },
];

// Clean Modern Blue Theme Colors
const blueTheme = {
  primary: '#1976d2',      // Material Blue 700
  primaryDark: '#1565c0',  // Material Blue 800
  primaryLight: '#42a5f5', // Material Blue 400
  secondary: '#546e7a',    // Blue Gray 600
  background: '#fafafa',   // Light Gray
  surface: '#ffffff',      // White
  text: {
    primary: '#263238',    // Blue Gray 900
    secondary: '#546e7a',  // Blue Gray 600
    white: '#ffffff'
  },
  accent: '#e3f2fd'        // Light Blue 50
};

// Reusable content for the drawer to avoid repeating code
const DrawerContent = ({ onNavigate }: { onNavigate: (path: string) => void }) => (
    <div>
        <Box sx={{ 
            p: 3, 
            background: `linear-gradient(135deg, ${blueTheme.primary} 0%, ${blueTheme.primaryDark} 100%)`,
            color: blueTheme.text.white,
            borderBottom: `1px solid ${blueTheme.accent}`
        }}>
            <Typography variant="h6" sx={{ 
                fontWeight: 600,
                letterSpacing: '0.5px',
                fontSize: '1.1rem'
            }}>
                Navigation
            </Typography>
        </Box>
        <List sx={{ 
            py: 1,
            bgcolor: blueTheme.surface
        }}>
            {mainItems.map((item, index) => (
            <ListItem key={item.text} disablePadding>
                <ListItemButton 
                    onClick={() => onNavigate(item.path)}
                    sx={{
                        mx: 1,
                        mb: 0.5,
                        borderRadius: 2,
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            bgcolor: blueTheme.accent,
                            color: blueTheme.primary,
                            transform: 'translateX(4px)',
                            boxShadow: `0 2px 8px ${blueTheme.primary}20`
                        },
                        '&:active': {
                            transform: 'translateX(2px)',
                        }
                    }}
                >
                    <ListItemIcon sx={{ 
                        color: blueTheme.secondary,
                        minWidth: 40,
                        transition: 'color 0.2s ease-in-out',
                        '.MuiListItemButton-root:hover &': {
                            color: blueTheme.primary
                        }
                    }}>
                        {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                        primary={item.text} 
                        sx={{
                            '& .MuiListItemText-primary': {
                                color: blueTheme.text.primary,
                                fontWeight: 500,
                                fontSize: '0.95rem',
                                transition: 'color 0.2s ease-in-out',
                                '.MuiListItemButton-root:hover &': {
                                    color: blueTheme.primary,
                                    fontWeight: 600
                                }
                            }
                        }}
                    />
                </ListItemButton>
            </ListItem>
            ))}
        </List>
    </div>
);

export default function Sidebar({ open, onClose, onNavigate }: SidebarProps) {
  const theme = useTheme();
  // Check if the screen is large (lg breakpoint = 1200px and up)
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

  // On large screens, render a permanent, always-visible sidebar
  if (isLargeScreen) {
    return (
        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                [`& .MuiDrawer-paper`]: { 
                    width: drawerWidth, 
                    boxSizing: 'border-box',
                    bgcolor: blueTheme.background,
                    borderRight: `1px solid ${blueTheme.accent}`,
                    boxShadow: '0 0 20px rgba(25, 118, 210, 0.08)'
                },
            }}
        >
            <DrawerContent onNavigate={onNavigate} />
        </Drawer>
    );
  }

  // On smaller screens, render the temporary pop-out menu you already had
  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better for mobile performance
      }}
      sx={{
        display: { xs: 'block', lg: 'none' },
        [`& .MuiDrawer-paper`]: { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            bgcolor: blueTheme.background,
            boxShadow: '0 8px 32px rgba(25, 118, 210, 0.15)'
        },
      }}
    >
      <DrawerContent onNavigate={onNavigate} />
    </Drawer>
  );
}