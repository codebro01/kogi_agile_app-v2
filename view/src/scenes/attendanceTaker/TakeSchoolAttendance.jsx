import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Select, MenuItem, FormControl, InputLabel, 
    Button, TextField, Paper, Snackbar, Alert, Autocomplete, 
    IconButton, Divider, Dialog, DialogActions, DialogContent, 
    DialogContentText, DialogTitle
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import Header from '../../components/Header';
import { useTheme } from '@mui/material';
import { tokens } from '../../theme';

export const TakeSchoolAttendance = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`;
    const token = localStorage.getItem('token');
    
    const [schools, setSchools] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [students, setStudents] = useState([]); // Students for selected class
    const [absentees, setAbsentees] = useState([]); // Array of { student, presentClass, reason, specialStatus, note }
    
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [term, setTerm] = useState('First');
    const [session, setSession] = useState('2025/2026');
    const SESSION_OPTIONS = ['2025/2026', '2026/2027', '2027/2028', '2028/2029'];
    
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: 'success', open: false });
    const [confirmOpen, setConfirmOpen] = useState(false);
    
    const [selectedStudentToAdd, setSelectedStudentToAdd] = useState(null);

    const CLASS_OPTIONS = ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6', 'JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3'];

    // Fetch schools (assigned)
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('userData'));
        if (storedUser && storedUser.assignedSchools) {
            setSchools(storedUser.assignedSchools);
        }
    }, []);

    // Fetch students when school or class changes
    useEffect(() => {
        if (selectedSchool && selectedClass) {
            fetchSchoolStudents();
        } else {
            setStudents([]);
        }
    }, [selectedSchool, selectedClass]);

    const fetchSchoolStudents = async () => {
        try {
            const res = await axios.get(`${API_URL}/attendance/students-for-attendance`, {
                params: { schoolId: selectedSchool, presentClass: selectedClass },
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            setStudents(res.data.students || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddAbsentee = () => {
        if (!selectedStudentToAdd) return;
        
        // Check if already in the list
        if (absentees.find(a => a.student._id === selectedStudentToAdd._id)) {
            setMessage({ text: 'Student is already in the absentees list.', type: 'warning', open: true });
            return;
        }

        setAbsentees([
            ...absentees,
            { student: selectedStudentToAdd, presentClass: selectedClass, reason: '0', specialStatus: 'none', note: '' }
        ]);
        setSelectedStudentToAdd(null);
    };

    const handleRemoveAbsentee = (studentId) => {
        setAbsentees(absentees.filter(a => a.student._id !== studentId));
    };

    const handleUpdateNote = (studentId, note) => {
        setAbsentees(absentees.map(a => 
            a.student._id === studentId ? { ...a, note } : a
        ));
    };

    const handleUpdateSpecialStatus = (studentId, specialStatus) => {
        setAbsentees(absentees.map(a => 
            a.student._id === studentId ? { ...a, specialStatus } : a
        ));
    };

    const handleInitiateSave = () => {
        if (!selectedSchool || !date || !term || !session) {
            setMessage({ text: 'Please fill in all required fields (School, Date, Term, Session).', type: 'warning', open: true });
            return;
        }
        setConfirmOpen(true);
    };

    const handleConfirmSave = async () => {
        setConfirmOpen(false);
        setIsSaving(true);
        
        const payload = {
            schoolId: selectedSchool,
            date,
            term,
            session,
            absentees: absentees.map(a => ({
                studentId: a.student._id,
                presentClass: a.presentClass,
                reason: a.reason,
                specialStatus: a.specialStatus === 'none' ? null : a.specialStatus,
                note: a.note
            }))
        };

        try {
            await axios.post(`${API_URL}/attendance/school-daily`, payload, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            setMessage({ text: 'School attendance saved successfully!', type: 'success', open: true });
            setAbsentees([]); // Clear absentees on success
            fetchSchoolStudents(); // Refresh students to immediately hide dropouts/transfers
        } catch (err) {
            console.error(err);
            setMessage({ text: err.response?.data?.message || 'Failed to save attendance', type: 'error', open: true });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Box m="20px">
            <Header title="TAKE SCHOOL ATTENDANCE" subtitle="Record daily absentees for a school (School-Based Model)" />
            
            <Paper sx={{ p: 3, mb: 3, backgroundColor: colors.primary[400] }}>
                <Box display="flex" gap="20px" flexWrap="wrap">
                    <FormControl variant="filled" sx={{ minWidth: 250 }}>
                        <InputLabel>School</InputLabel>
                        <Select value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)}>
                            {schools.map(s => (
                                <MenuItem key={s._id} value={s._id}>{s.schoolName}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl variant="filled" sx={{ minWidth: 150 }} disabled={!selectedSchool}>
                        <InputLabel>Class</InputLabel>
                        <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                            {CLASS_OPTIONS.map(c => (
                                <MenuItem key={c} value={c}>{c}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField 
                        label="Date" 
                        variant="filled" 
                        type="date" 
                        InputLabelProps={{ shrink: true }}
                        value={date} 
                        onChange={e => setDate(e.target.value)} 
                        sx={{ minWidth: 200 }}
                    />
                    
                    <FormControl variant="filled" sx={{ minWidth: 150 }}>
                        <InputLabel>Term</InputLabel>
                        <Select value={term} onChange={(e) => setTerm(e.target.value)}>
                            <MenuItem value="First Term">First Term</MenuItem>
                            <MenuItem value="Second Term">Second Term</MenuItem>
                            <MenuItem value="Third Term">Third Term</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl variant="filled" sx={{ minWidth: 150 }}>
                        <InputLabel>Session</InputLabel>
                        <Select value={session} onChange={(e) => setSession(e.target.value)}>
                            {SESSION_OPTIONS.map(opt => (
                                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            <Paper sx={{ p: 3, backgroundColor: colors.primary[400] }}>
                <Typography variant="h5" mb={2}>Select Absent Students</Typography>
                <Typography variant="body2" color="textSecondary" mb={2}>
                    By default, all active students are marked as PRESENT. Only add students who are ABSENT today.
                </Typography>
                
                <Box display="flex" gap="20px" alignItems="center" mb={3}>
                    <Autocomplete
                        options={students}
                        getOptionLabel={(option) => {
                            if (!option) return '';
                            const name = `${option.surname || ''} ${option.firstname || ''} ${option.middlename || ''}`.trim();
                            return `${name} (${option.accountNumber || 'N/A'})`;
                        }}
                        value={selectedStudentToAdd}
                        onChange={(event, newValue) => {
                            setSelectedStudentToAdd(newValue);
                        }}
                        isOptionEqualToValue={(option, value) => option?._id === value?._id}
                        renderInput={(params) => (
                            <TextField 
                                {...params} 
                                label="Search Student" 
                                variant="filled" 
                            />
                        )}
                        disabled={!selectedSchool || !selectedClass}
                        sx={{ flexGrow: 1, maxWidth: 500 }}
                    />
                    <Button 
                        variant="contained" 
                        color="secondary" 
                        onClick={handleAddAbsentee}
                        disabled={!selectedStudentToAdd}
                    >
                        Add to Absentees
                    </Button>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" mb={2}>Absentees List ({absentees.length})</Typography>
                {absentees.length === 0 ? (
                    <Alert severity="info">No absentees added. Submitting now will mark everyone as present.</Alert>
                ) : (
                    <Box display="flex" flexDirection="column" gap="10px">
                        {absentees.map((item) => (
                            <Box key={item.student._id} display="flex" gap="20px" alignItems="center" p={2} border={`1px solid ${colors.grey[700]}`} borderRadius="4px">
                                <Box flexGrow={1}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {item.student.surname} {item.student.firstname} {item.student.middlename}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Class: {item.presentClass} | Account: {item.student.accountNumber || 'N/A'}
                                    </Typography>
                                </Box>
                                
                                <FormControl size="small" sx={{ width: 180 }}>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={item.specialStatus}
                                        label="Status"
                                        onChange={(e) => handleUpdateSpecialStatus(item.student._id, e.target.value)}
                                    >
                                        <MenuItem value="none">Absent (Default)</MenuItem>
                                        <MenuItem value="dropout">Dropout</MenuItem>
                                        <MenuItem value="transferred">Transferred</MenuItem>
                                        <MenuItem value="deceased">Deceased (Dead)</MenuItem>
                                    </Select>
                                </FormControl>

                                <TextField 
                                    label="Note (Optional)"
                                    variant="outlined"
                                    size="small"
                                    value={item.note}
                                    onChange={(e) => handleUpdateNote(item.student._id, e.target.value)}
                                    sx={{ width: 250 }}
                                />

                                <IconButton color="error" onClick={() => handleRemoveAbsentee(item.student._id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        ))}
                    </Box>
                )}

                <Box mt={4} display="flex" justifyContent="flex-end">
                    <Button 
                        variant="contained" 
                        color="success" 
                        size="large" 
                        onClick={handleInitiateSave} 
                        disabled={isSaving || !selectedSchool}
                    >
                        {isSaving ? 'Submitting...' : 'Submit School Attendance'}
                    </Button>
                </Box>
            </Paper>

            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>Confirm Attendance Submission</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to submit the attendance for this day? 
                        <br/><br/>
                        <strong>Warning: You cannot resubmit or edit attendance for this day once it is submitted.</strong> Make sure your absentee list is correct!
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleConfirmSave} color="success" variant="contained">Yes, Submit</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={message.open} autoHideDuration={6000} onClose={() => setMessage({ ...message, open: false })}>
                <Alert severity={message.type} sx={{ width: '100%' }}>
                    {message.text}
                </Alert>
            </Snackbar>
        </Box>
    );
};
