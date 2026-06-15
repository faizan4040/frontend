import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiLogIn, FiLogOut, FiCheckCircle, FiUsers } from 'react-icons/fi';

const AttendancePage = () => {
  const { user } = useAuth();
  const [todayAtt, setTodayAtt] = useState(null);
  const [allAtt, setAllAtt] = useState([]);
  const [loading, setLoading] = useState(true);
  const [punchLoading, setPunchLoading] = useState(false);
  const isAdmin = ['admin', 'supervisor'].includes(user?.role);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [todayRes] = await Promise.all([API.get('/attendance/today')]);
      setTodayAtt(todayRes.data);

      if (isAdmin) {
        const allRes = await API.get('/attendance/all-today');
        setAllAtt(allRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const punchIn = async () => {
    setPunchLoading(true);
    try {
      await API.post('/attendance/punch-in');
      toast.success('Punched in! Have a productive day 🚀');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Punch in failed');
    } finally {
      setPunchLoading(false);
    }
  };

  const punchOut = async () => {
    setPunchLoading(true);
    try {
      await API.post('/attendance/punch-out');
      toast.success('Punched out! Great work today 👏');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Punch out failed');
    } finally {
      setPunchLoading(false);
    }
  };

  const fmt = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—';
  const fmtHours = (m) => m ? `${Math.floor(m / 60)}h ${m % 60}m` : '—';

  const statusBadge = (s) => {
    const map = { present: 'bg-green-100 text-green-700', late: 'bg-yellow-100 text-yellow-700', absent: 'bg-red-100 text-red-700', 'half-day': 'bg-orange-100 text-orange-700' };
    return <span className={`badge ${map[s] || 'bg-gray-100 text-gray-600'}`}>{s}</span>;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* My Attendance Card */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">My Attendance — Today</h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            {[
              { label: 'Status', value: todayAtt?.status ? statusBadge(todayAtt.status) : <span className="text-gray-400 text-sm">Not marked</span> },
              { label: 'Punch In', value: <span className="font-semibold">{fmt(todayAtt?.punchIn)}</span> },
              { label: 'Punch Out', value: <span className="font-semibold">{fmt(todayAtt?.punchOut)}</span> },
              { label: 'Working Hours', value: <span className="font-semibold">{fmtHours(todayAtt?.workingHours)}</span> },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                {value}
              </div>
            ))}
          </div>

          {todayAtt?.isLate && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2.5 mb-4 text-sm text-yellow-800">
              ⚠️ You were late by <strong>{todayAtt.lateBy} minutes</strong> today.
            </div>
          )}

          <div className="flex gap-3">
            {!todayAtt?.punchIn && (
              <button onClick={punchIn} disabled={punchLoading}
                className="btn-success flex items-center gap-2">
                <FiLogIn size={16} />
                {punchLoading ? 'Processing...' : 'Punch In'}
              </button>
            )}
            {todayAtt?.punchIn && !todayAtt?.punchOut && (
              <button onClick={punchOut} disabled={punchLoading}
                className="btn-danger flex items-center gap-2">
                <FiLogOut size={16} />
                {punchLoading ? 'Processing...' : 'Punch Out'}
              </button>
            )}
            {todayAtt?.punchIn && todayAtt?.punchOut && (
              <div className="flex items-center gap-2 text-green-600 font-medium">
                <FiCheckCircle size={18} />
                Attendance complete for today!
              </div>
            )}
          </div>
        </div>

        {/* All Employees Attendance (admin) */}
        {isAdmin && (
          <div className="card p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <FiUsers size={16} className="text-gray-500" />
              <h3 className="font-semibold text-gray-900">All Employees — Today ({allAtt.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Employee', 'Employee ID', 'Status', 'Punch In', 'Punch Out', 'Hours', 'Late'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading...</td></tr>
                  ) : allAtt.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-400">No attendance recorded yet</td></tr>
                  ) : allAtt.map(a => (
                    <tr key={a._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{a.employee?.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{a.employee?.employeeId}</td>
                      <td className="px-4 py-3">{statusBadge(a.status)}</td>
                      <td className="px-4 py-3 text-gray-600">{fmt(a.punchIn)}</td>
                      <td className="px-4 py-3 text-gray-600">{fmt(a.punchOut)}</td>
                      <td className="px-4 py-3 text-gray-600">{fmtHours(a.workingHours)}</td>
                      <td className="px-4 py-3">
                        {a.isLate ? <span className="text-yellow-600 font-medium">{a.lateBy}m</span> : <span className="text-green-600">On time</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AttendancePage;
