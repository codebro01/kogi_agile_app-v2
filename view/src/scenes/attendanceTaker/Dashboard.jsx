import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme, Card, CardContent, FormControl, InputLabel, Select, MenuItem, TextField, Button } from '@mui/material';
import { tokens } from '../../theme';
import Header from '../../components/Header';
import axios from 'axios';
import { AttendanceCharts } from './AttendanceCharts';
import StatBox from '../../components/StatBox';
import EmailIcon from '@mui/icons-material/Email';

export const AttendanceTakerDashboard = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const storedUser = JSON.parse(localStorage.getItem('userData'));
    const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

    const [stats, setStats] = useState({ total: 0, absent: 0, present: 0, transferred: 0, dropout: 0, died: 0 });
    const [trend, setTrend] = useState({});
    
    // Filters
    const [schoolId, setSchoolId] = useState('all');
    const [cohort, setCohort] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
    const [year, setYear] = useState(new Date().getFullYear().toString());

    useEffect(() => {
        fetchAnalytics();
        fetchTrend();
    }, [schoolId, cohort, fromDate, toDate, month, year]);

    const fetchAnalytics = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_URL}/attendance/analytics`, {
                params: { schoolId, cohort, fromDate, toDate },
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            setStats(res.data.stats);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchTrend = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_URL}/attendance/monthly-trend`, {
                params: { schoolId, month, year },
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            setTrend(res.data.trend);
        } catch (err) {
            console.error(err);
        }
    };

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
            </Box>

            <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap="20px" mb="20px">
                <Box gridColumn="span 2" backgroundColor={colors.primary[400]} display="flex" alignItems="center" justifyContent="center">
                    <StatBox title={stats.total} subtitle="Total Records" />
                </Box>
                <Box gridColumn="span 2" backgroundColor={colors.greenAccent[600]} display="flex" alignItems="center" justifyContent="center">
                    <StatBox title={stats.present} subtitle="Present" />
                </Box>
                <Box gridColumn="span 2" backgroundColor={colors.redAccent[600]} display="flex" alignItems="center" justifyContent="center">
                    <StatBox title={stats.absent} subtitle="Absent" />
                </Box>
                <Box gridColumn="span 2" backgroundColor={colors.blueAccent[600]} display="flex" alignItems="center" justifyContent="center">
                    <StatBox title={stats.transferred} subtitle="Transferred" />
                </Box>
                <Box gridColumn="span 2" backgroundColor={colors.grey[600]} display="flex" alignItems="center" justifyContent="center">
                    <StatBox title={stats.dropout} subtitle="Dropout" />
                </Box>
                <Box gridColumn="span 2" backgroundColor="#1e1e1e" display="flex" alignItems="center" justifyContent="center">
                    <StatBox title={stats.died} subtitle="Died" />
                </Box>
            </Box>

            <Box display="flex" gap="20px">
                <Box flex="1" backgroundColor={colors.primary[400]} p="20px" borderRadius="8px">
                    <Typography variant="h5" fontWeight="600" mb="20px">Attendance Analysis</Typography>
                    <Box height="300px">
                        <AttendanceCharts type="pie" data={stats} />
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
                        <AttendanceCharts type="line" data={trend} />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};
