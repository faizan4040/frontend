import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import API from '../utils/api';
import { FiUsers, FiCheckCircle, FiPhoneCall, FiRefreshCw, FiUserX, FiAlertCircle } from 'react-icons/fi';

const StatCard = ({ title, value, icon: Icon, color, sub }) => (
  <div className="stat-card">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="text-white text-xl" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/dashboard/admin');
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const statusColors = {
    interested: 'bg-green-100 text-green-700',
    not_interested: 'bg-red-100 text-red-700',
    callback: 'bg-yellow-100 text-yellow-700',
    switch_off: 'bg-gray-100 text-gray-600',
    wrong_number: 'bg-orange-100 text-orange-700',
    not_reachable: 'bg-purple-100 text-purple-700',
    new: 'bg-blue-100 text-blue-700',
    open: 'bg-indigo-100 text-indigo-700',
    converted: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Admin Dashboard</h2>
            <p className="text-gray-500 text-sm">Real-time overview of your CRM</p>
          </div>
          <button onClick={fetchStats} className="btn-secondary flex items-center gap-2 text-sm">
            <FiRefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="stat-card animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-24" />
                  <div className="h-6 bg-gray-200 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard title="Total Employees" value={stats?.totalEmployees} icon={FiUsers} color="bg-blue-500" />
              <StatCard title="Present Today" value={stats?.presentToday} icon={FiCheckCircle} color="bg-green-500" sub="Active today" />
              <StatCard title="Absent Today" value={stats?.absentToday} icon={FiUserX} color="bg-red-500" />
              <StatCard title="Total Leads" value={stats?.totalLeads} icon={FiPhoneCall} color="bg-purple-500" />
              <StatCard title="Updated Leads" value={stats?.updatedLeads} icon={FiRefreshCw} color="bg-indigo-500" sub="All time" />
              <StatCard title="Today Updated" value={stats?.todayUpdatedLeads} icon={FiAlertCircle} color="bg-orange-500" sub="Today" />
            </div>

            {/* Status Breakdown */}
            {stats?.statusBreakdown?.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-4">Lead Status Breakdown</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {stats.statusBreakdown.map(({ _id, count }) => (
                    <div key={_id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                      <span className={`badge ${statusColors[_id] || 'bg-gray-100 text-gray-600'}`}>
                        {_id?.replace(/_/g, ' ')}
                      </span>
                      <span className="font-bold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Overview</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-600">Unassigned Leads</span>
                  <span className="font-semibold text-orange-600">{stats?.unassignedLeads}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-50">
                  <span className="text-sm text-gray-600">Attendance Rate Today</span>
                  <span className="font-semibold text-green-600">
                    {stats?.totalEmployees ? Math.round((stats.presentToday / stats.totalEmployees) * 100) : 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Lead Update Rate</span>
                  <span className="font-semibold text-blue-600">
                    {stats?.totalLeads ? Math.round((stats.updatedLeads / stats.totalLeads) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;
