'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Box, Toolbar } from '@mui/material';
import Sidebar from '@/components/Sidebar';
import MainHeader from '@/components/MainHeader';
import SiteFooter from '@/components/SiteFooter';
import { useAppContext } from '@/context/AppContext';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile } = useAppContext();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    // If the student is enrolled in an academy/institute (e.g. RankUp) and is not an owner,
    // restrict them exclusively to their institute portal and profile
    if (!profile?.institute?.slug || profile.is_owner) return;
    const slug = profile.institute.slug;
    const allowedExact = ['/profile', '/login', '/register', '/notifications'];
    const allowedPrefixes = [`/${slug}`, `/institute/${slug}`, '/profile'];
    const isExact = allowedExact.includes(pathname);
    const hasPrefix = allowedPrefixes.some((prefix) => pathname.startsWith(prefix));
    if (!isExact && !hasPrefix) {
      router.replace(`/${slug}/dashboard`);
    }
  }, [profile, pathname, router]);

  return (
    <Box sx={{
      display: 'flex',
      minHeight: '100vh',
      bgcolor: 'background.default',
    }}>
      <MainHeader onDrawerToggle={() => setDrawerOpen(!drawerOpen)} />

      {user && (
        <Sidebar
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          onNavigate={() => setDrawerOpen(false)}
        />
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflowX: 'hidden',
        }}
      >
        {/* Spacer for fixed AppBar */}
        <Toolbar sx={{ minHeight: 64 }} />

        {/* Page content */}
        <Box sx={{
          flex: 1,
          px: isAuthPage ? 0 : { xs: 2, sm: 3 },
          pt: isAuthPage ? 0 : { xs: 1.5, sm: 2 },
          pb: isAuthPage ? 0 : { xs: 2, sm: 3 },
          maxWidth: '100%',
        }}>
          {children}
        </Box>
        {!user && !isAuthPage && <SiteFooter />}
      </Box>
    </Box>
  );
}