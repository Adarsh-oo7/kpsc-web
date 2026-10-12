'use client';

import Image from 'next/image';
import NextLink from 'next/link';
import { Box, Container, Link, Stack, Typography } from '@mui/material';

const DPS_URL = 'https://www.digitalproductsolutions.in/';
const ADARSH_URL = 'https://adarsh.digitalproductsolutions.in/';

export const ATTRIBUTION_TEXT =
  'KPSC Master is developed and maintained by Digital Product Solutions, with development contributions from Adarsh B S.';

export default function SiteFooter() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: '1px solid',
        borderColor: 'divider',
        py: { xs: 4, md: 5 },
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            flexDirection: { xs: 'column', md: 'row' },
            flexWrap: 'wrap',
            gap: 2.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Image src="/KPSC MASTER.png" alt="KPSC Master logo" width={30} height={30} style={{ objectFit: 'contain' }} />
            <Typography sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 900, color: 'text.primary', fontSize: '1.05rem' }}>
              KPSC Master
            </Typography>
          </Box>

          <Typography
            component="p"
            sx={{
              color: 'text.secondary',
              fontSize: '0.8rem',
              lineHeight: 1.6,
              maxWidth: 560,
              fontWeight: 500,
            }}
          >
            KPSC Master is developed and maintained by{' '}
            <Link
              href={DPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: '#2E8B57', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Digital Product Solutions
            </Link>
            , with development contributions from{' '}
            <Link
              href={ADARSH_URL}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: '#2E8B57', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Adarsh B S
            </Link>
            .
          </Typography>

          <Stack
            direction="row"
            spacing={2.5}
            flexWrap="wrap"
            useFlexGap
            sx={{ alignItems: 'center' }}
            component="nav"
            aria-label="Footer"
          >
            {[
              { label: 'About', href: '/about' },
              { label: 'Features', href: '/features' },
              { label: 'Exams', href: '/exams' },
              { label: 'Contact', href: '/contact' },
            ].map((item) => (
              <Typography
                key={item.href}
                component={NextLink}
                href={item.href}
                sx={{
                  fontSize: '0.775rem',
                  color: 'text.secondary',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': { color: '#2E8B57' },
                }}
              >
                {item.label}
              </Typography>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
