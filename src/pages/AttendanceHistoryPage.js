import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FiCalendar } from 'react-icons/fi';

const AttendanceHistoryPage = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const isAdmin = ['admin', 'supervisor'].includes(user?.role);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/attendance/history', { params: { month, year } });
      setHistory(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchHistory(); }, [month, year]);

  const fmt = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : '—';
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  const statusBadge = (s) => {
    const map = { present: 'bg-green-100 text-green-700', late: 'bg-yellow-100 text-yellow-700', absent: 'bg-red-100 text-red-700', 'half-day': 'bg-orange-100 text-orange-700' };
    return <span className={`badge ${map[s] || 'bg-gray-100 text-gray-600'}`}>{s}</span>;
  };

  const summary = {
    present: history.filter(h => h.status === 'present').length,
    late: history.filter(h => h.status === 'late').length,
    halfDay: history.filter(h => h.status === 'half-day').length,
    absent: history.filter(h => h.status === 'absent').length,
  };

  return (
    <Layout>
      <div className="space-y-5">
        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <FiCalendar className="text-gray-400" size={18} />
          <select value={month} onChange={e => setMonth(Number(e.target.value))} className="input-field w-auto">
            {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
          <select value={year} onChange={e => setYear(Number(e.target.value))} className="input-field w-auto">
            {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Present', value: summary.present, color: 'bg-green-50 text-green-700 border-green-200' },
            { label: 'Late', value: summary.late, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
            { label: 'Half Day', value: summary.halfDay, color: 'bg-orange-50 text-orange-700 border-orange-200' },
            { label: 'Absent', value: summary.absent, color: 'bg-red-50 text-red-700 border-red-200' },
          ].map(({ label, value, color }) => (
            <div key={label} className={`border rounded-xl p-4 ${color}`}>
              <p className="text-xs font-medium opacity-70">{label}</p>
              <p className="text-2xl font-bold mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {isAdmin ? ['Date', 'Employee', 'Status', 'In', 'Out', 'Hours', 'Late By'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  )) : ['Date', 'Status', 'Punch In', 'Punch Out', 'Hours', 'Late By'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading...</td></tr>
                ) : history.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-gray-400">No records for this period</td></tr>
                ) : history.map(h => (
                  <tr key={h._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-700">{fmtDate(h.date)}</td>
                    {isAdmin && <td className="px-4 py-3 text-gray-600">{h.employee?.name}</td>}
                    <td className="px-4 py-3">{statusBadge(h.status)}</td>
                    <td className="px-4 py-3 text-gray-600">{fmt(h.punchIn)}</td>
                    <td className="px-4 py-3 text-gray-600">{fmt(h.punchOut)}</td>
                    <td className="px-4 py-3 text-gray-600">{h.workingHours ? `${Math.floor(h.workingHours/60)}h ${h.workingHours%60}m` : '—'}</td>
                    <td className="px-4 py-3">
                      {h.isLate ? <span className="text-yellow-600">{h.lateBy}m late</span> : <span className="text-green-500 text-xs">On time</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AttendanceHistoryPage;
