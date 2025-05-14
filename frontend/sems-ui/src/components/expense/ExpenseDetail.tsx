import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Edit as EditIcon,
  Send as SubmitIcon,
  Comment as CommentIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { 
  getExpenseById, 
  submitExpenseForApproval, 
  getApprovalHistory,
  approveExpense,
  rejectExpense,
  requestExpenseChanges
} from '../../store/slices/expenseSlice';
import { RootState } from '../../store';
import { ApprovalStep, Expense, ExpenseStatus, ApprovalAction } from '../../types';

const ExpenseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedExpense, approvalHistory, isLoading, error } = useSelector(
    (state: RootState) => state.expenses
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'requestChanges' | null>(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(getExpenseById(id) as any);
      dispatch(getApprovalHistory(id) as any);
    }
  }, [dispatch, id]);

  const handleSubmitForApproval = () => {
    if (id) {
      dispatch(submitExpenseForApproval(id) as any);
    }
  };

  const handleEditExpense = () => {
    navigate(`/expenses/${id}/edit`);
  };

  const openActionDialog = (type: 'approve' | 'reject' | 'requestChanges') => {
    setActionType(type);
    setCommentDialogOpen(true);
  };

  const closeActionDialog = () => {
    setActionType(null);
    setCommentDialogOpen(false);
    setComment('');
  };

  const handleActionSubmit = () => {
    if (!id || !actionType) return;

    switch (actionType) {
      case 'approve':
        dispatch(approveExpense({ id, comments: comment }) as any);
        break;
      case 'reject':
        dispatch(rejectExpense({ id, reason: comment }) as any);
        break;
      case 'requestChanges':
        dispatch(requestExpenseChanges({ id, comments: comment }) as any);
        break;
    }
    closeActionDialog();
  };

  const getStatusChip = (status: ExpenseStatus) => {
    let color:
      | 'default'
      | 'primary'
      | 'secondary'
      | 'error'
      | 'info'
      | 'success'
      | 'warning';
    switch (status) {
      case ExpenseStatus.DRAFT:
        color = 'default';
        break;
      case ExpenseStatus.SUBMITTED:
        color = 'info';
        break;
      case ExpenseStatus.UNDER_REVIEW:
        color = 'warning';
        break;
      case ExpenseStatus.APPROVED:
        color = 'success';
        break;
      case ExpenseStatus.REJECTED:
        color = 'error';
        break;
      case ExpenseStatus.PAID:
        color = 'primary';
        break;
      case ExpenseStatus.CHANGES_REQUESTED:
        color = 'secondary';
        break;
      default:
        color = 'default';
    }
    return <Chip label={status} color={color} />;
  };

  const canSubmitForApproval = selectedExpense && selectedExpense.status === ExpenseStatus.DRAFT;
  const canApprove = selectedExpense && 
    (selectedExpense.status === ExpenseStatus.SUBMITTED || 
    selectedExpense.status === ExpenseStatus.UNDER_REVIEW) && 
    user?.role !== 'USER';
  const isOwnExpense = selectedExpense && selectedExpense.userId === user?.id;

  if (isLoading && !selectedExpense) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
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

  if (!selectedExpense) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Expense not found</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Expense Details</Typography>
        <Box>
          {canSubmitForApproval && isOwnExpense && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<SubmitIcon />}
              onClick={handleSubmitForApproval}
              sx={{ mr: 1 }}
            >
              Submit for Approval
            </Button>
          )}
          {selectedExpense.status === ExpenseStatus.DRAFT && isOwnExpense && (
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={handleEditExpense}
            >
              Edit
            </Button>
          )}
        </Box>
      </Box>

      {/* Expense Info */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
              <Typography variant="body2" color="text.secondary">
                Title
              </Typography>
              <Typography variant="body1" gutterBottom>
                {selectedExpense.title}
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
              <Typography variant="body2" color="text.secondary">
                Status
              </Typography>
              {getStatusChip(selectedExpense.status)}
            </Box>
            <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
              <Typography variant="body2" color="text.secondary">
                Amount
              </Typography>
              <Typography variant="body1" gutterBottom>
                {selectedExpense.currency} {selectedExpense.amount.toFixed(2)}
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
              <Typography variant="body2" color="text.secondary">
                Category
              </Typography>
              <Typography variant="body1" gutterBottom>
                {selectedExpense.category?.name || 'N/A'}
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
              <Typography variant="body2" color="text.secondary">
                Date
              </Typography>
              <Typography variant="body1" gutterBottom>
                {new Date(selectedExpense.expenseDate).toLocaleDateString()}
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 45%', minWidth: '250px' }}>
              <Typography variant="body2" color="text.secondary">
                Created At
              </Typography>
              <Typography variant="body1" gutterBottom>
                {new Date(selectedExpense.createdAt).toLocaleString()}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ width: '100%' }}>
            <Typography variant="body2" color="text.secondary">
              Description
            </Typography>
            <Typography variant="body1" gutterBottom>
              {selectedExpense.description || 'No description provided'}
            </Typography>
          </Box>
        </Box>

        {selectedExpense.receiptUrl && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ReceiptIcon />}
              href={selectedExpense.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Receipt
            </Button>
          </Box>
        )}
      </Paper>

      {/* Approval actions for approvers */}
      {canApprove && !isOwnExpense && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Approval Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<ApproveIcon />}
                onClick={() => openActionDialog('approve')}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<RejectIcon />}
                onClick={() => openActionDialog('reject')}
              >
                Reject
              </Button>
              <Button
                variant="contained"
                color="warning"
                startIcon={<CommentIcon />}
                onClick={() => openActionDialog('requestChanges')}
              >
                Request Changes
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Approval History */}
      {approvalHistory && approvalHistory.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <HistoryIcon sx={{ mr: 1 }} />
            Approval History
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>By</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>Comments</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {approvalHistory.map((step: ApprovalStep) => (
                  <TableRow key={step.id}>
                    <TableCell>
                      {new Date(step.actionDate).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={step.action}
                        color={
                          step.action === ApprovalAction.APPROVE
                            ? 'success'
                            : step.action === ApprovalAction.REJECT
                            ? 'error'
                            : 'warning'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{step.approverName || 'System'}</TableCell>
                    <TableCell>{step.level}</TableCell>
                    <TableCell>{step.comments || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Action Dialog */}
      <Dialog open={commentDialogOpen} onClose={closeActionDialog}>
        <DialogTitle>
          {actionType === 'approve'
            ? 'Approve Expense'
            : actionType === 'reject'
            ? 'Reject Expense'
            : 'Request Changes'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {actionType === 'approve'
              ? 'Add optional comments for this approval:'
              : actionType === 'reject'
              ? 'Please explain why this expense is being rejected:'
              : 'Please describe the changes needed for this expense:'}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="comment"
            label="Comments"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required={actionType !== 'approve'}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeActionDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleActionSubmit} 
            color="primary"
            disabled={(actionType !== 'approve' && !comment.trim())}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExpenseDetail; 