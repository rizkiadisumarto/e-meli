import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Calendar, MapPin, Users, TrendingUp, CheckCircle, Clock, X, Edit2, Trash2 } from 'lucide-react';
import MapPicker from '../components/UI/MapPicker';
import './EventsPage.css';

const EMPTY_FORM = {
  name: '',
  start_date: '',
  end_date: '',
  location_name: '',
  location_address: '',
  location_lat: null,
  location_lng: null,
  target_per_person: 0,
  status: 'draft',
  description: '',
  notes: ''
};

const EventsPage = () => {
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ ...EMPTY_FORM });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/events', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setEvents(await res.json());
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    setFormData({ ...EMPTY_FORM });
    setError('');
    setShowModal(true);
  };

  const openEditModal = (e, event) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingEvent(event);
    setFormData({
      name: event.name || '',
      start_date: event.start_date || '',
      end_date: event.end_date || '',
      location_name: event.location_name || '',
      location_address: event.location_address || '',
      location_lat: event.location_lat,
      location_lng: event.location_lng,
      target_per_person: event.target_per_person || 0,
      status: event.status || 'draft',
      description: event.description || '',
      notes: event.notes || ''
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const isEdit = !!editingEvent;
      const url = isEdit ? `/api/events/${editingEvent.id}` : '/api/events';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        fetchEvents();
        setFormData({ ...EMPTY_FORM });
        setEditingEvent(null);
      } else {
        const err = await res.json();
        setError(err.error || 'Gagal menyimpan event');
      }
    } catch (error) {
      console.error(error);
      setError('Terjadi kesalahan jaringan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (e, eventId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Hapus event ini? Semua data terkait akan dihapus.')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchEvents();
    } catch (error) {
      console.error(error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(amount);
  };

  const StatusBadge = ({ status }) => {
    switch(status) {
      case 'completed': return <span className="badge badge-success"><CheckCircle size={12} className="mr-1" /> Selesai</span>;
      case 'ongoing': return <span className="badge badge-warning"><Clock size={12} className="mr-1" /> Berlangsung</span>;
      default: return <span className="badge badge-neutral">Draft</span>;
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading events...</div>;

  return (
    <div className="events-page">
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h2>Kegiatan / Event</h2>
          <p className="text-muted text-sm mt-1">Kelola acara dan kegiatan komunitas</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary shadow-glow" onClick={openCreateModal}>
            <Plus size={18} /> Buat Event Baru
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {events.length > 0 ? events.map(event => (
          <Link to={`/events/${event.id}`} key={event.id} className="event-card glass-card" style={{position:'relative'}}>
            {isAdmin && (
              <div className="flex gap-1" style={{position:'absolute',top:'1rem',right:'1rem',zIndex:10}}>
                <button className="btn-icon" style={{background:'var(--bg-card)',borderRadius:'8px'}} onClick={(e) => openEditModal(e, event)} title="Edit Event"><Edit2 size={14}/></button>
                <button className="btn-icon text-danger" style={{background:'var(--bg-card)',borderRadius:'8px'}} onClick={(e) => handleDelete(e, event.id)} title="Hapus Event"><Trash2 size={14}/></button>
              </div>
            )}
            <div className="event-card-header flex justify-between items-start mb-4">
              <h3 className="event-title" style={{paddingRight: isAdmin ? '5rem' : 0}}>{event.name}</h3>
              <StatusBadge status={event.status} />
            </div>
            
            <div className="event-meta flex flex-col gap-2 mb-4">
              <div className="flex items-center gap-2 text-muted text-sm">
                <Calendar size={14} />
                <span>{formatDate(event.start_date)} {event.end_date ? `- ${formatDate(event.end_date)}` : ''}</span>
              </div>
              <div className="flex items-center gap-2 text-muted text-sm">
                <MapPin size={14} />
                <span className="truncate">{event.location_name || 'Lokasi belum ditentukan'}</span>
              </div>
            </div>

            <div className="event-stats grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-glass">
              <div className="flex flex-col">
                <span className="text-xs text-muted mb-1 flex items-center gap-1"><Users size={12}/> Peserta</span>
                <span className="font-bold">{event.participant_count} Orang</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted mb-1 flex items-center gap-1"><TrendingUp size={12}/> Saldo</span>
                <span className={`font-bold ${event.balance >= 0 ? 'text-primary' : 'text-danger'}`}>
                  {formatCurrency(event.balance)}
                </span>
              </div>
            </div>
          </Link>
        )) : (
          <div className="col-span-3 glass-card text-center py-12">
            <Calendar size={48} className="mx-auto text-muted mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Belum ada kegiatan</h3>
            <p className="text-muted">Mulai dengan membuat kegiatan baru untuk komunitas Anda.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth:'600px'}}>
            <div className="modal-header">
              <h3 className="text-lg font-bold">{editingEvent ? 'Edit Event' : 'Buat Event Baru'}</h3>
              <button className="btn-icon" onClick={() => { setShowModal(false); setError(''); setEditingEvent(null); }}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body flex flex-col gap-4">
                {error && <div className="text-sm text-danger" style={{background:'var(--danger-light)',padding:'0.5rem 1rem',borderRadius:'8px'}}>{error}</div>}
                <div className="form-group mb-0">
                  <label className="form-label">Nama Event/Kegiatan <span className="text-danger">*</span></label>
                  <input type="text" className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div className="flex gap-4">
                  <div className="form-group mb-0 flex-1">
                    <label className="form-label">Tanggal Mulai <span className="text-danger">*</span></label>
                    <input type="date" className="form-input" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} required />
                  </div>
                  <div className="form-group mb-0 flex-1">
                    <label className="form-label">Tanggal Selesai</label>
                    <input type="date" className="form-input" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
                  </div>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Target Iuran per Peserta (Rp)</label>
                  <input type="number" min="0" className="form-input" value={formData.target_per_person} onChange={e => setFormData({...formData, target_per_person: e.target.value})} />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="draft">Draft</option>
                    <option value="ongoing">Berlangsung</option>
                    <option value="completed">Selesai</option>
                  </select>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Deskripsi</label>
                  <textarea className="form-textarea" rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Lokasi Event</label>
                  <input type="text" className="form-input mb-2" placeholder="Nama tempat" value={formData.location_name} onChange={e => setFormData({...formData, location_name: e.target.value})} />
                  <input type="text" className="form-input mb-2" placeholder="Alamat lengkap" value={formData.location_address} onChange={e => setFormData({...formData, location_address: e.target.value})} />
                  <MapPicker
                    lat={formData.location_lat}
                    lng={formData.location_lng}
                    onLocationChange={(lat, lng) => setFormData({...formData, location_lat: lat, location_lng: lng})}
                  />
                </div>
                <div className="form-group mb-0">
                  <label className="form-label">Catatan</label>
                  <textarea className="form-textarea" rows="2" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => { setShowModal(false); setError(''); setEditingEvent(null); }}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Menyimpan...' : editingEvent ? 'Simpan Perubahan' : 'Buat Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
