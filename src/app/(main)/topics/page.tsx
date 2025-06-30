'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Box, Typography, Grid, Alert, CircularProgress, Paper,
  TextField, InputAdornment, Container, Fade, Skeleton, Stack
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

export default function TopicsPage() {
  const { setTopicId, fetcher } = useAppContext();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: topics, error, isLoading } = useSWR('/topics/', fetcher);

  const filteredTopics = useMemo(() => {
    if (!topics) return [];
    if (!searchQuery.trim()) return topics;
    return topics.filter((topic: any) =>
      topic.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [topics, searchQuery]);

  const handleTopicSelect = (selectedTopicId: string) => {
    setTopicId(selectedTopicId);
    router.push(`/quiz?topic_id=${selectedTopicId}`);
  };

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
              color: 'white',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
            }}
          >
            Explore Topics
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'rgba(255,255,255,0.8)', 
              fontWeight: 400,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            Choose a subject to start your learning journey.
          </Typography>
        </Box>
        
        <Box sx={{ maxWidth: 600, mx: 'auto', mb: 5 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search for any topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '50px',
                bgcolor: 'background.paper',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
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

      {/* Fixed Grid with Equal Squares */}
      <Grid 
        container 
        spacing={{ xs: 2, sm: 2.5, md: 3 }}
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',      // 2 columns on mobile
            sm: 'repeat(3, 1fr)',      // 3 columns on small screens
            md: 'repeat(4, 1fr)',      // 4 columns on medium screens
            lg: 'repeat(5, 1fr)',      // 5 columns on large screens
            xl: 'repeat(6, 1fr)'       // 6 columns on extra large screens
          },
          gap: { xs: 2, sm: 2.5, md: 3 }
        }}
      >
        {isLoading ? (
          Array.from({ length: 12 }).map((_, index) => (
            <Box key={index}>
              <TopicCardSkeleton />
            </Box>
          ))
        ) : filteredTopics && filteredTopics.length > 0 ? (
          filteredTopics.map((topic: any) => (
            <Box key={topic.id}>
              <TopicCard 
                topic={topic} 
                onClick={() => handleTopicSelect(topic.id.toString())} 
              />
            </Box>
          ))
        ) : (
          <Box sx={{ gridColumn: '1 / -1' }}>
            <Alert severity="info">
              {searchQuery ? 'No topics match your search.' : 'No topics available at the moment.'}
            </Alert>
          </Box>
        )}
      </Grid>
    </Container>
  );
}