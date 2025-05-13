import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Home component
import HomePage from './components/home/HomePage';

// Auth components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Redux
import { RootState } from './store';
import { getCurrentUser } from './store/slices/authSlice';

// Define UIState interface to match the one in uiSlice.ts
interface UIState {
  darkMode: boolean;
  // Add other properties as needed
  drawerOpen: boolean;
  notifications: any[];
  alertMessage: {
    type: 'success' | 'error' | 'info' | 'warning' | null;
    message: string | null;
  };
  modalState: {
    open: boolean;
    type: string | null;
    data: any | null;
  };
}

// Create placeholder components for dashboard and other sections
// MainLayout that renders Outlet for nested routes
const MainLayout: React.FC = () => (
  <Box sx={{ width: '100%' }}>
    <Outlet />
  </Box>
);

const Dashboard = () => <div>Dashboard</div>;
const ExpenseList = () => <div>Expense List</div>;
const ExpenseDetail = () => <div>Expense Detail</div>;
const ExpenseForm = () => <div>Expense Form</div>;
const ApprovalList = () => <div>Approval List</div>;
const ApprovalDetail = () => <div>Approval Detail</div>;
const BudgetList = () => <div>Budget List</div>;
const BudgetDetail = () => <div>Budget Detail</div>;
const BudgetForm = () => <div>Budget Form</div>;
const ReportList = () => <div>Report List</div>;
const ReportDetail = () => <div>Report Detail</div>;
const ReportForm = () => <div>Report Form</div>;

const App: React.FC = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  // Properly access the darkMode property with type casting
  const ui = useSelector((state: RootState) => state.ui) as UIState;
  const darkMode = ui?.darkMode || false;

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
        <Box sx={{ 
          minHeight: '100vh', 
          width: '100%',
          // Use flex container for the authenticated routes, block for HomePage
          display: 'flex' 
        }}>
          <Routes>
            {/* Public Home Page */}
            <Route path="/" element={<HomePage />} />

            {/* Auth routes */}
            <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
              <Route element={<MainLayout />}>
                {/* Dashboard */}
                <Route path="/dashboard" element={<Dashboard />} />

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
