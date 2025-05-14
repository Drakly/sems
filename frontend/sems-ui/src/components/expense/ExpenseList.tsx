import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { ExpenseStatus } from '../../types';
import { RootState } from '../../store';
import { getUserExpenses, getAllExpenses, deleteExpense, setPage, setPageSize } from '../../store/slices/expenseSlice';
import { openModal } from '../../store/slices/uiSlice';

const ExpenseList: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { userExpenses, allExpenses, isLoading, error, pagination } = useSelector(
    (state: RootState) => state.expenses
  );
  
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    startDate: '',
    endDate: '',
  });
  
  const [showFilters, setShowFilters] = useState(false);

  // Determine if we should show all expenses or just user expenses
  const isAdmin = user?.role === 'ADMIN';
  const expenses = isAdmin ? allExpenses : userExpenses;
  
  useEffect(() => {
    if (isAdmin) {
      dispatch(getAllExpenses({ page: pagination.page, size: pagination.pageSize }) as any);
    } else {
      dispatch(getUserExpenses({ page: pagination.page, size: pagination.pageSize }) as any);
    }
  }, [dispatch, isAdmin, pagination.page, pagination.pageSize]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, status: e.target.value });
  };

  const handleDateChange = (field: 'startDate' | 'endDate') => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, [field]: e.target.value });
  };

  const handleApplyFilters = () => {
    const filterParams: any = {
      page: 0, // Reset to first page when filtering
      size: pagination.pageSize,
    };
    
    if (filters.search) {
      filterParams.search = filters.search;
    }
    
    if (filters.status) {
      filterParams.status = filters.status;
    }
    
    if (filters.startDate) {
      filterParams.startDate = filters.startDate;
    }
    
    if (filters.endDate) {
      filterParams.endDate = filters.endDate;
    }
    
    if (isAdmin) {
      dispatch(getAllExpenses(filterParams) as any);
    } else {
      dispatch(getUserExpenses(filterParams) as any);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: '',
      startDate: '',
      endDate: '',
    });
    
    if (isAdmin) {
      dispatch(getAllExpenses({ page: 0, size: pagination.pageSize }) as any);
    } else {
      dispatch(getUserExpenses({ page: 0, size: pagination.pageSize }) as any);
    }
  };

  const handlePageChange = (_event: unknown, newPage: number) => {
    dispatch(setPage(newPage));
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setPageSize(parseInt(event.target.value, 10)));
    dispatch(setPage(0));
  };

  const handleViewExpense = (id: string) => {
    navigate(`/expenses/${id}`);
  };

  const handleEditExpense = (id: string) => {
    navigate(`/expenses/${id}/edit`);
  };

  const handleDeleteExpense = (id: string) => {
    dispatch(
      openModal({
        type: 'confirm',
        data: {
          title: 'Delete Expense',
          message: 'Are you sure you want to delete this expense? This action cannot be undone.',
          confirmButton: 'Delete',
          cancelButton: 'Cancel',
          onConfirm: () => {
            dispatch(deleteExpense(id) as any);
          },
        },
      })
    );
  };

  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'default';
      case 'SUBMITTED':
        return 'info';
      case 'UNDER_REVIEW':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'error';
      case 'PAID':
        return 'primary';
      case 'CHANGES_REQUESTED':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (isLoading && expenses.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {isAdmin ? 'All Expenses' : 'My Expenses'}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          to="/expenses/new"
        >
          New Expense
        </Button>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Search expenses..."
                value={filters.search}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <TextField
                select
                fullWidth
                variant="outlined"
                size="small"
                label="Status"
                value={filters.status}
                onChange={handleStatusChange}
              >
                <MenuItem value="">All Statuses</MenuItem>
                {Object.values(ExpenseStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setShowFilters(!showFilters)}
                startIcon={<FilterIcon />}
                fullWidth
              >
                {showFilters ? 'Hide Filters' : 'More Filters'}
              </Button>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <Button variant="contained" color="primary" onClick={handleApplyFilters} fullWidth>
                Apply Filters
              </Button>
            </Grid>
            
            {showFilters && (
              <>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    fullWidth
                    type="date"
                    variant="outlined"
                    size="small"
                    label="Start Date"
                    value={filters.startDate}
                    onChange={handleDateChange('startDate')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    fullWidth
                    type="date"
                    variant="outlined"
                    size="small"
                    label="End Date"
                    value={filters.endDate}
                    onChange={handleDateChange('endDate')}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 12, md: 4 }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleResetFilters}
                    fullWidth
                  >
                    Reset Filters
                  </Button>
                </Grid>
              </>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      {error ? (
        <Typography color="error">{error}</Typography>
      ) : expenses.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No expenses found
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            {filters.search || filters.status || filters.startDate || filters.endDate
              ? 'Try adjusting your filters'
              : 'Create your first expense to get started!'}
          </Typography>
          {!filters.search && !filters.status && !filters.startDate && !filters.endDate && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              component={Link}
              to="/expenses/new"
            >
              Create Expense
            </Button>
          )}
        </Paper>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  {isAdmin && <TableCell>Submitted By</TableCell>}
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{expense.title}</TableCell>
                    <TableCell>
                      {new Date(expense.expenseDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {expense.currency} {expense.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>{expense.category.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={expense.status}
                        color={getStatusChipColor(expense.status) as any}
                        size="small"
                      />
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        {expense.userId === user?.id ? 'You' : expense.title.split(' ')[0]} {/* This is a placeholder, normally you'd show the user's name */}
                      </TableCell>
                    )}
                    <TableCell>
                      <Tooltip title="View">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewExpense(expense.id)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      {expense.status === 'DRAFT' && (
                        <>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEditExpense(expense.id)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteExpense(expense.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={pagination.totalItems}
            rowsPerPage={pagination.pageSize}
            page={pagination.page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </Paper>
      )}
    </Box>
  );
};

export default ExpenseList; 