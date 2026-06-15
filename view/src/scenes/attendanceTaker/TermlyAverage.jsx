import React, { useState, useEffect } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, Button, TextField, Paper, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import Header from '../../components/Header';
import { useTheme } from '@mui/material';
import { tokens } from '../../theme';

export const TermlyAverage = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`;
    const token = localStorage.getItem('token');
    
    const [schools, setSchools] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState('');
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [year, setYear] = useState(new Date().getFullYear());
    const [term, setTerm] = useState('First');
    const [session, setSession] = useState(`${year - 1}/${year}`);
    const [averageScore, setAverageScore] = useState('');
    
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: 'success', open: false });

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('userData'));
        if (storedUser && storedUser.assignedSchools) {
            setSchools(storedUser.assignedSchools);
        }
    }, []);

    useEffect(() => {
        if (selectedSchool) {
            fetchStudents();
        } else {
            setStudents([]);
            setSelectedStudent('');
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
            setSelectedStudent('');
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (selectedStudent && term && session) {
            fetchExistingAverage();
        }
    }, [selectedStudent, term, session]);

    const fetchExistingAverage = async () => {
        try {
            const res = await axios.get(`${API_URL}/attendance/termly-average`, {
                params: { studentId: selectedStudent, term, session },
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            if (res.data.records && res.data.records.length > 0) {
                setAverageScore(res.data.records[0].averageScore);
            } else {
                setAverageScore('');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async () => {
        if (!selectedStudent || !term || !session || averageScore === '') {
            setMessage({ text: 'Please fill all required fields', type: 'warning', open: true });
            return;
        }

        setIsSaving(true);
        try {
            await axios.post(`${API_URL}/attendance/termly-average`, {
                studentId: selectedStudent,
                term,
                session,
                averageScore: Number(averageScore)
            }, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            setMessage({ text: 'Termly Average saved successfully', type: 'success', open: true });
        } catch (err) {
            console.error(err);
            setMessage({ text: 'Failed to save Termly Average', type: 'error', open: true });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Box m="20px">
            <Header title="TERMLY AVERAGE" subtitle="Record termly average score for students" />
            
            <Paper sx={{ p: 3, backgroundColor: colors.primary[400], maxWidth: '600px' }}>
                <Box display="flex" flexDirection="column" gap="20px">
                    <FormControl variant="filled" fullWidth>
                        <InputLabel>School</InputLabel>
                        <Select value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)}>
                            {schools.map(s => (
                                <MenuItem key={s._id} value={s._id}>{s.schoolName}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl variant="filled" fullWidth disabled={!selectedSchool}>
                        <InputLabel>Student (Beneficiaries Only)</InputLabel>
                        <Select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
                            {students.map(s => (
                                <MenuItem key={s._id} value={s._id}>
                                    {s.surname} {s.firstname} {s.middlename} ({s.accountNumber}) {!s.isActive && ' - INACTIVE'}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl variant="filled" fullWidth>
                        <InputLabel>Term</InputLabel>
                        <Select value={term} onChange={(e) => setTerm(e.target.value)}>
                            <MenuItem value="First">First</MenuItem>
                            <MenuItem value="Second">Second</MenuItem>
                            <MenuItem value="Third">Third</MenuItem>
                        </Select>
                    </FormControl>

                    <TextField 
                        label="Session" 
                        variant="filled" 
                        fullWidth 
                        value={session} 
                        onChange={e => setSession(e.target.value)} 
                    />

                    <TextField 
                        label="Average Score" 
                        variant="filled" 
                        fullWidth 
                        type="number"
                        value={averageScore} 
                        onChange={e => setAverageScore(e.target.value)} 
                    />

                    <Button 
                        variant="contained" 
                        color="secondary" 
                        size="large" 
                        onClick={handleSave} 
                        disabled={isSaving || !selectedStudent}
                    >
                        {isSaving ? 'Saving...' : 'Save Termly Average'}
                    </Button>
                </Box>
            </Paper>

            <Snackbar open={message.open} autoHideDuration={6000} onClose={() => setMessage({ ...message, open: false })}>
                <Alert severity={message.type} sx={{ width: '100%' }}>
                    {message.text}
                </Alert>
            </Snackbar>
        </Box>
    );
};
