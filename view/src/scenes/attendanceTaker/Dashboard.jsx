import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, useTheme, Card, CardContent, FormControl, InputLabel, Select, MenuItem, TextField, Button, Skeleton, Autocomplete } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { tokens } from '../../theme';
import Header from '../../components/Header';
import axios from 'axios';
import { AttendanceCharts } from './AttendanceCharts';
import { CompareAttendanceModal } from './CompareAttendanceModal';
import StatBox from '../../components/StatBox';
import EmailIcon from '@mui/icons-material/Email';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSchools } from '../../components/schoolsSlice';
import { useAuth } from '../auth/authContext.jsx';

const SESSION_YEARS = ['2024/2025', '2025/2026', '2026/2027', '2027/2028', '2028/2029', '2029/2030'];

export const AttendanceTakerDashboard = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const storedUser = JSON.parse(localStorage.getItem('userData'));
    const { userPermissions } = useAuth();
    const isAdminOrCct = Array.isArray(userPermissions) && (userPermissions.includes('handle_admins') || userPermissions.includes('handle_payments') || userPermissions.includes('handle_registrars'));
    const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`;
    const navigate = useNavigate();

    const dispatch = useDispatch();
    const schoolState = useSelector((state) => state.schools);
    const { data: schoolsData, loading: schoolsLoading } = schoolState;

    const [stats, setStats] = useState({ totalStudents: 0, total: 0, absent: 0, present: 0, transferred: 0, dropout: 0, died: 0, daysOpened: 0 });
    const [trend, setTrend] = useState({});
    const [monthlyBarData, setMonthlyBarData] = useState([]);

    // Loading states
    const [isLoadingStats, setIsLoadingStats] = useState(false);
    const [isLoadingTrend, setIsLoadingTrend] = useState(false);
    const [isLoadingBar, setIsLoadingBar] = useState(false);

    // Filters
    const [schoolId, setSchoolId] = useState('all');
    const [cohort, setCohort] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [month, setMonth] = useState(() => {
        const now = new Date();
        // Default to previous month if we're in the first week, since current month may have no data yet
        // Otherwise use current month
        return (now.getMonth() + 1).toString();
    });
    const [year, setYear] = useState(new Date().getFullYear().toString());
    const [term, setTerm] = useState('');
    const [session, setSession] = useState('');
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

    // Abort controller refs so we can cancel stale requests
    const analyticsAbortRef = useRef(null);
    const trendAbortRef = useRef(null);
    const barAbortRef = useRef(null);

    const fetchAnalytics = useCallback(async () => {
        // Cancel any previous in-flight request
        if (analyticsAbortRef.current) analyticsAbortRef.current.abort();
        analyticsAbortRef.current = new AbortController();

        setIsLoadingStats(true);
        try {
            const token = localStorage.getItem("token");
            const assignedSchools = storedUser?.assignedSchools || [];
            let querySchoolId = schoolId;
            if (schoolId === 'all') {
                querySchoolId = isAdminOrCct ? 'all' : assignedSchools.map(s => s._id).join(',');
            }

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

    const fetchMonthlyBar = useCallback(async () => {
        if (barAbortRef.current) barAbortRef.current.abort();
        barAbortRef.current = new AbortController();

        setIsLoadingBar(true);
        try {
            const token = localStorage.getItem('token');
            const assignedSchools = storedUser?.assignedSchools || [];
            let querySchoolId = schoolId;
            if (schoolId === 'all') {
                querySchoolId = isAdminOrCct ? 'all' : assignedSchools.map(s => s._id).join(',');
            }
            const res = await axios.get(`${API_URL}/attendance/school-monthly-bar`, {
                params: { schoolId: querySchoolId, cohort, fromDate, toDate, term, session },
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
                signal: barAbortRef.current.signal,
            });
            setMonthlyBarData(res.data.monthlyData || []);
        } catch (err) {
            if (axios.isCancel(err) || err.name === 'CanceledError') return;
            console.error(err);
        } finally {
            setIsLoadingBar(false);
        }
    }, [schoolId, cohort, fromDate, toDate, term, session]);

    const fetchTrend = useCallback(async () => {
        if (trendAbortRef.current) trendAbortRef.current.abort();
        trendAbortRef.current = new AbortController();

        setIsLoadingTrend(true);
        try {
            const token = localStorage.getItem("token");
            const assignedSchools = storedUser?.assignedSchools || [];
            let querySchoolId = schoolId;
            if (schoolId === 'all') {
                querySchoolId = isAdminOrCct ? 'all' : assignedSchools.map(s => s._id).join(',');
            }

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

    useEffect(() => {
        const timer = setTimeout(() => { fetchMonthlyBar(); }, 600);
        return () => clearTimeout(timer);
    }, [fetchMonthlyBar]);

    useEffect(() => {
        if (isAdminOrCct) {
            dispatch(fetchSchools({ schoolType: '', lgaOfEnrollment: '' }));
        }
    }, [dispatch, isAdminOrCct]);

    // Debounce trend fetch — waits 600ms after last filter change
    useEffect(() => {
        const timer = setTimeout(() => { fetchTrend(); }, 600);
        return () => clearTimeout(timer);
    }, [fetchTrend]);

    const assignedSchools = storedUser?.assignedSchools || [];
    const displaySchools = isAdminOrCct ? schoolsData : assignedSchools;

    return (
        <Box m="20px">
            <Header title={`WELCOME, ${storedUser?.fullName?.toUpperCase()}`} subtitle="Attendance Taker Dashboard" />

            <Box mb="20px" display="flex" gap="10px" flexWrap="wrap">
                <FormControl variant="filled" sx={{ minWidth: 250 }}>
                    <Autocomplete
                        options={[
                            { _id: 'all', schoolName: isAdminOrCct ? 'All Schools' : 'All Assigned Schools' },
                            ...(displaySchools || [])
                        ]}
                        getOptionLabel={(option) => option.schoolName || ''}
                        isOptionEqualToValue={(option, value) => (option._id || option.schoolId) === (value._id || value.schoolId)}
                        value={
                            schoolId === 'all'
                                ? { _id: 'all', schoolName: isAdminOrCct ? 'All Schools' : 'All Assigned Schools' }
                                : (displaySchools || []).find(s => (s._id || s.schoolId) === schoolId) || null
                        }
                        onChange={(event, newValue) => {
                            setSchoolId(newValue ? (newValue._id || newValue.schoolId) : 'all');
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="School"
                                variant="filled"
                                placeholder="Search School"
                            />
                        )}
                        disableClearable
                    />
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
                        + "Total Records,Days Opened,Present,Absent,Transferred,Dropout,Died\n"
                        + `${stats.total},${stats.daysOpened || 0},${stats.present},${stats.absent},${stats.transferred},${stats.dropout},${stats.died}`;
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
                <Box backgroundColor="#f4f6f8" display="flex" alignItems="center" justifyContent="center" borderRadius="8px" boxShadow="0px 2px 4px rgba(0,0,0,0.1)">
                    <StatBox title={isLoadingStats ? <Skeleton variant="text" width={60} /> : (stats.totalStudents || 0).toLocaleString()} subtitle="Total Students" titleColor="#0288d1" subtitleColor="#424242" />
                </Box>
                {/* <Box backgroundColor="#f4f6f8" display="flex" alignItems="center" justifyContent="center" borderRadius="8px" boxShadow="0px 2px 4px rgba(0,0,0,0.1)">
                    <StatBox title={isLoadingStats ? <Skeleton variant="text" width={60} /> : (stats.total || 0).toLocaleString()} subtitle="Expected Records" titleColor="#1976d2" subtitleColor="#424242" />
                </Box> */}
                <Box backgroundColor="#f4f6f8" display="flex" alignItems="center" justifyContent="center" borderRadius="8px" boxShadow="0px 2px 4px rgba(0,0,0,0.1)">
                    <StatBox title={isLoadingStats ? <Skeleton variant="text" width={60} /> : (stats.daysOpened || 0).toLocaleString()} subtitle="Days Opened" titleColor="#7b1fa2" subtitleColor="#424242" />
                </Box>
                <Box backgroundColor="#f4f6f8" display="flex" alignItems="center" justifyContent="center" borderRadius="8px" boxShadow="0px 2px 4px rgba(0,0,0,0.1)">
                    <StatBox title={isLoadingStats ? <Skeleton variant="text" width={60} /> : (stats.present || 0).toLocaleString()} subtitle="Present" titleColor="#388e3c" subtitleColor="#424242" />
                </Box>
                <Box backgroundColor="#f4f6f8" display="flex" alignItems="center" justifyContent="center" borderRadius="8px" boxShadow="0px 2px 4px rgba(0,0,0,0.1)">
                    <StatBox title={isLoadingStats ? <Skeleton variant="text" width={60} /> : (stats.absent || 0).toLocaleString()} subtitle="Absent" titleColor="#d32f2f" subtitleColor="#424242" />
                </Box>
                <Box backgroundColor="#f4f6f8" display="flex" alignItems="center" justifyContent="center" borderRadius="8px" boxShadow="0px 2px 4px rgba(0,0,0,0.1)">
                    <StatBox title={isLoadingStats ? <Skeleton variant="text" width={60} /> : (stats.transferred || 0).toLocaleString()} subtitle="Transferred" titleColor="#f57c00" subtitleColor="#424242" />
                </Box>
                <Box backgroundColor="#f4f6f8" display="flex" alignItems="center" justifyContent="center" borderRadius="8px" boxShadow="0px 2px 4px rgba(0,0,0,0.1)">
                    <StatBox title={isLoadingStats ? <Skeleton variant="text" width={60} /> : (stats.dropout || 0).toLocaleString()} subtitle="Dropout" titleColor="#8d6e63" subtitleColor="#424242" />
                </Box>
                <Box backgroundColor="#f4f6f8" display="flex" alignItems="center" justifyContent="center" borderRadius="8px" boxShadow="0px 2px 4px rgba(0,0,0,0.1)">
                    <StatBox title={isLoadingStats ? <Skeleton variant="text" width={60} /> : (stats.died || 0).toLocaleString()} subtitle="Died" titleColor="#455a64" subtitleColor="#424242" />
                </Box>
            </Box>

            <Box display="flex" gap="20px" flexWrap="wrap">
                <Box flex="1" minWidth="280px" backgroundColor={colors.primary[400]} p="20px" borderRadius="8px">
                    <Typography variant="h5" fontWeight="600" mb="20px">Attendance Analysis</Typography>
                    <Box height="300px">
                        {isLoadingStats ? (
                            <Skeleton variant="rectangular" width="100%" height="100%" />
                        ) : (
                            <AttendanceCharts type="pie" data={stats} />
                        )}
                    </Box>
                </Box>

                <Box flex="2" minWidth="320px" backgroundColor={colors.primary[400]} p="20px" borderRadius="8px">
                    <Typography variant="h5" fontWeight="600" mb="20px">Monthly Attendance Trend</Typography>
                    <Box height="300px">
                        {isLoadingBar ? (
                            <Skeleton variant="rectangular" width="100%" height="100%" />
                        ) : monthlyBarData.length === 0 ? (
                            <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                                <Typography color="textSecondary">No monthly data for selected filters.</Typography>
                            </Box>
                        ) : (
                            <AttendanceCharts type="monthly-bar" data={monthlyBarData} />
                        )}
                    </Box>
                </Box>
            </Box>

            <CompareAttendanceModal
                open={isCompareModalOpen}
                onClose={() => setIsCompareModalOpen(false)}
                schoolsData={isAdminOrCct ? (schoolsData || []) : assignedSchools}
            />
        </Box>
    );
};
