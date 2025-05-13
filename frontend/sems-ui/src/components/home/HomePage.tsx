import React, { useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  Paper,
  Divider,
  ThemeProvider,
  createTheme
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon,
  Visibility as VisionIcon,
  AccountBalance as BudgetIcon,
  Receipt as ReceiptIcon,
  Assessment as ReportIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import HomeNavBar from './HomeNavBar';
import './HomePage.css'; // Import the CSS file

// Import hero image and feature images
// Note: You'll need to add these images to your public/images folder
const heroImage = '/images/hero-background.jpg';
const featureImage1 = '/images/feature-expenses.jpg';
const featureImage2 = '/images/feature-reports.jpg';
const featureImage3 = '/images/feature-budgets.jpg';

// Create a custom theme inspired by MotionLabs
const homeTheme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5', // Deep blue similar to the MotionLabs blue
      light: '#757de8',
      dark: '#002984',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f50057', // Pink accent
      light: '#ff5983',
      dark: '#bb002f',
      contrastText: '#ffffff',
    },
    background: {
      default: '#ffffff',
      paper: '#f9f9f9',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    }
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
});

const HomePage: React.FC = () => {
  // Add a class to the body when the component mounts
  useEffect(() => {
    document.body.classList.add('home-page');
    
    // Clean up function to remove the class when component unmounts
    return () => {
      document.body.classList.remove('home-page');
    };
  }, []);

  return (
    <ThemeProvider theme={homeTheme}>
      <Box 
        className="home-container"
        sx={{ 
          width: '100vw', 
          overflow: 'visible',
          overflowX: 'hidden',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          // Do not set a bottom constraint to allow content to flow
          // Override parent flex properties
          display: 'block !important',
          flex: 'unset !important',
          minHeight: '100vh', // Use minHeight instead of fixed height
          height: 'auto' // Allow content to determine height
        }}
      >
        {/* Navigation */}
        <HomeNavBar />
        
        {/* Hero Section */}
        <Box 
          className="home-section"
          sx={{
            position: 'relative',
            height: '90vh', // Slightly shorter than 100vh to make it obvious there's more content
            minHeight: '600px', // Set a minimum height for smaller screens
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'white',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1
            },
            // Add a subtle indicator to show more content below
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              width: '40px',
              height: '40px',
              borderBottom: '3px solid white',
              borderRight: '3px solid white',
              transform: 'translateX(-50%) rotate(45deg)',
              animation: 'bounce 2s infinite',
              zIndex: 2
            },
            '@keyframes bounce': {
              '0%, 20%, 50%, 80%, 100%': { transform: 'translateX(-50%) translateY(0) rotate(45deg)' },
              '40%': { transform: 'translateX(-50%) translateY(-20px) rotate(45deg)' },
              '60%': { transform: 'translateX(-50%) translateY(-10px) rotate(45deg)' }
            }
          }}
        >
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
            <Typography 
              variant="h1" 
              component="h1" 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' } 
              }}
            >
              Your Smart Expense Management System
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                mb: 4,
                maxWidth: '800px',
                fontSize: { xs: '1.2rem', md: '1.5rem', lg: '1.8rem' } 
              }}
            >
              Professional expense tracking and management for businesses of all sizes
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                size="large" 
                component={Link} 
                to="/register"
                sx={{ 
                  py: 1.5, 
                  px: 4, 
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  backgroundColor: homeTheme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: homeTheme.palette.primary.dark
                  }
                }}
              >
                Get Started
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                component={Link}
                to="/login"
                sx={{ 
                  py: 1.5, 
                  px: 4, 
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                Sign In
              </Button>
            </Box>
          </Container>
        </Box>

        {/* About Section */}
        <Box className="home-section" sx={{ py: 10, backgroundColor: homeTheme.palette.background.default }}>
          <Container maxWidth="lg">
            <Grid container spacing={6} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h2" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
                  Your Comprehensive Solution for Expense Management
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.7 }}>
                  SEMS is a modern expense management system designed for businesses to streamline 
                  expense reporting, approvals, and budgeting. Our platform is equipped with professional 
                  tools to help you track, manage, and analyze all your business expenses efficiently.
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', lineHeight: 1.7 }}>
                  Our system is perfect for:
                </Typography>
                <List>
                  <ListItem sx={{ pl: 0 }}>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Expense tracking and reporting" />
                  </ListItem>
                  <ListItem sx={{ pl: 0 }}>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Budget planning and monitoring" />
                  </ListItem>
                  <ListItem sx={{ pl: 0 }}>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Approval workflows and notifications" />
                  </ListItem>
                  <ListItem sx={{ pl: 0 }}>
                    <ListItemIcon>
                      <CheckCircleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="Financial reporting and analytics" />
                  </ListItem>
                </List>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box 
                  component="img" 
                  src={featureImage1}
                  alt="SEMS Dashboard Preview"
                  sx={{ 
                    width: '100%', 
                    height: 'auto', 
                    borderRadius: 3,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                  }}
                />
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Features Section */}
        <Box 
          id="features"
          className="home-section"
          sx={{ py: 10, backgroundColor: 'rgba(0,0,0,0.02)' }}
        >
          <Container maxWidth="lg">
            <Typography 
              variant="h2" 
              component="h2" 
              align="center" 
              sx={{ mb: 6, fontWeight: 600 }}
            >
              Professional Features for Your Business
            </Typography>
            <Grid container spacing={4}>
              {/* Feature 1 */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={featureImage1}
                    alt="Expense Tracking"
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ReceiptIcon sx={{ mr: 1, color: homeTheme.palette.primary.main }} />
                      <Typography variant="h5" component="h3" fontWeight={600}>
                        Expense Tracking
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      Easily track and categorize all business expenses. Upload receipts, add descriptions,
                      and submit for approval all in one place.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Feature 2 */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={featureImage2}
                    alt="Reporting Analytics"
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ReportIcon sx={{ mr: 1, color: homeTheme.palette.primary.main }} />
                      <Typography variant="h5" component="h3" fontWeight={600}>
                        Reporting Analytics
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      Generate comprehensive reports and analytics to help you understand spending patterns
                      and identify cost-saving opportunities.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Feature 3 */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={featureImage3}
                    alt="Budget Management"
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <BudgetIcon sx={{ mr: 1, color: homeTheme.palette.primary.main }} />
                      <Typography variant="h5" component="h3" fontWeight={600}>
                        Budget Management
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      Set budgets for different departments or projects, track spending against those budgets,
                      and receive alerts when spending approaches limits.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Testimonials Section */}
        <Box 
          id="why-sems"
          className="home-section"
          sx={{ py: 10, backgroundColor: homeTheme.palette.background.default }}
        >
          <Container maxWidth="lg">
            <Typography 
              variant="h2" 
              component="h2" 
              align="center" 
              sx={{ mb: 6, fontWeight: 600 }}
            >
              Why Choose SEMS?
            </Typography>
            <Grid container spacing={4}>
              {/* Reason 1 */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper 
                  sx={{ 
                    p: 4, 
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
                    }
                  }}
                >
                  <VisionIcon color="primary" sx={{ fontSize: 50, mb: 2 }} />
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    User-Friendly Interface
                  </Typography>
                  <Typography>
                    Our intuitive interface makes expense management simple for everyone in your organization,
                    from employees submitting expenses to managers approving them.
                  </Typography>
                </Paper>
              </Grid>
              
              {/* Reason 2 */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper 
                  sx={{ 
                    p: 4, 
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
                    }
                  }}
                >
                  <BudgetIcon color="primary" sx={{ fontSize: 50, mb: 2 }} />
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    Comprehensive Solution
                  </Typography>
                  <Typography>
                    SEMS provides a complete expense management ecosystem with features for tracking,
                    reporting, approving, and analyzing business expenses.
                  </Typography>
                </Paper>
              </Grid>
              
              {/* Reason 3 */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper 
                  sx={{ 
                    p: 4, 
                    height: '100%',
                    borderRadius: 3,
                    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.08)'
                    }
                  }}
                >
                  <ReportIcon color="primary" sx={{ fontSize: 50, mb: 2 }} />
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
                    Data-Driven Insights
                  </Typography>
                  <Typography>
                    Our powerful analytics tools help you understand spending patterns and make
                    informed decisions to optimize your organization's finances.
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* CTA Section */}
        <Box 
          id="contact"
          className="home-section"
          sx={{ 
            py: 10, 
            backgroundColor: homeTheme.palette.primary.main,
            color: 'white'
          }}
        >
          <Container maxWidth="md" sx={{ textAlign: 'center' }}>
            <Typography variant="h3" component="h2" sx={{ mb: 3, fontWeight: 600 }}>
              Ready to Streamline Your Expense Management?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Join thousands of businesses that trust SEMS for their expense management needs
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
              <Button 
                variant="contained" 
                size="large"
                component={Link}
                to="/register"
                sx={{ 
                  py: 1.5, 
                  px: 4, 
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  backgroundColor: 'white',
                  color: homeTheme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.9)'
                  }
                }}
              >
                Sign Up Now
              </Button>
              <Button 
                variant="outlined" 
                size="large"
                component={Link}
                to="/login"
                sx={{ 
                  py: 1.5, 
                  px: 4, 
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Sign In
              </Button>
            </Box>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default HomePage; 