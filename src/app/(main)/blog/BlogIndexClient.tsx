'use client';

import { useState } from 'react';
import { Container, Box, Typography, Grid, Card, CardContent, Button, Chip, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { blogPosts } from '@/lib/blogPosts';

export default function BlogIndexClient() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Study Plans', 'Syllabus Guides', 'Study Notes', 'Current Affairs'];

  const filteredPosts = activeCategory === 'All'
    ? blogPosts
    : blogPosts.filter(p => p.category === activeCategory);

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 8 }, pb: { xs: 8, md: 12 } }}>
      {/* Header section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Chip
            label="📚 Study Guides & Resource Hub"
            sx={{
              background: 'rgba(27,107,58,0.12)',
              border: '1px solid rgba(46,139,87,0.25)',
              color: '#2E8B57',
              fontWeight: 800,
              fontSize: '0.75rem',
              height: 32,
              mb: 3
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontFamily: "'Cabinet Grotesk', sans-serif",
              fontWeight: 900,
              fontSize: { xs: '2.2rem', sm: '3rem', md: '3.6rem' },
              color: 'text.primary',
              letterSpacing: '-0.02em',
              mb: 2
            }}
          >
            KPSC Master Blog
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              maxWidth: 600,
              mx: 'auto',
              fontSize: { xs: '1rem', sm: '1.1rem' },
              lineHeight: 1.6
            }}
          >
            Stay updated with official exam notifications, syllabus revisions, time management tips, and step-by-step subject preparation guides.
          </Typography>
        </motion.div>
      </Box>

      {/* Categories Horizontal Chips Filter */}
      <Stack
        direction="row"
        spacing={1.25}
        sx={{
          mb: 6,
          overflowX: 'auto',
          pb: 1.5,
          justifyContent: { xs: 'flex-start', md: 'center' },
          '&::-webkit-scrollbar': { display: 'none' }
        }}
      >
        {categories.map((cat) => (
          <Chip
            key={cat}
            label={cat}
            onClick={() => setActiveCategory(cat)}
            sx={{
              bgcolor: activeCategory === cat ? 'primary.main' : 'surface.card',
              color: activeCategory === cat ? '#ffffff' : 'text.secondary',
              border: '1px solid',
              borderColor: activeCategory === cat ? 'primary.main' : 'divider',
              fontWeight: 700,
              fontSize: '0.8rem',
              px: 1,
              py: 2,
              '&:hover': {
                bgcolor: activeCategory === cat ? 'primary.dark' : 'action.hover',
              },
              transition: 'all 0.2s ease',
            }}
          />
        ))}
      </Stack>

      {/* Grid listing blog posts */}
      <Grid container spacing={3.5}>
        {filteredPosts.map((post, i) => (
          <Grid size={{ xs: 12, sm: 6 }} key={post.slug}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              style={{ height: '100%' }}
            >
              <Card
                onClick={() => router.push(`/blog/${post.slug}`)}
                sx={{
                  height: '100%',
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '24px',
                  boxShadow: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  p: 3.5,
                  transition: 'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    borderColor: `${post.color}40`,
                    boxShadow: `0 12px 36px ${post.color}08`,
                  }
                }}
              >
                <CardContent sx={{ p: 0, mb: 4 }}>
                  {/* Category chip & Date */}
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        bgcolor: `${post.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                      }}
                    >
                      {post.emoji}
                    </Box>
                    <Chip
                      label={post.category}
                      size="small"
                      sx={{
                        bgcolor: `${post.color}10`,
                        color: post.color,
                        fontWeight: 700,
                        fontSize: '0.75rem',
                      }}
                    />
                    <Typography sx={{ color: 'text.disabled', fontSize: '0.75rem', fontWeight: 600 }}>
                      {post.date}
                    </Typography>
                  </Stack>

                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: "'Cabinet Grotesk', sans-serif",
                      fontWeight: 800,
                      color: 'text.primary',
                      fontSize: '1.25rem',
                      lineHeight: 1.35,
                      mb: 2,
                      '&:hover': { color: 'primary.main' }
                    }}
                  >
                    {post.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.875rem',
                      lineHeight: 1.6,
                    }}
                  >
                    {post.summary}
                  </Typography>
                </CardContent>

                {/* Footer read time & Link */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography sx={{ color: 'text.disabled', fontSize: '0.75rem', fontWeight: 700 }}>
                    ⏳ {post.readTime}
                  </Typography>
                  <Button
                    size="small"
                    endIcon={<span>→</span>}
                    sx={{
                      color: post.color,
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      p: 0,
                      '&:hover': { background: 'transparent', color: 'primary.main' }
                    }}
                  >
                    Read Article
                  </Button>
                </Stack>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
