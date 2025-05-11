import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Autocomplete,
  CircularProgress,
  TextField,
  Button,
  Fab,
  Slide,
  alpha,
  useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigationIcon from '@mui/icons-material/Navigation';
import AddIcon from '@mui/icons-material/Add';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function SchedulePage() {
  /* ---------------- state ---------------- */
  const [className, setClassName]       = useState('');
  const [building, setBuilding]         = useState(null);
  const [buildings, setBuildings]       = useState([]);
  const [classroom, setClassroom]       = useState(null);
  const [classrooms, setClassrooms]     = useState([]);
  const [classTime, setClassTime]       = useState('');
  const [schedules, setSchedules]       = useState([]);
  const [loadingCls, setLoadingCls]     = useState(false);
  const [snackbar, setSnackbar]         = useState(false);
  const [errorMsg, setErrorMsg]         = useState('');
  const [addOpen, setAddOpen]           = useState(false);
  const [deleteId, setDeleteId]         = useState(null);

  const navigate = useNavigate();
  const theme = useTheme();

  /* ---------------- fetch helpers ---------------- */
  const fetchSchedules = useCallback(() => {
    axios
      .get('https://findmyclass.info/api/schedules/', {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` },
      })
      .then(({ data }) => setSchedules(Array.isArray(data) ? data : []))
      .catch(() => setErrorMsg('Failed to fetch schedules.'));
  }, []);

  const fetchBuildings = useCallback(() => {
    axios
      .get('https://findmyclass.info/api/buildings/')
      .then(({ data }) => setBuildings(Array.isArray(data) ? data : []))
      .catch(() => setErrorMsg('Failed to fetch buildings.'));
  }, []);

  const fetchClassrooms = useCallback((buildingId) => {
    setLoadingCls(true);
    axios
      .get(`https://findmyclass.info/api/classrooms/?building_id=${buildingId}`)
      .then(({ data }) => setClassrooms(Array.isArray(data) ? data : []))
      .catch(() => setErrorMsg('Failed to fetch classrooms.'))
      .finally(() => setLoadingCls(false));
  }, []);

  /* ---------------- initial loads ---------------- */
  useEffect(() => {
    fetchSchedules();
    fetchBuildings();
  }, [fetchSchedules, fetchBuildings]);

  useEffect(() => {
    if (building?.id) fetchClassrooms(building.id);
    else { setClassrooms([]); setClassroom(null); }
  }, [building, fetchClassrooms]);

  /* ---------------- CRUD actions ---------------- */
  const handleAddClass = () => {
    if (!className || !building || !classroom || !classTime) return;
    axios
      .post(
        'https://findmyclass.info/api/schedules/',
        {
          class_name: className,
          classroom_id: classroom.id,
          class_time: classTime,
        },
        { headers: { Authorization: `Token ${localStorage.getItem('token')}` } }
      )
      .then(() => {
        fetchSchedules();
        setClassName('');
        setBuilding(null);
        setClassroom(null);
        setClassTime('');
        setSnackbar(true);
        setAddOpen(false);
      })
      .catch(() => setErrorMsg('Failed to add class.'));
  };

  const confirmDeleteClass = () => {
    axios
      .delete(`https://findmyclass.info/api/schedules/${deleteId}/`, {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` },
      })
      .then(() => {
        fetchSchedules();
        setDeleteId(null);
      })
      .catch(() => setErrorMsg('Failed to delete class.'));
  };

  /* ---------------- UI ---------------- */
  const isDisabled = !className || !building || !classroom || !classTime;

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backdropFilter: 'blur(14px)',
          backgroundColor: alpha(theme.palette.background.paper, 0.7),
          color: theme.palette.text.primary,
        }}
      >
        <Toolbar>
          <Typography variant="h6" fontWeight={600} sx={{ flexGrow: 1 }}>
            Your Schedule
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 3, pb: 10 }}>
        <Grid container spacing={3}>
          {schedules.map((s) => (
            <Grid item xs={12} sm={6} md={4} key={s.id}>
              <Card
                component={motion.div}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                elevation={3}
                sx={{
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.background.paper, 0.8),
                }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight={600}>
                    {s.class_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {s.classroom.building.name} – Room {s.classroom.room_number}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {s.class_time}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', pb: 3, px: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<NavigationIcon />}
                    sx={{ borderRadius: 3 }}
                    onClick={() => navigate(`/navigate/${s.id}`)}
                  >
                    Navigate
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    sx={{ borderRadius: 3 }}
                    onClick={() => setDeleteId(s.id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* FAB */}
        <Fab
          color="primary"
          component={motion.button}
          whileTap={{ scale: 0.9 }}
          sx={{ position: 'fixed', bottom: 24, right: 24 }}
          onClick={() => setAddOpen(true)}
        >
          <AddIcon />
        </Fab>

        {/* Add dialog */}
        <Dialog
          open={addOpen}
          onClose={() => setAddOpen(false)}
          TransitionComponent={Transition}
          fullWidth
          PaperProps={{
            sx: {
              p: 2,
              borderRadius: 4,
              backdropFilter: 'blur(18px)',
              backgroundColor: alpha(theme.palette.background.paper, 0.85),
            },
          }}
        >
          <DialogTitle fontWeight={600}>Add Class</DialogTitle>
          <DialogContent>
            <Box mt={1}>
              <TextField
                label="Class Name"
                variant="filled"
                fullWidth
                margin="normal"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
              <Autocomplete
                options={buildings}
                getOptionLabel={(o) => o.name || ''}
                value={building}
                onChange={(_, v) => {
                  setBuilding(v);
                  setClassroom(null);
                }}
                renderInput={(p) => (
                  <TextField {...p} label="Building" variant="filled" margin="normal" />
                )}
              />
              <Autocomplete
                options={classrooms}
                getOptionLabel={(o) => o.room_number || ''}
                value={classroom}
                onChange={(_, v) => setClassroom(v)}
                disabled={!building}
                renderInput={(p) => (
                  <TextField
                    {...p}
                    label="Classroom"
                    variant="filled"
                    margin="normal"
                    InputProps={{
                      ...p.InputProps,
                      endAdornment: (
                        <>
                          {loadingCls && <CircularProgress size={18} sx={{ mr: 1 }} />}
                          {p.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
              <TextField
                label="Class Time"
                type="time"
                variant="filled"
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                value={classTime}
                onChange={(e) => setClassTime(e.target.value)}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="contained" disabled={isDisabled} onClick={handleAddClass}>
              Add
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete confirm */}
        <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
          <DialogTitle fontWeight={600}>Confirm Delete</DialogTitle>
          <DialogContent>Delete this class?</DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={confirmDeleteClass}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* snackbars */}
        <Snackbar
          open={snackbar}
          autoHideDuration={3000}
          onClose={() => setSnackbar(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="success" sx={{ width: '100%' }}>
            Class added!
          </Alert>
        </Snackbar>
        <Snackbar
          open={!!errorMsg}
          autoHideDuration={6000}
          onClose={() => setErrorMsg('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="error" sx={{ width: '100%' }}>
            {errorMsg}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
}

export default SchedulePage;
