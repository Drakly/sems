import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ReportDetail: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Report Detail
        </Typography>
        <Typography variant="body1">
          This is a placeholder for the report detail view. The full implementation is coming soon.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ReportDetail; 