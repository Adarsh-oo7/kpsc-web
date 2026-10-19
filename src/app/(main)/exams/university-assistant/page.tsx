import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Box, Button, Chip, Container, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from '@mui/material';

export const metadata: Metadata = {
  title: 'University Assistant Practice | Kerala PSC Degree Level Syllabus',
  description:
    'University Assistant syllabus and practice. Degree-level paper: Maths and English 20 marks each, History, Constitution and Malayalam 10 each. The exam students on KPSC Master select after the December clerk paper.',
  alternates: { canonical: 'https://www.kpscmaster.in/exams/university-assistant' },
  openGraph: {
    title: 'University Assistant Practice | Kerala PSC',
    description: 'Degree-level University Assistant syllabus. Maths 20, English 20, History 10, Constitution 10, Malayalam 10.',
    url: 'https://www.kpscmaster.in/exams/university-assistant',
  },
};

const SECTIONS = [
  ['Maths', 'maths', 20],
  ['English', 'english', 20],
  ['History', 'history', 10],
  ['Constitution and Polity', 'constitution-and-polity', 10],
  ['Arts, Culture, Literature and Sports', 'arts-culture-literature-sports', 10],
  ['Malayalam', 'malayalam', 10],
  ['Geography', 'geography', 5],
  ['Economics', 'economics', 5],
  ['Computer', 'computer', 5],
  ['Science', 'science', 5],
] as const;

export default function UniversityAssistantPage() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', mb: 1.5 }}>
        <Link href="/exams" style={{ color: 'inherit' }}>Exams</Link>
        {' · '}Degree level
      </Typography>
      <Typography variant="h1" sx={{ fontWeight: 800, fontSize: { xs: '1.8rem', md: '2.4rem' }, lineHeight: 1.15, mb: 1.5 }}>
        University Assistant
      </Typography>
      <Typography sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 2 }}>
        This is the exam students on KPSC Master have selected most often after the big clerk recruitment. It is a degree-level paper of 100 marks in 75 minutes, with one-third mark deducted for a wrong answer. Maths and English carry 20 marks each.
      </Typography>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2.5 }}>
        <Chip label="Degree level" sx={{ fontWeight: 800 }} />
        <Chip label="100 marks" sx={{ fontWeight: 800 }} />
        <Chip label="75 minutes" sx={{ fontWeight: 800 }} />
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 3 }}>
        <Button
          href="/topics?exam=university-assistant"
          variant="contained"
          sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '12px' }}
        >
          Open the syllabus
        </Button>
        <Button
          href="/quiz?section=maths&exam=university-assistant&limit=15"
          variant="outlined"
          sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '12px' }}
        >
          Practise Maths
        </Button>
      </Stack>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '16px', overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>Subject</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800 }}>Marks</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800 }}>Practice</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {SECTIONS.map(([title, key, marks]) => (
              <TableRow key={key}>
                <TableCell>{title}</TableCell>
                <TableCell align="right">{marks}</TableCell>
                <TableCell align="right">
                  <Link href={`/quiz?section=${key}&exam=university-assistant&limit=15`}>15 questions</Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Box sx={{ mt: 3 }}>
        <Typography sx={{ fontWeight: 800, mb: 1 }}>How to use this page</Typography>
        <Typography sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
          Start with Maths, then English. Read the correct option and the reason after each answer. The 5 December clerk paper is a different exam. Use that page if your admission ticket is for Category 383/2025, 463/2025 or 573/2025.
        </Typography>
        <Button
          href="/exams/assistant-ld-clerk-main-2026"
          sx={{ mt: 1.5, textTransform: 'none', fontWeight: 800 }}
        >
          Open the 5 December exam
        </Button>
      </Box>
    </Container>
  );
}
