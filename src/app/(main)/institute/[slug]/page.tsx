import { Metadata } from 'next';
import Link from 'next/link';
import { Box, Typography, Button, Stack, Avatar, Paper, Divider } from '@mui/material';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import PhoneIcon from '@mui/icons-material/Phone';
import LanguageIcon from '@mui/icons-material/Language';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const GREEN = '#1B6B3A';
const GREEN_LIGHT = '#2E8B57';

async function getInstitute(slug: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const res = await fetch(`${apiUrl}/api/institute/public/detail/${slug}/`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error fetching institute:', error);
    return null;
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const inst = await getInstitute(slug);

  if (!inst) {
    return {
      title: 'Institute Not Found | KPSC Master',
      description: 'The requested coaching institute could not be found.',
    };
  }

  return {
    title: `${inst.name} | Kerala PSC Coaching Academy`,
    description: inst.tagline || `Join ${inst.name} on KPSC Master and start your exam preparation.`,
    alternates: {
      canonical: `/institute/${slug}`,
    },
  };
}

export default async function InstituteSEOPage({ params }: PageProps) {
  const { slug } = await params;
  const inst = await getInstitute(slug);

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
    <Box sx={{ maxWidth: 900, mx: 'auto', pb: 6 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: { xs: 3, md: 4.5 },
          borderRadius: '24px',
          background: `linear-gradient(165deg, ${GREEN} 0%, #166534 50%, #134E2A 100%)`,
          color: '#fff',
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems="center">
          <Avatar
            src={logoUrl}
            alt={inst.name}
            sx={{ width: 88, height: 88, bgcolor: 'rgba(255,255,255,0.16)', border: '2px solid rgba(255,255,255,0.35)' }}
          >
            <SchoolIcon sx={{ fontSize: 42 }} />
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#FCD34D', mb: 0.75 }}>
              Coaching centre
            </Typography>
            <Typography sx={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 900, fontSize: { xs: '1.7rem', md: '2.2rem' }, letterSpacing: '-0.03em' }}>
              {inst.name}
            </Typography>
            {inst.tagline && (
              <Typography sx={{ mt: 0.75, color: 'rgba(255,255,255,0.86)' }}>{inst.tagline}</Typography>
            )}
          </Box>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 4 }, borderRadius: '20px', border: '1.5px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <Stack spacing={1.5}>
            <Typography sx={{ fontWeight: 800, color: 'text.primary' }}>Contact</Typography>
            {inst.contact_email && (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <ContactMailIcon sx={{ color: GREEN }} />
                <Typography>{inst.contact_email}</Typography>
              </Stack>
            )}
            {inst.phone && (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <PhoneIcon sx={{ color: GREEN }} />
                <Typography>{inst.phone}</Typography>
              </Stack>
            )}
            {inst.website && (
              <Stack direction="row" spacing={1.5} alignItems="center">
                <LanguageIcon sx={{ color: GREEN }} />
                <a href={inst.website} target="_blank" rel="noopener noreferrer" style={{ color: GREEN, fontWeight: 700 }}>
                  {inst.website}
                </a>
              </Stack>
            )}
            {!inst.contact_email && !inst.phone && !inst.website && (
              <Typography sx={{ color: 'text.secondary' }}>No contact listed yet.</Typography>
            )}
          </Stack>
          <Stack spacing={1.5}>
            <Typography sx={{ fontWeight: 800, color: 'text.primary' }}>Location</Typography>
            {inst.address ? (
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <LocationOnIcon sx={{ color: GREEN, mt: 0.4 }} />
                <Typography sx={{ whiteSpace: 'pre-line' }}>{inst.address}</Typography>
              </Stack>
            ) : (
              <Typography sx={{ color: 'text.secondary' }}>No address listed.</Typography>
            )}
            {inst.established_year && (
              <Typography sx={{ color: 'text.secondary' }}>Established {inst.established_year}</Typography>
            )}
          </Stack>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
          <Link href="/institutes" style={{ textDecoration: 'none' }}>
            <Button
              variant="contained"
              size="large"
              sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '12px', color: '#fff', background: `linear-gradient(135deg, ${GREEN}, ${GREEN_LIGHT})` }}
            >
              Request to join
            </Button>
          </Link>
          <Link href="/login" style={{ textDecoration: 'none' }}>
            <Button
              variant="outlined"
              size="large"
              sx={{ textTransform: 'none', fontWeight: 800, borderRadius: '12px', color: GREEN, borderColor: GREEN }}
            >
              Student login
            </Button>
          </Link>
        </Stack>
      </Paper>
    </Box>
  );
}
