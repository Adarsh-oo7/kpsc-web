// app/(main)/contact/page.tsx

'use client';

import { Container, Box, Typography, Grid, TextField, Button, Stack, Chip } from '@mui/material';
import { motion } from 'framer-motion';

export default function ContactPage() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert('Thank you! Your message has been sent successfully. We will contact you soon.');
    (e.target as HTMLFormElement).reset();
  };

  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 8 }, pb: { xs: 8, md: 12 } }}>
      {/* Header section */}
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Chip
            label="✉️ Support & Collaboration"
            sx={{
              background: 'rgba(27,107,58,0.12)',
              border: '1px solid rgba(46,139,87,0.25)',
              color: '#2E8B57',
              fontWeight: 800,
              fontSize: '0.75rem',
              height: 32,
              mb: 3
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontFamily: "'Cabinet Grotesk', sans-serif",
              fontWeight: 900,
              fontSize: { xs: '2.2rem', sm: '3rem', md: '3.6rem' },
              color: 'text.primary',
              letterSpacing: '-0.02em',
              mb: 2
            }}
          >
            Get in Touch with Us
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              maxWidth: 600,
              mx: 'auto',
              fontSize: { xs: '1rem', sm: '1.1rem' },
              lineHeight: 1.6
            }}
          >
            Have any questions about subscriptions, features, or partnership opportunities? Reach out and our team will get back to you shortly.
          </Typography>
        </motion.div>
      </Box>

      {/* Grid container */}
      <Grid container spacing={5} sx={{ alignItems: 'stretch' }}>
        {/* Contact details */}
        <Grid size={{ xs: 12, md: 5 }}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{ height: '100%' }}
          >
            <Box
              sx={{
                p: 4,
                height: '100%',
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, fontSize: '1.25rem', color: 'text.primary', mb: 2 }}>
                  Communication Channels
                </Typography>
                <Typography sx={{ color: 'text.secondary', fontSize: '0.9rem', lineHeight: 1.6, mb: 4 }}>
                  Whether you are a student preparing for exams or a coaching institute owner looking to leverage our portal, we are ready to assist you.
                </Typography>

                <Stack spacing={3.5}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                    <Box sx={{ width: 44, height: 44, bgcolor: 'rgba(27,107,58,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E8B57', fontSize: '1.2rem' }}>
                      ✉️
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}>Email Support</Typography>
                      <Typography sx={{ fontSize: '0.9rem', color: 'text.primary', fontWeight: 700 }}>support@kpscmaster.com</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                    <Box sx={{ width: 44, height: 44, bgcolor: 'rgba(27,107,58,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E8B57', fontSize: '1.2rem' }}>
                      📞
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}>Call Support</Typography>
                      <Typography sx={{ fontSize: '0.9rem', color: 'text.primary', fontWeight: 700 }}>+91 94003 55185</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                    <Box sx={{ width: 44, height: 44, bgcolor: 'rgba(27,107,58,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E8B57', fontSize: '1.2rem' }}>
                      📍
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}>Headquarters</Typography>
                      <Typography sx={{ fontSize: '0.9rem', color: 'text.primary', fontWeight: 700 }}>Kochi, Kerala, India</Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>

              <Typography sx={{ color: 'text.disabled', fontSize: '0.775rem', mt: 4, fontWeight: 500 }}>
                Response time: typically within 12 hours.
              </Typography>
            </Box>
          </motion.div>
        </Grid>

        {/* Contact Form */}
        <Grid size={{ xs: 12, md: 7 }}>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Box
              sx={{
                p: 4,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: '28px',
              }}
            >
              <Typography sx={{ fontFamily: "'Cabinet Grotesk'", fontWeight: 800, fontSize: '1.25rem', color: 'text.primary', mb: 3 }}>
                Send us a Message
              </Typography>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      required
                      fullWidth
                      label="Your Name"
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      required
                      fullWidth
                      type="email"
                      label="Email Address"
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      required
                      fullWidth
                      label="Subject"
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      required
                      fullWidth
                      multiline
                      rows={5}
                      label="Your Message"
                      variant="outlined"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <Button
                      type="submit"
                      variant="contained"
                      sx={{
                        py: 1.5,
                        px: 4,
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #1B6B3A, #2E8B57)',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        boxShadow: '0 4px 15px rgba(27,107,58,0.2)'
                      }}
                    >
                      Send Message
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Box>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
}
