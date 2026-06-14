'use client';

import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import {
  Box, Typography, TextField, Button, Alert, CircularProgress,
  Avatar, Input, Grid, InputAdornment, styled, FormControl, InputLabel,Stack
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import BusinessIcon from '@mui/icons-material/Business';
import EmailIcon from '@mui/icons-material/Email';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '@/context/AppContext'; // Import context
import apiClient from '@/lib/apiClient'; // Import the central API client

// --- Styled Components (optional, can be moved to a shared file) ---
const StyledFormControl = styled(FormControl)(({ theme }) => ({
    '& .MuiInputLabel-root': { color: theme.palette.text.secondary },
    '& .MuiInputBase-root': {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: (theme.shape.borderRadius as number) * 2,
        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
    },
}));


export default function InstituteSettingsPage() {
  const [formData, setFormData] = useState({ name: '', contact_email: '' });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // CORRECTED: Use the universal fetcher from the context
  const { fetcher } = useAppContext();
  
  // CORRECTED: Use the fetcher and short URL
  const { data: instituteData, error: instituteError, isLoading, mutate } = useSWR(
    '/institute/my-institute/',
    fetcher
  );
  
  useEffect(() => {
    if (instituteData) {
      setFormData({
        name: instituteData.name || '',
        contact_email: instituteData.contact_email || '',
      });
      if (instituteData.logo) {
        // The profile photo URL from the backend should already be absolute
        setPreview(`${instituteData.logo}?t=${new Date().getTime()}`);
      }
    }
  }, [instituteData]);

  const handleFileChange = useCallback((file: File | null) => {
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file.');
        return;
      }
      setLogoFile(file);
      setPreview(URL.createObjectURL(file));
      setError('');
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const data = new FormData();
    if (formData.name) data.append('name', formData.name);
    if (formData.contact_email) data.append('contact_email', formData.contact_email);
    if (logoFile) data.append('logo', logoFile);

    try {
      // CORRECTED: Use the apiClient for the PATCH request
      const response = await apiClient.patch('/institute/my-institute/', data);
      setSuccess('Institute details updated successfully!');
      mutate(response.data, false); // Update SWR cache
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update details.');
    } finally {
      setLoading(false);
    }
  }, [formData, logoFile, mutate]);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
  };

  if (isLoading) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
        </Box>
    );
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
      <motion.div variants={itemVariants}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
          Institute Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Manage your institute's public profile and details.
        </Typography>
      </motion.div>

      <AnimatePresence>
          {error && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><Alert severity="error" sx={{ mb: 2 }}>{error}</Alert></motion.div>}
          {success && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><Alert severity="success" sx={{ mb: 2 }}>{success}</Alert></motion.div>}
      </AnimatePresence>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <motion.div variants={itemVariants}>
            <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.paper', borderRadius: 4 }}>
                <Grid container spacing={4} alignItems="center">
                    {/* Logo Upload */}
                    <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: 'center' }}>
                      <FormControl>
                        <InputLabel htmlFor="logo-upload" sx={{ cursor: 'pointer', transform: 'none', position: 'static' }}>
                            <motion.div whileHover={{ scale: 1.05 }} style={{ position: 'relative' }}>
                                <Avatar src={preview || undefined} sx={{ width: 150, height: 150, m: 'auto', border: '3px solid', borderColor: 'primary.main' }}>
                                    <BusinessIcon sx={{ fontSize: 80 }} />
                                </Avatar>
                                <Box sx={{
                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                    bgcolor: 'rgba(0,0,0,0.5)', color: 'white', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                                    opacity: 0, transition: 'opacity 0.3s ease', '&:hover': { opacity: 1 }
                                }}>
                                    <PhotoCameraIcon fontSize="large" />
                                </Box>
                            </motion.div>
                        </InputLabel>
                        <Input id="logo-upload" type="file" hidden onChange={(e: any) => handleFileChange(e.target.files?.[0] || null)} inputProps={{ accept: 'image/*' }} />
                      </FormControl>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Click logo to change</Typography>
                    </Grid>

                    {/* Form Fields */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Stack spacing={3}>
                            <StyledFormControl fullWidth>
                                <TextField
                                    label="Institute Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><BusinessIcon /></InputAdornment> }}
                                />
                            </StyledFormControl>
                            <StyledFormControl fullWidth>
                                <TextField
                                    label="Contact Email"
                                    type="email"
                                    value={formData.contact_email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                                    InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment> }}
                                />
                            </StyledFormControl>
                        </Stack>
                    </Grid>

                    {/* Save Button */}
                    <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ py: 1.5, px: 5, fontWeight: 'bold' }}>
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </motion.div>
      </Box>
    </motion.div>
  );
}