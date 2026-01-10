import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  Button,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';

export default function Attendance() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const params = {};
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const response = await axios.get('/api/attendance/logs', { params });
      setLogs(response.data.logs);
    } catch (error) {
      console.error('Failed to fetch attendance logs:', error);
      setError('Failed to load attendance logs');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const params = { format: 'csv' };
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const response = await axios.get('/api/attendance/report', {
        params,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance-report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export report:', error);
      setError('Failed to export report');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Attendance Logs</Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
        >
          Export CSV
        </Button>
      </Box>

      <Box display="flex" gap={2} sx={{ mb: 3 }}>
        <TextField
          label="Date From"
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Date To"
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="outlined" onClick={fetchLogs}>
          Filter
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Staff Name</TableCell>
              <TableCell>Event</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Clock In</TableCell>
              <TableCell>Clock Out</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.user_name}</TableCell>
                <TableCell>{log.event_title}</TableCell>
                <TableCell>
                  {format(new Date(log.event_date), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  {log.clock_in
                    ? format(new Date(log.clock_in), 'HH:mm:ss')
                    : '-'}
                </TableCell>
                <TableCell>
                  {log.clock_out
                    ? format(new Date(log.clock_out), 'HH:mm:ss')
                    : '-'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={log.status}
                    color={log.status === 'on_duty' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
