import React, { useState } from 'react'
import { LayoutDashboard, Users, CircleDollarSign, ClipboardCheck, LogOut, Camera, Plus, Download, ShoppingCart, Briefcase, QrCode, MessageCircle } from 'lucide-react'
import './App.css'

// Local Assets
const JOSHUA_IMAGE = "/assets/joshua.png";
const CERTIFICATE_IMAGE = "/assets/certificate.png";

const SEDES_KEYS = [
  'Sede JL Bustamante y Rivero',
  'Sede Sachaca',
  'Sede Cerro Colorado',
  'Sede Cercado'
];

function getSedeFinanzasData(sedeId) {
  if (sedeId === 'GENERAL') {
    const allData = SEDES_KEYS.map(id => getSedeFinanzasData(id));
    return {
      ingresosHoy: allData.reduce((acc, curr) => acc + curr.ingresosHoy, 0),
      efectivoCaja: allData.reduce((acc, curr) => acc + curr.efectivoCaja, 0),
      yapePlin: allData.reduce((acc, curr) => acc + curr.yapePlin, 0),
      totalEfectivo: allData.reduce((acc, curr) => acc + curr.totalEfectivo, 0),
      totalDigital: allData.reduce((acc, curr) => acc + curr.totalDigital, 0),
      totalMes: allData.reduce((acc, curr) => acc + curr.totalMes, 0),
      rows: allData.flatMap(d => d.rows).sort((a, b) => b.dia - a.dia),
    };
  }

  const sedeMagicNumber = SEDES_KEYS.indexOf(sedeId) + 1; // 1, 2, 3, 4
  const numAlumnos = 15 + (sedeMagicNumber * 8); // Sede 1: 23, Sede 2: 31, Sede 3: 39, Sede 4: 47
  
  const alumnos = ["Carlos Ruiz", "Juan Pérez", "Ana Gómez", "Luis Fernando", "Pedro Martínez", "Maria Rojas", "Fernando Silva", "Jorge Castillo", "Diego Torres", "Lucia Méndez", "Renato Vega", "Sofia Castro", "Mateo Alva", "Camila Flores", "Andrés Ríos", "Valentina Ortiz", "Joaquín Vega", "Miguel Santos", "Andrea Nuñez", "Valeria Pinto"];
  const planes = ["Plan Premium (MMA + BJJ)", "Plan Básico (Muay Thai)", "Plan Elite (Full)", "Plan Básico (BJJ)", "Clase Suelta"];
  const precios = [180.00, 150.00, 220.00, 150.00, 30.00];
  const medios = ["Yape", "Plin", "Efectivo", "Tarjeta de Crédito"];
  
  let totalMes = 0;
  let ingresosHoy = 0;
  let efectivoCaja = 0;
  let yapePlin = 0;
  let totalEfectivo = 0;
  let totalDigital = 0;

  const rows = [...Array(numAlumnos)].map((_, i) => {
    // Better seed generation logic so each sede has completely different plans/prices
    const seed = (i + sedeMagicNumber * 13) * 997;
    const dia = 31 - Math.floor(i * (30/numAlumnos));
    
    const alumno = alumnos[seed % alumnos.length];
    const planIndex = seed % planes.length;
    const plan = planes[planIndex];
    const monto = precios[planIndex];
    const medio = medios[seed % medios.length];
    
    let recepcionista = "";
    if (sedeId === 'Sede JL Bustamante y Rivero') {
      recepcionista = i % 2 === 0 ? 'Gerson E.' : 'Carlos Ruiz';
    } else if (sedeId === 'Sede Sachaca') {
      recepcionista = i % 2 === 0 ? 'Ana Gómez' : 'Renzo';
    } else if (sedeId === 'Sede Cerro Colorado') {
      recepcionista = i % 2 === 0 ? 'Martín' : 'Joshua';
    } else {
      recepcionista = i % 2 === 0 ? 'Luis Fernando' : 'Renzo';
    }

    totalMes += monto;
    if (medio === 'Efectivo') totalEfectivo += monto;
    else totalDigital += monto;

    if (dia === 31) {
      ingresosHoy += monto;
      if (medio === 'Efectivo') efectivoCaja += monto;
      else yapePlin += monto;
    }

    return { dia, alumno, plan, monto, medio, recepcionista };
  });

  return { rows, totalMes, ingresosHoy, efectivoCaja, yapePlin, totalEfectivo, totalDigital };
}

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('page') || 'home';
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'alumno' | 'admin'
  const [adminSede, setAdminSede] = useState(null);
  const [showExam, setShowExam] = useState(false);
  const [examPassed, setExamPassed] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showSedesModal, setShowSedesModal] = useState(false);
  const [showAlumnoLogin, setShowAlumnoLogin] = useState(false);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminType, setAdminType] = useState('encargado'); // 'encargado' | 'fundador'

  const navItems = [
    { id: 'home', label: 'Inicio' },
    { id: 'sedes', label: 'Nuestras Sedes' },
    { id: 'membership', label: 'Membresías' },
    { id: 'videos', label: 'Contenido Premium' },
  ];

  return (
    <div className="app">
      {currentPage !== 'adminDashboard' && currentPage !== 'acc-interno' && (
        <Navbar 
          items={navItems} 
          active={currentPage} 
          onChange={setCurrentPage} 
          isLoggedIn={isLoggedIn}
          onLoginClick={() => isLoggedIn ? setCurrentPage(userRole === 'admin' ? 'adminDashboard' : 'dashboard') : setShowRoleModal(true)}
        />
      )}
      
      <main>
        {currentPage === 'home' && <Hero onStart={() => setCurrentPage('membership')} />}
        {currentPage === 'sedes' && <Sedes />}
        {currentPage === 'membership' && <Memberships onSelect={() => { setIsLoggedIn(true); setCurrentPage('dashboard'); }} />}
        {currentPage === 'videos' && <VideoLibrary />}
        {currentPage === 'acc-interno' && <AccInterno />}
        {currentPage === 'dashboard' && (
          <Dashboard 
            onTakeExam={() => setShowExam(true)} 
            examPassed={examPassed}
          />
        )}
        {currentPage === 'adminDashboard' && (
          <AdminDashboard 
            sede={adminSede} 
            type={adminType}
            onLogout={() => {
              setIsLoggedIn(false);
              setUserRole(null);
              setCurrentPage('home');
            }}
          />
        )}
      </main>

      {showExam && (
        <ExamModal 
          onClose={() => setShowExam(false)} 
          onPass={() => { setExamPassed(true); setShowExam(false); }} 
        />
      )}

      {showRoleModal && (
        <RoleSelectionModal 
          onClose={() => setShowRoleModal(false)}
          onSelectAlumno={() => {
            setShowRoleModal(false);
            setShowAlumnoLogin(true);
          }}
          onSelectAdmin={() => {
            setShowRoleModal(false);
            setShowAdminAuth(true);
          }}
        />
      )}

      {showAlumnoLogin && (
        <AlumnoLoginModal 
          onClose={() => setShowAlumnoLogin(false)}
          onLogin={() => {
            setIsLoggedIn(true);
            setUserRole('alumno');
            setCurrentPage('dashboard');
            setShowAlumnoLogin(false);
          }}
        />
      )}

      {showAdminAuth && (
        <AdminAuthModal 
          onClose={() => setShowAdminAuth(false)}
          onAuthSuccess={(type) => {
            setAdminType(type);
            setShowAdminAuth(false);
            setShowSedesModal(true);
          }}
        />
      )}

      {showSedesModal && (
        <SedesAdminModal 
          onClose={() => setShowSedesModal(false)}
          onSelectSede={(sede) => {
            setIsLoggedIn(true);
            setUserRole('admin');
            setAdminSede(sede);
            setCurrentPage('adminDashboard');
            setShowSedesModal(false);
          }}
        />
      )}

      {currentPage !== 'adminDashboard' && currentPage !== 'acc-interno' && <Footer />}
    </div>
  )
}

function Navbar({ items, active, onChange, isLoggedIn, onLoginClick }) {
  return (
    <nav className="navbar" style={{ backgroundColor: '#000000', borderBottom: '1px solid #111' }}>
      <div className="container nav-content">
        <div className="logo" onClick={() => onChange('home')} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          <img src="/newlogo.png" alt="ACC Logo" style={{ height: '75px', width: 'auto', borderRadius: '6px' }} />
        </div>
        <ul className="nav-links">
          {items.map(item => (
            <li 
              key={item.id} 
              className={active === item.id ? 'active' : ''}
              onClick={() => onChange(item.id)}
            >
              {item.label}
            </li>
          ))}
        </ul>
        <div className="nav-auth" style={{ display: 'flex', gap: '10px' }}>
          <button className="btn" style={{ background: '#ff0000', color: 'white', border: 'none' }} onClick={() => window.open('?page=acc-interno', '_blank')}>
            ACC INTERNO
          </button>
          <button className="btn btn-primary" onClick={onLoginClick}>
            {isLoggedIn ? 'Mi Cuenta' : 'Ingresar'}
          </button>
        </div>
      </div>
    </nav>
  )
}

