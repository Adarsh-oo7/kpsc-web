'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
  Grid,
  Card,
  CardContent,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import QuizIcon from '@mui/icons-material/Quiz';
import TimerIcon from '@mui/icons-material/Timer';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useRouter } from 'next/navigation';

interface StartLearningModalProps {
  open: boolean;
  onClose: () => void;
  examName?: string;
}

export default function StartLearningModal({ open, onClose, examName = 'LGS 2026' }: StartLearningModalProps) {
  const router = useRouter();
  const [selectedPathway, setSelectedPathway] = useState<'syllabus' | 'model' | 'mock' | 'pyq' | null>(null);

  const syllabusSubjects = [
    {
      name: 'General Knowledge & Renaissance (പൊതുവിജ്ഞാനം)',
      marks: 50,
      color: '#10B981',
      topics: [
        { title: 'Kerala History & Renaissance Leaders', query: 'kerala-history' },
        { title: 'Indian Geography & Rivers', query: 'geography' },
        { title: 'Indian Constitution & Fundamental Rights', query: 'constitution' },
        { title: 'SCERT Basic Science (Physics, Chem, Bio)', query: 'science' },
        { title: 'Current Affairs 2026', query: 'current-affairs' },
      ]
    },
    {
      name: 'Simple Arithmetic & Mental Ability (ഗണിതം)',
      marks: 20,
      color: '#3B82F6',
      topics: [
        { title: 'Numbers, Fractions & Percentages', query: 'percentages' },
        { title: 'Profit & Loss, Simple Interest', query: 'arithmetic' },
        { title: 'Time, Distance & Work', query: 'time-work' },
        { title: 'Mental Ability & Series Completion', query: 'reasoning' },
      ]
    },
    {
      name: 'General English (ഇംഗ്ലീഷ്)',
      marks: 20,
      color: '#8B5CF6',
      topics: [
        { title: 'Sentence Types & Tenses', query: 'english-grammar' },
        { title: 'Prepositions & Subject-Verb Agreement', query: 'prepositions' },
        { title: 'Vocabulary, Idioms & Phrases', query: 'vocabulary' },
      ]
    },
    {
      name: 'Regional Language Malayalam (മലയാളം)',
      marks: 10,
      color: '#F59E0B',
      topics: [
        { title: 'പദശുദ്ധി & വാക്യശുദ്ധി', query: 'malayalam-grammar' },
        { title: 'ഒറ്റപ്പദം & ശൈലികൾ', query: 'malayalam-idioms' },
        { title: 'പരിഭാഷ & പഴഞ്ചൊല്ലുകൾ', query: 'malayalam-translation' },
      ]
    }
  ];

  const handleStartTopicPractice = (topicQuery: string) => {
    onClose();
    router.push(`/quiz?topic=${encodeURIComponent(topicQuery)}&exam=${encodeURIComponent(examName)}`);
  };

  const handleStartPathway = (pathway: 'model' | 'mock' | 'pyq') => {
    onClose();
    if (pathway === 'mock') {
      router.push(`/quiz?mode=mock&exam=${encodeURIComponent(examName)}`);
    } else if (pathway === 'pyq') {
      router.push(`/previous-papers`);
    } else {
      router.push(`/quiz?mode=model&exam=${encodeURIComponent(examName)}`);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '24px',
          bgcolor: 'background.paper',
          p: { xs: 1, sm: 2 }
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '14px',
              bgcolor: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10B981'
            }}
          >
            <RocketLaunchIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>
              Choose Your Learning Pathway ({examName})
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              നിങ്ങളുടെ പരീക്ഷാ ലക്ഷ്യത്തിനനുസരിച്ച് പഠനം ആരംഭിക്കുക
            </Typography>
          </Box>
        </Stack>

        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Pathway 1: Syllabus Based */}
          <Grid item xs={12} sm={6}>
            <Card
              onClick={() => setSelectedPathway(selectedPathway === 'syllabus' ? null : 'syllabus')}
              sx={{
                cursor: 'pointer',
                borderRadius: '20px',
                border: '2px solid',
                borderColor: selectedPathway === 'syllabus' ? '#10B981' : 'divider',
                bgcolor: selectedPathway === 'syllabus' ? 'rgba(16, 185, 129, 0.06)' : 'background.paper',
                transition: 'all 0.25s ease',
                '&:hover': { borderColor: '#10B981', transform: 'translateY(-2px)' }
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.12)', color: '#10B981' }}>
                    <MenuBookIcon />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    1. Syllabus-Based Serial Study
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.825rem' }}>
                  സിലബസ് അടിസ്ഥാനമാക്കിയുള്ള ക്രമാനുഗത പഠനം. (GK, Math, English & Malayalam)
                </Typography>
                <Chip
                  label="Recommended Order"
                  size="small"
                  sx={{ mt: 1.5, bgcolor: 'rgba(16, 185, 129, 0.15)', color: '#10B981', fontWeight: 800, fontSize: '0.7rem' }}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Pathway 2: Model Questions */}
          <Grid item xs={12} sm={6}>
            <Card
              onClick={() => handleStartPathway('model')}
              sx={{
                cursor: 'pointer',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                transition: 'all 0.25s ease',
                '&:hover': { borderColor: '#3B82F6', transform: 'translateY(-2px)' }
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6' }}>
                    <QuizIcon />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    2. Model Question Drills
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.825rem' }}>
                  പരീക്ഷയ്ക്കനുയോജ്യമായ മാതൃകാ ചോദ്യശേഖരങ്ങൾ പരിശീലിക്കുക.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Pathway 3: OMR Mock Tests */}
          <Grid item xs={12} sm={6}>
            <Card
              onClick={() => handleStartPathway('mock')}
              sx={{
                cursor: 'pointer',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                transition: 'all 0.25s ease',
                '&:hover': { borderColor: '#8B5CF6', transform: 'translateY(-2px)' }
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(139, 92, 246, 0.12)', color: '#8B5CF6' }}>
                    <TimerIcon />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    3. Full 100-Mark OMR Mock Tests
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.825rem' }}>
                  75 മിനിറ്റ് 100 ചോദ്യങ്ങളുള്ള യഥാർത്ഥ മോക്ക് പരീക്ഷകൾ.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Pathway 4: Previous Papers */}
          <Grid item xs={12} sm={6}>
            <Card
              onClick={() => handleStartPathway('pyq')}
              sx={{
                cursor: 'pointer',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                transition: 'all 0.25s ease',
                '&:hover': { borderColor: '#F59E0B', transform: 'translateY(-2px)' }
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B' }}>
                    <HistoryEduIcon />
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    4. Previous Year Papers (PYQs)
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.825rem' }}>
                  കഴിഞ്ഞ വർഷത്തെ ഒഫീഷ്യൽ ചോദ്യപേപ്പറുകൾ പരിശീലിക്കുക.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Syllabus Serial Subject Breakdown (Accordion when Pathway 1 selected) */}
        {selectedPathway === 'syllabus' && (
          <Box sx={{ mt: 2, p: 2.5, borderRadius: '20px', bgcolor: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 900, mb: 1.5, color: '#10B981' }}>
              📖 Select Syllabus Subject to Start Serial Practice (വിഷയാധിഷ്ഠിത പഠനം)
            </Typography>

            <Stack spacing={1.5}>
              {syllabusSubjects.map((subj, idx) => (
                <Accordion key={idx} elevation={0} defaultExpanded={idx === 0} sx={{ borderRadius: '16px !important', border: '1px solid', borderColor: 'divider' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: subj.color }} />}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: subj.color }} />
                      <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>
                        {subj.name} ({subj.marks} Marks)
                      </Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0, pb: 2 }}>
                    <Stack spacing={1}>
                      {subj.topics.map((t, tIdx) => (
                        <Box
                          key={tIdx}
                          sx={{
                            p: 1.5,
                            borderRadius: '12px',
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            {t.title}
                          </Typography>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleStartTopicPractice(t.query)}
                            startIcon={<PlayArrowIcon />}
                            sx={{
                              bgcolor: subj.color,
                              color: '#ffffff',
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              textTransform: 'none',
                              borderRadius: '10px',
                              '&:hover': { bgcolor: subj.color, filter: 'brightness(0.9)' }
                            }}
                          >
                            പഠനം ആരംഭിക്കുക
                          </Button>
                        </Box>
                      ))}
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
