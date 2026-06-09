import React from 'react';
import { Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title } from 'chart.js';
import { useTheme } from '@mui/material';
import { tokens } from '../../theme';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title);

export const AttendanceCharts = ({ type, data }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    if (type === 'pie') {
        const chartData = {
            labels: ['Present', 'Absent', 'Transferred', 'Dropout', 'Died'],
            datasets: [
                {
                    data: [data.present, data.absent, data.transferred, data.dropout, data.died],
                    backgroundColor: [
                        colors.greenAccent[500],
                        colors.redAccent[500],
                        colors.blueAccent[500],
                        colors.grey[500],
                        '#424242'
                    ],
                    borderColor: colors.primary[400],
                    borderWidth: 1,
                },
            ],
        };
        return <Pie data={chartData} options={{ maintainAspectRatio: false }} />;
    }

    if (type === 'line') {
        const labels = Object.keys(data);
        const presentData = labels.map(day => data[day].present);
        const absentData = labels.map(day => data[day].absent);

        const chartData = {
            labels,
            datasets: [
                {
                    label: 'Present',
                    data: presentData,
                    borderColor: colors.greenAccent[500],
                    backgroundColor: colors.greenAccent[500],
                    tension: 0.4
                },
                {
                    label: 'Absent',
                    data: absentData,
                    borderColor: colors.redAccent[500],
                    backgroundColor: colors.redAccent[500],
                    tension: 0.4
                }
            ],
        };
        return <Line data={chartData} options={{ maintainAspectRatio: false }} />;
    }

    return null;
};
