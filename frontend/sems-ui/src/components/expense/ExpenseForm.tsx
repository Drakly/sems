import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const ExpenseForm: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Expense Form
        </Typography>
        <Typography variant="body1">
          This is a placeholder for the expense form. The full implementation is coming soon.
        </Typography>
      </Paper>
    </Box>
  );
};

export default ExpenseForm; 