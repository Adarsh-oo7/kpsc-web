'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Button,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FlagIcon from '@mui/icons-material/Flag';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReplayIcon from '@mui/icons-material/Replay';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import apiClient from '@/lib/apiClient';

interface Module {
  name: string;
  target_day: number;
}

interface Subject {
  subject: string;
  weightage: number;
  modules: Module[];
}

interface Milestone {
  week: number;
  goal: string;
}

interface MasterPlan {
  id: number;
  exam_id: number;
  exam_name: string;
  title: string;
  description: string;
  estimated_days: number;
  syllabus_structure: Subject[];
  weekly_milestones: Milestone[];
  mock_test_schedule: number[];
  revision_schedule: number[];
  pyq_schedule: number[];
}

interface MasterPlanRoadmapProps {
  examId?: number;
}

export default function MasterPlanRoadmap({ examId }: MasterPlanRoadmapProps) {
  const [plan, setPlan] = useState<MasterPlan | null>(null);
  const [completedModuleNames, setCompletedModuleNames] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    fetchPlanAndProgress();
  }, [examId]);

  const fetchPlanAndProgress = async () => {
    setLoading(true);
    try {
      const url = examId ? `/master-study-plan/${examId}/` : '/master-study-plan/';
      const res = await apiClient.get(url);
      setPlan(res.data);

      // Fetch user's progress against this exam roadmap
      try {
        const progRes = await apiClient.get(examId ? `/my-exam-progress/${examId}/` : '/my-exam-progress/');
        if (progRes.data && progRes.data.completed_topic_ids) {
          setCompletedModuleNames(progRes.data.completed_topic_ids || []);
        }
      } catch (err) {
        console.warn("User exam progress fetch failed or unauthenticated:", err);
      }
    } catch (err) {
      console.error("Failed to load master study plan:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleModule = async (moduleName: string) => {
    const updated = completedModuleNames.includes(moduleName)
      ? completedModuleNames.filter((n) => n !== moduleName)
      : [...completedModuleNames, moduleName];

    setCompletedModuleNames(updated);

    // Save to backend asynchronously
    try {
      setSaving(true);
      await apiClient.post(examId ? `/my-exam-progress/${examId}/` : '/my-exam-progress/', {
        completed_topic_ids: updated
      });
    } catch (err) {
      console.error("Failed to save progress update:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
        <CircularProgress size={32} sx={{ color: '#10B981', mb: 2 }} />
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Loading Exam Master Study Roadmap...</Typography>
      </Paper>
    );
  }

  if (!plan || !plan.syllabus_structure || plan.syllabus_structure.length === 0) {
    return (
      <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Official Syllabus Plan Available</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Exam roadmap is actively being mapped to syllabus modules. Try starting a mock test or practice quiz.
        </Typography>
      </Paper>
    );
  }

  // Calculate total modules and progress
  let totalModulesCount = 0;
  plan.syllabus_structure.forEach((s) => {
    totalModulesCount += (s.modules || []).length;
  });

  const completedCount = completedModuleNames.length;
  const progressPercent = totalModulesCount > 0 ? Math.round((completedCount / totalModulesCount) * 100) : 0;

  return (
    <Paper
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 5,
        border: '1px solid',
        borderColor: 'divider',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(145deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)'
            : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)'
      }}
    >
      {/* Header */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Chip
                label="Master Study Roadmap"
                icon={<AutoAwesomeIcon sx={{ fontSize: '0.9rem !important', color: '#10B981 !important' }} />}
                sx={{ bgcolor: 'rgba(16, 185, 129, 0.12)', color: '#10B981', fontWeight: 800, fontSize: '0.75rem' }}
              />
              <Chip
                label={`${plan.estimated_days} Days Target`}
                sx={{ bgcolor: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6', fontWeight: 800, fontSize: '0.75rem' }}
              />
            </Stack>
            <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: "'Outfit', sans-serif" }}>
              {plan.title}
            </Typography>
          </Box>

          <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
            <Typography variant="h4" sx={{ fontWeight: 900, color: '#10B981', fontFamily: "'JetBrains Mono', monospace" }}>
              {progressPercent}%
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              {completedCount} of {totalModulesCount} Modules Done {saving && '(Saving...)'}
            </Typography>
          </Box>
        </Stack>

        {/* Progress bar */}
        <Box sx={{ width: '100%' }}>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{
              height: 10,
              borderRadius: 5,
              bgcolor: 'action.hover',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #10B981 0%, #3B82F6 100%)',
                borderRadius: 5
              }
            }}
          />
        </Box>

        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
          {plan.description}
        </Typography>
      </Stack>

      <Divider sx={{ my: 3 }} />

      {/* Syllabus Modules Accordion */}
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, fontFamily: "'Outfit', sans-serif" }}>
        Syllabus Modules & Daily Targets
      </Typography>

      <Stack spacing={2}>
        {plan.syllabus_structure.map((subj, sIdx) => (
          <Accordion
            key={sIdx}
            defaultExpanded={sIdx === 0}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '16px !important',
              '&:before': { display: 'none' },
              boxShadow: 'none',
              bgcolor: 'background.paper',
              overflow: 'hidden'
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%', pr: 2 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '0.95rem' }}>
                  {subj.subject}
                </Typography>
                <Chip
                  label={`${subj.weightage} Marks`}
                  size="small"
                  sx={{ fontWeight: 800, bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}
                />
              </Stack>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0, pb: 2 }}>
              <Stack spacing={1}>
                {subj.modules.map((mod, mIdx) => {
                  const isChecked = completedModuleNames.includes(mod.name);
                  return (
                    <Paper
                      key={mIdx}
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        px: 2,
                        borderRadius: 3,
                        borderColor: isChecked ? 'rgba(16, 185, 129, 0.4)' : 'divider',
                        bgcolor: isChecked ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isChecked}
                            onChange={() => handleToggleModule(mod.name)}
                            sx={{ color: '#10B981', '&.Mui-checked': { color: '#10B981' } }}
                          />
                        }
                        label={
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: isChecked ? 700 : 500,
                              textDecoration: isChecked ? 'line-through' : 'none',
                              color: isChecked ? 'text.secondary' : 'text.primary'
                            }}
                          >
                            {mod.name}
                          </Typography>
                        }
                      />
                      <Chip
                        label={`Day ${mod.target_day}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', fontWeight: 700 }}
                      />
                    </Paper>
                  );
                })}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>

      {/* Weekly Milestones */}
      {plan.weekly_milestones && plan.weekly_milestones.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, fontFamily: "'Outfit', sans-serif" }}>
            Weekly Milestones
          </Typography>
          <Stack spacing={1.5}>
            {plan.weekly_milestones.map((m, idx) => (
              <Alert
                key={idx}
                icon={<FlagIcon sx={{ color: '#3B82F6' }} />}
                severity="info"
                sx={{
                  borderRadius: 3,
                  bgcolor: 'rgba(59, 130, 246, 0.06)',
                  color: 'text.primary',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  Week {m.week}: {m.goal}
                </Typography>
              </Alert>
            ))}
          </Stack>
        </Box>
      )}
    </Paper>
  );
}
