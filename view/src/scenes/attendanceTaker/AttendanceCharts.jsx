import React from 'react';
import { Pie, Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from 'chart.js';
import { useTheme } from '@mui/material';
import { tokens } from '../../theme';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title);

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
        const pieOptions = {
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const value = context.raw;
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
                            return label + value.toLocaleString() + ' (' + percentage + ')';
                        }
                    }
                }
            }
        };
        return <Pie data={chartData} options={pieOptions} />;
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

    if (type === 'bar' && data.groupA && data.groupB) {
        const labels = ['Present', 'Absent', 'Transferred', 'Dropout', 'Died'];
        const chartData = {
            labels,
            datasets: [
                {
                    label: data.groupALabel || 'Group A',
                    data: [data.groupA.present, data.groupA.absent, data.groupA.transferred, data.groupA.dropout, data.groupA.died],
                    backgroundColor: colors.blueAccent[500],
                },
                {
                    label: data.groupBLabel || 'Group B',
                    data: [data.groupB.present, data.groupB.absent, data.groupB.transferred, data.groupB.dropout, data.groupB.died],
                    backgroundColor: colors.greenAccent[500],
                }
            ],
        };
        return <Bar data={chartData} options={{ maintainAspectRatio: false }} />;
    }

    return null;
};
