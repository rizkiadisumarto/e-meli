import { motion } from 'framer-motion';
import { Music, PartyPopper } from 'lucide-react';

const IndexPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      padding: '2rem',
      fontFamily: "'Inter', system-ui, sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative dots */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(20)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: `${Math.random() * 6 + 2}px`,
            height: `${Math.random() * 6 + 2}px`,
            borderRadius: '50%',
            background: i % 2 === 0 ? '#dc2626' : '#fbbf24',
            opacity: 0.15 + Math.random() * 0.15,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }} />
        ))}
      </div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ textAlign: 'center', marginBottom: '3rem', zIndex: 1 }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🇮🇩</div>
        <h1 style={{
          fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
          fontWeight: 900,
          color: '#fff',
          margin: '0 0 0.5rem',
          letterSpacing: '-0.02em'
        }}>
          GG <span style={{ color: '#dc2626' }}>MELIMEWAH</span>
        </h1>
        <p style={{
          fontSize: 'clamp(0.8rem, 2vw, 1rem)',
          color: 'rgba(255,255,255,0.5)',
          margin: 0
        }}>
          Pilih menu yang ingin kamu buka
        </p>
      </motion.div>

      {/* Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        maxWidth: '700px',
        width: '100%',
        zIndex: 1
      }}>
        {/* Semarak Card */}
        <motion.a
          href="/semarak"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ scale: 1.03, y: -5 }}
          whileTap={{ scale: 0.98 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '2.5rem 2rem',
            borderRadius: '1.25rem',
            background: 'linear-gradient(135deg, rgba(220,38,38,0.15), rgba(220,38,38,0.05))',
            border: '1px solid rgba(220,38,38,0.3)',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'box-shadow 0.3s',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 30px rgba(220,38,38,0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'}
        >
          <div style={{
            width: '4.5rem',
            height: '4.5rem',
            borderRadius: '1rem',
            background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
            boxShadow: '0 4px 15px rgba(220,38,38,0.4)'
          }}>
            <PartyPopper size={28} color="#fff" />
          </div>
          <h2 style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            color: '#fff',
            margin: '0 0 0.5rem',
            textAlign: 'center'
          }}>
            Semarak 17 Agustus
          </h2>
          <p style={{
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.5)',
            margin: 0,
            textAlign: 'center',
            lineHeight: 1.5
          }}>
            HUT RI Ke-81 &bull; GG MELIMEWAH
          </p>
          <div style={{
            marginTop: '1.25rem',
            padding: '0.5rem 1.25rem',
            borderRadius: '9999px',
            background: 'rgba(220,38,38,0.2)',
            border: '1px solid rgba(220,38,38,0.4)',
            color: '#fca5a5',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.05em'
          }}>
            BUKA →
          </div>
        </motion.a>

        {/* Music Player Card */}
        <motion.a
          href="https://melimusic.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          whileHover={{ scale: 1.03, y: -5 }}
          whileTap={{ scale: 0.98 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '2.5rem 2rem',
            borderRadius: '1.25rem',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))',
            border: '1px solid rgba(139,92,246,0.3)',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'box-shadow 0.3s',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 30px rgba(139,92,246,0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'}
        >
          <div style={{
            width: '4.5rem',
            height: '4.5rem',
            borderRadius: '1rem',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
            boxShadow: '0 4px 15px rgba(139,92,246,0.4)'
          }}>
            <Music size={28} color="#fff" />
          </div>
          <h2 style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            color: '#fff',
            margin: '0 0 0.5rem',
            textAlign: 'center'
          }}>
            Melimewah Music
          </h2>
          <p style={{
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.5)',
            margin: 0,
            textAlign: 'center',
            lineHeight: 1.5
          }}>
            Streaming musik favorit kamu
          </p>
          <div style={{
            marginTop: '1.25rem',
            padding: '0.5rem 1.25rem',
            borderRadius: '9999px',
            background: 'rgba(139,92,246,0.2)',
            border: '1px solid rgba(139,92,246,0.4)',
            color: '#c4b5fd',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.05em'
          }}>
            BUKA →
          </div>
        </motion.a>
      </div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        style={{
          marginTop: '3rem',
          fontSize: '0.7rem',
          color: 'rgba(255,255,255,0.25)',
          zIndex: 1
        }}
      >
        © 2026 GG MELIMEWAH
      </motion.p>
    </div>
  );
};

export default IndexPage;
