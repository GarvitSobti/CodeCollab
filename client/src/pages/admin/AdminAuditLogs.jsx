import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminApi } from '../../services/adminApi';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getAuditLogs().then((response) => {
      setLogs(response.data || []);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  return (
    <AdminLayout>
      <h2 style={{ fontSize: '1.35rem', marginBottom: 14 }}>Audit Logs</h2>
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.95fr 1.15fr 0.9fr', columnGap: 16, padding: '12px 14px', fontSize: '0.74rem', color: 'var(--text-soft)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <span>Timestamp</span>
          <span>Action</span>
          <span>Entity</span>
          <span>Admin</span>
        </div>
        {loading ? (
          <div style={{ padding: 16 }}>Loading...</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: 16, color: 'var(--text-soft)' }}>No audit activity recorded yet.</div>
        ) : logs.map((log) => (
          <div key={log.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.95fr 1.15fr 0.9fr', columnGap: 16, padding: '8px 12px', alignItems: 'start', borderBottom: '1px solid rgba(0,0,0,0.05)', rowGap: 1 }}>
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 600, lineHeight: 1.25 }}>{new Date(log.timestamp).toLocaleString()}</div>
              <div style={{ fontSize: '0.58rem', color: 'var(--text-faint)', lineHeight: 1.2 }}>{log.id}</div>
            </div>
            <div style={{ fontSize: '0.66rem', lineHeight: 1.25 }}>{log.action}</div>
            <div style={{ fontSize: '0.66rem', lineHeight: 1.25 }}>{log.entityType} · {log.entityId}</div>
            <div style={{ fontSize: '0.66rem', lineHeight: 1.25 }}>{log.adminId || '-'}</div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
