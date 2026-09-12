'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Box, Typography, Grid, Alert, CircularProgress, Paper,
  TextField, InputAdornment, Container, Skeleton, Stack,
  Button, Chip, LinearProgress, Accordion, AccordionSummary, AccordionDetails
} from '@mui/material';
import { useAppContext } from '@/context/AppContext';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';

// --- Icon imports ---
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import PublicIcon from '@mui/icons-material/Public';
import ScienceIcon from '@mui/icons-material/Science';
import GavelIcon from '@mui/icons-material/Gavel';
import CalculateIcon from '@mui/icons-material/Calculate';
import TranslateIcon from '@mui/icons-material/Translate';
import CategoryIcon from '@mui/icons-material/Category';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

// A predefined list of attractive gradients
const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
];

const getTopicVisuals = (topicName: string) => {
    const lowerCaseName = topicName.toLowerCase();
    const iconSize = { fontSize: { xs: 32, sm: 40, md: 48 } };
    let icon = <CategoryIcon sx={iconSize} />;

    if (lowerCaseName.includes('history')) icon = <HistoryEduIcon sx={iconSize} />;
    else if (lowerCaseName.includes('geography')) icon = <PublicIcon sx={iconSize} />;
    else if (lowerCaseName.includes('science')) icon = <ScienceIcon sx={iconSize} />;
    else if (lowerCaseName.includes('polity')) icon = <GavelIcon sx={iconSize} />;
    else if (lowerCaseName.includes('math')) icon = <CalculateIcon sx={iconSize} />;
    else if (lowerCaseName.includes('english')) icon = <TranslateIcon sx={iconSize} />;
    
    const hash = topicName.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0);
    const gradient = gradients[Math.abs(hash) % gradients.length];
    
    return { icon, gradient };
};

const TopicCard = ({ topic, onClick }: { topic: any; onClick: () => void; }) => {
    const { icon, gradient } = getTopicVisuals(topic.name);
    return (
        <motion.div 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            style={{ 
                height: '100%', 
                cursor: 'pointer',
                display: 'flex'
            }}
        >
            <Paper
                onClick={onClick}
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: 0,
                    paddingBottom: '100%', // Creates perfect square aspect ratio
                    borderRadius: 3,
                    overflow: 'hidden',
                    background: gradient,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
                        transform: 'translateY(-4px)'
                    }
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        color: 'white',
                        p: { xs: 1.5, sm: 2, md: 2.5 }
                    }}
                >
                    <Box sx={{ mb: { xs: 1, sm: 1.5 } }}>
                        {icon}
                    </Box>
                    <Typography 
                        sx={{ 
                            fontWeight: 'bold', 
                            fontSize: { xs: '0.75rem', sm: '0.9rem', md: '1rem' },
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            lineHeight: 1.2,
                            wordBreak: 'break-word'
                        }}
                    >
                        {topic.name}
                    </Typography>
                </Box>
            </Paper>
        </motion.div>
    );
};

const TopicCardSkeleton = () => (
    <Paper 
        sx={{ 
            width: '100%', 
            height: 0,
            paddingBottom: '100%', // Perfect square
            borderRadius: 3,
            position: 'relative'
        }}
    >
        <Box 
            sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                p: 2
            }}
        >
            <Skeleton variant="circular" width={40} height={40} sx={{ mb: 1.5 }} />
            <Skeleton variant="text" width="70%" height={20} />
        </Box>
    </Paper>
);

