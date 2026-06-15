'use client';

import { useState, useMemo, useEffect } from 'react';
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
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Divider,
  LinearProgress
} from '@mui/material';
import { useAppContext } from '@/context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

// MUI Icons
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GradingIcon from '@mui/icons-material/Grading';
import TimerIcon from '@mui/icons-material/Timer';
import BoltIcon from '@mui/icons-material/Bolt';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

// Live simulation ticker items
const TICKER_ITEMS = [
  "✨ Amal from Thrissur scored 82.5% on LDC Mock Paper #14",
  "🔥 Nisha from Kozhikode answered 100/100 correct on LGS Paper",
  "⚡ Suresh from Trivandrum completed Degree Level Mock Test #4 in 45 mins",
  "🎉 Sandra from Ernakulam earned +100 XP on LDC Mock Paper #12",
  "🚀 Manu from Kollam completed LDC Paper 2026 Simulation",
  "💡 Aparna from Palakkad solved 92 questions on LGS Mock Test",
  "✨ Jithin from Kannur reached Level 5 after LDC Mock simulation",
  "🔥 Fathima from Malappuram scored 89.0% on LDC Mock Paper #15",
  "⚡ Rahul from Alappuzha unlocked the 'Speed Demon' badge in mock test",
];

// Marquee styles for horizontal live ticker
const marqueeStyles = `
  @keyframes marquee {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-50%); }
  }
  .ticker-container {
    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    padding: 12px 0;
    position: relative;
    background: rgba(27, 107, 58, 0.08);
    border-top: 1px solid rgba(27, 107, 58, 0.15);
    border-bottom: 1px solid rgba(27, 107, 58, 0.15);
  }
  .ticker-wrapper {
    display: inline-block;
    animation: marquee 35s linear infinite;
  }
  .ticker-item {
    display: inline-block;
    padding: 0 40px;
    font-size: 0.85rem;
    font-family: 'Satoshi', sans-serif;
    font-weight: 600;
  }
`;

// Helper to resolve topic weightages based on exam name
const getSyllabusWeightage = (examName: string) => {
  const name = examName.toLowerCase();
  if (name.includes('ldc') || name.includes('clerk')) {
    return [
      { subject: 'General Knowledge & Renaissance', weight: 40 },
      { subject: 'Simple Arithmetic & Mental Ability', weight: 20 },
      { subject: 'General English', weight: 20 },
      { subject: 'Malayalam/Regional Language', weight: 10 },
      { subject: 'General Science & IT', weight: 10 }
    ];
  } else if (name.includes('lgs') || name.includes('servant')) {
    return [
      { subject: 'General Knowledge & Renaissance', weight: 50 },
      { subject: 'General Science', weight: 20 },
      { subject: 'Simple Arithmetic & Mental Ability', weight: 20 },
      { subject: 'Current Affairs', weight: 10 }
    ];
  } else {
    // Default fallback weightage
    return [
      { subject: 'General Studies & Current Affairs', weight: 40 },
      { subject: 'English Language & Grammar', weight: 20 },
      { subject: 'Regional Language', weight: 20 },
      { subject: 'Arithmetic & Mental Ability', weight: 20 }
    ];
  }
};

