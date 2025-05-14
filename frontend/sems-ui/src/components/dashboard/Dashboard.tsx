import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Alert,
  Stack,
  Divider,
  Grid,
} from '@mui/material';
import {
  AddCircleOutline as AddIcon,
  TrendingUp as TrendingUpIcon,
  Receipt as ReceiptIcon,
  CheckCircleOutline as ApprovalIcon,
  ErrorOutline as ErrorIcon,
  Pending as PendingIcon,
} from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { RootState } from '../../store';
import { getUserExpenses, getPendingApprovalsForUser, getWorkflowStatistics } from '../../store/slices/expenseSlice';
import { getBudgetUtilization } from '../../store/slices/budgetSlice';
import { Expense } from '../../types';

// Demo data in case the API calls fail
const DEMO_EXPENSES = [
  {
    id: '1',
    title: 'Business Lunch',
    amount: 75.50,
    currency: 'USD',
    status: 'APPROVED',
    expenseDate: new Date().toISOString(),
    description: 'Lunch with clients',
    category: { name: 'Meals' }
  },
  {
    id: '2',
    title: 'Office Supplies',
    amount: 120.75,
    currency: 'USD',
    status: 'SUBMITTED',
    expenseDate: new Date().toISOString(),
    description: 'Paper, pens, and notebooks',
    category: { name: 'Office Supplies' }
  },
  {
    id: '3',
    title: 'Travel to Conference',
    amount: 550.00,
    currency: 'USD',
    status: 'UNDER_REVIEW',
    expenseDate: new Date().toISOString(),
    description: 'Flight tickets to industry conference',
    category: { name: 'Travel' }
  }
];

const DEMO_STATS = {
  pendingCount: 3,
  approvedCount: 5,
  rejectedCount: 1,
  changesRequestedCount: 2,
  averageApprovalTime: 48,
  byDepartment: {
    'IT': { pendingCount: 1, approvedCount: 2, rejectedCount: 0 },
    'Marketing': { pendingCount: 2, approvedCount: 1, rejectedCount: 1 },
    'Finance': { pendingCount: 0, approvedCount: 2, rejectedCount: 0 }
  }
};

interface ExpensesState {
  userExpenses: Expense[];
  pendingApprovals: Expense[];
  workflowStats: any;
  isLoading: boolean;
  error: string | null;
}

