'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import {
  Box, Typography, TextField, Button, Alert, Card, CardContent,
  Select, MenuItem, InputLabel, FormControl, CircularProgress,
  Avatar, Input, Grid, Chip
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';

export default function ProfilePage() {
  // CORRECTED: Get the user, loading state, and the global fetcher from the context
  const { user, fetcher, isLoading: isContextLoading } = useAppContext();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    profile_photo_upload: null as File | null,
    qualifications: '',
    date_of_birth: '',
    place: '',
    preferred_topics_ids: [] as number[],
    preferred_exams_ids: [] as number[],
    preferred_difficulty: '',
  });
  
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // CORRECTED: SWR hooks now use the global fetcher and short URLs, which fixes the loading errors
  const { data: profileData, error: profileError, mutate } = useSWR(
    user ? '/auth/profile/' : null, fetcher, { revalidateOnFocus: false }
  );
  const { data: topics, error: topicsError } = useSWR(user ? '/topics/' : null, fetcher);
  const { data: examsData } = useSWR(user ? '/exams/' : null, fetcher);

  // Effect to populate the form when profile data loads from the API
  useEffect(() => {
    if (profileData) {
      setFormData(prev => ({
        ...prev,
        qualifications: profileData.qualifications || '',
        date_of_birth: profileData.date_of_birth || '',
        place: profileData.place || '',
        preferred_topics_ids: profileData.preferred_topics?.map((t: any) => t.id) || [],
        preferred_exams_ids: profileData.preferred_exams?.map((e: any) => e.id) || [],
        preferred_difficulty: profileData.preferred_difficulty || '',
      }));
      // The profile_photo URL from the API is now absolute, so we can use it directly
      if (profileData.profile_photo) {
        setPreview(`${profileData.profile_photo}?t=${new Date().getTime()}`);
      }
    }
  }, [profileData]);

  // Redirect if user is not logged in after the initial check
  useEffect(() => {
    if (!isContextLoading && !user) {
      router.push('/login');
    }
  }, [user, isContextLoading, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB.');
        return;
      }
      setFormData({ ...formData, profile_photo_upload: file });
      setPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setIsSubmitting(true);
    const data = new FormData();

    // Append all form data for submission
    if (formData.profile_photo_upload) data.append('profile_photo', formData.profile_photo_upload);
    if (formData.qualifications) data.append('qualifications', formData.qualifications);
    if (formData.date_of_birth) data.append('date_of_birth', formData.date_of_birth);
    if (formData.place) data.append('place', formData.place);
    if (formData.preferred_difficulty) data.append('preferred_difficulty', formData.preferred_difficulty);
    formData.preferred_topics_ids.forEach(id => data.append('preferred_topics_ids', id.toString()));
    formData.preferred_exams_ids.forEach(id => data.append('preferred_exams_ids', id.toString()));
    
    try {
      // CORRECTED: Use the apiClient for the PATCH request
      const response = await apiClient.patch('/auth/profile/', data);
      setSuccess('Profile updated successfully!');
      mutate(response.data, false); // Revalidate SWR cache with new data
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Failed to update profile.';
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show a loading spinner while the initial user session or data is being checked
  if (isContextLoading || (!profileData && !profileError)) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>;
  }

  return (
    // THE VISUAL DESIGN REMAINS UNCHANGED, AS REQUESTED
    <Box className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
      <Card className="shadow-lg bg-white max-w-2xl w-full">
        <CardContent className="p-8">
          <Typography variant="h4" className="text-gray-800 font-bold mb-6 flex items-center justify-center">
            <PersonIcon className="text-blue-600 mr-4 text-3xl" />
            Profile
          </Typography>
          
          {profileError && <Alert severity="error" className="mb-4">Failed to load profile data.</Alert>}
          {topicsError && <Alert severity="error" className="mb-4">Failed to load topics.</Alert>}
          {error && <Alert severity="error" className="mb-4">{error}</Alert>}
          {success && <Alert severity="success" className="mb-4">{success}</Alert>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Avatar src={preview || undefined} alt={user?.username} sx={{ width: 120, height: 120 }} />
                <Button variant="contained" component="label">
                  Upload Photo
                  <Input type="file" hidden onChange={handleFileChange} inputProps={{ accept: 'image/*' }} />
                </Button>
              </Grid>

              <Grid item xs={12}>
                <TextField label="Qualifications" variant="outlined" fullWidth value={formData.qualifications} onChange={(e) => setFormData({ ...formData, qualifications: e.target.value })} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Date of Birth" type="date" variant="outlined" fullWidth value={formData.date_of_birth} onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Place" variant="outlined" fullWidth value={formData.place} onChange={(e) => setFormData({ ...formData, place: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>My Focus Exams (Select up to 3)</InputLabel>
                  <Select
                    multiple value={formData.preferred_exams_ids}
                    onChange={(e) => {
                      const value = e.target.value as number[];
                      if (value.length <= 3) setFormData({ ...formData, preferred_exams_ids: value });
                    }}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {examsData?.flatMap((c: any) => c.exams).filter((e: any) => selected.includes(e.id)).map((e: any) => <Chip key={e.id} label={e.name} />)}
                      </Box>
                    )}
                  >
                    {examsData?.map((category: any) => (
                      category.exams.map((exam: any) => <MenuItem key={exam.id} value={exam.id}>{exam.name} ({exam.year})</MenuItem>)
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Preferred Topics</InputLabel>
                  <Select
                    multiple value={formData.preferred_topics_ids}
                    onChange={(e) => setFormData({ ...formData, preferred_topics_ids: e.target.value as number[] })}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {topics?.filter((t: any) => selected.includes(t.id)).map((t: any) => <Chip key={t.id} label={t.name} />)}
                      </Box>
                    )}
                  >
                    {topics?.map((topic: any) => <MenuItem key={topic.id} value={topic.id}>{topic.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Preferred Difficulty</InputLabel>
                  <Select value={formData.preferred_difficulty} onChange={(e) => setFormData({ ...formData, preferred_difficulty: e.target.value as string })}>
                    <MenuItem value=""><em>None</em></MenuItem>
                    <MenuItem value="easy">Easy</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="hard">Hard</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button type="submit" variant="contained" fullWidth disabled={isSubmitting} sx={{ mt: 2, py: 1.5 }}>
                  {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Save Profile'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}