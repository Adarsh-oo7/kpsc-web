'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Box, Typography, Grid, Alert, CircularProgress, Paper,
  Stack, TextField, InputAdornment, Container, Chip
} from '@mui/material';
import { useAppContext } from '@/context/AppContext';
import { motion, Variants } from 'framer-motion';

// Import relevant icons
import HistoryIcon from '@mui/icons-material/History';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// Using the same design components from the Exams page for consistency
const categoryGradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
];

const getCategoryGradient = (categoryName: string) => {
  const hash = categoryName.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0);
  return categoryGradients[Math.abs(hash) % categoryGradients.length];
};

const ExamCard = ({ exam, onClick, categoryName }: { exam: any; onClick: () => void; categoryName: string }) => (
    <motion.div whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.95 }} style={{ height: '100%', cursor: 'pointer' }}>
      <Paper
        onClick={onClick}
        sx={{
          position: 'relative', width: '100%', aspectRatio: '1 / 1', borderRadius: 4,
          overflow: 'hidden', background: getCategoryGradient(categoryName), boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          transition: 'all 0.3s ease', '&:hover': { boxShadow: '0 15px 35px rgba(0,0,0,0.25)' }
        }}
      >
        <Box sx={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: 'white',
          p: 2, zIndex: 1, background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.3) 100%)'
        }}>
          <HistoryIcon sx={{ fontSize: { xs: 32, md: 48 }, mb: 1.5 }}/>
          <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '1rem' }, lineHeight: 1.2, mb: 0.5 }}>
            {exam.name}
          </Typography>
          <Chip
            icon={<CalendarTodayIcon sx={{ fontSize: '0.8rem !important' }} />} label={exam.year} size="small"
            sx={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
          />
        </Box>
      </Paper>
    </motion.div>
);


export default function PreviousPapersPage() {
  const { setExamId, fetcher } = useAppContext();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // CORRECTED: This now fetches all exams, which represent previous papers
  const { data: categories, error, isLoading } = useSWR('/exams/', fetcher);

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    if (!searchQuery.trim()) return categories;
    const lowercasedQuery = searchQuery.toLowerCase();
    return categories
      .map((category: any) => ({ ...category, exams: category.exams.filter((exam: any) => exam.name.toLowerCase().includes(lowercasedQuery)) }))
      .filter((category: any) => category.exams.length > 0);
  }, [categories, searchQuery]);

  // CORRECTED: This ensures reliable navigation to the quiz
  const handleExamSelect = (selectedExamId: string) => {
    setExamId(selectedExamId);
    router.push(`/quiz?exam_id=${selectedExamId}`);
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">Error fetching papers. Please try again later.</Alert>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, color: 'white', display: 'flex', alignItems: 'center' }}>
                <HistoryIcon sx={{ mr: 1.5, fontSize: '2.5rem' }} />
                Previous Question Papers
            </Typography>
            <Paper sx={{ p: 2, mb: 5, borderRadius: 4, bgcolor: 'background.paper' }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search for a previous paper..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>),
                    }}
                />
            </Paper>
        </motion.div>
        
        <Stack spacing={5}>
            {filteredCategories && filteredCategories.length > 0 ? (
                filteredCategories.map((category: any) => (
                <motion.div key={category.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'white', mb: 3, borderLeft: '4px solid', borderColor: 'primary.main', pl: 2 }}>
                        {category.name}
                    </Typography>
                    <Grid container spacing={3}>
                        {category.exams.map((exam: any) => (
                            <Grid item xs={6} sm={4} md={3} key={exam.id}>
                                <ExamCard exam={exam} onClick={() => handleExamSelect(exam.id.toString())} categoryName={category.name} />
                            </Grid>
                        ))}
                    </Grid>
                </motion.div>
                ))
            ) : (
                <Alert severity="info">{searchQuery ? 'No papers match your search.' : 'No previous papers found.'}</Alert>
            )}
        </Stack>
    </Container>
  );
}