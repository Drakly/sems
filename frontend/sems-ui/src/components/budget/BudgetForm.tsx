import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
  Stack,
  InputAdornment,
  Chip,
  LinearProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  AccountBalance as BudgetIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  TrendingUp as TrendingIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Category as CategoryIcon,
  Business as DepartmentIcon,
} from '@mui/icons-material';
import { RootState } from '../../store';
import { BudgetRequest } from '../../services/budgetService';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];

const BUDGET_CATEGORIES = [
  { id: 'TRAVEL', name: 'Travel & Transportation', icon: '✈️' },
  { id: 'MEALS', name: 'Meals & Entertainment', icon: '🍽️' },
  { id: 'OFFICE_SUPPLIES', name: 'Office Supplies', icon: '📝' },
  { id: 'EQUIPMENT', name: 'Equipment & Hardware', icon: '💻' },
  { id: 'TRAINING', name: 'Training & Development', icon: '📚' },
  { id: 'MARKETING', name: 'Marketing & Advertising', icon: '📢' },
  { id: 'UTILITIES', name: 'Utilities & Services', icon: '⚡' },
  { id: 'GENERAL', name: 'General Operations', icon: '🏢' },
];

const DEPARTMENTS = [
  { id: 'HR', name: 'Human Resources' },
  { id: 'IT', name: 'Information Technology' },
  { id: 'FINANCE', name: 'Finance' },
  { id: 'MARKETING', name: 'Marketing' },
  { id: 'SALES', name: 'Sales' },
  { id: 'OPERATIONS', name: 'Operations' },
  { id: 'GENERAL', name: 'General' },
];

// Smart budget suggestions based on category and department
const BUDGET_SUGGESTIONS = {
  TRAVEL: { monthly: 5000, quarterly: 15000, yearly: 60000 },
  MEALS: { monthly: 2000, quarterly: 6000, yearly: 24000 },
  OFFICE_SUPPLIES: { monthly: 1000, quarterly: 3000, yearly: 12000 },
  EQUIPMENT: { monthly: 3000, quarterly: 9000, yearly: 36000 },
  TRAINING: { monthly: 2000, quarterly: 6000, yearly: 24000 },
  MARKETING: { monthly: 10000, quarterly: 30000, yearly: 120000 },
  UTILITIES: { monthly: 1500, quarterly: 4500, yearly: 18000 },
  GENERAL: { monthly: 5000, quarterly: 15000, yearly: 60000 },
};

interface BudgetFormProps {
  mode?: 'create' | 'edit';
}