function Hero({ onStart }) {
  return (
    <section className="section hero">
      <div className="hero-overlay"></div>
      <div className="container hero-content fade-in">
        <div className="hero-text">
          <h1 className="hero-main-title">Arequipa <br /><span>Combat Club</span></h1>
          <p>La academia líder en artes marciales. Entrena con los mejores, accede a contenido exclusivo y certificaciones oficiales.</p>
          <div className="hero-btns">
            <button className="btn btn-primary" onClick={onStart}>Comenzar Ahora</button>
            <button className="btn btn-outline">Ver Programas</button>
          </div>
        </div>
      </div>
    </section>
  )
}

function CulqiCheckoutModal({ plan, onClose, onPay }) {
  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-content" style={{ background: '#fff', color: '#333', maxWidth: '400px', borderRadius: '10px', padding: '0', position: 'relative' }}>
        <div style={{ background: '#f5f5f5', padding: '15px 20px', borderTopLeftRadius: '10px', borderTopRightRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <img src="/newlogo.png" alt="ACC Logo" style={{ height: '30px', filter: 'invert(1)' }} />
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{plan.price}</div>
        </div>
        <div style={{ padding: '20px' }}>
          <h4 style={{ margin: '0 0 15px 0' }}>Estás pagando: Plan {plan.title}</h4>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', color: '#666', textAlign: 'left' }}>Número de Tarjeta</label>
            <input type="text" placeholder="0000 0000 0000 0000" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', color: '#666', textAlign: 'left' }}>Vencimiento</label>
              <input type="text" placeholder="MM/AA" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', color: '#666', textAlign: 'left' }}>CVV</label>
              <input type="password" placeholder="123" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '5px', color: '#666', textAlign: 'left' }}>Correo Electrónico</label>
            <input type="email" placeholder="tucorreo@ejemplo.com" style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }} />
          </div>
          
          <button onClick={() => { alert('Pago Procesado por Culqi exitosamente'); onPay(); }} style={{ width: '100%', background: '#ff4d4f', color: '#fff', border: 'none', padding: '15px', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
            Pagar {plan.price}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '11px', color: '#999', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
            🔒 Pago Seguro procesado por <strong>Culqi</strong>
          </div>
        </div>
        <button onClick={onClose} style={{ position: 'absolute', top: '-15px', right: '-15px', background: '#333', color: '#fff', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
      </div>
    </div>
  )
}

function Memberships({ onSelect }) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    { title: 'Básico', price: 'S/ 99', features: ['Acceso al Gimnasio', 'Clases Grupales', 'Perfil Digital'], color: '#fff', bg: '/assets/plan_basic.png' },
    { title: 'Premium', price: 'S/ 149', features: ['Todo lo Básico', 'Videos de Joshua', 'Exámenes Online', 'Certificados'], color: '#ff0000', popular: true, bg: '/assets/plan_premium.png' },
    { title: 'Elite', price: 'S/ 249', features: ['Todo lo Premium', 'Clases 1 a 1', 'Plan Nutricional', 'Soporte 24/7'], color: '#ffd700', bg: '/assets/plan_elite.png' },
  ];

  return (
    <section className="section memberships">
      <div className="container">
        <div className="section-header">
          <h2>Elige tu Membresía</h2>
          <p>Niveles diseñados para tu progreso y éxito</p>
        </div>
        <div className="plans-grid">
          {plans.map((plan, i) => (
            <div 
              key={i} 
              className={`plan-card glass ${plan.popular ? 'popular' : ''}`}
              style={{ '--bg-img': `url(${plan.bg})` }}
            >
              <div className="plan-bg-overlay"></div>
              {plan.popular && <div className="popular-badge">MÁS POPULAR</div>}
              <h3>{plan.title}</h3>
              <div className="price">{plan.price}<span>/mes</span></div>
              <ul>
                {plan.features.map((f, j) => <li key={j}>✓ {f}</li>)}
              </ul>
              <button className="btn btn-primary" onClick={() => { setSelectedPlan(plan); setShowCheckout(true); }}>Seleccionar Plan</button>
            </div>
          ))}
        </div>
      </div>
      {showCheckout && <CulqiCheckoutModal plan={selectedPlan} onClose={() => setShowCheckout(false)} onPay={onSelect} />}
    </section>
  )
}

