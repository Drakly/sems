import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,

  Card,
  CardContent,
  Divider,
  Stack,
  IconButton,
  Alert,
  CircularProgress,
} from '@mui/material';

import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Receipt as ReceiptIcon,
  Send as SubmitIcon,
  Download as DownloadIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { RootState } from '../../store';
import { getExpenseById, deleteExpense, submitExpenseForApproval } from '../../store/slices/expenseSlice';
import { formatCategoryForDisplay } from '../../utils/categoryUtils';

const STATUS_COLORS = {
  DRAFT: 'default',
  SUBMITTED: 'info',
  UNDER_REVIEW: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  CHANGES_REQUESTED: 'warning',
  CANCELLED: 'default',
} as const;

const ExpenseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentExpense, isLoading, error } = useSelector((state: RootState) => state.expenses);

  useEffect(() => {
    if (id) {
      dispatch(getExpenseById(id) as any);
    }
  }, [dispatch, id]);

  const handleEdit = () => {
    navigate(`/expenses/${id}/edit`);
  };

  const handleDelete = async () => {
    if (id && window.confirm('Are you sure you want to delete this expense?')) {
      await dispatch(deleteExpense(id) as any);
      navigate('/expenses');
    }
  };

  const handleSubmitForApproval = async () => {
    if (id) {
      await dispatch(submitExpenseForApproval(id) as any);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!currentExpense) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Expense not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/expenses')}>
            <BackIcon />
          </IconButton>
          <Typography variant="h4">
            Expense Details
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {currentExpense.status === 'DRAFT' && (
            <>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleEdit}
              >
                Edit
              </Button>
              <Button
                variant="contained"
                startIcon={<SubmitIcon />}
                onClick={handleSubmitForApproval}
              >
                Submit for Approval
              </Button>
            </>
          )}
          {['DRAFT', 'CHANGES_REQUESTED'].includes(currentExpense.status) && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
            >
              Delete
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Main Details */}
        <Box sx={{ flex: 2 }}>
          <Paper sx={{ p: 3 }}>
            <Stack spacing={3}>
              {/* Title and Status */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h5" gutterBottom>
                    {currentExpense.title}
                  </Typography>
                  {currentExpense.description && (
                    <Typography variant="body1" color="text.secondary">
                      {currentExpense.description}
                    </Typography>
                  )}
                </Box>
                <Chip
                  label={currentExpense.status}
                  color={STATUS_COLORS[currentExpense.status as keyof typeof STATUS_COLORS] as any}
                />
              </Box>

              <Divider />

              {/* Amount */}
              <Box>
                <Typography variant="h3" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MoneyIcon fontSize="large" />
                  {currentExpense.currency} {currentExpense.amount.toLocaleString()}
                </Typography>
              </Box>

              <Divider />

              {/* Details Grid */}
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CategoryIcon />
                    <Typography variant="subtitle2" color="text.secondary">
                      Category
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {formatCategoryForDisplay(currentExpense.category) || 'Not specified'}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarIcon />
                    <Typography variant="subtitle2" color="text.secondary">
                      Expense Date
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {new Date(currentExpense.expenseDate).toLocaleDateString()}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <PersonIcon />
                    <Typography variant="subtitle2" color="text.secondary">
                      Created By
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    User ID: {currentExpense.userId}
                  </Typography>
                </Box>

                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarIcon />
                    <Typography variant="subtitle2" color="text.secondary">
                      Created On
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {new Date(currentExpense.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>

              {/* Receipt Section */}
              {currentExpense.receiptUrl && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ReceiptIcon />
                      Receipt
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      href={currentExpense.receiptUrl}
                      target="_blank"
                    >
                      View Receipt
                    </Button>
                  </Box>
                </>
              )}

              {/* Comments Section */}
              {currentExpense.reviewComments && (
                <>
                  <Divider />
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Comments
                    </Typography>
                    <Typography variant="body1">
                      {currentExpense.reviewComments}
                    </Typography>
                  </Box>
                </>
              )}
            </Stack>
          </Paper>
        </Box>

        {/* Sidebar */}
        <Box sx={{ flex: 1 }}>
          <Stack spacing={3}>
            {/* Status Timeline */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Status Timeline
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: 'success.main',
                      }}
                    />
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        Created
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(currentExpense.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                  
                  {currentExpense.status !== 'DRAFT' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: 'info.main',
                        }}
                      />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          Submitted
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(currentExpense.updatedAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  {['APPROVED', 'REJECTED'].includes(currentExpense.status) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: currentExpense.status === 'APPROVED' ? 'success.main' : 'error.main',
                        }}
                      />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {currentExpense.status === 'APPROVED' ? 'Approved' : 'Rejected'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(currentExpense.updatedAt).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Expense Flags */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Expense Flags
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1}>
                  {currentExpense.requiresReceipt && (
                    <Chip
                      label="Receipt Required"
                      size="small"
                      color={currentExpense.receiptUrl ? 'success' : 'warning'}
                      variant="outlined"
                    />
                  )}
                  {currentExpense.flaggedForReview && (
                    <Chip
                      label="Flagged for Review"
                      size="small"
                      color="warning"
                      variant="outlined"
                    />
                  )}
                  {currentExpense.amount > 1000 && (
                    <Chip
                      label="High Value"
                      size="small"
                      color="info"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DownloadIcon />}
                    fullWidth
                  >
                    Export PDF
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ReceiptIcon />}
                    fullWidth
                    onClick={() => navigate('/expenses/new')}
                  >
                    Create Similar
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default ExpenseDetail;