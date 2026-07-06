// app/(main)/institutes/[district]/page.tsx

import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container, Box, Typography, Button, Paper, Stack, Grid, Avatar, Chip } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import SchoolIcon from '@mui/icons-material/School';

interface PageProps {
  params: Promise<{ district: string }>;
}

function capitalizeDistrict(district: string): string {
  if (!district) return '';
  return district.charAt(0).toUpperCase() + district.slice(1).toLowerCase();
}

async function getInstitutesForDistrict(district: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const res = await fetch(`${apiUrl}/api/institute/public/list/?district=${district}`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error("Error fetching institutes for district:", error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const district = resolvedParams?.district || '';
  const capitalized = capitalizeDistrict(district);
  
  return {
    title: `Best PSC Coaching Centres in ${capitalized} — KPSC Master Partner Institutes`,
    description: `Looking for top Kerala PSC coaching in ${capitalized}? Find contact details, addresses, and offered mock test series of our partner institutes in ${capitalized}.`,
    alternates: {
      canonical: `https://www.kpscmaster.in/institutes/${district}`,
    }
  };
}

export default async function DistrictInstitutesPage({ params }: PageProps) {
  const resolvedParams = await params;
  const district = resolvedParams?.district || '';
  const capitalized = capitalizeDistrict(district);
  const rawInstitutes = await getInstitutesForDistrict(district);
  const institutes = Array.isArray(rawInstitutes) ? rawInstitutes : [];

  // Generate LocalBusiness schemas
  const schemas = institutes.map((inst: any) => ({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': inst.name,
    'image': inst.logo || 'https://www.kpscmaster.in/logo.png',
    'telephone': inst.phone || '',
    'email': inst.contact_email || '',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': inst.address || '',
      'addressLocality': capitalized,
      'addressRegion': 'Kerala',
      'postalCode': '',
      'addressCountry': 'IN'
    }
  }));

  // FAQ Schema JSON-LD
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': `Which is the best PSC coaching centre in ${capitalized}?`,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': `KPSC Master partners with top coaching academies in ${capitalized} to offer digital tests, streak systems, and customized local classes. Browse our list to connect with one today.`
        }
      },
      {
        '@type': 'Question',
        'name': `Do partner institutes in ${capitalized} offer offline classes?`,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': `Yes, most partner academies in ${capitalized} provide offline coaching sessions combined with the KPSC Master online student exam portal.`
        }
      }
    ]
  };

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 3, md: 6 }, pb: 8 }}>
      {/* Inject schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {schemas.map((schema: any, idx: number) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* Breadcrumbs */}
      <Box sx={{ mb: 4, display: 'flex', gap: 1, alignItems: 'center' }}>
        <Link href="/" style={{ color: '#3B82F6', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>Home</Link>
        <Typography variant="caption" sx={{ color: 'grey.500' }}>&gt;</Typography>
        <Link href="/institutes" style={{ color: '#3B82F6', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>Institutes</Link>
        <Typography variant="caption" sx={{ color: 'grey.500' }}>&gt;</Typography>
        <Typography variant="caption" sx={{ color: 'grey.400' }}>{capitalized}</Typography>
      </Box>

      {/* Hero Header */}
      <Paper
        sx={{
          p: { xs: 4, md: 5 },
          borderRadius: 6,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(15, 23, 42, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid', borderColor: 'divider',
          mb: 5
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 900,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            color: 'text.primary',
            mb: 2
          }}
        >
          Best PSC Coaching Centres in {capitalized}
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 650, fontSize: '1.05rem', lineHeight: 1.6 }}>
          Discover the top-rated Kerala PSC preparation academies in {capitalized}. Partner institutes use KPSC Master's smart portals for student evaluation and daily study sheets.
        </Typography>
      </Paper>

      {/* List of Institutes */}
      {institutes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 4 }}>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>No partner academies found in {capitalized} yet.</Typography>
          <Link href="/contact" style={{ textDecoration: 'none' }}>
            <Button variant="outlined">Register Your Institute</Button>
          </Link>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {institutes.map((inst: any, idx: number) => (
            <Grid item xs={12} md={6} key={idx}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Box>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
                    <Avatar src={inst.logo || ''} sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                      {inst.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
                        {inst.name}
                      </Typography>
                      {inst.tagline && (
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                          "{inst.tagline}"
                        </Typography>
                      )}
                    </Box>
                  </Stack>

                  <Divider sx={{ my: 1.5 }} />

                  <Stack spacing={1.5} sx={{ mb: 3 }}>
                    {inst.address && (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.3 }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                          {inst.address}
                        </Typography>
                      </Box>
                    )}
                    {inst.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                          {inst.phone}
                        </Typography>
                      </Box>
                    )}
                    {inst.contact_email && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                          {inst.contact_email}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Box>

                <Link href={`https://${inst.slug}.kpscmaster.in`} target="_blank" style={{ textDecoration: 'none' }}>
                  <Button variant="outlined" fullWidth sx={{ textTransform: 'none', borderRadius: '8px', fontWeight: 700 }}>
                    Visit Institute Portal
                  </Button>
                </Link>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* District FAQ section */}
      <Box sx={{ mt: 6 }}>
        <Typography variant="h4" component="h2" sx={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, color: 'text.primary', mb: 3 }}>
          Frequently Asked Questions
        </Typography>
        <Grid container spacing={3}>
          {faqSchema.mainEntity.map((item, idx) => (
            <Grid item xs={12} md={6} key={idx}>
              <Paper sx={{ p: 3, height: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary', mb: 1.5 }}>
                  {item.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  {item.acceptedAnswer.text}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}
