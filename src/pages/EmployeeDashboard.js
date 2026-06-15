import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiClock, FiPhoneCall, FiCheckCircle, FiAlertTriangle, FiLogIn, FiLogOut } from 'react-icons/fi';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [punchLoading, setPunchLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/dashboard/employee');
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const handlePunchIn = async () => {
    setPunchLoading(true);
    try {
      await API.post('/attendance/punch-in');
      toast.success('Punched in successfully!');
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to punch in');
    } finally {
      setPunchLoading(false);
    }
  };

  const handlePunchOut = async () => {
    setPunchLoading(true);
    try {
      await API.post('/attendance/punch-out');
      toast.success('Punched out successfully!');
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to punch out');
    } finally {
      setPunchLoading(false);
    }
  };

  const attendance = stats?.todayAttendance;
  const hasPunchedIn = !!attendance?.punchIn;
  const hasPunchedOut = !!attendance?.punchOut;

  const formatTime = (date) => date ? new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—';
  const formatDuration = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
          <p className="text-gray-500 text-sm mt-1">Here's your day at a glance</p>
        </div>

        {/* Punch Card */}
        <div className="card bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-0">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-blue-100 text-sm mb-1">Shift Timing</p>
              <p className="text-2xl font-bold">{stats?.shiftStart} — {stats?.shiftEnd}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-blue-100">
                <span>In: {formatTime(attendance?.punchIn)}</span>
                <span>Out: {formatTime(attendance?.punchOut)}</span>
                {attendance?.workingHours > 0 && (
                  <span>Worked: {formatDuration(attendance.workingHours)}</span>
                )}
              </div>
              {attendance?.isLate && (
                <span className="inline-flex items-center gap-1 mt-2 text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full">
                  <FiAlertTriangle size={10} /> Late by {attendance.lateBy} min
                </span>
              )}
            </div>

            <div className="flex gap-3">
              {!hasPunchedIn && (
                <button onClick={handlePunchIn} disabled={punchLoading}
                  className="flex items-center gap-2 bg-white text-blue-700 font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50">
                  <FiLogIn size={16} />
                  Punch In
                </button>
              )}
              {hasPunchedIn && !hasPunchedOut && (
                <button onClick={handlePunchOut} disabled={punchLoading}
                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50">
                  <FiLogOut size={16} />
                  Punch Out
                </button>
              )}
              {hasPunchedIn && hasPunchedOut && (
                <div className="flex items-center gap-2 bg-green-400 text-green-900 font-semibold px-5 py-2.5 rounded-lg">
                  <FiCheckCircle size={16} />
                  Day Complete
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FiPhoneCall className="text-purple-600 text-xl" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Assigned Leads</p>
              <p className="text-2xl font-bold">{loading ? '...' : stats?.assignedLeads ?? 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FiCheckCircle className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Updated Leads</p>
              <p className="text-2xl font-bold">{loading ? '...' : stats?.updatedLeads ?? 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <FiClock className="text-orange-600 text-xl" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Pending Leads</p>
              <p className="text-2xl font-bold">{loading ? '...' : stats?.pendingLeads ?? 0}</p>
            </div>
          </div>
        </div>

        {/* Today's Status */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Today's Attendance</h3>
          <div className="space-y-3">
            {[
              { label: 'Status', value: attendance?.status || 'Not Marked', badge: attendance?.status },
              { label: 'Punch In', value: formatTime(attendance?.punchIn) },
              { label: 'Punch Out', value: formatTime(attendance?.punchOut) },
              { label: 'Working Hours', value: attendance?.workingHours ? formatDuration(attendance.workingHours) : '—' },
            ].map(({ label, value, badge }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-500">{label}</span>
                {badge ? (
                  <span className={`badge ${badge === 'present' ? 'bg-green-100 text-green-700' : badge === 'late' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                    {badge}
                  </span>
                ) : (
                  <span className="font-semibold text-gray-900 text-sm">{value}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;
