import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ReportDetail: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Report Details
        </Typography>
        <Typography variant="body1">
          Report detail view with interactive charts and data visualization coming soon.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ReportDetail;