interface BudgetsState {
  utilizationData: any;
  isLoading: boolean;
  error: string | null;
}

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { 
    userExpenses: apiExpenses, 
    pendingApprovals, 
    workflowStats, 
    isLoading, 
    error 
  } = useSelector((state: RootState) => state.expenses) as ExpensesState;
  
  const { utilizationData, isLoading: budgetLoading } = useSelector((state: RootState) => state.budgets) as BudgetsState;
  
  const [loadingFailed, setLoadingFailed] = useState(false);
  const [userExpenses, setUserExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching dashboard data...");
        await dispatch(getUserExpenses({}) as any);
        await dispatch(getPendingApprovalsForUser({}) as any);
        await dispatch(getWorkflowStatistics() as any);
        await dispatch(getBudgetUtilization({}) as any);
        setLoadingFailed(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoadingFailed(true);
      }
    };
    
    fetchData();
  }, [dispatch]);

  // Use API data if available, otherwise use demo data
  useEffect(() => {
    if (apiExpenses && apiExpenses.length > 0) {
      setUserExpenses(apiExpenses);
    } else if (loadingFailed || error) {
      console.log("Using demo expenses data");
      setUserExpenses(DEMO_EXPENSES as any);
    }
  }, [apiExpenses, loadingFailed, error]);

  // Sample data for charts
  const expensesByCategoryData = [
    { name: 'Travel', value: 4000 },
    { name: 'Meals', value: 3000 },
    { name: 'Office Supplies', value: 2000 },
    { name: 'Equipment', value: 2780 },
    { name: 'Other', value: 1890 },
  ];

  const expensesByMonthData = [
    { name: 'Jan', amount: 4000 },
    { name: 'Feb', amount: 3000 },
    { name: 'Mar', amount: 2000 },
    { name: 'Apr', amount: 2780 },
    { name: 'May', amount: 1890 },
    { name: 'Jun', amount: 2390 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const countExpensesByStatus = (status: string) => {
    return userExpenses?.filter((expense: Expense) => expense.status === status).length || 0;
  };

  if (isLoading || budgetLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {loadingFailed && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Could not connect to expense services. Showing demo data for preview purposes.
        </Alert>
      )}
      
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.firstName || 'User'}!
      </Typography>
      
      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ flex: '1 1 23%', minWidth: 250 }}>
            <Card>
              <CardActionArea component={Link} to="/expenses/new">
                <CardContent sx={{ textAlign: 'center' }}>
                  <AddIcon color="primary" sx={{ fontSize: 40 }} />
                  <Typography variant="h6" component="div">
                    New Expense
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 23%', minWidth: 250 }}>
            <Card>
              <CardActionArea component={Link} to="/approvals">
                <CardContent sx={{ textAlign: 'center' }}>
                  <ApprovalIcon color="secondary" sx={{ fontSize: 40 }} />
                  <Typography variant="h6" component="div">
                    Pending Approvals
                  </Typography>
                  <Typography variant="h5" color="text.secondary">
                    {pendingApprovals?.length || workflowStats?.pendingCount || 0}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 23%', minWidth: 250 }}>
            <Card>
              <CardActionArea component={Link} to="/expenses">
                <CardContent sx={{ textAlign: 'center' }}>
                  <ReceiptIcon color="info" sx={{ fontSize: 40 }} />
                  <Typography variant="h6" component="div">
                    My Expenses
                  </Typography>
                  <Typography variant="h5" color="text.secondary">
                    {userExpenses?.length || 0}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 23%', minWidth: 250 }}>
            <Card>
              <CardActionArea component={Link} to="/reports/new">
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
                  <Typography variant="h6" component="div">
                    Generate Report
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Box>
        </Box>
      </Box>
      
      {/* Expense Status Overview */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Expense Status Overview
        </Typography>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, justifyContent: 'space-between' }}>
            <Box sx={{ flex: '1 1 30%', minWidth: 200, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PendingIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Pending</Typography>
              </Box>
              <Typography variant="h3">
                {countExpensesByStatus('SUBMITTED') + countExpensesByStatus('UNDER_REVIEW') || 
                 workflowStats?.pendingCount || DEMO_STATS.pendingCount}
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 30%', minWidth: 200, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ApprovalIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Approved</Typography>
              </Box>
              <Typography variant="h3">
                {countExpensesByStatus('APPROVED') || 
                 workflowStats?.approvedCount || DEMO_STATS.approvedCount}
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 30%', minWidth: 200, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ErrorIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Rejected</Typography>
              </Box>
              <Typography variant="h3">
                {countExpensesByStatus('REJECTED') || 
                 workflowStats?.rejectedCount || DEMO_STATS.rejectedCount}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
      
      {/* Charts */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Expense Analytics
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 45%', minWidth: 300 }}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle1" gutterBottom>
                Expenses by Category
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expensesByCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expensesByCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
          <Box sx={{ flex: '1 1 45%', minWidth: 300 }}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle1" gutterBottom>
                Expenses by Month
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expensesByMonthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
        </Box>
      </Box>
      
      {/* Recent Activity */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <Paper sx={{ p: 2 }}>
          {userExpenses && userExpenses.length > 0 ? (
            <Stack spacing={2} divider={<Divider flexItem />}>
              {userExpenses.slice(0, 5).map((expense: Expense) => (
                <Box key={expense.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="subtitle1">{expense.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(expense.expenseDate).toLocaleDateString()} - {expense.currency} {expense.amount.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        color: expense.status === 'APPROVED' ? 'success.main' : 
                               expense.status === 'REJECTED' ? 'error.main' : 'warning.main' 
                      }}
                    >
                      {expense.status}
                    </Typography>
                    <Button component={Link} to={`/expenses/${expense.id}`} size="small">View</Button>
                  </Box>
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="body1" align="center" sx={{ py: 3 }}>
              No recent expenses found. Create your first expense to get started!
            </Typography>
          )}
          {userExpenses && userExpenses.length > 5 && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button component={Link} to="/expenses" variant="outlined">View All</Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard; 