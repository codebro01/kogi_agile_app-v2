import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Box, Typography, useTheme, Card, CardContent, FormControl, InputLabel, Select, MenuItem, TextField, Button, Autocomplete, LinearProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Modal, CircularProgress } from '@mui/material';
import { tokens } from '../../theme';
import Header from '../../components/Header';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import * as XLSX from 'xlsx';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSchools } from '../../components/schoolsSlice';
import { useAuth } from '../auth/authContext.jsx';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SESSION_YEARS = ['2024/2025', '2025/2026', '2026/2027', '2027/2028', '2028/2029', '2029/2030'];
const CLASS_OPTIONS = ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6', 'JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3'];
const TERM_OPTIONS = ['First Term', 'Second Term', 'Third Term'];
const COHORT_OPTIONS = [1, 2, 3, 4];

export const TermlyAverageAnalytics = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

    const { userPermissions } = useAuth();
    const storedUser = JSON.parse(localStorage.getItem('userData'));
    const isAdminOrCct = Array.isArray(userPermissions) && (userPermissions.includes('handle_admins') || userPermissions.includes('handle_payments') || userPermissions.includes('handle_registrars'));

    const dispatch = useDispatch();
    const schoolState = useSelector((state) => state.schools);
    const { data: schoolsData } = schoolState;

    useEffect(() => {
        if (!schoolsData || schoolsData.length === 0) {
            dispatch(fetchSchools({ schoolType: '', lgaOfEnrollment: '' }));
        }
    }, [dispatch, schoolsData]);

    const [filters, setFilters] = useState({
        schoolId: 'all',
        cohort: '',
        presentClass: '',
        session: '',
        term: ''
    });

    const [data, setData] = useState({ records: [], stats: { totalRecords: 0, overallAverage: 0 }, chartData: { First: 0, Second: 0, Third: 0 } });
    const [isLoading, setIsLoading] = useState(false);
    const abortRef = useRef(null);

    const fetchAnalytics = useCallback(async () => {
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();
        setIsLoading(true);

        try {
            const token = localStorage.getItem("token");
            const assignedSchools = storedUser?.assignedSchools || [];
            let querySchoolId = filters.schoolId;
            if (filters.schoolId === 'all') {
                querySchoolId = isAdminOrCct ? 'all' : assignedSchools.map(s => s._id).join(',');
            }

            const res = await axios.get(`${API_URL}/attendance/termly-average-analytics`, {
                params: { ...filters, schoolId: querySchoolId },
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
                signal: abortRef.current.signal,
            });

            setData(res.data);
        } catch (err) {
            if (axios.isCancel(err) || err.name === 'CanceledError') return;
            console.error('Error fetching analytics', err);
        } finally {
            setIsLoading(false);
        }
    }, [isAdminOrCct, storedUser, API_URL]); // Removed filters from dependency to prevent auto-fetch on every keystroke

    useEffect(() => {
        // Initial fetch only (we pass current filters dynamically inside fetchAnalytics using the current state)
        // Wait, to use current filters inside fetchAnalytics without adding them to dependencies, we can use a ref.
        // Actually, useCallback captures the scope, so if we don't add filters, it will use the stale closure.
        // Let's keep filters in useCallback, but remove fetchAnalytics from useEffect dependency array so it doesn't auto-run.
        fetchAnalytics();
        return () => { if (abortRef.current) abortRef.current.abort(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleExport = () => {
        if (data.records.length === 0) return;
        const exportData = data.records.map(r => ({
            'Student Name': `${r.student?.surname || ''} ${r.student?.firstname || ''} ${r.student?.middlename || ''}`.trim(),
            'Account Number': r.student?.accountNumber || 'N/A',
            'Class': r.student?.presentClass || 'N/A',
            'Cohort': r.student?.cohort || 'N/A',
            'Term': r.term,
            'Session': r.session,
            'Average Score': r.averageScore
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Termly Average Analytics");
        XLSX.writeFile(workbook, `termly_average_analytics_${new Date().getTime()}.xlsx`);
    };

    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Average Score Per Term',
                color: colors.grey[100],
                font: { size: 16 }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: { color: colors.grey[100] }
            },
            x: {
                ticks: { color: colors.grey[100] }
            }
        }
    }), [colors.grey]);

    const chartDataObj = useMemo(() => ({
        labels: ['First Term', 'Second Term', 'Third Term'],
        datasets: [
            {
                label: 'Average Score',
                data: [data.chartData.First, data.chartData.Second, data.chartData.Third],
                backgroundColor: '#388e3c',
            }
        ]
    }), [data.chartData]);

    return (
        <Box m="20px">
            <Header title="Termly Average Analytics" subtitle="Analyze student result averages" />
            
            <Box mb="20px" p="15px"  borderRadius="8px">
                <Typography variant="h6" color={colors.grey[100]} mb="15px">Filters</Typography>
                <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="15px">
                    <Autocomplete
                        options={[{ _id: 'all', schoolName: 'All Schools' }, ...(schoolsData || [])]}
                        getOptionLabel={(option) => option.schoolName || ''}
                        value={[{ _id: 'all', schoolName: 'All Schools' }, ...(schoolsData || [])].find(o => o._id === filters.schoolId) || null}
                        onChange={(event, newValue) => handleFilterChange('schoolId', newValue ? newValue._id : 'all')}
                        isOptionEqualToValue={(option, value) => option._id === value._id}
                        renderInput={(params) => <TextField {...params} variant="filled" label="School" />}
                    />
                    
                    <FormControl variant="filled">
                        <InputLabel>Cohort</InputLabel>
                        <Select value={filters.cohort} onChange={(e) => handleFilterChange('cohort', e.target.value)}>
                            <MenuItem value="">All Cohorts</MenuItem>
                            {COHORT_OPTIONS.map(c => <MenuItem key={c} value={c}>Cohort {c}</MenuItem>)}
                        </Select>
                    </FormControl>

                    <FormControl variant="filled">
                        <InputLabel>Class</InputLabel>
                        <Select value={filters.presentClass} onChange={(e) => handleFilterChange('presentClass', e.target.value)}>
                            <MenuItem value="">All Classes</MenuItem>
                            {CLASS_OPTIONS.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                        </Select>
                    </FormControl>

                    <FormControl variant="filled">
                        <InputLabel>Session</InputLabel>
                        <Select value={filters.session} onChange={(e) => handleFilterChange('session', e.target.value)}>
                            <MenuItem value="">All Sessions</MenuItem>
                            {SESSION_YEARS.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </Select>
                    </FormControl>

                    <FormControl variant="filled">
                        <InputLabel>Term</InputLabel>
                        <Select value={filters.term} onChange={(e) => handleFilterChange('term', e.target.value)}>
                            <MenuItem value="">All Terms</MenuItem>
                            {TERM_OPTIONS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                        </Select>
                    </FormControl>

                    <Button 
                        variant="contained" 
                        color="secondary" 
                        onClick={fetchAnalytics}
                        sx={{ fontWeight: 'bold' }}
                    >
                        Apply Filters
                    </Button>
                </Box>
            </Box>

            <Modal open={isLoading} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box backgroundColor={colors.primary[400]} p={4} borderRadius={2} display="flex" flexDirection="column" alignItems="center" outline="none" border="none">
                    <CircularProgress color="secondary" size={50} sx={{ mb: 2 }} />
                    <Typography variant="h5" color={colors.grey[100]}>Fetching termly average analytics...</Typography>
                </Box>
            </Modal>

            <Box display="grid" gridTemplateColumns="repeat(3, 1fr)" gap="20px" mb="20px">
                <Box backgroundColor="#f4f6f8" display="flex" flexDirection="column" alignItems="center" justifyContent="center" p="20px" borderRadius="8px" boxShadow="0px 2px 4px rgba(0,0,0,0.1)">
                    <Typography variant="h3" fontWeight="bold" color="#2196f3" mb="5px">{data.stats.totalRecords}</Typography>
                    <Typography variant="h6" color="#333" fontWeight="bold">Total Records</Typography>
                </Box>
                <Box backgroundColor="#f4f6f8" display="flex" flexDirection="column" alignItems="center" justifyContent="center" p="20px" borderRadius="8px" boxShadow="0px 2px 4px rgba(0,0,0,0.1)">
                    <Typography variant="h3" fontWeight="bold" color="#9c27b0" mb="5px">{data.stats.overallAverage}%</Typography>
                    <Typography variant="h6" color="#333" fontWeight="bold">Overall Average</Typography>
                </Box>
                <Box display="flex" alignItems="center" justifyContent="center">
                    <Button variant="contained" color="secondary" onClick={handleExport} sx={{ p: "15px 30px", fontSize: "16px", fontWeight: "bold" }} disabled={data.records.length === 0}>
                        Export Data
                    </Button>
                </Box>
            </Box>

            <Box height="300px" backgroundColor={colors.primary[400]} p="20px" borderRadius="8px" mb="20px" boxShadow="0px 2px 4px rgba(0,0,0,0.1)">
                <Bar data={chartDataObj} options={chartOptions} />
            </Box>

            <Box backgroundColor={colors.primary[400]} p="15px" borderRadius="8px" boxShadow="0px 2px 4px rgba(0,0,0,0.1)">
                <Typography variant="h6" color={colors.grey[100]} mb="15px">Filtered Records</Typography>
                <TableContainer component={Paper} sx={{ backgroundColor: 'transparent' }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold' }}>Student Name</TableCell>
                                <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold' }}>Account Number</TableCell>
                                <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold' }}>Class</TableCell>
                                <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold' }}>Cohort</TableCell>
                                <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold' }}>Term</TableCell>
                                <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold' }}>Session</TableCell>
                                <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold' }}>Average Score</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.records.slice(0, 50).map((record, index) => (
                                <TableRow key={index}>
                                    <TableCell sx={{ color: colors.grey[100] }}>{`${record.student?.surname || ''} ${record.student?.firstname || ''}`.trim()}</TableCell>
                                    <TableCell sx={{ color: colors.grey[100] }}>{record.student?.accountNumber || 'N/A'}</TableCell>
                                    <TableCell sx={{ color: colors.grey[100] }}>{record.student?.presentClass || 'N/A'}</TableCell>
                                    <TableCell sx={{ color: colors.grey[100] }}>{record.student?.cohort || 'N/A'}</TableCell>
                                    <TableCell sx={{ color: colors.grey[100] }}>{record.term}</TableCell>
                                    <TableCell sx={{ color: colors.grey[100] }}>{record.session}</TableCell>
                                    <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold' }}>{record.averageScore}</TableCell>
                                </TableRow>
                            ))}
                            {data.records.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ color: colors.grey[100], py: 3 }}>No records found</TableCell>
                                </TableRow>
                            )}
                            {data.records.length > 50 && (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ color: colors.greenAccent[500], py: 2 }}>Showing top 50 records. Export to view all {data.records.length} records.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

        </Box>
    );
};
