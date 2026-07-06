// app/(main)/exams/village-field-assistant/VfaDistrictStats.tsx
'use client';

import React from 'react';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Typography } from '@mui/material';

const DISTRICT_STATS = [
  { district: 'Thiruvananthapuram', applicants: '48,250', vacancies: '28' },
  { district: 'Kollam', applicants: '36,400', vacancies: '19' },
  { district: 'Pathanamthitta', applicants: '18,900', vacancies: '11' },
  { district: 'Alappuzha', applicants: '26,500', vacancies: '14' },
  { district: 'Kottayam', applicants: '22,100', vacancies: '12' },
  { district: 'Ernakulam', applicants: '31,800', vacancies: '22' },
  { district: 'Thrissur', applicants: '38,600', vacancies: '24' },
  { district: 'Palakkad', applicants: '42,100', vacancies: '31' },
  { district: 'Malappuram', applicants: '54,300', vacancies: '36' },
  { district: 'Kozhikode', applicants: '39,700', vacancies: '20' }
];

export default function VfaDistrictStats() {
  return (
    <Paper sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 4, overflow: 'hidden' }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>District</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Est. Applicants</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Likely Vacancies</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {DISTRICT_STATS.map((row, index) => (
              <TableRow key={index} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ fontWeight: 600 }}>{row.district}</TableCell>
                <TableCell sx={{ fontFamily: "'JetBrains Mono', monospace" }}>{row.applicants}</TableCell>
                <TableCell sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#3B82F6' }}>{row.vacancies}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
