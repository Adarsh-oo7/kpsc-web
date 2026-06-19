// app/(main)/blog/[slug]/page.tsx

import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Container, Box, Typography, Button, Chip, Stack, Card, Divider } from '@mui/material';
import { blogPosts } from '@/lib/blogPosts';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Custom rich content for each article based on slug
const blogContents: Record<string, React.ReactNode> = {
  'how-to-crack-kerala-psc-ldc': (
    <Box sx={{ color: 'text.primary', '& p': { mb: 3, lineHeight: 1.7, fontSize: '1.025rem' } }}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 800, mb: 2, fontFamily: "'Cabinet Grotesk'" }}>
        Why 6 Months is the Sweet Spot
      </Typography>
      <p>
        The Kerala Public Service Commission (KPSC) Lower Division Clerk (LDC) exam is one of the most competitive tests in the state. With lakhs of candidates applying, the difference between qualifying for the main list and falling out is often just 2 or 3 marks.
      </p>
      <p>
        A 6-month duration gives you sufficient runway to digest the vast syllabus without experiencing study burnout. Let’s break down the ideal schedule.
      </p>

      <Typography variant="h5" component="h2" sx={{ fontWeight: 800, mt: 4, mb: 2, fontFamily: "'Cabinet Grotesk'" }}>
        Phase 1: Months 1 & 2 — Foundation & Concepts
      </Typography>
      <p>
        During these two months, focus entirely on building core concepts. Do not worry about solving questions under time constraints yet.
      </p>
      <ul>
        <li><strong>Simple Arithmetic:</strong> Clear your basics in percentage, ratio, averages, and time-and-work. Solve state school SCERT textbook problems (Class 5 to 10).</li>
        <li><strong>Kerala Renaissance Reformers:</strong> Dedicate 1 hour daily to the lives and contributions of reformers like Sree Narayana Guru, Chattampi Swamikal, Ayyankali, and others.</li>
        <li><strong>English Grammar:</strong> Master tense forms, active/passive voice, direct/indirect speech, and prepositions.</li>
      </ul>

      <Typography variant="h5" component="h2" sx={{ fontWeight: 800, mt: 4, mb: 2, fontFamily: "'Cabinet Grotesk'" }}>
        Phase 2: Months 3 & 4 — Subject-Wise Depth & Daily Quizzes
      </Typography>
      <p>
        Now start diving deeper into specific subjects like Indian Constitution, General Science, and Malayalam grammar. This is where active recall becomes crucial.
      </p>
      <p>
        Use the <strong>KPSC Master Daily Quiz</strong> feature. Attempting 10 questions daily keeps your brain wired to look for patterns and retrieve information under mild pressure.
      </p>

      <Typography variant="h5" component="h2" sx={{ fontWeight: 800, mt: 4, mb: 2, fontFamily: "'Cabinet Grotesk'" }}>
        Phase 3: Months 5 & 6 — Full Mock Papers & Weakness Profiles
      </Typography>
      <p>
        The final stretch is about simulation. Dedicate your weekends to complete, timed, 100-mark mock exams. Review every single wrong answer immediately.
      </p>
      <blockquote>
        "An untested study plan is just a list of wishes. Mock tests tell you the brutal truth about your preparation."
      </blockquote>
    </Box>
  ),
  'kerala-psc-degree-level-syllabus-guide': (
    <Box sx={{ color: 'text.primary', '& p': { mb: 3, lineHeight: 1.7, fontSize: '1.025rem' } }}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 800, mb: 2, fontFamily: "'Cabinet Grotesk'" }}>
        Understanding the Two-Stage System
      </Typography>
      <p>
        Degree level exams (such as Secretariat Assistant, Sub Inspector, and Block Development Officer) are conducted in a two-stage filter: the Preliminary exam and the Main exam. Understanding the weightage of each section is the key to passing the prelims efficiently.
      </p>

      <Typography variant="h5" component="h2" sx={{ fontWeight: 800, mt: 4, mb: 2, fontFamily: "'Cabinet Grotesk'" }}>
        Syllabus Weightage Analysis
      </Typography>
      <p>
        The degree level prelims syllabus is typically structured as follows:
      </p>
      <ul>
        <li><strong>History & Geography (20 Marks):</strong> Focuses heavily on the Indian National Movement, Kerala History post-renaissance, and physical geography of India and Kerala.</li>
        <li><strong>Indian Constitution & Civics (15 Marks):</strong> Preamble, Fundamental Rights, Directive Principles, Amendment procedures, and constitutional bodies.</li>
        <li><strong>Simple Arithmetic & Mental Ability (20 Marks):</strong> Slightly higher difficulty than LDC, including permutations, probability, and advanced spatial puzzles.</li>
        <li><strong>Bilingual Literacy (20 Marks):</strong> 10 marks for English usage (idioms, corrections, syntax) and 10 marks for Malayalam/regional language usage.</li>
        <li><strong>Current Affairs & General Science (25 Marks):</strong> High focus on technological advancements, awards, sports, and state government schemes.</li>
      </ul>

      <Typography variant="h5" component="h2" sx={{ fontWeight: 800, mt: 4, mb: 2, fontFamily: "'Cabinet Grotesk'" }}>
        High-Yield Chapters to Study First
      </Typography>
      <p>
        If you are short on time, prioritize these chapters as they historically account for over 45% of the total questions:
      </p>
      <ol>
        <li>Indian Constitution: Articles 12 to 51A.</li>
        <li>Geography: Rivers and mountain ranges of Kerala & India.</li>
        <li>Mental Ability: Coding-decoding, relationships, and calendars.</li>
        <li>Bilingual: Active/passive voice conversions and Malayalam spelling corrections (Shudha Roopam).</li>
      </ol>
    </Box>
  ),
  'mastering-kerala-history-renaissance': (
    <Box sx={{ color: 'text.primary', '& p': { mb: 3, lineHeight: 1.7, fontSize: '1.025rem' } }}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 800, mb: 2, fontFamily: "'Cabinet Grotesk'" }}>
        Core Reformers and Their Lifeworks
      </Typography>
      <p>
        Kerala Renaissance is one of the most scoring sub-topics in KPSC exams, yet many students lose marks here due to confusion between similar publications or quotes. Let’s organize the core facts systematically.
      </p>

      <Typography variant="h5" component="h2" sx={{ fontWeight: 800, mt: 4, mb: 2, fontFamily: "'Cabinet Grotesk'" }}>
        1. Sree Narayana Guru (1856 - 1928)
      </Typography>
      <p>
        Born at Chempazhanthy, Guru was the foremost social reformer of Kerala. Key facts to memorize:
      </p>
      <ul>
        <li><strong>Aruvippuram Consecration:</strong> 1888 (first major challenge to caste supremacy).</li>
        <li><strong>Famous Quote:</strong> "One Caste, One Religion, One God for Man" (Oru Jathi, Oru Matham, Oru Daivam Manushyanu).</li>
        <li><strong>Literary Works:</strong> Advaitha Deepika, Atmopadesa Satakam, Daiva Dasakam.</li>
      </ul>

      <Typography variant="h5" component="h2" sx={{ fontWeight: 800, mt: 4, mb: 2, fontFamily: "'Cabinet Grotesk'" }}>
        2. Chattampi Swamikal (1853 - 1924)
      </Typography>
      <p>
        Born at Kannammoola, he worked closely with Guru to protest religious orthodoxies.
      </p>
      <ul>
        <li><strong>Key Works:</strong> Prachina Malayalam, Vedadhikara Nirupanam (challenged the monopoly of Vedas).</li>
        <li><strong>Famous Quote:</strong> "The whole world is one family."</li>
      </ul>

      <Typography variant="h5" component="h2" sx={{ fontWeight: 800, mt: 4, mb: 2, fontFamily: "'Cabinet Grotesk'" }}>
        3. Ayyankali (1863 - 1941)
      </Typography>
      <p>
        Champion of the downtrodden, born at Venganoor. Called "Pulaya Raja" by Mahatma Gandhi.
      </p>
      <ul>
        <li><strong>Villuvandi (Bullock Cart) Strike:</strong> 1893 (asserting the right to travel on public roads).</li>
        <li><strong>Organization:</strong> Sadhujana Paripalana Sangham (established 1907).</li>
      </ul>
    </Box>
  ),
  'kerala-psc-current-affairs-daily-routine': (
    <Box sx={{ color: 'text.primary', '& p': { mb: 3, lineHeight: 1.7, fontSize: '1.025rem' } }}>
      <Typography variant="h5" component="h2" sx={{ fontWeight: 800, mb: 2, fontFamily: "'Cabinet Grotesk'" }}>
        The Pitfall of Monthly PDF Cramming
      </Typography>
      <p>
        Most aspirants study current affairs by reading 100-page monthly compilation PDFs three days before the exam. This results in cognitive overload and makes it hard to distinguish between options during the test.
      </p>

      <Typography variant="h5" component="h2" sx={{ fontWeight: 800, mt: 4, mb: 2, fontFamily: "'Cabinet Grotesk'" }}>
        The 15-Minute Daily Routine
      </Typography>
      <p>
        To build long-term memory, allocate just 15 minutes daily using this routine:
      </p>
      <ol>
        <li><strong>Scan Headlines (5 Mins):</strong> Focus on state development projects, scientific breakthroughs, national appointments, and sports winners.</li>
        <li><strong>Read Tagged News (5 Mins):</strong> Open the <strong>KPSC Master Current Affairs</strong> page, which filters news and highlights the exam-relevant parts.</li>
        <li><strong>Solve Daily MCQs (5 Mins):</strong> Answer the current affairs multiple choice questions immediately after reading. Solving active questions is the single most effective way to lock the details into your memory.</li>
      </ol>

      <Typography variant="h5" component="h2" sx={{ fontWeight: 800, mt: 4, mb: 2, fontFamily: "'Cabinet Grotesk'" }}>
        Subjects to Keep an Eye On
      </Typography>
      <p>
        Kerala PSC has specific preferences for current affairs topics. Make sure you memorize:
      </p>
      <ul>
        <li>Recipients of Jnanpith, Ezhuthachan, and national film awards.</li>
        <li>Chairpersons of Kerala PSC, state commissions, and major board portals.</li>
        <li>Indian space missions (ISRO) and national sports events.</li>
      </ul>
    </Box>
  )
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: 'Article Not Found | KPSC Master',
      description: 'The requested blog article could not be found.',
    };
  }

  return {
    title: `${post.title} | KPSC Master Blog`,
    description: post.summary,
    alternates: {
      canonical: `/blog/${slug}`,
    }
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  const content = blogContents[slug];

  if (!post || !content) {
    return (
      <Container maxWidth="md" sx={{ py: 12, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'text.primary' }}>Article Not Found</Typography>
        <Link href="/blog" style={{ textDecoration: 'none' }}>
          <Button variant="contained" startIcon={<ArrowBackIcon />}>
            Back to Blog
          </Button>
        </Link>
      </Container>
    );
  }

  // Generate structured BlogPosting JSON-LD Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': post.title,
    'description': post.summary,
    'datePublished': '2026-06-19T00:00:00Z', // default placeholder/matching post year
    'author': {
      '@type': 'Organization',
      'name': 'KPSC Master Editorial Team',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://www.kpscmaster.in/logo.png'
      }
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'KPSC Master',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://www.kpscmaster.in/logo.png'
      }
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `https://www.kpscmaster.in/blog/${slug}`
    }
  };

  return (
    <Container maxWidth="md" sx={{ pt: { xs: 3, md: 6 }, pb: { xs: 8, md: 12 } }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Back button */}
      <Link href="/blog" style={{ textDecoration: 'none' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          sx={{
            color: 'text.secondary',
            fontWeight: 700,
            mb: 4,
            '&:hover': { color: 'primary.main' }
          }}
        >
          Back to Articles
        </Button>
      </Link>

      {/* Main post container */}
      <Box>
        {/* Title, tags and author metadata */}
        <Box sx={{ mb: 5 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                bgcolor: `${post.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
              }}
            >
              {post.emoji}
            </Box>
            <Chip
              label={post.category}
              sx={{
                bgcolor: `${post.color}10`,
                color: post.color,
                fontWeight: 700,
                fontSize: '0.8rem',
              }}
            />
            <Typography sx={{ color: 'text.disabled', fontSize: '0.8rem', fontWeight: 600 }}>
              {post.date}
            </Typography>
          </Stack>

          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontFamily: "'Cabinet Grotesk', sans-serif",
              fontWeight: 900,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              color: 'text.primary',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              mb: 3
            }}
          >
            {post.title}
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ color: 'text.secondary', fontSize: '0.85rem', fontWeight: 600 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>✍️</span> By KPSC Master Editorial Team
            </Box>
            <span>•</span>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <span>⏳</span> {post.readTime}
            </Box>
          </Stack>
        </Box>

        <Divider sx={{ mb: 5 }} />

        {/* Dynamic Rich Text Content */}
        <Box sx={{ mb: 8 }}>{content}</Box>

        {/* Signup callout block */}
        <Card
          sx={{
            p: 4.5,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: '28px',
            boxShadow: 'none',
            textAlign: 'center'
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Cabinet Grotesk', sans-serif",
              fontWeight: 900,
              color: 'text.primary',
              mb: 1.5,
              fontSize: '1.5rem'
            }}
          >
            Put This Study Plan into Action ⚡
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mb: 4,
              maxWidth: 520,
              mx: 'auto',
              fontSize: '0.875rem',
              lineHeight: 1.6
            }}
          >
            Don't just read about strategies. Log into KPSC Master, customize your focus exam, attempt daily quizzes, track your streak, and see your rank climb in real time.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'center' }}>
            <Link href="/register" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
                  fontWeight: 700,
                  fontSize: '0.875rem'
                }}
              >
                Sign Up Free
              </Button>
            </Link>
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  py: 1.5,
                  px: 4,
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.875rem'
                }}
              >
                Log In
              </Button>
            </Link>
          </Stack>
        </Card>
      </Box>
    </Container>
  );
}
