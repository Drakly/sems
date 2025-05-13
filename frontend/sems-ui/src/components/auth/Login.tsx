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
} from '@mui/material';
import { LockOutlined as LockOutlinedIcon } from '@mui/icons-material';
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

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100vh', 
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' }
    }}>
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
      />
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
        </Box>
      </Box>
    </Box>
  );
};

export default Login; 