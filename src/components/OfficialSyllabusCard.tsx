'use client';

import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Grid,
  Chip,
  LinearProgress,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface SyllabusSubject {
  title: string;
  marks: number;
  color: string;
  topics: string[];
}

interface OfficialSyllabusCardProps {
  examName?: string;
}

export default function OfficialSyllabusCard({ examName = 'LGS / VFA 2026' }: OfficialSyllabusCardProps) {
  const syllabusData: SyllabusSubject[] = [
    {
      title: 'General Knowledge & Kerala Renaissance',
      marks: 50,
      color: '#10B981',
      topics: [
        'Kerala History, Freedom Struggle & Renaissance Movements',
        'Indian Geography, Rivers, Soil & Natural Resources',
        'Indian Constitution, Preamble & Fundamental Rights',
        'Human Rights Commission & Right to Information (RTI)',
        'Kerala State Governance, Revenue System & Panchayati Raj',
        'SCERT Basic Science (Physics, Chemistry & Biology)',
        'Current Affairs, National & International Events'
      ]
    },
    {
      title: 'Simple Arithmetic & Mental Ability',
      marks: 20,
      color: '#3B82F6',
      topics: [
        'Numbers & Basic Arithmetical Operations',
        'Fractions, Decimals & Percentages',
        'Profit, Loss & Simple/Compound Interest',
        'Time & Work, Time & Distance',
        'Ratio & Proportion, Average',
        'Number Series & Coding-Decoding',
        'Direction Sense & Venn Diagrams'
      ]
    },
    {
      title: 'General English',
      marks: 20,
      color: '#8B5CF6',
      topics: [
        'Types of Sentences & Correct Word Order',
        'Tenses, Subject-Verb Agreement',
        'Prepositions & Conjunctions',
        'Active & Passive Voice, Direct & Indirect Speech',
        'Vocabulary, Synonyms & Antonyms',
        'Idioms, Phrases & One Word Substitutes'
      ]
    },
    {
      title: 'Regional Language (Malayalam)',
      marks: 10,
      color: '#F59E0B',
      topics: [
        'പദശുദ്ധി (Correct Usage & Spelling)',
        'വാക്യശുദ്ധി (Sentence Correction)',
        'പരിഭാഷ (English to Malayalam Translation)',
        'ഒറ്റപ്പദം (One Word Substitution)',
        'ശൈലികൾ, പഴഞ്ചൊല്ലുകൾ (Idioms & Proverbs)',
        'സമാസവും സന്ധിയും (Malayalam Grammar & Compounds)'
      ]
    }
  ];

  return (
    <Paper
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 5,
        border: '1px solid',
        borderColor: 'divider',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #F8FAFC 100%)',
        boxShadow: '0 12px 32px rgba(0,0,0,0.05)'
      }}
    >
      {/* Header */}
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 3,
            bgcolor: 'rgba(46, 139, 87, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#2E8B57'
          }}
        >
          <MenuBookIcon />
        </Box>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>
              Official Kerala PSC Syllabus
            </Typography>
            <Chip
              label="100 Marks / 75 Mins"
              size="small"
              sx={{ bgcolor: 'rgba(46, 139, 87, 0.12)', color: '#2E8B57', fontWeight: 800, fontSize: '0.7rem' }}
            />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            Official examination pattern for {examName} (OMR Objective Mode)
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Visual Weightage Bar */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Mark Weightage Distribution
        </Typography>
        <Grid container spacing={1}>
          {syllabusData.map((item, idx) => (
            <Grid item xs={idx === 0 ? 6 : idx === 1 ? 3 : idx === 2 ? 2.4 : 0.6} key={idx}>
              <Box
                sx={{
                  bgcolor: item.color,
                  height: 10,
                  borderRadius: 2,
                  opacity: 0.95
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Subject Accordions */}
      <Stack spacing={1.5}>
        {syllabusData.map((subject, idx) => (
          <Accordion
            key={idx}
            elevation={0}
            defaultExpanded={idx === 0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '16px !important',
              '&:before': { display: 'none' },
              bgcolor: 'background.paper'
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: subject.color }} />}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 1 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: subject.color }} />
                  <Typography sx={{ fontWeight: 800, fontSize: '0.95rem' }}>
                    {subject.title}
                  </Typography>
                </Stack>
                <Chip
                  label={`${subject.marks} Marks`}
                  size="small"
                  sx={{
                    bgcolor: `${subject.color}15`,
                    color: subject.color,
                    fontWeight: 900,
                    fontSize: '0.75rem'
                  }}
                />
              </Box>
            </AccordionSummary>

            <AccordionDetails sx={{ pt: 0, pb: 2, px: 3 }}>
              <Grid container spacing={1}>
                {subject.topics.map((topic, topicIdx) => (
                  <Grid item xs={12} sm={6} key={topicIdx}>
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <CheckCircleOutlineIcon sx={{ fontSize: 16, color: subject.color, mt: 0.3 }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                        {topic}
                      </Typography>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    </Paper>
  );
}
