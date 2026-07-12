import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Search, Crosshair, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const DEFAULT_CENTER = [-6.9175, 107.6191]; // Bandung

// Draggable marker that reports position on drag
function DraggableMarker({ position, onDragEnd }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 16, { duration: 0.8 });
    }
  }, [position, map]);

  if (!position) return null;

  return (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend(e) {
          const { lat, lng } = e.target.getLatLng();
          onDragEnd(lat, lng);
        },
      }}
    />
  );
}

// Click on map to set position
function MapClickHandler({ onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Right-click to center on marker
function MapRightClickHandler({ position }) {
  const map = useMap();
  useMapEvents({
    contextmenu(e) {
      if (position) {
        map.flyTo(position, 16, { duration: 0.5 });
      }
    },
  });
  return null;
}

const MapPicker = ({ lat, lng, onLocationChange, height = '350px' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [gettingLocation, setGettingLocation] = useState(false);
  const position = lat && lng ? [lat, lng] : null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchResults([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=id`,
        { headers: { 'Accept-Language': 'id' } }
      );
      const results = await res.json();
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const selectSearchResult = (result) => {
    onLocationChange(parseFloat(result.lat), parseFloat(result.lon));
    setSearchResults([]);
    setSearchQuery(result.display_name.split(',').slice(0, 3).join(', '));
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return alert('Browser tidak mendukung geolokasi');
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onLocationChange(pos.coords.latitude, pos.coords.longitude);
        setGettingLocation(false);
        setSearchQuery('');
        setSearchResults([]);
      },
      () => {
        alert('Gagal mengambil lokasi. Pastikan izin lokasi diberikan.');
        setGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const clearLocation = () => {
    onLocationChange(null, null);
    setSearchQuery('');
    setSearchResults([]);
  };

  const formatCoord = (v) => v ? v.toFixed(6) : '-';

  return (
    <div style={{ position: 'relative' }}>
      {/* Search + GPS row */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Cari nama jalan, tempat, kota..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchResults([]); }}
              style={{ paddingLeft: '2rem' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={searching}>
            {searching ? '...' : 'Cari'}
          </button>
        </form>
        <button type="button" className="btn btn-outline" onClick={useMyLocation} disabled={gettingLocation} title="Gunakan lokasi saya" style={{ whiteSpace: 'nowrap' }}>
          <Crosshair size={16}/> {gettingLocation ? 'Mencari...' : 'Lokasi Saya'}
        </button>
      </div>

      {/* Search results dropdown */}
      {searchResults.length > 0 && (
        <div style={{
          position: 'absolute', top: '44px', left: 0, right: '120px', zIndex: 1000,
          background: 'var(--bg-card)', border: '1px solid var(--border-color)',
          borderRadius: '8px', maxHeight: '200px', overflowY: 'auto',
          boxShadow: '0 8px 16px rgba(0,0,0,0.3)'
        }}>
          {searchResults.map((r, i) => (
            <div
              key={i}
              onClick={() => selectSearchResult(r)}
              style={{
                padding: '0.6rem 0.75rem', cursor: 'pointer', borderBottom: '1px solid var(--border-color)',
                fontSize: '0.8rem', color: 'var(--text-main)'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ fontWeight: 500 }}>{r.display_name.split(',').slice(0, 3).join(', ')}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{r.display_name.split(',').slice(3).join(', ')}</div>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-muted" style={{ marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>Klik peta untuk pin, atau geser marker untuk presisi</span>
        {position && (
          <button type="button" onClick={clearLocation} className="btn btn-ghost" style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem' }}>
            Hapus Pin
          </button>
        )}
      </div>

      {/* Map */}
      <div style={{ height, borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        <MapContainer
          center={position || DEFAULT_CENTER}
          zoom={position ? 16 : 12}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onPositionChange={onLocationChange} />
          <MapRightClickHandler position={position} />
          <DraggableMarker position={position} onDragEnd={onLocationChange} />
        </MapContainer>
      </div>

      {/* Coordinates display */}
      {position && (
        <div style={{
          marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.4rem 0.75rem', background: 'var(--primary-light)', borderRadius: '6px',
          fontSize: '0.75rem', color: 'var(--primary)'
        }}>
          <MapPin size={14}/>
          <span>Lat: {formatCoord(lat)} | Lng: {formatCoord(lng)}</span>
        </div>
      )}
    </div>
  );
};

export default MapPicker;
