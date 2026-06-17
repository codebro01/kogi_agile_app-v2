import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, InputLabel, Button, TextField, Paper, Snackbar, Alert, Grid, CircularProgress, Divider } from '@mui/material';
import axios from 'axios';
import Header from '../../components/Header';
import { useTheme } from '@mui/material';
import { tokens } from '../../theme';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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

    // Chart Data
    const [chartData, setChartData] = useState(null);
    const [isChartLoading, setIsChartLoading] = useState(false);

    const fileInputRef = useRef(null);

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('userData'));
        if (storedUser && storedUser.assignedSchools) {
            setSchools(storedUser.assignedSchools);
        }
    }, []);

    useEffect(() => {
        if (selectedSchool) {
            fetchStudents();
            fetchChartData();
        } else {
            setStudents([]);
            setSelectedStudent('');
            setChartData(null);
        }
    }, [selectedSchool, session]);

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

    useEffect(() => {
        if (selectedStudent && term && session) {
            fetchExistingAverage();
        }
    }, [selectedStudent, term, session]);

    const fetchChartData = async () => {
        if (!selectedSchool || !session) return;
        setIsChartLoading(true);
        try {
            const res = await axios.get(`${API_URL}/attendance/average-chart-data`, {
                params: { schoolId: selectedSchool, session },
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            
            const data = res.data.chartData;
            setChartData({
                labels: ['First Term', 'Second Term', 'Third Term'],
                datasets: [
                    {
                        label: 'Average Score (%)',
                        data: [data.First, data.Second, data.Third],
                        backgroundColor: colors.blueAccent[500],
                        borderColor: colors.blueAccent[300],
                        borderWidth: 1,
                    }
                ]
            });
        } catch (err) {
            console.error('Failed to fetch chart data', err);
        } finally {
            setIsChartLoading(false);
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
            fetchChartData(); // refresh chart
        } catch (err) {
            console.error(err);
            setMessage({ text: 'Failed to save Termly Average', type: 'error', open: true });
        } finally {
            setIsSaving(false);
        }
    };

    // --- Bulk Operations ---
    
    const handleDownloadTemplate = async () => {
        if (!selectedSchool) {
            setMessage({ text: 'Please select a school first', type: 'warning', open: true });
            return;
        }
        try {
            const res = await axios.get(`${API_URL}/attendance/export-average-template`, {
                params: { schoolId: selectedSchool },
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
                withCredentials: true
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'result_average_template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error(err);
            setMessage({ text: 'Failed to download template', type: 'error', open: true });
        }
    };

    const handleExportRecords = async () => {
        if (!selectedSchool) {
            setMessage({ text: 'Please select a school first', type: 'warning', open: true });
            return;
        }
        try {
            const res = await axios.get(`${API_URL}/attendance/export-average-records`, {
                params: { schoolId: selectedSchool },
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
                withCredentials: true
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'result_averages.xlsx');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (err) {
            console.error(err);
            setMessage({ text: 'Failed to export records', type: 'error', open: true });
        }
    };

    const handleImportRecords = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setIsSaving(true);
        try {
            const res = await axios.post(`${API_URL}/attendance/import-average-records`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });
            setMessage({ text: res.data.message || 'Records imported successfully', type: 'success', open: true });
            fetchChartData(); // refresh chart
        } catch (err) {
            console.error(err);
            setMessage({ text: err.response?.data?.message || 'Failed to import records', type: 'error', open: true });
        } finally {
            setIsSaving(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <Box m="20px">
            <Header title="RESULT AVERAGE" subtitle="Manage and visualize termly average scores" />
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, backgroundColor: colors.primary[400], height: '100%' }}>
                        <Typography variant="h5" mb={2}>Select Parameters</Typography>
                        <Box display="flex" flexDirection="column" gap="20px">
                            <FormControl variant="filled" fullWidth>
                                <InputLabel>School</InputLabel>
                                <Select value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)}>
                                    {schools.map(s => (
                                        <MenuItem key={s._id} value={s._id}>{s.schoolName}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField 
                                label="Session" 
                                variant="filled" 
                                fullWidth 
                                value={session} 
                                onChange={e => setSession(e.target.value)} 
                            />

                            <Divider sx={{ my: 2 }} />

                            <Typography variant="h5">Bulk Actions</Typography>
                            <Box display="flex" gap="10px" flexWrap="wrap">
                                <Button 
                                    variant="outlined" 
                                    color="info" 
                                    onClick={handleDownloadTemplate}
                                    disabled={!selectedSchool}
                                >
                                    Download Empty Sheet
                                </Button>
                                <Button 
                                    variant="contained" 
                                    color="secondary" 
                                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                                >
                                    Import Results
                                </Button>
                                <input 
                                    type="file" 
                                    accept=".xlsx, .xls, .csv" 
                                    ref={fileInputRef} 
                                    style={{ display: 'none' }} 
                                    onChange={handleImportRecords} 
                                />
                                <Button 
                                    variant="outlined" 
                                    color="success" 
                                    onClick={handleExportRecords}
                                    disabled={!selectedSchool}
                                >
                                    Export Records
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, backgroundColor: colors.primary[400], height: '100%' }}>
                        <Typography variant="h5" mb={2}>Single Student Entry</Typography>
                        <Box display="flex" flexDirection="column" gap="20px">
                            <FormControl variant="filled" fullWidth disabled={!selectedSchool}>
                                <InputLabel>Student (Beneficiaries Only)</InputLabel>
                                <Select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}>
                                    <MenuItem value=""><em>Select Student</em></MenuItem>
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
                                onClick={handleSave} 
                                disabled={isSaving || !selectedStudent}
                            >
                                {isSaving ? 'Saving...' : 'Save Termly Average'}
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12}>
                    <Paper sx={{ p: 3, backgroundColor: colors.primary[400], mt: 2 }}>
                        <Typography variant="h5" mb={2}>Average Performance by Term</Typography>
                        <Box height="400px" display="flex" justifyContent="center" alignItems="center">
                            {!selectedSchool ? (
                                <Typography>Select a school to view performance chart</Typography>
                            ) : isChartLoading ? (
                                <CircularProgress color="secondary" />
                            ) : chartData ? (
                                <Bar 
                                    data={chartData} 
                                    options={{ 
                                        responsive: true, 
                                        maintainAspectRatio: false,
                                        plugins: { legend: { position: 'top' } },
                                        scales: { y: { beginAtZero: true, max: 100 } }
                                    }} 
                                />
                            ) : (
                                <Typography>No chart data available</Typography>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            <Snackbar open={message.open} autoHideDuration={6000} onClose={() => setMessage({ ...message, open: false })}>
                <Alert severity={message.type} sx={{ width: '100%' }}>
                    {message.text}
                </Alert>
            </Snackbar>
        </Box>
    );
};
