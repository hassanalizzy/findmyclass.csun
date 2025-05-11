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

function RegisterPage() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [accepted, setAccepted]   = useState(false);

  const handleRegister = async () => {
    if (!username || !password) return setError('Fill in all fields.');
    if (!accepted)              return setError('Please accept the Terms & Privacy.');
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post(
        'https://findmyclass.info/api/register/',
        { username, password },
        { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
      );
      if (data?.token) {
        localStorage.setItem('token', data.token);
        navigate('/schedule');
      } else {
        setError('Unexpected response.');
      }
    } catch (e) {
      setError(e.response?.data?.detail || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
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
        component={motion.div}
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        maxWidth="xs"
        sx={{ position: 'relative', zIndex: 1 }}
      >
        <Card
          component={motion.div}
          whileHover={{ y: -4 }}
          sx={{
            p: 4,
            borderRadius: 4,
            boxShadow: 8,
            backdropFilter: 'blur(18px)',
            backgroundColor: alpha(theme.palette.background.paper, 0.75),
            border: `1px solid ${alpha(theme.palette.divider, 0.25)}`,
            textAlign: 'center',
          }}
        >
          <img
            src={logo}
            alt="logo"
            style={{ width: '55%', maxWidth: 160, marginBottom: 24 }}
          />
          <Typography variant="h5" fontWeight={600} mb={1}>
            Create an account
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Sign up to start navigating
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            label="Username"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <TextField
            label="Password"
            type={showPw ? 'text' : 'password'}
            fullWidth
            margin="normal"
            value={password}
            autoComplete="new-password"
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPw((s) => !s)}>
                    {showPw ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Terms & Privacy acceptance */}
          <FormControlLabel
            sx={{ mt: 1 }}
            control={
              <Checkbox
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                color="primary"
              />
            }
            label={
              <Typography variant="body2">
                I agree to the&nbsp;
                <Link
                  to="/terms.html"
                  target="_blank"
                  rel="noopener"
                  style={{ fontWeight: 500, color: theme.palette.primary.main }}
                >
                  Terms&nbsp;of&nbsp;Service
                </Link>{' '}
                and&nbsp;
                <Link
                  to="/privacy.html"
                  target="_blank"
                  rel="noopener"
                  style={{ fontWeight: 500, color: theme.palette.primary.main }}
                >
                  Privacy&nbsp;Policy
                </Link>
              </Typography>
            }
          />

          <motion.div whileTap={{ scale: 0.97 }}>
            <Button
              fullWidth
              size="large"
              variant="contained"
              disabled={loading || !accepted}
              onClick={handleRegister}
              sx={{ mt: 2, borderRadius: 3 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Register'
              )}
            </Button>
          </motion.div>

          <Typography variant="body2" mt={3}>
            Already have an account?{' '}
            <Link
              to="/"
              style={{ color: theme.palette.primary.main, fontWeight: 500 }}
            >
              Login
            </Link>
          </Typography>
        </Card>
      </Container>
    </Box>
  );
}

export default RegisterPage;
