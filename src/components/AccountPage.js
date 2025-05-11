import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
  alpha,
  useTheme,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { motion } from 'framer-motion';

function AccountPage() {
  const theme = useTheme();

  const [data, setData]         = useState({ username: '' });
  const [oldPw, setOldPw]       = useState('');
  const [newPw, setNewPw]       = useState('');
  const [confPw, setConfPw]     = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [msg, setMsg]           = useState(null);

  const fetchUser = useCallback(() => {
    axios.get('https://findmyclass.info/api/user/', {
      headers: { Authorization: `Token ${localStorage.getItem('token')}` },
    })
    .then(r => setData({ username: r.data.username }))
    .catch(() => {});
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const handleSave = () => {
    setMsg(null);
    if ((newPw || confPw) && !oldPw) return setMsg({ t: 'error', m: 'Enter current password.' });
    if (newPw && newPw !== confPw) return setMsg({ t: 'error', m: 'Passwords do not match.' });

    const body = { username: data.username };
    if (newPw) { body.password = newPw; body.old_password = oldPw; }

    axios.put('https://findmyclass.info/api/user/', body, {
      headers: { Authorization: `Token ${localStorage.getItem('token')}` },
    })
    .then(() => { setMsg({ t: 'success', m: 'Saved!' }); setOldPw(''); setNewPw(''); setConfPw(''); })
    .catch(() => setMsg({ t: 'error', m: 'Update failed.' }));
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          p: 4,
          borderRadius: 4,
          boxShadow: 8,
          backdropFilter: 'blur(16px)',
          backgroundColor: alpha(theme.palette.background.paper, 0.75),
        }}
      >
        <Typography variant="h5" fontWeight={600} textAlign="center" mb={2}>
          Account Settings
        </Typography>

        {msg && (
          <Alert severity={msg.t} sx={{ mb: 3 }}>
            {msg.m}
          </Alert>
        )}

        <TextField
          label="Username"
          fullWidth
          margin="normal"
          value={data.username}
          onChange={(e) => setData({ username: e.target.value })}
        />

        <Divider sx={{ my: 4 }}>Change Password</Divider>

        <TextField
          label="Current Password"
          type={showPw ? 'text' : 'password'}
          fullWidth
          margin="normal"
          value={oldPw}
          onChange={(e) => setOldPw(e.target.value)}
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
        <TextField
          label="New Password"
          type={showPw ? 'text' : 'password'}
          fullWidth
          margin="normal"
          value={newPw}
          onChange={(e) => setNewPw(e.target.value)}
        />
        <TextField
          label="Confirm New Password"
          type={showPw ? 'text' : 'password'}
          fullWidth
          margin="normal"
          value={confPw}
          onChange={(e) => setConfPw(e.target.value)}
        />

        <motion.div whileTap={{ scale: 0.97 }}>
          <Button variant="contained" fullWidth sx={{ mt: 3 }} onClick={handleSave}>
            Save Changes
          </Button>
        </motion.div>
      </Box>
    </Container>
  );
}

export default AccountPage;
