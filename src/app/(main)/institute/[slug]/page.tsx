import { Metadata } from 'next';
import Link from 'next/link';
import { Box, Typography, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InstituteStudentPortalClient from './InstituteStudentPortalClient';

const GREEN = '#1B6B3A';
const GREEN_LIGHT = '#2E8B57';

async function getPortalData(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  try {
    const res = await fetch(`${apiUrl}/api/institute/public/portal/${slug}/`, {
      next: { revalidate: 30 },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (error) {
    console.error('Error fetching portal data:', error);
  }

  try {
    const res = await fetch(`${apiUrl}/api/institute/public/detail/${slug}/`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const detail = await res.json();
    return { institute: detail };
  } catch (error) {
    console.error('Error fetching institute detail:', error);
    return null;
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const portalData = await getPortalData(slug);
  const inst = portalData?.institute;

  if (!inst) {
    return {
      title: 'Institute Not Found | KPSC Master',
      description: 'The requested coaching institute could not be found.',
    };
  }

  return {
    title: `${inst.name} | Official PSC Learning & Test Portal`,
    description: inst.tagline || `Log in or join ${inst.name} on KPSC Master to practice tests, view results, and compete on the batch leaderboard.`,
    alternates: {
      canonical: `/institute/${slug}`,
    },
  };
}

export default async function InstituteSEOPage({ params }: PageProps) {
  const { slug } = await params;
  const portalData = await getPortalData(slug);
  const inst = portalData?.institute;

  if (!inst) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom sx={{ color: 'text.primary', fontWeight: 800 }}>
          Institute not found
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
          The coaching centre you are looking for does not exist or has been removed.
        </Typography>
        <Link href="/institutes" style={{ textDecoration: 'none' }}>
          <Button variant="contained" startIcon={<ArrowBackIcon />} sx={{ textTransform: 'none', fontWeight: 800, background: `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})` }}>
            Browse academies
          </Button>
        </Link>
      </Box>
    );
  }

  const logoUrl = inst.logo || '';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: inst.name,
    logo: logoUrl,
    email: inst.contact_email,
    telephone: inst.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: inst.address,
    },
  };

  return (
    <Box suppressHydrationWarning>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <InstituteStudentPortalClient
        slug={slug}
        initialInstitute={inst}
        initialPortalData={portalData}
      />
    </Box>
  );
}
