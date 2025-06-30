'use client';

// --- React and Next.js Imports ---
import { useRouter } from 'next/navigation';

// --- Data Fetching and API Imports ---
import useSWR from 'swr';

// --- UI and Styling Imports ---
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Chip,
  useTheme,
  Button,
  Paper,
  Container,
} from '@mui/material';

// --- Icon Imports ---
import SchoolIcon from '@mui/icons-material/School';
import CategoryIcon from '@mui/icons-material/Category';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LockIcon from '@mui/icons-material/Lock';

// --- Animation Imports ---
import { motion, Variants } from 'framer-motion';

// --- App Specific Imports ---
import { useAppContext } from '@/context/AppContext';

// --- Enhanced Animated Square Card Component ---
function AnimatedSquareCard({
  title,
  icon,
  badgeContent,
  onClick,
  variants,
  isLocked = false,
  iconColor = '#1976d2',
}: {
  title: string;
  icon: React.ReactNode;
  badgeContent: React.ReactNode;
  onClick: () => void;
  variants: Variants;
  isLocked?: boolean;
  iconColor?: string;
}) {
  const theme = useTheme();
  
  return (
    <motion.div
      variants={variants}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      style={{ height: '100%' }}
    >
      <Paper
        elevation={0}
        onClick={onClick}
        sx={{
          height: 200, // Fixed height for equal sizing
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: 3,
          background: isLocked 
            ? `linear-gradient(135deg, #2a2a2a, #1a1a1a)` 
            : `linear-gradient(135deg, #ffffff, #f8fdff)`,
          borderRadius: 3,
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          border: `2px solid ${isLocked ? '#404040' : 'rgba(25, 118, 210, 0.2)'}`,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: isLocked 
              ? '#505050'
              : `linear-gradient(90deg, #1976d2, #42a5f5)`,
            opacity: 0,
            transition: 'opacity 0.3s ease',
          },
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 12px 32px rgba(25, 118, 210, 0.2)`,
            border: `2px solid ${isLocked ? '#606060' : '#1976d2'}`,
            '&::before': {
              opacity: 1,
            },
          },
        }}
      >
        {/* Badge */}
        <Chip
          label={badgeContent}
          size="small"
          icon={isLocked ? <LockIcon sx={{ fontSize: '12px !important' }} /> : undefined}
          sx={{
            position: 'absolute',
            top: { xs: 8, sm: 12 }, // Responsive positioning
            right: { xs: 8, sm: 12 },
            bgcolor: isLocked ? '#505050' : '#1976d2',
            color: 'white',
            fontWeight: 600,
            fontSize: { xs: '0.7rem', sm: '0.75rem' }, // Responsive font size
            height: { xs: 20, sm: 24 }, // Responsive height
            '& .MuiChip-label': {
              px: { xs: 0.5, sm: 1 }, // Responsive padding
            },
          }}
        />

        {/* Icon Container - Square Shape */}
        <Box
          sx={{
            mb: { xs: 1.5, sm: 2 }, // Responsive margin
            width: { xs: 60, sm: 70, md: 80 }, // Responsive size
            height: { xs: 60, sm: 70, md: 80 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 2,
            background: isLocked 
              ? `linear-gradient(135deg, #505050, #404040)`
              : `linear-gradient(135deg, ${iconColor}, ${iconColor}dd)`,
            boxShadow: isLocked 
              ? '0 4px 12px rgba(0,0,0,0.3)'
              : `0 4px 12px ${iconColor}40`,
            transition: 'all 0.3s ease',
            '& .MuiSvgIcon-root': {
              fontSize: { xs: '2rem', sm: '2.2rem', md: '2.5rem' }, // Responsive icon size
              color: 'white',
              transition: 'all 0.3s ease',
            },
            '&:hover': {
              transform: 'scale(1.1) rotate(5deg)',
              boxShadow: isLocked 
                ? '0 6px 20px rgba(0,0,0,0.4)'
                : `0 6px 20px ${iconColor}60`,
            },
          }}
        >
          {icon}
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          component="h3"
          sx={{ 
            fontWeight: 600, 
            textAlign: 'center',
            color: isLocked ? '#888888' : '#333333',
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }, // Responsive font size
            lineHeight: 1.2,
            px: 1, // Prevent text overflow on small screens
          }}
        >
          {title}
        </Typography>
      </Paper>
    </motion.div>
  );
}

