'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton, // Using ListItemButton for better semantics and styling
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Divider,
  ListSubheader,
  CircularProgress, // Added for loading state
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import QuizIcon from '@mui/icons-material/Quiz';
import ExamIcon from '@mui/icons-material/Assignment';
import TopicIcon from '@mui/icons-material/Category';
import BarChartIcon from '@mui/icons-material/BarChart';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import ReportIcon from '@mui/icons-material/Report';
import HistoryIcon from '@mui/icons-material/History';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Exam } from '../types';
import { useAppContext } from '../../../context/AppContext';

const fetcher = async (url: string) => {
  const token = localStorage.getItem('access_token');
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (section: string) => void;
}

// Define common styles for list items to keep the code DRY
const listItemStyles = {
  '&.Mui-selected': {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
  },
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
};

export default function Sidebar({ open, onClose, onNavigate }: SidebarProps) {
  const { examId, setExamId, user, logout } = useAppContext();
  const { data: exams, error: examsError, isLoading: examsLoading } = useSWR<Exam[]>(
    `${process.env.NEXT_PUBLIC_API_URL}/exams/`,
    fetcher
  );

  const handleNavigation = (section: string) => {
    onNavigate(section);
    onClose();
  };
  
  const handleLogout = () => {
    logout();
    handleNavigation('home');
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      // Use sx prop to apply theme colors to the Drawer paper
      PaperProps={{
        sx: {
          width: 256,
          // Inherits background.paper from the theme
          // which is our dark green (#2E594F)
          bgcolor: 'background.paper',
        },
      }}
    >
      {/* Use sx prop for the header to match the main app bar */}
      <Box sx={{ p: 2, bgcolor: 'primary.main' }}>
        <Typography variant="h6">KPSC Quiz App</Typography>
        {user && (
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
            Welcome, {user.username}
          </Typography>
        )}
      </Box>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
      <List>
        {/* Main navigation items */}
        <ListItemButton sx={listItemStyles} onClick={() => handleNavigation('home')}>
          <ListItemIcon sx={{ color: 'text.primary' }}><HomeIcon /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>
        <ListItemButton sx={listItemStyles} onClick={() => handleNavigation('quiz')}>
          <ListItemIcon sx={{ color: 'text.primary' }}><QuizIcon /></ListItemIcon>
          <ListItemText primary="Quiz" />
        </ListItemButton>
         <ListItemButton sx={listItemStyles} onClick={() => handleNavigation('exams')}>
          <ListItemIcon sx={{ color: 'text.primary' }}><ExamIcon /></ListItemIcon>
          <ListItemText primary="Exam Type" />
        </ListItemButton>
        <ListItemButton sx={listItemStyles} onClick={() => handleNavigation('topics')}>
          <ListItemIcon sx={{ color: 'text.primary' }}><TopicIcon /></ListItemIcon>
          <ListItemText primary="Topics" />
        </ListItemButton>
        <ListItemButton sx={listItemStyles} onClick={() => handleNavigation('progress')}>
          <ListItemIcon sx={{ color: 'text.primary' }}><BarChartIcon /></ListItemIcon>
          <ListItemText primary="Progress" />
        </ListItemButton>
        <ListItemButton sx={listItemStyles} onClick={() => handleNavigation('previous-papers')}>
          <ListItemIcon sx={{ color: 'text.primary' }}><HistoryIcon /></ListItemIcon>
          <ListItemText primary="Previous Papers" />
        </ListItemButton>
        
        {/* User-specific items */}
        {user && (
          <>
            <ListItemButton sx={listItemStyles} onClick={() => handleNavigation('bookmarks')}>
              <ListItemIcon sx={{ color: 'text.primary' }}><BookmarkIcon /></ListItemIcon>
              <ListItemText primary="Bookmarks" />
            </ListItemButton>
             <ListItemButton sx={listItemStyles} onClick={() => handleNavigation('reports')}>
              <ListItemIcon sx={{ color: 'text.primary' }}><ReportIcon /></ListItemIcon>
              <ListItemText primary="Reports" />
            </ListItemButton>
            <ListItemButton sx={listItemStyles} onClick={() => handleNavigation('profile')}>
              <ListItemIcon sx={{ color: 'text.primary' }}><PersonIcon /></ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItemButton>
          </>
        )}

        {/* Settings */}
        <ListItemButton sx={listItemStyles} onClick={() => handleNavigation('settings')}>
          <ListItemIcon sx={{ color: 'text.primary' }}><SettingsIcon /></ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItemButton>

        {/* Auth items */}
        {!user ? (
          <>
            <ListItemButton sx={listItemStyles} onClick={() => handleNavigation('login')}>
              <ListItemIcon sx={{ color: 'text.primary' }}><LoginIcon /></ListItemIcon>
              <ListItemText primary="Login" />
            </ListItemButton>
            <ListItemButton sx={listItemStyles} onClick={() => handleNavigation('register')}>
              <ListItemIcon sx={{ color: 'text.primary' }}><PersonAddIcon /></ListItemIcon>
              <ListItemText primary="Register" />
            </ListItemButton>
          </>
        ) : (
          <ListItemButton sx={listItemStyles} onClick={handleLogout}>
            <ListItemIcon sx={{ color: 'text.primary' }}><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        )}
      </List>
      <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
      <List
        subheader={
          <ListSubheader sx={{ bgcolor: 'primary.main' }}>
            Exams
          </ListSubheader>
        }
      >
        <ListItemButton
          sx={listItemStyles}
          onClick={() => { setExamId(''); onClose(); }}
          selected={examId === ''}
        >
          <ListItemIcon sx={{ color: 'text.primary' }}><QuizIcon /></ListItemIcon>
          <ListItemText primary="All Exams" />
        </ListItemButton>
        
        {examsLoading && <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}><CircularProgress size={24} color="inherit" /></Box>}
        
        {examsError && (
          <ListItem>
            <ListItemText primary="Error loading exams" sx={{ color: 'error.main' }} />
          </ListItem>
        )}
        
        {exams?.map((exam) => (
          <ListItemButton
            key={exam.id}
            sx={listItemStyles}
            onClick={() => { setExamId(exam.id.toString()); onClose(); }}
            selected={examId === exam.id.toString()}
          >
            <ListItemIcon sx={{ color: 'text.primary' }}><QuizIcon /></ListItemIcon>
            <ListItemText primary={`${exam.name} (${exam.year})`} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}