export default function TopicsClient() {
  const { fetcher, user } = useAppContext();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: syllabus, error: syllabusError, isLoading: syllabusLoading } = useSWR(
    user ? '/syllabus-sections/' : null,
    fetcher
  );
  const { data: topics, error, isLoading } = useSWR('/topics/', fetcher);

  const filteredTopics = useMemo(() => {
    if (!topics) return [];
    if (!searchQuery.trim()) return topics;
    return topics.filter((topic: any) =>
      topic.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [topics, searchQuery]);

  const visibleSections = useMemo(() => {
    const sections = syllabus?.sections || [];
    if (!searchQuery.trim()) return sections;
    const q = searchQuery.toLowerCase();
    return sections
      .map((section: any) => ({
        ...section,
        topics: (section.topics || []).filter((topic: any) =>
          `${section.title} ${topic.name}`.toLowerCase().includes(q)
        ),
      }))
      .filter((section: any) =>
        section.title.toLowerCase().includes(q) || (section.topics || []).length > 0
      );
  }, [syllabus, searchQuery]);

  const handleTopicSelect = (slug: string) => {
    router.push(`/topics/${slug}`);
  };

  const focus = syllabus?.focus_section;
  const weakSections = syllabus?.weak_sections || [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
            }}
          >
            {syllabus?.exam_name || 'PSC Syllabus'}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'text.secondary',
              fontWeight: 400,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            Official paper sections — practise the part you are weakest in.
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search a subject or chapter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '50px',
                bgcolor: 'background.paper',
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </motion.div>

      {focus && (
        <Paper
          sx={{
            mb: 3,
            p: 2.5,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'rgba(239,68,68,0.25)',
            bgcolor: 'background.paper',
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <WarningAmberIcon sx={{ color: '#EF4444', fontSize: 20 }} />
                <Typography sx={{ fontWeight: 800 }}>Focus for the exam</Typography>
                <Chip size="small" label={`${focus.marks} marks`} sx={{ fontWeight: 800 }} />
              </Stack>
              <Typography sx={{ fontWeight: 700, color: 'text.primary' }}>
                {focus.title}{focus.title_ml ? ` · ${focus.title_ml}` : ''}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {focus.attempted > 0
                  ? `${focus.accuracy}% accuracy from ${focus.attempted} answers. This section can swing ${focus.marks} marks.`
                  : `You have not practised this ${focus.marks}-mark section yet.`}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={() => router.push(`/quiz?section=${encodeURIComponent(focus.key)}&limit=15`)}
              sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 3, bgcolor: '#EF4444', '&:hover': { bgcolor: '#DC2626' } }}
            >
              Practise this section
            </Button>
          </Stack>
        </Paper>
      )}

      {user && (syllabusLoading || syllabus) ? (
        syllabusLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={32} /></Box>
        ) : (
          <Stack spacing={1.5}>
            {visibleSections.map((section: any) => (
              <Accordion
                key={section.key}
                defaultExpanded={section.is_weak || section.key === focus?.key}
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: section.is_weak ? 'rgba(239,68,68,0.35)' : 'divider',
                  borderRadius: '16px !important',
                  '&:before': { display: 'none' },
                  bgcolor: 'background.paper',
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%', pr: 1 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: section.color, flexShrink: 0 }} />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 800 }}>
                        {section.title}
                        {section.title_ml ? (
                          <Box component="span" sx={{ color: 'text.secondary', fontWeight: 600, ml: 1, fontSize: '0.85rem' }}>
                            {section.title_ml}
                          </Box>
                        ) : null}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={section.attempted ? Math.min(100, section.accuracy) : 0}
                        sx={{ mt: 0.75, height: 6, borderRadius: 4, bgcolor: 'divider', '& .MuiLinearProgress-bar': { bgcolor: section.color } }}
                      />
                    </Box>
                    <Chip size="small" label={`${section.marks} marks`} sx={{ fontWeight: 800, bgcolor: `${section.color}18`, color: section.color }} />
                    <Chip
                      size="small"
                      label={section.attempted ? `${section.accuracy}%` : 'New'}
                      sx={{
                        fontWeight: 800,
                        bgcolor: section.is_weak ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)',
                        color: section.is_weak ? '#EF4444' : '#16A34A',
                      }}
                    />
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<PlayArrowIcon />}
                      onClick={() => router.push(`/quiz?section=${encodeURIComponent(section.key)}&limit=15`)}
                      sx={{ textTransform: 'none', fontWeight: 800, borderRadius: 2, bgcolor: section.color }}
                    >
                      Practise {section.title}
                    </Button>
                    <Typography variant="body2" sx={{ color: 'text.secondary', alignSelf: 'center' }}>
                      {section.attempted} answers · {section.topics?.length || 0} chapters
                    </Typography>
                  </Stack>
                  <Grid container spacing={1.5}>
                    {(section.topics || []).slice(0, 12).map((topic: any) => (
                      <Grid item xs={12} sm={6} md={4} key={topic.id}>
                        <Paper
                          variant="outlined"
                          onClick={() => handleTopicSelect(topic.slug)}
                          sx={{ p: 1.5, borderRadius: 2, cursor: 'pointer', '&:hover': { borderColor: section.color } }}
                        >
                          <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{topic.name}</Typography>
                          <Typography variant="caption" sx={{ color: topic.is_weak ? '#EF4444' : 'text.secondary' }}>
                            {topic.attempted ? `${topic.accuracy}% · ${topic.question_count} Qs` : `${topic.question_count} Qs`}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
            {weakSections.length === 0 && !syllabusError ? null : null}
          </Stack>
        )
      ) : isLoading ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
          {Array.from({ length: 8 }).map((_, index) => (
            <TopicCardSkeleton key={index} />
          ))}
        </Box>
      ) : filteredTopics && filteredTopics.length > 0 ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
          {filteredTopics.map((topic: any) => (
            <TopicCard key={topic.id} topic={topic} onClick={() => handleTopicSelect(topic.slug)} />
          ))}
        </Box>
      ) : (
        <Alert severity="info">
          {searchQuery ? 'No topics match your search.' : error ? 'Could not load topics.' : 'No topics available at the moment.'}
        </Alert>
      )}
    </Container>
  );
}
