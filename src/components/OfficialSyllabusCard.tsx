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
  color?: string;
  topics?: Array<string | { name?: string }>;
}

interface OfficialSyllabusCardProps {
  examName?: string;
  officialSyllabus?: {
    total_marks?: number;
    subjects?: SyllabusSubject[];
  };
  questionPattern?: {
    mode?: string;
    total_questions?: number;
    total_marks?: number;
    duration_minutes?: number;
    marking_scheme?: string;
  };
}

export default function OfficialSyllabusCard({
  examName = 'LGS / VFA 2026',
  officialSyllabus,
  questionPattern
}: OfficialSyllabusCardProps) {
  const fallbackSyllabusData: SyllabusSubject[] = [
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

  const palette = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#0EA5E9', '#1B6B3A'];
  const rawSubjects = officialSyllabus?.subjects?.length ? officialSyllabus.subjects : fallbackSyllabusData;
  const syllabusData = rawSubjects.map((subject, idx) => {
    const topicLabels = (Array.isArray(subject.topics) ? subject.topics : [])
      .map((topic) => (typeof topic === 'string' ? topic : topic?.name || ''))
      .filter(Boolean);
    return {
      title: subject.title || 'Syllabus section',
      marks: Number(subject.marks) || 0,
      color: subject.color || palette[idx % palette.length],
      topics: topicLabels.length ? topicLabels : [subject.title || 'Syllabus section'],
    };
  });
  const totalMarks = officialSyllabus?.total_marks || syllabusData.reduce((sum, subject) => sum + subject.marks, 0) || 100;
  const durationMins = questionPattern?.duration_minutes || 75;
  const modeText = questionPattern?.mode || questionPattern?.marking_scheme || 'OMR Objective Type';

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
              label={`${totalMarks} Marks / ${durationMins} Mins`}
              size="small"
              sx={{ bgcolor: 'rgba(46, 139, 87, 0.12)', color: '#2E8B57', fontWeight: 800, fontSize: '0.7rem' }}
            />
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            {modeText} · {examName}
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Visual Weightage Bar */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'text.secondary', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Mark Weightage Distribution
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, width: '100%' }}>
          {syllabusData.map((item, idx) => (
            <Box
              key={idx}
              sx={{
                flex: Math.max(item.marks, 1),
                bgcolor: item.color,
                height: 10,
                borderRadius: 2,
                opacity: 0.95,
              }}
            />
          ))}
        </Box>
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
            <AccordionSummary component="div" expandIcon={<ExpandMoreIcon sx={{ color: subject.color }} />}>
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
