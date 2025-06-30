'use client';

import { useState } from 'react';
import useSWR from 'swr';
import {
  Box, Typography, Button, CircularProgress, Alert, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack,
  Chip, IconButton, Tooltip
} from '@mui/material';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useAppContext } from '@/context/AppContext';
import apiClient from '@/lib/apiClient';

const initialFeeFormState = {
  amount: '',
  description: '',
  due_date: '',
  fee_type: 'tuition'
};

const initialPaymentFormState = {
  amount: '',
  payment_method: 'cash',
  notes: ''
};

export default function StudentFeesPage() {
    const { fetcher } = useAppContext();
    const router = useRouter();
    const params = useParams();
    const studentId = params?.studentId;

    // Fetch student details and fees
    const { data: student, error: studentError, isLoading: studentLoading } = useSWR(
        studentId ? `/institute/students/${studentId}/` : null, 
        fetcher
    );
    const { data: fees, error: feesError, isLoading: feesLoading, mutate: mutateFees } = useSWR(
        studentId ? `/institute/students/${studentId}/fees/` : null, 
        fetcher
    );

    const [feeDialogOpen, setFeeDialogOpen] = useState(false);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [selectedFeeId, setSelectedFeeId] = useState<number | null>(null);
    
    const [feeForm, setFeeForm] = useState(initialFeeFormState);
    const [paymentForm, setPaymentForm] = useState(initialPaymentFormState);
    
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleBackClick = () => {
        router.push('/institute/students');
    };

    const handleOpenFeeDialog = () => setFeeDialogOpen(true);
    const handleCloseFeeDialog = () => {
        setFeeDialogOpen(false);
        setFormError('');
        setFeeForm(initialFeeFormState);
    };

    const handleOpenPaymentDialog = (feeId: number) => {
        setSelectedFeeId(feeId);
        setPaymentDialogOpen(true);
    };
    const handleClosePaymentDialog = () => {
        setPaymentDialogOpen(false);
        setSelectedFeeId(null);
        setFormError('');
        setPaymentForm(initialPaymentFormState);
    };

    const handleFeeFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFeeForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handlePaymentFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPaymentForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCreateFee = async () => {
        setIsSubmitting(true);
        setFormError('');
        try {
            await apiClient.post(`/institute/students/${studentId}/fees/`, feeForm);
            mutateFees();
            handleCloseFeeDialog();
        } catch (err: any) {
            setFormError(err.response?.data?.error || 'Failed to create fee.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRecordPayment = async () => {
        setIsSubmitting(true);
        setFormError('');
        try {
            await apiClient.post(`/institute/fees/${selectedFeeId}/payments/`, paymentForm);
            mutateFees();
            handleClosePaymentDialog();
        } catch (err: any) {
            setFormError(err.response?.data?.error || 'Failed to record payment.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'success';
            case 'partial': return 'warning';
            case 'overdue': return 'error';
            default: return 'default';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    if (studentLoading) return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />;
    if (studentError) return <Alert severity="error">Failed to load student details.</Alert>;
    if (!student) return <Alert severity="error">Student not found.</Alert>;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <IconButton onClick={handleBackClick} sx={{ mr: 2, color: 'white' }}>
                    <ArrowBackIcon />
                </IconButton>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                        Fee Management
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'grey.300' }}>
                        {student.user.username} ({student.user.email})
                    </Typography>
                </Box>
                <Button 
                    variant="contained" 
                    onClick={handleOpenFeeDialog} 
                    startIcon={<AddIcon />}
                >
                    Add Fee
                </Button>
            </Box>

            {/* Fee Summary Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mb: 4 }}>
                <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                    <CardContent>
                        <Typography variant="h6">Total Fees</Typography>
                        <Typography variant="h4">
                            {formatCurrency(fees?.summary?.total_amount || 0)}
                        </Typography>
                    </CardContent>
                </Card>
                <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
                    <CardContent>
                        <Typography variant="h6">Paid</Typography>
                        <Typography variant="h4">
                            {formatCurrency(fees?.summary?.paid_amount || 0)}
                        </Typography>
                    </CardContent>
                </Card>
                <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
                    <CardContent>
                        <Typography variant="h6">Outstanding</Typography>
                        <Typography variant="h4">
                            {formatCurrency(fees?.summary?.outstanding_amount || 0)}
                        </Typography>
                    </CardContent>
                </Card>
            </Box>

            {/* Fees Table */}
            {feesLoading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />}
            {feesError && <Alert severity="error" sx={{ mb: 2 }}>Failed to load fees.</Alert>}
            
            <Paper sx={{ borderRadius: 4, bgcolor: 'background.paper' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Amount</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Due Date</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {fees?.fees?.map((fee: any) => (
                                <TableRow key={fee.id} hover>
                                    <TableCell>{fee.description}</TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={fee.fee_type} 
                                            size="small" 
                                            variant="outlined"
                                        />
                                    </TableCell>
                                    <TableCell>{formatCurrency(fee.amount)}</TableCell>
                                    <TableCell>
                                        {new Date(fee.due_date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={fee.status} 
                                            size="small" 
                                            color={getStatusColor(fee.status)}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Tooltip title="Record Payment">
                                            <IconButton 
                                                onClick={() => handleOpenPaymentDialog(fee.id)}
                                                size="small"
                                                disabled={fee.status === 'paid'}
                                            >
                                                <PaymentIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="View Receipts">
                                            <IconButton size="small">
                                                <ReceiptIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {fees?.fees?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            No fees found. Add the first fee for this student!
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Add Fee Dialog */}
            <Dialog open={feeDialogOpen} onClose={handleCloseFeeDialog} fullWidth maxWidth="sm">
                <DialogTitle>Add New Fee</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        {formError && <Alert severity="error">{formError}</Alert>}
                        <TextField 
                            name="description" 
                            label="Description" 
                            value={feeForm.description}
                            onChange={handleFeeFormChange} 
                            fullWidth 
                            autoFocus
                            required
                            placeholder="e.g., Tuition Fee - Term 1"
                        />
                        <TextField 
                            name="fee_type" 
                            label="Fee Type" 
                            select
                            SelectProps={{ native: true }}
                            value={feeForm.fee_type}
                            onChange={handleFeeFormChange} 
                            fullWidth 
                            required
                        >
                            <option value="tuition">Tuition</option>
                            <option value="examination">Examination</option>
                            <option value="library">Library</option>
                            <option value="sports">Sports</option>
                            <option value="transport">Transport</option>
                            <option value="other">Other</option>
                        </TextField>
                        <TextField 
                            name="amount" 
                            label="Amount" 
                            type="number"
                            value={feeForm.amount}
                            onChange={handleFeeFormChange} 
                            fullWidth 
                            required
                            InputProps={{ startAdornment: '₹' }}
                        />
                        <TextField 
                            name="due_date" 
                            label="Due Date" 
                            type="date"
                            value={feeForm.due_date}
                            onChange={handleFeeFormChange} 
                            fullWidth 
                            required
                            InputLabelProps={{ shrink: true }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleCloseFeeDialog}>Cancel</Button>
                    <Button 
                        onClick={handleCreateFee} 
                        variant="contained" 
                        disabled={isSubmitting || !feeForm.description || !feeForm.amount || !feeForm.due_date}
                    >
                        {isSubmitting ? <CircularProgress size={24} /> : 'Create Fee'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Record Payment Dialog */}
            <Dialog open={paymentDialogOpen} onClose={handleClosePaymentDialog} fullWidth maxWidth="sm">
                <DialogTitle>Record Payment</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        {formError && <Alert severity="error">{formError}</Alert>}
                        <TextField 
                            name="amount" 
                            label="Payment Amount" 
                            type="number"
                            value={paymentForm.amount}
                            onChange={handlePaymentFormChange} 
                            fullWidth 
                            autoFocus
                            required
                            InputProps={{ startAdornment: '₹' }}
                        />
                        <TextField 
                            name="payment_method" 
                            label="Payment Method" 
                            select
                            SelectProps={{ native: true }}
                            value={paymentForm.payment_method}
                            onChange={handlePaymentFormChange} 
                            fullWidth 
                            required
                        >
                            <option value="cash">Cash</option>
                            <option value="card">Card</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="upi">UPI</option>
                            <option value="cheque">Cheque</option>
                        </TextField>
                        <TextField 
                            name="notes" 
                            label="Notes" 
                            multiline
                            rows={3}
                            value={paymentForm.notes}
                            onChange={handlePaymentFormChange} 
                            fullWidth 
                            placeholder="Optional payment notes..."
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleClosePaymentDialog}>Cancel</Button>
                    <Button 
                        onClick={handleRecordPayment} 
                        variant="contained" 
                        disabled={isSubmitting || !paymentForm.amount}
                    >
                        {isSubmitting ? <CircularProgress size={24} /> : 'Record Payment'}
                    </Button>
                </DialogActions>
            </Dialog>
        </motion.div>
    );
}