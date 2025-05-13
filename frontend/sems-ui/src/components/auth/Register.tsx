import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Avatar,
  Button,
  TextField,
  Link as MuiLink,
  Paper,
  Box,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider,
  IconButton,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { 
  PersonAdd as PersonAddIcon,
  ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { register } from '../../store/slices/authSlice';
import { RootState } from '../../store';
import { RegisterRequest } from '../../services/authService';

// For demo purposes, we'll use a static list of departments
const departments = [
  { id: 'Finance', name: 'Finance' },
  { id: 'HR', name: 'HR' },
  { id: 'IT', name: 'IT' },
  { id: 'Marketing', name: 'Marketing' },
  { id: 'Operations', name: 'Operations' },
];

const validationSchema = Yup.object({
  username: Yup.string().required('Username is required'),
  firstName: Yup.string().required('First name is required'),
  lastName: Yup.string().required('Last name is required'),
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string()
    .min(8, 'Password should be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  department: Yup.string().required('Department is required'),
});

interface FormValues extends RegisterRequest {
  confirmPassword: string;
}

const Register: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Personal Information', 'Account Details'];

  const initialValues: FormValues = {
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    role: 'USER',
  };

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    try {
      const { confirmPassword, ...registerData } = values;
      console.log('Submitting registration data:', registerData);
      
      // Add direct API call for debugging
      try {
        const response = await fetch('http://localhost:8080/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registerData),
        });
        
        const data = await response.json();
        console.log('Direct API response:', response.status, data);
        
        if (response.ok) {
          setRegistrationSuccess(true);
          // Redirect to login after successful registration
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          console.error('Registration failed:', data);
        }
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
      }
      
      setSubmitting(false);
    } catch (error) {
      console.error('Registration error:', error);
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
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
          backgroundImage: 'url(https://source.unsplash.com/random?business,teamwork)',
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
            Join SEMS
          </Typography>
          <Typography variant="h5" align="center" sx={{ maxWidth: '600px' }}>
            Create an account to start managing your expenses professionally
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
          p: 4,
          overflowY: 'auto'
        }}
      >
        <Box
          sx={{
            maxWidth: '500px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main', width: 56, height: 56 }}>
            <PersonAddIcon fontSize="large" />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
            Sign up for SEMS
          </Typography>
          
          {/* Add stepper for better UX */}
          <Stepper activeStep={activeStep} sx={{ width: '100%', mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <Box sx={{ width: '100%', mb: 2 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {registrationSuccess && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Registration successful! Redirecting to login...
              </Alert>
            )}
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, values, handleChange, isSubmitting }) => (
                <Form style={{ width: '100%' }}>
                  {activeStep === 0 ? (
                    <>
                      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 1 }}>
                        <Field
                          as={TextField}
                          margin="normal"
                          required
                          fullWidth
                          id="firstName"
                          label="First Name"
                          name="firstName"
                          autoComplete="given-name"
                          error={touched.firstName && Boolean(errors.firstName)}
                          helperText={touched.firstName && errors.firstName}
                        />
                        <Field
                          as={TextField}
                          margin="normal"
                          required
                          fullWidth
                          id="lastName"
                          label="Last Name"
                          name="lastName"
                          autoComplete="family-name"
                          error={touched.lastName && Boolean(errors.lastName)}
                          helperText={touched.lastName && errors.lastName}
                        />
                      </Box>
                      
                      <Field
                        as={TextField}
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        error={touched.username && Boolean(errors.username)}
                        helperText={touched.username && errors.username}
                        sx={{ mb: 2 }}
                      />
                      
                      <FormControl fullWidth margin="normal" error={touched.department && Boolean(errors.department)} sx={{ mb: 2 }}>
                        <InputLabel id="department-label">Department</InputLabel>
                        <Field
                          as={Select}
                          labelId="department-label"
                          id="department"
                          name="department"
                          label="Department"
                          value={values.department}
                          onChange={handleChange}
                        >
                          {departments.map((dept) => (
                            <MenuItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </MenuItem>
                          ))}
                        </Field>
                        {touched.department && errors.department && (
                          <FormHelperText>{errors.department}</FormHelperText>
                        )}
                      </FormControl>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', mt: 3 }}>
                        <Button 
                          variant="contained" 
                          onClick={handleNext}
                          sx={{ borderRadius: 2 }}
                        >
                          Next
                        </Button>
                      </Box>
                    </>
                  ) : (
                    <>
                      <Field
                        as={TextField}
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
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
                        autoComplete="new-password"
                        error={touched.password && Boolean(errors.password)}
                        helperText={touched.password && errors.password}
                        sx={{ mb: 2 }}
                      />
                      
                      <Field
                        as={TextField}
                        margin="normal"
                        required
                        fullWidth
                        name="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        id="confirmPassword"
                        error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                        helperText={touched.confirmPassword && errors.confirmPassword}
                        sx={{ mb: 3 }}
                      />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                        <Button 
                          onClick={handleBack}
                          sx={{ borderRadius: 2 }}
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          disabled={isLoading || isSubmitting}
                          sx={{ borderRadius: 2 }}
                        >
                          {isLoading ? <CircularProgress size={24} /> : 'Sign Up'}
                        </Button>
                      </Box>
                    </>
                  )}
                  
                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <MuiLink component={Link} to="/login" variant="body2">
                      Already have an account? Sign In
                    </MuiLink>
                  </Box>
                </Form>
              )}
            </Formik>
          </Box>
          
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

export default Register; 