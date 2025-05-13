import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ApprovalDetail: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Approval Detail
        </Typography>
        <Typography variant="body1">
          This is a placeholder for the approval detail view. The full implementation is coming soon.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ApprovalDetail; 