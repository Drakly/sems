import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  Avatar,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Link as MuiLink,
  Paper,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
} from '@mui/material';
import {
  LockOutlined as LockOutlinedIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { login } from '../../store/slices/authSlice';
import { RootState } from '../../store';
import { LoginRequest } from '../../services/authService';

interface LocationState {
  from?: {
    pathname: string;
  };
}

const validationSchema = Yup.object({
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const [rememberMe, setRememberMe] = useState(false);

  const locationState = location.state as LocationState;
  const from = locationState?.from?.pathname || '/';

  const initialValues: LoginRequest = {
    email: '',
    password: '',
  };

  const handleSubmit = async (
    values: LoginRequest,
    { setSubmitting }: FormikHelpers<LoginRequest>
  ) => {
    try {
      await dispatch(login(values) as any);
      setSubmitting(false);
      navigate(from, { replace: true });
    } catch (error) {
      setSubmitting(false);
    }
  };

  // For demo purposes
  const loginAsDemoUser = async () => {
    try {
      const demoUser = {
        email: 'demo@example.com',
        password: 'password123',
      };
      await dispatch(login(demoUser) as any);
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Demo login failed', error);
    }
  };

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100vh', 
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' }
    }}>
      {/* Back to Home Button */}
      <IconButton
        sx={{ 
          position: 'absolute', 
          top: 20, 
          left: 20, 
          zIndex: 10,
          backgroundColor: 'rgba(255,255,255,0.8)',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.9)',
          }
        }}
        onClick={() => navigate('/')}
        aria-label="back to home"
      >
        <ArrowBackIcon />
      </IconButton>

      <Box
        sx={{
          flex: { xs: 0, md: 7 },
          display: { xs: 'none', md: 'block' },
          position: 'relative',
          backgroundImage: 'url(https://source.unsplash.com/random?business,finance)',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay with text */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 4,
            color: 'white',
          }}
        >
          <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
            SEMS
          </Typography>
          <Typography variant="h5" align="center" sx={{ maxWidth: '600px' }}>
            Smart Expense Management System
          </Typography>
        </Box>
      </Box>
      <Box
        component={Paper}
        elevation={6}
        square
        sx={{
          flex: { xs: 1, md: 5 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4
        }}
      >
        <Box
          sx={{
            maxWidth: '450px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
            <LockOutlinedIcon fontSize="large" />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
            Sign in to SEMS
          </Typography>
          <Box sx={{ width: '100%', mb: 2 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form style={{ width: '100%' }}>
                  <Field
                    as={TextField}
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    error={touched.email && Boolean(errors.email)}
                    helperText={touched.email && errors.email}
                    sx={{ mb: 2 }}
                  />
                  <Field
                    as={TextField}
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    error={touched.password && Boolean(errors.password)}
                    helperText={touched.password && errors.password}
                    sx={{ mb: 2 }}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        value="remember"
                        color="primary"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                    }
                    label="Remember me"
                    sx={{ mb: 2 }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{ 
                      mt: 1, 
                      mb: 3, 
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 'bold'
                    }}
                    disabled={isLoading || isSubmitting}
                  >
                    {isLoading ? <CircularProgress size={24} /> : 'SIGN IN'}
                  </Button>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: { xs: 1, sm: 0 }
                  }}>
                    <MuiLink component={Link} to="/forgot-password" variant="body2">
                      Forgot password?
                    </MuiLink>
                    <MuiLink component={Link} to="/register" variant="body2">
                      {"Don't have an account? Sign Up"}
                    </MuiLink>
                  </Box>
                </Form>
              )}
            </Formik>
          </Box>

          {/* Add a divider and demo login */}
          <Divider sx={{ width: '100%', my: 2 }}>
            <Typography variant="body2" color="text.secondary">OR</Typography>
          </Divider>
          
          <Button
            fullWidth
            variant="outlined"
            onClick={loginAsDemoUser}
            sx={{ mt: 2, py: 1.5, borderRadius: 2 }}
          >
            Continue with Demo User
          </Button>

          <Box sx={{ mt: 4, width: '100%', textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} SEMS - Smart Expense Management System
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login; 