import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Upload, FileSpreadsheet, Users, Wallet, Calendar, UserCheck,
  CheckCircle, XCircle, AlertCircle, Download, FileText
} from 'lucide-react';
import { parseExcelFile, importTransactions, importMembers, importEvents, importUsers } from '../utils/exportExcel';
import './ImportBackupPage.css';

const TABS = [
  { id: 'transactions', name: 'Transaksi', icon: <Wallet size={18} />, color: 'primary' },
  { id: 'members', name: 'Anggota', icon: <Users size={18} />, color: 'secondary' },
  { id: 'events', name: 'Kegiatan', icon: <Calendar size={18} />, color: 'warning' },
  { id: 'users', name: 'Pengguna', icon: <UserCheck size={18} />, color: 'danger' },
];

const TEMPLATE_HEADERS = {
  transactions: ['Tanggal', 'Tipe', 'Kategori ID', 'Nominal', 'Keterangan', 'Anggota ID'],
  members: ['Nama', 'Alamat', 'No. HP', 'Status'],
  events: ['Nama Event', 'Tanggal Mulai', 'Tanggal Selesai', 'Lokasi', 'Alamat', 'Status', 'Target Iuran', 'Deskripsi', 'Catatan'],
  users: ['Username', 'Password', 'Nama Lengkap', 'Role', 'No. HP'],
};

const TEMPLATE_SAMPLE = {
  transactions: [
    { 'Tanggal': '2025-08-16', 'Tipe': 'Pemasukan', 'Kategori ID': 3, 'Nominal': 500000, 'Keterangan': 'Uang Kas', 'Anggota ID': '' },
    { 'Tanggal': '2025-08-16', 'Tipe': 'Pengeluaran', 'Kategori ID': 8, 'Nominal': 84000, 'Keterangan': 'Banner', 'Anggota ID': '' },
  ],
  members: [
    { 'Nama': 'Keluarga Bapak Contoh', 'Alamat': 'D1/1', 'No. HP': '08123456789', 'Status': 'Aktif' },
  ],
  events: [
    { 'Nama Event': '17 Agustusan', 'Tanggal Mulai': '2025-08-16', 'Tanggal Selesai': '2025-08-16', 'Lokasi': 'Gang Melimewah', 'Alamat': '', 'Status': 'draft', 'Target Iuran': 50000, 'Deskripsi': '', 'Catatan': '' },
  ],
  users: [
    { 'Username': 'sekretaris', 'Password': 'password123', 'Nama Lengkap': 'Pak Sekretaris', 'Role': 'committee', 'No. HP': '' },
  ],
};

