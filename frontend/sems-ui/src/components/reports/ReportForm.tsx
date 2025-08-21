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
  Grid,
  Card,
  CardContent,
  Divider,
  Stack,
  Chip,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Assessment as ReportIcon,
  CalendarToday as CalendarIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Schedule as ScheduleIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon,
  TableChart as TableIcon,
  Business as DepartmentIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { RootState } from '../../store';

const REPORT_TYPES = [
  { id: 'EXPENSE_SUMMARY', name: 'Expense Summary Report', icon: <BarChartIcon />, description: 'Overview of expenses by category, department, and time period' },
  { id: 'BUDGET_ANALYSIS', name: 'Budget Analysis Report', icon: <PieChartIcon />, description: 'Budget utilization and variance analysis' },
  { id: 'TREND_ANALYSIS', name: 'Expense Trend Analysis', icon: <LineChartIcon />, description: 'Historical trends and spending patterns' },
  { id: 'APPROVAL_WORKFLOW', name: 'Approval Workflow Report', icon: <TableIcon />, description: 'Approval times and bottlenecks analysis' },
  { id: 'DEPARTMENT_BREAKDOWN', name: 'Department Breakdown', icon: <DepartmentIcon />, description: 'Expenses grouped by department with comparisons' },
  { id: 'USER_ACTIVITY', name: 'User Activity Report', icon: <PersonIcon />, description: 'Individual user expense patterns and statistics' },
];

const CHART_TYPES = [
  { id: 'bar', name: 'Bar Chart', icon: <BarChartIcon /> },
  { id: 'pie', name: 'Pie Chart', icon: <PieChartIcon /> },
  { id: 'line', name: 'Line Chart', icon: <LineChartIcon /> },
  { id: 'table', name: 'Table', icon: <TableIcon /> },
];

const EXPORT_FORMATS = [
  { id: 'pdf', name: 'PDF', extension: '.pdf' },
  { id: 'excel', name: 'Excel', extension: '.xlsx' },
  { id: 'csv', name: 'CSV', extension: '.csv' },
];

const SCHEDULE_OPTIONS = [
  { id: 'none', name: 'One-time Report' },
  { id: 'daily', name: 'Daily' },
  { id: 'weekly', name: 'Weekly' },
  { id: 'monthly', name: 'Monthly' },
  { id: 'quarterly', name: 'Quarterly' },
];

const CATEGORIES = [
  'TRAVEL', 'MEALS', 'OFFICE_SUPPLIES', 'EQUIPMENT', 'TRAINING', 'MARKETING', 'UTILITIES', 'OTHER'
];

const DEPARTMENTS = [
  'HR', 'IT', 'FINANCE', 'MARKETING', 'SALES', 'OPERATIONS', 'GENERAL'
];

interface ReportFormData {
  name: string;
  description: string;
  reportType: string;
  chartType: string;
  startDate: string;
  endDate: string;
  categories: string[];
  departments: string[];
  includeUsers: string[];
  minAmount: number;
  maxAmount: number;
  exportFormat: string;
  schedule: string;
  emailRecipients: string[];
  includeCharts: boolean;
  includeSummary: boolean;
  includeDetails: boolean;
  groupBy: string[];
  sortBy: string;
  filters: any;
}