function VideoLibrary() {
  const videos = [
    { title: 'Fundamentos de Muay Thai', instructor: 'Joshua Fernández', thumb: '/assets/thumb_muay.png' },
    { title: 'Técnicas de Sumisión BJJ', instructor: 'Joshua Fernández', thumb: '/assets/thumb_bjj.png' },
    { title: 'Acondicionamiento Físico', instructor: 'Joshua Fernández', thumb: '/assets/thumb_fitness.png' },
    { title: 'Estrategia de Combate', instructor: 'Joshua Fernández', thumb: '/assets/thumb_strategy.png' },
  ];

  return (
    <section className="section videos">
      <div className="container">
        <div className="section-header">
          <h2>Contenido Premium</h2>
          <p>Aprende de Joshua "El León" Fernández desde cualquier lugar</p>
        </div>
        <div className="video-grid">
          {videos.map((v, i) => (
            <div key={i} className="video-card glass">
              <div className="video-thumb-container">
                <img src={v.thumb} alt={v.title} className="video-thumb-img" />
              </div>
              <div className="video-info">
                <h4>{v.title}</h4>
                <p>{v.instructor}</p>
                <button className="btn-play">▶ Ver Ahora</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Sedes() {
  const sedes = [
    { name: 'Sede Yanahuara', address: 'Av. Ejército 123, Yanahuara', img: '/assets/yanahuara.png' },
    { name: 'Sede Cayma', address: 'Calle Los Arboles 456, Cayma', img: '/assets/cayma.png' },
    { name: 'Sede JL Bustamante', address: 'Av. Dolores 789, Bustamante', img: '/assets/bustamante.png' },
  ];

  return (
    <section className="section sedes">
      <div className="container">
        <div className="section-header">
          <h2>Nuestras Sedes en Arequipa</h2>
          <p>Entrena en la sede más cercana a ti con la mejor infraestructura</p>
        </div>
        <div className="sedes-grid">
          {sedes.map((s, i) => (
            <div key={i} className="sede-card glass">
              <div className="sede-img-container">
                <img src={s.img} alt={s.name} className="sede-img" />
              </div>
              <div className="sede-info">
                <h3>{s.name}</h3>
                <p>{s.address}</p>
                <button className="btn btn-outline">Ver en Mapa</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Dashboard({ onTakeExam, examPassed }) {
  return (
    <section className="section dashboard">
      <div className="container">
        <div className="dashboard-grid">
          <div className="profile-sidebar glass">
            <div className="avatar">👤</div>
            <h3>Gerson Enríquez</h3>
            <p>Rango: {examPassed ? 'Cinta Morada' : 'Cinta Azul'}</p>
            <div className="progress-container">
              <p>Avance hacia {examPassed ? 'Cinta Marrón' : 'Cinta Morada'}</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: examPassed ? '10%' : '85%'}}></div>
              </div>
              <span>{examPassed ? '10%' : '85%'} Completado</span>
            </div>
          </div>
          <div className="main-content glass">
            <h2>Mis Avances y Resultados</h2>
            <div className="stats-row">
              <div className="mini-stat"><h4>15</h4><p>Clases este mes</p></div>
              <div className="mini-stat"><h4>{examPassed ? 4 : 3}</h4><p>Exámenes aprobados</p></div>
              <div className="mini-stat"><h4>{examPassed ? 2 : 1}</h4><p>Certificados</p></div>
            </div>
            <div className="next-steps">
              <h3>{examPassed ? '¡Felicidades por tu nuevo grado!' : 'Próximo Objetivo: Examen de Técnica'}</h3>
              <p>{examPassed ? 'Has desbloqueado nuevas técnicas avanzadas.' : '¡Estás listo! Haz cumplido con las clases requeridas.'}</p>
              <div className="dashboard-actions">
                {!examPassed && <button className="btn btn-primary" onClick={onTakeExam}>Tomar Examen Ahora</button>}
                <button className="btn btn-outline" onClick={() => window.open(CERTIFICATE_IMAGE)}>Ver Último Certificado</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function AdminDashboard({ sede, type, onLogout }) {
  const [activeTab, setActiveTab] = useState('menu');
  const [finanzasSede, setFinanzasSede] = useState(null);
  const isFundador = type === 'fundador';

  const menuItems = [
    { id: 'overview', bg: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=500&auto=format&fit=crop', title: 'Resumen Global', desc: 'Estadísticas, finanzas y rendimiento' },
    { id: 'alumnos', bg: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=500&auto=format&fit=crop', title: 'Alumnos & Acceso', desc: 'Torniquete virtual y seguimiento CRM' },
    { id: 'pos', bg: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=500&auto=format&fit=crop', title: 'Tienda (POS)', desc: 'Punto de venta e inventario' },
    { id: 'personal', bg: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=500&auto=format&fit=crop', title: 'Profesores', desc: 'Control de asistencia y planillas' },
    { id: 'finanzas', bg: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=500&auto=format&fit=crop', title: 'Finanzas', desc: 'Arqueo diario y cierre de caja' },
    { id: 'eventos', bg: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=500&auto=format&fit=crop', title: 'Fight Team', desc: 'Eventos y récord de peleadores' }
  ];

  return (
    <div className="admin-layout-top">
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <img src="/newlogo.png" alt="ACC Logo" style={{ height: '50px', width: 'auto', borderRadius: '4px', marginRight: '20px' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="admin-logo-text">{isFundador ? 'PANEL DE FUNDADOR' : 'PANEL ADMINISTRATIVO'}</span>
            <span className="admin-sede-badge-top">Sede {sede}</span>
          </div>
        </div>
        
        <nav className="admin-nav-top">
          {activeTab !== 'menu' && (
            <button className="active" onClick={() => { setActiveTab('menu'); setFinanzasSede(null); }} style={{ background: '#ff0000', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', fontWeight: 'bold' }}>
              ← Volver al Menú Principal
            </button>
          )}
        </nav>

        <div className="admin-topbar-right">
          <div className="admin-user-profile-top">
            <span style={{ fontSize: '12px', color: 'var(--text-dim)', marginRight: '10px', textTransform: 'uppercase' }}>{isFundador ? 'Fundador' : 'Admin'}</span>
            <div className="avatar-small" style={{background: isFundador ? '#ffd700' : 'var(--accent-color)', color: isFundador ? '#000' : '#fff', marginRight: '15px'}}>
              {isFundador ? 'F' : 'A'}
            </div>
          </div>
          <button className="admin-logout-top" onClick={onLogout}><LogOut size={18} /></button>
        </div>
      </header>

      <main className="admin-main-full">
        {activeTab !== 'menu' && (
          <header className="admin-header-simple">
            <h2>
              {activeTab === 'overview' && 'Centro de Comando Multisede'}
              {activeTab === 'alumnos' && 'Control de Acceso y CRM'}
              {activeTab === 'pos' && 'Punto de Venta e Inventario (Tienda)'}
              {activeTab === 'personal' && 'Gestión de Coaches y Personal'}
              {activeTab === 'finanzas' && 'Arqueo de Caja y Finanzas'}
              {activeTab === 'eventos' && 'Gestión de Campeonatos y Fight Team'}
            </h2>
          </header>
        )}

        <div className="admin-content">
          {activeTab === 'menu' && (
            <div style={{ padding: '40px 20px' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '28px', color: 'white', textTransform: 'uppercase', letterSpacing: '2px' }}>Selecciona un Módulo</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', maxWidth: '1000px', margin: '0 auto' }}>
                {menuItems.map(item => (
                  <div 
                    key={item.id} 
                    className="admin-card glass" 
                    style={{ 
                      cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s ease',
                      position: 'relative', overflow: 'hidden', height: '280px',
                      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '30px 20px',
                      border: '1px solid var(--glass-border)'
                    }}
                    onClick={() => setActiveTab(item.id)}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = '#ff0000'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                  >
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `url(${item.bg})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }}></div>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(0,0,0,1) 10%, rgba(0,0,0,0.3) 100%)', zIndex: 1 }}></div>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                      <h3 style={{ margin: '0 0 10px 0', color: 'white', fontSize: '24px', textTransform: 'uppercase' }}>{item.title}</h3>
                      <p style={{ margin: '0 0 20px 0', color: '#ccc', fontSize: '15px' }}>{item.desc}</p>
                      <button className="btn btn-outline" style={{ width: '100%', borderColor: 'white', color: 'white' }}>Abrir Módulo</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'overview' && (
            <>
              {isFundador && (
                <div className="admin-card glass" style={{ marginBottom: '30px', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0 }}>Vista Global: Selecciona una Sede</h3>
                  <select style={{ padding: '8px 15px', background: '#111', color: 'white', border: '1px solid #333', borderRadius: '4px' }}>
                    <option>Todas las Sedes (Consolidado)</option>
                    <option>Sede Cerro Colorado</option>
                    <option>Sede Vallecito</option>
                    <option>Sede Cayma</option>
                    <option>Sede Mall Aventura</option>
                  </select>
                </div>
              )}
              <div className="stats-row" style={{ margin: '0 0 30px 0' }}>
                <div className="mini-stat"><h4>{isFundador ? '489' : '124'}</h4><p>Alumnos Activos</p></div>
                <div className="mini-stat" style={{ borderBottom: '2px solid #00ff00' }}><h4>{isFundador ? '142' : '35'}</h4><p>Entrenando Ahora (En vivo)</p></div>
                <div className="mini-stat"><h4>{isFundador ? 'S/ 24,500' : 'S/ 5,400'}</h4><p>Ingresos del Mes</p></div>
                <div className="mini-stat"><h4>{isFundador ? '3' : '1'}</h4><p>Alertas de Stock Tienda</p></div>
              </div>

              {/* FINANZAS EN GENERAL */}
              <div className="admin-grid-2" style={{ marginBottom: '30px' }}>
                <div className="admin-card glass" style={{ gridColumn: 'span 2' }}>
                  <h3 style={{ margin: '0 0 15px 0', color: 'white' }}>Finanzas en General (Consolidado de Sedes)</h3>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left' }}>Sede</th>
                          <th>Efectivo (Mes)</th>
                          <th>Digital (Mes)</th>
                          <th>Ingreso Total (Mes)</th>
                          <th>Estado de Caja Hoy</th>
                        </tr>
                      </thead>
                      <style>{`
                        .admin-table th, .admin-table td {
                          padding: 12px 15px;
                          border-bottom: 1px solid var(--glass-border);
                        }
                      `}</style>
                      <tbody style={{ textAlign: 'center' }}>
                        {SEDES_KEYS.map(sedeId => {
                           const d = getSedeFinanzasData(sedeId);
                           return (
                             <tr key={sedeId}>
                               <td style={{ textAlign: 'left' }}>{sedeId}</td>
                               <td>S/ {d.totalEfectivo.toFixed(2)}</td>
                               <td>S/ {d.totalDigital.toFixed(2)}</td>
                               <td style={{ fontWeight: 'bold', color: '#00ff00' }}>S/ {d.totalMes.toFixed(2)}</td>
                               <td><span className="badge warning">Turno Abierto</span></td>
                             </tr>
                           )
                        })}
                        <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <td style={{ textAlign: 'left', fontWeight: 'bold' }}>TOTAL GENERAL</td>
                          <td style={{ fontWeight: 'bold' }}>S/ {getSedeFinanzasData('GENERAL').totalEfectivo.toFixed(2)}</td>
                          <td style={{ fontWeight: 'bold' }}>S/ {getSedeFinanzasData('GENERAL').totalDigital.toFixed(2)}</td>
                          <td style={{ color: '#00ff00', fontSize: '18px', fontWeight: 'bold' }}>S/ {getSedeFinanzasData('GENERAL').totalMes.toFixed(2)}</td>
                          <td>-</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="admin-card glass" style={{ overflowX: 'auto' }}>
                <h3>Rendimiento Financiero por Alumno (2026)</h3>
                <p>Historial de mensualidades pagadas y total generado por estudiante.</p>
                <table className="admin-table" style={{ minWidth: '800px', fontSize: '14px', textAlign: 'center' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>Alumno</th>
                      <th>Ene</th>
                      <th>Feb</th>
                      <th>Mar</th>
                      <th>Abr</th>
                      <th>May</th>
                      <th>Jun</th>
                      <th>Jul</th>
                      <th>Ago</th>
                      <th>Sep</th>
                      <th>Oct</th>
                      <th>Nov</th>
                      <th>Dic</th>
                      <th style={{ color: 'var(--accent-color)', textAlign: 'right' }}>Total Generado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 'bold', textAlign: 'left' }}>Gerson Enríquez</td>
                      <td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>⏳</td><td>⏳</td>
                      <td style={{ fontWeight: 'bold', textAlign: 'right' }}>S/ 1,490</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold', textAlign: 'left' }}>Juan Pérez</td>
                      <td>✅</td><td>✅</td><td>❌</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>⏳</td><td>⏳</td><td>⏳</td>
                      <td style={{ fontWeight: 'bold', textAlign: 'right' }}>S/ 1,192</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold', textAlign: 'left' }}>María López</td>
                      <td>-</td><td>-</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>⏳</td><td>⏳</td>
                      <td style={{ fontWeight: 'bold', textAlign: 'right' }}>S/ 792</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold', textAlign: 'left' }}>Carlos Ruiz</td>
                      <td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>❌</td><td>❌</td><td>✅</td><td>✅</td><td>✅</td><td>❌</td><td>⏳</td><td>⏳</td>
                      <td style={{ fontWeight: 'bold', textAlign: 'right' }}>S/ 693</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold', textAlign: 'left' }}>Ana Gómez</td>
                      <td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td><td>❌</td><td>-</td><td>-</td><td>-</td><td>-</td>
                      <td style={{ fontWeight: 'bold', textAlign: 'right' }}>S/ 1,743</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'alumnos' && (
            <div className="admin-grid-2">
              <div className="admin-card glass" style={{ gridColumn: 'span 2' }}>
                <div className="admin-card-header" style={{ marginBottom: '10px' }}>
                  <h3>Control de Acceso (Torniquete Virtual)</h3>
                  <button className="btn btn-primary flex-btn">Escanear QR (Lector Activo)</button>
                </div>
                <p style={{ color: 'var(--text-dim)', marginBottom: '20px' }}>Los alumnos acercan su código QR en recepción. El sistema valida si pueden ingresar a entrenar.</p>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1, padding: '15px', background: 'rgba(0,255,0,0.1)', border: '1px solid #00ff00', borderRadius: '8px', textAlign: 'center' }}>
                    <h4 style={{ color: '#00ff00', margin: '0 0 5px 0' }}>✅ ACCESO PERMITIDO</h4>
                    <p style={{ margin: 0, fontSize: '14px' }}>Luis Fernando (Plan Premium) - Ingresó 09:30 AM</p>
                  </div>
                  <div style={{ flex: 1, padding: '15px', background: 'rgba(255,0,0,0.1)', border: '1px solid #ff0000', borderRadius: '8px', textAlign: 'center' }}>
                    <h4 style={{ color: '#ff0000', margin: '0 0 5px 0' }}>❌ ACCESO DENEGADO</h4>
                    <p style={{ margin: 0, fontSize: '14px' }}>Ana Gómez (Vencido) - 09:15 AM</p>
                  </div>
                </div>
              </div>

              <div className="admin-card glass" style={{ gridColumn: 'span 2' }}>
                <div className="admin-card-header">
                  <h3>CRM: Seguimiento de Alumnos</h3>
                  <button className="btn btn-outline flex-btn">Nueva Clase de Prueba</button>
                </div>
                <table className="admin-table">
                  <thead><tr><th>Nombre</th><th>Plan / Grado</th><th>Última Asistencia</th><th>Estado</th><th>Acción (CRM)</th></tr></thead>
                  <tbody>
                    <tr><td>Gerson Enríquez</td><td>Premium (Cinta Azul)</td><td>Hoy</td><td><span className="badge success">Activo</span></td><td><button className="btn-small">Ver Perfil</button></td></tr>
                    <tr><td>Carlos Ruiz</td><td>Básico (Blanca)</td><td>Ayer</td><td><span className="badge warning">Vence Mañana</span></td><td><button className="btn-small">Renovar</button></td></tr>
                    <tr><td>Ana Gómez</td><td>Elite (Morada)</td><td>Hace 14 días</td><td><span className="badge danger">Inactivo</span></td><td><button className="btn-small" style={{ background: '#25D366', color: 'white', border: 'none' }}>Escribir WhatsApp</button></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'pos' && (
            <div className="admin-card glass">
              <div className="admin-card-header">
                <h3>Venta Rápida y Tienda ACC</h3>
                <button className="btn btn-primary flex-btn">Nueva Venta</button>
              </div>
              <p style={{ color: 'var(--text-dim)' }}>Gestión de inventario de agua, ropa deportiva y accesorios.</p>
              <div className="admin-grid-2" style={{ marginTop: '20px' }}>
                <div className="upload-box" style={{ padding: '15px', border: '1px dashed var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px' }}>Agua Mineral (Botella 500ml)</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-dim)' }}>Stock actual: 45 und</p>
                  </div>
                  <button className="btn-small" style={{ background: 'var(--accent-color)', color: 'white', border: 'none' }}>Vender (S/ 2.50)</button>
                </div>
                <div className="upload-box" style={{ padding: '15px', border: '1px dashed #ff0000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px' }}>Polos ACC (Talla L)</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#ff0000' }}>Stock crítico: 2 und</p>
                  </div>
                  <button className="btn-small" style={{ background: 'var(--accent-color)', color: 'white', border: 'none' }}>Vender (S/ 45.00)</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'personal' && (
            <div className="admin-card glass">
              <div className="admin-card-header">
                <h3>Control de Asistencia y Planillas de Coaches</h3>
                <button className="btn btn-outline flex-btn">Nuevo Entrenador</button>
              </div>
              <table className="admin-table mt-4">
                <thead><tr><th>Profesor</th><th>Disciplina</th><th>Turno de Hoy</th><th>Asistencia</th><th>Sueldo Acumulado</th></tr></thead>
                <tbody>
                  <tr><td>Renzo "El Depredador"</td><td>MMA & Grappling</td><td>17:00 - 21:00</td><td><span className="badge success">Presente (16:55)</span></td><td>S/ 450.00</td></tr>
                  <tr><td>Martín "Tiburón"</td><td>Muay Thai</td><td>07:00 - 10:00</td><td><span className="badge success">Terminó Turno</span></td><td>S/ 300.00</td></tr>
                  <tr><td>Joshua (Reemplazo)</td><td>Jiu Jitsu</td><td>19:00 - 21:00</td><td><span className="badge warning">Pendiente</span></td><td>S/ 50.00</td></tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'finanzas' && (
            <>
              {!finanzasSede && (
                <div style={{ padding: '20px' }}>
                  <h2 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '24px', color: 'white', textTransform: 'uppercase', letterSpacing: '1px' }}>Selecciona una Sede para ver Finanzas</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', maxWidth: '1000px', margin: '0 auto' }}>
                    {[
                      { id: 'GENERAL', title: 'RESUMEN GENERAL (TODAS LAS SEDES)', bg: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1000', span: 4 },
                      { id: 'Sede JL Bustamante y Rivero', title: 'Jose Luis Bustamante y Rivero', bg: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=500', span: 2 },
                      { id: 'Sede Sachaca', title: 'Sachaca', bg: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=500', span: 2 },
                      { id: 'Sede Cerro Colorado', title: 'Cerro Colorado', bg: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=500', span: 2 },
                      { id: 'Sede Cercado', title: 'Cercado', bg: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=500', span: 2 }
                    ].map(s => (
                      <div 
                        key={s.id} 
                        className="admin-card glass" 
                        style={{ 
                          gridColumn: `span ${s.span}`,
                          cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s ease',
                          position: 'relative', overflow: 'hidden', height: '220px',
                          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                          border: '1px solid var(--glass-border)'
                        }}
                        onClick={() => setFinanzasSede(s.id)}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.borderColor = '#ff0000'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                      >
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `url(${s.bg})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0 }}></div>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1 }}></div>
                        <h3 style={{ position: 'relative', zIndex: 2, color: 'white', margin: 0, fontSize: '22px', textTransform: 'uppercase' }}>{s.title}</h3>
                        <p style={{ position: 'relative', zIndex: 2, color: 'var(--accent-color)', margin: '10px 0 0 0', fontWeight: 'bold' }}>Ver Arqueos →</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {finanzasSede && (
                <div className="admin-grid-2">
                  <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <button className="btn btn-outline" onClick={() => setFinanzasSede(null)} style={{ marginRight: '20px' }}>← Volver a Sedes</button>
                    <h2 style={{ margin: 0, color: 'white' }}>Finanzas: {finanzasSede}</h2>
                  </div>
                  
                  <div className="admin-card glass" style={{ gridColumn: 'span 2' }}>
                    <div className="admin-card-header">
                      <h3>Caja Diaria (Hoy)</h3>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn btn-outline flex-btn">Descargar Reporte</button>
                        <button className="btn btn-primary flex-btn">Cerrar Caja</button>
                      </div>
                    </div>
                    <div className="finance-grid" style={{ marginBottom: '15px' }}>
                      <div className="finance-box success">Ingresos Hoy: <span>S/ {getSedeFinanzasData(finanzasSede).ingresosHoy.toFixed(2)}</span></div>
                      <div className="finance-box" style={{ border: '1px solid #333' }}>Efectivo en Caja: <span>S/ {getSedeFinanzasData(finanzasSede).efectivoCaja.toFixed(2)}</span></div>
                      <div className="finance-box" style={{ border: '1px solid #1c2b4c' }}>Yape/Plin/POS: <span>S/ {getSedeFinanzasData(finanzasSede).yapePlin.toFixed(2)}</span></div>
                    </div>
                    <p style={{ color: 'var(--text-dim)', fontSize: '13px', margin: 0 }}>* El encargado debe realizar el Cuadre de Caja al cerrar la sede. Las diferencias se reportan al Fundador.</p>
                  </div>

                  <div className="admin-card glass" style={{ gridColumn: 'span 2' }}>
                    <div className="admin-card-header">
                      <h3>Registro de Ingresos (Mensualidades) - Octubre 2026</h3>
                    </div>
                    <div style={{ maxHeight: '500px', overflowY: 'auto', marginTop: '15px', paddingRight: '5px' }}>
                      <table className="admin-table">
                        <thead style={{ position: 'sticky', top: 0, background: '#111', zIndex: 1, boxShadow: '0 2px 5px rgba(0,0,0,0.5)' }}>
                          <tr>
                            <th>Fecha</th>
                            <th>Alumno</th>
                            <th>Plan (Mensualidad)</th>
                            <th>Medio de Pago</th>
                            <th>Monto Ingresado</th>
                            <th>Recepcionista</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const data = getSedeFinanzasData(finanzasSede);
                            return (
                              <>
                                {data.rows.map((r, i) => (
                                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td>{r.dia.toString().padStart(2, '0')} / 10 / 2026</td>
                                    <td>{r.alumno}</td>
                                    <td>{r.plan}</td>
                                    <td><span className={`badge ${r.medio === 'Efectivo' ? 'warning' : 'success'}`}>{r.medio}</span></td>
                                    <td style={{ fontWeight: 'bold', color: '#00ff00' }}>S/ {r.monto.toFixed(2)}</td>
                                    <td style={{ color: 'var(--text-dim)' }}>{r.recepcionista}</td>
                                  </tr>
                                ))}
                                <tr style={{ background: 'rgba(255,255,255,0.08)' }}>
                                  <td colSpan="4" style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '18px', paddingRight: '20px' }}>TOTAL DEL MES:</td>
                                  <td style={{ fontWeight: 'bold', color: '#00ff00', fontSize: '20px' }}>S/ {data.totalMes.toFixed(2)}</td>
                                  <td></td>
                                </tr>
                              </>
                            );
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'eventos' && (
            <div className="admin-grid-2">
              <div className="admin-card glass" style={{ gridColumn: 'span 2' }}>
                <div className="admin-card-header" style={{ marginBottom: '10px' }}>
                  <h3>Récord de Peleadores Inscritos (Fight Team)</h3>
                  <button className="btn btn-primary flex-btn">Inscribir Peleador</button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table" style={{ minWidth: '900px' }}>
                    <thead>
                      <tr>
                        <th>Peleador</th>
                        <th>Nivel (Cinturón)</th>
                        <th>Categoría (Peso)</th>
                        <th>Disciplina</th>
                        <th>Récord (V-D-E)</th>
                        <th>Próximo Evento</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td>Luis "La Máquina" Silva</td><td><span className="badge" style={{background: '#000', color: '#fff'}}>Negro</span></td><td>70 kg (Ligero)</td><td>MMA</td><td><span className="badge success">12-2-0</span></td><td>Arequipa Fight League 8</td></tr>
                      <tr><td>Mateo Torres</td><td><span className="badge" style={{background: '#0000cd', color: '#fff'}}>Azul</span></td><td>61 kg (Gallo)</td><td>Muay Thai</td><td><span className="badge warning">2-2-0</span></td><td>Copa del Sur</td></tr>
                      <tr><td>Diego Cáceres</td><td><span className="badge" style={{background: '#654321', color: '#fff'}}>Marrón</span></td><td>84 kg (Medio)</td><td>Jiu Jitsu (No-Gi)</td><td><span className="badge success">8-0-0</span></td><td>Open Arequipa BJJ</td></tr>
                      <tr><td>Valeria "La Fiera" Pinto</td><td><span className="badge" style={{background: '#000', color: '#fff'}}>Negro</span></td><td>57 kg (Mosca)</td><td>MMA</td><td><span className="badge success">9-1-0</span></td><td>UFC Contender (Pruebas)</td></tr>
                      <tr><td>Carlos Ruiz</td><td><span className="badge" style={{background: '#0000cd', color: '#fff'}}>Azul</span></td><td>77 kg (Wélter)</td><td>MMA</td><td><span className="badge warning">4-3-0</span></td><td>Arequipa Fight League 8</td></tr>
                      <tr><td>Renzo "Destructor"</td><td><span className="badge" style={{background: '#654321', color: '#fff'}}>Marrón</span></td><td>93 kg (Semi-Pesado)</td><td>Muay Thai</td><td><span className="badge success">15-4-0</span></td><td>Inka FC</td></tr>
                      <tr><td>Ana Gómez</td><td><span className="badge" style={{background: '#0000cd', color: '#fff'}}>Azul</span></td><td>52 kg (Paja)</td><td>Jiu Jitsu (Gi)</td><td><span className="badge success">5-0-0</span></td><td>Open Arequipa BJJ</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="admin-card glass" style={{ gridColumn: 'span 2' }}>
                <div className="admin-card-header">
                  <h3>Beneficios y Descuentos Exclusivos (Atletas Fight Team)</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '15px' }}>
                  <div style={{ padding: '15px', border: '1px solid #0000cd', borderRadius: '8px', background: 'rgba(0,0,205,0.05)' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#66b2ff' }}>🔵 Cinta Azul</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6' }}>
                      <li><strong>20% de Descuento</strong> en Suplementos (UN, LabNutrition).</li>
                      <li>Inscripciones gratuitas a torneos internos.</li>
                      <li>Descuento del 15% en indumentaria oficial ACC.</li>
                    </ul>
                  </div>
                  <div style={{ padding: '15px', border: '1px solid #654321', borderRadius: '8px', background: 'rgba(101,67,33,0.1)' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#d2a679' }}>🟤 Cinta Marrón</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6' }}>
                      <li><strong>40% de Descuento</strong> en Suplementos y Vitaminas.</li>
                      <li>Auspicio Parcial (Pago de inscripciones a torneos nacionales).</li>
                      <li>Fisioterapia deportiva gratuita (1 sesión/mes).</li>
                      <li>Kimonos y guantes patrocinados.</li>
                    </ul>
                  </div>
                  <div style={{ padding: '15px', border: '1px solid #444', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#fff' }}>⚫ Cinta Negra</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6' }}>
                      <li><strong>Auspicio Total</strong> (Suplementos, Equipamiento, Viáticos).</li>
                      <li>Contrato oficial de representación de marcas aliadas.</li>
                      <li>Fisioterapia y nutricionista 100% cubiertos.</li>
                      <li>Porcentaje de ganancias por seminarios.</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="admin-card glass" style={{ gridColumn: 'span 2' }}>
                <div className="admin-card-header">
                  <h3>Historial de Eventos Internos y Externos</h3>
                  <button className="btn btn-outline flex-btn">Crear Evento Interno</button>
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1, padding: '15px', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 5px 0' }}>Arequipa Fight League 7 (Pasado)</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-dim)' }}>Fecha: 15 Ago 2026</p>
                    <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#00ff00' }}>✅ 4 Victorias, 1 Derrota</p>
                  </div>
                  <div style={{ flex: 1, padding: '15px', border: '1px solid var(--accent-color)', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 5px 0', color: 'var(--accent-color)' }}>Copa Interna ACC (Próximo)</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-dim)' }}>Fecha: 20 Nov 2026</p>
                    <p style={{ margin: '10px 0 0 0', fontSize: '14px' }}>32 Alumnos Inscritos</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function ExamModal({ onClose, onPass }) {
  const [step, setStep] = useState(1);
  
  return (
    <div className="modal-overlay">
      <div className="modal-content glass">
        {step === 1 && (
          <>
            <h2>Examen de Grado: Cinta Morada</h2>
            <p>Pregunta 1: ¿Cuál es la base fundamental para un derribo de doble pierna?</p>
            <div className="options">
              <button onClick={() => setStep(2)}>Cambio de nivel y explosión</button>
              <button onClick={() => alert('Incorrecto')}>Mantenerse erguido</button>
              <button onClick={() => alert('Incorrecto')}>Cerrar los ojos</button>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <h2>Examen de Grado: Cinta Morada</h2>
            <p>Pregunta 2: En BJJ, ¿cuál es la prioridad al estar en la guardia cerrada?</p>
            <div className="options">
              <button onClick={() => setStep(3)}>Control de postura y cadera</button>
              <button onClick={() => alert('Incorrecto')}>Gritar fuerte</button>
              <button onClick={() => alert('Incorrecto')}>Soltar las piernas</button>
            </div>
          </>
        )}
        {step === 3 && (
          <>
            <h2>¡Examen Aprobado!</h2>
            <p>Has demostrado maestría en los fundamentos requeridos.</p>
            <button className="btn btn-primary" onClick={onPass}>Obtener Graduación</button>
          </>
        )}
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
    </div>
  )
}

function RoleSelectionModal({ onClose, onSelectAlumno, onSelectAdmin }) {
  const roles = [
    { 
      title: 'Alumno', 
      desc: 'Accede a tus clases, avance y certificados', 
      bg: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop',
      onClick: onSelectAlumno
    },
    { 
      title: 'Administrador', 
      desc: 'Gestiona sedes, alumnos y reportes', 
      bg: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1000&auto=format&fit=crop',
      onClick: onSelectAdmin
    }
  ];

  return (
    <div className="fullscreen-modal">
      <div className="fullscreen-modal-header">
        <h2>ACCESO AL SISTEMA</h2>
        <p>Selecciona tu perfil para ingresar</p>
        <button className="close-fullscreen" onClick={onClose}>×</button>
      </div>
      <div className="sedes-fullscreen-grid">
        {roles.map((role, idx) => (
          <div 
            key={idx} 
            className="sede-fullscreen-card"
            onClick={role.onClick}
          >
            <div className="sede-fullscreen-bg" style={{ backgroundImage: `url(${role.bg})` }}></div>
            <div className="sede-fullscreen-overlay"></div>
            <div className="sede-fullscreen-content">
              <h3>{role.title}</h3>
              <p>{role.desc} →</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AlumnoLoginModal({ onClose, onLogin }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content glass login-form">
        <h2>Ingreso Alumnos</h2>
        <p>Ingresa tus credenciales para continuar</p>
        <div className="form-group">
          <input type="text" placeholder="Usuario o Correo" className="input-field" />
        </div>
        <div className="form-group">
          <input type="password" placeholder="Contraseña" className="input-field" />
        </div>
        <div className="options">
          <button className="btn btn-primary" onClick={onLogin}>Iniciar Sesión</button>
        </div>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
    </div>
  )
}

function AdminAuthModal({ onClose, onAuthSuccess }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleVerify = () => {
    if (selectedRole === 'fundador' && password === '123') {
      onAuthSuccess('fundador');
    } else if (selectedRole === 'encargado' && password === '123') {
      onAuthSuccess('encargado');
    } else {
      setError('Contraseña incorrecta. Intente de nuevo.');
    }
  }

  if (!selectedRole) {
    return (
      <div className="modal-overlay">
        <div className="modal-content glass login-form" style={{ maxWidth: '600px' }}>
          <h2>Selecciona tu Rol</h2>
          <p>¿A qué panel deseas ingresar?</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
            <div 
              onClick={() => setSelectedRole('encargado')}
              style={{
                background: 'url(https://images.unsplash.com/photo-1599058917765-a780eda07a3e?q=80&w=500) center/cover',
                height: '150px', borderRadius: '8px', cursor: 'pointer', position: 'relative', overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h3 style={{ margin: 0, color: 'white' }}>Administrador</h3>
              </div>
            </div>
            <div 
              onClick={() => setSelectedRole('fundador')}
              style={{
                background: 'url(https://images.unsplash.com/photo-1542385151-efd9000785a0?q=80&w=500) center/cover',
                height: '150px', borderRadius: '8px', cursor: 'pointer', position: 'relative', overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h3 style={{ margin: 0, color: '#ffd700' }}>Fundador</h3>
              </div>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content glass login-form">
        <h2>{selectedRole === 'fundador' ? 'Acceso de Fundador' : 'Acceso de Administrador'}</h2>
        <p>Ingresa tu clave de acceso</p>
        <div className="form-group">
          <input 
            type="password" 
            placeholder={`Clave de ${selectedRole}`} 
            className="input-field" 
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter') handleVerify(); }}
          />
        </div>
        {error && <p style={{color: 'var(--accent-color)', fontSize: '14px', marginTop: '-10px', marginBottom: '15px'}}>{error}</p>}
        <div className="options" style={{ display: 'flex', gap: '10px' }}>
          <button className="btn" style={{flex: 1, background: '#333', color: 'white'}} onClick={() => {setSelectedRole(null); setPassword(''); setError('');}}>Volver</button>
          <button className="btn btn-primary" style={{flex: 1}} onClick={handleVerify}>Verificar</button>
        </div>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
    </div>
  )
}

function SedesAdminModal({ onClose, onSelectSede }) {
  const sedesList = [
    { name: 'Jose Luis Bustamante y Rivero', bg: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop' },
    { name: 'Sachaca', bg: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1000&auto=format&fit=crop' },
    { name: 'Cerro Colorado', bg: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=1000&auto=format&fit=crop' },
    { name: 'Cercado', bg: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1000&auto=format&fit=crop' },
  ];

  return (
    <div className="fullscreen-modal">
      <div className="fullscreen-modal-header">
        <h2>SELECCIONA TU SEDE</h2>
        <p>Elige tu sede para ingresar a tu cuenta</p>
        <button className="close-fullscreen" onClick={onClose}>×</button>
      </div>
      <div className="sedes-fullscreen-grid">
        {sedesList.map((sede, idx) => (
          <div 
            key={idx} 
            className="sede-fullscreen-card"
            onClick={() => onSelectSede(sede.name)}
          >
            <div className="sede-fullscreen-bg" style={{ backgroundImage: `url(${sede.bg})` }}></div>
            <div className="sede-fullscreen-overlay"></div>
            <div className="sede-fullscreen-content">
              <h3>{sede.name}</h3>
              <p>Ingresar a esta sede →</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AccInterno() {
  const [internalTab, setInternalTab] = useState('events');
  const [selectedFighterSede, setSelectedFighterSede] = useState(null);

  const sedesList = [
    { name: 'Sede JLBYR', fullName: 'Jose Luis Bustamante y Rivero', bg: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop' },
    { name: 'Sede Sachaca', fullName: 'Sachaca', bg: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1000&auto=format&fit=crop' },
    { name: 'Sede C. Colorado', fullName: 'Cerro Colorado', bg: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=1000&auto=format&fit=crop' },
    { name: 'Sede Cercado', fullName: 'Cercado', bg: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1000&auto=format&fit=crop' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: 'white', display: 'flex', flexDirection: 'column' }}>
      
      {/* Main Navbar Estilo PFL */}
      <div style={{ background: '#000', borderBottom: '5px solid #ff0000', display: 'flex', justifyContent: 'center', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '1200px' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '15px' }}>
            <img src="/newlogo.png" alt="ACC Logo" style={{ height: '50px', cursor: 'pointer' }} onClick={() => window.location.href = '/'} />
            <span style={{ color: '#ffffff', fontSize: '36px', fontFamily: "'Bebas Neue', sans-serif", fontWeight: '900', borderLeft: '2px solid #333', paddingLeft: '15px', textTransform: 'uppercase', textShadow: '2px 2px 10px rgba(0,0,0,0.8)', lineHeight: '50px' }}>INTERNO</span>
          </div>
          <nav style={{ display: 'flex', gap: '25px', padding: '25px 0' }}>
            {[
              { id: 'events', label: 'EVENTOS' },
              { id: 'tickets', label: 'BOLETOS' },
              { id: 'fighters', label: 'PELEADORES' },
              { id: 'rankings', label: 'RANKINGS' },
              { id: 'news', label: 'NOTICIAS' },
              { id: 'where to watch', label: 'DÓNDE VER' },
              { id: 'shop', label: 'TIENDA' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => { setInternalTab(tab.id); setSelectedFighterSede(null); }} 
                style={{ 
                  background: 'none', border: 'none', 
                  color: internalTab === tab.id ? '#ff0000' : 'white', 
                  fontWeight: '900', fontSize: '15px', textTransform: 'uppercase', 
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Dynamic Hero Banners */}
      {internalTab === 'events' && (
        <>
          <div style={{ background: '#ff0000', color: 'white', padding: '10px 0', textAlign: 'center', fontWeight: 'bold', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', textTransform: 'uppercase' }}>
            <span>COPA INTERNA ACC</span>
            <span style={{ background: 'white', color: '#ff0000', padding: '3px 10px', borderRadius: '4px' }}>15d : 06h : 29m</span>
            <button style={{ background: '#000', color: 'white', border: 'none', padding: '5px 15px', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase' }}>INFO DEL EVENTO</button>
          </div>
          <div style={{ position: 'relative', height: '400px', background: 'radial-gradient(circle, rgba(150,0,0,1) 0%, rgba(10,10,10,1) 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', borderBottom: '2px solid #ff0000' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', letterSpacing: '3px', textTransform: 'uppercase', color: '#ccc' }}>Arequipa Combat Club</h3>
            <h1 style={{ margin: '10px 0', fontSize: '4.5rem', fontWeight: '900', textTransform: 'uppercase', textShadow: '2px 2px 10px rgba(0,0,0,0.8)' }}>LAST MAN STANDING</h1>
            <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: '800', color: '#ff0000', textTransform: 'uppercase' }}>VIERNES 20 DE NOVIEMBRE</h2>
            <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
              <button className="btn" style={{ background: 'transparent', border: '2px solid white', color: 'white', padding: '10px 30px', fontWeight: 'bold', fontSize: '16px' }}>VER EN VIVO</button>
              <button className="btn" style={{ background: '#ff0000', border: '2px solid #ff0000', color: 'white', padding: '10px 30px', fontWeight: 'bold', fontSize: '16px' }}>COMPRAR TICKETS</button>
            </div>
          </div>
        </>
      )}





      {internalTab === 'tickets' && (
        <div style={{ 
          position: 'relative', 
          minHeight: 'calc(100vh - 80px)', 
          background: 'linear-gradient(rgba(150,0,0,0.85), rgba(20,0,0,0.95)), url("https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=2000")', 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box' 
        }}>
          
          <h1 style={{ margin: '0 0 5px 0', fontSize: '3rem', fontWeight: '900', textTransform: 'uppercase', color: '#fff', textShadow: '0 10px 30px rgba(0,0,0,0.8)', textAlign: 'center', letterSpacing: '2px' }}>
            BOLETERÍA OFICIAL
          </h1>
          <p style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold', textShadow: '0 5px 15px rgba(0,0,0,0.8)' }}>
            Asegura tu lugar en la COPA INTERNA ACC
          </p>

          <div style={{ 
            background: '#0a0a0a', 
            borderRadius: '15px', 
            display: 'flex', 
            flexDirection: 'column', 
            width: '100%', 
            maxWidth: '450px', 
            boxShadow: '0 30px 60px rgba(0,0,0,0.9), 0 0 40px rgba(255,0,0,0.2)',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            
            {/* Ticket Header Image */}
            <div style={{ 
              height: '120px', 
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(10,10,10,1)), url("https://images.unsplash.com/photo-1593359864223-2895690b6330?auto=format&fit=crop&q=80&w=800")',
              backgroundSize: 'cover',
              backgroundPosition: 'top center',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              padding: '10px'
            }}>
              <h2 style={{ color: '#fff', margin: 0, fontSize: '1.8rem', textTransform: 'uppercase', fontWeight: '900', textShadow: '0 5px 15px rgba(0,0,0,1)' }}>
                Copa Interna
              </h2>
            </div>

            {/* Ticket Info */}
            <div style={{ padding: '0 20px 20px 20px', borderBottom: '2px dashed #333', textAlign: 'center', position: 'relative', background: '#0a0a0a' }}>
              <p style={{ color: '#aaa', fontSize: '1rem', margin: '0 0 10px 0', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Viernes 20 de Noviembre • 6:00 PM
              </p>
              <div style={{ background: 'rgba(255,0,0,0.15)', display: 'inline-block', padding: '5px 20px', borderRadius: '5px', color: '#ff0000', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '12px', border: '1px solid rgba(255,0,0,0.4)' }}>
                ENTRADA GENERAL
              </div>
            </div>

            {/* Ticket Price & Action */}
            <div style={{ padding: '20px 30px', textAlign: 'center', background: '#0a0a0a' }}>
              <div style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '3px' }}>Precio Único</div>
              <div style={{ fontSize: '4.5rem', fontWeight: '900', color: '#fff', margin: '5px 0 20px 0', lineHeight: 1, textShadow: '0 0 20px rgba(255,255,255,0.1)' }}>
                <span style={{ fontSize: '2rem', verticalAlign: 'top', color: '#ff0000', marginRight: '5px' }}>S/</span>30<span style={{ fontSize: '2rem', color: '#444' }}>.00</span>
              </div>
              
              <button style={{ 
                width: '100%', 
                padding: '15px', 
                background: '#ff0000', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                fontSize: '1.2rem', 
                fontWeight: '900', 
                cursor: 'pointer',
                textTransform: 'uppercase',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 10px 20px rgba(255,0,0,0.4)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 15px 25px rgba(255,0,0,0.5)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(255,0,0,0.4)' }}
              >
                💳 PAGAR CON TARJETA
              </button>
              
              <div style={{ marginTop: '15px', color: '#555', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                  <span style={{ fontSize: '1rem' }}>🔒</span> PAGO 100% SEGURO
                </span>
                <span>Pasarela de pagos habilitada próximamente.</span>
              </div>
            </div>
            
            {/* Fake Barcode */}
            <div style={{ height: '30px', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 40px', opacity: 0.5 }}>
              <div style={{ width: '100%', height: '20px', backgroundImage: 'repeating-linear-gradient(90deg, #fff 0, #fff 3px, transparent 3px, transparent 6px, #fff 6px, #fff 8px, transparent 8px, transparent 15px, #fff 15px, #fff 19px, transparent 19px, transparent 24px, #fff 24px, #fff 25px, transparent 25px, transparent 30px)' }}></div>
            </div>
          </div>
        </div>
      )}

      {internalTab === 'news' && (
        <div style={{ position: 'relative', height: '250px', background: 'linear-gradient(90deg, rgba(20,20,20,1) 0%, rgba(50,50,50,1) 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', borderBottom: '2px solid #555' }}>
          <h1 style={{ margin: 0, fontSize: '3.5rem', fontWeight: '900', textTransform: 'uppercase', color: '#fff' }}>ÚLTIMAS NOTICIAS</h1>
          <p style={{ color: '#aaa', fontSize: '1.2rem', marginTop: '10px' }}>Novedades, resultados y anuncios del ACC</p>
        </div>
      )}

      {internalTab === 'where to watch' && (
        <div style={{ position: 'relative', height: '250px', background: 'linear-gradient(90deg, rgba(20,20,20,1) 0%, rgba(50,50,50,1) 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', borderBottom: '2px solid #555' }}>
          <h1 style={{ margin: 0, fontSize: '3.5rem', fontWeight: '900', textTransform: 'uppercase', color: '#fff' }}>DÓNDE VER</h1>
          <p style={{ color: '#aaa', fontSize: '1.2rem', marginTop: '10px' }}>Transmisiones en vivo y PPV</p>
        </div>
      )}

      {internalTab === 'shop' && (
        <div style={{ position: 'relative', height: '250px', background: 'linear-gradient(90deg, rgba(20,20,20,1) 0%, rgba(50,50,50,1) 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', borderBottom: '2px solid #555' }}>
          <h1 style={{ margin: 0, fontSize: '3.5rem', fontWeight: '900', textTransform: 'uppercase', color: '#fff' }}>TIENDA OFICIAL</h1>
          <p style={{ color: '#aaa', fontSize: '1.2rem', marginTop: '10px' }}>Equipamiento y mercancía exclusiva del equipo</p>
        </div>
      )}

      <div style={{ padding: '50px 5%', flex: 1, width: '100%', maxWidth: '1600px', margin: '0 auto', boxSizing: 'border-box' }}>
        {internalTab === 'events' && (
          <div className="admin-grid-2">
            <div className="admin-card glass" style={{ gridColumn: 'span 2', background: '#111', border: '1px solid #222' }}>
              <div className="admin-card-header" style={{ marginBottom: '20px' }}>
                <h3 style={{ color: '#fff', textTransform: 'uppercase', margin: 0 }}>Historial de Eventos ACC</h3>
              </div>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px', padding: '20px', border: '1px solid #ff0000', background: 'rgba(255,0,0,0.05)' }}>
                  <h4 style={{ margin: '0 0 5px 0', color: '#ff0000', textTransform: 'uppercase' }}>Copa Interna ACC (Próximo)</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>Fecha: 20 Nov 2026</p>
                  <p style={{ margin: '15px 0 0 0', fontSize: '15px', fontWeight: 'bold' }}>32 Alumnos Inscritos</p>
                </div>
                <div style={{ flex: 1, minWidth: '250px', padding: '20px', border: '1px solid #333', background: '#0a0a0a' }}>
                  <h4 style={{ margin: '0 0 5px 0', textTransform: 'uppercase' }}>Arequipa Fight League 7 (Pasado)</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>Fecha: 15 Ago 2026</p>
                  <p style={{ margin: '15px 0 0 0', fontSize: '15px', color: '#00ff00', fontWeight: 'bold' }}>✅ 4 Victorias, 1 Derrota</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {internalTab === 'fighters' && !selectedFighterSede && (
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '3rem', margin: '0 0 40px 0', textTransform: 'uppercase', color: '#fff' }}>Selecciona una Sede</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '30px' }}>
              {sedesList.map(sede => (
                <div key={sede.name} 
                  onClick={() => setSelectedFighterSede(sede.name)}
                  style={{
                    height: '500px',
                    cursor: 'pointer',
                    position: 'relative',
                    clipPath: 'polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)',
                    overflow: 'hidden',
                    background: '#1a1a1a',
                    transition: 'transform 0.4s ease'
                  }}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.transform = 'translateY(-10px)';
                    const bg = e.currentTarget.querySelector('.sede-bg-hover');
                    if(bg) { bg.style.transform = 'scale(1.05)'; bg.style.filter = 'grayscale(0%) contrast(1.1)'; }
                  }}
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.transform = 'translateY(0)';
                    const bg = e.currentTarget.querySelector('.sede-bg-hover');
                    if(bg) { bg.style.transform = 'scale(1)'; bg.style.filter = 'grayscale(100%) contrast(1.2)'; }
                  }}
                >
                  <div className="sede-bg-hover" style={{ 
                    position: 'absolute', inset: 0,
                    backgroundImage: `url(${sede.bg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'grayscale(100%) contrast(1.2)',
                    transition: 'all 0.5s ease'
                  }}></div>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(10,10,10,0.5) 50%, transparent 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '30px 20px', textAlign: 'left' }}>
                    <div style={{ borderLeft: '4px solid #ff0000', paddingLeft: '15px' }}>
                      <h2 style={{ color: '#fff', margin: 0, fontSize: '36px', fontWeight: '900', textTransform: 'uppercase', lineHeight: '1.1' }}>{sede.name.replace('Sede ', '')}</h2>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {internalTab === 'fighters' && selectedFighterSede && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button onClick={() => setSelectedFighterSede(null)} style={{ background: 'transparent', border: '1px solid #555', color: '#fff', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  ← VOLVER A SEDES
                </button>
                <h2 style={{ textTransform: 'uppercase', color: '#fff', margin: 0, borderLeft: '5px solid #ff0000', paddingLeft: '15px' }}>Roster Oficial - {selectedFighterSede}</h2>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <span style={{ color: '#ff0000', fontWeight: 'bold', cursor: 'pointer', borderBottom: '2px solid #ff0000' }}>ALL</span>
                <span style={{ color: '#888', cursor: 'pointer' }}>WOMEN</span>
                <span style={{ color: '#888', cursor: 'pointer' }}>MEN</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              {[
                { name: 'Luis "La Máquina"', last: 'Silva', img: 'https://images.unsplash.com/photo-1593359864223-2895690b6330?auto=format&fit=crop&q=80&w=500', desc: 'MMA - Ligero (70kg)', sede: 'JLBYR', record: '15-2-0' },
                { name: 'Mateo', last: 'Torres', img: 'https://images.unsplash.com/photo-1583454155184-870a1f63aebc?auto=format&fit=crop&q=80&w=500', desc: 'Muay Thai - Gallo (61kg)', sede: 'Sachaca', record: '8-1-0' },
                { name: 'Diego', last: 'Cáceres', img: 'https://images.unsplash.com/photo-1599058917212-97d15a770bf3?auto=format&fit=crop&q=80&w=500', desc: 'BJJ - Medio (84kg)', sede: 'Cercado', record: '12-3-1' },
                { name: 'Renzo "Destructor"', last: 'Pérez', img: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=500', desc: 'Muay Thai - Ligero (70kg)', sede: 'C. Colorado', record: '20-0-0' },
                { name: 'Valeria "La Fiera"', last: 'Pinto', img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=500', desc: 'MMA Femenino (52kg)', sede: 'JLBYR', record: '7-0-0' },
                { name: 'Carlos "El Toro"', last: 'Gómez', img: 'https://images.unsplash.com/photo-1611016186353-9f20e408ec25?auto=format&fit=crop&q=80&w=500', desc: 'MMA - Pesado (120kg)', sede: 'Sachaca', record: '11-4-0' },
                { name: 'Andrea', last: 'Rojas', img: 'https://images.unsplash.com/photo-1526506114642-99071c8a141a?auto=format&fit=crop&q=80&w=500', desc: 'Muay Thai (57kg)', sede: 'Cercado', record: '5-2-0' },
                { name: 'Miguel "Ninja"', last: 'Castro', img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=500', desc: 'BJJ - Pluma (66kg)', sede: 'C. Colorado', record: '18-5-2' }
              ].map((fighter, idx) => (
                <div key={idx} style={{ 
                  position: 'relative', 
                  background: '#1a1a1a', 
                  clipPath: 'polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  height: '450px',
                  transition: 'transform 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ 
                    height: '100%', width: '100%',
                    backgroundImage: `url(${fighter.img})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'top center',
                    filter: 'grayscale(80%) contrast(1.2)'
                  }}></div>
                  <div style={{ padding: '20px 15px 15px 15px', background: 'linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(10,10,10,0.9) 40%, transparent 100%)', position: 'absolute', bottom: 0, width: '100%', boxSizing: 'border-box' }}>
                    <h4 style={{ margin: 0, color: '#ccc', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px' }}>{fighter.desc}</h4>
                    <h2 style={{ margin: '5px 0 0 0', color: '#fff', textTransform: 'uppercase', fontSize: '20px', fontWeight: '900', lineHeight: '1.1' }}>
                      {fighter.name} <br/> 
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <span style={{ color: '#fff', fontSize: '26px' }}>{fighter.last}</span>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px', paddingBottom: '3px' }}>
                          <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px' }}>{fighter.record.split('-')[0]} VICTORIAS</span>
                          <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px' }}>{fighter.record.split('-')[1]} DERROTAS</span>
                          <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px' }}>{fighter.record.split('-')[2]} EMPATE</span>
                        </div>
                      </div>
                    </h2>
                    <div style={{ marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '10px' }}>
                      <span style={{ color: '#fff', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>SEDE {fighter.sede}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {internalTab === 'rankings' && (
          <div>
            <h1 style={{ textTransform: 'uppercase', color: '#fff', margin: '0 0 40px 0', textAlign: 'center', fontSize: '3rem', fontWeight: '900' }}>Top Rankings</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              {[
                { name: 'Luis "La Máquina"', last: 'Silva', img: 'https://images.unsplash.com/photo-1593359864223-2895690b6330?auto=format&fit=crop&q=80&w=500', rank: 1, desc: 'MMA - Campeón Regional', sede: 'JLBYR', record: '15-2-0' },
                { name: 'Renzo "Destructor"', last: 'Pérez', img: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?auto=format&fit=crop&q=80&w=500', rank: 2, desc: 'Muay Thai - Invicto', sede: 'C. Colorado', record: '20-0-0' },
                { name: 'Diego', last: 'Cáceres', img: 'https://images.unsplash.com/photo-1599058917212-97d15a770bf3?auto=format&fit=crop&q=80&w=500', rank: 3, desc: 'BJJ - Sumisión', sede: 'Cercado', record: '12-3-1' },
                { name: 'Valeria "La Fiera"', last: 'Pinto', img: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=500', rank: 4, desc: 'MMA Femenino', sede: 'JLBYR', record: '7-0-0' },
              ].map(fighter => (
                <div key={fighter.rank} style={{ 
                  position: 'relative', 
                  background: '#1a1a1a', 
                  clipPath: 'polygon(30px 0, 100% 0, 100% calc(100% - 30px), calc(100% - 30px) 100%, 0 100%, 0 30px)',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  height: '450px',
                  transition: 'transform 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ 
                    position: 'absolute', top: 0, left: 0, 
                    background: '#ff0000', color: 'white', fontWeight: '900', fontSize: '20px', 
                    width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2,
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' 
                  }}>#{fighter.rank}</div>
                  
                  <div style={{ 
                    height: '100%', width: '100%',
                    backgroundImage: `url(${fighter.img})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'top center',
                    filter: 'grayscale(80%) contrast(1.2)'
                  }}></div>
                  
                  <div style={{ padding: '20px 15px 15px 15px', background: 'linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(10,10,10,0.9) 40%, transparent 100%)', position: 'absolute', bottom: 0, width: '100%', boxSizing: 'border-box' }}>
                    <h4 style={{ margin: 0, color: '#ccc', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px' }}>{fighter.desc}</h4>
                    <h2 style={{ margin: '5px 0 0 0', color: '#fff', textTransform: 'uppercase', fontSize: '20px', fontWeight: '900', lineHeight: '1.1' }}>
                      {fighter.name} <br/> 
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        <span style={{ color: '#fff', fontSize: '26px' }}>{fighter.last}</span>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px', paddingBottom: '3px' }}>
                          <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px' }}>{fighter.record.split('-')[0]} VICTORIAS</span>
                          <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px' }}>{fighter.record.split('-')[1]} DERROTAS</span>
                          <span style={{ color: '#fff', fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px' }}>{fighter.record.split('-')[2]} EMPATE</span>
                        </div>
                      </div>
                    </h2>
                    <div style={{ marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '10px' }}>
                      <span style={{ color: '#fff', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>SEDE {fighter.sede}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}



        {internalTab === 'news' && (
          <div className="admin-grid-2">
            <div className="admin-card glass" style={{ background: '#111', border: '1px solid #222' }}>
              <h3 style={{ color: '#ff0000' }}>Nuevo Patrocinio</h3>
              <p style={{ color: '#aaa' }}>Universe Nutrition oficializa patrocinio para el Team Profesional de ACC. Descuentos disponibles para los cinturones Negros.</p>
              <span style={{ color: '#666', fontSize: '12px' }}>Hace 2 horas</span>
            </div>
            <div className="admin-card glass" style={{ background: '#111', border: '1px solid #222' }}>
              <h3 style={{ color: '#ff0000' }}>Resultados Open Arequipa BJJ</h3>
              <p style={{ color: '#aaa' }}>Diego Cáceres se lleva el oro en su categoría tras finalizar 3 luchas por sumisión (Mata León).</p>
              <span style={{ color: '#666', fontSize: '12px' }}>Ayer</span>
            </div>
          </div>
        )}

        {internalTab === 'where to watch' && (
          <div className="admin-card glass" style={{ background: '#111', border: '1px solid #222', textAlign: 'center', padding: '50px' }}>
            <h2 style={{ textTransform: 'uppercase', color: '#fff', margin: '0 0 20px 0' }}>Dónde ver los combates</h2>
            <p style={{ color: '#aaa', fontSize: '18px', maxWidth: '600px', margin: '0 auto 30px auto' }}>Transmisión exclusiva y en alta calidad de todas las carteleras estelares del Arequipa Combat Club.</p>
            <button className="btn" style={{ background: '#ff0000', color: 'white', padding: '15px 40px', fontSize: '18px', fontWeight: 'bold' }}>▶ ACC PLAY (PPV)</button>
          </div>
        )}

        {internalTab === 'shop' && (
          <div className="admin-grid-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="admin-card glass" style={{ background: '#111', border: '1px solid #222', textAlign: 'center' }}>
                <div style={{ height: '200px', background: '#222', marginBottom: '15px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#555', fontSize: '30px' }}>👕 Merch {i}</span>
                </div>
                <h4 style={{ margin: '0 0 5px 0', color: '#fff' }}>Rashguard Oficial ACC</h4>
                <p style={{ margin: '0 0 15px 0', color: '#ff0000', fontWeight: 'bold' }}>S/ 85.00</p>
                <button className="btn" style={{ background: '#333', color: 'white', width: '100%' }}>Comprar</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; 2026 Arequipa Combat Club. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}

export default App
