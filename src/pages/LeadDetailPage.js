import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiPhone, FiSave, FiClock } from 'react-icons/fi';

const STATUSES = [
  { value: 'interested', label: '✅ Interested', color: 'bg-green-100 border-green-300 text-green-700' },
  { value: 'not_interested', label: '❌ Not Interested', color: 'bg-red-100 border-red-300 text-red-700' },
  { value: 'callback', label: '📞 Call Back', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
  { value: 'switch_off', label: '📴 Switch Off', color: 'bg-gray-100 border-gray-300 text-gray-600' },
  { value: 'wrong_number', label: '🚫 Wrong Number', color: 'bg-orange-100 border-orange-300 text-orange-700' },
  { value: 'not_reachable', label: '📵 Not Reachable', color: 'bg-purple-100 border-purple-300 text-purple-700' },
  { value: 'open', label: '🔓 Open', color: 'bg-indigo-100 border-indigo-300 text-indigo-700' },
  { value: 'converted', label: '🎉 Converted', color: 'bg-emerald-100 border-emerald-300 text-emerald-700' },
];

const LeadDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [callbackDate, setCallbackDate] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchLead = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/leads/${id}`);
      setLead(data);
      setStatus(data.status);
      setRemarks(data.remarks || '');
    } catch (e) {
      toast.error('Lead not found');
      navigate('/leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLead(); }, [id]);

  const handleDisposition = async () => {
    if (!status) return toast.error('Please select a status');
    setSaving(true);
    try {
      const payload = { status, remarks };
      if (status === 'callback' && callbackDate) payload.callbackDate = callbackDate;
      await API.put(`/leads/${id}/disposition`, payload);
      toast.success('Lead updated successfully!');
      fetchLead();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Layout><div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" /></div></Layout>;
  if (!lead) return null;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Back */}
        <button onClick={() => navigate('/leads')} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
          <FiArrowLeft size={16} /> Back to Leads
        </button>

        {/* Lead Info Card */}
        <div className="card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{lead.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <FiPhone size={14} className="text-gray-400" />
                <span className="text-gray-600 font-mono">{lead.phone}</span>
              </div>
              {lead.email && <p className="text-sm text-gray-500 mt-0.5">{lead.email}</p>}
              {lead.address && <p className="text-sm text-gray-500 mt-0.5">📍 {lead.address}</p>}
              {lead.product && <p className="text-sm text-gray-500 mt-0.5">🏷 {lead.product}</p>}
            </div>
            <div className="text-right">
              <span className={`badge text-xs ${STATUSES.find(s => s.value === lead.status)?.color || 'bg-gray-100 text-gray-600'}`}>
                {lead.status?.replace(/_/g, ' ')}
              </span>
              {lead.assignedTo && (
                <p className="text-xs text-gray-500 mt-1">👤 {lead.assignedTo.name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Call Disposition */}
        <div className="card space-y-4">
          <h3 className="font-semibold text-gray-900">Update Call Status</h3>

          {/* Status Grid */}
          <div className="grid grid-cols-2 gap-2">
            {STATUSES.map(s => (
              <button
                key={s.value}
                onClick={() => setStatus(s.value)}
                className={`text-left px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${status === s.value ? s.color + ' border-opacity-100' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Callback Date */}
          {status === 'callback' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Callback Date & Time</label>
              <input type="datetime-local" value={callbackDate} onChange={e => setCallbackDate(e.target.value)}
                className="input-field" min={new Date().toISOString().slice(0, 16)} />
            </div>
          )}

          {/* Remarks */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Remarks</label>
            <textarea value={remarks} onChange={e => setRemarks(e.target.value)}
              rows={3} placeholder="Add notes about this call..."
              className="input-field resize-none" />
          </div>

          <button onClick={handleDisposition} disabled={saving || !status}
            className="btn-primary w-full flex items-center justify-center gap-2">
            <FiSave size={16} />
            {saving ? 'Saving...' : 'Save Disposition'}
          </button>
        </div>

        {/* Call History */}
        {lead.callHistory?.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Call History</h3>
            <div className="space-y-3">
              {[...lead.callHistory].reverse().map((call, i) => (
                <div key={i} className="flex gap-3 pb-3 border-b border-gray-50 last:border-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiPhone size={12} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`badge text-xs ${STATUSES.find(s => s.value === call.status)?.color || 'bg-gray-100 text-gray-600'}`}>
                        {call.status?.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <FiClock size={10} />
                        {new Date(call.calledAt).toLocaleString('en-IN')}
                      </span>
                    </div>
                    {call.remarks && <p className="text-sm text-gray-600 mt-1">{call.remarks}</p>}
                    {call.calledBy?.name && <p className="text-xs text-gray-400 mt-0.5">by {call.calledBy.name}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default LeadDetailPage;
