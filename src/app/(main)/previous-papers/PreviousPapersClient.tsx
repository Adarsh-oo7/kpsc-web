'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Box, Typography, Grid, Alert, CircularProgress, Paper,
  Stack, TextField, InputAdornment, Container, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Button
} from '@mui/material';
import { useAppContext } from '@/context/AppContext';
import { motion, Variants } from 'framer-motion';
import apiClient from '@/lib/apiClient';

// Import relevant icons
import HistoryIcon from '@mui/icons-material/History';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

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


export default function PreviousPapersClient() {
  const { setExamId, fetcher, user } = useAppContext();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  // States for options dialog & PYQ PDF papers
  const [selectedExam, setSelectedExam] = useState<any | null>(null);
  const [optionsDialogOpen, setOptionsDialogOpen] = useState(false);
  const [pyqList, setPyqList] = useState<any[]>([]);
  const [pyqLoading, setPyqLoading] = useState(false);

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

  // CORRECTED: This opens the preparation options dialog
  const handleExamSelect = async (exam: any) => {
    if (!user) {
      setAuthDialogOpen(true);
      return;
    }
    setSelectedExam(exam);
    setOptionsDialogOpen(true);
    setPyqLoading(true);
    setPyqList([]);
    try {
      const res = await apiClient.get(`/exams/${exam.id}/pyq/`);
      setPyqList(res.data || []);
    } catch (err) {
      console.error("Error fetching PYQs:", err);
    } finally {
      setPyqLoading(false);
    }
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
                            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={exam.id}>
                                <ExamCard exam={exam} onClick={() => handleExamSelect(exam)} categoryName={category.name} />
                            </Grid>
                        ))}
                    </Grid>
                </motion.div>
                ))
            ) : (
                <Alert severity="info">{searchQuery ? 'No papers match your search.' : 'No previous papers found.'}</Alert>
            )}
        </Stack>

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
      {/* Paper Options Dialog */}
      <Dialog
        open={optionsDialogOpen}
        onClose={() => setOptionsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 5,
            p: 3,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
          }
        }}
      >
        <DialogTitle sx={{ p: 0, mb: 2, fontWeight: 950, fontFamily: "'Cabinet Grotesk'", fontSize: '1.4rem', color: 'text.primary' }}>
          {selectedExam?.name} Question Paper Archives
        </DialogTitle>
        <DialogContent sx={{ p: 0, mb: 3 }}>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', mb: 3 }}>
            Choose how you would like to prepare with this previous year paper:
          </Typography>
          
          <Stack spacing={3}>
            {/* Option 1: Start Mock Test */}
            <Paper
              variant="outlined"
              onClick={() => {
                setOptionsDialogOpen(false);
                if (selectedExam) {
                  setExamId(selectedExam.id.toString());
                  router.push(`/quiz?exam_id=${selectedExam.id}`);
                }
              }}
              sx={{
                p: 2.5,
                borderRadius: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'action.hover',
                '&:hover': {
                  borderColor: '#2E8B57',
                  bgcolor: 'rgba(46, 139, 87, 0.04)',
                }
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1rem', mb: 0.5 }}>
                  Attempt as Online Mock Test 🎯
                </Typography>
                <Typography sx={{ fontSize: '0.775rem', color: 'text.secondary' }}>
                  Solve with a live countdown timer, scoring, and instant AI explanation support.
                </Typography>
              </Box>
              <ArrowForwardIcon sx={{ color: '#2E8B57' }} />
            </Paper>

            {/* Option 2: Download PDF (PYQs) */}
            <Box>
              <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: '0.9rem', mb: 1.5, mt: 1 }}>
                Download Official PDF Question Papers:
              </Typography>
              {pyqLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} sx={{ color: '#2E8B57' }} />
                </Box>
              ) : pyqList.length > 0 ? (
                <Stack spacing={1.5}>
                  {pyqList.map((pyq) => (
                    <Paper
                      key={pyq.id}
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderColor: 'divider',
                        bgcolor: 'background.default',
                      }}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.85rem' }}>
                          {pyq.title || `${selectedExam?.name} - PYQ`}
                        </Typography>
                        <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                          Year: {pyq.year || selectedExam?.year}
                        </Typography>
                      </Box>
                      {pyq.pdf_file_url ? (
                        <Button
                          variant="contained"
                          size="small"
                          href={pyq.pdf_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
                              filter: 'brightness(1.1)',
                            }
                          }}
                        >
                          Download PDF
                        </Button>
                      ) : (
                        <Typography sx={{ fontSize: '0.75rem', color: 'text.disabled', fontStyle: 'italic' }}>
                          PDF Pending Upload
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </Stack>
              ) : (
                <Typography sx={{ fontSize: '0.8rem', color: 'text.disabled', fontStyle: 'italic', pl: 1 }}>
                  No official PDF downloads uploaded for this category yet.
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 0 }}>
          <Button
            variant="outlined"
            onClick={() => setOptionsDialogOpen(false)}
            sx={{ borderRadius: '10px', textTransform: 'none', px: 3, fontWeight: 700 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
