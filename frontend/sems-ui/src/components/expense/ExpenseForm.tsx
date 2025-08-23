import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
  Card,
  CardContent,
  Chip,
  InputAdornment,
  Divider,
  Stack,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';

import {
  CloudUpload as UploadIcon,
  Receipt as ReceiptIcon,
  SmartToy as AIIcon,
  Category as CategoryIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon,
  Save as SaveIcon,
  Send as SubmitIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { RootState } from '../../store';
import { createExpense, updateExpense, getExpenseById } from '../../store/slices/expenseSlice';
import { ExpenseRequest } from '../../services/expenseService';
import { getCategoryOptions } from '../../utils/categoryUtils';

// Smart expense categories with AI suggestions - matching backend enum
const EXPENSE_CATEGORIES = [
  { id: 'TRAVEL', name: 'Travel', icon: '✈️', keywords: ['uber', 'taxi', 'flight', 'gas', 'parking', 'rental', 'train', 'bus'] },
  { id: 'ACCOMMODATION', name: 'Accommodation', icon: '🏨', keywords: ['hotel', 'motel', 'airbnb', 'lodging', 'stay'] },
  { id: 'MEALS', name: 'Meals', icon: '🍽️', keywords: ['restaurant', 'lunch', 'dinner', 'coffee', 'catering', 'food'] },
  { id: 'ENTERTAINMENT', name: 'Entertainment', icon: '🎭', keywords: ['entertainment', 'movie', 'theater', 'event', 'show'] },
  { id: 'OFFICE_SUPPLIES', name: 'Office Supplies', icon: '📝', keywords: ['paper', 'pen', 'supplies', 'stationery', 'printer'] },
  { id: 'SOFTWARE', name: 'Software', icon: '💾', keywords: ['software', 'license', 'subscription', 'app', 'saas'] },
  { id: 'HARDWARE', name: 'Hardware', icon: '💻', keywords: ['laptop', 'monitor', 'keyboard', 'mouse', 'phone', 'computer', 'equipment'] },
  { id: 'TELECOMMUNICATION', name: 'Telecommunication', icon: '📞', keywords: ['phone', 'mobile', 'internet', 'telecom', 'communication'] },
  { id: 'TRAINING', name: 'Training', icon: '📚', keywords: ['course', 'training', 'certification', 'book', 'conference', 'education'] },
  { id: 'MARKETING', name: 'Marketing', icon: '📢', keywords: ['ad', 'marketing', 'promotion', 'banner', 'social', 'advertising'] },
  { id: 'CONSULTING', name: 'Consulting', icon: '👥', keywords: ['consulting', 'consultant', 'advisory', 'professional', 'service'] },
  { id: 'LEGAL', name: 'Legal', icon: '⚖️', keywords: ['legal', 'lawyer', 'attorney', 'law', 'court'] },
  { id: 'INSURANCE', name: 'Insurance', icon: '🛡️', keywords: ['insurance', 'coverage', 'policy', 'premium'] },
  { id: 'TAXES', name: 'Taxes', icon: '🏛️', keywords: ['tax', 'taxes', 'irs', 'government', 'filing'] },
  { id: 'UTILITIES', name: 'Utilities', icon: '⚡', keywords: ['electricity', 'water', 'gas', 'utility', 'power'] },
  { id: 'MISCELLANEOUS', name: 'Miscellaneous', icon: '📦', keywords: ['other', 'misc', 'miscellaneous'] },
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];

// Smart amount suggestions based on category
const AMOUNT_SUGGESTIONS = {
  TRAVEL: [50, 100, 200, 500, 1000],
  ACCOMMODATION: [100, 200, 300, 500, 1000],
  MEALS: [15, 25, 50, 100],
  ENTERTAINMENT: [25, 50, 100, 200],
  OFFICE_SUPPLIES: [20, 50, 100, 200],
  SOFTWARE: [50, 100, 500, 1000],
  HARDWARE: [100, 500, 1000, 2000],
  TELECOMMUNICATION: [50, 100, 200, 500],
  TRAINING: [100, 500, 1000],
  MARKETING: [100, 500, 1000, 5000],
  CONSULTING: [200, 500, 1000, 2000],
  LEGAL: [200, 500, 1000, 2000],
  INSURANCE: [100, 500, 1000, 2000],
  TAXES: [100, 500, 1000, 5000],
  UTILITIES: [50, 100, 200, 500],
  MISCELLANEOUS: [25, 50, 100, 200],
};

interface ExpenseFormProps {
  mode?: 'create' | 'edit';
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();
  
  const { currentExpense, isLoading, error } = useSelector((state: RootState) => state.expenses);
  const { user } = useSelector((state: RootState) => state.auth);

  // Form state
  const [formData, setFormData] = useState<ExpenseRequest>({
    title: '',
    description: '',
    amount: 0,
    currency: 'USD',
    categoryId: '',
    expenseDate: new Date().toISOString().split('T')[0],
    departmentId: user?.department || '',
    projectId: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [aiSuggestions, setAiSuggestions] = useState<any>({});
  const [autoSuggest, setAutoSuggest] = useState(true);
  const [formErrors, setFormErrors] = useState<any>({});

  // Load expense data for edit mode
  useEffect(() => {
    if (mode === 'edit' && id) {
      dispatch(getExpenseById(id) as any);
    }
  }, [dispatch, id, mode]);

  // Populate form when editing
  useEffect(() => {
    if (mode === 'edit' && currentExpense) {
      setFormData({
        title: currentExpense.title,
        description: currentExpense.description || '',
        amount: currentExpense.amount,
        currency: currentExpense.currency,
        categoryId: currentExpense.category || '',
        expenseDate: currentExpense.expenseDate,
        departmentId: user?.department || '',
        projectId: '',
      });
    }
  }, [currentExpense, mode, user]);

  // AI-powered smart suggestions
  const generateSmartSuggestions = (title: string, amount?: number) => {
    if (!autoSuggest || !title) return;

    const titleLower = title.toLowerCase();
    
    // Category suggestion based on keywords
    const suggestedCategory = EXPENSE_CATEGORIES.find(cat => 
      cat.keywords.some(keyword => titleLower.includes(keyword))
    );

    if (suggestedCategory && !formData.categoryId) {
      setAiSuggestions((prev: any) => ({
        ...prev,
        category: suggestedCategory,
      }));
    }

    // Amount validation and suggestions
    if (amount && suggestedCategory) {
      const suggestions = AMOUNT_SUGGESTIONS[suggestedCategory.id as keyof typeof AMOUNT_SUGGESTIONS];
      const isReasonable = suggestions.some(suggested => Math.abs(amount - suggested) / suggested < 0.5);
      
      if (!isReasonable) {
        setAiSuggestions((prev: any) => ({
          ...prev,
          amountWarning: `This amount seems unusual for ${suggestedCategory.name}. Typical amounts: ${suggestions.join(', ')}`,
        }));
      }
    }
  };

  const handleInputChange = (field: keyof ExpenseRequest, value: any) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Clear specific field error
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: null });
    }

    // Trigger AI suggestions
    if (field === 'title' || field === 'amount') {
      generateSmartSuggestions(
        field === 'title' ? value : newFormData.title,
        field === 'amount' ? value : newFormData.amount
      );
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreviewUrl(e.target?.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const applySuggestion = (type: string, value: any) => {
    if (type === 'category') {
      handleInputChange('categoryId', value.id);
    }
    setAiSuggestions((prev: any) => ({ ...prev, [type]: null }));
  };

  const validateForm = (): boolean => {
    const errors: any = {};

    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.amount || formData.amount <= 0) errors.amount = 'Amount must be greater than 0';
    if (!formData.categoryId) errors.categoryId = 'Category is required';
    if (!formData.expenseDate) errors.expenseDate = 'Expense date is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (submitForApproval = false) => {
    if (!validateForm()) return;

    try {
      console.log('Submitting expense form with data:', formData);
      
      let result;
      if (mode === 'edit' && id) {
        console.log('Updating expense with ID:', id);
        result = await dispatch(updateExpense({ id, expense: formData }) as any);
      } else {
        console.log('Creating new expense');
        result = await dispatch(createExpense(formData) as any);
      }
      
      console.log('Expense operation result:', result);
      
      if (result.type.endsWith('/fulfilled')) {
        console.log('Expense saved successfully, navigating to expense list');
        navigate('/expenses');
      } else {
        console.error('Expense operation failed:', result);
      }
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const selectedCategory = EXPENSE_CATEGORIES.find(cat => cat.id === formData.categoryId);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ReceiptIcon />
        {mode === 'edit' ? 'Edit Expense' : 'New Expense'}
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Main Form */}
        <Box sx={{ flex: 2 }}>
          <Paper sx={{ p: 3 }}>
            <Stack spacing={3}>
              {/* AI Toggle */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Expense Details</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={autoSuggest}
                      onChange={(e) => setAutoSuggest(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AIIcon fontSize="small" />
                      Smart Suggestions
                    </Box>
                  }
                />
              </Box>

              {/* Title */}
              <TextField
                fullWidth
                label="Expense Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                error={!!formErrors.title}
                helperText={formErrors.title}
                placeholder="e.g., Business lunch with client, Flight to conference"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ReceiptIcon />
                    </InputAdornment>
                  ),
                }}
              />

              {/* AI Category Suggestion */}
              {aiSuggestions.category && (
                <Alert
                  severity="info"
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => applySuggestion('category', aiSuggestions.category)}
                    >
                      Apply
                    </Button>
                  }
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AIIcon fontSize="small" />
                    Suggested category: {aiSuggestions.category.icon} {aiSuggestions.category.name}
                  </Box>
                </Alert>
              )}

              {/* Amount and Currency */}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  sx={{ flex: 2 }}
                  label="Amount"
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
                <FormControl sx={{ flex: 1 }}>
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
              </Box>

              {/* Amount Warning */}
              {aiSuggestions.amountWarning && (
                <Alert severity="warning">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AIIcon fontSize="small" />
                    {aiSuggestions.amountWarning}
                  </Box>
                </Alert>
              )}

              {/* Quick Amount Suggestions */}
              {selectedCategory && AMOUNT_SUGGESTIONS[selectedCategory.id as keyof typeof AMOUNT_SUGGESTIONS] && (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Quick amounts for {selectedCategory.name}:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {AMOUNT_SUGGESTIONS[selectedCategory.id as keyof typeof AMOUNT_SUGGESTIONS].map((amount) => (
                      <Chip
                        key={amount}
                        label={`${formData.currency} ${amount}`}
                        onClick={() => handleInputChange('amount', amount)}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Category */}
              <FormControl fullWidth error={!!formErrors.categoryId}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.categoryId}
                  label="Category"
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                >
                  {EXPENSE_CATEGORIES.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span>{category.icon}</span>
                        {category.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.categoryId && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                    {formErrors.categoryId}
                  </Typography>
                )}
              </FormControl>

              {/* Date - Using regular input field */}
              <TextField
                fullWidth
                label="Expense Date"
                type="date"
                value={formData.expenseDate}
                onChange={(e) => handleInputChange('expenseDate', e.target.value)}
                error={!!formErrors.expenseDate}
                helperText={formErrors.expenseDate}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Description */}
              <TextField
                fullWidth
                label="Description (Optional)"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Additional details about this expense..."
              />

              {/* Receipt Upload */}
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Receipt Attachment
        </Typography>
                <input
                  accept="image/*,.pdf"
                  style={{ display: 'none' }}
                  id="receipt-upload"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="receipt-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    fullWidth
                  >
                    Upload Receipt
                  </Button>
                </label>
                {selectedFile && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Selected: {selectedFile.name}
        </Typography>
                )}
              </Box>

              {/* Preview */}
              {previewUrl && (
                <Box sx={{ textAlign: 'center' }}>
                  <img
                    src={previewUrl}
                    alt="Receipt preview"
                    style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                  />
                </Box>
              )}
            </Stack>
      </Paper>
        </Box>

        {/* Sidebar */}
        <Box sx={{ flex: 1 }}>
          <Stack spacing={3}>
            {/* Expense Summary */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Expense Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Amount:</Typography>
                    <Typography variant="h6" color="primary">
                      {formData.currency} {formData.amount.toFixed(2)}
                    </Typography>
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
                    <Typography variant="body2">Date:</Typography>
                    <Typography variant="body2">
                      {new Date(formData.expenseDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Smart Insights */}
            {autoSuggest && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AIIcon />
                    Smart Insights
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      • Receipt recommended for amounts over $25
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • {selectedCategory?.name || 'This category'} expenses average $
                      {selectedCategory ? AMOUNT_SUGGESTIONS[selectedCategory.id as keyof typeof AMOUNT_SUGGESTIONS]?.[1] : 50} in your company
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Consider adding project code for better tracking
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          startIcon={<CancelIcon />}
          onClick={() => navigate('/expenses')}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={() => handleSubmit(false)}
          disabled={isLoading}
        >
          Save as Draft
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SubmitIcon />}
          onClick={() => handleSubmit(true)}
          disabled={isLoading}
        >
          Save & Submit
        </Button>
      </Box>
    </Box>
  );
};

export default ExpenseForm; 