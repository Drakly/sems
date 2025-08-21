import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Add as AddIcon, AccountBalance as BudgetIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const BudgetList: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BudgetIcon />
          Budget Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/budgets/new')}
        >
          New Budget
        </Button>
      </Box>
      
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <BudgetIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Budget Management Coming Soon
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Advanced budget tracking and management features are being developed.
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/budgets/new')}
        >
          Create Your First Budget
        </Button>
      </Paper>
    </Box>
  );
};

export default BudgetList;