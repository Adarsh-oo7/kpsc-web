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

// Helper to resolve topic weightages based on exam name — aligned with official KPSC marks
const getSyllabusWeightage = (examName: string) => {
  const name = examName.toLowerCase();
  if (name.includes('ldc') || name.includes('clerk')) {
    return [
      { subject: 'Part I: General Knowledge', weight: 50 },
      { subject: 'Part II: Current Affairs', weight: 20 },
      { subject: 'Part III: Simple Arithmetic & Mental Ability', weight: 10 },
      { subject: 'Part IV: General English', weight: 10 },
      { subject: 'Part V: Regional Language', weight: 10 }
    ];
  } else if (name.includes('lgs') || name.includes('servant')) {
    return [
      { subject: 'Part I: General Knowledge', weight: 40 },
      { subject: 'Part II: Current Affairs', weight: 20 },
      { subject: 'Part III: Science', weight: 10 },
      { subject: 'Part IV: Public Health', weight: 10 },
      { subject: 'Part V: Simple Arithmetic & Mental Ability', weight: 20 }
    ];
  } else if (name.includes('constable') || name.includes('cpo') || name.includes('police')) {
    return [
      { subject: 'Part I: General Knowledge', weight: 40 },
      { subject: 'Part II: Current Affairs', weight: 10 },
      { subject: 'Part III: Simple Arithmetic & Mental Ability', weight: 10 },
      { subject: 'Part IV: General English', weight: 10 },
      { subject: 'Part V: Regional Language', weight: 10 },
      { subject: 'Part VI: Special Topics (Job-Related)', weight: 20 }
    ];
  } else if (name.includes('degree') || name.includes('graduate') || name.includes('assistant')) {
    return [
      { subject: 'Part I: General Knowledge', weight: 50 },
      { subject: 'Part II: Simple Arithmetic & Mental Ability', weight: 20 },
      { subject: 'Part III: General English', weight: 20 },
      { subject: 'Part IV: Regional Language', weight: 10 }
    ];
  } else {
    return [
      { subject: 'General Studies & Current Affairs', weight: 40 },
      { subject: 'English Language & Grammar', weight: 20 },
      { subject: 'Regional Language', weight: 20 },
      { subject: 'Arithmetic & Mental Ability', weight: 20 }
    ];
  }
};

