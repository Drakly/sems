import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Card,
  CardContent,
  Fab,
  Alert,
  Stack,
  Tooltip,
  LinearProgress,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Receipt as ReceiptIcon,
  Send as SubmitIcon,
  Download as ExportIcon,
  Sort as SortIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { RootState } from '../../store';
import { getUserExpenses, deleteExpense, submitExpenseForApproval } from '../../store/slices/expenseSlice';
import { Expense, ExpenseStatus } from '../../types';

const STATUS_COLORS = {
  DRAFT: 'default',
  SUBMITTED: 'info',
  UNDER_REVIEW: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  CHANGES_REQUESTED: 'warning',
  CANCELLED: 'default',
} as const;

const STATUS_LABELS = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  CHANGES_REQUESTED: 'Changes Requested',
  CANCELLED: 'Cancelled',
};

const CATEGORIES = [
  'TRAVEL', 'MEALS', 'OFFICE_SUPPLIES', 'EQUIPMENT', 'TRAINING', 'MARKETING', 'UTILITIES', 'OTHER'
];

const ExpenseList: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { userExpenses, isLoading, error } = useSelector((state: RootState) => state.expenses);
  const { user } = useSelector((state: RootState) => state.auth);

  // State for filtering and searching
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('expenseDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  
  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  useEffect(() => {
    dispatch(getUserExpenses({}) as any);
  }, [dispatch]);

  // Filter and sort expenses
  const filteredExpenses = React.useMemo(() => {
    let filtered = [...(userExpenses || [])];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(expense =>
        expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(expense => expense.status === statusFilter);
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(expense => expense.category?.name === categoryFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Expense];
      let bValue: any = b[sortBy as keyof Expense];

      if (sortBy === 'category') {
        aValue = a.category?.name || '';
        bValue = b.category?.name || '';
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [userExpenses, searchTerm, statusFilter, categoryFilter, sortBy, sortOrder]);

  // Pagination
  const paginatedExpenses = React.useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filteredExpenses.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredExpenses, page, rowsPerPage]);

  const totalPages = Math.ceil(filteredExpenses.length / rowsPerPage);

  // Statistics
  const stats = React.useMemo(() => {
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const pending = filteredExpenses.filter(e => ['SUBMITTED', 'UNDER_REVIEW'].includes(e.status)).length;
    const approved = filteredExpenses.filter(e => e.status === 'APPROVED').length;
    const rejected = filteredExpenses.filter(e => e.status === 'REJECTED').length;

    return { total, pending, approved, rejected, count: filteredExpenses.length };
  }, [filteredExpenses]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, expense: Expense) => {
    setAnchorEl(event.currentTarget);
    setSelectedExpense(expense);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedExpense(null);
  };

  const handleView = (expense: Expense) => {
    navigate(`/expenses/${expense.id}`);
    handleMenuClose();
  };

  const handleEdit = (expense: Expense) => {
    navigate(`/expenses/${expense.id}/edit`);
    handleMenuClose();
  };

  const handleDelete = (expense: Expense) => {
    setExpenseToDelete(expense);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    if (expenseToDelete) {
      await dispatch(deleteExpense(expenseToDelete.id) as any);
      setDeleteDialogOpen(false);
      setExpenseToDelete(null);
    }
  };

  const handleSubmitForApproval = async (expense: Expense) => {
    await dispatch(submitExpenseForApproval(expense.id) as any);
    handleMenuClose();
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '✅';
      case 'REJECTED':
        return '❌';
      case 'UNDER_REVIEW':
        return '⏳';
      case 'SUBMITTED':
        return '📤';
      default:
        return '📝';
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
          Loading expenses...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptIcon />
          My Expenses
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/expenses/new')}
        >
          New Expense
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                ${stats.total.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Amount
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {stats.count}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Expenses
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {stats.pending}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Approval
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {stats.approved}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Approved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <MenuItem key={key} value={key}>
                    {getStatusIcon(key)} {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                label="Category"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="">All Categories</MenuItem>
                {CATEGORIES.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.replace('_', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12} md={2}>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              fullWidth
            >
              Export
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Expenses Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Button
                  variant="text"
                  startIcon={<SortIcon />}
                  onClick={() => handleSort('title')}
                  sx={{ fontWeight: 'bold' }}
                >
                  Title
                </Button>
              </TableCell>
              <TableCell>
                <Button
                  variant="text"
                  startIcon={<SortIcon />}
                  onClick={() => handleSort('amount')}
                  sx={{ fontWeight: 'bold' }}
                >
                  Amount
                </Button>
              </TableCell>
              <TableCell>Category</TableCell>
              <TableCell>
                <Button
                  variant="text"
                  startIcon={<SortIcon />}
                  onClick={() => handleSort('expenseDate')}
                  sx={{ fontWeight: 'bold' }}
                >
                  Date
                </Button>
              </TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedExpenses.map((expense) => (
              <TableRow key={expense.id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle2">{expense.title}</Typography>
                    {expense.description && (
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {expense.description}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {expense.currency} {expense.amount.toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={expense.category?.name || 'Other'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(expense.expenseDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Created: {new Date(expense.createdAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={STATUS_LABELS[expense.status as keyof typeof STATUS_LABELS] || expense.status}
                    color={STATUS_COLORS[expense.status as keyof typeof STATUS_COLORS] as any}
                    size="small"
                    icon={<span>{getStatusIcon(expense.status)}</span>}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    onClick={(e) => handleMenuClick(e, expense)}
                    size="small"
                  >
                    <MoreIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
          />
        </Box>
      )}

      {/* Empty State */}
      {filteredExpenses.length === 0 && !isLoading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No expenses found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {searchTerm || statusFilter || categoryFilter
              ? 'Try adjusting your filters or search terms.'
              : 'Create your first expense to get started.'}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/expenses/new')}
          >
            Create Expense
          </Button>
        </Paper>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedExpense && handleView(selectedExpense)}>
          <ViewIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        {selectedExpense?.status === 'DRAFT' && (
          <MenuItem onClick={() => selectedExpense && handleEdit(selectedExpense)}>
            <EditIcon sx={{ mr: 1 }} />
            Edit
          </MenuItem>
        )}
        {selectedExpense?.status === 'DRAFT' && (
          <MenuItem onClick={() => selectedExpense && handleSubmitForApproval(selectedExpense)}>
            <SubmitIcon sx={{ mr: 1 }} />
            Submit for Approval
          </MenuItem>
        )}
        {['DRAFT', 'CHANGES_REQUESTED'].includes(selectedExpense?.status || '') && (
          <MenuItem onClick={() => selectedExpense && handleDelete(selectedExpense)}>
            <DeleteIcon sx={{ mr: 1, color: 'error.main' }} />
            Delete
          </MenuItem>
        )}
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the expense "{expenseToDelete?.title}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add expense"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => navigate('/expenses/new')}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default ExpenseList;