import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, useTheme, Select, MenuItem, InputLabel, FormControl, Chip, OutlinedInput, Autocomplete } from '@mui/material';
import { Formik } from 'formik';
import * as yup from 'yup';
import Header from '../../components/Header';
import { tokens } from '../../theme';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { SpinnerLoader } from '../../components/spinnerLoader';

const checkoutSchema = yup.object().shape({
  fullName: yup.string().required('required'),
  email: yup.string().email('invalid email').required('required'),
  password: yup.string().required('required'),
});

const initialValues = {
  fullName: '',
  email: '',
  password: '',
  assignedSchools: [],
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export const CreateAttendanceTaker = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [schools, setSchools] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/all-schools`, {
           headers: { Authorization: `Bearer ${token}` },
           withCredentials: true 
        });
        setSchools(res.data.allSchools || []);
      } catch (err) {
        console.error("Failed to fetch schools", err);
      }
    };
    fetchSchools();
  }, []);

  const handleFormSubmit = async (values, { resetForm }) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/attendance-takers/register`, values, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });
      alert('Attendance Taker Created Successfully!');
      resetForm();
      navigate('/admin-dashboard/manage-accounts/attendance-takers');
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating attendance taker');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box m="20px">
      <Header title="CREATE ATTENDANCE TAKER" subtitle="Create a New Attendance Taker Profile" />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={initialValues}
        validationSchema={checkoutSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          setFieldValue
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
            >
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Full Name"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.fullName}
                name="fullName"
                error={!!touched.fullName && !!errors.fullName}
                helperText={touched.fullName && errors.fullName}
                sx={{ gridColumn: 'span 4' }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Email"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{ gridColumn: 'span 4' }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="password"
                label="Password"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.password}
                name="password"
                error={!!touched.password && !!errors.password}
                helperText={touched.password && errors.password}
                sx={{ gridColumn: 'span 4' }}
              />

              <Box sx={{ gridColumn: 'span 4' }}>
                <Autocomplete
                  multiple
                  disableCloseOnSelect
                  id="assignedSchools"
                  options={schools}
                  getOptionLabel={(option) => `${option.schoolName} — ${option.LGA}`}
                  value={schools.filter((school) => values.assignedSchools.includes(school._id))}
                  isOptionEqualToValue={(option, value) => option._id === value._id}
                  onChange={(event, newValue) => {
                    setFieldValue('assignedSchools', newValue.map((option) => option._id));
                  }}
                  noOptionsText="No schools found"
                  renderTags={() => null} // Hide tags inside the input bar
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="filled"
                      label="Search & Assign Schools"
                      placeholder="Type school name or LGA..."
                      error={!!touched.assignedSchools && !!errors.assignedSchools}
                      helperText={touched.assignedSchools && errors.assignedSchools}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'green',
                          },
                          '&:hover fieldset': {
                            borderColor: 'darkgreen',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'green',
                            borderWidth: 2,
                          },
                        },
                      }}
                    />
                  )}
                />
                {/* Display selected schools underneath */}
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {values.assignedSchools.map((schoolId) => {
                    const schoolObj = schools.find((s) => s._id === schoolId);
                    if (!schoolObj) return null;
                    return (
                      <Chip
                        key={schoolId}
                        label={schoolObj.schoolName}
                        onDelete={() => {
                          setFieldValue(
                            'assignedSchools',
                            values.assignedSchools.filter((id) => id !== schoolId)
                          );
                        }}
                        color="primary"
                        variant="outlined"
                      />
                    );
                  })}
                </Box>
              </Box>
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained" disabled={isLoading}>
                {isLoading ? <SpinnerLoader /> : "Create New Attendance Taker"}
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};
