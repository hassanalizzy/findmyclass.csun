import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  useMediaQuery,
  alpha,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SchoolIcon from '@mui/icons-material/School';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function Header() {
  const navigate    = useNavigate();
  const [open, setOpen] = useState(false);
  const theme       = useTheme();
  const isMobile    = useMediaQuery(theme.breakpoints.down('md'));
  const loggedIn    = !!localStorage.getItem('token');

  const handleLogout = () => { localStorage.removeItem('token'); navigate('/'); };

  const menu = loggedIn
    ? [
        { t: 'Schedule', icon: <ScheduleIcon />, p: '/schedule' },
        { t: 'Account',  icon: <AccountCircleIcon />, p: '/account' },
        { t: 'Logout',   icon: <LogoutIcon />, act: handleLogout },
      ]
    : [{ t: 'Login', icon: <LoginIcon />, p: '/' }];

  const DrawerList = () => (
    <Box sx={{ width: 240 }} role="presentation" onClick={() => setOpen(false)}>
      <Typography variant="h6" sx={{ my: 2, textAlign: 'center' }}>
        CSUN Navigator
      </Typography>
      <Divider />
      <List>
        {menu.map((m) => (
          <ListItem
            key={m.t}
            button
            component={m.p ? Link : 'button'}
            to={m.p}
            onClick={m.act}
          >
            <ListItemIcon>{m.icon}</ListItemIcon>
            <ListItemText primary={m.t} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backdropFilter: 'blur(14px)',
        backgroundColor: alpha(theme.palette.background.paper, 0.72),
        color: theme.palette.text.primary,
      }}
    >
      <Toolbar>
        <SchoolIcon sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
          CSUN Navigator
        </Typography>

        {isMobile ? (
          <IconButton edge="end" onClick={() => setOpen(true)}>
            <MenuIcon />
          </IconButton>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {menu.map((m) => (
              <Box
                key={m.t}
                component={motion.div}
                whileTap={{ scale: 0.93 }}
                sx={{ px: 2, py: 0.75, borderRadius: 3, cursor: 'pointer' }}
                onClick={m.act}
                component={m.p ? Link : 'div'}
                to={m.p}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {m.icon}
                  <Typography variant="body2" fontWeight={500}>{m.t}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Toolbar>

      <Drawer open={open} onClose={() => setOpen(false)}>
        <DrawerList />
      </Drawer>
    </AppBar>
  );
}

export default Header;
