'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Button,
  Stack,
  Avatar,
  Paper,
  Divider,
  Tabs,
  Tab,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
  CardContent,
  IconButton,
  InputAdornment,
} from '@mui/material';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import PhoneIcon from '@mui/icons-material/Phone';
import LanguageIcon from '@mui/icons-material/Language';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import QuizIcon from '@mui/icons-material/Quiz';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';
import { apiErrorMessage, suggestUsername } from '@/lib/auth';

interface PortalProps {
  slug: string;
  initialInstitute: any;
}

export default function InstituteStudentPortalClient({ slug, initialInstitute }: PortalProps) {
  const { user, profile, login, refreshProfile, isLoading: authLoading } = useAppContext();
  const [mounted, setMounted] = useState(false);

  const [portalData, setPortalData] = useState<any>(null);
  const [loadingPortal, setLoadingPortal] = useState(true);
  const [portalTab, setPortalTab] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auth box state for unauthenticated students
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');
  const [joinStatusMsg, setJoinStatusMsg] = useState('');
  const [joinSubmitting, setJoinSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Practice / Test mode state
  const [selectedTopicId, setSelectedTopicId] = useState<number | 'all'>('all');
  const [testActive, setTestActive] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [testSubmitting, setTestSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const inst = portalData?.institute || initialInstitute;
  const primaryColor = inst?.primary_color || '#0D47A1';
  const accentColor = inst?.accent_color || '#F59E0B';

  const fetchPortal = useCallback(async () => {
    setLoadingPortal(true);
    try {
      const res = await apiClient.get(`/institute/public/portal/${slug}/`);
      setPortalData(res.data);
    } catch (err) {
      console.error('Error loading institute portal:', err);
    } finally {
      setLoadingPortal(false);
    }
  }, [slug]);

  useEffect(() => {
    if (!authLoading) {
      fetchPortal();
    }
  }, [authLoading, user, fetchPortal]);

  const membershipStatus: string = portalData?.membership_status || 'anonymous';
  const topics: any[] = portalData?.topics || [];
  const questions: any[] = portalData?.questions || [];
  const notes: any[] = portalData?.notes || [];
  const messages: any[] = portalData?.messages || [];
  const leaderboard: any[] = portalData?.leaderboard || [];

  const filteredQuestions = useMemo(() => {
    if (selectedTopicId === 'all') return questions;
    return questions.filter((q) => Number(q.topic) === Number(selectedTopicId));
  }, [questions, selectedTopicId]);

  const handleRequestJoin = async (instituteId?: number) => {
    const targetId = instituteId || inst?.id;
    if (!targetId) return;
    setJoinSubmitting(true);
    setJoinStatusMsg('');
    try {
      await apiClient.post('/institute-join-request/', { institute: targetId });
      setJoinStatusMsg(`Join request sent to ${inst.name}! Once approved by the admin, you will get full access to academy tests.`);
      await refreshProfile();
      await fetchPortal();
    } catch (err: any) {
      const msg = apiErrorMessage(err, 'Could not send join request.');
      setJoinStatusMsg(msg);
      await fetchPortal();
    } finally {
      setJoinSubmitting(false);
    }
  };

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setAuthError('Please enter your username/email and password.');
      return;
    }
    setAuthSubmitting(true);
    setAuthError('');
    try {
      const res = await apiClient.post('/auth/token/', {
        username: username.trim(),
        password,
      });
      const { access, refresh } = res.data;
      const prof = await login(access, refresh);
      if (prof && !prof.institute && !prof.is_owner && inst?.id) {
        try {
          await apiClient.post('/institute-join-request/', { institute: inst.id });
          setJoinStatusMsg(`Logged in and sent a request to join ${inst.name}!`);
        } catch {
          // ignore if already pending
        }
      }
      await fetchPortal();
    } catch (err: any) {
      setAuthError(apiErrorMessage(err, 'Invalid username or password.'));
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleStudentRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) {
      setAuthError('Please fill in your full name, email, and password.');
      return;
    }
    if (password.length < 8) {
      setAuthError('Password must be at least 8 characters.');
      return;
    }
    const finalUsername = (username.trim() || suggestUsername(fullName, email)).toLowerCase();
    setAuthSubmitting(true);
    setAuthError('');
    try {
      const res = await apiClient.post('/auth/register/', {
        full_name: fullName.trim(),
        username: finalUsername,
        email: email.trim(),
        password,
        phone_number: phone.trim(),
      });
      let access = res.data?.access;
      let refresh = res.data?.refresh;
      if (!access || !refresh) {
        const tokenRes = await apiClient.post('/auth/token/', {
          username: finalUsername,
          password,
        });
        access = tokenRes.data.access;
        refresh = tokenRes.data.refresh;
      }
      await login(access, refresh);
      if (inst?.id) {
        try {
          await apiClient.post('/institute-join-request/', { institute: inst.id });
          setJoinStatusMsg(`Welcome! Your account is created and your request to join ${inst.name} has been sent to the admin.`);
        } catch {
          // ignore
        }
      }
      await fetchPortal();
    } catch (err: any) {
      setAuthError(apiErrorMessage(err, 'Could not create student account. Please check your details.'));
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credential: string) => {
    setAuthError('');
    setAuthSubmitting(true);
    try {
      const response = await apiClient.post('/auth/google/', { credential });
      const { access, refresh } = response.data;
      const prof = await login(access, refresh);
      if (prof && !prof.institute && !prof.is_owner && inst?.id) {
        try {
          await apiClient.post('/institute-join-request/', { institute: inst.id });
          setJoinStatusMsg(`Signed in with Google! Your request to join ${inst.name} has been sent.`);
        } catch {
          // ignore if already requested or joined
        }
      }
      await refreshProfile();
      await fetchPortal();
    } catch (err: any) {
      setAuthError(apiErrorMessage(err, 'Google Sign-In failed. Please try again or use username/password.'));
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleStartTest = () => {
    setAnswers({});
    setTestResult(null);
    setTestActive(true);
  };

  const handleSubmitTest = async () => {
    if (!filteredQuestions.length) return;
    setTestSubmitting(true);
    try {
      const questionIds = filteredQuestions.map((q) => q.id);
      const formattedAnswers: Record<string, string> = {};
      Object.entries(answers).forEach(([qId, letter]) => {
        formattedAnswers[String(qId)] = letter;
      });
      const res = await apiClient.post('/submit-exam/', {
        question_ids: questionIds,
        answers: formattedAnswers,
        shuffle: false,
      });
      setTestResult(res.data?.results || {
        score: 0,
        total: questionIds.length,
        correct: 0,
        wrong: 0,
        unanswered: questionIds.length,
      });
      await fetchPortal();
    } catch (err) {
      alert('Failed to submit test answers. Please try again.');
    } finally {
      setTestSubmitting(false);
    }
  };

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/institute/${slug}`
    : `https://www.kpscmaster.in/institute/${slug}`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  if (!mounted) {
    return (
      <Box sx={{ maxWidth: 1040, mx: 'auto', py: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <CircularProgress sx={{ color: primaryColor }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1040, mx: 'auto', pb: 8 }}>
      {/* Branded Hero Header */}
      <Paper
        elevation={0}
        sx={{
          mb: 3.5,
          p: { xs: 3, md: 4.5 },
          borderRadius: '24px',
          background: `linear-gradient(145deg, ${primaryColor} 0%, #091E42 100%)`,
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
          border: `1.5px solid rgba(245, 158, 11, 0.35)`,
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Avatar
              src={inst.logo || ''}
              alt={inst.name}
              variant="rounded"
              sx={{
                width: 96,
                height: 96,
                borderRadius: '20px',
                bgcolor: 'rgba(255,255,255,0.12)',
                border: `2px solid ${accentColor}`,
                boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
              }}
            >
              <SchoolIcon sx={{ fontSize: 48 }} />
            </Avatar>
            <Box>
              <Chip
                label="OFFICIAL ACADEMY PORTAL"
                size="small"
                sx={{
                  bgcolor: accentColor,
                  color: '#091E42',
                  fontWeight: 900,
                  fontSize: '0.7rem',
                  letterSpacing: '0.08em',
                  mb: 1,
                }}
              />
              <Typography
                sx={{
                  fontFamily: "'Cabinet Grotesk', sans-serif",
                  fontWeight: 900,
                  fontSize: { xs: '1.9rem', md: '2.5rem' },
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}
              >
                {inst.name}
              </Typography>
              {inst.tagline && (
                <Typography sx={{ mt: 0.75, color: 'rgba(255,255,255,0.9)', fontWeight: 600, fontSize: '1rem' }}>
                  {inst.tagline}
                </Typography>
              )}
              <Stack direction="row" spacing={1.5} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
                <Chip
                  label={`${inst.student_count ?? leaderboard.length} Students`}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: '#fff', fontWeight: 700 }}
                />
                <Chip
                  label={`${inst.question_count ?? questions.length} Practice MCQs`}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: '#fff', fontWeight: 700 }}
                />
                <Chip
                  label={`${inst.topic_count ?? topics.length} Test Topics`}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: '#fff', fontWeight: 700 }}
                />
              </Stack>
            </Box>
          </Stack>

          <Stack direction={{ xs: 'row', md: 'column' }} spacing={1.25} flexWrap="wrap">
            <Button
              variant="outlined"
              size="small"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyLink}
              sx={{
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.4)',
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: '10px',
              }}
            >
              {copiedLink ? 'Link Copied!' : 'Copy Student Link'}
            </Button>
            {membershipStatus === 'owner' ? (
              <Link href="/institute/dashboard" style={{ textDecoration: 'none' }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AdminPanelSettingsIcon />}
                  sx={{
                    bgcolor: accentColor,
                    color: '#091E42',
                    fontWeight: 800,
                    textTransform: 'none',
                    borderRadius: '10px',
                    '&:hover': { bgcolor: '#fbbf24' },
                  }}
                >
                  Open Admin Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login?tab=1" style={{ textDecoration: 'none' }}>
                <Button
                  variant="text"
                  size="small"
                  startIcon={<AdminPanelSettingsIcon />}
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    textTransform: 'none',
                    fontWeight: 700,
                  }}
                >
                  Academy Admin Login
                </Button>
              </Link>
            )}
          </Stack>
        </Stack>
      </Paper>

      {joinStatusMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '14px', fontWeight: 600 }}>
          {joinStatusMsg}
        </Alert>
      )}

      {/* Unauthenticated Student Login / Register Section */}
      {!authLoading && !user && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 4 },
            mb: 4,
            borderRadius: '22px',
            border: '2px solid',
            borderColor: primaryColor,
          }}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.05fr 0.95fr' }, gap: 4, alignItems: 'center' }}>
            <Box>
              <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: primaryColor, textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1 }}>
                Student Portal Access
              </Typography>
              <Typography sx={{ fontFamily: "'Cabinet Grotesk', sans-serif", fontWeight: 900, fontSize: { xs: '1.5rem', md: '1.85rem' }, mb: 1.5 }}>
                Log in or Join {inst.name}
              </Typography>
              <Typography sx={{ color: 'text.secondary', mb: 2.5, lineHeight: 1.6 }}>
                Sign in with your student account or create a new account below. Once you sign in here, your join request is automatically sent to <strong>{inst.name}</strong> so you can attempt academy tests, view study notes, and compete on the live {inst.name} leaderboard.
              </Typography>
              <Stack spacing={1.25}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <CheckCircleIcon sx={{ color: primaryColor, fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Exclusive Mock Tests & Topic MCQs curated by {inst.name}</Typography>
                </Stack>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <CheckCircleIcon sx={{ color: primaryColor, fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Live Batch Leaderboard, XP Ranking & Accuracy Analysis</Typography>
                </Stack>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <CheckCircleIcon sx={{ color: primaryColor, fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Instant Answer Key & Detailed Explanations</Typography>
                </Stack>
              </Stack>
            </Box>

            <Paper elevation={0} sx={{ p: 3, borderRadius: '18px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
              {/* Quick 1-Click Google OAuth */}
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1, textAlign: 'center' }}>
                  Quick 1-Click Access
                </Typography>
                <Box
                  sx={{
                    borderRadius: '12px',
                    border: '1.5px solid',
                    borderColor: 'divider',
                    py: 0.75,
                    px: 1,
                    bgcolor: 'background.paper',
                    display: 'flex',
                    justifyContent: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  }}
                >
                  <GoogleSignInButton
                    onSuccess={handleGoogleSuccess}
                    onError={(err) => setAuthError(err || 'Google Sign-In failed.')}
                    text="continue_with"
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                  <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                  <Typography variant="caption" sx={{ px: 1.5, color: 'text.secondary', fontWeight: 700, letterSpacing: '0.06em' }}>
                    OR CONTINUE WITH EMAIL
                  </Typography>
                  <Box sx={{ flex: 1, height: '1px', bgcolor: 'divider' }} />
                </Box>
              </Box>

              <Tabs
                value={authTab}
                onChange={(_, v) => {
                  setAuthTab(v);
                  setAuthError('');
                }}
                variant="fullWidth"
                sx={{ mb: 2.5 }}
              >
                <Tab value="login" label="Student Login" icon={<LoginIcon sx={{ fontSize: 18 }} />} iconPosition="start" sx={{ textTransform: 'none', fontWeight: 800 }} />
                <Tab value="register" label="New Student" icon={<PersonAddIcon sx={{ fontSize: 18 }} />} iconPosition="start" sx={{ textTransform: 'none', fontWeight: 800 }} />
              </Tabs>

              {authError && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
                  {authError}
                </Alert>
              )}

              {authTab === 'login' ? (
                <form onSubmit={handleStudentLogin}>
                  <Stack spacing={2}>
                    <TextField
                      label="Username or Email"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      fullWidth
                      required
                      size="medium"
                    />
                    <TextField
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      fullWidth
                      required
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={authSubmitting}
                      sx={{
                        py: 1.4,
                        fontWeight: 800,
                        textTransform: 'none',
                        borderRadius: '12px',
                        bgcolor: primaryColor,
                        '&:hover': { bgcolor: '#091E42' },
                      }}
                    >
                      {authSubmitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : `Login & Enter ${inst.name}`}
                    </Button>
                  </Stack>
                </form>
              ) : (
                <form onSubmit={handleStudentRegister}>
                  <Stack spacing={1.75}>
                    <TextField
                      label="Full Name"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (!username) setUsername(suggestUsername(e.target.value, email));
                      }}
                      fullWidth
                      required
                      size="small"
                    />
                    <TextField
                      label="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      fullWidth
                      required
                      size="small"
                    />
                    <TextField
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      fullWidth
                      required
                      size="small"
                    />
                    <TextField
                      label="Mobile Number (Optional)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      fullWidth
                      size="small"
                    />
                    <TextField
                      label="Create Password (min 8 chars)"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      fullWidth
                      required
                      size="small"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={authSubmitting}
                      sx={{
                        py: 1.4,
                        fontWeight: 800,
                        textTransform: 'none',
                        borderRadius: '12px',
                        bgcolor: primaryColor,
                        '&:hover': { bgcolor: '#091E42' },
                      }}
                    >
                      {authSubmitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : `Register & Request to Join ${inst.name}`}
                    </Button>
                  </Stack>
                </form>
              )}
            </Paper>
          </Box>
        </Paper>
      )}

      {/* Logged-in Student Membership Status Banner */}
      {!authLoading && user && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3.5,
            borderRadius: '18px',
            border: '1.5px solid',
            borderColor:
              membershipStatus === 'member' || membershipStatus === 'owner'
                ? 'success.main'
                : membershipStatus === 'pending'
                ? 'warning.main'
                : 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
            <Stack direction="row" spacing={1.5} alignItems="center">
              {membershipStatus === 'member' || membershipStatus === 'owner' ? (
                <CheckCircleIcon color="success" sx={{ fontSize: 32 }} />
              ) : (
                <HourglassTopIcon color="warning" sx={{ fontSize: 32 }} />
              )}
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: '1.05rem' }}>
                  {membershipStatus === 'owner' && `You are logged in as the ${inst.name} Admin`}
                  {membershipStatus === 'member' && `Welcome, ${user.username}! You are an enrolled student of ${inst.name}.`}
                  {membershipStatus === 'pending' && `Join Request Pending Approval`}
                  {membershipStatus === 'none' && `Join ${inst.name} to unlock academy tests & materials`}
                  {membershipStatus === 'other_institute' && `You are currently enrolled in another institute`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {membershipStatus === 'member' || membershipStatus === 'owner'
                    ? `You have full access to ${inst.name}'s test questions, study notes, and live batch leaderboard.`
                    : membershipStatus === 'pending'
                    ? `Your request to join ${inst.name} has been sent. Once the ${inst.name} Admin approves your request, academy tests will unlock automatically.`
                    : `Click "Request to Join ${inst.name}" so the academy admin can approve your student account.`}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1}>
              {membershipStatus === 'none' && (
                <Button
                  variant="contained"
                  onClick={() => handleRequestJoin()}
                  disabled={joinSubmitting}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 800,
                    borderRadius: '12px',
                    bgcolor: primaryColor,
                  }}
                >
                  {joinSubmitting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : `Request to Join ${inst.name}`}
                </Button>
              )}
              {membershipStatus === 'pending' && (
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchPortal}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '12px' }}
                >
                  Check Approval Status
                </Button>
              )}
            </Stack>
          </Stack>
        </Paper>
      )}

      {/* Main Portal Navigation Tabs */}
      <Paper elevation={0} sx={{ borderRadius: '20px', border: '1.5px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'action.hover', px: 2 }}>
          <Tabs
            value={portalTab}
            onChange={(_, v) => setPortalTab(v)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab
              icon={<QuizIcon sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label={`Academy Tests & Questions (${inst.question_count ?? questions.length})`}
              sx={{ textTransform: 'none', fontWeight: 800, py: 2 }}
            />
            <Tab
              icon={<EmojiEventsIcon sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label={`Batch Leaderboard (${leaderboard.length})`}
              sx={{ textTransform: 'none', fontWeight: 800, py: 2 }}
            />
            <Tab
              icon={<DescriptionIcon sx={{ fontSize: 20 }} />}
              iconPosition="start"
              label={`Notes & Info`}
              sx={{ textTransform: 'none', fontWeight: 800, py: 2 }}
            />
          </Tabs>
        </Box>

        <Box sx={{ p: { xs: 2.5, md: 4 } }}>
          {loadingPortal ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* TAB 0: ACADEMY TESTS & QUESTIONS */}
              {portalTab === 0 && (
                <Box>
                  {/* Topics Filter Pills */}
                  {topics.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.25, color: 'text.secondary' }}>
                        SELECT TOPIC / TEST SECTION
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip
                          label={`All Topics (${questions.length})`}
                          clickable
                          onClick={() => {
                            setSelectedTopicId('all');
                            setTestActive(false);
                            setTestResult(null);
                          }}
                          sx={{
                            fontWeight: 800,
                            bgcolor: selectedTopicId === 'all' ? primaryColor : undefined,
                            color: selectedTopicId === 'all' ? '#fff' : undefined,
                          }}
                        />
                        {topics.map((t: any) => (
                          <Chip
                            key={t.id}
                            label={`${t.name} (${t.question_count || 0})`}
                            clickable
                            onClick={() => {
                              setSelectedTopicId(t.id);
                              setTestActive(false);
                              setTestResult(null);
                            }}
                            sx={{
                              fontWeight: 700,
                              bgcolor: selectedTopicId === t.id ? primaryColor : undefined,
                              color: selectedTopicId === t.id ? '#fff' : undefined,
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {inst.allow_student_tests === false && membershipStatus !== 'owner' ? (
                    <Alert severity="warning" sx={{ borderRadius: '14px' }}>
                      Online mock tests are currently closed by the academy admin. Please check back when the next scheduled test goes live!
                    </Alert>
                  ) : membershipStatus !== 'member' && membershipStatus !== 'owner' ? (
                    <Alert severity="info" sx={{ borderRadius: '14px' }}>
                      {user
                        ? `Once your membership in ${inst.name} is approved by the academy admin, you can attempt all ${inst.question_count || 0} academy test questions right here.`
                        : `Please log in or register above and join ${inst.name} to start attempting academy tests.`}
                    </Alert>
                  ) : filteredQuestions.length === 0 ? (
                    <Alert severity="info" sx={{ borderRadius: '14px' }}>
                      No questions have been published in this topic yet. Check back soon!
                    </Alert>
                  ) : !testActive ? (
                    <Card variant="outlined" sx={{ borderRadius: '18px', p: 1 }}>
                      <CardContent>
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 900 }}>
                              {selectedTopicId === 'all'
                                ? `${inst.name} — Full Academy Practice Test`
                                : topics.find((t) => t.id === selectedTopicId)?.name || 'Topic Test'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {filteredQuestions.length} Questions • PSC Marking (+1 for Correct, -0.33 for Wrong) • Results recorded on {inst.name} Leaderboard
                            </Typography>
                          </Box>
                          <Button
                            variant="contained"
                            size="large"
                            startIcon={<PlayArrowIcon />}
                            onClick={handleStartTest}
                            sx={{
                              bgcolor: primaryColor,
                              fontWeight: 800,
                              textTransform: 'none',
                              borderRadius: '12px',
                              px: 3.5,
                            }}
                          >
                            Start Test Now
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  ) : (
                    <Box>
                      {testResult && (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 3,
                            mb: 3,
                            borderRadius: '16px',
                            bgcolor: 'rgba(46, 139, 87, 0.08)',
                            border: '1.5px solid #2E8B57',
                          }}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
                            Test Submitted! Score: {testResult.score} / {testResult.total}
                          </Typography>
                          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                            <Chip label={`Correct: ${testResult.correct}`} color="success" sx={{ fontWeight: 800 }} />
                            <Chip label={`Wrong: ${testResult.wrong}`} color="error" sx={{ fontWeight: 800 }} />
                            <Chip label={`Unanswered: ${testResult.unanswered}`} sx={{ fontWeight: 800 }} />
                            <Chip
                              label={`Accuracy: ${
                                testResult.correct + testResult.wrong > 0
                                  ? Math.round((testResult.correct / (testResult.correct + testResult.wrong)) * 100)
                                  : 0
                              }%`}
                              color="primary"
                              sx={{ fontWeight: 800 }}
                            />
                          </Stack>
                        </Paper>
                      )}

                      <Stack spacing={2.5}>
                        {filteredQuestions.map((q: any, idx: number) => {
                          const selected = answers[q.id] || '';
                          const isSubmitted = Boolean(testResult);
                          return (
                            <Paper
                              key={q.id}
                              elevation={0}
                              sx={{
                                p: 2.5,
                                borderRadius: '16px',
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                            >
                              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                <Chip label={`Q${idx + 1}`} size="small" sx={{ fontWeight: 800 }} />
                                {q.topic_name && <Chip label={q.topic_name} size="small" variant="outlined" />}
                              </Stack>
                              <Typography sx={{ fontWeight: 700, fontSize: '1.02rem', mb: 2 }}>
                                {q.question_text || q.text}
                              </Typography>
                              <RadioGroup
                                value={selected}
                                onChange={(e) => {
                                  if (!isSubmitted) {
                                    setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }));
                                  }
                                }}
                              >
                                {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                                  const optText = q.options?.[optKey] || q[`option_${optKey.toLowerCase()}`] || '';
                                  const isCorrectOpt = isSubmitted && q.correct_answer === optKey;
                                  const isWrongSelected = isSubmitted && selected === optKey && q.correct_answer !== optKey;
                                  return (
                                    <FormControlLabel
                                      key={optKey}
                                      value={optKey}
                                      control={<Radio size="small" />}
                                      label={`${optKey}. ${optText}`}
                                      sx={{
                                        mb: 0.75,
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: '10px',
                                        bgcolor: isCorrectOpt
                                          ? 'rgba(46, 139, 87, 0.14)'
                                          : isWrongSelected
                                          ? 'rgba(239, 68, 68, 0.14)'
                                          : 'transparent',
                                      }}
                                    />
                                  );
                                })}
                              </RadioGroup>
                              {isSubmitted && (
                                <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px dashed', borderColor: 'divider' }}>
                                  <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>
                                    Correct Answer: Option {q.correct_answer}
                                  </Typography>
                                  {q.explanation && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                      {q.explanation}
                                    </Typography>
                                  )}
                                </Box>
                              )}
                            </Paper>
                          );
                        })}
                      </Stack>

                      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setTestActive(false);
                            setTestResult(null);
                          }}
                          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '12px' }}
                        >
                          Back
                        </Button>
                        {!testResult && (
                          <Button
                            variant="contained"
                            size="large"
                            disabled={testSubmitting}
                            onClick={handleSubmitTest}
                            sx={{
                              bgcolor: primaryColor,
                              fontWeight: 800,
                              textTransform: 'none',
                              borderRadius: '12px',
                              px: 4,
                            }}
                          >
                            {testSubmitting ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Submit Test & View Score'}
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  )}
                </Box>
              )}

              {/* TAB 1: ACADEMY LEADERBOARD */}
              {portalTab === 1 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, mb: 0.5 }}>
                    {inst.name} — Live Student Leaderboard
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                    Ranked by Academy Test Score, Net Marks, Accuracy %, and XP.
                  </Typography>

                  {inst.show_leaderboard === false && membershipStatus !== 'owner' ? (
                    <Alert severity="info" sx={{ borderRadius: '14px' }}>
                      The academy admin has currently set the student leaderboard to private. Test scores are tracked directly by the academy.
                    </Alert>
                  ) : leaderboard.length === 0 ? (
                    <Alert severity="info" sx={{ borderRadius: '14px' }}>
                      No students on the leaderboard yet. Join {inst.name} and complete a test to claim Rank #1!
                    </Alert>
                  ) : (
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '16px' }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 800 }}>Rank</TableCell>
                            <TableCell sx={{ fontWeight: 800 }}>Student</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800 }}>Academy Score</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800 }}>Questions Solved</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800 }}>Accuracy</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800 }}>Total XP</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {leaderboard.map((row: any) => (
                            <TableRow key={row.username} hover>
                              <TableCell sx={{ fontWeight: 900 }}>
                                <Chip
                                  label={`#${row.rank}`}
                                  size="small"
                                  sx={{
                                    fontWeight: 900,
                                    bgcolor:
                                      row.rank === 1
                                        ? '#F59E0B'
                                        : row.rank === 2
                                        ? '#94A3B8'
                                        : row.rank === 3
                                        ? '#D97706'
                                        : 'action.selected',
                                    color: row.rank <= 3 ? '#fff' : 'text.primary',
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                  <Avatar src={row.avatar || ''} sx={{ width: 34, height: 34 }} />
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                      {row.full_name || row.username}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      @{row.username}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 800 }}>
                                {row.academy_score ?? 0} pts
                              </TableCell>
                              <TableCell align="right">
                                {row.total_attempted ?? 0} ({row.total_correct ?? 0} correct)
                              </TableCell>
                              <TableCell align="right">
                                <Chip
                                  label={`${row.accuracy ?? 0}%`}
                                  size="small"
                                  color={(row.accuracy ?? 0) >= 70 ? 'success' : (row.accuracy ?? 0) >= 40 ? 'warning' : 'default'}
                                  variant="outlined"
                                  sx={{ fontWeight: 800 }}
                                />
                              </TableCell>
                              <TableCell align="right" sx={{ fontWeight: 800, color: primaryColor }}>
                                {row.xp ?? 0} XP
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              )}

              {/* TAB 2: NOTES, ANNOUNCEMENTS & CONTACT */}
              {portalTab === 2 && (
                <Stack spacing={3}>
                  {notes.length > 0 && (
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
                        Study Materials & PDFs
                      </Typography>
                      <Stack spacing={1.5}>
                        {notes.map((note: any) => (
                          <Paper key={note.id} variant="outlined" sx={{ p: 2, borderRadius: '14px' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Box>
                                <Typography sx={{ fontWeight: 800 }}>{note.title}</Typography>
                                {note.description && (
                                  <Typography variant="body2" color="text.secondary">{note.description}</Typography>
                                )}
                              </Box>
                              {note.file_url && (
                                <Button
                                  component="a"
                                  href={note.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  variant="outlined"
                                  size="small"
                                  sx={{ textTransform: 'none', fontWeight: 700 }}
                                >
                                  Download PDF
                                </Button>
                              )}
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {messages.length > 0 && (
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
                        Academy Announcements
                      </Typography>
                      <Stack spacing={1.5}>
                        {messages.map((m: any) => (
                          <Paper key={m.id} variant="outlined" sx={{ p: 2, borderRadius: '14px' }}>
                            <Typography sx={{ fontWeight: 800 }}>{m.subject}</Typography>
                            <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-line' }}>{m.body}</Typography>
                          </Paper>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  <Divider />

                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                    <Stack spacing={1.25}>
                      <Typography sx={{ fontWeight: 800 }}>Academy Contact</Typography>
                      {inst.contact_email && (
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <ContactMailIcon sx={{ color: primaryColor }} />
                          <Typography>{inst.contact_email}</Typography>
                        </Stack>
                      )}
                      {inst.phone && (
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <PhoneIcon sx={{ color: primaryColor }} />
                          <Typography>{inst.phone}</Typography>
                        </Stack>
                      )}
                      {inst.website && (
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <LanguageIcon sx={{ color: primaryColor }} />
                          <a href={inst.website} target="_blank" rel="noopener noreferrer" style={{ color: primaryColor, fontWeight: 700 }}>
                            {inst.website}
                          </a>
                        </Stack>
                      )}
                    </Stack>
                    <Stack spacing={1.25}>
                      <Typography sx={{ fontWeight: 800 }}>Location</Typography>
                      {inst.address ? (
                        <Stack direction="row" spacing={1.5} alignItems="flex-start">
                          <LocationOnIcon sx={{ color: primaryColor, mt: 0.4 }} />
                          <Typography sx={{ whiteSpace: 'pre-line' }}>{inst.address}</Typography>
                        </Stack>
                      ) : (
                        <Typography color="text.secondary">Online & Kerala PSC Coaching Platform</Typography>
                      )}
                    </Stack>
                  </Box>
                </Stack>
              )}
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

