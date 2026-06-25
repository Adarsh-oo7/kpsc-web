'use client';

import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Paper,
  Stack,
  LinearProgress,
  IconButton,
  Collapse
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const LDC_DETAILED_WEIGHTS = [
  { topic: "Kerala History — Ancient Period", weight: 1.2 },
  { topic: "Kerala History — Medieval Period", weight: 1.2 },
  { topic: "Kerala History — Modern Period & Independence", weight: 1.9 },
  { topic: "Kerala Renaissance Movements", weight: 1.4 },
  { topic: "Social Reform Leaders of Kerala", weight: 1.7 },
  { topic: "Prominent Personalities of Kerala", weight: 1.2 },
  { topic: "Kerala Arts & Classical Forms", weight: 0.9 },
  { topic: "Kerala Literature", weight: 0.9 },
  { topic: "Kerala Geography", weight: 1.2 },
  { topic: "Kerala Economy", weight: 0.9 },
  { topic: "Kerala Government & Governance", weight: 0.9 },
  { topic: "Kerala Awards & Honours", weight: 0.7 },
  { topic: "Kerala Tribal Communities", weight: 0.7 },
  { topic: "Famous Temples, Churches & Mosques of Kerala", weight: 0.7 },
  { topic: "Rivers & Water Bodies of Kerala", weight: 0.9 },
  { topic: "Wildlife Sanctuaries & National Parks — Kerala", weight: 0.7 },
  { topic: "Festivals of Kerala", weight: 0.7 },
  { topic: "Languages of Kerala — Malayalam", weight: 0.9 },
  { topic: "Ancient India — Indus Valley & Vedic Period", weight: 0.7 },
  { topic: "Ancient India — Maurya & Gupta Empire", weight: 0.7 },
  { topic: "Medieval India — Delhi Sultanate", weight: 0.7 },
  { topic: "Medieval India — Mughal Empire", weight: 0.9 },
  { topic: "India Freedom Movement — Phase 1 (1857–1919)", weight: 1.2 },
  { topic: "India Freedom Movement — Gandhi & Non-Cooperation", weight: 1.4 },
  { topic: "India Freedom Movement — 1920–1947", weight: 1.4 },
  { topic: "Indian National Leaders & Revolutionaries", weight: 1.2 },
  { topic: "Important Dates in Indian History", weight: 0.9 },
  { topic: "Physical Geography of India", weight: 0.9 },
  { topic: "Rivers of India", weight: 0.9 },
  { topic: "Mountain Ranges & Passes of India", weight: 0.7 },
  { topic: "Climate & Monsoon of India", weight: 0.7 },
  { topic: "Agriculture in India", weight: 0.7 },
  { topic: "Minerals & Natural Resources — India", weight: 0.7 },
  { topic: "National Parks & Biosphere Reserves — India", weight: 0.7 },
  { topic: "Indian States — Capitals & Formation", weight: 0.9 },
  { topic: "Constitution of India — Preamble & Fundamental Rights", weight: 1.2 },
  { topic: "Constitution of India — DPSP & Duties", weight: 0.7 },
  { topic: "Parliament of India — Lok Sabha & Rajya Sabha", weight: 1.2 },
  { topic: "President, PM & Council of Ministers", weight: 0.9 },
  { topic: "Supreme Court & Judiciary", weight: 0.9 },
  { topic: "State Government — Governor, CM, Legislature", weight: 0.9 },
  { topic: "Local Self Government — Panchayat Raj", weight: 0.9 },
  { topic: "Election Commission & Electoral Process", weight: 0.7 },
  { topic: "Fundamental Duties & Constitutional Amendments", weight: 0.7 },
  { topic: "Emergency Provisions", weight: 0.7 },
  { topic: "Constitutional Bodies (CAG, UPSC, Finance Commission)", weight: 0.7 },
  { topic: "RTI Act, Consumer Protection, Legal Rights", weight: 0.7 },
  { topic: "Welfare Schemes — Central Government", weight: 0.9 },
  { topic: "Welfare Schemes — Kerala Government", weight: 0.9 },
  { topic: "Biology — Human Body", weight: 0.9 },
  { topic: "Biology — Plant Kingdom", weight: 0.7 },
  { topic: "Biology — Animals & Classification", weight: 0.7 },
  { topic: "Biology — Diseases & Pathogens", weight: 0.9 },
  { topic: "Biology — Nutrition, Vitamins & Deficiencies", weight: 0.9 },
  { topic: "Physics — Motion, Force & Laws", weight: 0.7 },
  { topic: "Physics — Light, Sound & Optics", weight: 0.7 },
  { topic: "Physics — Electricity & Magnetism", weight: 0.7 },
  { topic: "Chemistry — Elements & Periodic Table", weight: 0.7 },
  { topic: "Chemistry — Acids, Bases & Salts", weight: 0.7 },
  { topic: "Chemistry — Common Chemical Compounds", weight: 0.7 },
  { topic: "Environmental Science", weight: 0.9 },
  { topic: "Inventions & Discoveries", weight: 0.7 },
  { topic: "Human Diseases — Communicable & Non-Communicable", weight: 0.9 },
  { topic: "Computer Fundamentals", weight: 0.9 },
  { topic: "Internet, Email & Web Basics", weight: 0.7 },
  { topic: "MS Office & Common Software", weight: 0.7 },
  { topic: "Cybersecurity & IT Act", weight: 0.7 },
  { topic: "Space Technology — ISRO & Missions", weight: 0.7 },
  { topic: "Emerging Technologies (AI, IoT, Blockchain basics)", weight: 0.5 },
  { topic: "Indian Economy — Basics & GDP", weight: 0.9 },
  { topic: "Indian Economy — Banking & RBI", weight: 0.9 },
  { topic: "Indian Economy — Taxation & Budget", weight: 0.7 },
  { topic: "Five Year Plans & NITI Aayog", weight: 0.7 },
  { topic: "International Trade & WTO", weight: 0.5 },
  { topic: "Poverty, Unemployment & Social Indicators", weight: 0.7 },
  { topic: "Current Affairs — Kerala (Monthly)", weight: 2.4 },
  { topic: "Current Affairs — India (Monthly)", weight: 1.9 },
  { topic: "Current Affairs — International (Monthly)", weight: 1.2 },
  { topic: "Awards — National & International", weight: 0.7 },
  { topic: "Sports & Games — National", weight: 0.7 },
  { topic: "Sports & Games — International", weight: 0.7 },
  { topic: "Books & Authors", weight: 0.5 },
  { topic: "Persons in News", weight: 0.7 },
  { topic: "Important Days & Observances", weight: 0.7 },
  { topic: "Number System & HCF/LCM", weight: 0.9 },
  { topic: "Simplification & BODMAS", weight: 0.9 },
  { topic: "Fractions & Decimals", weight: 0.9 },
  { topic: "Ratio & Proportion", weight: 0.7 },
  { topic: "Time & Work", weight: 0.7 },
  { topic: "Time, Speed & Distance", weight: 0.7 },
  { topic: "Profit & Loss", weight: 0.7 },
  { topic: "Simple & Compound Interest", weight: 0.7 },
  { topic: "Averages & Mixtures", weight: 0.7 },
  { topic: "Algebra", weight: 0.7 },
  { topic: "Geometry — Lines, Angles, Triangles", weight: 0.7 },
  { topic: "Mensuration", weight: 0.7 },
  { topic: "Data Interpretation — Tables & Graphs", weight: 0.7 },
  { topic: "Logical Reasoning", weight: 1.2 },
  { topic: "Mental Ability & Analogy", weight: 1.2 },
  { topic: "English Grammar — Parts of Speech", weight: 0.7 },
  { topic: "English Grammar — Tenses", weight: 0.7 },
  { topic: "English — Active & Passive Voice", weight: 0.5 },
  { topic: "English — Direct & Indirect Speech", weight: 0.5 },
  { topic: "English — Synonyms & Antonyms", weight: 0.9 },
  { topic: "English — One Word Substitution", weight: 0.7 },
  { topic: "English — Idioms & Phrases", weight: 0.7 },
  { topic: "English — Reading Comprehension", weight: 0.7 },
  { topic: "English — Spelling & Vocabulary", weight: 0.5 },
  { topic: "World Map & Continents", weight: 0.7 },
  { topic: "Important Countries — Capitals & Currencies", weight: 0.7 },
  { topic: "World Rivers & Mountains", weight: 0.5 },
  { topic: "Climate Zones & Natural Phenomena", weight: 0.5 },
  { topic: "International Organizations", weight: 0.7 },
  { topic: "World History — Revolutions (French, American, Russian)", weight: 0.7 },
  { topic: "World Wars I & II", weight: 0.7 },
  { topic: "Cold War & Post-Cold War", weight: 0.5 },
  { topic: "Famous World Leaders", weight: 0.5 }
];

