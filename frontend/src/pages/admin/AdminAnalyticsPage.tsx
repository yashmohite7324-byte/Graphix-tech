import React from 'react';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    BarChart, Bar, Legend,
    PieChart, Pie, Cell
} from 'recharts';

export default function AdminAnalyticsPage() {
    const monthlyData = [
        { name: 'Jan', placements: 4 },
        { name: 'Feb', placements: 7 },
        { name: 'Mar', placements: 15 },
        { name: 'Apr', placements: 22 },
        { name: 'May', placements: 30 },
        { name: 'Jun', placements: 45 },
    ];

    const branchData = [
        { name: 'CSE', offers: 65, students: 120 },
        { name: 'IT', offers: 50, students: 90 },
        { name: 'ECE', offers: 35, students: 100 },
        { name: 'MECH', offers: 15, students: 80 },
    ];

    const ctcData = [
        { name: '< 5 LPA', count: 20 },
        { name: '5-10 LPA', count: 55 },
        { name: '10-20 LPA', count: 30 },
        { name: '> 20 LPA', count: 10 },
    ];

    const sectorData = [
        { name: 'Software', value: 400 },
        { name: 'Finance', value: 300 },
        { name: 'Consulting', value: 300 },
        { name: 'Core', value: 200 },
    ];
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

    const topCompanies = [
        { name: 'TechNova', offers: 25, max: 30 },
        { name: 'GlobalFin', offers: 18, max: 30 },
        { name: 'DataSys', offers: 12, max: 30 },
    ];

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-slate-200">Analytics Dashboard</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Area Chart - Monthly Trend */}
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 h-80 flex flex-col">
                    <h2 className="text-lg font-medium text-slate-300 mb-4">Placement Trends</h2>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                                <Area type="monotone" dataKey="placements" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Grouped Bar Chart - Branch-wise */}
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 h-80 flex flex-col">
                    <h2 className="text-lg font-medium text-slate-300 mb-4">Branch-wise Offers</h2>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={branchData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="name" stroke="#94a3b8" />
                                <YAxis stroke="#94a3b8" />
                                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                                <Legend wrapperStyle={{ color: '#94a3b8' }} />
                                <Bar dataKey="students" fill="#475569" name="Total Students" />
                                <Bar dataKey="offers" fill="#10b981" name="Offers Made" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Horizontal Bar Chart - CTC Distribution */}
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 h-80 flex flex-col">
                    <h2 className="text-lg font-medium text-slate-300 mb-4">CTC Distribution</h2>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ctcData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis type="number" stroke="#94a3b8" />
                                <YAxis dataKey="name" type="category" stroke="#94a3b8" />
                                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                                <Bar dataKey="count" fill="#8b5cf6" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Donut Chart - Sector */}
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 h-80 flex flex-col">
                    <h2 className="text-lg font-medium text-slate-300 mb-4">Placements by Sector</h2>
                    <div className="flex-1 min-h-0 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={sectorData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {sectorData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top Companies Progress Bars */}
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <h2 className="text-lg font-medium text-slate-300 mb-4">Top Recruiters</h2>
                <div className="space-y-4">
                    {topCompanies.map(c => (
                        <div key={c.name} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-slate-200">{c.name}</span>
                                <span className="text-slate-400">{c.offers} Offers</span>
                            </div>
                            <div className="w-full bg-slate-900 rounded-full h-2.5 border border-slate-700">
                                <div 
                                    className="bg-brand-500 h-2.5 rounded-full" 
                                    style={{ width: `${(c.offers / c.max) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
