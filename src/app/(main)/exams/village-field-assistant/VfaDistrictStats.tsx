'use client';

import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { VFA_PHASES, vfaPhaseForDistrict } from '@/lib/vfaSchedule';

const DISTRICT_STATS = [
  { district: 'Thiruvananthapuram', applicants: '48,250', vacancies: '28' },
  { district: 'Kollam', applicants: '36,400', vacancies: '19' },
  { district: 'Pathanamthitta', applicants: '18,900', vacancies: '11' },
  { district: 'Alappuzha', applicants: '26,500', vacancies: '14' },
  { district: 'Kottayam', applicants: '22,100', vacancies: '12' },
  { district: 'Idukki', applicants: '—', vacancies: '—' },
  { district: 'Ernakulam', applicants: '31,800', vacancies: '22' },
  { district: 'Thrissur', applicants: '38,600', vacancies: '24' },
  { district: 'Palakkad', applicants: '42,100', vacancies: '31' },
  { district: 'Malappuram', applicants: '54,300', vacancies: '36' },
  { district: 'Kozhikode', applicants: '39,700', vacancies: '20' },
  { district: 'Wayanad', applicants: '—', vacancies: '—' },
  { district: 'Kannur', applicants: '—', vacancies: '—' },
  { district: 'Kasaragod', applicants: '—', vacancies: '—' },
];

const DATE_ORDER = VFA_PHASES.map((phase) => phase.date);

export default function VfaDistrictStats() {
  const rows = [...DISTRICT_STATS].sort((a, b) => {
    const dateA = vfaPhaseForDistrict(a.district)?.date || '';
    const dateB = vfaPhaseForDistrict(b.district)?.date || '';
    const dateDiff = DATE_ORDER.indexOf(dateA) - DATE_ORDER.indexOf(dateB);
    if (dateDiff !== 0) return dateDiff;
    return a.district.localeCompare(b.district);
  });

  return (
    <Paper sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 4, overflow: 'hidden' }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>District</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Exam date</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Est. Applicants</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Likely Vacancies</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const phase = vfaPhaseForDistrict(row.district);
              return (
                <TableRow key={row.district} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                  <TableCell sx={{ fontWeight: 600 }}>{row.district}</TableCell>
                  <TableCell sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#3B82F6', whiteSpace: 'nowrap' }}>
                    {phase?.shortLabel || 'TBA'}
                  </TableCell>
                  <TableCell sx={{ fontFamily: "'JetBrains Mono', monospace" }}>{row.applicants}</TableCell>
                  <TableCell sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: '#3B82F6' }}>{row.vacancies}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
