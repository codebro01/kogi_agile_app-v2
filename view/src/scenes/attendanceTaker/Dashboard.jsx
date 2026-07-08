import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, useTheme, Card, CardContent, FormControl, InputLabel, Select, MenuItem, TextField, Button, Skeleton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../../theme';
import Header from '../../components/Header';
import axios from 'axios';
import { AttendanceCharts } from './AttendanceCharts';
import { CompareAttendanceModal } from './CompareAttendanceModal';
import StatBox from '../../components/StatBox';
import EmailIcon from '@mui/icons-material/Email';

const SESSION_YEARS = ['2024/2025', '2025/2026', '2026/2027', '2027/2028', '2028/2029', '2029/2030'];

export const AttendanceTakerDashboard = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const storedUser = JSON.parse(localStorage.getItem('userData'));
    const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`;
    const navigate = useNavigate();

    const [stats, setStats] = useState({ totalStudents: 0, total: 0, absent: 0, present: 0, transferred: 0, dropout: 0, died: 0 });
    const [trend, setTrend] = useState({});
    
    // Loading states
    const [isLoadingStats, setIsLoadingStats] = useState(false);
    const [isLoadingTrend, setIsLoadingTrend] = useState(false);
    
    // Filters
    const [schoolId, setSchoolId] = useState('all');
    const [cohort, setCohort] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [term, setTerm] = useState('');
    const [session, setSession] = useState('');
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

    // Abort controller refs so we can cancel stale requests
    const analyticsAbortRef = useRef(null);
    const trendAbortRef = useRef(null);

    const fetchAnalytics = useCallback(async () => {
        // Cancel any previous in-flight request
        if (analyticsAbortRef.current) analyticsAbortRef.current.abort();
        analyticsAbortRef.current = new AbortController();

        setIsLoadingStats(true);
        try {
            const token = localStorage.getItem("token");
            const assignedSchools = storedUser?.assignedSchools || [];
            const querySchoolId = schoolId === 'all' ? assignedSchools.map(s => s._id).join(',') : schoolId;
            
            const res = await axios.get(`${API_URL}/attendance/school-analytics`, {
                params: { schoolId: querySchoolId, cohort, fromDate, toDate, term, session },
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
                signal: analyticsAbortRef.current.signal,
            });
            setStats(res.data.stats);
        } catch (err) {
            if (axios.isCancel(err) || err.name === 'CanceledError') return; // Ignore cancelled requests
            console.error(err);
        } finally {
            setIsLoadingStats(false);
        }
    }, [schoolId, cohort, fromDate, toDate, term, session]);

    const fetchTrend = useCallback(async () => {
        if (trendAbortRef.current) trendAbortRef.current.abort();
        trendAbortRef.current = new AbortController();

        setIsLoadingTrend(true);
        try {
            const token = localStorage.getItem("token");
            const assignedSchools = storedUser?.assignedSchools || [];
            const querySchoolId = schoolId === 'all' ? assignedSchools.map(s => s._id).join(',') : schoolId;

            const res = await axios.get(`${API_URL}/attendance/school-monthly-trend`, {
                params: { schoolId: querySchoolId, month, year },
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
                signal: trendAbortRef.current.signal,
            });
            setTrend(res.data.trend);
        } catch (err) {
            if (axios.isCancel(err) || err.name === 'CanceledError') return;
            console.error(err);
        } finally {
            setIsLoadingTrend(false);
        }
    }, [schoolId, month, year]);

    // Debounce analytics fetch — waits 600ms after last filter change
    useEffect(() => {
        const timer = setTimeout(() => { fetchAnalytics(); }, 600);
        return () => clearTimeout(timer);
    }, [fetchAnalytics]);

    // Debounce trend fetch — waits 600ms after last filter change
    useEffect(() => {
        const timer = setTimeout(() => { fetchTrend(); }, 600);
        return () => clearTimeout(timer);
    }, [fetchTrend]);

    const assignedSchools = storedUser?.assignedSchools || [];

    return (
        <Box m="20px">
            <Header title={`WELCOME, ${storedUser?.fullName?.toUpperCase()}`} subtitle="Attendance Taker Dashboard" />
            
            <Box mb="20px" display="flex" gap="10px" flexWrap="wrap">
                <FormControl variant="filled" sx={{ minWidth: 200 }}>
                    <InputLabel>School</InputLabel>
                    <Select value={schoolId} onChange={(e) => setSchoolId(e.target.value)}>
                        <MenuItem value="all">All Assigned Schools</MenuItem>
                        {assignedSchools.map(s => (
                            <MenuItem key={s._id} value={s._id}>{s.schoolName}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    variant="filled"
                    label="Cohort"
                    type="number"
                    value={cohort}
                    onChange={(e) => setCohort(e.target.value)}
                />

                <TextField
                    variant="filled"
                    label="From Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                />

                <TextField
                    variant="filled"
                    label="To Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                />

                <FormControl variant="filled" sx={{ minWidth: 120 }}>
                    <InputLabel>Term</InputLabel>
                    <Select value={term} onChange={(e) => setTerm(e.target.value)}>
                        <MenuItem value="">All Terms</MenuItem>
                        <MenuItem value="First Term">First Term</MenuItem>
                        <MenuItem value="Second Term">Second Term</MenuItem>
                        <MenuItem value="Third Term">Third Term</MenuItem>
                    </Select>
                </FormControl>

                <FormControl variant="filled" sx={{ minWidth: 150 }}>
                    <InputLabel>Session</InputLabel>
                    <Select value={session} onChange={(e) => setSession(e.target.value)}>
                        <MenuItem value="">All Sessions</MenuItem>
                        {['2024/2025', '2025/2026', '2026/2027', '2027/2028', '2028/2029', '2029/2030'].map(s => (
                            <MenuItem key={s} value={s}>{s}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button variant="contained" color="secondary" sx={{ ml: 2 }} onClick={() => {
                    const csvContent = "data:text/csv;charset=utf-8," 
                        + "Total Records,Present,Absent,Transferred,Dropout,Died\n"
                        + `${stats.total},${stats.present},${stats.absent},${stats.transferred},${stats.dropout},${stats.died}`;
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", "attendance_analytics.csv");
                    document.body.appendChild(link);
                    link.click();
                }}>
                    Export Analytics CSV
                </Button>

                <Button variant="contained" color="info" sx={{ ml: 2 }} onClick={() => setIsCompareModalOpen(true)}>
                    Compare Performance
                </Button>

                <Button 
                    variant="contained" 
                    color="success" 
                    sx={{ ml: 2 }} 
                    onClick={() => navigate('/attendance-taker-dashboard/take-school-attendance')}
                >
                    Take School-Based Attendance
                </Button>
            </Box>

            <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(150px, 1fr))" gap="20px" mb="20px">
                <Box backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
                    <StatBox title={isLoadingStats ? <Skeleton variant="text" width={60} /> : (stats.totalStudents || 0)} subtitle="Total Students" />
                </Box>
                <Box backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
                    <StatBox title={isLoadingStats ? <Skeleton variant="text" width={60} /> : stats.total} subtitle="Total Records" />
                </Box>
                <Box backgroundColor={colors.greenAccent[600]} display="flex" alignItems="center" justifyContent="center">
                    <StatBox title={isLoadingStats ? <Skeleton variant="text" width={60} /> : stats.present} subtitle="Present" />
                </Box>
                <Box backgroundColor={colors.redAccent[600]} display="flex" alignItems="center" justifyContent="center">
                    <StatBox title={isLoadingStats ? <Skeleton variant="text" width={60} /> : stats.absent} subtitle="Absent" />
                </Box>
                <Box backgroundColor={colors.blueAccent[600]} display="flex" alignItems="center" justifyContent="center">
                    <StatBox title={isLoadingStats ? <Skeleton variant="text" width={60} /> : stats.transferred} subtitle="Transferred" />
                </Box>
                <Box backgroundColor={colors.grey[600]} display="flex" alignItems="center" justifyContent="center">
                    <StatBox title={isLoadingStats ? <Skeleton variant="text" width={60} /> : stats.dropout} subtitle="Dropout" />
                </Box>
                <Box backgroundColor="#1e1e1e" display="flex" alignItems="center" justifyContent="center">
                    <StatBox title={isLoadingStats ? <Skeleton variant="text" width={60} /> : stats.died} subtitle="Died" />
                </Box>
            </Box>

            <Box display="flex" gap="20px">
                <Box flex="1" backgroundColor={colors.primary[400]} p="20px" borderRadius="8px">
                    <Typography variant="h5" fontWeight="600" mb="20px">Attendance Analysis</Typography>
                    <Box height="300px">
                        {isLoadingStats ? (
                            <Skeleton variant="rectangular" width="100%" height="100%" />
                        ) : (
                            <AttendanceCharts type="pie" data={stats} />
                        )}
                    </Box>
                </Box>

                <Box flex="2" backgroundColor={colors.primary[400]} p="20px" borderRadius="8px">
                    <Box display="flex" justifyContent="space-between" mb="20px">
                        <Typography variant="h5" fontWeight="600">Monthly Trend</Typography>
                        <Box display="flex" gap="10px">
                            <FormControl variant="filled" size="small">
                                <InputLabel>Month</InputLabel>
                                <Select value={month} onChange={(e) => setMonth(e.target.value)}>
                                    {[...Array(12).keys()].map(m => (
                                        <MenuItem key={m + 1} value={m + 1}>{m + 1}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                variant="filled"
                                size="small"
                                label="Year"
                                type="number"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                            />
                        </Box>
                    </Box>
                    <Box height="300px">
                        {isLoadingTrend ? (
                            <Skeleton variant="rectangular" width="100%" height="100%" />
                        ) : (
                            <AttendanceCharts type="line" data={trend} />
                        )}
                    </Box>
                </Box>
            </Box>

            <CompareAttendanceModal 
                open={isCompareModalOpen} 
                onClose={() => setIsCompareModalOpen(false)} 
                assignedSchools={assignedSchools}
            />
        </Box>
    );
};
