// src/components/NotificationsMenu.tsx

'use client';

import { useState } from 'react';
import { IconButton, Badge, Menu, MenuItem, ListItemText, Typography, Divider } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useAppContext } from '@/context/AppContext';

export default function NotificationsMenu() {
    const { messages, unreadCount, markAsRead, user } = useAppContext();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);
    
    const handleMessageClick = (messageId: number) => {
        markAsRead(messageId);
        // In the future, you could navigate to a full message page here
        handleClose();
    };

    return (
        <>
            <IconButton color="inherit" onClick={handleClick}>
                <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon />
                </Badge>
            </IconButton>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{ sx: { width: 360, maxHeight: 480, mt: 1.5, /* ...other PaperProps from ProfileMenu... */ } }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <Typography variant="h6" sx={{ p: 2 }}>Notifications</Typography>
                <Divider />
                {messages && messages.length > 0 ? (
                    messages.map((msg: any) => (
                        <MenuItem 
                            key={msg.id} 
                            onClick={() => handleMessageClick(msg.id)} 
                            selected={user ? !msg.read_by.includes(user.id) : false}
                        >
                            <ListItemText
                                primary={msg.subject}
                                secondary={msg.body}
                                primaryTypographyProps={{ fontWeight: 'bold' }}
                                secondaryTypographyProps={{ noWrap: true, variant: 'body2' }}
                            />
                        </MenuItem>
                    ))
                ) : (
                    <MenuItem disabled>You have no new notifications</MenuItem>
                )}
            </Menu>
        </>
    );
}