const ReportForm: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<ReportFormData>({
    name: '',
    description: '',
    reportType: '',
    chartType: 'bar',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0],
    categories: [],
    departments: [],
    includeUsers: [],
    minAmount: 0,
    maxAmount: 0,
    exportFormat: 'pdf',
    schedule: 'none',
    emailRecipients: [],
    includeCharts: true,
    includeSummary: true,
    includeDetails: false,
    groupBy: ['category'],
    sortBy: 'date',
    filters: {},
  });

  const [formErrors, setFormErrors] = useState<any>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  const handleInputChange = (field: keyof ReportFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear specific field error
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: null });
    }

    // Auto-generate report name if not manually set
    if (field === 'reportType' && !formData.name) {
      const reportType = REPORT_TYPES.find(type => type.id === value);
      if (reportType) {
        setFormData(prev => ({
          ...prev,
          name: `${reportType.name} - ${new Date().toLocaleDateString()}`,
        }));
      }
    }
  };

  const handleMultiSelectChange = (field: keyof ReportFormData, value: string, checked: boolean) => {
    const currentValues = formData[field] as string[];
    if (checked) {
      setFormData(prev => ({
        ...prev,
        [field]: [...currentValues, value],
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: currentValues.filter(item => item !== value),
      }));
    }
  };

  const addEmailRecipient = () => {
    if (emailInput && !formData.emailRecipients.includes(emailInput)) {
      setFormData(prev => ({
        ...prev,
        emailRecipients: [...prev.emailRecipients, emailInput],
      }));
      setEmailInput('');
    }
  };

  const removeEmailRecipient = (email: string) => {
    setFormData(prev => ({
      ...prev,
      emailRecipients: prev.emailRecipients.filter(e => e !== email),
    }));
  };

  const validateForm = (): boolean => {
    const errors: any = {};

    if (!formData.name.trim()) errors.name = 'Report name is required';
    if (!formData.reportType) errors.reportType = 'Report type is required';
    if (!formData.startDate) errors.startDate = 'Start date is required';
    if (!formData.endDate) errors.endDate = 'End date is required';

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    if (endDate <= startDate) {
      errors.endDate = 'End date must be after start date';
    }

    if (formData.schedule !== 'none' && formData.emailRecipients.length === 0) {
      errors.emailRecipients = 'Email recipients are required for scheduled reports';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGenerateReport = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    try {
      // TODO: Implement report generation
      console.log('Generating report with data:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      navigate('/reports');
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedReportType = REPORT_TYPES.find(type => type.id === formData.reportType);
  const selectedChartType = CHART_TYPES.find(chart => chart.id === formData.chartType);

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ReportIcon />
        Generate Report
      </Typography>

      <Grid container spacing={3}>
        {/* Main Form */}
        <Grid xs={12} md={8}>
          <Stack spacing={3}>
            {/* Basic Information */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Report Configuration
              </Typography>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Report Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  placeholder="e.g., Monthly Expense Summary - January 2024"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ReportIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Description (Optional)"
                  multiline
                  rows={2}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the purpose and scope of this report..."
                />

                <FormControl fullWidth error={!!formErrors.reportType}>
                  <InputLabel>Report Type</InputLabel>
                  <Select
                    value={formData.reportType}
                    label="Report Type"
                    onChange={(e) => handleInputChange('reportType', e.target.value)}
                  >
                    {REPORT_TYPES.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {type.icon}
                          <Box>
                            <Typography variant="body1">{type.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {type.description}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Chart Type</InputLabel>
                  <Select
                    value={formData.chartType}
                    label="Chart Type"
                    onChange={(e) => handleInputChange('chartType', e.target.value)}
                  >
                    {CHART_TYPES.map((chart) => (
                      <MenuItem key={chart.id} value={chart.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {chart.icon}
                          {chart.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Paper>

            {/* Date Range */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Date Range
              </Typography>
              <Grid container spacing={2}>
                <Grid xs={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    error={!!formErrors.startDate}
                    helperText={formErrors.startDate}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid xs={6}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    error={!!formErrors.endDate}
                    helperText={formErrors.endDate}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>

              {/* Quick Date Ranges */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Quick ranges:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {[
                    { label: 'Last 7 days', days: 7 },
                    { label: 'Last 30 days', days: 30 },
                    { label: 'Last 90 days', days: 90 },
                    { label: 'This year', days: null, isYear: true },
                  ].map((range) => (
                    <Chip
                      key={range.label}
                      label={range.label}
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        const endDate = new Date();
                        let startDate: Date;
                        
                        if (range.isYear) {
                          startDate = new Date(endDate.getFullYear(), 0, 1);
                        } else {
                          startDate = new Date(Date.now() - range.days! * 24 * 60 * 60 * 1000);
                        }
                        
                        handleInputChange('startDate', startDate.toISOString().split('T')[0]);
                        handleInputChange('endDate', endDate.toISOString().split('T')[0]);
                      }}
                    />
                  ))}
                </Stack>
              </Box>
            </Paper>

            {/* Filters */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Filters
              </Typography>
              <Stack spacing={3}>
                {/* Categories Filter */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Categories
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {CATEGORIES.map((category) => (
                      <FormControlLabel
                        key={category}
                        control={
                          <Checkbox
                            checked={formData.categories.includes(category)}
                            onChange={(e) => handleMultiSelectChange('categories', category, e.target.checked)}
                          />
                        }
                        label={category.replace('_', ' ')}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Departments Filter */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Departments
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {DEPARTMENTS.map((department) => (
                      <FormControlLabel
                        key={department}
                        control={
                          <Checkbox
                            checked={formData.departments.includes(department)}
                            onChange={(e) => handleMultiSelectChange('departments', department, e.target.checked)}
                          />
                        }
                        label={department}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Amount Range */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Amount Range
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid xs={6}>
                      <TextField
                        fullWidth
                        label="Minimum Amount"
                        type="number"
                        value={formData.minAmount}
                        onChange={(e) => handleInputChange('minAmount', parseFloat(e.target.value) || 0)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MoneyIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid xs={6}>
                      <TextField
                        fullWidth
                        label="Maximum Amount"
                        type="number"
                        value={formData.maxAmount}
                        onChange={(e) => handleInputChange('maxAmount', parseFloat(e.target.value) || 0)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MoneyIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Stack>
            </Paper>

            {/* Report Options */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Report Options
              </Typography>
              <Stack spacing={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.includeCharts}
                      onChange={(e) => handleInputChange('includeCharts', e.target.checked)}
                    />
                  }
                  label="Include Charts and Visualizations"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.includeSummary}
                      onChange={(e) => handleInputChange('includeSummary', e.target.checked)}
                    />
                  }
                  label="Include Executive Summary"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.includeDetails}
                      onChange={(e) => handleInputChange('includeDetails', e.target.checked)}
                    />
                  }
                  label="Include Detailed Transaction List"
                />
              </Stack>
            </Paper>

            {/* Scheduling */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ScheduleIcon />
                Scheduling & Delivery
              </Typography>
              <Stack spacing={3}>
                <FormControl fullWidth>
                  <InputLabel>Schedule</InputLabel>
                  <Select
                    value={formData.schedule}
                    label="Schedule"
                    onChange={(e) => handleInputChange('schedule', e.target.value)}
                  >
                    {SCHEDULE_OPTIONS.map((option) => (
                      <MenuItem key={option.id} value={option.id}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Export Format</InputLabel>
                  <Select
                    value={formData.exportFormat}
                    label="Export Format"
                    onChange={(e) => handleInputChange('exportFormat', e.target.value)}
                  >
                    {EXPORT_FORMATS.map((format) => (
                      <MenuItem key={format.id} value={format.id}>
                        {format.name} ({format.extension})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Email Recipients */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Email Recipients {formData.schedule !== 'none' && '(Required)'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addEmailRecipient()}
                      error={!!formErrors.emailRecipients}
                      helperText={formErrors.emailRecipients}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button variant="outlined" onClick={addEmailRecipient}>
                      Add
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {formData.emailRecipients.map((email) => (
                      <Chip
                        key={email}
                        label={email}
                        onDelete={() => removeEmailRecipient(email)}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        {/* Sidebar */}
        <Grid xs={12} md={4}>
          <Stack spacing={3}>
            {/* Report Preview */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Report Preview
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Type:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {selectedReportType?.icon}
                      <Typography variant="body1">
                        {selectedReportType?.name || 'Not selected'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Chart:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {selectedChartType?.icon}
                      <Typography variant="body1">{selectedChartType?.name}</Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Period:</Typography>
                    <Typography variant="body1">
                      {new Date(formData.startDate).toLocaleDateString()} - {new Date(formData.endDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Format:</Typography>
                    <Typography variant="body1">
                      {EXPORT_FORMATS.find(f => f.id === formData.exportFormat)?.name}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Applied Filters */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Applied Filters
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1}>
                  {formData.categories.length > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">Categories:</Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {formData.categories.map(cat => (
                          <Chip key={cat} label={cat} size="small" />
                        ))}
                      </Box>
                    </Box>
                  )}
                  {formData.departments.length > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">Departments:</Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {formData.departments.map(dept => (
                          <Chip key={dept} label={dept} size="small" />
                        ))}
                      </Box>
                    </Box>
                  )}
                  {(formData.minAmount > 0 || formData.maxAmount > 0) && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">Amount Range:</Typography>
                      <Typography variant="body1">
                        ${formData.minAmount} - ${formData.maxAmount || '∞'}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Report Tips */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Report Tips
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <BarChartIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Use bar charts for category comparisons"
                      secondary="Best for showing differences between groups"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PieChartIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Pie charts show proportions well"
                      secondary="Ideal for budget allocation views"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <ScheduleIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Schedule regular reports"
                      secondary="Stay informed with automated delivery"
                    />
                  </ListItem>
                </List>
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
          onClick={() => navigate('/reports')}
        >
          Cancel
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleGenerateReport}
          disabled={isGenerating || !formData.reportType}
        >
          Preview Report
        </Button>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleGenerateReport}
          disabled={isGenerating || !formData.reportType}
        >
          {isGenerating ? 'Generating...' : 'Generate Report'}
        </Button>
      </Box>
    </Box>
  );
};

export default ReportForm;