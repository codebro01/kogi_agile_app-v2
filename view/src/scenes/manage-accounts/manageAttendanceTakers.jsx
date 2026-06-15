import React, { useEffect, useState } from 'react';
import {
  Box, Button, useTheme, Dialog, DialogTitle, DialogContent,
  DialogActions, Typography, Chip, OutlinedInput, Select,
  MenuItem, InputLabel, FormControl, CircularProgress, Snackbar, Alert,
  Autocomplete, TextField
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { tokens } from '../../theme';
import Header from '../../components/Header';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: { style: { maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP, width: 280 } },
};

export const ManageAttendanceTakers = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [schools, setSchools] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedTaker, setSelectedTaker] = useState(null);
  const [selectedSchools, setSelectedSchools] = useState([]);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });
  const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/attendance-takers`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      const formattedData = response.data.attendanceTakers.map((item) => ({
        ...item,
        id: item._id,
      }));
      setData(formattedData);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSchools = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/all-schools`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setSchools(res.data.allSchools || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchSchools();
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/attendance-takers/toggle-status?id=${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      fetchData();
      setSnack({ open: true, msg: 'Status updated successfully', severity: 'success' });
    } catch (err) {
      console.error(err);
      setSnack({ open: true, msg: 'Failed to update status', severity: 'error' });
    }
  };

  const handleResetPassword = async (id) => {
    if (!window.confirm('Reset this user\'s password to "123456"?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/attendance-takers/reset-password?id=${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      setSnack({ open: true, msg: 'Password reset to 123456', severity: 'info' });
    } catch (err) {
      console.error(err);
      setSnack({ open: true, msg: 'Failed to reset password', severity: 'error' });
    }
  };

  const handleOpenEdit = (row) => {
    setSelectedTaker(row);
    setSelectedSchools((row.assignedSchools || []).map((s) => s._id));
    setEditOpen(true);
  };

  const handleSaveSchools = async () => {
    if (!selectedTaker) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_URL}/attendance-takers/update/${selectedTaker._id}`,
        { assignedSchools: selectedSchools },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );
      setSnack({ open: true, msg: 'Schools assigned successfully', severity: 'success' });
      setEditOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setSnack({ open: true, msg: 'Failed to save school assignment', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { field: 'fullName', headerName: 'Full Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'assignedSchools',
      headerName: 'Assigned Schools',
      flex: 2,
      renderCell: ({ row: { assignedSchools } }) => {
        if (!assignedSchools || assignedSchools.length === 0)
          return <Typography variant="caption" color="text.secondary">None</Typography>;
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, py: 0.5 }}>
            {assignedSchools.map((s) => (
              <Chip key={s._id} label={s.schoolName} size="small" color="primary" variant="outlined" />
            ))}
          </Box>
        );
      },
    },
    {
      field: 'isActive',
      headerName: 'Status',
      flex: 0.7,
      renderCell: ({ row: { isActive } }) => (
        <Chip
          label={isActive ? 'Active' : 'Disabled'}
          color={isActive ? 'success' : 'error'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1.5,
      sortable: false,
      renderCell: ({ row }) => (
        <Box display="flex" gap="6px" alignItems="center">
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={() => handleOpenEdit(row)}
            sx={{ textTransform: 'none', fontSize: '11px' }}
          >
            Edit Schools
          </Button>
          <Button
            variant="outlined"
            color={row.isActive ? 'error' : 'success'}
            size="small"
            onClick={() => handleToggleStatus(row.id)}
            sx={{ textTransform: 'none', fontSize: '11px' }}
          >
            {row.isActive ? 'Disable' : 'Enable'}
          </Button>
          <Button
            variant="outlined"
            color="warning"
            size="small"
            onClick={() => handleResetPassword(row.id)}
            sx={{ textTransform: 'none', fontSize: '11px' }}
          >
            Reset PWD
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="ATTENDANCE TAKERS" subtitle="Manage Attendance Takers and their assigned schools" />
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate('/admin-dashboard/create-accounts/register-attendance-taker')}
        >
          + New Attendance Taker
        </Button>
      </Box>

      <Box
        m="20px 0 0 0"
        height="72vh"
        sx={{
          '& .MuiDataGrid-root': { border: 'none' },
          '& .MuiDataGrid-cell': { borderBottom: 'none' },
          '& .name-column--cell': { color: colors.greenAccent[300] },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: colors.blueAccent[700],
            borderBottom: 'none',
          },
          '& .MuiDataGrid-virtualScroller': { backgroundColor: colors.primary[400] },
          '& .MuiDataGrid-footerContainer': {
            borderTop: 'none',
            backgroundColor: colors.blueAccent[700],
          },
          '& .MuiCheckbox-root': { color: `${colors.greenAccent[200]} !important` },
          '& .MuiDataGrid-toolbarContainer .MuiButton-text': {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid
          checkboxSelection
          rows={data}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
          rowHeight={52}
          getRowHeight={() => 'auto'}
        />
      </Box>

      {/* Edit Schools Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Assign Schools to: <strong>{selectedTaker?.fullName}</strong>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Select one or more schools to assign to this attendance taker.
          </Typography>
          <Autocomplete
            multiple
            disableCloseOnSelect
            id="assign-schools-tags"
            sx={{
              width: '100%',
            }}
            options={schools}
            getOptionLabel={(option) => `${option.schoolName} — ${option.LGA}`}
            value={schools.filter((school) => selectedSchools.includes(school._id))}
            isOptionEqualToValue={(option, value) => option._id === value._id}
            onChange={(event, newValue) => {
              setSelectedSchools(newValue.map((option) => option._id));
            }}
            noOptionsText="No schools found"
            renderTags={() => null} // Hide tags inside the input bar
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label="Search & Assign Schools"
                placeholder="Type school name or LGA..."
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
            {selectedSchools.map((schoolId) => {
              const schoolObj = schools.find((s) => s._id === schoolId);
              if (!schoolObj) return null;
              return (
                <Chip
                  key={schoolId}
                  label={schoolObj.schoolName}
                  onDelete={() => {
                    setSelectedSchools((prev) => prev.filter((id) => id !== schoolId));
                  }}
                  color="primary"
                  variant="outlined"
                />
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSaveSchools}
            variant="contained"
            color="primary"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : null}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnack((p) => ({ ...p, open: false }))}
          severity={snack.severity}
          variant="filled"
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};
