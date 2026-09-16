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
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-gradient-to-r from-brand-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-xl">
                <div>
                    <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                    <p className="text-brand-100 text-sm md:text-base mt-2 opacity-90 max-w-xl">
                        Comprehensive overview of placement statistics and trends.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Area Chart - Monthly Trend */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96 flex flex-col hover:shadow-md transition-shadow">
                    <h2 className="text-lg font-bold text-slate-800 mb-6">Placement Trends</h2>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b'}} />
                                <YAxis stroke="#64748b" tick={{fill: '#64748b'}} />
                                <RechartsTooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Area type="monotone" dataKey="placements" stroke="#4f46e5" strokeWidth={3} fill="#4f46e5" fillOpacity={0.1} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Grouped Bar Chart - Branch-wise */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96 flex flex-col hover:shadow-md transition-shadow">
                    <h2 className="text-lg font-bold text-slate-800 mb-6">Branch-wise Performance</h2>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={branchData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b'}} />
                                <YAxis stroke="#64748b" tick={{fill: '#64748b'}} />
                                <RechartsTooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{fill: '#f8fafc'}} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="students" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Total Students" />
                                <Bar dataKey="offers" fill="#10b981" radius={[4, 4, 0, 0]} name="Offers Made" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Horizontal Bar Chart - CTC Distribution */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96 flex flex-col hover:shadow-md transition-shadow">
                    <h2 className="text-lg font-bold text-slate-800 mb-6">CTC Distribution</h2>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ctcData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                <XAxis type="number" stroke="#64748b" tick={{fill: '#64748b'}} />
                                <YAxis dataKey="name" type="category" stroke="#64748b" tick={{fill: '#64748b'}} />
                                <RechartsTooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{fill: '#f8fafc'}} />
                                <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Number of Students" barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Donut & Progress Bars combined */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96 flex flex-col hover:shadow-md transition-shadow">
                    <h2 className="text-lg font-bold text-slate-800 mb-6">Top Companies & Sectors</h2>
                    <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider">Top Recruiters</h3>
                            <div className="space-y-4">
                                {topCompanies.map((tc, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-sm mb-1 text-slate-700">
                                            <span className="font-medium">{tc.name}</span>
                                            <span className="font-bold">{tc.offers} Offers</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2.5">
                                            <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${(tc.offers / tc.max) * 100}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={sectorData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {sectorData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap justify-center gap-3 mt-2">
                                {sectorData.map((entry, index) => (
                                    <div key={index} className="flex items-center text-xs text-slate-600">
                                        <div className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                        {entry.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