export default function DetailedSyllabusSearch() {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  const filteredWeights = useMemo(() => {
    if (!search.trim()) return LDC_DETAILED_WEIGHTS;
    const term = search.toLowerCase();
    return LDC_DETAILED_WEIGHTS.filter(item => 
      item.topic.toLowerCase().includes(term)
    );
  }, [search]);

  return (
    <Box sx={{ mt: 3 }}>
      <Paper 
        sx={{ 
          p: 3, 
          border: '1px solid', 
          borderColor: 'divider', 
          borderRadius: 4,
          background: (theme) => theme.palette.mode === 'dark' 
            ? 'rgba(22, 27, 34, 0.4)' 
            : 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900 }}>
              Detailed Topic-Wise Weightage (KPSC Official)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Showing {filteredWeights.length} of {LDC_DETAILED_WEIGHTS.length} syllabus topics
            </Typography>
          </Box>
          <IconButton onClick={() => setIsOpen(!isOpen)} size="small" sx={{ color: 'text.secondary' }}>
            {isOpen ? <Typography sx={{ fontSize: '1.1rem' }}>▲</Typography> : <Typography sx={{ fontSize: '1.1rem' }}>▼</Typography>}
          </IconButton>
        </Stack>

        <Collapse in={isOpen}>
          <Stack spacing={2}>
            <TextField
              size="small"
              placeholder="Search topic (e.g. History, Biology, English)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: search && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch('')}>
                      <ClearIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { 
                  borderRadius: 3,
                  bgcolor: (theme) => theme.palette.mode === 'dark' 
                    ? 'rgba(0,0,0,0.2)' 
                    : 'rgba(255,255,255,0.8)' 
                }
              }}
            />

            <Box 
              sx={{ 
                maxHeight: 320, 
                overflowY: 'auto',
                pr: 1,
                '&::-webkit-scrollbar': {
                  width: 6,
                },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: 'divider',
                  borderRadius: 3,
                }
              }}
            >
              <Stack spacing={2}>
                {filteredWeights.length > 0 ? (
                  filteredWeights.map((item, idx) => (
                    <Box key={idx}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 550, color: 'text.primary', fontSize: '0.85rem' }}>
                          {item.topic}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 700, 
                            color: '#1B6B3A', 
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '0.8rem' 
                          }}
                        >
                          {item.weight}%
                        </Typography>
                      </Stack>
                      <LinearProgress 
                        variant="determinate" 
                        value={item.weight * 30} // Scale visual representation slightly for readability
                        sx={{ 
                          height: 4, 
                          borderRadius: 2,
                          bgcolor: 'rgba(0,0,0,0.04)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 2,
                            background: 'linear-gradient(90deg, #1B6B3A, #2E8B57)'
                          }
                        }} 
                      />
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 4, fontStyle: 'italic' }}>
                    No matching topics found
                  </Typography>
                )}
              </Stack>
            </Box>
          </Stack>
        </Collapse>
      </Paper>
    </Box>
  );
}
