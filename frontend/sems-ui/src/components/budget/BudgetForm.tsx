import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const BudgetForm: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Budget Form
        </Typography>
        <Typography variant="body1">
          This is a placeholder for the budget form view. The full implementation is coming soon.
        </Typography>
      </Paper>
    </Box>
  );
};

export default BudgetForm; 