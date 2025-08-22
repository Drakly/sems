import React, { useEffect } from 'react';
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



interface ExpensesState {
  userExpenses: Expense[];
  pendingApprovals: Expense[];
  workflowStats: any[] | null;
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
  
  const { isLoading: budgetLoading } = useSelector((state: RootState) => state.budgets) as BudgetsState;
  
    useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("=== DASHBOARD DATA FETCH START ===");
        console.log("User:", user);
        console.log("Auth token:", localStorage.getItem('token'));
        console.log("User ID:", localStorage.getItem('userId'));
        console.log("API Base URL:", process.env.REACT_APP_API_URL || 'http://localhost:8080');
        
        // Always try to fetch data - let the individual services handle authentication
        console.log("Dispatching data fetch actions...");
        
        // Test basic API connectivity first
        try {
          console.log("Testing basic API connectivity...");
          console.log("Current auth token:", localStorage.getItem('token'));
          console.log("Current user ID:", localStorage.getItem('userId'));
          
          const testResponse = await fetch('http://localhost:8080/api/expenses', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(localStorage.getItem('token') && {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              })
            }
          });
          console.log("Direct API test response status:", testResponse.status);
          const responseText = await testResponse.text();
          console.log("Direct API response body:", responseText);
          
          if (!testResponse.ok) {
            console.error("Direct API test failed:", testResponse.statusText);
          }
          
          // Test workflow endpoint
          if (localStorage.getItem('token')) {
            console.log("Testing workflow stats endpoint...");
            const workflowResponse = await fetch('http://localhost:8080/api/v1/expenses/workflow/stats', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            console.log("Workflow API test response status:", workflowResponse.status);
            const workflowText = await workflowResponse.text();
            console.log("Workflow API response body:", workflowText);
          }
        } catch (directApiError) {
          console.error("Direct API test error:", directApiError);
        }
        
        // Dispatch all actions and handle errors individually
        console.log("About to dispatch getUserExpenses...");
        const getUserExpensesPromise = dispatch(getUserExpenses({}) as any);
        
        console.log("About to dispatch getPendingApprovalsForUser...");
        const getPendingApprovalsPromise = dispatch(getPendingApprovalsForUser({}) as any);
        
        console.log("About to dispatch getWorkflowStatistics...");
        const getWorkflowStatsPromise = dispatch(getWorkflowStatistics() as any);
        
        console.log("About to dispatch getBudgetUtilization...");
        const getBudgetUtilizationPromise = dispatch(getBudgetUtilization({}) as any);
        
        const promises = [
          getUserExpensesPromise,
          getPendingApprovalsPromise,
          getWorkflowStatsPromise,
          getBudgetUtilizationPromise
        ];
        
        // Execute all promises but don't fail if some fail
        const results = await Promise.allSettled(promises);
        results.forEach((result, index) => {
          const actionNames = ['getUserExpenses', 'getPendingApprovalsForUser', 'getWorkflowStatistics', 'getBudgetUtilization'];
          if (result.status === 'rejected') {
            console.error(`${actionNames[index]} failed:`, result.reason);
          } else {
            console.log(`${actionNames[index]} succeeded`);
          }
        });
        
        console.log("=== DASHBOARD DATA FETCH COMPLETE ===");
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, [dispatch, user]);

  // Generate real data from API expenses
  const expensesByCategoryData = React.useMemo(() => {
    if (!apiExpenses || apiExpenses.length === 0) {
      console.log("No API expenses data available");
      return [];
    }
    
    console.log("Processing expenses for category chart:", apiExpenses);
    const categoryTotals = apiExpenses.reduce((acc, expense) => {
      // Handle different possible category formats
      let categoryName = 'Other';
      if (expense.category) {
        if (typeof expense.category === 'string') {
          categoryName = expense.category;
        } else if (expense.category.name) {
          categoryName = expense.category.name;
        }
      }
      
      acc[categoryName] = (acc[categoryName] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
    
    console.log("Category totals:", categoryTotals);
    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  }, [apiExpenses]);

  const expensesByMonthData = React.useMemo(() => {
    if (!apiExpenses || apiExpenses.length === 0) {
      console.log("No API expenses data available for monthly chart");
      return [];
    }
    
    console.log("Processing expenses for monthly chart:", apiExpenses);
    const monthTotals = apiExpenses.reduce((acc, expense) => {
      // Handle different possible date formats
      let expenseDate: Date;
      if (typeof expense.expenseDate === 'string') {
        expenseDate = new Date(expense.expenseDate);
      } else {
        expenseDate = new Date(expense.expenseDate);
      }
      
      if (expenseDate && !isNaN(expenseDate.getTime())) {
        const monthName = expenseDate.toLocaleDateString('en-US', { month: 'short' });
        acc[monthName] = (acc[monthName] || 0) + expense.amount;
      } else {
        console.warn("Invalid expense date:", expense.expenseDate, "for expense:", expense);
      }
      
      return acc;
    }, {} as Record<string, number>);
    
    console.log("Monthly totals:", monthTotals);
    return Object.entries(monthTotals).map(([name, amount]) => ({ name, amount }));
  }, [apiExpenses]);

  // Smart insights and analytics
  const smartInsights = React.useMemo(() => {
    if (!apiExpenses || apiExpenses.length === 0) return [];
    
    const insights = [];
    const totalSpent = apiExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const avgExpense = totalSpent / apiExpenses.length;
    
    // High spending alert
    const highExpenses = apiExpenses.filter(e => e.amount > avgExpense * 2);
    if (highExpenses.length > 0) {
      insights.push({
        type: 'warning',
        title: 'High-Value Expenses Detected',
        description: `${highExpenses.length} expenses are significantly above average ($${avgExpense.toFixed(2)})`,
        action: 'Review high-value expenses',
      });
    }
    
    // Spending trend
    const recentExpenses = apiExpenses.filter(e => 
      new Date(e.expenseDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    if (recentExpenses.length > apiExpenses.length * 0.7) {
      insights.push({
        type: 'info',
        title: 'Increased Spending Activity',
        description: `70% of expenses occurred in the last 30 days`,
        action: 'Monitor spending patterns',
      });
    }
    
    return insights;
  }, [apiExpenses]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const countExpensesByStatus = (status: string) => {
    return apiExpenses?.filter((expense: Expense) => expense.status === status).length || 0;
  };

  // Aggregate workflow stats from array
  const getAggregatedStats = () => {
    if (!workflowStats || !Array.isArray(workflowStats)) {
      return { pendingCount: 0, approvedCount: 0, rejectedCount: 0 };
    }
    
    return workflowStats.reduce((acc, stat) => ({
      pendingCount: acc.pendingCount + (stat.pendingCount || 0),
      approvedCount: acc.approvedCount + (stat.approvedCount || 0),
      rejectedCount: acc.rejectedCount + (stat.rejectedCount || 0)
    }), { pendingCount: 0, approvedCount: 0, rejectedCount: 0 });
  };

  const aggregatedStats = getAggregatedStats();

  // Show authentication status for debugging
  if (!user && !localStorage.getItem('token')) {
    return (
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Typography variant="h6">Authentication Required</Typography>
          <Typography>
            You need to be logged in to view the dashboard. Please log in first.
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Debug info: User: {user ? 'Exists' : 'Null'}, Token: {localStorage.getItem('token') ? 'Exists' : 'Missing'}
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (isLoading || budgetLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading expense data: {error}
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
            <Card sx={{ height: '100%' }}>
              <CardActionArea component={Link} to="/expenses/new" sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <AddIcon color="primary" sx={{ fontSize: 40 }} />
                  <Typography variant="h6" component="div">
                    New Expense
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quick expense entry with AI suggestions
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 23%', minWidth: 250 }}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea component={Link} to="/approvals" sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <ApprovalIcon color="secondary" sx={{ fontSize: 40 }} />
                  <Typography variant="h6" component="div">
                    Pending Approvals
                  </Typography>
                  <Typography variant="h5" color="text.secondary">
                    {pendingApprovals?.length || aggregatedStats.pendingCount || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Awaiting your review
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 23%', minWidth: 250 }}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea component={Link} to="/expenses" sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <ReceiptIcon color="info" sx={{ fontSize: 40 }} />
                  <Typography variant="h6" component="div">
                    My Expenses
                  </Typography>
                  <Typography variant="h5" color="text.secondary">
                    {apiExpenses?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total: ${apiExpenses?.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString() || '0'}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 23%', minWidth: 250 }}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea component={Link} to="/reports/new" sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <TrendingUpIcon color="success" sx={{ fontSize: 40 }} />
                  <Typography variant="h6" component="div">
                    Smart Reports
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    AI-powered insights & analytics
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
                        aggregatedStats.pendingCount || 0}
                     </Typography>
            </Box>
            <Box sx={{ flex: '1 1 30%', minWidth: 200, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ApprovalIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">Approved</Typography>
              </Box>
                                                 <Typography variant="h3">
                       {countExpensesByStatus('APPROVED') ||
                        aggregatedStats.approvedCount || 0}
                     </Typography>
            </Box>
            <Box sx={{ flex: '1 1 30%', minWidth: 200, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ErrorIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Rejected</Typography>
              </Box>
                                                 <Typography variant="h3">
                       {countExpensesByStatus('REJECTED') ||
                        aggregatedStats.rejectedCount || 0}
                     </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
      
      {/* Smart Insights */}
      {smartInsights.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Smart Insights
          </Typography>
          <Stack spacing={2}>
            {smartInsights.map((insight, index) => (
              <Alert 
                key={index} 
                severity={insight.type as any}
                action={
                  <Button color="inherit" size="small">
                    {insight.action}
                  </Button>
                }
              >
                <Typography variant="subtitle2">{insight.title}</Typography>
                <Typography variant="body2">{insight.description}</Typography>
              </Alert>
            ))}
          </Stack>
        </Box>
      )}
      
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
              {expensesByCategoryData.length > 0 ? (
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
                    <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Amount']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                  <Typography variant="body2" color="text.secondary">
                    No expense data available
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
          <Box sx={{ flex: '1 1 45%', minWidth: 300 }}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle1" gutterBottom>
                Expenses by Month
              </Typography>
              {expensesByMonthData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={expensesByMonthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, 'Amount']} />
                    <Legend />
                    <Bar dataKey="amount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                  <Typography variant="body2" color="text.secondary">
                    No expense data available
                  </Typography>
                </Box>
              )}
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
          {apiExpenses && apiExpenses.length > 0 ? (
            <Stack spacing={2} divider={<Divider flexItem />}>
              {apiExpenses.slice(0, 5).map((expense: Expense) => (
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
          {apiExpenses && apiExpenses.length > 5 && (
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