export default function ExamsPage() {
  const { setExamId, fetcher, themeMode, user } = useAppContext();
  const router = useRouter();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [bestScores, setBestScores] = useState<Record<string, number>>({});
  
  // Syllabus Modal State
  const [syllabusOpen, setSyllabusOpen] = useState(false);
  const [selectedExamForSyllabus, setSelectedExamForSyllabus] = useState<any>(null);
  const [selectedSyllabus, setSelectedSyllabus] = useState<any>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  // Fetch Categories & Exams
  const { data: categories, error, isLoading } = useSWR('/exams/', fetcher);

  // Fetch Syllabus List
  const { data: syllabusList } = useSWR('/syllabuses/', fetcher);

  // Load best attempts from localStorage
  useEffect(() => {
    const scores: Record<string, number> = {};
    if (typeof window !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('best_score_')) {
          const examId = key.replace('best_score_', '');
          const val = localStorage.getItem(key);
          if (val) {
            scores[examId] = parseFloat(val);
          }
        }
      }
    }
    setBestScores(scores);
  }, []);

  // Filter Categories & Exams
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    
    let result = categories;
    
    // Category Filter (Horizontal Chips)
    if (selectedCategory !== 'All') {
      result = categories.filter((cat: any) => cat.name === selectedCategory);
    }

    const lowercasedQuery = searchQuery.toLowerCase().trim();

    return result
      .map((category: any) => {
        const filteredExams = category.exams.filter((exam: any) =>
          exam.name.toLowerCase().includes(lowercasedQuery) ||
          exam.year.toString().includes(lowercasedQuery)
        );
        return { ...category, exams: filteredExams };
      })
      .filter((category: any) => category.exams.length > 0);
  }, [categories, searchQuery, selectedCategory]);

  // List of all categories for the filter chips
  const categoryNames = useMemo(() => {
    if (!categories) return ['All'];
    return ['All', ...categories.map((c: any) => c.name)];
  }, [categories]);

  // Weekly recommended test (First exam in list dynamically or fallback)
  const featuredExam = useMemo(() => {
    if (!categories || categories.length === 0) return null;
    for (const cat of categories) {
      if (cat.exams && cat.exams.length > 0) {
        return { ...cat.exams[0], categoryName: cat.name };
      }
    }
    return null;
  }, [categories]);

  const handleExamSelect = (examId: string) => {
    if (!user) {
      setAuthDialogOpen(true);
      return;
    }
    setExamId(examId);
    router.push(`/quiz?exam_id=${examId}`);
  };

  const handleOpenSyllabus = (exam: any) => {
    const syllabusMatch = syllabusList?.find((s: any) => s.exam === exam.id);
    setSelectedSyllabus(syllabusMatch || null);
    setSelectedExamForSyllabus(exam);
    setSyllabusOpen(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80 } },
  };

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" variant="filled">
          Error fetching mock papers. Please refresh the page or check your connection.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 2, md: 3 }, pb: 8 }}>
      {/* Dynamic Scrolling Ticker CSS */}
      <style dangerouslySetInnerHTML={{ __html: marqueeStyles }} />

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      >
        <Box 
          sx={{ 
            position: 'relative',
            borderRadius: 6,
            background: isDark 
              ? 'linear-gradient(135deg, rgba(27, 107, 58, 0.25) 0%, rgba(22, 27, 34, 0.8) 100%)' 
              : 'linear-gradient(135deg, rgba(46, 139, 87, 0.1) 0%, rgba(255, 255, 255, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid',
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(27,107,58,0.12)',
            boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.25)' : '0 12px 30px rgba(0,0,0,0.03)',
            overflow: 'hidden',
            mb: 4
          }}
        >
          <Box sx={{ p: { xs: 3, sm: 4, md: 5 }, position: 'relative', zIndex: 2 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid size={{ xs: 12, md: 7 }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontFamily: "'Cabinet Grotesk', sans-serif",
                    fontWeight: 900,
                    color: 'text.primary',
                    fontSize: { xs: '1.8rem', sm: '2.4rem', md: '2.8rem' },
                    mb: 1.5,
                    lineHeight: 1.1,
                  }}
                >
                  Official PSC Mock Tests 📝
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    fontSize: { xs: '0.95rem', sm: '1.1rem' },
                    mb: 4,
                    maxWidth: 550
                  }}
                >
                  Experience direct Kerala PSC exam simulation. Practice full length papers under strict exam timers, check real negative marks, and master topic weightages.
                </Typography>

                {/* Search Bar */}
                <Box sx={{ maxWidth: 500 }}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      borderRadius: '50px',
                      background: isDark ? 'rgba(28, 34, 48, 0.95)' : '#ffffff',
                      border: '1.5px solid',
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(27,107,58,0.2)',
                      boxShadow: isDark ? '0 12px 24px rgba(0,0,0,0.4)' : '0 8px 20px rgba(27,107,58,0.06)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        borderColor: '#2E8B57'
                      }
                    }}
                  >
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Search for LDC, LGS, KAS, etc..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          border: 'none',
                          '& fieldset': { border: 'none' },
                          borderRadius: '50px',
                          fontSize: '1rem',
                          py: 1.25,
                          px: 2.5,
                          fontWeight: 500,
                          color: 'text.primary',
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: '#2E8B57', mr: 1 }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Paper>
                </Box>
              </Grid>

              {/* Stats Counters */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Box 
                  sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)', 
                    gap: 2 
                  }}
                >
                  {[
                    { label: 'Papers Loaded', val: '150+', icon: <AssignmentIcon sx={{ color: '#1B6B3A' }} /> },
                    { label: 'Active Students', val: '45k+', icon: <PeopleIcon sx={{ color: '#F59E0B' }} /> },
                    { label: 'Readiness Target', val: '98%', icon: <TrendingUpIcon sx={{ color: '#8B5CF6' }} /> },
                    { label: 'Real Simulation', val: 'Live', icon: <HelpOutlineIcon sx={{ color: '#FF6B2B' }} /> }
                  ].map((stat, idx) => (
                    <Paper
                      key={idx}
                      sx={{
                        p: 2.5,
                        borderRadius: 4,
                        bgcolor: isDark ? 'rgba(22, 27, 34, 0.4)' : 'rgba(255, 255, 255, 0.7)',
                        border: '1px solid',
                        borderColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                        textAlign: 'center',
                        backdropFilter: 'blur(10px)'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                        {stat.icon}
                      </Box>
                      <Typography sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, fontSize: '1.4rem', color: 'text.primary' }}>
                        {stat.val}
                      </Typography>
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}>
                        {stat.label}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Infinite Marquee Ticker */}
          <div className="ticker-container">
            <div className="ticker-wrapper">
              {/* Double elements to allow seamless scrolling loop */}
              {TICKER_ITEMS.map((item, idx) => (
                <span key={idx} className="ticker-item" style={{ color: isDark ? '#a7f3d0' : '#064e3b' }}>
                  {item}
                </span>
              ))}
              {TICKER_ITEMS.map((item, idx) => (
                <span key={`dup-${idx}`} className="ticker-item" style={{ color: isDark ? '#a7f3d0' : '#064e3b' }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </Box>
      </motion.div>

      {/* Recommended Test of the Week */}
      {featuredExam && !searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Paper
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 6,
              background: isDark 
                ? 'linear-gradient(135deg, rgba(22, 27, 34, 0.95) 0%, rgba(28, 34, 48, 0.9) 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '2px solid #F59E0B', // Glowing gold accent outline
              boxShadow: '0 8px 32px rgba(245, 158, 11, 0.15)',
              position: 'relative',
              overflow: 'hidden',
              mb: 5
            }}
          >
            {/* Background design accents */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 150,
                height: 150,
                background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
                zIndex: 1
              }}
            />

            <Grid container spacing={3} alignItems="center" sx={{ position: 'relative', zIndex: 2 }}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Stack spacing={1.5}>
                  <Box>
                    <Chip
                      icon={<WorkspacePremiumIcon sx={{ color: '#F59E0B', fontSize: '0.9rem !important' }} />}
                      label="RECOMMENDED TEST OF THE WEEK"
                      sx={{
                        background: 'rgba(245, 158, 11, 0.12)',
                        color: '#F59E0B',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        letterSpacing: '0.05em'
                      }}
                    />
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: "'Cabinet Grotesk', sans-serif",
                      fontWeight: 900,
                      color: 'text.primary',
                      fontSize: { xs: '1.4rem', sm: '1.8rem' }
                    }}
                  >
                    {featuredExam.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 600 }}>
                    Practice the highly anticipated mock exam for this week. It simulates target questions, marking distributions, and gives +100 bonus study XP upon completion.
                  </Typography>
                  
                  {/* Stats Row */}
                  <Stack direction="row" spacing={3} sx={{ pt: 1 }}>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <TimerIcon sx={{ color: '#2E8B57', fontSize: 18 }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                        {featuredExam.duration_minutes || 120} MINS
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <AssignmentIcon sx={{ color: '#2E8B57', fontSize: 18 }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                        100 MCQS
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <BoltIcon sx={{ color: '#8B5CF6', fontSize: 18 }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                        +100 XP
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <CalendarTodayIcon sx={{ color: '#F59E0B', fontSize: 18 }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                        YEAR {featuredExam.year}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Grid>

              {/* Action Buttons */}
              <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { md: 'right' } }}>
                <Stack direction={{ xs: 'row', md: 'column' }} spacing={2} justifyContent="flex-end">
                  <Button
                    variant="outlined"
                    onClick={() => handleOpenSyllabus(featuredExam)}
                    sx={{
                      py: 1.5,
                      px: 3,
                      borderRadius: '12px',
                      textTransform: 'none',
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.15)',
                      color: 'text.primary',
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        borderColor: 'text.primary'
                      }
                    }}
                  >
                    Syllabus Details
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => handleExamSelect(featuredExam.id.toString())}
                    sx={{
                      py: 1.5,
                      px: 4,
                      borderRadius: '12px',
                      textTransform: 'none',
                      background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
                      boxShadow: '0 8px 20px rgba(27, 107, 58, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #2E8B57, #3da068)',
                        boxShadow: '0 12px 24px rgba(27, 107, 58, 0.5)'
                      }
                    }}
                    startIcon={<PlayArrowIcon />}
                  >
                    Begin Test
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>
      )}

      {/* Horizontal Category Filtering Row */}
      {categoryNames.length > 1 && (
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 1.25, 
            mb: 4, 
            overflowX: 'auto', 
            pb: 1.5,
            scrollbarWidth: 'none', // For Firefox
            '&::-webkit-scrollbar': { display: 'none' } // For Chrome/Safari
          }}
        >
          {categoryNames.map((catName) => {
            const isSelected = selectedCategory === catName;
            return (
              <Chip
                key={catName}
                label={catName}
                onClick={() => setSelectedCategory(catName)}
                sx={{
                  py: 2.2,
                  px: 1,
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  borderRadius: '30px',
                  bgcolor: isSelected 
                    ? '#1B6B3A' 
                    : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                  color: isSelected ? '#ffffff' : 'text.primary',
                  border: isSelected ? '1px solid #1B6B3A' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: isSelected ? '#1B6B3A' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                    transform: 'translateY(-1px)'
                  }
                }}
              />
            );
          })}
        </Box>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <Box 
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 3
          }}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <Paper key={index} sx={{ p: 3, borderRadius: 5 }}>
              <Skeleton variant="text" width="60%" height={30} sx={{ mb: 1.5 }} />
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 3, mb: 2 }} />
              <Skeleton variant="text" width="100%" height={20} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="80%" height={20} sx={{ mb: 2 }} />
              <Stack direction="row" spacing={2}>
                <Skeleton variant="rectangular" width="40%" height={36} sx={{ borderRadius: 2 }} />
                <Skeleton variant="rectangular" width="60%" height={36} sx={{ borderRadius: 2 }} />
              </Stack>
            </Paper>
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
                    variant="h5" 
                    sx={{ 
                      fontFamily: "'Cabinet Grotesk', sans-serif",
                      fontWeight: 800, 
                      color: 'text.primary',
                      fontSize: { xs: '1.4rem', sm: '1.6rem' },
                      mb: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5
                    }}
                  >
                    <Box
                      sx={{
                        width: 4,
                        height: 28,
                        background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
                        borderRadius: 2
                      }}
                    />
                    {category.name}
                    <Chip
                      label={`${category.exams.length} papers`}
                      size="small"
                      sx={{
                        background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(27,107,58,0.08)',
                        color: isDark ? '#a7f3d0' : '#1B6B3A',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                      }}
                    />
                  </Typography>
                </Box>

                {/* Exams Grid */}
                <Grid container spacing={3}>
                  {category.exams.map((exam: any) => {
                    const bestScore = bestScores[exam.id];
                    const attempted = bestScore !== undefined;

                    return (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={exam.id}>
                        <motion.div
                          whileHover={{ y: -6, scale: 1.01 }}
                          transition={{ type: 'spring', stiffness: 150, damping: 15 }}
                          style={{ height: '100%' }}
                        >
                          <Paper
                            sx={{
                              p: 3,
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              borderRadius: 5,
                              bgcolor: 'background.paper',
                              border: '1px solid',
                              borderColor: 'divider',
                              boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.2)' : '0 4px 16px rgba(0,0,0,0.02)',
                              position: 'relative',
                              overflow: 'hidden',
                              transition: 'box-shadow 0.3s ease',
                              '&:hover': {
                                boxShadow: isDark ? '0 12px 28px rgba(0,0,0,0.4)' : '0 8px 24px rgba(27,107,58,0.06)',
                              }
                            }}
                          >
                            {/* Accent line top */}
                            <Box 
                              sx={{ 
                                position: 'absolute', 
                                top: 0, 
                                left: 0, 
                                right: 0, 
                                height: 3, 
                                background: 'linear-gradient(90deg, #1B6B3A, #2E8B57)' 
                              }} 
                            />

                            {/* Card Content */}
                            <Box sx={{ flexGrow: 1, pt: 1 }}>
                              {/* Header info */}
                              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                                <Chip
                                  label={`YEAR ${exam.year}`}
                                  size="small"
                                  sx={{
                                    bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                                    color: 'text.secondary',
                                    fontSize: '0.65rem',
                                    fontWeight: 800,
                                    height: 22
                                  }}
                                />
                                
                                {/* Attempt State Indicator */}
                                <Chip
                                  label={attempted ? `Best: ${bestScore}%` : 'Not Attempted'}
                                  size="small"
                                  sx={{
                                    bgcolor: attempted 
                                      ? 'rgba(34, 197, 94, 0.1)' 
                                      : isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                                    color: attempted ? '#22c55e' : 'text.secondary',
                                    border: '1px solid',
                                    borderColor: attempted ? 'rgba(34, 197, 94, 0.2)' : 'divider',
                                    fontSize: '0.65rem',
                                    fontWeight: 800,
                                    height: 22
                                  }}
                                />
                              </Stack>

                              {/* Title */}
                              <Typography
                                sx={{
                                  fontFamily: "'Cabinet Grotesk', sans-serif",
                                  fontWeight: 800,
                                  color: 'text.primary',
                                  fontSize: '1.15rem',
                                  lineHeight: 1.3,
                                  mb: 2.5
                                }}
                              >
                                {exam.name}
                              </Typography>

                              {/* Details Grid */}
                              <Box 
                                sx={{ 
                                  display: 'grid', 
                                  gridTemplateColumns: 'repeat(3, 1fr)', 
                                  gap: 1,
                                  p: 1.5,
                                  borderRadius: 3,
                                  bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  mb: 3
                                }}
                              >
                                <Stack alignItems="center" sx={{ textAlign: 'center' }}>
                                  <TimerIcon sx={{ color: '#2E8B57', fontSize: 16, mb: 0.5 }} />
                                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: 'text.primary' }}>
                                    {exam.duration_minutes || 120}m
                                  </Typography>
                                  <Typography sx={{ fontSize: '0.55rem', color: 'text.secondary' }}>Duration</Typography>
                                </Stack>
                                <Stack alignItems="center" sx={{ textAlign: 'center', borderLeft: '1px solid', borderRight: '1px solid', borderColor: 'divider' }}>
                                  <AssignmentIcon sx={{ color: '#2E8B57', fontSize: 16, mb: 0.5 }} />
                                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: 'text.primary' }}>
                                    100
                                  </Typography>
                                  <Typography sx={{ fontSize: '0.55rem', color: 'text.secondary' }}>MCQs</Typography>
                                </Stack>
                                <Stack alignItems="center" sx={{ textAlign: 'center' }}>
                                  <BoltIcon sx={{ color: '#8B5CF6', fontSize: 16, mb: 0.5 }} />
                                  <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: 'text.primary' }}>
                                    +100
                                  </Typography>
                                  <Typography sx={{ fontSize: '0.55rem', color: 'text.secondary' }}>Study XP</Typography>
                                </Stack>
                              </Box>
                            </Box>

                            {/* Buttons */}
                            <Stack direction="row" spacing={1.5} sx={{ mt: 'auto' }}>
                              <Button
                                variant="outlined"
                                fullWidth
                                onClick={() => handleOpenSyllabus(exam)}
                                sx={{
                                  py: 1,
                                  fontSize: '0.75rem',
                                  borderRadius: 2.5,
                                  textTransform: 'none',
                                  borderColor: 'divider',
                                  color: 'text.primary',
                                  '&:hover': {
                                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                                    borderColor: 'text.primary'
                                  }
                                }}
                              >
                                Syllabus
                              </Button>
                              <Button
                                variant="contained"
                                fullWidth
                                onClick={() => handleExamSelect(exam.id.toString())}
                                sx={{
                                  py: 1,
                                  fontSize: '0.75rem',
                                  borderRadius: 2.5,
                                  textTransform: 'none',
                                  background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #2E8B57, #3da068)'
                                  }
                                }}
                              >
                                Begin Test
                              </Button>
                            </Stack>
                          </Paper>
                        </motion.div>
                      </Grid>
                    );
                  })}
                </Grid>
              </motion.div>
            ))
          ) : !isLoading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <AssignmentIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
              <Alert 
                severity="info" 
                sx={{ 
                  maxWidth: 400, 
                  mx: 'auto',
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  borderColor: 'divider',
                  color: 'text.primary',
                  '& .MuiAlert-icon': {
                    color: '#2E8B57'
                  }
                }}
              >
                {searchQuery ? 'No mock exams matches your criteria.' : 'No papers categories found.'}
              </Alert>
            </Box>
          ) : null}
        </Stack>
      </motion.div>

      {/* Interactive Syllabus Detail Modal */}
      <Dialog
        open={syllabusOpen}
        onClose={() => setSyllabusOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 5,
            p: 1,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider'
          }
        }}
      >
        {selectedExamForSyllabus && (
          <>
            <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontSize: '0.7rem', color: '#F59E0B', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Exam Blueprint & Guidelines
                </Typography>
                <Typography variant="h5" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, color: 'text.primary', mt: 0.5 }}>
                  {selectedExamForSyllabus.name}
                </Typography>
              </Box>
              <IconButton onClick={() => setSyllabusOpen(false)} sx={{ color: 'text.secondary' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ borderColor: 'divider', p: 3 }}>
              {/* Marking Scheme */}
              <Typography sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, fontSize: '0.95rem', color: 'text.primary', mb: 1.5 }}>
                Marking Rules (Official Kerala PSC Grid)
              </Typography>
              <Box 
                sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: 2, 
                  mb: 3.5 
                }}
              >
                <Box sx={{ p: 2, bgcolor: isDark ? 'rgba(34, 197, 94, 0.05)' : 'rgba(34, 197, 94, 0.03)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: 3, textAlign: 'center' }}>
                  <Typography sx={{ color: '#22c55e', fontSize: '1.25rem', fontWeight: 900 }}>+1.0</Typography>
                  <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', fontWeight: 700 }}>Correct Answer</Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: isDark ? 'rgba(239, 68, 68, 0.05)' : 'rgba(239, 68, 68, 0.03)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 3, textAlign: 'center' }}>
                  <Typography sx={{ color: '#EF4444', fontSize: '1.25rem', fontWeight: 900 }}>-0.33</Typography>
                  <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', fontWeight: 700 }}>Incorrect Penalty</Typography>
                </Box>
                <Box sx={{ p: 2, bgcolor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)', border: '1px solid', borderColor: 'divider', borderRadius: 3, textAlign: 'center' }}>
                  <Typography sx={{ color: 'text.primary', fontSize: '1.25rem', fontWeight: 900 }}>0.0</Typography>
                  <Typography sx={{ fontSize: '0.65rem', color: 'text.secondary', fontWeight: 700 }}>Skipped Question</Typography>
                </Box>
              </Box>

              {/* Syllabus details dynamically queried from database if matches, else fall back to default template */}
              {selectedSyllabus ? (
                <Box sx={{ mb: 3.5 }}>
                  <Typography sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, fontSize: '0.95rem', color: 'text.primary', mb: 1.5 }}>
                    Syllabus Details (Database Resource)
                  </Typography>
                  <Box 
                    sx={{ 
                      p: 2, 
                      borderRadius: 3, 
                      bgcolor: isDark ? 'rgba(255, 255, 255, 0.01)' : 'rgba(0,0,0,0.01)', 
                      border: '1px solid', 
                      borderColor: 'divider',
                      maxHeight: 250,
                      overflowY: 'auto'
                    }}
                    dangerouslySetInnerHTML={{ __html: selectedSyllabus.details }}
                  />
                  {selectedSyllabus.pdf_file_url && (
                    <Button 
                      variant="text" 
                      href={selectedSyllabus.pdf_file_url} 
                      target="_blank"
                      sx={{ mt: 1.5, fontSize: '0.8rem', fontWeight: 700 }}
                    >
                      Download Syllabus PDF 📎
                    </Button>
                  )}
                </Box>
              ) : (
                /* Dynamic weightages template fallback */
                <Box sx={{ mb: 3.5 }}>
                  <Typography sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, fontSize: '0.95rem', color: 'text.primary', mb: 1.5 }}>
                    Subject-wise Topic Weightage (Estimated)
                  </Typography>
                  <Stack spacing={1.5}>
                    {getSyllabusWeightage(selectedExamForSyllabus.name).map((item, idx) => (
                      <Box key={idx}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.primary' }}>
                            {item.subject}
                          </Typography>
                          <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#2E8B57' }}>
                            {item.weight}% ({item.weight} Questions)
                          </Typography>
                        </Stack>
                        <LinearProgress 
                          variant="determinate" 
                          value={item.weight} 
                          sx={{ 
                            height: 6, 
                            borderRadius: 2,
                            '& .MuiLinearProgress-bar': {
                              background: 'linear-gradient(90deg, #1B6B3A, #2E8B57)'
                            }
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Simulation Guidelines */}
              <Box sx={{ p: 2, bgcolor: isDark ? 'rgba(245, 158, 11, 0.04)' : 'rgba(245, 158, 11, 0.02)', border: '1px solid rgba(245, 158, 11, 0.15)', borderRadius: 3 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <InfoOutlinedIcon sx={{ fontSize: 16 }} /> SIMULATION INSTRUCTIONS
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', lineHeight: 1.5 }}>
                  1. The simulation will run for a continuous <strong>{selectedExamForSyllabus.duration_minutes || 120} minutes</strong>.<br />
                  2. Once started, you cannot pause the test. Navigating away does not pause the time limit.<br />
                  3. Answers will be locked and compiled upon hitting the "Submit Test" or on time expiry.
                </Typography>
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, gap: 1 }}>
              <Button 
                variant="outlined" 
                onClick={() => setSyllabusOpen(false)}
                sx={{
                  borderRadius: 2.5,
                  textTransform: 'none',
                  borderColor: 'divider',
                  color: 'text.primary',
                  px: 3,
                  '&:hover': {
                    bgcolor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                    borderColor: 'text.primary'
                  }
                }}
              >
                Close
              </Button>
              <Button 
                variant="contained" 
                onClick={() => {
                  setSyllabusOpen(false);
                  handleExamSelect(selectedExamForSyllabus.id.toString());
                }}
                sx={{
                  borderRadius: 2.5,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
                  px: 4,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2E8B57, #3da068)'
                  }
                }}
                startIcon={<PlayArrowIcon />}
              >
                Start Simulation
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Auth Verification Dialog */}
      <Dialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 5,
            p: 2,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider'
          }
        }}
      >
        <DialogTitle sx={{ p: 1, textAlign: 'center', fontWeight: 900, fontFamily: "'Cabinet Grotesk'", fontSize: '1.4rem' }}>
          Authentication Required 🎓
        </DialogTitle>
        <DialogContent sx={{ p: 2, textAlign: 'center' }}>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.925rem', mb: 1 }}>
            To begin this mock exam, track study streaks, and view explanations, please sign in or register a free student account.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', gap: 1.5, p: 1, pb: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setAuthDialogOpen(false)}
            sx={{ borderRadius: '10px', textTransform: 'none', px: 3, fontWeight: 700 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setAuthDialogOpen(false);
              router.push('/login');
            }}
            sx={{ borderRadius: '10px', textTransform: 'none', px: 3, fontWeight: 700 }}
          >
            Login
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setAuthDialogOpen(false);
              router.push('/register');
            }}
            sx={{
              borderRadius: '10px',
              textTransform: 'none',
              px: 3,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2E8B57, #3da068)'
              }
            }}
          >
            Register
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}