'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Box, Typography, Card, CardContent, Button, TextField, Avatar,
  IconButton, Stack, Chip, Divider, CircularProgress, Alert
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import CloseIcon from '@mui/icons-material/Close';
import TagIcon from '@mui/icons-material/Tag';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';

export default function CommunityClient() {
  const { user, fetcher, isLoading: ctxLoading } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    if (!ctxLoading && !user) router.push('/login');
  }, [user, ctxLoading, router]);

  // Feed fetching
  const { data: feedData, mutate: mutateFeed, error: feedError } = useSWR(
    user ? '/community/posts/' : null,
    fetcher
  );

  // Post creation state
  const [postTitle, setPostTitle] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Comments state map by post id
  const [expandedComments, setExpandedComments] = useState<{ [key: number]: boolean }>({});
  const [postComments, setPostComments] = useState<{ [key: number]: any[] }>({});
  const [loadingComments, setLoadingComments] = useState<{ [key: number]: boolean }>({});
  const [newCommentText, setNewCommentText] = useState<{ [key: number]: string }>({});

  if (ctxLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={32} sx={{ color: '#2E8B57' }} />
      </Box>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('Attachment must be less than 10MB.');
        return;
      }
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null);
      }
      setErrorMsg('');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim()) {
      setErrorMsg('Post content cannot be empty.');
      return;
    }

    setIsSubmittingPost(true);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('title', postTitle);
    if (tagsInput) {
      formData.append('tags_input', tagsInput);
    }
    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    try {
      await apiClient.post('/community/posts/', formData);
      setPostTitle('');
      setTagsInput('');
      setSelectedFile(null);
      setFilePreview(null);
      mutateFeed();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Failed to publish post.');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleLikePost = async (postId: number) => {
    try {
      const res = await apiClient.post(`/community/posts/${postId}/like/`);
      const { likes_count, is_liked } = res.data;

      // Update feed SWR cache locally
      mutateFeed(
        (currentData: any) => {
          if (!currentData) return currentData;
          // SWR endpoints might return paginated or array structure
          const posts = currentData.results || currentData;
          const updatedPosts = posts.map((post: any) => {
            if (post.id === postId) {
              return {
                ...post,
                likes_count,
                is_liked_by_user: is_liked
              };
            }
            return post;
          });
          return currentData.results ? { ...currentData, results: updatedPosts } : updatedPosts;
        },
        false
      );
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const toggleComments = async (postId: number) => {
    const isExpanded = expandedComments[postId];
    setExpandedComments({ ...expandedComments, [postId]: !isExpanded });

    if (!isExpanded && !postComments[postId]) {
      fetchComments(postId);
    }
  };

  const fetchComments = async (postId: number) => {
    setLoadingComments(prev => ({ ...prev, [postId]: true }));
    try {
      const res = await apiClient.get(`/community/posts/${postId}/comments/`);
      // DRF list endpoints might return array or { results: [] }
      const data = res.data.results || res.data;
      setPostComments(prev => ({ ...prev, [postId]: data }));
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setLoadingComments(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleSubmitComment = async (postId: number) => {
    const text = newCommentText[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await apiClient.post(`/community/posts/${postId}/comments/`, { text });
      
      // Update local comments list
      const newComment = res.data;
      setPostComments(prev => ({
        ...prev,
        [postId]: [newComment, ...(prev[postId] || [])]
      }));

      // Clear input
      setNewCommentText(prev => ({ ...prev, [postId]: '' }));

      // Update comment count in feedSWR cache
      mutateFeed(
        (currentData: any) => {
          if (!currentData) return currentData;
          const posts = currentData.results || currentData;
          const updatedPosts = posts.map((post: any) => {
            if (post.id === postId) {
              return {
                ...post,
                comments_count: (post.comments_count || 0) + 1
              };
            }
            return post;
          });
          return currentData.results ? { ...currentData, results: updatedPosts } : updatedPosts;
        },
        false
      );
    } catch (err) {
      console.error('Failed to submit comment:', err);
    }
  };

  const postsList = feedData?.results || feedData || [];

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', pb: 8, px: 2 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 950, color: '#F0F4F8', mb: 1 }}>
          Aspirants Feed 💬
        </Typography>
        <Typography sx={{ color: '#8892A4', fontSize: '0.9rem' }}>
          Ask questions, discuss topics, share facts, and crack the Kerala PSC exam together.
        </Typography>
      </Box>

      {/* Publish Form Card */}
      <Card sx={{
        background: '#161B22',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '20px',
        mb: 4,
        overflow: 'visible'
      }}>
        <CardContent sx={{ p: 3 }}>
          {errorMsg && <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>{errorMsg}</Alert>}
          <form onSubmit={handleCreatePost}>
            <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 2 }}>
              <Avatar sx={{ bgcolor: '#2E8B57', fontWeight: 900 }}>
                {user?.username?.[0]?.toUpperCase()}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <TextField
                  placeholder="Ask a question or share study material..."
                  multiline
                  rows={3}
                  fullWidth
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  sx={{
                    '& textarea': { color: '#F0F4F8' },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { border: 'none' },
                      p: 1
                    },
                    bgcolor: 'rgba(255,255,255,0.02)',
                    borderRadius: '12px'
                  }}
                />
              </Box>
            </Stack>

            {/* File Preview */}
            <AnimatePresence>
              {filePreview && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ position: 'relative', marginBottom: '16px' }}>
                  <img
                    src={filePreview}
                    alt="Upload Preview"
                    style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '12px' }}
                  />
                  <IconButton
                    onClick={handleRemoveFile}
                    sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Attachment filename (non-image) */}
            {selectedFile && !filePreview && (
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.04)', p: 1, borderRadius: '8px' }}>
                <Typography sx={{ color: '#D0D8E0', fontSize: '0.8rem', flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  📂 {selectedFile.name}
                </Typography>
                <IconButton size="small" onClick={handleRemoveFile} sx={{ color: '#8892A4' }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Stack>
            )}

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 2 }} />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ sm: 'center' }}>
              <Stack direction="row" spacing={2}>
                {/* Upload Button */}
                <Button
                  component="label"
                  startIcon={<ImageOutlinedIcon />}
                  sx={{ color: '#8892A4', textTransform: 'none', fontWeight: 700 }}
                >
                  Photo/File
                  <input type="file" hidden onChange={handleFileChange} accept="image/*,application/pdf" />
                </Button>

                {/* Tags Field */}
                <TextField
                  placeholder="gandhi, math"
                  size="small"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  InputProps={{
                    startAdornment: <TagIcon sx={{ color: '#8892A4', fontSize: 16, mr: 0.5 }} />
                  }}
                  sx={{
                    width: 140,
                    '& input': { color: '#F0F4F8', fontSize: '0.8rem', py: 0.5 },
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.1)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&.Mui-focused fieldset': { borderColor: '#2E8B57' },
                    bgcolor: 'rgba(255,255,255,0.01)',
                    borderRadius: '8px'
                  }}
                />
              </Stack>

              <Button
                type="submit"
                variant="contained"
                disabled={isSubmittingPost || !postTitle.trim()}
                sx={{
                  background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: '10px',
                  px: 3
                }}
              >
                {isSubmittingPost ? <CircularProgress size={20} color="inherit" /> : 'Publish'}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>

      {/* Feed List */}
      <Stack spacing={3}>
        {postsList.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, px: 3, background: '#161B22', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <CircularProgress size={24} sx={{ color: '#2E8B57', mb: 2 }} />
            <Typography sx={{ color: '#8892A4', fontSize: '0.9rem' }}>
              No community updates yet. Be the first to share a post!
            </Typography>
          </Box>
        ) : (
          postsList.map((post: any) => {
            const hasLiked = post.is_liked_by_user;
            const commentsOpen = expandedComments[post.id];
            const comments = postComments[post.id] || [];
            const isLoading = loadingComments[post.id];

            return (
              <motion.div key={post.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card sx={{
                  background: '#161B22',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '20px',
                  overflow: 'hidden'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    {/* Header */}
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#8B5CF6', fontWeight: 900 }}>
                        {post.author?.username?.[0]?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 800, color: '#F0F4F8', fontSize: '0.95rem' }}>
                          {post.author?.username}
                        </Typography>
                        <Typography sx={{ color: '#8892A4', fontSize: '0.7rem' }}>
                          {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {new Date(post.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* Content text */}
                    <Typography sx={{ color: '#E4EAF0', fontSize: '0.95rem', mb: 2, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                      {post.title}
                    </Typography>

                    {/* Content attachment */}
                    {post.file && (
                      <Box sx={{ mb: 2, borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                        {post.file.match(/\.(jpeg|jpg|gif|png|webp)/i) ? (
                          <img
                            src={post.file}
                            alt="Attachment"
                            style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
                          />
                        ) : (
                          <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography sx={{ color: '#D0D8E0', fontSize: '0.85rem' }}>
                              📄 Document Attachment
                            </Typography>
                            <Button
                              href={post.file}
                              target="_blank"
                              variant="outlined"
                              size="small"
                              sx={{ textTransform: 'none', color: '#2E8B57', borderColor: '#2E8B57' }}
                            >
                              Download
                            </Button>
                          </Box>
                        )}
                      </Box>
                    )}

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2.5 }}>
                        {post.tags.map((tag: any) => (
                          <Chip
                            key={tag.id}
                            label={`#${tag.name}`}
                            size="small"
                            sx={{ bgcolor: 'rgba(139, 92, 246, 0.08)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.15)', fontSize: '0.7rem' }}
                          />
                        ))}
                      </Stack>
                    )}

                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 1.5 }} />

                    {/* Actions bar */}
                    <Stack direction="row" spacing={3}>
                      {/* Like */}
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <IconButton size="small" onClick={() => handleLikePost(post.id)} sx={{ color: hasLiked ? '#FF6B6B' : '#8892A4' }}>
                          {hasLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                        </IconButton>
                        <Typography sx={{ color: '#8892A4', fontSize: '0.8rem', fontWeight: 650 }}>
                          {post.likes_count || 0}
                        </Typography>
                      </Stack>

                      {/* Comments toggle */}
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <IconButton size="small" onClick={() => toggleComments(post.id)} sx={{ color: commentsOpen ? '#2E8B57' : '#8892A4' }}>
                          <ChatBubbleOutlineIcon fontSize="small" />
                        </IconButton>
                        <Typography sx={{ color: '#8892A4', fontSize: '0.8rem', fontWeight: 650 }}>
                          {post.comments_count || 0}
                        </Typography>
                      </Stack>
                    </Stack>

                    {/* Comments Drawer / Section */}
                    <AnimatePresence>
                      {commentsOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                          <Box sx={{ mt: 3, pt: 2.5, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                            
                            {/* Comment Input */}
                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                              <TextField
                                placeholder="Add a comment..."
                                fullWidth
                                size="small"
                                value={newCommentText[post.id] || ''}
                                onChange={(e) => setNewCommentText({ ...newCommentText, [post.id]: e.target.value })}
                                sx={{
                                  '& input': { color: '#F0F4F8', fontSize: '0.85rem' },
                                  '& fieldset': { borderColor: 'rgba(255,255,255,0.08)' },
                                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
                                  '&.Mui-focused fieldset': { borderColor: '#2E8B57' },
                                  bgcolor: 'rgba(255,255,255,0.01)',
                                  borderRadius: '8px'
                                }}
                              />
                              <IconButton
                                onClick={() => handleSubmitComment(post.id)}
                                disabled={!newCommentText[post.id]?.trim()}
                                sx={{ color: '#2E8B57', '&.Mui-disabled': { color: 'rgba(255,255,255,0.1)' } }}
                              >
                                <SendIcon fontSize="small" />
                              </IconButton>
                            </Stack>

                            {/* Comments Listing */}
                            {isLoading ? (
                              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                <CircularProgress size={16} sx={{ color: '#2E8B57' }} />
                              </Box>
                            ) : comments.length === 0 ? (
                              <Typography sx={{ color: '#8892A4', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center', py: 1 }}>
                                No comments on this post yet.
                              </Typography>
                            ) : (
                              <Stack spacing={2}>
                                {comments.map((comment: any) => (
                                  <Box key={comment.id} sx={{ bgcolor: 'rgba(255,255,255,0.02)', p: 1.5, borderRadius: '12px' }}>
                                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                                      <Avatar sx={{ width: 20, height: 20, fontSize: '0.65rem', bgcolor: '#8B5CF6' }}>
                                        {comment.author?.username?.[0]?.toUpperCase()}
                                      </Avatar>
                                      <Typography sx={{ fontWeight: 800, color: '#D0D8E0', fontSize: '0.8rem' }}>
                                        {comment.author?.username}
                                      </Typography>
                                      <Typography sx={{ color: '#8892A4', fontSize: '0.65rem' }}>
                                        {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                      </Typography>
                                    </Stack>
                                    <Typography sx={{ color: '#E4EAF0', fontSize: '0.825rem', pl: 4.5, lineHeight: 1.4 }}>
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
          })
        )}
      </Stack>
    </Box>
  );
}
