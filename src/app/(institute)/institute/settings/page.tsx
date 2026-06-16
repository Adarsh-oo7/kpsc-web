'use client';

import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import {
  Box, Typography, TextField, Button, Alert, CircularProgress,
  Avatar, Input, Grid, InputAdornment, Stack, Divider, Paper
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import BusinessIcon from '@mui/icons-material/Business';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LanguageIcon from '@mui/icons-material/Language';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';

export default function InstituteSettingsPage() {
  const [formData, setFormData] = useState({
    name: '',
    contact_email: '',
    tagline: '',
    phone: '',
    website: '',
    address: '',
    established_year: '',
    primary_color: '#1976d2',
    accent_color: '#ff9800',
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { fetcher } = useAppContext();
  
  const { data: instituteData, error: instituteError, isLoading, mutate } = useSWR(
    '/institute/my-institute/',
    fetcher
  );
  
  useEffect(() => {
    if (instituteData) {
      setFormData({
        name: instituteData.name || '',
        contact_email: instituteData.contact_email || '',
        tagline: instituteData.tagline || '',
        phone: instituteData.phone || '',
        website: instituteData.website || '',
        address: instituteData.address || '',
        established_year: instituteData.established_year?.toString() || '',
        primary_color: instituteData.primary_color || '#1976d2',
        accent_color: instituteData.accent_color || '#ff9800',
      });
      if (instituteData.logo) {
        setPreview(`${instituteData.logo}?t=${new Date().getTime()}`);
      }
    }
  }, [instituteData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

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
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        data.append(key, value.toString());
      }
    });
    if (logoFile) data.append('logo', logoFile);

    try {
      const response = await apiClient.patch('/institute/my-institute/', data);
      setSuccess('Institute details updated successfully!');
      mutate(response.data, false);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.name?.[0] || 'Failed to update details.');
    } finally {
      setLoading(false);
    }
  }, [formData, logoFile, mutate]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
          Institute Settings
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          Manage your institute's public profile, contact details, and branding.
        </Typography>
      </Box>

      <AnimatePresence>
        {error && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><Alert severity="error" sx={{ mb: 2 }}>{error}</Alert></motion.div>}
        {success && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><Alert severity="success" sx={{ mb: 2 }}>{success}</Alert></motion.div>}
      </AnimatePresence>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        {/* Logo Upload Section */}
        <Paper sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.paper', borderRadius: 4, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: 'white' }}>
            Institute Logo
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <label htmlFor="logo-upload" style={{ cursor: 'pointer' }}>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={preview || undefined}
                  sx={{ width: 120, height: 120, border: '3px solid', borderColor: 'primary.main' }}
                >
                  <BusinessIcon sx={{ fontSize: 60 }} />
                </Avatar>
                <Box sx={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                  bgcolor: 'rgba(0,0,0,0.5)', color: 'white', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                  opacity: 0, transition: 'opacity 0.3s ease', '&:hover': { opacity: 1 }
                }}>
                  <PhotoCameraIcon />
                </Box>
              </Box>
            </label>
            <Input id="logo-upload" type="file" sx={{ display: 'none' }} onChange={(e: any) => handleFileChange(e.target.files?.[0] || null)} inputProps={{ accept: 'image/*' }} />
            <Box>
              <Typography variant="body2" sx={{ color: 'grey.300' }}>Click the logo to change it</Typography>
              <Typography variant="caption" color="text.secondary">Recommended: Square image, at least 200x200px</Typography>
            </Box>
          </Box>
        </Paper>

        {/* Basic Info Section */}
        <Paper sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.paper', borderRadius: 4, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: 'white' }}>
            Basic Information
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                name="name"
                label="Institute Name *"
                value={formData.name}
                onChange={handleChange}
                fullWidth
                required
                InputProps={{ startAdornment: <InputAdornment position="start"><BusinessIcon /></InputAdornment> }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                name="established_year"
                label="Established Year"
                type="number"
                value={formData.established_year}
                onChange={handleChange}
                fullWidth
                inputProps={{ min: 1900, max: new Date().getFullYear() }}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarTodayIcon /></InputAdornment> }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                name="tagline"
                label="Tagline / Motto"
                value={formData.tagline}
                onChange={handleChange}
                fullWidth
                placeholder="e.g. Your Success is Our Mission"
                InputProps={{ startAdornment: <InputAdornment position="start"><FormatQuoteIcon /></InputAdornment> }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Contact Details Section */}
        <Paper sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.paper', borderRadius: 4, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: 'white' }}>
            Contact Details
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                name="contact_email"
                label="Contact Email"
                type="email"
                value={formData.contact_email}
                onChange={handleChange}
                fullWidth
                InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment> }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                name="phone"
                label="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                placeholder="+91 98765 43210"
                InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment> }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                name="website"
                label="Website URL"
                value={formData.website}
                onChange={handleChange}
                fullWidth
                placeholder="https://yourcoachingcenter.com"
                InputProps={{ startAdornment: <InputAdornment position="start"><LanguageIcon /></InputAdornment> }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                name="address"
                label="Address"
                value={formData.address}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                placeholder="Full institute address..."
                InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnIcon /></InputAdornment> }}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Branding Colors Section */}
        <Paper sx={{ p: { xs: 2, md: 4 }, bgcolor: 'background.paper', borderRadius: 4, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
            Brand Colors
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            These colors are used on your student portal login page and profile cards.
          </Typography>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: formData.primary_color, border: '2px solid rgba(255,255,255,0.2)', flexShrink: 0 }}
                />
                <TextField
                  name="primary_color"
                  label="Primary Color"
                  value={formData.primary_color}
                  onChange={handleChange}
                  fullWidth
                  placeholder="#1976d2"
                  InputProps={{ startAdornment: <InputAdornment position="start"><ColorLensIcon /></InputAdornment> }}
                />
                <input
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                  style={{ width: 40, height: 40, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 4 }}
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: formData.accent_color, border: '2px solid rgba(255,255,255,0.2)', flexShrink: 0 }}
                />
                <TextField
                  name="accent_color"
                  label="Accent Color"
                  value={formData.accent_color}
                  onChange={handleChange}
                  fullWidth
                  placeholder="#ff9800"
                  InputProps={{ startAdornment: <InputAdornment position="start"><ColorLensIcon /></InputAdornment> }}
                />
                <input
                  type="color"
                  value={formData.accent_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, accent_color: e.target.value }))}
                  style={{ width: 40, height: 40, border: 'none', background: 'none', cursor: 'pointer', borderRadius: 4 }}
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="submit" variant="contained" size="large" disabled={loading} sx={{ py: 1.5, px: 6, fontWeight: 'bold', minWidth: 200 }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
          </Button>
        </Box>
      </Box>
    </motion.div>
  );
}