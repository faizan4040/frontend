import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';

const defaultForm = {
  name: '', email: '', password: '', role: 'employee',
  phone: '', shiftStart: '09:00', shiftEnd: '18:00',
  graceTime: 15, department: '', employeeId: '',
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/users');
      setUsers(data);
    } catch (e) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => { setEditUser(null); setForm(defaultForm); setShowModal(true); };
  const openEdit = (user) => {
    setEditUser(user);
    setForm({ ...user, password: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editUser) {
        await API.put(`/users/${editUser._id}`, form);
        toast.success('User updated');
      } else {
        await API.post('/users', form);
        toast.success('User created');
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await API.delete(`/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.employeeId?.toLowerCase().includes(search.toLowerCase())
  );

  const roleBadge = { admin: 'bg-purple-100 text-purple-700', supervisor: 'bg-blue-100 text-blue-700', employee: 'bg-green-100 text-green-700' };

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xs">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search employees..."
              className="input-field pl-9" />
          </div>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <FiPlus size={16} /> Add User
          </button>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Employee ID', 'Name', 'Email', 'Role', 'Shift', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-10 text-gray-400">No users found</td></tr>
                ) : filtered.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{user.employeeId}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                    <td className="px-4 py-3 text-gray-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${roleBadge[user.role]}`}>{user.role}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.shiftStart} – {user.shiftEnd}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(user)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                          <FiEdit2 size={14} />
                        </button>
                        <button onClick={() => handleDelete(user._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-bold text-gray-900">{editUser ? 'Edit User' : 'Add New User'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Full Name *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="input-field" placeholder="John Doe" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Employee ID</label>
                  <input value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })}
                    className="input-field" placeholder="EMP001" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    className="input-field" required />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{editUser ? 'New Password' : 'Password *'}</label>
                  <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                    className="input-field" placeholder={editUser ? 'Leave blank to keep' : 'Min 6 chars'} required={!editUser} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="input-field">
                    <option value="employee">Employee</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Phone</label>
                  <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="input-field" placeholder="+91 9999999999" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Shift Start</label>
                  <input type="time" value={form.shiftStart} onChange={e => setForm({ ...form, shiftStart: e.target.value })}
                    className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Shift End</label>
                  <input type="time" value={form.shiftEnd} onChange={e => setForm({ ...form, shiftEnd: e.target.value })}
                    className="input-field" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Grace Time (min)</label>
                  <input type="number" value={form.graceTime} onChange={e => setForm({ ...form, graceTime: Number(e.target.value) })}
                    className="input-field" min={0} max={60} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                  <input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                    className="input-field" placeholder="Sales" />
                </div>
              </div>
              {editUser && (
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                  <label htmlFor="isActive" className="text-sm text-gray-700">Active Account</label>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : editUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default UsersPage;
