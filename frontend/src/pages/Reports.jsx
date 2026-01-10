import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import axios from 'axios';

export default function Reports() {
  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const handleGenerateReport = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;

      const response = await axios.get('/api/attendance/report', { params });
      setReport(response.data.report);
    } catch (error) {
      console.error('Failed to generate report:', error);
      setError('Failed to generate report');
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Reports & Analytics
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="flex-end" sx={{ mb: 2 }}>
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
          <Button variant="contained" onClick={handleGenerateReport}>
            Generate Report
          </Button>
          {report.length > 0 && (
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
            >
              Export CSV
            </Button>
          )}
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        {loading && (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        )}

        {report.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Report Summary
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Records: {report.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Hours: {report.reduce((sum, r) => sum + (parseFloat(r.hours_worked) || 0), 0).toFixed(2)}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}
