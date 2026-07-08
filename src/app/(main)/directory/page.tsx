'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Tabs,
  Tab,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MapIcon from '@mui/icons-material/Map';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const LOCATIONS: Record<string, string> = {
  attingal: 'Attingal',
  thiruvananthapuram: 'Thiruvananthapuram',
  varkala: 'Varkala',
  kilimanoor: 'Kilimanoor',
  chirayinkeezhu: 'Chirayinkeezhu',
  kazhakkoottam: 'Kazhakkoottam',
  nedumangad: 'Nedumangad',
  neyyattinkara: 'Neyyattinkara',
  kollam: 'Kollam',
  pathanamthitta: 'Pathanamthitta',
  ernakulam: 'Ernakulam',
  thrissur: 'Thrissur',
  kozhikode: 'Kozhikode',
  malappuram: 'Malappuram',
  palakkad: 'Palakkad',
  kerala: 'Kerala',
};

const EXAMS: Record<string, string> = {
  'ldc': 'LDC',
  'lgs': 'LGS',
  'degree-level': 'Degree Level',
  'veo': 'VEO',
  'ld-typist': 'LD Typist',
  'secretariat-assistant': 'Secretariat Assistant',
  'police-constable': 'Police Constable',
  'fire-and-rescue': 'Fire & Rescue Officer',
  'lp-teacher': 'LP Teacher',
  'up-teacher': 'UP Teacher',
  'clerk': 'Clerk',
  'company-board': 'Company Board Assistant',
  'water-authority': 'Water Authority',
  'university-assistant': 'University Assistant',
  'assistant-prison-officer': 'Assistant Prison Officer',
  'excise-officer': 'Excise Officer',
  'civil-excise-officer': 'Civil Excise Officer',
  'assistant-junior-assistant': 'Assistant / Junior Assistant',
  'village-field-assistant': 'Village Field Assistant',
  'panchayat-secretary': 'Panchayat Secretary',
  'general-psc': 'General PSC',
};

export default function DirectoryPage() {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Title */}
      <Box sx={{ mb: 5, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            fontFamily: "'Cabinet Grotesk', sans-serif",
            fontWeight: 900,
            mb: 1.5,
            color: 'text.primary',
            letterSpacing: '-0.02em',
          }}
        >
          KPSC Master{' '}
          <Box component="span" sx={{ color: '#2E8B57' }}>
            Resource Directory
          </Box>
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: '600px', mx: 'auto' }}>
          Explore our structured online coaching resources, daily quizzes, and exam-specific mock tests organized by district, location, and syllabus focus across Kerala.
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={(e, val) => setTabValue(val)}
          aria-label="directory tabs"
          textColor="primary"
          indicatorColor="primary"
          centered
          sx={{
            '& .MuiTab-root': { fontWeight: 700, textTransform: 'none', fontSize: '1rem' },
          }}
        >
          <Tab icon={<MapIcon sx={{ mr: 1 }} />} iconPosition="start" label="Browse by Location" />
          <Tab icon={<MenuBookIcon sx={{ mr: 1 }} />} iconPosition="start" label="Browse by Exam & Location" />
        </Tabs>
      </Box>

      {/* Tab 0: Location List */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          {Object.entries(LOCATIONS).map(([key, name]) => (
            <Grid item xs={12} sm={6} md={4} key={key}>
              <Card sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: '18px', height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, color: 'text.primary' }}>
                    {name}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Link href={`/kerala-psc-mock-test-${key}`} passHref style={{ textDecoration: 'none' }}>
                      <Chip
                        label="Free Mock Tests"
                        clickable
                        sx={{ width: '100%', justifyContent: 'flex-start', bgcolor: 'rgba(46, 139, 87, 0.08)', color: '#2E8B57', fontWeight: 600 }}
                      />
                    </Link>
                    <Link href={`/psc-coaching-${key}`} passHref style={{ textDecoration: 'none' }}>
                      <Chip
                        label="Best Coaching Classes"
                        clickable
                        sx={{ width: '100%', justifyContent: 'flex-start', bgcolor: 'rgba(37, 99, 235, 0.08)', color: '#2563EB', fontWeight: 600 }}
                      />
                    </Link>
                    <Link href={`/psc-online-coaching-${key}`} passHref style={{ textDecoration: 'none' }}>
                      <Chip
                        label="Online Prep Program"
                        clickable
                        sx={{ width: '100%', justifyContent: 'flex-start', bgcolor: 'rgba(124, 58, 237, 0.08)', color: '#7C3AED', fontWeight: 600 }}
                      />
                    </Link>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Tab 1: Exam List (Accordions by Exam) */}
      {tabValue === 1 && (
        <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
          {Object.entries(EXAMS).map(([examKey, examName]) => (
            <Accordion
              key={examKey}
              sx={{
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '12px !important',
                mb: 2,
                '&::before': { display: 'none' },
                boxShadow: 'none',
                overflow: 'hidden',
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 3, py: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <SchoolIcon sx={{ color: '#2E8B57' }} />
                  <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: '1.05rem' }}>
                    {examName} Mock Tests & Coaching
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 3, pb: 3, pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  Select your town or district to access localized classes, streak trackers, and mock exams for {examName}:
                </Typography>
                <Grid container spacing={1.5}>
                  {Object.entries(LOCATIONS).map(([locKey, locName]) => (
                    <Grid item xs={6} sm={4} key={locKey}>
                      <Link href={`/kerala-psc-${examKey}-${locKey}`} passHref style={{ textDecoration: 'none' }}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 1.5,
                            textAlign: 'center',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            '&:hover': {
                              borderColor: '#2E8B57',
                              bgcolor: 'rgba(46, 139, 87, 0.04)',
                            },
                          }}
                        >
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {locName}
                          </Typography>
                        </Paper>
                      </Link>
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Container>
  );
}
