'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Box, Typography, Alert, CircularProgress, Paper,
  TextField, InputAdornment, Container, Skeleton, Stack,
  Button, Chip, LinearProgress
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
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

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

function statusLine(section: { attempted?: number; accuracy?: number; is_weak?: boolean }) {
  if (!section.attempted) return 'Not started';
  if (section.is_weak) return `${section.accuracy}% — this part is costing marks`;
  return `${section.accuracy}% from ${section.attempted} answers`;
}

function SectionCard({
  section,
  startHere,
  onSection,
  onPart,
}: {
  section: any;
  startHere: boolean;
  onSection: () => void;
  onPart: (key: string) => void;
}) {
  const parts = section.subdivisions || [];
  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.25 },
        borderRadius: '16px',
        border: '1px solid',
        borderColor: startHere ? 'rgba(27,107,58,0.45)' : 'divider',
        bgcolor: 'background.paper',
        borderLeft: '4px solid',
        borderLeftColor: section.color || '#1B6B3A',
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
        <Box sx={{ minWidth: 0, flex: 1 }}>
          {startHere && (
            <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.08em', color: '#1B6B3A', mb: 0.5 }}>
              START HERE
            </Typography>
          )}
          <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.3 }}>
            {section.title}
          </Typography>
          {section.title_ml ? (
            <Typography sx={{ color: 'text.secondary', fontSize: '0.82rem', mt: 0.25 }}>
              {section.title_ml}
            </Typography>
          ) : null}
          <Typography sx={{ color: 'text.secondary', fontSize: '0.82rem', mt: 0.75 }}>
            {statusLine(section)} · {section.question_count || 0} questions
            {parts.length > 0 ? ` · ${parts.length} chapters` : ''}
          </Typography>
          {section.attempted > 0 && (
            <LinearProgress
              variant="determinate"
              value={Math.min(100, section.accuracy || 0)}
              sx={{
                mt: 1,
                maxWidth: 280,
                height: 6,
                borderRadius: 4,
                bgcolor: 'divider',
                '& .MuiLinearProgress-bar': { bgcolor: section.is_weak ? '#EF4444' : (section.color || '#1B6B3A') },
              }}
            />
          )}
        </Box>
        <Stack spacing={1} alignItems={{ xs: 'stretch', sm: 'flex-end' }} sx={{ flexShrink: 0 }}>
          <Chip
            size="small"
            label={`${section.marks} marks`}
            sx={{ alignSelf: { xs: 'flex-start', sm: 'flex-end' }, fontWeight: 800, bgcolor: 'surface.card', color: 'text.primary' }}
          />
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={onSection}
            sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '12px', px: 2 }}
          >
            Practise 15
          </Button>
        </Stack>
      </Stack>
      {startHere && (
        <Typography sx={{ color: 'text.secondary', fontSize: '0.82rem', mt: 1.5, lineHeight: 1.5 }}>
          Answer the set, then read the correct option and the reason. A wrong answer is saved and asked again.
        </Typography>
      )}
      {parts.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
          {parts.map((part: any) => (
            <Chip
              key={part.key}
              label={`${part.name} · ${part.question_count}`}
              onClick={() => onPart(part.key)}
              variant="outlined"
              sx={{ fontWeight: 700, borderRadius: '10px' }}
            />
          ))}
        </Box>
      )}
    </Paper>
  );
}

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

  const { data: syllabus, isLoading: syllabusLoading } = useSWR(
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
    const q = searchQuery.trim().toLowerCase();
    const matched = !q
      ? sections
      : sections
          .map((section: any) => {
            const titleHit = `${section.title} ${section.title_ml || ''}`.toLowerCase().includes(q);
            const parts = (section.subdivisions || []).filter((part: any) =>
              `${part.name} ${section.title}`.toLowerCase().includes(q)
            );
            return { ...section, subdivisions: titleHit ? section.subdivisions : parts, _hit: titleHit || parts.length > 0 };
          })
          .filter((section: any) => section._hit);
    const focusKey = syllabus?.focus_section?.key;
    if (!focusKey) return matched;
    const focus = matched.find((section: any) => section.key === focusKey);
    if (!focus) return matched;
    return [focus, ...matched.filter((section: any) => section.key !== focusKey)];
  }, [syllabus, searchQuery]);

  const handleTopicSelect = (slug: string) => {
    router.push(`/topics/${slug}`);
  };

  const focus = syllabus?.focus_section;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 2.5, maxWidth: 720 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              fontSize: { xs: '1.7rem', sm: '2rem' },
              lineHeight: 1.2,
            }}
          >
            {syllabus?.exam_name || 'PSC Syllabus'}
          </Typography>
          <Typography sx={{ color: 'text.secondary', mt: 0.75, fontSize: '0.95rem', lineHeight: 1.5 }}>
            Open one section, answer 15 questions, then read the correct option and the reason. Chapters stay inside their subject.
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 720, mb: 2.5 }}>
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

      {user && (syllabusLoading || syllabus) ? (
        syllabusLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={32} /></Box>
        ) : visibleSections.length > 0 ? (
          <Stack spacing={1.25} sx={{ maxWidth: 720 }}>
            {visibleSections.map((section: any) => (
              <SectionCard
                key={section.key}
                section={section}
                startHere={!searchQuery.trim() && section.key === focus?.key}
                onSection={() => router.push(`/quiz?section=${encodeURIComponent(section.key)}&limit=15`)}
                onPart={(partKey) => router.push(`/quiz?section=${encodeURIComponent(section.key)}&subdivision=${encodeURIComponent(partKey)}&limit=15`)}
              />
            ))}
          </Stack>
        ) : (
          <Alert severity="info">No subject or chapter matches that search.</Alert>
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
