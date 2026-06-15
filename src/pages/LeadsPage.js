import React, { useState, useEffect, useRef } from 'react';
import Layout from '../components/layout/Layout';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiPlus, FiUpload, FiSearch, FiEye, FiUserCheck, FiFilter } from 'react-icons/fi';

const STATUS_COLORS = {
  new: 'bg-blue-100 text-blue-700',
  open: 'bg-indigo-100 text-indigo-700',
  interested: 'bg-green-100 text-green-700',
  not_interested: 'bg-red-100 text-red-700',
  callback: 'bg-yellow-100 text-yellow-700',
  switch_off: 'bg-gray-100 text-gray-600',
  wrong_number: 'bg-orange-100 text-orange-700',
  not_reachable: 'bg-purple-100 text-purple-700',
  converted: 'bg-emerald-100 text-emerald-700',
};

const LeadsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [assignModal, setAssignModal] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', product: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isAdmin = ['admin', 'supervisor'].includes(user?.role);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await API.get('/leads', { params });
      setLeads(data.leads);
      setTotal(data.total);
    } catch (e) {
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const { data } = await API.get('/users?role=employee');
      setEmployees(data);
    } catch (e) { }
  };

  useEffect(() => { fetchLeads(); }, [page, statusFilter]);
  useEffect(() => { if (isAdmin) fetchEmployees(); }, []);

  const handleAddLead = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.post('/leads', form);
      toast.success('Lead added');
      setShowAddModal(false);
      setForm({ name: '', phone: '', email: '', address: '', product: '' });
      fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add lead');
    } finally {
      setSaving(false);
    }
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const { data } = await API.post('/leads/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(data.message);
      fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      fileRef.current.value = '';
    }
  };

  const handleAssign = async (leadId, employeeId) => {
    try {
      await API.put(`/leads/${leadId}/assign`, { employeeId });
      toast.success('Lead assigned');
      setAssignModal(null);
      fetchLeads();
    } catch (err) {
      toast.error('Failed to assign');
    }
  };

  const filtered = leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.phone.includes(search)
  );

  return (
    <Layout>
      <div className="space-y-5">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or phone..."
              className="input-field pl-9" />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="input-field w-auto">
            <option value="">All Status</option>
            {Object.keys(STATUS_COLORS).map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          {isAdmin && (
            <>
              <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
                <FiPlus size={15} /> Add Lead
              </button>
              <input ref={fileRef} type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
              <button onClick={() => fileRef.current.click()} disabled={uploading}
                className="btn-secondary flex items-center gap-2">
                <FiUpload size={15} />
                {uploading ? 'Uploading...' : 'Upload CSV'}
              </button>
            </>
          )}
        </div>

        {/* CSV Format Hint */}
        {isAdmin && (
          <div className="text-xs text-gray-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
            CSV format: <code className="bg-blue-100 px-1 rounded">name, phone, email, address, product</code> (header row required)
          </div>
        )}

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Name', 'Phone', 'Product', 'Status', 'Assigned To', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-400">No leads found</td></tr>
                ) : filtered.map(lead => (
                  <tr key={lead._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{lead.name}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono">{lead.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{lead.product || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${STATUS_COLORS[lead.status] || 'bg-gray-100 text-gray-600'}`}>
                        {lead.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {lead.assignedTo?.name || <span className="text-orange-500 text-xs">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => navigate(`/leads/${lead._id}`)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="View">
                          <FiEye size={14} />
                        </button>
                        {isAdmin && (
                          <button onClick={() => setAssignModal(lead)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded" title="Assign">
                            <FiUserCheck size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm">
              <span className="text-gray-500">Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}</span>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary py-1 px-3 disabled:opacity-40">Prev</button>
                <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className="btn-secondary py-1 px-3 disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-gray-900">Add New Lead</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleAddLead} className="p-5 space-y-3">
              {[
                { key: 'name', label: 'Full Name *', placeholder: 'Customer Name', required: true },
                { key: 'phone', label: 'Phone *', placeholder: '9999999999', required: true },
                { key: 'email', label: 'Email', placeholder: 'email@example.com' },
                { key: 'product', label: 'Product', placeholder: 'Product interested in' },
                { key: 'address', label: 'Address', placeholder: 'City, State' },
              ].map(({ key, label, placeholder, required }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                  <input value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })}
                    className="input-field" placeholder={placeholder} required={required} />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Adding...' : 'Add Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5">
            <h2 className="font-bold text-gray-900 mb-1">Assign Lead</h2>
            <p className="text-sm text-gray-500 mb-4">{assignModal.name} — {assignModal.phone}</p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {employees.map(emp => (
                <button key={emp._id} onClick={() => handleAssign(assignModal._id, emp._id)}
                  className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 border border-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">
                    {emp.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-900">{emp.name}</p>
                    <p className="text-xs text-gray-500">{emp.employeeId}</p>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={() => setAssignModal(null)} className="btn-secondary w-full mt-4">Cancel</button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default LeadsPage;