const ImportBackupPage = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('transactions');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);

  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setFile(selected);
    setResult(null);

    try {
      const data = await parseExcelFile(selected);
      setPreview(data.slice(0, 10)); // Preview max 10 rows
    } catch (err) {
      setResult({ success: 0, failed: 1, errors: ['Gagal membaca file: ' + err.message] });
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setResult(null);

    try {
      let importResult;
      switch (activeTab) {
        case 'transactions':
          importResult = await importTransactions(file, token());
          break;
        case 'members':
          importResult = await importMembers(file, token());
          break;
        case 'events':
          importResult = await importEvents(file, token());
          break;
        case 'users':
          importResult = await importUsers(file, token());
          break;
        default:
          return;
      }
      setResult(importResult);
      if (importResult.success > 0) {
        setFile(null);
        setPreview([]);
        if (fileRef.current) fileRef.current.value = '';
      }
    } catch (err) {
      setResult({ success: 0, failed: 1, errors: [err.message] });
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    import('xlsx').then(XLSX => {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(TEMPLATE_SAMPLE[activeTab]);
      ws['!cols'] = TEMPLATE_HEADERS[activeTab].map(h => ({ wch: Math.max(h.length, 15) + 2 }));
      XLSX.utils.book_append_sheet(wb, ws, 'Template');
      XLSX.writeFile(wb, `template-${activeTab}.xlsx`);
    });
  };

  const resetFile = () => {
    setFile(null);
    setPreview([]);
    setResult(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="import-backup-page">
      <div className="page-header mb-6">
        <div>
          <h2>Import / Backup Data</h2>
          <p className="text-muted text-sm mt-1">Import data dari file Excel ke dalam sistem</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab.id); resetFile(); }}
          >
            {tab.icon}
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* UPLOAD AREA */}
        <div className="glass-card">
          <h3 className="text-sm font-semibold text-muted flex items-center gap-2 mb-4 uppercase">
            <Upload size={16} className="text-primary" /> Upload File Excel
          </h3>

          <div className="flex gap-2 mb-4">
            <button className="btn btn-outline btn-sm" onClick={downloadTemplate}>
              <Download size={14} /> Download Template
            </button>
          </div>

          <div
            className="upload-zone"
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('dragover'); }}
            onDragLeave={e => e.currentTarget.classList.remove('dragover')}
            onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('dragover'); handleFileChange({ target: { files: e.dataTransfer.files } }); }}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {file ? (
              <div className="flex items-center gap-3">
                <FileSpreadsheet size={32} className="text-primary" />
                <div>
                  <div className="font-medium">{file.name}</div>
                  <div className="text-xs text-muted">{preview.length} baris terdeteksi</div>
                </div>
                <button className="btn btn-ghost btn-sm text-danger" onClick={resetFile}>
                  <XCircle size={16} />
                </button>
              </div>
            ) : (
              <>
                <FileSpreadsheet size={40} className="text-muted mb-2" />
                <p className="text-muted text-sm">Klik atau drag & drop file Excel di sini</p>
                <p className="text-xs text-muted mt-1">Format: .xlsx, .xls, atau .csv</p>
              </>
            )}
          </div>

          {file && (
            <button
              className="btn btn-primary w-full mt-4"
              onClick={handleImport}
              disabled={importing}
            >
              {importing ? 'Mengimport...' : `Import ${preview.length > 0 ? `${preview.length}+ ` : ''}Data`}
            </button>
          )}
        </div>

        {/* PREVIEW / RESULT */}
        <div className="glass-card">
          <h3 className="text-sm font-semibold text-muted flex items-center gap-2 mb-4 uppercase">
            <FileText size={16} className="text-secondary" />
            {result ? 'Hasil Import' : 'Preview Data'}
          </h3>

          {result ? (
            <div className="import-result">
              <div className="result-summary">
                <div className={`result-box ${result.success > 0 ? 'success' : ''}`}>
                  <CheckCircle size={24} />
                  <div className="text-2xl font-bold">{result.success}</div>
                  <div className="text-xs text-muted">Berhasil</div>
                </div>
                <div className={`result-box ${result.failed > 0 ? 'danger' : ''}`}>
                  <XCircle size={24} />
                  <div className="text-2xl font-bold">{result.failed}</div>
                  <div className="text-xs text-muted">Gagal</div>
                </div>
              </div>
              {result.errors.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-danger mb-2">Error Details:</div>
                  <div className="error-list">
                    {result.errors.slice(0, 5).map((err, i) => (
                      <div key={i} className="error-item">
                        <AlertCircle size={14} /> {err}
                      </div>
                    ))}
                    {result.errors.length > 5 && <div className="text-xs text-muted">+{result.errors.length - 5} errors lainnya</div>}
                  </div>
                </div>
              )}
            </div>
          ) : preview.length > 0 ? (
            <div className="preview-table-container">
              <table className="table text-sm">
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
                        <td key={j}>{val !== null && val !== undefined ? String(val) : '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length === 10 && (
                <div className="text-xs text-muted text-center mt-2">*Menampilkan 10 baris pertama</div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted">
              <FileSpreadsheet size={48} className="mb-3 opacity-30" />
              <p className="text-sm">Upload file Excel untuk melihat preview</p>
            </div>
          )}
        </div>
      </div>

      {/* INFO */}
      <div className="glass-card mt-6">
        <h3 className="text-sm font-semibold text-muted flex items-center gap-2 mb-3 uppercase">
          <AlertCircle size={16} className="text-warning" /> Panduan Import
        </h3>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <div className="font-medium mb-1">Transaksi</div>
            <div className="text-muted text-xs">Kolom: Tanggal, Tipe (Pemasukan/Pengeluaran), Kategori ID, Nominal, Keterangan, Anggota ID</div>
          </div>
          <div>
            <div className="font-medium mb-1">Anggota</div>
            <div className="text-muted text-xs">Kolom: Nama, Alamat, No. HP, Status (Aktif/Non-Aktif)</div>
          </div>
          <div>
            <div className="font-medium mb-1">Kegiatan</div>
            <div className="text-muted text-xs">Kolom: Nama Event, Tanggal Mulai, Tanggal Selesai, Lokasi, Status, Target Iuran</div>
          </div>
          <div>
            <div className="font-medium mb-1">Pengguna</div>
            <div className="text-muted text-xs">Kolom: Username, Password, Nama Lengkap, Role (admin/committee/viewer), No. HP</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportBackupPage;
