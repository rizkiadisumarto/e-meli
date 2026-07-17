import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';
import * as XLSX from 'xlsx';

const ImportPage = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('transactions');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [preview, setPreview] = useState(null);
  const [rawData, setRawData] = useState(null);

  const tabs = [
    { key: 'transactions', label: 'Transaksi', endpoint: '/api/transactions/import' },
    { key: 'members', label: 'Anggota', endpoint: '/api/members/import' },
    { key: 'events', label: 'Kegiatan', endpoint: '/api/events/import' },
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setResult(null);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          setResult({ success: false, message: 'File kosong atau format tidak sesuai' });
          return;
        }

        setRawData(data);
        setPreview(data.slice(0, 5));
      } catch (err) {
        setResult({ success: false, message: 'Gagal membaca file: ' + err.message });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (!rawData) return;
    setImporting(true);
    setResult(null);

    try {
      const tab = tabs.find(t => t.key === activeTab);
      const token = localStorage.getItem('token');
      const bodyKeyMap = { transactions: 'transactions', members: 'members', events: 'events' };
      const bodyKey = bodyKeyMap[activeTab];

      const res = await fetch(tab.endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ [bodyKey]: rawData })
      });

      const data = await res.json();
      if (res.ok) {
        setResult({ success: true, message: data.message, imported: data.imported, skipped: data.skipped });
        setRawData(null);
        setPreview(null);
      } else {
        setResult({ success: false, message: data.error || 'Gagal import' });
      }
    } catch (err) {
      setResult({ success: false, message: 'Error: ' + err.message });
    } finally {
      setImporting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="page-container">
        <div className="glass-card text-center py-12">
          <AlertTriangle size={48} className="mx-auto mb-4 text-danger" />
          <h3 className="text-lg font-bold mb-2">Akses Ditolak</h3>
          <p className="text-muted">Hanya admin yang bisa mengimpor data.</p>
        </div>
      </div>
    );
  }

  const columnHints = {
    transactions: ['Tipe', 'Kategori', 'Nominal', 'Tanggal', 'Keterangan', 'Dari / Kepada'],
    members: ['Nama', 'Alamat', 'Telepon', 'Status'],
    events: ['Nama', 'Tanggal Mulai', 'Deskripsi', 'Lokasi', 'Status', 'Target Per Orang', 'Catatan'],
  };

  return (
    <div className="page-container">
      <div className="page-header mb-6">
        <h2>Import Data</h2>
        <p className="text-muted text-sm mt-1">Import data dari file Excel (.xlsx) yang di-export dari Render.com</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`btn ${activeTab === tab.key ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => { setActiveTab(tab.key); setPreview(null); setRawData(null); setResult(null); }}
          >
            <FileSpreadsheet size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Instructions */}
      <div className="glass-card mb-6">
        <h4 className="font-bold mb-2">Cara Import:</h4>
        <ol className="text-sm text-muted list-decimal ml-4 space-y-1">
          <li>Login ke <strong>e-meli.onrender.com</strong> sebagai admin</li>
          <li>Buka halaman <strong>{tabs.find(t => t.key === activeTab)?.label}</strong></li>
          <li>Klik tombol <strong>"Export Excel"</strong></li>
          <li>Upload file Excel yang didownload ke form di bawah ini</li>
          <li>Klik <strong>"Import Data"</strong></li>
        </ol>
        <div className="mt-3 p-2 rounded" style={{ background: 'var(--bg-secondary)', fontSize: '0.8rem' }}>
          <strong>Kolom yang perlu ada di file Excel:</strong>
          <span className="ml-2 text-muted">{columnHints[activeTab].join(', ')}</span>
        </div>
      </div>

      {/* Upload Form */}
      <div className="glass-card mb-6">
        <div className="form-group mb-0">
          <label className="form-label">Pilih File Excel (.xlsx)</label>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="form-input"
            style={{ padding: '0.75rem' }}
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {/* Preview */}
      {preview && (
        <div className="glass-card mb-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold">Preview Data ({rawData.length} baris)</h4>
            <button className="btn btn-sm btn-outline" onClick={() => { setPreview(null); setRawData(null); }}>
              <X size={14} /> Batal
            </button>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  {Object.keys(preview[0]).map(key => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((val, j) => (
                      <td key={j}>{String(val)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rawData.length > 5 && (
            <p className="text-xs text-muted mt-2">... dan {rawData.length - 5} baris lainnya</p>
          )}
          <div className="mt-4 flex justify-end">
            <button className="btn btn-primary shadow-glow" onClick={handleImport} disabled={importing}>
              <Upload size={18} /> {importing ? 'Mengimport...' : `Import ${rawData.length} Data`}
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="glass-card" style={{ borderLeft: `4px solid ${result.success ? 'var(--success)' : 'var(--danger)'}` }}>
          <div className="flex items-start gap-3">
            {result.success ? (
              <CheckCircle size={24} className="text-success mt-0.5" />
            ) : (
              <XCircle size={24} className="text-danger mt-0.5" />
            )}
            <div>
              <h4 className="font-bold">{result.success ? 'Import Berhasil' : 'Import Gagal'}</h4>
              <p className="text-sm text-muted mt-1">{result.message}</p>
              {result.imported !== undefined && (
                <p className="text-sm mt-1">
                  <span className="text-success font-bold">{result.imported}</span> berhasil,
                  <span className="text-warning font-bold ml-1">{result.skipped}</span> dilewati (duplikat/tidak valid)
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportPage;
