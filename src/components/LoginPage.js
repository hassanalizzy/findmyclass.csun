import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Container,
  Card,
  TextField,
  Typography,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  alpha,
  useTheme,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { motion } from 'framer-motion';

import logo from '../assets/images/logo.png';
import backgroundImage from '../assets/images/login-background.jpg';

function LoginPage() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [showPassword, setShowPw] = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [remember, setRemember]   = useState(true);

  const handleLogin = async () => {
    if (!username || !password) return setError('Please fill both fields.');
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post(
        'https://findmyclass.info/api/login/',
        { username, password },
        { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
      );
      if (data?.token) {
        localStorage.setItem('token', data.token);
        if (!remember) sessionStorage.setItem('token', data.token);
        navigate('/schedule');
      } else {
        setError('Unexpected response from server.');
      }
    } catch (e) {
      setError(e.response?.data?.detail || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background:
            theme.palette.mode === 'dark'
              ? 'rgba(0,0,0,0.65)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(0,0,0,0.25) 100%)',
        },
      }}
    >
      <Container
        maxWidth="xs"
        component={motion.div}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        sx={{ position: 'relative', zIndex: 1 }}
      >
        <Card
          component={motion.div}
          whileHover={{ y: -4 }}
          transition={{ type: 'spring', stiffness: 140, damping: 18 }}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            backdropFilter: 'blur(18px)',
            backgroundColor: alpha(theme.palette.background.paper, 0.75),
            border: `1px solid ${alpha(theme.palette.divider, 0.25)}`,
            boxShadow: 8,
            textAlign: 'center',
          }}
        >
          <Box mb={3}>
            <img
              src={logo}
              alt="FindMyClass logo"
              style={{ width: '55%', maxWidth: 160 }}
            />
          </Box>

          <Typography variant="h5" fontWeight={600} mb={1}>
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Sign in to continue
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Username"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            margin="normal"
            value={password}
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPw((s) => !s)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
            }
            label="Remember me"
            sx={{ mt: 1, mb: 2, alignSelf: 'flex-start' }}
          />

          <motion.div whileTap={{ scale: 0.97 }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              onClick={handleLogin}
              sx={{ borderRadius: 3, py: 1.25 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Login'
              )}
            </Button>
          </motion.div>

          <Typography variant="body2" mt={3} color="text.secondary">
            By continuing you agree to our&nbsp;
            <Link
              to="/terms.html"
              target="_blank"
              rel="noopener"
              style={{ fontWeight: 500, color: theme.palette.primary.main }}
            >
              Terms&nbsp;of&nbsp;Service
            </Link>
            &nbsp;and&nbsp;
            <Link
              to="/privacy.html"
              target="_blank"
              rel="noopener"
              style={{ fontWeight: 500, color: theme.palette.primary.main }}
            >
              Privacy&nbsp;Policy
            </Link>.
            <br />
            Don’t have an account?{' '}
            <Link
              to="/register"
              style={{ color: theme.palette.primary.main, fontWeight: 500 }}
            >
              Register
            </Link>
          </Typography>
        </Card>
      </Container>
    </Box>
  );
}

export default LoginPage;
