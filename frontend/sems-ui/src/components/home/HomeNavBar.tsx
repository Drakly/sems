import React, { useState } from 'react';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  Button, 
  Container, 
  IconButton, 
  Typography, 
  Menu, 
  MenuItem,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Menu as MenuIcon } from '@mui/icons-material';

const HomeNavBar: React.FC = () => {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const menuItems = [
    { text: 'Features', href: '#features' },
    { text: 'Why SEMS', href: '#why-sems' },
    { text: 'Contact', href: '#contact' },
    { text: 'Login', href: '/login' },
    { text: 'Register', href: '/register' },
  ];

  return (
    <AppBar 
      position="fixed" 
      color="transparent" 
      elevation={0} 
      sx={{ 
        background: 'transparent',
        boxShadow: 'none',
        py: 1,
        // Add background color with opacity when scrolling
        backdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(0, 0, 0, 0.2)'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          {/* Logo */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'white',
              textDecoration: 'none',
            }}
          >
            SEMS
          </Typography>

          {/* Mobile Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
              sx={{ color: 'white' }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {menuItems.map((item) => (
                <MenuItem key={item.text} onClick={handleCloseNavMenu}>
                  <Typography 
                    textAlign="center"
                    component={Link}
                    to={item.href}
                    sx={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    {item.text}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Mobile Logo */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 700,
              color: 'white',
              textDecoration: 'none',
            }}
          >
            SEMS
          </Typography>

          {/* Desktop Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end' }}>
            {menuItems.slice(0, -2).map((item) => (
              <Button
                key={item.text}
                component="a"
                href={item.href}
                onClick={handleCloseNavMenu}
                sx={{ mx: 1, color: 'white', display: 'block' }}
              >
                {item.text}
              </Button>
            ))}
            <Button
              component={Link}
              to="/login"
              variant="text"
              sx={{ 
                mx: 1, 
                color: 'white', 
                display: 'block',
                borderRadius: 2,
              }}
            >
              Login
            </Button>
            <Button
              component={Link}
              to="/register"
              variant="contained"
              sx={{ 
                mx: 1, 
                display: 'block',
                backgroundColor: 'white',
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)'
                },
                borderRadius: 2,
              }}
            >
              Register
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default HomeNavBar; 