import React from 'react';
import { Pie, Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title } from 'chart.js';
import { useTheme } from '@mui/material';
import { tokens } from '../../theme';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title);

// Shared palette used across all chart types for consistency
const CHART_COLORS = {
    present:     { bg: '#388e3c', light: 'rgba(56,142,60,0.82)' },
    absent:      { bg: '#d32f2f', light: 'rgba(211,47,47,0.78)' },
    transferred: { bg: '#f57c00', light: 'rgba(245,124,0,0.82)' },
    dropout:     { bg: '#6d4c41', light: 'rgba(109,76,65,0.82)' },
    died:        { bg: '#455a64', light: 'rgba(69,90,100,0.85)' },
};

const BOLD_FONT = { size: 13, weight: 'bold' };
const TICK_COLOR = '#000';
const LEGEND_COLOR = '#000';

export const AttendanceCharts = ({ type, data }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    if (type === 'pie') {
        // Calculate how many ineligible students are just chronically absent (not transferred/died/dropout)
        const pureIneligible = Math.max(0, (data.ineligible || 0) - ((data.transferred || 0) + (data.died || 0) + (data.dropout || 0)));
        
        // Build slices — filter out zero-value entries so they don't pollute the legend or chart
        const allSlices = [
            { label: 'Eligible (≥ 70%)',       value: data.eligible    || 0, color: CHART_COLORS.present.light   },
            { label: 'Ineligible (< 70%)',     value: pureIneligible,        color: CHART_COLORS.absent.light    },
            { label: 'Transferred / Relocated', value: data.transferred || 0, color: CHART_COLORS.transferred.bg  },
            { label: 'Died',                    value: data.died        || 0, color: CHART_COLORS.died.bg          },
            { label: 'Dropout',                 value: data.dropout     || 0, color: CHART_COLORS.dropout.bg       },
        ];
        // Always show Eligible even if 0; only show the others when they are > 0
        const visibleSlices = allSlices.filter((s, i) => i === 0 || s.value > 0);

        const chartData = {
            labels: visibleSlices.map(s => s.label),
            datasets: [{
                data: visibleSlices.map(s => s.value),
                backgroundColor: visibleSlices.map(s => s.color),
                // No border when only one slice — prevents the white gap line
                borderWidth: visibleSlices.length > 1 ? 2 : 0,
                borderColor: '#fff',
                hoverOffset: 10,
            }],
        };

        const pieOptions = {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: LEGEND_COLOR,
                        font: BOLD_FONT,
                        padding: 16,
                        usePointStyle: true,
                    }
                },
                tooltip: {
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    titleFont: BOLD_FONT,
                    bodyFont: BOLD_FONT,
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const value = context.raw;
                            const pct = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0%';
                            return ` ${label}: ${value.toLocaleString()} (${pct})`;
                        }
                    }
                },
                datalabels: {
                    color: '#ffffff',
                    font: BOLD_FONT,
                    textStrokeColor: 'rgba(0,0,0,0.6)',
                    textStrokeWidth: 3,
                    // Only show label when slice is large enough to be visible (>0)
                    formatter: (value, context) => {
                        if (!value || value === 0) return ''; // hide zero labels
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const pct = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '';
                        return `${value.toLocaleString()}\n${pct}`;
                    },
                    // Also hide label if the slice is too small (< 3%)
                    display: (context) => {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const value = context.dataset.data[context.dataIndex];
                        return total > 0 && (value / total) > 0.03;
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
        
        const totalA = data.groupA.present + data.groupA.absent + data.groupA.transferred + data.groupA.dropout + data.groupA.died;
        const totalB = data.groupB.present + data.groupB.absent + data.groupB.transferred + data.groupB.dropout + data.groupB.died;
        
        const getPct = (val, total) => total > 0 ? Number(((val / total) * 100).toFixed(1)) : 0;

        const chartData = {
            labels,
            datasets: [
                {
                    label: data.groupALabel || 'Group A',
                    data: [
                        getPct(data.groupA.present, totalA),
                        getPct(data.groupA.absent, totalA),
                        getPct(data.groupA.transferred, totalA),
                        getPct(data.groupA.dropout, totalA),
                        getPct(data.groupA.died, totalA)
                    ],
                    backgroundColor: colors.blueAccent[500],
                },
                {
                    label: data.groupBLabel || 'Group B',
                    data: [
                        getPct(data.groupB.present, totalB),
                        getPct(data.groupB.absent, totalB),
                        getPct(data.groupB.transferred, totalB),
                        getPct(data.groupB.dropout, totalB),
                        getPct(data.groupB.died, totalB)
                    ],
                    backgroundColor: colors.greenAccent[500],
                }
            ],
        };
        
        const options = {
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (v) => v + '%'
                    }
                }
            }
        };

        return <Bar data={chartData} options={options} />;
    }

    if (type === 'monthly-bar') {
        const labels = (data || []).map(d => d.label);
        const presentData = (data || []).map(d => d.present);
        const absentData = (data || []).map(d => d.absent);

        const chartData = {
            labels,
            datasets: [
                {
                    label: 'Present',
                    data: presentData,
                    backgroundColor: CHART_COLORS.present.light,
                    borderColor: CHART_COLORS.present.bg,
                    borderWidth: 2,
                    borderRadius: 5,
                    hoverBackgroundColor: CHART_COLORS.present.bg,
                },
                {
                    label: 'Absent',
                    data: absentData,
                    backgroundColor: CHART_COLORS.absent.light,
                    borderColor: CHART_COLORS.absent.bg,
                    borderWidth: 2,
                    borderRadius: 5,
                    hoverBackgroundColor: CHART_COLORS.absent.bg,
                },
            ],
        };

        const barOptions = {
            maintainAspectRatio: false,
            layout: {
                padding: {
                    top: 0   
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: LEGEND_COLOR,
                        font: BOLD_FONT,
                        padding: 14,
                        usePointStyle: true,
                    }
                },
                tooltip: {
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    titleFont: BOLD_FONT,
                    bodyFont: BOLD_FONT,
                    callbacks: {
                        label: function (context) {
                            return ` ${context.dataset.label}: ${context.raw.toLocaleString()}`;
                        }
                    }
                },
                datalabels: {
                    color: TICK_COLOR,
                    font: BOLD_FONT,
                    anchor: 'end',
                    align: 'top',
                    formatter: (value) => value.toLocaleString()
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: TICK_COLOR,
                        font: BOLD_FONT,
                        maxRotation: 45,
                        minRotation: 30,
                    },
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    suggestedMax: Math.max(...presentData, ...absentData) * 1.2,  // 20% headroom above tallest bar

                    ticks: {
                        color: TICK_COLOR,
                        font: BOLD_FONT,
                        callback: (v) => v.toLocaleString()
                    },
                    grid: { color: 'rgba(240,240,240,0.1)' }
                }
            }
        };

        return <Bar data={chartData} options={barOptions} />;
    }

    return null;
};
