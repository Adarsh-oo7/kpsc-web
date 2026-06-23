'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Box, Typography, CircularProgress, Stack, Button, List, ListItem, ListItemText, Divider
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DraftsIcon from '@mui/icons-material/Drafts';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';

export default function NotificationsPage() {
  const { user, profile, messages, markAsRead, fetcher, isLoading: ctxLoading } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!ctxLoading && !user) router.push('/login');
  }, [user, ctxLoading, router]);

  // Fetch announcements/messages
  const { data, mutate, isLoading } = useSWR(
    user ? '/my-messages/' : null,
    fetcher
  );

  const handleMarkRead = async (id: number) => {
    try {
      await markAsRead(id);
      mutate();
    } catch (err) {
      console.error(err);
    }
  };

  if (ctxLoading || isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={32} sx={{ color: '#2E8B57' }} />
      </Box>
    );
  }

  const allMessages = messages || [];

  return (
    <Box sx={{ maxWidth: 650, mx: 'auto', pb: 6 }}>
      {/* Title */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: '0.8rem', color: '#8B5CF6', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Inbox 🔔
        </Typography>
        <Typography variant="h4" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, color: '#F0F4F8', mt: 0.5 }}>
          Notification Center
        </Typography>
        <Typography sx={{ color: '#8892A4', fontSize: '0.9rem', mt: 0.5 }}>
          Updates from your coaches, class schedule announcements, and daily achievement rewards.
        </Typography>
      </Box>

      {allMessages.length === 0 ? (
        <Box sx={{
          textAlign: 'center', py: 8, px: 3,
          background: 'background.paper', borderRadius: '20px',
          border: '1px solid', borderColor: 'divider'
        }}>
          <Typography sx={{ fontSize: '2.5rem', mb: 1.5 }}>🔔</Typography>
          <Typography sx={{ fontWeight: 800, color: '#F0F4F8', fontFamily: "'Cabinet Grotesk'", mb: 0.5 }}>
            You're all caught up!
          </Typography>
          <Typography sx={{ color: '#8892A4', fontSize: '0.875rem' }}>
            Come back after today's quiz to check for new alerts.
          </Typography>
        </Box>
      ) : (
        <List disablePadding sx={{ background: 'background.paper', borderRadius: '20px', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <AnimatePresence mode="popLayout">
            {allMessages.map((msg: any, i: number) => {
              const isRead = msg.read_by?.includes(user?.id);
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Box>
                    <ListItem
                      onClick={() => !isRead && handleMarkRead(msg.id)}
                      sx={{
                        cursor: 'pointer',
                        py: 2.5, px: 3,
                        background: !isRead ? 'rgba(27,107,58,0.06)' : 'transparent',
                        '&:hover': { background: 'rgba(255,255,255,0.02)' },
                        display: 'flex', alignItems: 'flex-start', gap: 2,
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      <Box sx={{
                        mt: 0.5,
                        width: 32, height: 32,
                        borderRadius: '50%',
                        bgcolor: !isRead ? 'rgba(46,139,87,0.15)' : 'rgba(255,255,255,0.03)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: !isRead ? '#2E8B57' : '#8892A4'
                      }}>
                        {!isRead ? <NotificationsIcon sx={{ fontSize: 16 }} /> : <DraftsIcon sx={{ fontSize: 16 }} />}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography sx={{
                          fontWeight: !isRead ? 800 : 500,
                          color: !isRead ? '#F0F4F8' : '#8892A4',
                          fontSize: '0.9rem',
                          fontFamily: "'Satoshi', sans-serif"
                        }}>
                          {msg.subject || msg.title || 'System Notification'}
                        </Typography>
                        <Typography sx={{ color: '#8892A4', fontSize: '0.8rem', mt: 0.5, lineHeight: 1.5 }}>
                          {msg.body || msg.content}
                        </Typography>
                        <Typography sx={{ fontSize: '0.65rem', color: '#4A5568', mt: 1, fontFamily: "'JetBrains Mono'" }}>
                          {msg.sent_at ? new Date(msg.sent_at).toLocaleString() : 'Just now'}
                        </Typography>
                      </Box>

                      {!isRead && (
                        <Button
                          size="small"
                          onClick={(e) => { e.stopPropagation(); handleMarkRead(msg.id); }}
                          sx={{ textTransform: 'none', color: '#2E8B57', fontSize: '0.75rem', fontWeight: 700 }}
                        >
                          Mark read
                        </Button>
                      )}
                    </ListItem>
                    {i < allMessages.length - 1 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.04)' }} />}
                  </Box>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </List>
      )}
    </Box>
  );
}
