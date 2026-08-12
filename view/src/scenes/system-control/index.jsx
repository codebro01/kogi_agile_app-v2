import React, { useState, useEffect } from 'react';
import { Box, Typography, Switch, FormGroup, FormControlLabel, CircularProgress, Alert, useTheme } from '@mui/material';
import axios from 'axios';
import Header from '../../components/Header';
import { tokens } from '../../theme';

const SystemControl = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [controls, setControls] = useState({
    allowAttendance: true,
    allowEnrollment: true,
    allowVerification: true,
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const API_URL = `${import.meta.env.VITE_API_URL}/api/v1/system-control`;
  const token = localStorage.getItem('token');
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    withCredentials: true,
  };

  useEffect(() => {
    const fetchControls = async () => {
      try {
        const response = await axios.get(API_URL, axiosConfig);
        setControls({
          allowAttendance: response.data.allowAttendance,
          allowEnrollment: response.data.allowEnrollment,
          allowVerification: response.data.allowVerification,
        });
        setErrorMsg(null);
      } catch (error) {
        console.error('Failed to fetch system controls:', error);
        setErrorMsg(
          `Fetch failed: ${error.response?.status} — ${error.response?.data?.message || error.message}`
        );
      } finally {
        setLoading(false);
      }
    };
    fetchControls();
  }, []);

  const handleChange = async (event) => {
    const { name, checked } = event.target;
    // Optimistic update
    setControls((prev) => ({ ...prev, [name]: checked }));
    setErrorMsg(null);

    try {
      await axios.put(API_URL, { [name]: checked }, axiosConfig);
    } catch (error) {
      console.error('Failed to update system control:', error);
      // Revert on failure
      setControls((prev) => ({ ...prev, [name]: !checked }));
      setErrorMsg(
        `Update failed: ${error.response?.status} — ${error.response?.data?.message || error.message}`
      );
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box m="20px">
      <Header title="SYSTEM CONTROL" subtitle="Manage global system features and locks" />

      {errorMsg && (
        <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
          {errorMsg}
        </Alert>
      )}

      <Box
        mt="40px"
        p="30px"
        backgroundColor={colors.primary[400]}
        borderRadius="8px"
      >
        <Typography variant="h5" fontWeight="600" color={colors.grey[100]} mb="20px">
          Global Feature Toggles
        </Typography>

        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={controls.allowAttendance}
                onChange={handleChange}
                name="allowAttendance"
                color="secondary"
              />
            }
            label={
              <Box>
                <Typography variant="h6">Allow Attendance Submissions</Typography>
                <Typography variant="body2" color={colors.grey[300]}>
                  Turn off to prevent any new attendance from being submitted.
                </Typography>
              </Box>
            }
            sx={{ mb: 3 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={controls.allowEnrollment}
                onChange={handleChange}
                name="allowEnrollment"
                color="secondary"
              />
            }
            label={
              <Box>
                <Typography variant="h6">Allow New Enrollments</Typography>
                <Typography variant="body2" color={colors.grey[300]}>
                  Turn off to prevent registrars from enrolling new students.
                </Typography>
              </Box>
            }
            sx={{ mb: 3 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={controls.allowVerification}
                onChange={handleChange}
                name="allowVerification"
                color="secondary"
              />
            }
            label={
              <Box>
                <Typography variant="h6">Allow Student Verification</Typography>
                <Typography variant="body2" color={colors.grey[300]}>
                  Turn off to prevent verifiers from processing student verification.
                </Typography>
              </Box>
            }
          />
        </FormGroup>
      </Box>
    </Box>
  );
};

export default SystemControl;
