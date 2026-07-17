import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, FormControl, InputLabel, Select, MenuItem, TextField, Grid, Autocomplete } from '@mui/material';
import axios from 'axios';
import { AttendanceCharts } from './AttendanceCharts';

const CLASS_OPTIONS = ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6', 'JSS 1', 'JSS 2', 'JSS 3', 'SSS 1', 'SSS 2', 'SSS 3'];
const TERM_OPTIONS = ['First Term', 'Second Term', 'Third Term'];
const SESSION_OPTIONS = ['2024/2025', '2025/2026', '2026/2027', '2027/2028', '2028/2029', '2029/2030'];

export const CompareAttendanceModal = ({ open, onClose, schoolsData }) => {
    const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

    const [groupA, setGroupA] = useState({ schoolId: 'all', presentClass: '', term: '', session: '', fromDate: '', toDate: '' });
    const [groupB, setGroupB] = useState({ schoolId: 'all', presentClass: '', term: '', session: '', fromDate: '', toDate: '' });
    
    const [chartData, setChartData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleRunComparison = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            
            const [resA, resB] = await Promise.all([
                axios.get(`${API_URL}/attendance/school-analytics`, { params: groupA, headers: { Authorization: `Bearer ${token}` }, withCredentials: true }),
                axios.get(`${API_URL}/attendance/school-analytics`, { params: groupB, headers: { Authorization: `Bearer ${token}` }, withCredentials: true })
            ]);

            const groupALabel = `A: ${schoolsData.find(s => s._id === groupA.schoolId)?.schoolName || 'All Schools'} ${groupA.presentClass ? `(${groupA.presentClass})` : ''}`;
            const groupBLabel = `B: ${schoolsData.find(s => s._id === groupB.schoolId)?.schoolName || 'All Schools'} ${groupB.presentClass ? `(${groupB.presentClass})` : ''}`;

            setChartData({
                groupA: resA.data.stats,
                groupB: resB.data.stats,
                groupALabel,
                groupBLabel
            });
        } catch (err) {
            console.error('Error fetching comparison data', err);
        }
        setIsLoading(false);
    };

    const renderFilterGroup = (title, groupState, setGroupState) => (
        <Box p={2} border="1px solid #444" borderRadius="8px">
            <Typography variant="h6" mb={2}>{title}</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Autocomplete
                        options={[{ _id: 'all', schoolName: 'All Schools' }, ...schoolsData]}
                        getOptionLabel={(option) => option.schoolName || ''}
                        value={[{ _id: 'all', schoolName: 'All Schools' }, ...schoolsData].find(o => o._id === groupState.schoolId) || null}
                        onChange={(event, newValue) => {
                            setGroupState({ ...groupState, schoolId: newValue ? newValue._id : 'all' });
                        }}
                        isOptionEqualToValue={(option, value) => option._id === value._id}
                        renderInput={(params) => <TextField {...params} variant="filled" label="School" fullWidth />}
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormControl variant="filled" fullWidth>
                        <InputLabel>Class</InputLabel>
                        <Select value={groupState.presentClass} onChange={(e) => setGroupState({ ...groupState, presentClass: e.target.value })}>
                            <MenuItem value="">All Classes</MenuItem>
                            {CLASS_OPTIONS.map(c => (
                                <MenuItem key={c} value={c}>{c}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <FormControl variant="filled" fullWidth>
                        <InputLabel>Term</InputLabel>
                        <Select value={groupState.term} onChange={(e) => setGroupState({ ...groupState, term: e.target.value })}>
                            <MenuItem value="">All Terms</MenuItem>
                            {TERM_OPTIONS.map(t => (
                                <MenuItem key={t} value={t}>{t}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <FormControl variant="filled" fullWidth>
                        <InputLabel>Session</InputLabel>
                        <Select value={groupState.session} onChange={(e) => setGroupState({ ...groupState, session: e.target.value })}>
                            <MenuItem value="">All Sessions</MenuItem>
                            {SESSION_OPTIONS.map(s => (
                                <MenuItem key={s} value={s}>{s}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        variant="filled"
                        fullWidth
                        label="From Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={groupState.fromDate}
                        onChange={(e) => setGroupState({ ...groupState, fromDate: e.target.value })}
                    />
                </Grid>
                <Grid item xs={6}>
                    <TextField
                        variant="filled"
                        fullWidth
                        label="To Date"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        value={groupState.toDate}
                        onChange={(e) => setGroupState({ ...groupState, toDate: e.target.value })}
                    />
                </Grid>
            </Grid>
        </Box>
    );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
            <DialogTitle>Compare Attendance Performance</DialogTitle>
            <DialogContent>
                <Grid container spacing={3} mt={1}>
                    <Grid item xs={12} md={6}>
                        {renderFilterGroup('Group A', groupA, setGroupA)}
                    </Grid>
                    <Grid item xs={12} md={6}>
                        {renderFilterGroup('Group B', groupB, setGroupB)}
                    </Grid>
                </Grid>

                <Box mt={3} display="flex" justifyContent="center">
                    <Button variant="contained" color="secondary" onClick={handleRunComparison} disabled={isLoading}>
                        {isLoading ? 'Running...' : 'Run Comparison'}
                    </Button>
                </Box>

                {chartData && (
                    <Box mt={4} height="400px" p={2} border="1px solid #444" borderRadius="8px">
                        <AttendanceCharts type="bar" data={chartData} />
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Close</Button>
            </DialogActions>
        </Dialog>
    );
};
