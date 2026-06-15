import React, { useState, useEffect } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, Button, TextField, Grid, Paper, Snackbar, Alert, Autocomplete } from '@mui/material';
import axios from 'axios';
import Header from '../../components/Header';
import { useTheme } from '@mui/material';
import { tokens } from '../../theme';

export const TakeAttendance = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`;
    const token = localStorage.getItem('token');
    
    const [schools, setSchools] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState('');
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1); // 1-12
    const [term, setTerm] = useState('First');
    const [session, setSession] = useState(`${year - 1}/${year}`);
    
    const [attendanceData, setAttendanceData] = useState([]); // Array of daily status
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: 'success', open: false });

    // Fetch schools (assigned)
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('userData'));
        if (storedUser && storedUser.assignedSchools) {
            setSchools(storedUser.assignedSchools);
        }
    }, []);

    // Fetch students when school changes
    useEffect(() => {
        if (selectedSchool) {
            fetchStudents();
        } else {
            setStudents([]);
            setSelectedStudent(null);
        }
    }, [selectedSchool]);

    const fetchStudents = async () => {
        try {
            const res = await axios.get(`${API_URL}/attendance/students-for-attendance`, {
                params: { schoolId: selectedSchool },
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            setStudents(res.data.students);
            setSelectedStudent(null);
        } catch (err) {
            console.error(err);
        }
    };

    console.log('eligiblestudents', students)
    // Initialize days in month when student/year/month changes
    useEffect(() => {
        if (selectedStudent && year && month) {
            generateDays();
        }
    }, [selectedStudent, year, month]);

    const generateDays = () => {
        const daysInMonth = new Date(year, month, 0).getDate();
        const days = [];
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month - 1, i);
            const dayOfWeek = date.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Exclude weekends
                days.push({
                    day: i,
                    dateStr: date.toISOString().split('T')[0],
                    status: '', // 0: absent, 1: present, 2: transferred, 3: dropout, 4: died
                    absentReason: ''
                });
            }
        }
        setAttendanceData(days);
    };

    const handleStatusChange = (index, value) => {
        const newData = [...attendanceData];
        newData[index].status = value;
        if (value !== 0) {
            newData[index].absentReason = ''; // Clear reason if not absent
        }
        setAttendanceData(newData);
    };

    const handleReasonChange = (index, value) => {
        const newData = [...attendanceData];
        newData[index].absentReason = value;
        setAttendanceData(newData);
    };

    const markAll = (status) => {
        const newData = attendanceData.map(d => ({
            ...d,
            status,
            absentReason: ''
        }));
        setAttendanceData(newData);
    };

    const handleSave = async () => {
        if (!selectedStudent) return;
        setIsSaving(true);
        
        const payload = attendanceData
            .filter(d => d.status !== '')
            .map(d => ({
                studentId: selectedStudent._id,
                status: d.status,
                splittedDate: d.dateStr,
                absentReason: d.absentReason || undefined,
                year,
                month,
                term,
                session
            }));

        if (payload.length === 0) {
            setMessage({ text: 'Please select at least one attendance status.', type: 'warning', open: true });
            setIsSaving(false);
            return;
        }

        try {
            await axios.post(`${API_URL}/attendance`, { attendanceArray: payload }, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            setMessage({ text: 'Attendance saved successfully', type: 'success', open: true });
        } catch (err) {
            console.error(err);
            setMessage({ text: 'Failed to save attendance', type: 'error', open: true });
        } finally {
            setIsSaving(false);
        }
    };

    const STATUS_OPTIONS = [
        { value: 1, label: 'Present' },
        { value: 0, label: 'Absent' },
        { value: 2, label: 'Transferred/Relocated' },
        { value: 3, label: 'Dropout' },
        { value: 4, label: 'Died' },
    ];

    const REASON_OPTIONS = ['sick', 'other']; // 'dead', 'relocated', 'dropout' are now main statuses

    const isStudentDisabled = selectedStudent && selectedStudent.isActive === false;

    return (
        <Box m="20px">
            <Header title="TAKE ATTENDANCE" subtitle="Record monthly attendance for beneficiaries" />
            
            <Box display="flex" gap="20px" flexWrap="wrap" mb="20px">
                <FormControl variant="filled" sx={{ minWidth: 200 }}>
                    <InputLabel>School</InputLabel>
                    <Select value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)}>
                        {schools.map(s => (
                            <MenuItem key={s._id} value={s._id}>{s.schoolName}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Autocomplete
                    options={students || []}
                    getOptionLabel={(option) => {
                        if (!option) return '';
                        const name = `${option.surname || ''} ${option.firstname || ''} ${option.middlename || ''}`.trim();
                        return `${name} (${option.accountNumber || 'N/A'})${!option.isActive ? ' - INACTIVE' : ''}`;
                    }}
                    value={selectedStudent || null}
                    onChange={(event, newValue) => {
                        setSelectedStudent(newValue);
                    }}
                    isOptionEqualToValue={(option, value) => option?._id === value?._id}
                    renderInput={(params) => (
                        <TextField 
                            {...params} 
                            label="Student (Beneficiaries Only)" 
                            variant="filled" 
                        />
                    )}
                    disabled={!selectedSchool}
                    sx={{ minWidth: 250 }}
                />

                <TextField label="Year" variant="filled" type="number" value={year} onChange={e => setYear(Number(e.target.value))} />
                
                <FormControl variant="filled" sx={{ minWidth: 150 }}>
                    <InputLabel>Month</InputLabel>
                    <Select value={month} onChange={(e) => setMonth(e.target.value)}>
                        {[...Array(12).keys()].map(m => (
                            <MenuItem key={m + 1} value={m + 1}>{new Date(2000, m, 1).toLocaleString('default', { month: 'long' })}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl variant="filled" sx={{ minWidth: 150 }}>
                    <InputLabel>Term</InputLabel>
                    <Select value={term} onChange={(e) => setTerm(e.target.value)}>
                        <MenuItem value="First">First</MenuItem>
                        <MenuItem value="Second">Second</MenuItem>
                        <MenuItem value="Third">Third</MenuItem>
                    </Select>
                </FormControl>

                <TextField label="Session" variant="filled" value={session} onChange={e => setSession(e.target.value)} />
            </Box>

            {selectedStudent && (
                <Paper sx={{ p: 3, backgroundColor: colors.primary[400] }}>
                    <Typography variant="h5" mb={2}>
                        Attendance for {selectedStudent.surname} {selectedStudent.firstname}
                    </Typography>

                    {isStudentDisabled && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            This student is marked as inactive (Died, Dropout, or Relocated). You cannot modify their attendance going forward.
                        </Alert>
                    )}

                    <Box display="flex" gap="10px" mb="20px">
                        <Button variant="contained" color="success" onClick={() => markAll(1)} disabled={isStudentDisabled}>Mark All Present</Button>
                        <Button variant="contained" color="error" onClick={() => markAll(0)} disabled={isStudentDisabled}>Mark All Absent</Button>
                    </Box>

                    <Grid container spacing={2}>
                        {attendanceData.map((data, index) => (
                            <Grid item xs={12} sm={6} md={4} key={data.dateStr}>
                                <Box p={2} border={`1px solid ${colors.grey[700]}`} borderRadius="4px" display="flex" flexDirection="column" gap="10px">
                                    <Typography variant="h6">Day {data.day} ({data.dateStr})</Typography>
                                    <FormControl size="small" disabled={isStudentDisabled}>
                                        <InputLabel>Status</InputLabel>
                                        <Select 
                                            value={data.status} 
                                            onChange={(e) => handleStatusChange(index, e.target.value)}
                                        >
                                            {STATUS_OPTIONS.map(opt => (
                                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    {data.status === 0 && (
                                        <FormControl size="small" disabled={isStudentDisabled}>
                                            <InputLabel>Reason</InputLabel>
                                            <Select 
                                                value={data.absentReason} 
                                                onChange={(e) => handleReasonChange(index, e.target.value)}
                                            >
                                                {REASON_OPTIONS.map(r => (
                                                    <MenuItem key={r} value={r}>{r}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    )}
                                </Box>
                            </Grid>
                        ))}
                    </Grid>

                    <Box mt={3} display="flex" justifyContent="flex-end">
                        <Button 
                            variant="contained" 
                            color="secondary" 
                            size="large" 
                            onClick={handleSave} 
                            disabled={isSaving || isStudentDisabled}
                        >
                            {isSaving ? 'Saving...' : 'Save Attendance'}
                        </Button>
                    </Box>
                </Paper>
            )}

            <Snackbar open={message.open} autoHideDuration={6000} onClose={() => setMessage({ ...message, open: false })}>
                <Alert severity={message.type} sx={{ width: '100%' }}>
                    {message.text}
                </Alert>
            </Snackbar>
        </Box>
    );
};
