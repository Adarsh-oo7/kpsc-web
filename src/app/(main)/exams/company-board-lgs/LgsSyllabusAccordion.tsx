// app/(main)/exams/company-board-lgs/LgsSyllabusAccordion.tsx
'use client';

import React, { useState } from 'react';
import { Paper, Accordion, AccordionSummary, AccordionDetails, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const SYLLABUS_SECTIONS = [
  {
    title: 'General Knowledge & Science (50 Marks)',
    topics: [
      'Kerala Facts: Renaissance leaders, social reformers, geography, and rivers',
      'Indian History & Geography: Freedom struggle, constitution, states, physical features',
      'General Science: Human body, diseases, nutrition, physics/chemistry basic laws',
      'Current Affairs: National, international, and state-level achievements'
    ]
  },
  {
    title: 'Simple Arithmetic & Mental Ability (20 Marks)',
    topics: [
      'Number Systems: Fractions, decimals, LCM, and HCF',
      'Arithmetic Operations: Percentage, ratio & proportion, average, profit & loss',
      'Time & Distance: Work & time, distance & speed calculations',
      'Mental Ability: Coding/decoding, series completion, logical puzzles'
    ]
  },
  {
    title: 'General English (20 Marks)',
    topics: [
      'Grammar: Subject-verb agreement, tenses, active/passive voice, direct/indirect speech',
      'Vocabulary: Synonyms, antonyms, idioms, phrases, and single-word substitutions',
      'Usage: Common errors in sentences, prepositions, and conjunctions'
    ]
  },
  {
    title: 'Regional Language Malayalam (10 Marks)',
    topics: [
      'Translation: English words to Malayalam',
      'Synonyms & Antonyms (പര്യായപദം / വിപരീത പദം)',
      'Idioms & Proverbs (ശൈലികൾ / പഴഞ്ചൊല്ലുകൾ)',
      'Sentence Correction: Grammatical editing of Malayalam sentences'
    ]
  }
];

export default function LgsSyllabusAccordion() {
  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Paper sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 4, overflow: 'hidden' }}>
      {SYLLABUS_SECTIONS.map((section, idx) => {
        const panelId = `panel${idx}`;
        return (
          <Accordion
            key={idx}
            expanded={expanded === panelId}
            onChange={handleChange(panelId)}
            disableGutters
            elevation={0}
            sx={{
              borderBottom: idx !== SYLLABUS_SECTIONS.length - 1 ? '1px solid' : 'none',
              borderColor: 'divider',
              background: 'transparent',
              '&:before': { display: 'none' }
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                px: 3,
                py: 1,
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              <Typography sx={{ fontWeight: 750, color: 'text.primary' }}>
                {section.title}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 4, pb: 3, pt: 1, bgcolor: 'action.hover' }}>
              <List size="small" disablePadding>
                {section.topics.map((topic, tIdx) => (
                  <ListItem key={tIdx} disableGutters sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#10B981' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={topic}
                      primaryTypographyProps={{ variant: 'body2', color: 'text.secondary', fontWeight: 500 }}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Paper>
  );
}