// --- Main Page Component ---
export default function Home() {
  const { user, isInstituteOwner, fetcher } = useAppContext();
  const router = useRouter();
  const theme = useTheme();

  // Data fetching using the global fetcher from context
  const { data: exams, isLoading: examsLoading } = useSWR('/exams/', fetcher);
  const { data: topics, isLoading: topicsLoading } = useSWR('/topics/', fetcher);

  const handleCardClick = (path: string) => {
    if ((path === '/progress' || path === '/profile') && !user) {
      router.push('/login');
    } else {
      router.push(path);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2 
      } 
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: 'spring', 
        stiffness: 100, 
        damping: 12 
      } 
    },
  };

  const dashboardCards = [
    { 
      title: "Exams", 
      icon: <SchoolIcon />, 
      badgeContent: examsLoading ? <CircularProgress size={12} color="inherit" /> : (exams?.length || 0), 
      onClick: () => handleCardClick('/exams'),
      isLocked: false,
      iconColor: '#1976d2' // Blue
    },
    { 
      title: "Topics", 
      icon: <CategoryIcon />, 
      badgeContent: topicsLoading ? <CircularProgress size={12} color="inherit" /> : (topics?.length || 0), 
      onClick: () => handleCardClick('/topics'),
      isLocked: false,
      iconColor: '#2e7d32' // Green
    },
    { 
      title: "Progress", 
      icon: <TrendingUpIcon />, 
      badgeContent: user ? "View" : "Login", 
      onClick: () => handleCardClick('/progress'),
      isLocked: !user,
      iconColor: '#ed6c02' // Orange
    },
    { 
      title: "Profile", 
      icon: <AccountCircleIcon />, 
      badgeContent: user ? "Account" : "Login", 
      onClick: () => handleCardClick('/profile'),
      isLocked: !user,
      iconColor: '#9c27b0' // Purple
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(135deg, #f5f7fa, #c3cfe2)`,
      py: { xs: 2, sm: 4, md: 6 },
      px: { xs: 1, sm: 2 } // Add horizontal padding for mobile
    }}>
      <Container maxWidth="lg">
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography 
                variant="h2" 
                component="h1" 
                sx={{ 
                  fontWeight: 700, 
                  mb: 2, 
                  color: '#1a1a1a',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.5rem' }
                }}
              >
                Dashboard
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#666666',
                  fontWeight: 400,
                  maxWidth: 600,
                  mx: 'auto',
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                  lineHeight: 1.5
                }}
              >
                Welcome back! Manage your learning journey with ease
              </Typography>
            </Box>
          </motion.div>

          {/* Institute Owner Portal */}
          {isInstituteOwner && (
            <motion.div variants={itemVariants}>
              <Paper
                elevation={3}
                sx={{
                  p: 4, 
                  mb: 6, 
                  borderRadius: 4,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
                    pointerEvents: 'none',
                  }
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  flexWrap: 'wrap', 
                  gap: 3,
                  position: 'relative',
                  zIndex: 1
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: 2,
                        p: 1.5,
                        mr: 3,
                      }}
                    >
                      <CorporateFareIcon sx={{ fontSize: 32, color: 'white' }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
                        Institute Portal
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                        Manage students, content, and analytics
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    variant="contained" 
                    size="large" 
                    onClick={() => router.push('/institute/dashboard')}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ 
                      bgcolor: 'white', 
                      color: 'primary.main',
                      fontWeight: 600,
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      '&:hover': { 
                        bgcolor: 'grey.100',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Access Portal
                  </Button>
                </Box>
              </Paper>
            </motion.div>
          )}

          {/* Dashboard Cards */}
          <motion.div variants={itemVariants}>
            <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ maxWidth: '800px', margin: '0 auto', px: { xs: 1, sm: 0 } }}>
              {dashboardCards.map((card) => (
                <Grid item xs={6} sm={6} md={6} key={card.title}>
                  <AnimatedSquareCard
                    title={card.title}
                    icon={card.icon}
                    badgeContent={card.badgeContent}
                    onClick={card.onClick}
                    variants={itemVariants}
                    isLocked={card.isLocked}
                    iconColor={card.iconColor}
                  />
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
}