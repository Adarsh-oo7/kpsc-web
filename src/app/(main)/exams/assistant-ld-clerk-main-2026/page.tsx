import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Box, Button, Chip, Container, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from '@mui/material';

export const metadata: Metadata = {
  title: 'Assistant, LD Clerk and Junior Assistant Main Exam 5 Dec 2026 | Kerala PSC',
  description:
    'Syllabus and practice for the 5 December 2026 common main exam: Assistant Grade II, LD Clerk, Junior Assistant and related posts. Category 383/2025, 463/2025 and 573/2025. 100 marks, 90 minutes.',
  alternates: { canonical: 'https://www.kpscmaster.in/exams/assistant-ld-clerk-main-2026' },
  openGraph: {
    title: 'Assistant, LD Clerk and Junior Assistant Main Exam | 5 December 2026',
    description:
      'One common Kerala PSC main exam on 5 December 2026. Current affairs 15 marks, Kerala administration 10 marks, English and Malayalam 10 each.',
    url: 'https://www.kpscmaster.in/exams/assistant-ld-clerk-main-2026',
  },
};

const SECTIONS = [
  ['Daily Current Affairs', 'daily-current-affairs', 15],
  ['Kerala Governance and Administration', 'kerala-governance-and-administration', 10],
  ['English', 'english', 10],
  ['Malayalam', 'malayalam', 10],
  ['Biology and Public Health', 'biology-and-public-health', 6],
  ['History', 'history', 5],
  ['Geography', 'geography', 5],
  ['Economics', 'economics', 5],
  ['Constitution and Polity', 'constitution-and-polity', 5],
  ['Arts, Sports, Literature and Culture', 'arts-culture-literature-sports', 5],
  ['Important Acts', 'important-laws', 5],
  ['Simple Arithmetic', 'maths', 5],
  ['Mental Ability and Reasoning', 'mental-ability-and-reasoning', 5],
  ['Physics', 'physics', 3],
  ['Chemistry', 'chemistry', 3],
  ['Basics of Computer', 'computer', 3],
] as const;

export default function AssistantClerkMainPage() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem', mb: 1.5 }}>
        <Link href="/exams" style={{ color: 'inherit' }}>Exams</Link>
        {' · '}5 December 2026
      </Typography>
      <Typography variant="h1" sx={{ fontWeight: 800, fontSize: { xs: '1.8rem', md: '2.4rem' }, lineHeight: 1.15, mb: 1.5 }}>
        Assistant, LD Clerk and Junior Assistant
      </Typography>
      <Typography sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 2 }}>
        Saturday 5 December 2026, 10.30 am to 12.20 pm. One common main exam for Category 383/2025, 463/2025 and 573/2025. The largest list has 62,918 candidates. 100 marks, 90 minutes, one-third mark deducted for a wrong answer.
      </Typography>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mb: 2.5 }}>
        <Chip label="5 December 2026" sx={{ fontWeight: 800 }} />
        <Chip label="100 marks" sx={{ fontWeight: 800 }} />
        <Chip label="90 minutes" sx={{ fontWeight: 800 }} />
        <Chip label="OMR" sx={{ fontWeight: 800 }} />
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 3 }}>
        <Button
          href="/topics?exam=assistant-ld-clerk-main-2026"
          variant="contained"
          sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '12px' }}
        >
          Open the syllabus
        </Button>
        <Button
          href="/quiz?section=daily-current-affairs&exam=assistant-ld-clerk-main-2026&limit=15"
          variant="outlined"
          sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '12px' }}
        >
          Practise current affairs
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
                  <Link href={`/quiz?section=${key}&exam=assistant-ld-clerk-main-2026&limit=15`}>15 questions</Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Box sx={{ mt: 3 }}>
        <Typography sx={{ fontWeight: 800, mb: 1 }}>How to use this page</Typography>
        <Typography sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
          Start with current affairs, then Kerala administration. Each practice set shows the correct option and the reason. A wrong answer is kept and asked again. English and Malayalam are 10 marks each, so they come after those two parts.
        </Typography>
      </Box>
    </Container>
  );
}