export default function ExamsClient() {
  const { setExamId, fetcher, themeMode, user, profile } = useAppContext();
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

  // Weekly recommended test (Matches user's preferred exams if logged in, otherwise first exam in list)
  const featuredExam = useMemo(() => {
    if (!categories || categories.length === 0) return null;
    
    // Prioritize showing a test matching user's preferred exams
    if (profile?.preferred_exams && profile.preferred_exams.length > 0) {
      // Build sets for matching by ID, slug, and name keywords
      const preferredIds = new Set(profile.preferred_exams.map((pe: any) => pe.id));
      const preferredSlugs = new Set(profile.preferred_exams.map((pe: any) => (pe.slug || '').toLowerCase()));
      const preferredNames = profile.preferred_exams.map((pe: any) => (pe.name || '').toLowerCase());
      
      for (const cat of categories) {
        if (cat.exams && cat.exams.length > 0) {
          // First try exact ID match
          const idMatch = cat.exams.find((exam: any) => preferredIds.has(exam.id));
          if (idMatch) return { ...idMatch, categoryName: cat.name };
          
          // Then try slug match
          const slugMatch = cat.exams.find((exam: any) => 
            preferredSlugs.has((exam.slug || '').toLowerCase())
          );
          if (slugMatch) return { ...slugMatch, categoryName: cat.name };
          
          // Then try name keyword match (e.g. "LDC" in name matches "LD Clerk (LDC)")
          const nameMatch = cat.exams.find((exam: any) => {
            const examNameLower = (exam.name || '').toLowerCase();
            return preferredNames.some((pn: string) => {
              // Extract keywords (3+ chars) from preferred name and check if exam name contains them
              const keywords = pn.replace(/[()]/g, '').split(/\s+/).filter((w: string) => w.length >= 3);
              return keywords.some((kw: string) => examNameLower.includes(kw));
            });
          });
          if (nameMatch) return { ...nameMatch, categoryName: cat.name };
        }
      }
    }
    
    for (const cat of categories) {
      if (cat.exams && cat.exams.length > 0) {
        return { ...cat.exams[0], categoryName: cat.name };
      }
    }
    return null;
  }, [categories, profile]);

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
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.5, fontWeight: 600 }}>
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
                                Syllabus Details
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
                                  boxShadow: isDark ? 'none' : '0 4px 12px rgba(27, 107, 58, 0.2)',
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #2E8B57, #3da068)',
                                  }
                                }}
                                startIcon={<PlayArrowIcon sx={{ fontSize: '0.9rem !important' }} />}
                              >
                                Begin Practice
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
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper', borderRadius: 4 }}>
              <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>No mock papers match your query.</Typography>
            </Paper>
          )}
        </Stack>
      </motion.div>

      {/* Auth Gate dialog */}
      <Dialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        PaperProps={{
          sx: {
            background: isDark ? '#161B22' : '#ffffff',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '24px',
            p: 1.5,
            maxWidth: 420
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, textAlign: 'center', fontSize: '1.45rem', pb: 1 }}>
          🔒 Auth Required
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            Mock tests require registration to track study progress, reward XP, calculate rank, and profile weak chapters. Register in 5 seconds to unlock.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ flexDirection: 'column', gap: 1.5, px: 3, pb: 3 }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => router.push('/register')}
            sx={{
              py: 1.3,
              borderRadius: '10px',
              fontWeight: 750,
              textTransform: 'none',
              background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)'
            }}
          >
            Create Free Account
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => router.push('/login')}
            sx={{
              py: 1.3,
              borderRadius: '10px',
              fontWeight: 750,
              textTransform: 'none',
              mt: '0 !important'
            }}
          >
            Log In
          </Button>
        </DialogActions>
      </Dialog>

      {/* Syllabus Modal */}
      <Dialog
        open={syllabusOpen}
        onClose={() => setSyllabusOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 6,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              Exam Syllabus Details
            </Typography>
            <Typography variant="h5" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, color: 'text.primary', pr: 4 }}>
              {selectedExamForSyllabus?.name}
            </Typography>
          </Stack>
          <IconButton
            onClick={() => setSyllabusOpen(false)}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: 'text.secondary',
            }}
          >
            <Typography sx={{ fontSize: '1.25rem' }}>✕</Typography>
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 3 }}>
          {selectedSyllabus ? (
            <Stack spacing={4}>
              {/* Detailed Syllabus Text */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                  Structure & Detail
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.primary', 
                    lineHeight: 1.7,
                    whiteSpace: 'pre-line',
                    bgcolor: isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)',
                    p: 2,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  {selectedSyllabus.details}
                </Typography>
              </Box>

              {/* Subject weightage analysis */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                  Subject Weightage distribution
                </Typography>
                <Stack spacing={1.5}>
                  {(selectedSyllabus?.subject_weights && selectedSyllabus.subject_weights.length > 0
                    ? selectedSyllabus.subject_weights
                    : getSyllabusWeightage(selectedExamForSyllabus?.name)
                  ).map((sub: any, idx: number) => (
                    <Box key={idx}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{sub.subject}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main', fontFamily: "'JetBrains Mono'" }}>{sub.weight}%</Typography>
                      </Stack>
                      <LinearProgress 
                        variant="determinate" 
                        value={sub.weight} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            background: 'linear-gradient(90deg, #1B6B3A, #2E8B57)'
                          }
                        }} 
                      />
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Stack>
          ) : (
            <Stack spacing={2} alignItems="center" sx={{ py: 4, textAlign: 'center' }}>
              <SchoolIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>Syllabus details pending</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 360 }}>
                  We are currently verifying the subject weightages for this {selectedExamForSyllabus?.year} exam. Study mode remains open.
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2.5 }}>
          {selectedSyllabus?.pdf_file_url && (
            <Button
              variant="outlined"
              href={selectedSyllabus.pdf_file_url}
              target="_blank"
              sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700 }}
            >
              Download PDF Syllabus
            </Button>
          )}
          <Button
            variant="contained"
            onClick={() => { setSyllabusOpen(false); handleExamSelect(selectedExamForSyllabus.id.toString()); }}
            sx={{ 
              borderRadius: 2.5, 
              textTransform: 'none', 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)'
            }}
          >
            Start Practice
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
