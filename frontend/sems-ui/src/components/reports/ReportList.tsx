import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Add as AddIcon, Assessment as ReportIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ReportList: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReportIcon />
          Reports & Analytics
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/reports/new')}
        >
          Generate Report
        </Button>
      </Box>
      
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <ReportIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Advanced Reporting Available
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Create detailed reports with AI-powered insights and analytics.
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/reports/new')}
        >
          Generate Your First Report
        </Button>
      </Paper>
    </Box>
  );
};

export default ReportList;