// app/(institute)/institute/customization/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import axios from 'axios';
import {
  Box, Typography, Button, Alert, CircularProgress, Grid, Paper, styled, IconButton
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import ClearIcon from '@mui/icons-material/Clear';
import { motion, AnimatePresence } from 'framer-motion';

// --- Reusable Fetcher ---
const fetcher = async (url: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) throw new Error('Not authenticated');
    const fullUrl = `${process.env.NEXT_PUBLIC_API_URL}${url}`;
    const res = await fetch(fullUrl, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
};

// --- Styled component for the image upload area ---
const ImageUploadBox = styled(Box)(({ theme }) => ({
    position: 'relative',
    aspectRatio: '16 / 9',
    borderRadius: theme.shape.borderRadius * 2,
    border: `2px dashed ${theme.palette.divider}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    overflow: 'hidden',
    cursor: 'pointer',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: theme.palette.text.secondary,
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
        borderColor: theme.palette.primary.main,
        boxShadow: `0 0 15px 2px ${theme.palette.primary.main}33`,
    },
}));

const UploadOverlay = styled(Box)({
    position: 'absolute',
    top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    '&:hover': {
        opacity: 1,
    }
});

// --- Main Page Component ---
export default function CustomizationPage() {
    const [files, setFiles] = useState<{ [key: string]: File | null }>({});
    const [previews, setPreviews] = useState<{ [key: string]: string | null }>({});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const { data: instituteData, mutate } = useSWR('/api/institute/my-institute/', fetcher);

    const BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';

    // Set initial previews from fetched data
    useEffect(() => {
        if (instituteData) {
            const initialPreviews = {
                login_bg_image: instituteData.login_bg_image ? `${BASE_URL}${instituteData.login_bg_image}` : null,
                login_image_1: instituteData.login_image_1 ? `${BASE_URL}${instituteData.login_image_1}` : null,
                login_image_2: instituteData.login_image_2 ? `${BASE_URL}${instituteData.login_image_2}` : null,
                login_image_3: instituteData.login_image_3 ? `${BASE_URL}${instituteData.login_image_3}` : null,
            };
            setPreviews(initialPreviews);
        }
    }, [instituteData, BASE_URL]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const file = e.target.files?.[0];
        if (file) {
            setFiles(prev => ({ ...prev, [fieldName]: file }));
            setPreviews(prev => ({ ...prev, [fieldName]: URL.createObjectURL(file) }));
        }
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const data = new FormData();
        Object.keys(files).forEach(key => {
            if (files[key]) {
                data.append(key, files[key] as File);
            }
        });
        
        // If there's nothing to upload, don't make an API call
        if (data.entries().next().done) {
            setError("No new images selected to upload.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/institute/my-institute/`, data, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('access_token')}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSuccess('Branding images updated successfully!');
            mutate(response.data, false); // Update local SWR cache with new data
        } catch (err) {
            setError('Failed to update branding images.');
        } finally {
            setLoading(false);
        }
    }, [files, mutate]);

    const imageFields = [
        { name: 'login_bg_image', label: 'Main Background Image' },
        { name: 'login_image_1', label: 'Decorative Image 1' },
        { name: 'login_image_2', label: 'Decorative Image 2' },
        { name: 'login_image_3', label: 'Decorative Image 3' },
    ];
    
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4, color: 'white' }}>
                Student Login Page Customization
            </Typography>
            <Paper component="form" onSubmit={handleSubmit} sx={{ p: {xs: 2, md: 4}, borderRadius: 4, bgcolor: 'background.paper' }}>
                <Grid container spacing={3}>
                    {imageFields.map(field => (
                        <Grid item xs={12} sm={6} key={field.name}>
                            <Typography variant="subtitle1" gutterBottom>{field.label}</Typography>
                            <label htmlFor={field.name}>
                                <ImageUploadBox sx={{ backgroundImage: previews[field.name] ? `url(${previews[field.name]})` : 'none' }}>
                                    {!previews[field.name] && (
                                        <Box sx={{textAlign: 'center'}}>
                                            <PhotoCameraIcon sx={{mb: 1}}/>
                                            <Typography variant="caption">Click to upload</Typography>
                                        </Box>
                                    )}
                                    <UploadOverlay>
                                        <Typography>Change Image</Typography>
                                    </UploadOverlay>
                                </ImageUploadBox>
                                <input type="file" id={field.name} hidden accept="image/*" onChange={(e) => handleFileChange(e, field.name)} />
                            </label>
                        </Grid>
                    ))}
                    <Grid item xs={12} sx={{ mt: 2 }}>
                        <AnimatePresence>
                            {error && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><Alert severity="error" sx={{ mb: 2 }}>{error}</Alert></motion.div>}
                            {success && <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}><Alert severity="success" sx={{ mb: 2 }}>{success}</Alert></motion.div>}
                        </AnimatePresence>
                        <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Customization'}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </motion.div>
    );
}