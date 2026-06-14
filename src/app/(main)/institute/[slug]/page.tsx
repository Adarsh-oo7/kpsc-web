import { Metadata } from 'next';
import Link from 'next/link';
import { Box, Typography, Card, CardContent, Button, Stack, Avatar, Paper, Divider } from '@mui/material';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import PhoneIcon from '@mui/icons-material/Phone';
import LanguageIcon from '@mui/icons-material/Language';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

async function getInstitute(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const res = await fetch(`${apiUrl}/api/institute/public/detail/${slug}/`, {
    next: { revalidate: 3600 }
  });
  if (!res.ok) return null;
  return res.json();
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
    description: inst.tagline || `Join ${inst.name} branded learning space on KPSC Master and start your exam preparation.`,
    alternates: {
      canonical: `/institute/${slug}`,
    }
  };
}

export default async function InstituteSEOPage({ params }: PageProps) {
  const { slug } = await params;
  const inst = await getInstitute(slug);

  if (!inst) {
    return (
      <Box sx={{ p: 4, textAlign: 'center', color: 'white' }}>
        <Typography variant="h5" gutterBottom>Institute Not Found</Typography>
        <Typography variant="body1" sx={{ mb: 3, color: 'grey.400' }}>
          The coaching center you are looking for does not exist or has been removed.
        </Typography>
        <Button component={Link} href="/" variant="contained" startIcon={<ArrowBackIcon />}>
          Back to Home
        </Button>
      </Box>
    );
  }

  // Fallback logo URL if empty
  const logoUrl = inst.logo || '';
  const primaryColor = inst.primary_color || '#1976d2';
  const accentColor = inst.accent_color || '#ff9800';

  // JSON-LD EducationalOrganization Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    'name': inst.name,
    'logo': logoUrl,
    'email': inst.contact_email,
    'telephone': inst.phone,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': inst.address
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: 3, mt: 4 }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Main Profile Card with Custom Branding styling */}
      <Paper 
        elevation={3}
        sx={{ 
          p: 4, 
          borderRadius: 6, 
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)'
        }}
      >
        {/* Subtle background color accent blobs based on branding color */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: '-50px', 
            right: '-50px', 
            width: 200, 
            height: 200, 
            borderRadius: '50%', 
            background: primaryColor,
            opacity: 0.1,
            filter: 'blur(40px)',
            zIndex: 0
          }} 
        />

        <Stack spacing={4} sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center" textAlign={{ xs: 'center', sm: 'left' }}>
            <Avatar 
              src={logoUrl} 
              alt={inst.name}
              sx={{ 
                width: 100, 
                height: 100, 
                border: `3px solid ${primaryColor}`,
                bgcolor: 'rgba(255,255,255,0.1)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.3)'
              }}
            >
              <SchoolIcon sx={{ fontSize: 50, color: 'grey.300' }} />
            </Avatar>

            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1, letterSpacing: '-0.02em' }}>
                {inst.name}
              </Typography>
              {inst.tagline && (
                <Typography variant="h6" sx={{ color: 'grey.300', fontWeight: 'normal', fontStyle: 'italic', mb: 1.5 }}>
                  "{inst.tagline}"
                </Typography>
              )}
              {inst.established_year && (
                <Typography variant="caption" sx={{ color: 'grey.500', display: 'block' }}>
                  Established: {inst.established_year}
                </Typography>
              )}
            </Box>
          </Stack>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

          {/* Contact and Info details */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ color: primaryColor, fontWeight: 'bold' }}>
                Contact Information
              </Typography>
              
              {inst.contact_email && (
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <ContactMailIcon sx={{ color: 'grey.400' }} />
                  <Typography variant="body1">{inst.contact_email}</Typography>
                </Stack>
              )}

              {inst.phone && (
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <PhoneIcon sx={{ color: 'grey.400' }} />
                  <Typography variant="body1">{inst.phone}</Typography>
                </Stack>
              )}

              {inst.website && (
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <LanguageIcon sx={{ color: 'grey.400' }} />
                  <a href={inst.website} target="_blank" rel="noopener noreferrer" style={{ color: '#42a5f5', textDecoration: 'none' }}>
                    {inst.website}
                  </a>
                </Stack>
              )}
            </Stack>

            <Stack spacing={2}>
              <Typography variant="h6" sx={{ color: primaryColor, fontWeight: 'bold' }}>
                Location
              </Typography>
              {inst.address ? (
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <LocationOnIcon sx={{ color: 'grey.400', mt: 0.5 }} />
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                    {inst.address}
                  </Typography>
                </Stack>
              ) : (
                <Typography variant="body2" sx={{ color: 'grey.500' }}>No address listed.</Typography>
              )}
            </Stack>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

          {/* Connect / Actions */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, justifyContent: 'center', pt: 2 }}>
            <Button 
              component="a" 
              href={`http://${inst.slug}.localhost:3000/login`} 
              variant="contained" 
              size="large"
              sx={{ 
                bgcolor: primaryColor,
                '&:hover': {
                  bgcolor: primaryColor,
                  filter: 'brightness(1.1)'
                }
              }}
            >
              Student Portal Login
            </Button>
            <Button 
              component={Link} 
              href={`/register?institute=${inst.id}`} 
              variant="outlined" 
              size="large"
              sx={{ 
                color: 'white', 
                borderColor: primaryColor,
                '&:hover': {
                  borderColor: primaryColor,
                  bgcolor: 'rgba(255,255,255,0.05)'
                }
              }}
            >
              Request to Join Institute
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
