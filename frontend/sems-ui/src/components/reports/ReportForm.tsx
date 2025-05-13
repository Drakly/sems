import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ReportForm: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Report Form
        </Typography>
        <Typography variant="body1">
          This is a placeholder for the report form view. The full implementation is coming soon.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ReportForm; 