'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Box, Typography, Card, CardContent, Button, TextField, Avatar,
  IconButton, Stack, Chip, Divider, CircularProgress, Alert, Paper,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import CloseIcon from '@mui/icons-material/Close';
import TagIcon from '@mui/icons-material/Tag';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';
import { apiErrorMessage } from '@/lib/auth';

const GREEN = '#1B6B3A';
const GREEN_LIGHT = '#2E8B57';

function asList(data: unknown): any[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray((data as { results?: unknown }).results)) {
    return (data as { results: any[] }).results;
  }
  return [];
}

function isImageUrl(url?: string | null) {
  if (!url) return false;
  return /\.(jpe?g|png|gif|webp)(\?|$)/i.test(url);
}

function displayName(person?: { username?: string; full_name?: string; first_name?: string }) {
  return person?.full_name || person?.first_name || person?.username || 'Aspirant';
}

export default function CommunityClient() {
  const { user, fetcher } = useAppContext();
  const router = useRouter();

  const { data: feedData, mutate: mutateFeed, error: feedError, isLoading: feedLoading } = useSWR(
    '/community/posts/',
    fetcher,
  );

  const [postTitle, setPostTitle] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});
  const [postComments, setPostComments] = useState<Record<number, any[]>>({});
  const [loadingComments, setLoadingComments] = useState<Record<number, boolean>>({});
  const [newCommentText, setNewCommentText] = useState<Record<number, string>>({});

  const postsList = useMemo(() => asList(feedData), [feedData]);

  const goLogin = () => {
    router.push(`/login?next=${encodeURIComponent('/community')}`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Attachment must be less than 10MB.');
      return;
    }
    setSelectedFile(file);
    setFilePreview(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
    setErrorMsg('');
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      goLogin();
      return;
    }
    if (!postTitle.trim()) {
      setErrorMsg('Write something before publishing.');
      return;
    }
    if (postTitle.trim().length > 255) {
      setErrorMsg('Keep the post under 255 characters.');
      return;
    }

    setIsSubmittingPost(true);
    setErrorMsg('');
    const formData = new FormData();
    formData.append('title', postTitle.trim());
    if (tagsInput.trim()) formData.append('tags_input', tagsInput.trim());
    if (selectedFile) formData.append('file', selectedFile);

    try {
      await apiClient.post('/community/posts/', formData);
      setPostTitle('');
      setTagsInput('');
      setSelectedFile(null);
      setFilePreview(null);
      mutateFeed();
    } catch (err: unknown) {
      setErrorMsg(apiErrorMessage(err, 'Could not publish. Try again.'));
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleLikePost = async (postId: number) => {
    if (!user) {
      goLogin();
      return;
    }
    try {
      const res = await apiClient.post(`/community/posts/${postId}/like/`);
      const { likes_count, is_liked } = res.data;
      mutateFeed((currentData: any) => {
        if (!currentData) return currentData;
        const posts = asList(currentData);
        const updatedPosts = posts.map((post: any) => (
          post.id === postId ? { ...post, likes_count, is_liked_by_user: is_liked } : post
        ));
        return currentData.results ? { ...currentData, results: updatedPosts } : updatedPosts;
      }, false);
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const fetchComments = async (postId: number) => {
    setLoadingComments((prev) => ({ ...prev, [postId]: true }));
    try {
      const res = await apiClient.get(`/community/posts/${postId}/comments/`);
      setPostComments((prev) => ({ ...prev, [postId]: asList(res.data) }));
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoadingComments((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const toggleComments = async (postId: number) => {
    const isExpanded = expandedComments[postId];
    setExpandedComments({ ...expandedComments, [postId]: !isExpanded });
    if (!isExpanded && !postComments[postId]) fetchComments(postId);
  };

  const handleSubmitComment = async (postId: number) => {
    if (!user) {
      goLogin();
      return;
    }
    const text = newCommentText[postId];
    if (!text?.trim()) return;
    try {
      const res = await apiClient.post(`/community/posts/${postId}/comments/`, { text: text.trim() });
      setPostComments((prev) => ({ ...prev, [postId]: [res.data, ...(prev[postId] || [])] }));
      setNewCommentText((prev) => ({ ...prev, [postId]: '' }));
      mutateFeed((currentData: any) => {
        if (!currentData) return currentData;
        const posts = asList(currentData);
        const updatedPosts = posts.map((post: any) => (
          post.id === postId ? { ...post, comments_count: (post.comments_count || 0) + 1 } : post
        ));
        return currentData.results ? { ...currentData, results: updatedPosts } : updatedPosts;
      }, false);
    } catch (err) {
      console.error('Failed to submit comment:', err);
    }
  };

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto', pb: 8 }}>
      <Paper
        elevation={0}
        sx={{
          mb: 3.5,
          p: { xs: 3, md: 4 },
          borderRadius: '24px',
          background: `linear-gradient(165deg, ${GREEN} 0%, #166534 50%, #134E2A 100%)`,
          color: '#fff',
        }}
      >
        <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#FCD34D', mb: 1 }}>
          Aspirants room
        </Typography>
        <Typography sx={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 900, fontSize: { xs: '1.7rem', md: '2.2rem' }, letterSpacing: '-0.03em' }}>
          Ask, share, and revise together.
        </Typography>
        <Typography sx={{ mt: 1.25, color: 'rgba(255,255,255,0.86)', maxWidth: 520, lineHeight: 1.55 }}>
          Notes, doubts, and exam talk from Kerala PSC students. Anyone can read. Login to post, like, or comment.
        </Typography>
      </Paper>

      <Card
        elevation={0}
        sx={{
          border: '1.5px solid',
          borderColor: 'divider',
          borderRadius: '20px',
          mb: 3.5,
        }}
      >
        <CardContent sx={{ p: { xs: 2.25, md: 3 } }}>
          {errorMsg && <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{errorMsg}</Alert>}
          {!user && (
            <Alert
              severity="info"
              sx={{ mb: 2, borderRadius: '12px' }}
              action={(
                <Button color="inherit" size="small" onClick={goLogin} sx={{ fontWeight: 800, textTransform: 'none' }}>
                  Login
                </Button>
              )}
            >
              Login to publish a post.
            </Alert>
          )}
          <form onSubmit={handleCreatePost}>
            <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
              <Avatar sx={{ bgcolor: GREEN, fontWeight: 900 }}>
                {user?.username?.[0]?.toUpperCase() || <ForumOutlinedIcon />}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <TextField
                  placeholder="Ask a doubt or share a study note..."
                  multiline
                  rows={3}
                  fullWidth
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  disabled={!user}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'action.hover',
                      borderRadius: '12px',
                    },
                  }}
                />
              </Box>
            </Stack>

            <AnimatePresence>
              {filePreview && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ position: 'relative', marginBottom: 16 }}>
                  <img src={filePreview} alt="Upload preview" style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 12 }} />
                  <IconButton onClick={handleRemoveFile} sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff' }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </motion.div>
              )}
            </AnimatePresence>

            {selectedFile && !filePreview && (
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2, bgcolor: 'action.hover', p: 1, borderRadius: '8px' }}>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', flexGrow: 1 }}>{selectedFile.name}</Typography>
                <IconButton size="small" onClick={handleRemoveFile}><CloseIcon fontSize="small" /></IconButton>
              </Stack>
            )}

            <Divider sx={{ mb: 2 }} />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ sm: 'center' }}>
              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                <Button
                  component="label"
                  startIcon={<ImageOutlinedIcon />}
                  disabled={!user}
                  sx={{ color: 'text.secondary', textTransform: 'none', fontWeight: 700 }}
                >
                  Photo / PDF
                  <input type="file" hidden onChange={handleFileChange} accept="image/*,application/pdf" />
                </Button>
                <TextField
                  placeholder="tags, e.g. ldc"
                  size="small"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  disabled={!user}
                  InputProps={{ startAdornment: <TagIcon sx={{ color: 'text.secondary', fontSize: 16, mr: 0.5 }} /> }}
                  sx={{ width: { xs: '100%', sm: 180 } }}
                />
              </Stack>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmittingPost || !postTitle.trim()}
                sx={{
                  background: `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})`,
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 800,
                  borderRadius: '12px',
                  px: 3,
                }}
              >
                {isSubmittingPost ? <CircularProgress size={20} color="inherit" /> : user ? 'Publish' : 'Login to publish'}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>

      {feedError && <Alert severity="error" sx={{ mb: 3, borderRadius: '14px' }}>Could not load the community feed.</Alert>}

      {feedLoading && postsList.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: GREEN_LIGHT }} />
        </Box>
      ) : postsList.length === 0 ? (
        <Paper sx={{ textAlign: 'center', py: 8, px: 3, borderRadius: '20px', border: '1.5px solid', borderColor: 'divider' }}>
          <Typography sx={{ color: 'text.secondary', fontWeight: 700 }}>No posts yet. Be the first to share.</Typography>
        </Paper>
      ) : (
        <Stack spacing={2.5}>
          {postsList.map((post: any) => {
            const hasLiked = post.is_liked_by_user;
            const commentsOpen = expandedComments[post.id];
            const comments = postComments[post.id] || [];
            const isLoading = loadingComments[post.id];
            const fileUrl = typeof post.file === 'string' ? post.file : '';
            return (
              <motion.div key={post.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                <Card elevation={0} sx={{ border: '1.5px solid', borderColor: 'divider', borderRadius: '20px' }}>
                  <CardContent sx={{ p: { xs: 2.25, md: 3 } }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#8B5CF6', fontWeight: 900 }}>
                        {displayName(post.author).slice(0, 1).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.95rem' }}>
                          {displayName(post.author)}
                        </Typography>
                        <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                          {post.created_at ? new Date(post.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                        </Typography>
                      </Box>
                    </Stack>

                    <Typography sx={{ color: 'text.primary', fontSize: '1rem', mb: 2, whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>
                      {post.title}
                    </Typography>

                    {fileUrl && (
                      <Box sx={{ mb: 2, borderRadius: '12px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                        {isImageUrl(fileUrl) ? (
                          <img src={fileUrl} alt="Attachment" style={{ width: '100%', maxHeight: 420, objectFit: 'cover' }} />
                        ) : (
                          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'action.hover' }}>
                            <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>Document attached</Typography>
                            <Button href={fileUrl} target="_blank" size="small" sx={{ textTransform: 'none', fontWeight: 800, color: GREEN }}>
                              Open
                            </Button>
                          </Box>
                        )}
                      </Box>
                    )}

                    {post.tags?.length > 0 && (
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                        {post.tags.map((tag: any) => (
                          <Chip
                            key={tag.id}
                            label={`#${tag.name}`}
                            size="small"
                            sx={{ bgcolor: 'rgba(27,107,58,0.08)', color: GREEN, fontWeight: 700, fontSize: '0.72rem' }}
                          />
                        ))}
                      </Stack>
                    )}

                    <Divider sx={{ mb: 1.5 }} />

                    <Stack direction="row" spacing={3}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <IconButton size="small" onClick={() => handleLikePost(post.id)} sx={{ color: hasLiked ? '#EF4444' : 'text.secondary' }}>
                          {hasLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                        </IconButton>
                        <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', fontWeight: 700 }}>{post.likes_count || 0}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <IconButton size="small" onClick={() => toggleComments(post.id)} sx={{ color: commentsOpen ? GREEN : 'text.secondary' }}>
                          <ChatBubbleOutlineIcon fontSize="small" />
                        </IconButton>
                        <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', fontWeight: 700 }}>{post.comments_count || 0}</Typography>
                      </Stack>
                    </Stack>

                    <AnimatePresence>
                      {commentsOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                          <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                              <TextField
                                placeholder={user ? 'Write a comment...' : 'Login to comment'}
                                fullWidth
                                size="small"
                                value={newCommentText[post.id] || ''}
                                onChange={(e) => setNewCommentText({ ...newCommentText, [post.id]: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmitComment(post.id);
                                  }
                                }}
                              />
                              <IconButton onClick={() => handleSubmitComment(post.id)} disabled={!newCommentText[post.id]?.trim()} sx={{ color: GREEN }}>
                                <SendIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                            {isLoading ? (
                              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                <CircularProgress size={16} sx={{ color: GREEN_LIGHT }} />
                              </Box>
                            ) : comments.length === 0 ? (
                              <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', textAlign: 'center' }}>No comments yet.</Typography>
                            ) : (
                              <Stack spacing={1.25}>
                                {comments.map((comment: any) => (
                                  <Box key={comment.id} sx={{ bgcolor: 'action.hover', p: 1.5, borderRadius: '12px' }}>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                      <Avatar sx={{ width: 22, height: 22, fontSize: '0.7rem', bgcolor: '#8B5CF6' }}>
                                        {displayName(comment.author).slice(0, 1).toUpperCase()}
                                      </Avatar>
                                      <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.8rem' }}>
                                        {displayName(comment.author)}
                                      </Typography>
                                    </Stack>
                                    <Typography sx={{ color: 'text.primary', fontSize: '0.85rem', pl: 4, lineHeight: 1.45 }}>
                                      {comment.text}
                                    </Typography>
                                  </Box>
                                ))}
                              </Stack>
                            )}
                          </Box>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
