import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatNumberInput, parseNumberInput } from '../utils/format';
import { 
  ArrowLeft, MapPin, Calendar as CalendarIcon, Users, ArrowDownToLine, 
  ArrowUpFromLine, Wallet, TrendingUp, BarChart3, Clock, CheckSquare, 
  ListOrdered, Receipt, FileText, Plus, Edit2, Trash2, X, Save, Printer, FileSpreadsheet
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import MapPicker from '../components/UI/MapPicker';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { exportEventData } from '../utils/exportExcel';
import './EventDetailPage.css';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

ChartJS.register(ArcElement, Tooltip, Legend);

const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdminOrCommittee } = useAuth();
  
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [rundown, setRundown] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [budget, setBudget] = useState({ items: [], totals: {} });
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [categories, setCategories] = useState([]);

  // Modal states
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventForm, setEventForm] = useState({});
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [editParticipant, setEditParticipant] = useState(null);
  const [participantForm, setParticipantForm] = useState({ attendance: 'absent', amount_paid: 0, status: 'unpaid' });
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showRundownModal, setShowRundownModal] = useState(false);
  const [editRundown, setEditRundown] = useState(null);
  const [rundownForm, setRundownForm] = useState({ time: '', activity: '', pic: '', notes: '', status: 'pending' });
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ task: '', pic: '', status: 'pending' });
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editBudget, setEditBudget] = useState(null);
  const [budgetForm, setBudgetForm] = useState({ item: '', qty: 1, unit_price: 0, actual_amount: 0 });
  const [showTxModal, setShowTxModal] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [txForm, setTxForm] = useState({ type: 'expense', category_id: '', amount: '', description: '', date: new Date().toISOString().split('T')[0], member_id: '' });
  const [txProofFile, setTxProofFile] = useState(null);
  const [showProofModal, setShowProofModal] = useState(null);

  useEffect(() => {
    fetchEventData();
  }, [id]);

  const token = () => localStorage.getItem('token');
  const authHeaders = () => ({ 'Authorization': `Bearer ${token()}`, 'Content-Type': 'application/json' });

  const fetchEventData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${token()}` };
      const [evtRes, partRes, runRes, taskRes, budRes, txRes, sumRes, memRes, catRes] = await Promise.all([
        fetch(`/api/events/${id}`, { headers }),
        fetch(`/api/events/${id}/participants`, { headers }),
        fetch(`/api/events/${id}/rundown`, { headers }),
        fetch(`/api/events/${id}/tasks`, { headers }),
        fetch(`/api/events/${id}/budget`, { headers }),
        fetch(`/api/events/${id}/transactions`, { headers }),
        fetch(`/api/events/${id}/summary`, { headers }),
        fetch('/api/members', { headers }),
        fetch('/api/settings/categories', { headers })
      ]);

      if (evtRes.ok) setEvent(await evtRes.json());
      if (partRes.ok) setParticipants(await partRes.json());
      if (runRes.ok) setRundown(await runRes.json());
      if (taskRes.ok) setTasks(await taskRes.json());
      if (budRes.ok) setBudget(await budRes.json());
      if (txRes.ok) setTransactions(await txRes.json());
      if (sumRes.ok) setSummary(await sumRes.json());
      if (memRes.ok) setMembers(await memRes.json());
      if (catRes.ok) setCategories(await catRes.json());
    } catch (error) {
      console.error('Error fetching event data:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Event CRUD ---
  const openEditEvent = () => {
    setEventForm({
      name: event.name || '', start_date: event.start_date || '', end_date: event.end_date || '',
      location_name: event.location_name || '', location_address: event.location_address || '',
      location_lat: event.location_lat, location_lng: event.location_lng,
      target_per_person: formatNumberInput(event.target_per_person || 0), status: event.status || 'draft',
      description: event.description || '', notes: event.notes || ''
    });
    setShowEventModal(true);
  };

  const saveEvent = async () => {
    const submitData = { ...eventForm, target_per_person: parseNumberInput(eventForm.target_per_person) };
    const res = await fetch(`/api/events/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(submitData) });
    if (res.ok) { setShowEventModal(false); fetchEventData(); }
  };

  const deleteEvent = async () => {
    if (!window.confirm('Hapus event ini? Semua data terkait akan dihapus.')) return;
    const res = await fetch(`/api/events/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token()}` } });
    if (res.ok) navigate('/events');
  };

  const handlePrintEvent = () => {
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    const html = `
      <!DOCTYPE html>
      <html><head><meta charset="utf-8"><title>Laporan Event - ${event.name}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; padding: 25px; color: #333; }
        .org { text-align: center; font-size: 11px; color: #666; margin-bottom: 3px; }
        h1 { text-align: center; font-size: 16px; margin-bottom: 2px; }
        h2 { text-align: center; color: #555; font-size: 12px; margin-bottom: 15px; }
        .info { font-size: 10px; color: #555; margin-bottom: 10px; line-height: 1.8; }
        .info b { color: #333; }
        .summary { display: flex; gap: 10px; margin-bottom: 15px; }
        .sc { flex: 1; padding: 8px; border: 1px solid #ccc; border-radius: 5px; text-align: center; }
        .sc .l { font-size: 9px; color: #666; text-transform: uppercase; }
        .sc .v { font-size: 13px; font-weight: bold; margin-top: 2px; }
        .green { color: #059669; }
        .red { color: #DC2626; }
        .title { font-size: 11px; font-weight: bold; margin: 12px 0 6px; padding-bottom: 4px; border-bottom: 2px solid #333; }
        table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 15px; }
        th { background: #eee; padding: 5px 6px; border: 1px solid #ccc; font-size: 9px; text-transform: uppercase; }
        td { padding: 4px 6px; border: 1px solid #ddd; }
        .tr { text-align: right; }
        .tc { text-align: center; }
        .section { margin-bottom: 20px; }
        .footer { margin-top: 15px; font-size: 9px; color: #999; text-align: center; border-top: 1px solid #ddd; padding-top: 8px; }
        @media print { body { padding: 15px; } }
      </style></head><body>
      <div class="org">E-Meli - Sistem Manajemen Keuangan Komunitas</div>
      <h1>LAPORAN EVENT</h1>
      <h2>${event.name}</h2>
      <div class="info">
        <b>Lokasi:</b> ${event.location_name || '-'} ${event.location_address ? '- ' + event.location_address : ''}<br/>
        <b>Tanggal:</b> ${formatDate(event.start_date)} ${event.end_date ? '- ' + formatDate(event.end_date) : ''}<br/>
        <b>Status:</b> ${event.status === 'completed' ? 'SELESAI' : event.status === 'ongoing' ? 'BERLANGSUNG' : 'DRAFT'}<br/>
        <b>Target Iuran:</b> ${formatCurrency(event.target_per_person)} / orang<br/>
        ${event.notes ? '<b>Catatan:</b> ' + event.notes : ''}
      </div>
      <div class="summary">
        <div class="sc"><div class="l">Kehadiran</div><div class="v">${summary?.attendance?.present || 0} / ${summary?.attendance?.total || 0}</div></div>
        <div class="sc"><div class="l">Pemasukan</div><div class="v green">${formatCurrency(summary?.income)}</div></div>
        <div class="sc"><div class="l">Pengeluaran</div><div class="v red">${formatCurrency(summary?.expense)}</div></div>
        <div class="sc"><div class="l">Saldo</div><div class="v">${formatCurrency(summary?.balance)}</div></div>
      </div>

      ${participants.length > 0 ? `
      <div class="section">
        <div class="title">Daftar Peserta (${participants.length} orang)</div>
        <table>
          <thead><tr><th>No</th><th>Nama</th><th class="tc">Absensi</th><th class="tr">Target</th><th class="tr">Terbayar</th><th class="tc">Status</th></tr></thead>
          <tbody>
            ${participants.map((p, i) => `
              <tr>
                <td class="tc">${i + 1}</td>
                <td>${p.name}</td>
                <td class="tc">${p.attendance === 'present' ? 'Hadir' : 'Absen'}</td>
                <td class="tr">${formatCurrency(p.target)}</td>
                <td class="tr">${formatCurrency(p.amount_paid)}</td>
                <td class="tc">${p.status === 'paid' ? 'LUNAS' : p.status === 'partial' ? 'SEBAGIAN' : 'BELUM'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>` : ''}

      ${rundown.length > 0 ? `
      <div class="section">
        <div class="title">Rundown Kegiatan</div>
        <table>
          <thead><tr><th>Waktu</th><th>Kegiatan</th><th>PIC</th><th class="tc">Status</th></tr></thead>
          <tbody>
            ${rundown.map(r => `
              <tr>
                <td>${r.time || '-'}</td>
                <td>${r.activity}</td>
                <td>${r.pic || '-'}</td>
                <td class="tc">${r.status === 'done' ? 'SELESAI' : 'BELUM'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>` : ''}

      ${tasks.length > 0 ? `
      <div class="section">
        <div class="title">Checklist Tugas</div>
        <table>
          <thead><tr><th>Tugas</th><th>PIC</th><th class="tc">Status</th></tr></thead>
          <tbody>
            ${tasks.map(t => `
              <tr>
                <td>${t.task}</td>
                <td>${t.pic || '-'}</td>
                <td class="tc">${t.status === 'done' ? 'SELESAI' : 'BELUM'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>` : ''}

      ${budget.items?.length > 0 ? `
      <div class="section">
        <div class="title">Rencana Anggaran Biaya (RAB)</div>
        <table>
          <thead><tr><th>Item</th><th class="tc">Qty</th><th class="tr">Harga</th><th class="tr">Rencana</th><th class="tr">Realisasi</th></tr></thead>
          <tbody>
            ${budget.items.map(b => `
              <tr>
                <td>${b.item}</td>
                <td class="tc">${b.qty}</td>
                <td class="tr">${formatCurrency(b.unit_price)}</td>
                <td class="tr">${formatCurrency(b.planned_amount)}</td>
                <td class="tr">${formatCurrency(b.actual_amount)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="font-weight:bold;background:#f5f5f5">
              <td colspan="3" class="tr">Total</td>
              <td class="tr">${formatCurrency(budget.totals?.planned)}</td>
              <td class="tr green">${formatCurrency(budget.totals?.actual)}</td>
            </tr>
          </tfoot>
        </table>
      </div>` : ''}

      ${transactions.length > 0 ? `
      <div class="section">
        <div class="title">Riwayat Transaksi</div>
        <table>
          <thead><tr><th>Tanggal</th><th>Keterangan</th><th class="tr">Nominal</th></tr></thead>
          <tbody>
            ${transactions.map(tx => `
              <tr>
                <td>${formatDate(tx.date)}</td>
                <td>${tx.category_name || ''} ${tx.description ? '- ' + tx.description : ''} ${tx.member_name ? '(' + tx.member_name + ')' : ''}</td>
                <td class="tr ${tx.type === 'income' ? 'green' : 'red'}">${tx.type === 'income' ? '+' : '-'}${formatCurrency(tx.amount)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>` : ''}

      <div class="footer">Laporan ini dicetak secara otomatis oleh sistem E-Meli | ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
      </body></html>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow.print();
        setTimeout(() => document.body.removeChild(iframe), 1000);
      }, 300);
    };
  };

  // --- Participants ---
  const openAddParticipants = () => {
    setSelectedMembers([]);
    setShowParticipantModal(true);
  };

  const saveParticipants = async () => {
    if (selectedMembers.length === 0) return;
    await fetch(`/api/events/${id}/participants`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ member_ids: selectedMembers }) });
    setShowParticipantModal(false);
    fetchEventData();
  };

  const openEditParticipant = (p) => {
    setEditParticipant(p);
    setParticipantForm({ attendance: p.attendance || 'absent', amount_paid: p.amount_paid || 0, status: p.status || 'unpaid' });
  };

  const saveEditParticipant = async () => {
    const submitData = { ...participantForm, amount_paid: parseNumberInput(participantForm.amount_paid) };
    await fetch(`/api/events/${id}/participants/${editParticipant.id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(submitData) });
    setEditParticipant(null);
    fetchEventData();
  };

  const deleteParticipant = async (participantId) => {
    if (!window.confirm('Hapus peserta ini?')) return;
    await fetch(`/api/events/${id}/participants/${participantId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token()}` } });
    fetchEventData();
  };

  // --- Rundown ---
  const openAddRundown = () => { setEditRundown(null); setRundownForm({ time: '', activity: '', pic: '', notes: '', status: 'pending' }); setShowRundownModal(true); };
  const openEditRundown = (r) => { setEditRundown(r); setRundownForm({ time: r.time || '', activity: r.activity || '', pic: r.pic || '', notes: r.notes || '', status: r.status || 'pending' }); setShowRundownModal(true); };
  const saveRundown = async () => {
    const url = editRundown ? `/api/events/${id}/rundown/${editRundown.id}` : `/api/events/${id}/rundown`;
    const method = editRundown ? 'PUT' : 'POST';
    await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(rundownForm) });
    setShowRundownModal(false); fetchEventData();
  };
  const deleteRundown = async (itemId) => {
    if (!window.confirm('Hapus item rundown ini?')) return;
    await fetch(`/api/events/${id}/rundown/${itemId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token()}` } });
    fetchEventData();
  };

  // --- Tasks ---
  const openAddTask = () => { setEditTask(null); setTaskForm({ task: '', pic: '', status: 'pending' }); setShowTaskModal(true); };
  const openEditTask = (t) => { setEditTask(t); setTaskForm({ task: t.task || '', pic: t.pic || '', status: t.status || 'pending' }); setShowTaskModal(true); };
  const saveTask = async () => {
    const url = editTask ? `/api/events/${id}/tasks/${editTask.id}` : `/api/events/${id}/tasks`;
    const method = editTask ? 'PUT' : 'POST';
    await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(taskForm) });
    setShowTaskModal(false); fetchEventData();
  };
  const deleteTask = async (taskId) => {
    if (!window.confirm('Hapus tugas ini?')) return;
    await fetch(`/api/events/${id}/tasks/${taskId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token()}` } });
    fetchEventData();
  };

  // --- Budget ---
  const openAddBudget = () => { setEditBudget(null); setBudgetForm({ item: '', qty: 1, unit_price: '', actual_amount: '' }); setShowBudgetModal(true); };
  const openEditBudget = (b) => { setEditBudget(b); setBudgetForm({ item: b.item || '', qty: b.qty || 1, unit_price: formatNumberInput(b.unit_price || 0), actual_amount: formatNumberInput(b.actual_amount || 0) }); setShowBudgetModal(true); };
  const saveBudget = async () => {
    const url = editBudget ? `/api/events/${id}/budget/${editBudget.id}` : `/api/events/${id}/budget`;
    const method = editBudget ? 'PUT' : 'POST';
    const submitData = { ...budgetForm, unit_price: parseNumberInput(budgetForm.unit_price), actual_amount: parseNumberInput(budgetForm.actual_amount) };
    await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(submitData) });
    setShowBudgetModal(false); fetchEventData();
  };
  const deleteBudget = async (budgetId) => {
    if (!window.confirm('Hapus item RAB ini?')) return;
    await fetch(`/api/events/${id}/budget/${budgetId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token()}` } });
    fetchEventData();
  };

  // --- Transactions ---
  const saveTransaction = async () => {
    const formDataSubmit = new FormData();
    formDataSubmit.append('type', txForm.type);
    formDataSubmit.append('category_id', txForm.category_id);
    formDataSubmit.append('amount', parseNumberInput(txForm.amount));
    formDataSubmit.append('description', txForm.description);
    formDataSubmit.append('date', txForm.date);
    formDataSubmit.append('member_id', txForm.member_id);
    if (txProofFile) formDataSubmit.append('proof_image', txProofFile);

    if (editingTx) {
      // Edit existing transaction
      await fetch(`/api/events/${id}/transactions/${editingTx.id}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: txForm.type,
          category_id: txForm.category_id,
          amount: parseNumberInput(txForm.amount),
          description: txForm.description,
          date: txForm.date,
          member_id: txForm.member_id
        })
      });
    } else {
      // Create new transaction
      await fetch(`/api/events/${id}/transactions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token()}` },
        body: formDataSubmit
      });
    }

    setShowTxModal(false);
    setEditingTx(null);
    setTxProofFile(null);
    setTxForm({ type: 'expense', category_id: '', amount: '', description: '', date: new Date().toISOString().split('T')[0], member_id: '' });
    fetchEventData();
  };

  const openEditTx = (tx) => {
    setEditingTx(tx);
    setTxForm({
      type: tx.type,
      category_id: tx.category_id || '',
      amount: formatNumberInput(tx.amount),
      description: tx.description || '',
      date: tx.date,
      member_id: tx.member_id || ''
    });
    setTxProofFile(null);
    setShowTxModal(true);
  };

  const handleDeleteTx = async (txId) => {
    if (!window.confirm('Hapus transaksi ini?')) return;
    await fetch(`/api/events/${id}/transactions/${txId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token()}` }
    });
    fetchEventData();
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  if (loading || !event) return <div className="flex justify-center p-8">Loading event details...</div>;

  const pieChartData = {
    labels: summary?.expense_breakdown?.map(i => i.item) || ['Belum ada pengeluaran'],
    datasets: [{ data: summary?.expense_breakdown?.length > 0 ? summary.expense_breakdown.map(i => i.actual_amount) : [1], backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'], borderWidth: 0 }]
  };

  return (
    <div className="event-detail-page">
      {/* HEADER */}
      <div className="event-header mb-6">
        <Link to="/events" className="btn-ghost flex items-center gap-2 mb-4 w-fit">
          <ArrowLeft size={16} /> <span>KEMBALI</span>
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-2">{event.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-muted text-sm">
              <span className="flex items-center gap-1"><MapPin size={14}/> {event.location_name || 'Lokasi belum diset'}</span>
              <span className="flex items-center gap-1"><CalendarIcon size={14}/> {formatDate(event.start_date)} {event.end_date ? `- ${formatDate(event.end_date)}` : ''}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-outline" onClick={handlePrintEvent}><Printer size={16}/> Cetak</button>
            <button className="btn btn-outline" onClick={() => exportEventData(event, participants, transactions, budget, event.name)}><FileSpreadsheet size={16}/> Excel</button>
            {isAdminOrCommittee && (
              <>
                <button className="btn btn-outline" onClick={openEditEvent}><Edit2 size={16}/> Edit</button>
                <button className="btn btn-danger" onClick={deleteEvent}><Trash2 size={16}/> Hapus</button>
              </>
            )}
            <div className="badge badge-neutral uppercase px-4 py-1.5 text-sm">
              STATUS: {event.status === 'completed' ? 'SELESAI' : event.status === 'ongoing' ? 'BERLANGSUNG' : 'DRAFT'}
            </div>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="glass-card flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted text-sm">Kehadiran</span>
            <div className="w-8 h-8 rounded-lg bg-secondary-light text-secondary flex items-center justify-center"><Users size={16}/></div>
          </div>
          <div>
            <div className="text-xl font-bold">{summary?.attendance?.present} <span className="text-muted text-sm font-normal">/ {summary?.attendance?.total}</span></div>
            <div className="w-full bg-border rounded-full h-1.5 mt-2">
              <div className="bg-secondary h-1.5 rounded-full" style={{ width: `${(summary?.attendance?.present / summary?.attendance?.total) * 100 || 0}%` }}></div>
            </div>
          </div>
        </div>
        <div className="glass-card flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted text-sm">Pemasukan (Real)</span>
            <div className="w-8 h-8 rounded-lg bg-primary-light text-primary flex items-center justify-center"><ArrowDownToLine size={16}/></div>
          </div>
          <div className="text-xl font-bold">{formatCurrency(summary?.income)}</div>
        </div>
        <div className="glass-card flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-muted text-sm">Pengeluaran (Real)</span>
            <div className="w-8 h-8 rounded-lg bg-danger-light text-danger flex items-center justify-center"><ArrowUpFromLine size={16}/></div>
          </div>
          <div className="text-xl font-bold">{formatCurrency(summary?.expense)}</div>
        </div>
        <div className="glass-card flex flex-col justify-between relative overflow-hidden bg-primary-gradient">
          <div className="flex justify-between items-center mb-2 relative z-10">
            <span className="text-muted text-sm">Sisa Saldo</span>
            <div className="w-8 h-8 rounded-lg bg-white bg-opacity-10 text-white flex items-center justify-center"><Wallet size={16}/></div>
          </div>
          <div className="text-xl font-bold relative z-10">{formatCurrency(summary?.balance)}</div>
        </div>
      </div>

      {/* PROYEKSI KEUANGAN */}
      <div className="glass-card mb-6">
        <h3 className="text-sm font-semibold text-muted flex items-center gap-2 mb-4 uppercase">
          <TrendingUp size={16} className="text-primary"/> Analisa Proyeksi Keuangan
        </h3>
        <div className="grid grid-cols-3 gap-8">
          <div>
            <div className="text-xs text-muted mb-1 uppercase">Potensi Pemasukan</div>
            <div className="text-lg font-bold">{formatCurrency(summary?.potential_income)}</div>
            <div className="text-xs text-muted mt-1">*Jika semua peserta lunas</div>
          </div>
          <div>
            <div className="text-xs text-muted mb-1 uppercase">Rencana Belanja (RAB)</div>
            <div className="text-lg font-bold">{formatCurrency(summary?.planned_budget)}</div>
            <div className="text-xs text-muted mt-1">*Total budget direncanakan</div>
          </div>
          <div className="border-l border-glass pl-8">
            <div className="text-xs text-muted mb-1 uppercase">Proyeksi Akhir</div>
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-md text-sm font-bold ${summary?.projection >= 0 ? 'bg-primary-light text-primary' : 'bg-danger-light text-danger'}`}>
              {formatCurrency(Math.abs(summary?.projection || 0))}
            </div>
            <div className="text-xs text-muted mt-1">{summary?.projection >= 0 ? 'SURPLUS (AMAN)' : 'DEFISIT (BAHAYA)'}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* PIE CHART */}
        <div className="glass-card">
          <h3 className="text-sm font-semibold text-muted flex items-center gap-2 mb-4 uppercase">
            <BarChart3 size={16} className="text-secondary"/> Proporsi Pengeluaran
          </h3>
          <div className="h-48 flex justify-center">
            {summary?.expense_breakdown?.length > 0 ? (
              <Pie data={pieChartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#9CA3AF', font: { size: 10 } } } } }} />
            ) : (
              <div className="flex items-center justify-center text-muted text-sm">Belum ada pengeluaran</div>
            )}
          </div>
        </div>

        {/* CATATAN */}
        <div className="glass-card border-warning border-t-2">
          <h3 className="text-sm font-semibold text-muted flex items-center gap-2 mb-4 uppercase">
            <FileText size={16} className="text-warning"/> Evaluasi / Catatan
          </h3>
          {event.bank_info && (
            <div className="mb-4 text-sm">
              <div className="text-warning mb-1 flex items-center gap-1">Nomor Rekening Pembayaran:</div>
              <div>{event.bank_info.bank}</div>
              <div>No. Rek: {event.bank_info.no_rek}</div>
              <div>a.n {event.bank_info.atas_nama}</div>
            </div>
          )}
          <div className="text-sm text-muted whitespace-pre-line">
            {event.notes || 'Belum ada catatan/evaluasi.'}
          </div>
        </div>
      </div>

      {/* LOKASI EVENT - Leaflet Map */}
      <div className="glass-card mb-6">
        <h3 className="text-sm font-semibold text-muted flex items-center gap-2 mb-4 uppercase">
          <MapPin size={16} className="text-danger"/> Lokasi Event
        </h3>
        {event.location_lat && event.location_lng ? (
          <div style={{ height: '300px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <MapContainer center={[event.location_lat, event.location_lng]} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
              <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[event.location_lat, event.location_lng]}>
                <Popup><strong>{event.location_name}</strong><br/>{event.location_address}</Popup>
              </Marker>
            </MapContainer>
          </div>
        ) : (
          <div className="rounded-xl bg-bg border border-glass flex items-center justify-center text-muted" style={{ height: '200px' }}>
            <div className="text-center"><MapPin size={32} className="mx-auto mb-2 opacity-30"/><p>Lokasi belum ditentukan</p></div>
          </div>
        )}
      </div>

      {/* TABEL PESERTA */}
      <div className="glass-card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-muted flex items-center gap-2 uppercase">
            <Users size={16} className="text-primary"/> Peserta ({participants.length})
          </h3>
          {isAdminOrCommittee && <button className="btn btn-primary btn-sm" onClick={openAddParticipants}><Plus size={14}/> Tambah</button>}
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nama</th>
                <th className="text-center">Absensi</th>
                <th className="text-right">Target</th>
                <th className="text-right">Terbayar</th>
                <th className="text-center">Status</th>
                {isAdminOrCommittee && <th className="text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {participants.length > 0 ? participants.map(p => (
                <tr key={p.id}>
                  <td className="font-medium">{p.name}</td>
                  <td className="text-center">
                    {editParticipant?.id === p.id ? (
                      <select className="form-select" style={{padding:'0.2rem 0.4rem'}} value={participantForm.attendance} onChange={e => setParticipantForm({...participantForm, attendance: e.target.value})}>
                        <option value="present">Hadir</option>
                        <option value="absent">Absen</option>
                      </select>
                    ) : <span className={`badge ${p.attendance === 'present' ? 'badge-success' : 'badge-neutral'}`}>{p.attendance === 'present' ? 'HADIR' : 'ABSEN'}</span>}
                  </td>
                  <td className="text-right">{formatCurrency(p.target)}</td>
                  <td className="text-right">
                    {editParticipant?.id === p.id ? (
                      <input type="text" inputMode="numeric" className="form-input" style={{padding:'0.2rem 0.4rem',width:'100px',textAlign:'right'}} value={participantForm.amount_paid} onChange={e => setParticipantForm({...participantForm, amount_paid: formatNumberInput(e.target.value)})} />
                    ) : formatCurrency(p.amount_paid)}
                  </td>
                  <td className="text-center">
                    {editParticipant?.id === p.id ? (
                      <select className="form-select" style={{padding:'0.2rem 0.4rem'}} value={participantForm.status} onChange={e => setParticipantForm({...participantForm, status: e.target.value})}>
                        <option value="unpaid">Belum</option>
                        <option value="partial">Sebagian</option>
                        <option value="paid">Lunas</option>
                      </select>
                    ) : <span className={`badge ${p.status === 'paid' ? 'badge-success' : p.status === 'partial' ? 'badge-warning' : 'badge-danger'}`}>
                      {p.status === 'paid' ? 'LUNAS' : p.status === 'partial' ? 'SEBAGIAN' : 'BELUM'}
                    </span>}
                  </td>
                  {isAdminOrCommittee && (
                    <td className="text-center">
                      {editParticipant?.id === p.id ? (
                        <>
                          <button className="btn-icon text-primary" onClick={saveEditParticipant}><Save size={14}/></button>
                          <button className="btn-icon text-muted" onClick={() => setEditParticipant(null)}><X size={14}/></button>
                        </>
                      ) : (
                        <>
                          <button className="btn-icon" onClick={() => openEditParticipant(p)}><Edit2 size={14}/></button>
                          <button className="btn-icon text-danger" onClick={() => deleteParticipant(p.id)}><Trash2 size={14}/></button>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              )) : (
                <tr><td colSpan={isAdminOrCommittee ? 6 : 5} className="text-center py-4 text-muted">Belum ada peserta.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RUNDOWN & TASKS */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="glass-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-muted flex items-center gap-2 uppercase">
              <Clock size={16} className="text-primary"/> Rundown
            </h3>
            {isAdminOrCommittee && <button className="btn btn-primary btn-sm" onClick={openAddRundown}><Plus size={14}/> Tambah</button>}
          </div>
          <div className="table-container">
            <table className="table text-sm">
              <thead><tr><th>Waktu</th><th>Kegiatan</th><th>PIC</th><th className="text-center">Status</th>{isAdminOrCommittee && <th className="text-center">Aksi</th>}</tr></thead>
              <tbody>
                {rundown.length > 0 ? rundown.map(r => (
                  <tr key={r.id}>
                    <td>{editRundown?.id === r.id ? <input type="text" className="form-input" style={{padding:'0.2rem'}} value={rundownForm.time} onChange={e => setRundownForm({...rundownForm, time: e.target.value})} /> : r.time}</td>
                    <td>{editRundown?.id === r.id ? <input type="text" className="form-input" style={{padding:'0.2rem'}} value={rundownForm.activity} onChange={e => setRundownForm({...rundownForm, activity: e.target.value})} /> : r.activity}</td>
                    <td>{editRundown?.id === r.id ? <input type="text" className="form-input" style={{padding:'0.2rem'}} value={rundownForm.pic} onChange={e => setRundownForm({...rundownForm, pic: e.target.value})} /> : r.pic}</td>
                    <td className="text-center"><span className={`badge ${r.status === 'done' ? 'badge-success' : 'badge-neutral'}`}>{r.status === 'done' ? 'SELESAI' : 'BELUM'}</span></td>
                    {isAdminOrCommittee && <td className="text-center">
                      {editRundown?.id === r.id ? (
                        <><button className="btn-icon text-primary" onClick={saveRundown}><Save size={14}/></button><button className="btn-icon text-muted" onClick={() => setEditRundown(null)}><X size={14}/></button></>
                      ) : (
                        <><button className="btn-icon" onClick={() => openEditRundown(r)}><Edit2 size={14}/></button><button className="btn-icon text-danger" onClick={() => deleteRundown(r.id)}><Trash2 size={14}/></button></>
                      )}
                    </td>}
                  </tr>
                )) : <tr><td colSpan={isAdminOrCommittee ? 5 : 4} className="text-center py-4 text-muted">Belum ada rundown.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-semibold text-muted flex items-center gap-2 uppercase">
              <CheckSquare size={16} className="text-secondary"/> Checklist Tugas
            </h3>
            {isAdminOrCommittee && <button className="btn btn-primary btn-sm" onClick={openAddTask}><Plus size={14}/> Tambah</button>}
          </div>
          <div className="table-container">
            <table className="table text-sm">
              <thead><tr><th>Tugas</th><th>PIC</th><th className="text-center">Status</th>{isAdminOrCommittee && <th className="text-center">Aksi</th>}</tr></thead>
              <tbody>
                {tasks.length > 0 ? tasks.map(t => (
                  <tr key={t.id}>
                    <td>{editTask?.id === t.id ? <input type="text" className="form-input" style={{padding:'0.2rem'}} value={taskForm.task} onChange={e => setTaskForm({...taskForm, task: e.target.value})} /> : t.task}</td>
                    <td>{editTask?.id === t.id ? <input type="text" className="form-input" style={{padding:'0.2rem'}} value={taskForm.pic} onChange={e => setTaskForm({...taskForm, pic: e.target.value})} /> : t.pic}</td>
                    <td className="text-center"><span className={`badge ${t.status === 'done' ? 'badge-success' : 'badge-neutral'}`}>{t.status === 'done' ? 'SELESAI' : 'BELUM'}</span></td>
                    {isAdminOrCommittee && <td className="text-center">
                      {editTask?.id === t.id ? (
                        <><button className="btn-icon text-primary" onClick={saveTask}><Save size={14}/></button><button className="btn-icon text-muted" onClick={() => setEditTask(null)}><X size={14}/></button></>
                      ) : (
                        <><button className="btn-icon" onClick={() => openEditTask(t)}><Edit2 size={14}/></button><button className="btn-icon text-danger" onClick={() => deleteTask(t.id)}><Trash2 size={14}/></button></>
                      )}
                    </td>}
                  </tr>
                )) : <tr><td colSpan={isAdminOrCommittee ? 4 : 3} className="text-center py-4 text-muted">Belum ada tugas.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RAB */}
      <div className="glass-card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-muted flex items-center gap-2 uppercase">
            <ListOrdered size={16} className="text-warning"/> RAB (Rencana Anggaran Biaya)
          </h3>
          {isAdminOrCommittee && <button className="btn btn-primary btn-sm" onClick={openAddBudget}><Plus size={14}/> Tambah Item</button>}
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Item</th>
                <th className="text-center">Qty</th>
                <th className="text-right">Harga</th>
                <th className="text-right">Rencana</th>
                <th className="text-right">Realisasi</th>
                <th className="text-center" style={{width: '100px'}}>Status</th>
                {isAdminOrCommittee && <th className="text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {budget.items?.length > 0 ? budget.items.map(b => (
                <tr key={b.id}>
                  <td className="font-medium">{b.item}</td>
                  <td className="text-center">{b.qty}</td>
                  <td className="text-right">{formatCurrency(b.unit_price)}</td>
                  <td className="text-right">{formatCurrency(b.planned_amount)}</td>
                  <td className="text-right font-medium">{formatCurrency(b.actual_amount)}</td>
                  <td className="text-center">
                    <div className="w-full bg-border rounded-full h-1.5 mt-2">
                      <div className={`h-1.5 rounded-full ${b.actual_amount > b.planned_amount ? 'bg-danger' : 'bg-primary'}`} style={{ width: `${Math.min(100, (b.actual_amount / b.planned_amount) * 100 || 0)}%` }}></div>
                    </div>
                  </td>
                  {isAdminOrCommittee && <td className="text-center">
                    <button className="btn-icon" onClick={() => openEditBudget(b)}><Edit2 size={14}/></button>
                    <button className="btn-icon text-danger" onClick={() => deleteBudget(b.id)}><Trash2 size={14}/></button>
                  </td>}
                </tr>
              )) : <tr><td colSpan={isAdminOrCommittee ? 7 : 6} className="text-center py-4 text-muted">Belum ada RAB.</td></tr>}
            </tbody>
            {budget.items?.length > 0 && (
              <tfoot>
                <tr className="bg-bg font-bold">
                  <td colSpan="3" className="text-right uppercase">Total</td>
                  <td className="text-right">{formatCurrency(budget.totals?.planned)}</td>
                  <td className="text-right text-primary">{formatCurrency(budget.totals?.actual)}</td>
                  <td></td>
                  {isAdminOrCommittee && <td></td>}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* RIWAYAT TRANSAKSI */}
      <div className="glass-card mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-muted flex items-center gap-2 uppercase">
            <Receipt size={16} className="text-secondary"/> Riwayat Transaksi Event
          </h3>
          {isAdminOrCommittee && <button className="btn btn-primary btn-sm" onClick={() => { setEditingTx(null); setTxForm({ type: 'expense', category_id: '', amount: '', description: '', date: new Date().toISOString().split('T')[0], member_id: '' }); setTxProofFile(null); setShowTxModal(true); }}><Plus size={14}/> Tambah</button>}
        </div>
        <div className="table-container">
          <table className="table text-sm">
            <thead>
              <tr><th>Tanggal</th><th>Keterangan</th><th className="text-right">Nominal</th><th className="text-center">Bukti</th>{isAdminOrCommittee && <th className="text-center">Aksi</th>}</tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? transactions.map(tx => (
                <tr key={tx.id}>
                  <td>{formatDate(tx.date)}</td>
                  <td>
                    <span className={tx.type === 'income' ? 'text-primary' : 'text-danger'}>{tx.category_name}</span>
                    {tx.description && <span> - {tx.description}</span>}
                    {tx.member_name && <span> (dari {tx.member_name})</span>}
                  </td>
                  <td className={`text-right font-medium ${tx.type === 'income' ? 'text-primary' : 'text-danger'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </td>
                  <td className="text-center">
                    {tx.proof_image ? (
                      <button className="btn btn-ghost btn-sm" style={{color:'var(--secondary)',padding:'0.2rem 0.5rem'}} onClick={() => setShowProofModal(tx.proof_image)}>
                        Lihat
                      </button>
                    ) : <span className="text-muted text-xs">-</span>}
                  </td>
                  {isAdminOrCommittee && (
                    <td className="text-center">
                      <button className="btn-icon" onClick={() => openEditTx(tx)} title="Edit"><Edit2 size={14}/></button>
                      <button className="btn-icon text-danger" onClick={() => handleDeleteTx(tx.id)} title="Hapus"><Trash2 size={14}/></button>
                    </td>
                  )}
                </tr>
              )) : <tr><td colSpan={isAdminOrCommittee ? 5 : 4} className="text-center py-4 text-muted">Belum ada riwayat transaksi.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== MODALS ===== */}

      {/* Edit Event Modal */}
      {showEventModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth:'600px'}}>
            <div className="modal-header">
              <h3 className="text-lg font-bold">Edit Event</h3>
              <button className="btn-icon" onClick={() => setShowEventModal(false)}><X size={20}/></button>
            </div>
            <div className="modal-body flex flex-col gap-4">
              <div className="form-group mb-0">
                <label className="form-label">Nama Event <span className="text-danger">*</span></label>
                <input type="text" className="form-input" value={eventForm.name} onChange={e => setEventForm({...eventForm, name: e.target.value})} />
              </div>
              <div className="flex gap-4">
                <div className="form-group mb-0 flex-1">
                  <label className="form-label">Tanggal Mulai</label>
                  <input type="date" className="form-input" value={eventForm.start_date} onChange={e => setEventForm({...eventForm, start_date: e.target.value})} />
                </div>
                <div className="form-group mb-0 flex-1">
                  <label className="form-label">Tanggal Selesai</label>
                  <input type="date" className="form-input" value={eventForm.end_date} onChange={e => setEventForm({...eventForm, end_date: e.target.value})} />
                </div>
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Target Iuran (Rp)</label>
                <input type="text" inputMode="numeric" className="form-input" value={eventForm.target_per_person} onChange={e => setEventForm({...eventForm, target_per_person: formatNumberInput(e.target.value)})} placeholder="Contoh: 50.000" />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Status</label>
                <select className="form-select" value={eventForm.status} onChange={e => setEventForm({...eventForm, status: e.target.value})}>
                  <option value="draft">Draft</option><option value="ongoing">Berlangsung</option><option value="completed">Selesai</option>
                </select>
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Lokasi</label>
                <input type="text" className="form-input mb-2" placeholder="Nama tempat" value={eventForm.location_name} onChange={e => setEventForm({...eventForm, location_name: e.target.value})} />
                <input type="text" className="form-input mb-2" placeholder="Alamat" value={eventForm.location_address} onChange={e => setEventForm({...eventForm, location_address: e.target.value})} />
                <MapPicker lat={eventForm.location_lat} lng={eventForm.location_lng} onLocationChange={(lat, lng) => setEventForm({...eventForm, location_lat: lat, location_lng: lng})} />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Catatan</label>
                <textarea className="form-textarea" rows="2" value={eventForm.notes} onChange={e => setEventForm({...eventForm, notes: e.target.value})}></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowEventModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={saveEvent}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Participants Modal */}
      {showParticipantModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-lg font-bold">Tambah Peserta</h3>
              <button className="btn-icon" onClick={() => setShowParticipantModal(false)}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <p className="text-sm text-muted mb-3">Pilih anggota yang akan menjadi peserta event ini:</p>
              <div style={{maxHeight:'300px',overflowY:'auto'}} className="flex flex-col gap-2">
                {members.filter(m => m.status === 'active').map(m => (
                  <label key={m.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-card-hover cursor-pointer" style={{border:'1px solid var(--border-color)'}}>
                    <input type="checkbox" checked={selectedMembers.includes(m.id)} onChange={e => {
                      setSelectedMembers(e.target.checked ? [...selectedMembers, m.id] : selectedMembers.filter(id => id !== m.id));
                    }} />
                    <span className="font-medium">{m.name}</span>
                    <span className="text-xs text-muted">{m.address}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowParticipantModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={saveParticipants} disabled={selectedMembers.length === 0}>
                Tambah {selectedMembers.length} Peserta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rundown Modal */}
      {showRundownModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-lg font-bold">{editRundown ? 'Edit Rundown' : 'Tambah Rundown'}</h3>
              <button className="btn-icon" onClick={() => setShowRundownModal(false)}><X size={20}/></button>
            </div>
            <div className="modal-body flex flex-col gap-4">
              <div className="form-group mb-0">
                <label className="form-label">Waktu</label>
                <input type="time" className="form-input" value={rundownForm.time} onChange={e => setRundownForm({...rundownForm, time: e.target.value})} />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Kegiatan <span className="text-danger">*</span></label>
                <input type="text" className="form-input" value={rundownForm.activity} onChange={e => setRundownForm({...rundownForm, activity: e.target.value})} required />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">PIC</label>
                <input type="text" className="form-input" value={rundownForm.pic} onChange={e => setRundownForm({...rundownForm, pic: e.target.value})} />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Status</label>
                <select className="form-select" value={rundownForm.status} onChange={e => setRundownForm({...rundownForm, status: e.target.value})}>
                  <option value="pending">Belum</option><option value="done">Selesai</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowRundownModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={saveRundown}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-lg font-bold">{editTask ? 'Edit Tugas' : 'Tambah Tugas'}</h3>
              <button className="btn-icon" onClick={() => setShowTaskModal(false)}><X size={20}/></button>
            </div>
            <div className="modal-body flex flex-col gap-4">
              <div className="form-group mb-0">
                <label className="form-label">Tugas <span className="text-danger">*</span></label>
                <input type="text" className="form-input" value={taskForm.task} onChange={e => setTaskForm({...taskForm, task: e.target.value})} required />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">PIC</label>
                <input type="text" className="form-input" value={taskForm.pic} onChange={e => setTaskForm({...taskForm, pic: e.target.value})} />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Status</label>
                <select className="form-select" value={taskForm.status} onChange={e => setTaskForm({...taskForm, status: e.target.value})}>
                  <option value="pending">Belum</option><option value="done">Selesai</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowTaskModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={saveTask}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-lg font-bold">{editBudget ? 'Edit Item RAB' : 'Tambah Item RAB'}</h3>
              <button className="btn-icon" onClick={() => setShowBudgetModal(false)}><X size={20}/></button>
            </div>
            <div className="modal-body flex flex-col gap-4">
              <div className="form-group mb-0">
                <label className="form-label">Item <span className="text-danger">*</span></label>
                <input type="text" className="form-input" value={budgetForm.item} onChange={e => setBudgetForm({...budgetForm, item: e.target.value})} required />
              </div>
              <div className="flex gap-4">
                <div className="form-group mb-0 flex-1">
                  <label className="form-label">Qty</label>
                  <input type="number" min="1" className="form-input" value={budgetForm.qty} onChange={e => setBudgetForm({...budgetForm, qty: Number(e.target.value)})} />
                </div>
                <div className="form-group mb-0 flex-1">
                  <label className="form-label">Harga Satuan (Rp)</label>
                  <input type="text" inputMode="numeric" className="form-input" value={budgetForm.unit_price} onChange={e => setBudgetForm({...budgetForm, unit_price: formatNumberInput(e.target.value)})} placeholder="Contoh: 50.000" />
                </div>
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Realisasi (Rp)</label>
                <input type="text" inputMode="numeric" className="form-input" value={budgetForm.actual_amount} onChange={e => setBudgetForm({...budgetForm, actual_amount: formatNumberInput(e.target.value)})} placeholder="Contoh: 50.000" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowBudgetModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={saveBudget}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {showTxModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-lg font-bold">{editingTx ? 'Edit Transaksi Event' : 'Tambah Transaksi Event'}</h3>
              <button className="btn-icon" onClick={() => setShowTxModal(false)}><X size={20}/></button>
            </div>
            <div className="modal-body flex flex-col gap-4">
              <div className="form-group mb-0">
                <label className="form-label">Tipe</label>
                <select className="form-select" value={txForm.type} onChange={e => setTxForm({...txForm, type: e.target.value, category_id: ''})}>
                  <option value="income">Pemasukan</option><option value="expense">Pengeluaran</option>
                </select>
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Kategori</label>
                <select className="form-select" value={txForm.category_id} onChange={e => setTxForm({...txForm, category_id: e.target.value})}>
                  <option value="">-- Pilih Kategori --</option>
                  {categories.filter(c => c.type === txForm.type).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="form-group mb-0 flex-1">
                  <label className="form-label">Nominal (Rp)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    className="form-input"
                    placeholder="Contoh: 50.000"
                    value={txForm.amount}
                    onChange={e => setTxForm({...txForm, amount: formatNumberInput(e.target.value)})}
                  />
                </div>
                <div className="form-group mb-0 flex-1">
                  <label className="form-label">Tanggal</label>
                  <input type="date" className="form-input" value={txForm.date} onChange={e => setTxForm({...txForm, date: e.target.value})} />
                </div>
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Anggota (opsional)</label>
                <select className="form-select" value={txForm.member_id} onChange={e => setTxForm({...txForm, member_id: e.target.value})}>
                  <option value="">-- Tanpa Anggota --</option>
                  {members.filter(m => m.status === 'active').map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Keterangan</label>
                <input type="text" className="form-input" value={txForm.description} onChange={e => setTxForm({...txForm, description: e.target.value})} />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Foto Bukti Transaksi (opsional)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="form-input"
                  style={{padding:'0.5rem'}}
                  onChange={e => setTxProofFile(e.target.files[0] || null)}
                />
                {txProofFile && (
                  <div className="flex items-center gap-2 mt-2">
                    <img src={URL.createObjectURL(txProofFile)} alt="Preview" style={{width:'60px',height:'60px',objectFit:'cover',borderRadius:'8px',border:'1px solid var(--border-color)'}} />
                    <span className="text-xs text-muted">{txProofFile.name}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowTxModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={saveTransaction}>Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Proof Image Preview Modal */}
      {showProofModal && (
        <div className="modal-overlay" onClick={() => setShowProofModal(null)}>
          <div className="modal-content" style={{maxWidth:'600px'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-bold">Bukti Transaksi</h3>
              <button className="btn-icon" onClick={() => setShowProofModal(null)}><X size={20}/></button>
            </div>
            <div className="modal-body" style={{padding:'1rem',textAlign:'center'}}>
              <img src={showProofModal} alt="Bukti Transaksi" style={{maxWidth:'100%',maxHeight:'70vh',borderRadius:'8px',border:'1px solid var(--border-color)'}} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EventDetailPage;
