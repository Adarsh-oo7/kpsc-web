'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Box,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  Paper,
  useTheme,
  Stack,
  TextField,
  InputAdornment,
  Container,
  Chip,
  Skeleton
} from '@mui/material';
import { useAppContext } from '@/context/AppContext';
import { motion } from 'framer-motion';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GradingIcon from '@mui/icons-material/Grading';

// Predefined gradients for categories
const categoryGradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
];

const getCategoryGradient = (categoryName: string) => {
  const hash = categoryName.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0);
  return categoryGradients[Math.abs(hash) % categoryGradients.length];
};

const ExamCard = ({ exam, onClick, categoryName }: { exam: any; onClick: () => void; categoryName: string }) => {
  const gradient = getCategoryGradient(categoryName);
  
  return (
    <motion.div 
      whileHover={{ scale: 1.05, y: -5 }} 
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
          paddingBottom: '100%', // Perfect square
          borderRadius: 4,
          overflow: 'hidden',
          background: gradient,
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 15px 35px rgba(0,0,0,0.25)',
            transform: 'translateY(-8px)'
          }
        }}
      >
        {/* Decorative background pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -10,
            left: -10,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(5px)'
          }}
        />
        
        {/* Content */}
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
            p: { xs: 2, sm: 2.5, md: 3 },
            zIndex: 1
          }}
        >
          <SchoolIcon 
            sx={{ 
              fontSize: { xs: 32, sm: 40, md: 48 }, 
              mb: { xs: 1, sm: 1.5 },
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
            }}
          />
          <Typography 
            variant="h6"
            sx={{ 
              fontWeight: 'bold', 
              fontSize: { xs: '0.8rem', sm: '1rem', md: '1.1rem' },
              textShadow: '0 2px 8px rgba(0,0,0,0.3)',
              lineHeight: 1.2,
              wordBreak: 'break-word',
              mb: 0.5
            }}
          >
            {exam.name}
          </Typography>
          <Chip
            icon={<CalendarTodayIcon sx={{ fontSize: '0.8rem !important' }} />}
            label={exam.year}
            size="small"
            sx={{
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              fontSize: '0.7rem',
              height: 24,
              '& .MuiChip-icon': {
                color: 'white'
              }
            }}
          />
        </Box>
      </Paper>
    </motion.div>
  );
};

const ExamCardSkeleton = () => (
  <Paper 
    sx={{ 
      width: '100%', 
      height: 0,
      paddingBottom: '100%',
      borderRadius: 4,
      position: 'relative',
      background: 'linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)'
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
      <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1 }} />
      <Skeleton variant="rectangular" width="60%" height={16} sx={{ borderRadius: 2 }} />
    </Box>
  </Paper>
);

