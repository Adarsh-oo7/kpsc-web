'use client';

import { useState } from 'react';
import { Box, IconButton, Avatar, Menu, MenuItem, Tooltip } from '@mui/material';
import { useAppContext } from '@/context/AppContext';

export default function ProfileMenu() {
  const { user, logout } = useAppContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  // ... other logic ...

  const handleClose = () => {
    setAnchorEl(null);
  };

  // --- CORRECTED: This function now handles the redirect ---
  const handleLogout = () => {
    logout(); // 1. Call the context to clear all user data and tokens
    handleClose(); // 2. Close the menu
    
    // 3. Force a full page navigation to the login screen.
    // This is the most robust way to ensure all old state is cleared.
    window.location.href = '/login';
  };

  return (
    <Box>
      <Tooltip title={user ? user.username : 'Guest'}>
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small" sx={{ ml: 2 }}>
          <Avatar sx={{ width: 40, height: 40, border: '2px solid white' }} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        // ... other Menu props ...
      >
        {/* The onClick now correctly calls the updated handleLogout */}
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
        {/* ... other MenuItems ... */}
      </Menu>
    </Box>
  );
}