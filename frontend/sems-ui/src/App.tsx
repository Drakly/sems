import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Layout
import MainLayout from './layout/MainLayout';

// Auth components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Dashboard components
import Dashboard from './components/dashboard/Dashboard';

// Expense components
import ExpenseList from './components/expense/ExpenseList';
import ExpenseDetail from './components/expense/ExpenseDetail';
import ExpenseForm from './components/expense/ExpenseForm';

// Approval components
import ApprovalList from './components/approval/ApprovalList';
import ApprovalDetail from './components/approval/ApprovalDetail';

// Budget components
import BudgetList from './components/budget/BudgetList';
import BudgetDetail from './components/budget/BudgetDetail';
import BudgetForm from './components/budget/BudgetForm';

// Report components
import ReportList from './components/reports/ReportList';
import ReportDetail from './components/reports/ReportDetail';
import ReportForm from './components/reports/ReportForm';

// Redux
import { RootState } from './store';
import { getCurrentUser } from './store/slices/authSlice';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { darkMode } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    // Try to load the current user if there's a token
    if (localStorage.getItem('token')) {
      dispatch(getCurrentUser() as any);
    }
  }, [dispatch]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#3f51b5',
      },
      secondary: {
        main: '#f50057',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
              <Route element={<MainLayout />}>
                {/* Dashboard */}
                <Route path="/" element={<Dashboard />} />

                {/* Expenses */}
                <Route path="/expenses" element={<ExpenseList />} />
                <Route path="/expenses/new" element={<ExpenseForm />} />
                <Route path="/expenses/:id" element={<ExpenseDetail />} />
                <Route path="/expenses/:id/edit" element={<ExpenseForm />} />

                {/* Approvals */}
                <Route path="/approvals" element={<ApprovalList />} />
                <Route path="/approvals/:id" element={<ApprovalDetail />} />

                {/* Budgets */}
                <Route path="/budgets" element={<BudgetList />} />
                <Route path="/budgets/new" element={<BudgetForm />} />
                <Route path="/budgets/:id" element={<BudgetDetail />} />
                <Route path="/budgets/:id/edit" element={<BudgetForm />} />

                {/* Reports */}
                <Route path="/reports" element={<ReportList />} />
                <Route path="/reports/new" element={<ReportForm />} />
                <Route path="/reports/:id" element={<ReportDetail />} />
              </Route>
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;