export default function ExamsPage() {
  const { setExamId, fetcher } = useAppContext();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: categories, error, isLoading } = useSWR('/exams/', fetcher);

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    if (!searchQuery.trim()) return categories;

    const lowercasedQuery = searchQuery.toLowerCase();

    return categories
      .map((category: any) => {
        const filteredExams = category.exams.filter((exam: any) =>
          exam.name.toLowerCase().includes(lowercasedQuery)
        );
        return { ...category, exams: filteredExams };
      })
      .filter((category: any) => category.exams.length > 0);
  }, [categories, searchQuery]);

  const handleExamSelect = (selectedExamId: string) => {
    setExamId(selectedExamId);
    router.push(`/quiz?exam_id=${selectedExamId}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (error) return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Alert severity="error">Error fetching exams. Please try again later.</Alert>
    </Container>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div 
        initial={{ opacity: 0, y: -30 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      >
        {/* Enhanced Header Section with Background */}
        <Box 
          sx={{ 
            position: 'relative',
            textAlign: 'center', 
            mb: 6,
            py: { xs: 4, sm: 6, md: 8 },
            px: 3,
            borderRadius: 6,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.2)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}
        >
          {/* Animated Background Elements */}
          <Box
            sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(102,126,234,0.3) 0%, transparent 70%)',
              animation: 'float 6s ease-in-out infinite'
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(250,112,154,0.2) 0%, transparent 70%)',
              animation: 'float 8s ease-in-out infinite reverse'
            }}
          />

          {/* Main Title */}
       

          {/* Subtitle */}
 

          {/* Enhanced Search Bar */}
          <Box sx={{ maxWidth: 500, mx: 'auto', position: 'relative', zIndex: 1 }}>
            <Paper 
              elevation={0}
              sx={{ 
                borderRadius: 25,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.85) 100%)',
                backdropFilter: 'blur(30px)',
                border: '2px solid rgba(255,255,255,0.3)',
                boxShadow: '0 15px 35px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.6)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)',
                  border: '2px solid rgba(102,126,234,0.3)'
                }
              }}
            >
              <TextField
                fullWidth
                variant="outlined"
                placeholder="✨ Search for your perfect exam..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    border: 'none',
                    '& fieldset': { border: 'none' },
                    borderRadius: 25,
                    fontSize: '1.1rem',
                    py: 1.5,
                    px: 2,
                    fontWeight: 500,
                    '& input::placeholder': {
                      color: 'rgba(0,0,0,0.6)',
                      opacity: 1
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box
                        sx={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: '50%',
                          p: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 1
                        }}
                      >
                        <SearchIcon sx={{ color: 'white', fontSize: 20 }} />
                      </Box>
                    </InputAdornment>
                  ),
                }}
              />
            </Paper>
          </Box>

          {/* Stats or Additional Info */}
          <Box 
            sx={{ 
              mt: 3, 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 3,
              flexWrap: 'wrap',
              position: 'relative',
              zIndex: 1
            }}
          >
           
          </Box>
        </Box>

        {/* CSS Animation */}
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
          }
        `}</style>
      </motion.div>

      {/* Loading State */}
      {isLoading && (
        <Box 
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(3, 1fr)',
              md: 'repeat(4, 1fr)',
              lg: 'repeat(5, 1fr)',
              xl: 'repeat(6, 1fr)'
            },
            gap: { xs: 2, sm: 2.5, md: 3 },
            mb: 4
          }}
        >
          {Array.from({ length: 12 }).map((_, index) => (
            <ExamCardSkeleton key={index} />
          ))}
        </Box>
      )}

      {/* Content */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <Stack spacing={6}>
          {filteredCategories && filteredCategories.length > 0 ? (
            filteredCategories.map((category: any) => (
              <motion.div variants={itemVariants} key={category.id}>
                {/* Category Header */}
                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700, 
                      color: 'white',
                      fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2
                    }}
                  >
                    <Box
                      sx={{
                        width: 4,
                        height: 40,
                        background: getCategoryGradient(category.name),
                        borderRadius: 2
                      }}
                    />
                    {category.name}
                    <Chip
                      label={`${category.exams.length} exams`}
                      size="small"
                      sx={{
                        background: 'rgba(255,255,255,0.1)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}
                    />
                  </Typography>
                </Box>

                {/* Exams Grid */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'repeat(2, 1fr)',
                      sm: 'repeat(3, 1fr)',
                      md: 'repeat(4, 1fr)',
                      lg: 'repeat(5, 1fr)',
                      xl: 'repeat(6, 1fr)'
                    },
                    gap: { xs: 2, sm: 2.5, md: 3 }
                  }}
                >
                  {category.exams.map((exam: any) => (
                    <ExamCard 
                      key={exam.id}
                      exam={exam} 
                      onClick={() => handleExamSelect(exam.id.toString())}
                      categoryName={category.name}
                    />
                  ))}
                </Box>
              </motion.div>
            ))
          ) : !isLoading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <AssignmentIcon sx={{ fontSize: 80, color: 'rgba(255,255,255,0.3)', mb: 2 }} />
              <Alert 
                severity="info" 
                sx={{ 
                  maxWidth: 400, 
                  mx: 'auto',
                  borderRadius: 3,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  '& .MuiAlert-icon': {
                    color: 'white'
                  }
                }}
              >
                {searchQuery ? 'No exams match your search.' : 'No exam categories found.'}
              </Alert>
            </Box>
          ) : null}
        </Stack>
      </motion.div>
    </Container>
  );
}