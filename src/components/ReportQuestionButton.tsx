'use client';

import { useState } from 'react';
import {
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, FormControl, FormLabel, RadioGroup,
  FormControlLabel, Radio, TextField, Snackbar, Alert, Box,
  Typography, Tooltip, CircularProgress,
} from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import apiClient from '@/lib/apiClient';

// ──────────────────────────────────────────────
// Report type options mirroring the backend model
// ──────────────────────────────────────────────
const REPORT_TYPES = [
  { value: 'wrong_answer',      label: '❌ Wrong answer marked as correct' },
  { value: 'question_error',   label: '📝 Question text has an error / typo' },
  { value: 'bad_options',      label: '🔤 Options are wrong, missing or duplicate' },
  { value: 'language_issue',   label: '🌐 Language issue (mixed Malayalam / English)' },
  { value: 'formatting_issue', label: '📐 Formatting / display problem' },
  { value: 'other',            label: '💬 Other issue (describe below)' },
] as const;

type ReportType = typeof REPORT_TYPES[number]['value'];

interface Props {
  questionId: number;
  questionText?: string;
}

export default function ReportQuestionButton({ questionId, questionText }: Props) {
  const [open, setOpen]           = useState(false);
  const [reportType, setReportType] = useState<ReportType>('wrong_answer');
  const [reason, setReason]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack]         = useState<{ open: boolean; severity: 'success' | 'error'; msg: string }>({
    open: false, severity: 'success', msg: '',
  });

  const handleOpen = (e: React.MouseEvent) => { e.stopPropagation(); setOpen(true); };

  const handleClose = () => {
    if (submitting) return;
    setOpen(false);
    setReportType('wrong_answer');
    setReason('');
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await apiClient.post('/reports/', {
        question: questionId,
        report_type: reportType,
        reason: reason.trim() || REPORT_TYPES.find(r => r.value === reportType)?.label || reportType,
      });
      setSnack({ open: true, severity: 'success', msg: 'Report submitted — our team will review and fix it.' });
      handleClose();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Could not submit report. Please try again.';
      setSnack({ open: true, severity: 'error', msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Flag Icon Button */}
      <Tooltip title="Report a problem with this question" placement="top">
        <IconButton
          onClick={handleOpen}
          size="small"
          aria-label="Report question"
          sx={{
            color: 'text.disabled',
            '&:hover': { color: '#EF4444', bgcolor: 'rgba(239,68,68,0.08)' },
            transition: 'all 0.2s ease',
            p: 0.5,
          }}
        >
          <FlagIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>

      {/* Report Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            border: '1px solid',
            borderColor: 'divider',
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FlagIcon sx={{ color: '#EF4444', fontSize: 20 }} />
            <Typography sx={{ fontWeight: 700, fontSize: '1rem' }}>Report a Problem</Typography>
          </Box>
          {questionText && (
            <Typography sx={{ fontSize: '0.72rem', color: 'text.secondary', mt: 0.5, lineHeight: 1.4, fontStyle: 'italic' }}>
              {questionText.length > 90 ? questionText.slice(0, 90) + '…' : questionText}
            </Typography>
          )}
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 2 }}>
          <FormControl component="fieldset" fullWidth>
            <FormLabel
              component="legend"
              sx={{ fontWeight: 600, fontSize: '0.875rem', mb: 1.5, color: 'text.primary' }}
            >
              What is the problem?
            </FormLabel>
            <RadioGroup value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)}>
              {REPORT_TYPES.map((rt) => (
                <FormControlLabel
                  key={rt.value}
                  value={rt.value}
                  control={
                    <Radio size="small" sx={{ color: '#EF4444', '&.Mui-checked': { color: '#EF4444' } }} />
                  }
                  label={
                    <Typography sx={{ fontSize: '0.875rem', color: 'text.primary', lineHeight: 1.4 }}>
                      {rt.label}
                    </Typography>
                  }
                  sx={{
                    mb: 0.5, mr: 0,
                    px: 1.5, py: 0.75,
                    borderRadius: '10px',
                    border: '1px solid',
                    borderColor: reportType === rt.value ? 'rgba(239,68,68,0.35)' : 'transparent',
                    bgcolor: reportType === rt.value ? 'rgba(239,68,68,0.05)' : 'transparent',
                    transition: 'all 0.15s ease',
                    '&:hover': { bgcolor: 'rgba(239,68,68,0.04)' },
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>

          <TextField
            label="Additional details (optional)"
            placeholder="Describe the specific issue in more detail..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: '10px', fontSize: '0.875rem' } }}
            inputProps={{ maxLength: 500 }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={handleClose}
            disabled={submitting}
            sx={{ textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            variant="contained"
            sx={{
              textTransform: 'none', fontWeight: 700, borderRadius: '10px', px: 3,
              bgcolor: '#EF4444', '&:hover': { bgcolor: '#DC2626' },
              '&.Mui-disabled': { bgcolor: 'rgba(239,68,68,0.4)', color: '#fff' },
            }}
            startIcon={submitting ? <CircularProgress size={14} color="inherit" /> : <FlagIcon />}
          >
            {submitting ? 'Submitting…' : 'Submit Report'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success / Error Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4500}
        onClose={() => setSnack(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          onClose={() => setSnack(s => ({ ...s, open: false }))}
          sx={{ borderRadius: '12px', fontWeight: 600 }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