const BudgetForm: React.FC<BudgetFormProps> = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  // Form state
  const [formData, setFormData] = useState<BudgetRequest>({
    name: '',
    amount: 0,
    currency: 'USD',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
    departmentId: user?.department || '',
    description: '',
    categoryId: '',
  });

  const [formErrors, setFormErrors] = useState<any>({});
  const [smartSuggestions, setSmartSuggestions] = useState(true);

  const handleInputChange = (field: keyof BudgetRequest, value: any) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Clear specific field error
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: null });
    }
  };

  const validateForm = (): boolean => {
    const errors: any = {};

    if (!formData.name.trim()) errors.name = 'Budget name is required';
    if (!formData.amount || formData.amount <= 0) errors.amount = 'Amount must be greater than 0';
    if (!formData.startDate) errors.startDate = 'Start date is required';
    if (!formData.endDate) errors.endDate = 'End date is required';
    
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    if (endDate <= startDate) {
      errors.endDate = 'End date must be after start date';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      // TODO: Implement budget creation/update
      console.log('Creating/updating budget:', formData);
      navigate('/budgets');
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const applySuggestion = (amount: number) => {
    handleInputChange('amount', amount);
  };

  const calculateBudgetPeriod = () => {
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 35) return 'monthly';
    if (diffDays <= 100) return 'quarterly';
    return 'yearly';
  };

  const selectedCategory = BUDGET_CATEGORIES.find(cat => cat.id === formData.categoryId);
  const selectedDepartment = DEPARTMENTS.find(dept => dept.id === formData.departmentId);
  const currentPeriod = calculateBudgetPeriod();
  
  const getSuggestedAmount = () => {
    if (!selectedCategory) return null;
    return BUDGET_SUGGESTIONS[selectedCategory.id as keyof typeof BUDGET_SUGGESTIONS]?.[currentPeriod as keyof typeof BUDGET_SUGGESTIONS.TRAVEL];
  };

  const suggestedAmount = getSuggestedAmount();

  const getBudgetHealthStatus = () => {
    if (!suggestedAmount || !formData.amount) return null;
    
    const ratio = formData.amount / suggestedAmount;
    if (ratio < 0.7) return { status: 'low', color: 'warning', icon: <WarningIcon /> };
    if (ratio > 1.5) return { status: 'high', color: 'error', icon: <WarningIcon /> };
    return { status: 'good', color: 'success', icon: <CheckIcon /> };
  };

  const healthStatus = getBudgetHealthStatus();

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <BudgetIcon />
        {mode === 'edit' ? 'Edit Budget' : 'Create New Budget'}
      </Typography>

      <Grid container spacing={3}>
        {/* Main Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Stack spacing={3}>
              {/* Smart Suggestions Toggle */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Budget Details</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={smartSuggestions}
                      onChange={(e) => setSmartSuggestions(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Smart Suggestions"
                />
              </Box>

              {/* Budget Name */}
              <TextField
                fullWidth
                label="Budget Name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!formErrors.name}
                helperText={formErrors.name}
                placeholder="e.g., Q1 2024 Marketing Budget, Annual IT Equipment Budget"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BudgetIcon />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Amount and Currency */}
              <Grid container spacing={2}>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    label="Budget Amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                    error={!!formErrors.amount}
                    helperText={formErrors.amount}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <MoneyIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      value={formData.currency}
                      label="Currency"
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                    >
                      {CURRENCIES.map((currency) => (
                        <MenuItem key={currency} value={currency}>
                          {currency}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Smart Amount Suggestions */}
              {smartSuggestions && selectedCategory && suggestedAmount && (
                <Alert severity="info">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="body2">
                        Suggested amount for {selectedCategory.name} ({currentPeriod}): {formData.currency} {suggestedAmount.toLocaleString()}
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      onClick={() => applySuggestion(suggestedAmount)}
                    >
                      Apply
                    </Button>
                  </Box>
                </Alert>
              )}

              {/* Budget Health Indicator */}
              {healthStatus && (
                <Alert severity={healthStatus.color as any}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {healthStatus.icon}
                    <Typography variant="body2">
                      {healthStatus.status === 'low' && 'This budget amount is below typical range for this category.'}
                      {healthStatus.status === 'high' && 'This budget amount is significantly above typical range.'}
                      {healthStatus.status === 'good' && 'This budget amount is within the recommended range.'}
                    </Typography>
                  </Box>
                </Alert>
              )}

              {/* Category */}
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.categoryId}
                  label="Category"
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                >
                  {BUDGET_CATEGORIES.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{category.icon}</span>
                        {category.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Department */}
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.departmentId}
                  label="Department"
                  onChange={(e) => handleInputChange('departmentId', e.target.value)}
                >
                  {DEPARTMENTS.map((department) => (
                    <MenuItem key={department.id} value={department.id}>
                      {department.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Date Range - Using regular input fields */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    error={!!formErrors.startDate}
                    helperText={formErrors.startDate}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    error={!!formErrors.endDate}
                    helperText={formErrors.endDate}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              {/* Description */}
              <TextField
                fullWidth
                label="Description (Optional)"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the purpose and scope of this budget..."
              />
            </Stack>
          </Paper>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Budget Summary */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Budget Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Total Amount:</Typography>
                    <Typography variant="h6" color="primary">
                      {formData.currency} {formData.amount.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Period:</Typography>
                    <Chip
                      label={currentPeriod}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Category:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {selectedCategory && <span>{selectedCategory.icon}</span>}
                      <Typography variant="body2">
                        {selectedCategory?.name || 'Not selected'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Department:</Typography>
                    <Typography variant="body2">
                      {selectedDepartment?.name || 'Not selected'}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Budget Analytics Preview */}
            {formData.amount > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingIcon />
                    Budget Breakdown
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={2}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Monthly allocation</Typography>
                        <Typography variant="body2">
                          {formData.currency} {Math.round(formData.amount / 12).toLocaleString()}
                        </Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={100} />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Weekly allocation</Typography>
                        <Typography variant="body2">
                          {formData.currency} {Math.round(formData.amount / 52).toLocaleString()}
                        </Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={100} />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Quick Tips */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Budget Tips
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    • Include a 10-15% buffer for unexpected expenses
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Review and adjust budgets quarterly
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Set up alerts when 80% of budget is spent
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Consider seasonal variations in spending
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<CancelIcon />}
          onClick={() => navigate('/budgets')}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSubmit}
        >
          {mode === 'edit' ? 'Update Budget' : 'Create Budget'}
        </Button>
      </Box>
    </Box>
  );
};

export default BudgetForm;