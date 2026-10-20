import React, { useState } from 'react'
import { LayoutDashboard, Users, CircleDollarSign, ClipboardCheck, LogOut, Camera, Plus, Download, ShoppingCart, Briefcase, QrCode, MessageCircle, MapPin } from 'lucide-react'
import './App.css'
import HomeSections, { HeroSlideshow } from './HomeSections'
import { FOTOS, SEDE_IMG } from './photos'
import RegistroAlumno, { RegistrosAdmin } from './RegistroAlumno'

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
  const [intendedPage, setIntendedPage] = useState(null);
  const [showRegistro, setShowRegistro] = useState(false);

  const navItems = [
    { id: 'home', label: 'Inicio' },
    { id: 'sedes', label: 'Nuestras Sedes' },
    { id: 'membership', label: 'Membresías' },
    { id: 'videos', label: 'Contenido Premium' },
  ];

  // Modo kiosko: tablet en recepción de cada sede → ?page=registro&sede=sachaca
  if (currentPage === 'registro') {
    const sede = new URLSearchParams(window.location.search).get('sede') || '';
    return <RegistroAlumno kiosko sedeFija={sede} />;
  }

  return (
    <div className="app">
      {currentPage !== 'adminDashboard' && currentPage !== 'acc-interno' && (
        <Navbar 
          items={navItems} 
          active={currentPage} 
          onChange={(id) => {
            if (id === 'videos' && (!isLoggedIn || userRole !== 'alumno')) {
              setIntendedPage('videos');
              setShowAlumnoLogin(true);
            } else {
              setCurrentPage(id);
            }
          }} 
          isLoggedIn={isLoggedIn}
          onLoginClick={() => isLoggedIn ? setCurrentPage(userRole === 'admin' ? 'adminDashboard' : 'dashboard') : setShowRoleModal(true)}
        />
      )}
      
      <main>
        {currentPage === 'home' && (
          <>
            <Hero onStart={() => setCurrentPage('membership')} />
            <HomeSections
              onJoin={() => { setCurrentPage('membership'); window.scrollTo(0, 0); }}
              onSedes={() => { setCurrentPage('sedes'); window.scrollTo(0, 0); }}
              onRegistro={() => setShowRegistro(true)}
            />
          </>
        )}
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
          onRegister={() => { setShowAlumnoLogin(false); setShowRegistro(true); }}
          onLogin={() => {
            setIsLoggedIn(true);
            setUserRole('alumno');
            setCurrentPage(intendedPage || 'dashboard');
            setIntendedPage(null);
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

      {showRegistro && <RegistroAlumno onClose={() => setShowRegistro(false)} />}

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
    <section className="section hero hero-photo">
      <HeroSlideshow />
      <div className="hero-overlay"></div>
      <div className="container hero-content fade-in">
        <div className="hero-text">
          <h1 className="hero-main-title">Arequipa <br /><span>Combat Club</span></h1>
          <p>La academia líder en artes marciales. Entrena con los mejores, accede a contenido exclusivo y certificaciones oficiales.</p>
          <div className="hero-btns">
            <button className="btn btn-primary" onClick={onStart}>Comenzar Ahora</button>
            <button className="btn btn-outline" onClick={() => document.getElementById('disciplinas')?.scrollIntoView({ behavior: 'smooth' })}>Ver Programas</button>
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
    { 
      title: 'Básico', 
      price: 'S/ 175', 
      features: ['2 veces por semana', '1 disciplina a elección'], 
      bg: FOTOS.rodillazo 
    },
    { 
      title: 'Full', 
      price: 'S/ 195', 
      features: ['3 veces por semana', '1 disciplina a elección'], 
      bg: FOTOS.guardiaVertical 
    },
    { 
      title: 'Premium', 
      price: 'S/ 220', 
      features: ['5 veces por semana', '1 disciplina a elección'], 
      bg: FOTOS.clinch 
    },
    { 
      title: 'Plan León', 
      price: 'S/ 280', 
      popular: true, 
      popularText: 'MÁS COMPLETO',
      features: [
        '5 veces por semana', 
        '3 disciplinas (Boxeo, Kick Boxing y MMA)', 
        'Turnos ilimitados (más de 2 veces al día)', 
        'Horarios libres a tu elección'
      ], 
      bg: FOTOS.patadaJaula 
    },
  ];

  return (
    <section className="section memberships" style={{ padding: '50px 20px 80px' }}>
      <div className="container" style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '35px' }}>
          <h2 style={{ fontSize: '40px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', color: '#fff', margin: 0 }}>Elige tu Membresía</h2>
          <div style={{ marginTop: '18px' }}>
            <button 
              className="btn" 
              onClick={() => alert('¡Felicidades! Has reservado tus 3 Clases Gratuitas de prueba en ACC.')}
              style={{ 
                background: 'linear-gradient(90deg, #ff0000 0%, #b30000 100%)', 
                color: '#ffffff', 
                fontWeight: '900', 
                fontSize: '15px', 
                letterSpacing: '1px', 
                padding: '12px 30px', 
                borderRadius: '30px', 
                boxShadow: '0 0 25px rgba(255, 0, 0, 0.5)',
                cursor: 'pointer',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 0 35px rgba(255, 0, 0, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 0, 0, 0.5)';
              }}
            >
              <span>🔥</span>
              <span>PRUEBA TUS 3 PRIMERAS CLASES GRATUITAS</span>
            </button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
          {plans.map((plan, i) => (
            <div 
              key={i} 
              className={`plan-card glass ${plan.popular ? 'popular' : ''}`}
              style={{ 
                '--bg-img': `url(${plan.bg})`,
                height: '560px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '35px 25px 25px',
                borderRadius: '16px',
                border: 'none',
                boxShadow: plan.popular ? '0 0 40px rgba(255, 0, 0, 0.45)' : '0 12px 30px rgba(0,0,0,0.6)',
                marginBottom: 0
              }}
            >
              {/* Lightened Background Overlay */}
              <div 
                style={{ 
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.9) 100%)', 
                  zIndex: 0 
                }} 
              />
              
              {plan.popular && <div className="popular-badge" style={{ background: '#ff0000', fontSize: '11px', fontWeight: '900', letterSpacing: '1px' }}>{plan.popularText}</div>}
              
              {/* Top Section */}
              <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontSize: '32px', fontWeight: '900', margin: '15px 0 5px 0', textTransform: 'uppercase', color: plan.popular ? '#ff3333' : '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                  {plan.title}
                </h3>
                <div className="price" style={{ fontSize: '44px', fontWeight: '900', margin: '10px 0 25px 0', textShadow: '0 3px 12px rgba(0,0,0,0.9)' }}>
                  {plan.price}<span style={{ fontSize: '16px', color: '#ddd', fontWeight: '400' }}>/mes</span>
                </div>
                
                <ul style={{ textAlign: 'left', margin: 0, padding: 0 }}>
                  {plan.features.map((f, j) => (
                    <li key={j} style={{ color: '#ffffff', fontSize: '15px', fontWeight: '500', marginBottom: '12px', display: 'flex', alignItems: 'flex-start', gap: '10px', textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}>
                      <span style={{ color: '#00ff66', fontWeight: 'bold', fontSize: '16px' }}>✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom Section - Button Always Fixed to Bottom */}
              <div style={{ position: 'relative', zIndex: 2, marginTop: 'auto', paddingTop: '20px' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ 
                    width: '100%', 
                    background: '#ff0000',
                    border: 'none',
                    color: '#ffffff',
                    fontWeight: '900',
                    fontSize: '18px',
                    borderRadius: '8px',
                    padding: '14px',
                    letterSpacing: '1px',
                    boxShadow: '0 4px 20px rgba(255, 0, 0, 0.4)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }} 
                  onClick={() => { setSelectedPlan(plan); setShowCheckout(true); }}
                >
                  SELECCIONAR PLAN
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {showCheckout && <CulqiCheckoutModal plan={selectedPlan} onClose={() => setShowCheckout(false)} onPay={onSelect} />}
    </section>
  )
}

function VideoLibrary() {
  const modules = [
    {
      title: 'Módulo 1: Fundamentos de Striking',
      description: 'Aprende las bases del Muay Thai y Boxeo para controlar la distancia.',
      videos: [
        { title: 'Postura y Desplazamientos', duration: '12:45', thumb: FOTOS.shadow },
        { title: 'El Jab perfecto', duration: '08:30', thumb: FOTOS.guardiaBoxeo },
        { title: 'Pateo Medio (Middle Kick)', duration: '15:20', thumb: FOTOS.patadaAlta },
        { title: 'Defensa Básica y Bloqueos', duration: '11:10', thumb: FOTOS.rodillazo },
      ]
    },
    {
      title: 'Módulo 2: Grappling y Sumisiones (No-Gi)',
      description: 'Controla a tu oponente en el suelo y busca la finalización.',
      videos: [
        { title: 'Control Lateral y Transiciones', duration: '18:05', thumb: FOTOS.suelo },
        { title: 'Escape de Montada Básica', duration: '09:50', thumb: FOTOS.mmaControl },
        { title: 'Triángulo desde la Guardia', duration: '14:15', thumb: FOTOS.grappling },
      ]
    },
    {
      title: 'Módulo 3: Acondicionamiento Físico',
      description: 'Prepara tu cuerpo para soportar 3 rounds de alta intensidad.',
      videos: [
        { title: 'Circuitos de Potencia', duration: '22:00', thumb: FOTOS.calentamiento },
        { title: 'Resistencia Cardiovascular', duration: '30:00', thumb: FOTOS.profesor },
        { title: 'Flexibilidad y Recuperación', duration: '15:45', thumb: FOTOS.estiramiento },
      ]
    }
  ];

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', background: '#000', display: 'flex', flexDirection: 'column', color: '#fff' }}>
      
      {/* Hero Banner Premium */}
      <div style={{ position: 'relative', height: '60vh', minHeight: '500px', display: 'flex', alignItems: 'flex-end', padding: '60px 5%', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: `url("${FOTOS.atrapada}")`, backgroundSize: 'cover', backgroundPosition: 'center 35%' }}></div>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, #000 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.2) 100%)' }}></div>
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ff0000', color: '#fff', padding: '6px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '900', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '20px' }}>
            <span>🔥</span> MASTERCLASS EXCLUSIVA
          </div>
          <h1 style={{ fontSize: '48px', fontWeight: '900', margin: '0 0 15px 0', textTransform: 'uppercase', lineHeight: '1.1' }}>Mentalidad de Campeón con Joshua Fernández</h1>
          <p style={{ fontSize: '18px', color: '#ccc', margin: '0 0 30px 0', lineHeight: '1.6' }}>Descubre los secretos tácticos y la preparación psicológica que llevaron a Joshua a dominar el octágono. Una hora de contenido invaluable para cualquier peleador.</p>
          <button style={{ background: '#fff', color: '#000', border: 'none', padding: '15px 40px', borderRadius: '30px', fontSize: '16px', fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'transform 0.2s ease' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            <span style={{ fontSize: '20px' }}>▶</span> REPRODUCIR AHORA
          </button>
        </div>
      </div>

      {/* Modules List */}
      <div style={{ padding: '60px 5%', display: 'flex', flexDirection: 'column', gap: '60px' }}>
        
        {modules.map((mod, mIndex) => (
          <div key={mIndex}>
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ fontSize: '28px', fontWeight: '900', margin: '0 0 5px 0', textTransform: 'uppercase', borderLeft: '4px solid #ff0000', paddingLeft: '15px' }}>{mod.title}</h2>
              <p style={{ color: '#888', margin: '0 0 0 19px', fontSize: '15px' }}>{mod.description}</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
              {mod.videos.map((vid, vIndex) => (
                <div key={vIndex} style={{ background: '#111', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.3s ease, box-shadow 0.3s ease', position: 'relative' }}
                     onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = '0 20px 40px rgba(255,0,0,0.15)'; }}
                     onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ position: 'relative', height: '180px' }}>
                    <img src={vid.thumb} alt={vid.title} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.3s ease' }} 
                         onMouseEnter={e => e.currentTarget.style.opacity = 1} 
                         onMouseLeave={e => e.currentTarget.style.opacity = 0}
                    >
                      <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', paddingLeft: '4px' }}>
                        ▶
                      </div>
                    </div>
                    <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                      {vid.duration}
                    </div>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <h4 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 10px 0', lineHeight: '1.3' }}>{vid.title}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#333', overflow: 'hidden' }}>
                        <img src="/assets/joshua.png" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(50%)' }} />
                      </div>
                      <span style={{ color: '#aaa', fontSize: '13px', fontWeight: '600' }}>Joshua Fernández</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

      </div>
    </div>
  )
}

function Sedes() {
  const sedes = [
    { name: 'Sede Centro', address: 'Calle Mercaderes 210, Cercado', img: SEDE_IMG.cercado },
    { name: 'Sede Sachaca', address: 'Av. Fernandini 405, Sachaca', img: SEDE_IMG.sachaca },
    { name: 'Sede JLBYR', address: 'Av. Dolores 789, JLBYR', img: SEDE_IMG.bustamante },
    { name: 'Sede Cerro Colorado', address: 'Av. Ejército 1020, Cerro Colorado', img: SEDE_IMG.cerroColorado },
  ];

  return (
    <section className="section sedes" style={{ padding: '40px 0 60px' }}>
      <div style={{ maxWidth: '1600px', width: '100%', margin: '0 auto', padding: '0 20px' }}>
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '35px' }}>
          <h2 style={{ fontSize: '40px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', color: '#fff', margin: 0 }}>Nuestras Sedes en Arequipa</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '16px', marginTop: '8px' }}>Entrena en la sede más cercana a ti con la mejor infraestructura</p>
        </div>

        {/* 4 Equal Tall Rectangular Columns (No Horizontal Stretching) */}
        <div className="sedes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2px', width: '100%', height: '560px', overflow: 'hidden', borderRadius: '4px' }}>
          {sedes.map((s, i) => (
            <div 
              key={i} 
              style={{ 
                cursor: 'pointer', position: 'relative', overflow: 'hidden', height: '100%',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '35px 25px',
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e) => { 
                const img = e.currentTarget.querySelector('.card-bg-img');
                if (img) img.style.transform = 'scale(1.08)';
                const overlay = e.currentTarget.querySelector('.card-bg-overlay');
                if (overlay) overlay.style.background = 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.85) 100%)';
              }}
              onMouseLeave={(e) => { 
                const img = e.currentTarget.querySelector('.card-bg-img');
                if (img) img.style.transform = 'scale(1)';
                const overlay = e.currentTarget.querySelector('.card-bg-overlay');
                if (overlay) overlay.style.background = 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.92) 100%)';
              }}
            >
              {/* Background Image */}
              <div 
                className="card-bg-img"
                style={{ 
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                  backgroundImage: `url(${s.img})`, backgroundSize: 'cover', backgroundPosition: 'center', 
                  zIndex: 0, 
                  transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)' 
                }}
              />

              {/* Dark Gradient Overlay */}
              <div 
                className="card-bg-overlay"
                style={{ 
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.92) 100%)', 
                  zIndex: 1, 
                  transition: 'background 0.4s ease' 
                }}
              />

              {/* Content at Bottom */}
              <div style={{ position: 'relative', zIndex: 2 }}>
                <h3 style={{ 
                  margin: 0, color: '#ffffff', fontSize: '26px', 
                  textTransform: 'uppercase', fontWeight: '900', letterSpacing: '1px', 
                  textShadow: '0 3px 15px rgba(0,0,0,0.9)'
                }}>
                  {s.name}
                </h3>

                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px', 
                  marginTop: '10px', color: 'rgba(255,255,255,0.85)', fontSize: '14px'
                }}>
                  <MapPin size={16} color="#ff3333" />
                  <span>{s.address}</span>
                </div>
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
    <div style={{ minHeight: 'calc(100vh - 80px)', background: '#050505', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        .dashboard-layout {
          display: flex;
          gap: 40px;
          padding: 100px 5% 50px 5%;
        }
        .dashboard-sidebar {
          width: 380px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 30px;
        }
        @media (max-width: 1024px) {
          .dashboard-layout {
            flex-direction: column;
            padding-top: 40px !important;
          }
          .dashboard-sidebar {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
          }
        }
      `}</style>
      <div className="dashboard-layout" style={{ flex: 1, maxWidth: '1800px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Left Sidebar Column */}
        <div className="dashboard-sidebar">
          
          {/* Profile Card */}
          <div style={{ background: 'linear-gradient(145deg, #111, #0a0a0a)', borderRadius: '24px', border: '1px solid #222', padding: '40px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden', height: 'fit-content' }}>
            
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '150px', background: 'linear-gradient(180deg, rgba(255,0,0,0.15) 0%, transparent 100%)' }}></div>
            
            <div style={{ width: '150px', height: '150px', borderRadius: '50%', background: '#1a1a1a', border: '4px solid #ff0000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px', zIndex: 1, boxShadow: '0 0 30px rgba(255,0,0,0.3)', marginBottom: '25px', overflow: 'hidden' }}>
              <img src="/assets/joshua.png" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(30%) contrast(1.1)' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
              <span style={{ display: 'none' }}>👤</span>
            </div>
            
            <h2 style={{ color: '#fff', fontSize: '28px', fontWeight: '900', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '1px', zIndex: 1, textAlign: 'center' }}>Gerson Enríquez</h2>
            
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0,0,0,0.5)', padding: '8px 20px', borderRadius: '30px', border: '1px solid #333', zIndex: 1, marginBottom: '40px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: examPassed ? '#9333ea' : '#3b82f6', boxShadow: `0 0 10px ${examPassed ? '#9333ea' : '#3b82f6'}` }}></span>
              <span style={{ color: '#fff', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '14px', letterSpacing: '1px' }}>Rango: {examPassed ? 'Cinta Morada' : 'Cinta Azul'}</span>
            </div>

            <div style={{ width: '100%', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#aaa', fontSize: '13px', fontWeight: 'bold', textTransform: 'uppercase' }}>Avance a {examPassed ? 'Cinta Marrón' : 'Cinta Morada'}</span>
                <span style={{ color: '#ff0000', fontSize: '14px', fontWeight: '900' }}>{examPassed ? '10%' : '85%'}</span>
              </div>
              <div style={{ height: '8px', background: '#222', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: examPassed ? '10%' : '85%', background: 'linear-gradient(90deg, #ff0000, #ff4444)', borderRadius: '10px', boxShadow: '0 0 10px rgba(255,0,0,0.5)', transition: 'width 1s ease-in-out' }}></div>
              </div>
            </div>
          </div>

          {/* Access Card (QR) */}
          <div style={{ background: 'linear-gradient(135deg, #ff0000 0%, #8a0000 100%)', borderRadius: '24px', padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 20px 40px rgba(255,0,0,0.2)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 60%)', transform: 'rotate(45deg)' }}></div>
            <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', margin: '0 0 5px 0', letterSpacing: '2px', zIndex: 1 }}>PASE DE ACCESO</h3>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px', margin: '0 0 20px 0', zIndex: 1, letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 'bold' }}>Token Dinámico de Seguridad</p>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', zIndex: 1, boxShadow: '0 10px 20px rgba(0,0,0,0.5)', position: 'relative' }}>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=ACC-8472-9X:1682348239:8F9A2C&color=000000&bgcolor=ffffff" alt="QR Access" style={{ width: '220px', height: '220px', display: 'block' }} />
              <style>{`
                @keyframes progress {
                  0% { width: 100%; }
                  100% { width: 0%; }
                }
              `}</style>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', zIndex: 1, marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '5px' }}>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Expira en 30s</span>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold' }}>Actualizando...</span>
              </div>
              <div style={{ height: '4px', background: 'rgba(0,0,0,0.3)', width: '100%', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#fff', animation: 'progress 30s linear infinite' }}></div>
              </div>
            </div>
            <p style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', margin: '15px 0 0 0', zIndex: 1 }}>Membresía Activa</p>
          </div>

        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* Top Stats Row */}
          <div>
            <h3 style={{ color: '#fff', fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              MIS AVANCES Y RESULTADOS
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '25px' }}>
              {[
                { label: 'Clases este mes', value: '15', icon: '🥊', color: '#ff0000' },
                { label: 'Exámenes aprobados', value: examPassed ? '4' : '3', icon: '🏆', color: '#3b82f6' },
                { label: 'Certificados obtenidos', value: examPassed ? '2' : '1', icon: '📜', color: '#10b981' }
              ].map((stat, i) => (
                <div key={i} style={{ background: 'linear-gradient(145deg, #161616, #0d0d0d)', border: '1px solid #222', borderRadius: '20px', padding: '30px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', transition: 'transform 0.3s ease', cursor: 'default' }}
                     onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = stat.color; }}
                     onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#222'; }}
                >
                  <h4 style={{ position: 'relative', zIndex: 1, color: '#fff', fontSize: '48px', fontWeight: '900', margin: '0 0 5px 0', lineHeight: '1' }}>{stat.value}</h4>
                  <p style={{ position: 'relative', zIndex: 1, color: '#888', fontSize: '15px', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Middle Row: Streak & Feedback */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '25px' }}>
            
            {/* Heatmap / Streak */}
            <div style={{ background: 'linear-gradient(145deg, #161616, #0d0d0d)', border: '1px solid #222', borderRadius: '24px', padding: '30px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', margin: '0 0 5px 0' }}>Racha de Entrenamiento</h3>
                  <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>Últimos 28 días</p>
                </div>
                <div style={{ background: 'rgba(255,0,0,0.1)', color: '#ff0000', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', fontSize: '14px' }}>
                  🔥 5 Días Seguidos
                </div>
              </div>
              
              {/* Mock Heatmap Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '20px' }}>
                {Array.from({ length: 28 }).map((_, i) => {
                  const isAttended = [2, 4, 7, 9, 11, 14, 16, 18, 21, 23, 24, 25, 26, 27].includes(i);
                  return (
                    <div key={i} style={{ 
                      aspectRatio: '1', 
                      background: isAttended ? '#ff0000' : '#222',
                      borderRadius: '6px',
                      opacity: isAttended ? 1 : 0.5,
                      boxShadow: isAttended ? '0 0 10px rgba(255,0,0,0.5)' : 'none'
                    }}></div>
                  )
                })}
              </div>

              {/* Goal & Reward */}
              <div style={{ background: '#111', borderRadius: '12px', padding: '15px', borderLeft: '4px solid #ff0000' }}>
                <p style={{ color: '#fff', fontSize: '13px', margin: '0 0 5px 0', fontWeight: 'bold' }}>🎯 Meta del Mes: 20 Clases</p>
                <p style={{ color: '#aaa', fontSize: '12px', margin: 0 }}>Asiste a 5 clases más para desbloquear un <strong style={{ color: '#ff0000' }}>15% de descuento</strong> en la Tienda Oficial.</p>
              </div>
            </div>

            {/* Coach Feedback */}
            <div style={{ background: 'linear-gradient(145deg, #161616, #0d0d0d)', border: '1px solid #222', borderRadius: '24px', padding: '30px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
               <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', margin: '0 0 20px 0' }}>Feedback del Coach</h3>
               
               <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                 <p style={{ color: '#ccc', fontSize: '15px', lineHeight: '1.6', fontStyle: 'italic', margin: '0 0 20px 0', position: 'relative', paddingLeft: '20px', borderLeft: '2px solid #555' }}>
                   "Gerson, excelente progreso en tus escapes de guardia esta semana. Vi mucha mejora en el sparring del viernes. Sigue ajustando el triángulo y estarás listo para tu examen."
                 </p>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto' }}>
                   <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#333', overflow: 'hidden' }}>
                     <img src={FOTOS.guardiaBoxeo} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '48% 22%' }} alt="Coach" />
                   </div>
                   <div>
                     <p style={{ color: '#fff', margin: 0, fontWeight: 'bold', fontSize: '14px' }}>Prof. Joshua Fernandez</p>
                     <p style={{ color: '#ff0000', margin: 0, fontSize: '12px', textTransform: 'uppercase', fontWeight: '900' }}>Head Coach BJJ</p>
                   </div>
                 </div>
               </div>
            </div>

          </div>

          {/* Next Steps / Objectives Card */}
          <div style={{ background: 'linear-gradient(135deg, rgba(255,0,0,0.1) 0%, rgba(0,0,0,0) 100%)', border: '1px solid rgba(255,0,0,0.3)', borderRadius: '24px', padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%', background: `url("${FOTOS.derribo}")`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.2, maskImage: 'linear-gradient(to right, transparent, black)', WebkitMaskImage: 'linear-gradient(to right, transparent, black)' }}></div>

            <div style={{ position: 'relative', zIndex: 1, maxWidth: '65%' }}>
              <div style={{ display: 'inline-block', background: '#ff0000', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '15px' }}>
                OBJETIVO PRINCIPAL
              </div>
              <h3 style={{ color: '#fff', fontSize: '36px', fontWeight: '900', textTransform: 'uppercase', margin: '0 0 15px 0', lineHeight: '1.2' }}>
                {examPassed ? '¡FELICIDADES POR TU NUEVO GRADO!' : 'EXAMEN DE TÉCNICA - CINTA MORADA'}
              </h3>
              <p style={{ color: '#ccc', fontSize: '16px', lineHeight: '1.6', margin: '0 0 30px 0' }}>
                {examPassed ? 'Has desbloqueado nuevas técnicas avanzadas de grappling y striking. Sigue entrenando para alcanzar el nivel marrón.' : '¡Estás listo! Has cumplido con el 100% de las clases requeridas y tu instructor ha habilitado tu pase para el examen.'}
              </p>
              
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                {!examPassed && (
                  <button 
                    onClick={onTakeExam}
                    style={{ background: '#ff0000', color: '#fff', border: 'none', padding: '16px 36px', borderRadius: '8px', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer', letterSpacing: '1px', boxShadow: '0 10px 20px rgba(255,0,0,0.3)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 25px rgba(255,0,0,0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(255,0,0,0.3)'; }}
                  >
                    TOMAR EXAMEN AHORA
                  </button>
                )}
                <button 
                  onClick={() => window.open(CERTIFICATE_IMAGE)}
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '16px 36px', borderRadius: '8px', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer', letterSpacing: '1px', transition: 'all 0.2s ease' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                >
                  VER ÚLTIMO CERTIFICADO
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function AdminDashboard({ sede, type, onLogout }) {
  const [activeTab, setActiveTab] = useState('menu');
  const [finanzasSede, setFinanzasSede] = useState(null);
  const isFundador = type === 'fundador';

  const [scanStatus, setScanStatus] = useState('waiting');
  const [scannedStudent, setScannedStudent] = useState(null);

  const handleSimulateScan = () => {
    setScanStatus('success');
    setScannedStudent({ name: 'Gerson Enríquez', plan: 'Premium (Cinta Azul)', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) });
    setTimeout(() => {
      setScanStatus('waiting');
      setScannedStudent(null);
    }, 4000);
  };

  const handleSimulateError = () => {
    setScanStatus('error');
    setScannedStudent({ name: 'Ana Gómez', plan: 'Vencido hace 3 días', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) });
    setTimeout(() => {
      setScanStatus('waiting');
      setScannedStudent(null);
    }, 4000);
  };

  const menuItems = [
    { id: 'overview', bg: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=500&auto=format&fit=crop', title: 'Resumen Global', desc: 'Estadísticas, finanzas y rendimiento' },
    { id: 'alumnos', bg: FOTOS.saludo, title: 'Alumnos & Acceso', desc: 'Torniquete virtual y seguimiento CRM' },
    { id: 'pos', bg: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=500&auto=format&fit=crop', title: 'Tienda (POS)', desc: 'Punto de venta e inventario' },
    { id: 'personal', bg: FOTOS.profesor, title: 'Profesores', desc: 'Control de asistencia y planillas' },
    { id: 'finanzas', bg: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=500&auto=format&fit=crop', title: 'Finanzas', desc: 'Arqueo diario y cierre de caja' },
    { id: 'eventos', bg: FOTOS.mmaControl, title: 'Fight Team', desc: 'Eventos y récord de peleadores' }
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
            <div style={{ padding: '10px 0' }}>
              <h2 style={{ textAlign: 'center', marginBottom: '25px', fontSize: '32px', color: 'white', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800' }}>Selecciona un Módulo</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '14px', maxWidth: '1400px', margin: '0 auto' }}>
                {menuItems.map(item => (
                  <div 
                    key={item.id} 
                    className="admin-card glass" 
                    style={{ 
                      cursor: 'pointer', textAlign: 'center', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                      position: 'relative', overflow: 'hidden', height: '340px',
                      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px',
                      border: '1px solid rgba(255, 255, 255, 0.12)', marginBottom: 0,
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)', borderRadius: '12px'
                    }}
                    onClick={() => setActiveTab(item.id)}
                    onMouseEnter={(e) => { 
                      e.currentTarget.style.transform = 'translateY(-6px)'; 
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)';
                      e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.85), 0 0 25px rgba(255, 255, 255, 0.08)';
                      const img = e.currentTarget.querySelector('.card-bg-img');
                      if (img) img.style.transform = 'scale(1.08)';
                      const overlay = e.currentTarget.querySelector('.card-bg-overlay');
                      if (overlay) overlay.style.background = 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.25) 100%)';
                    }}
                    onMouseLeave={(e) => { 
                      e.currentTarget.style.transform = 'translateY(0)'; 
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                      e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
                      const img = e.currentTarget.querySelector('.card-bg-img');
                      if (img) img.style.transform = 'scale(1)';
                      const overlay = e.currentTarget.querySelector('.card-bg-overlay');
                      if (overlay) overlay.style.background = 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 100%)';
                    }}
                  >
                    <div className="card-bg-img" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `url(${item.bg})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0, transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}></div>
                    <div className="card-bg-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 100%)', zIndex: 1, transition: 'background 0.4s ease' }}></div>
                    <div style={{ position: 'relative', zIndex: 2, padding: '0 15px' }}>
                      <h3 style={{ margin: 0, color: 'white', fontSize: '28px', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px', textShadow: '0 2px 12px rgba(0,0,0,0.9)' }}>{item.title}</h3>
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
              <RegistrosAdmin />
              <div className="admin-card glass" style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px' }}>
                <h3 style={{ fontSize: '24px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '10px' }}>Torniquete Virtual - Escáner de Recepción</h3>
                <p style={{ color: 'var(--text-dim)', marginBottom: '30px' }}>Conecta un lector de código de barras/QR USB. Al escanear, el sistema valida la entrada automáticamente.</p>
                
                {scanStatus === 'waiting' && (
                  <div style={{ background: '#000', border: '2px dashed #333', borderRadius: '12px', padding: '60px 20px', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <QrCode size={48} color="#888" style={{ marginBottom: '20px' }} />
                    <h4 style={{ color: '#fff', fontSize: '18px', margin: '0 0 10px 0', textTransform: 'uppercase' }}>Esperando Escaneo...</h4>
                    <p style={{ color: '#666', fontSize: '14px', margin: '0' }}>El lector USB está activo y escuchando.</p>
                    
                    <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                      <button onClick={handleSimulateScan} style={{ background: 'rgba(0, 255, 0, 0.1)', border: '1px solid #00ff00', color: '#00ff00', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold' }}>Simular Acceso Correcto</button>
                      <button onClick={handleSimulateError} style={{ background: 'rgba(255, 0, 0, 0.1)', border: '1px solid #ff0000', color: '#ff0000', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold' }}>Simular Acceso Denegado</button>
                    </div>
                  </div>
                )}

                {scanStatus === 'success' && scannedStudent && (
                  <div style={{ background: 'linear-gradient(145deg, #003300, #000)', border: '2px solid #00ff00', borderRadius: '12px', padding: '40px 20px', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 0 30px rgba(0, 255, 0, 0.2)' }}>
                    <div style={{ width: '80px', height: '80px', background: '#00ff00', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                      <Check size={40} color="#000" />
                    </div>
                    <h2 style={{ color: '#00ff00', fontSize: '28px', fontWeight: '900', margin: '0 0 5px 0', textTransform: 'uppercase' }}>ACCESO PERMITIDO</h2>
                    <p style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', margin: '0 0 5px 0' }}>{scannedStudent.name}</p>
                    <p style={{ color: '#aaa', fontSize: '14px', margin: '0' }}>{scannedStudent.plan} • {scannedStudent.time}</p>
                  </div>
                )}

                {scanStatus === 'error' && scannedStudent && (
                  <div style={{ background: 'linear-gradient(145deg, #330000, #000)', border: '2px solid #ff0000', borderRadius: '12px', padding: '40px 20px', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 0 30px rgba(255, 0, 0, 0.2)' }}>
                    <div style={{ width: '80px', height: '80px', background: '#ff0000', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                      <X size={40} color="#000" />
                    </div>
                    <h2 style={{ color: '#ff0000', fontSize: '28px', fontWeight: '900', margin: '0 0 5px 0', textTransform: 'uppercase' }}>ACCESO DENEGADO</h2>
                    <p style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', margin: '0 0 5px 0' }}>{scannedStudent.name}</p>
                    <p style={{ color: '#aaa', fontSize: '14px', margin: '0' }}>Estado: {scannedStudent.plan} • {scannedStudent.time}</p>
                  </div>
                )}
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
                <div style={{ padding: '10px 0' }}>
                  <h2 style={{ textAlign: 'center', marginBottom: '25px', fontSize: '32px', color: 'white', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '800' }}>Selecciona una Sede para ver Finanzas</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', maxWidth: '1400px', margin: '0 auto' }}>
                    {[
                      { id: 'GENERAL', title: 'RESUMEN GENERAL (TODAS LAS SEDES)', bg: SEDE_IMG.general, span: 4, height: '280px' },
                      { id: 'Sede JL Bustamante y Rivero', title: 'Jose Luis Bustamante y Rivero', bg: SEDE_IMG.bustamante, span: 2, height: '320px' },
                      { id: 'Sede Sachaca', title: 'Sachaca', bg: SEDE_IMG.sachaca, span: 2, height: '320px' },
                      { id: 'Sede Cerro Colorado', title: 'Cerro Colorado', bg: SEDE_IMG.cerroColorado, span: 2, height: '320px' },
                      { id: 'Sede Cercado', title: 'Cercado', bg: SEDE_IMG.cercado, span: 2, height: '320px' }
                    ].map(s => (
                      <div 
                        key={s.id} 
                        className="admin-card glass" 
                        style={{ 
                          gridColumn: `span ${s.span}`,
                          cursor: 'pointer', textAlign: 'center', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                          position: 'relative', overflow: 'hidden', height: s.height,
                          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px',
                          border: '1px solid rgba(255, 255, 255, 0.12)', marginBottom: 0,
                          boxShadow: '0 10px 25px rgba(0,0,0,0.5)', borderRadius: '12px'
                        }}
                        onClick={() => setFinanzasSede(s.id)}
                        onMouseEnter={(e) => { 
                          e.currentTarget.style.transform = 'translateY(-6px)'; 
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)';
                          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.85), 0 0 25px rgba(255, 255, 255, 0.08)';
                          const img = e.currentTarget.querySelector('.card-bg-img');
                          if (img) img.style.transform = 'scale(1.08)';
                          const overlay = e.currentTarget.querySelector('.card-bg-overlay');
                          if (overlay) overlay.style.background = 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.25) 100%)';
                        }}
                        onMouseLeave={(e) => { 
                          e.currentTarget.style.transform = 'translateY(0)'; 
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                          e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5)';
                          const img = e.currentTarget.querySelector('.card-bg-img');
                          if (img) img.style.transform = 'scale(1)';
                          const overlay = e.currentTarget.querySelector('.card-bg-overlay');
                          if (overlay) overlay.style.background = 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 100%)';
                        }}
                      >
                        <div className="card-bg-img" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: `url(${s.bg})`, backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0, transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}></div>
                        <div className="card-bg-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 100%)', zIndex: 1, transition: 'background 0.4s ease' }}></div>
                        <div style={{ position: 'relative', zIndex: 2, padding: '0 15px' }}>
                          <h3 style={{ margin: 0, color: 'white', fontSize: s.span === 4 ? '30px' : '26px', textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px', textShadow: '0 2px 12px rgba(0,0,0,0.9)' }}>{s.title}</h3>
                        </div>
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
      bg: FOTOS.shadow,
      onClick: onSelectAlumno
    },
    { 
      title: 'Administrador', 
      desc: 'Gestiona sedes, alumnos y reportes', 
      bg: FOTOS.formacion,
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

function AlumnoLoginModal({ onClose, onLogin, onRegister }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  return (
    <div className="modal-overlay" style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: '400px', background: '#000', padding: '40px', borderRadius: '0' }}>
        
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#fff', fontSize: '30px', cursor: 'pointer', zIndex: 10, fontWeight: '300' }}>×</button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <img src="/newlogo.png" alt="ACC Logo" style={{ height: '50px', marginBottom: '40px' }} />
          
          <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 40px 0', textAlign: 'center' }}>Ingreso Alumnos</h2>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div>
              <input 
                type="text" 
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="USUARIO O CORREO" 
                style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '2px solid #333', borderRadius: '0', padding: '10px 0', color: '#fff', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', letterSpacing: '1px' }} 
                onFocus={(e) => e.target.style.borderColor = '#fff'}
                onBlur={(e) => e.target.style.borderColor = '#333'}
              />
            </div>
            
            <div>
              <input 
                type="password" 
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="CONTRASEÑA" 
                style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '2px solid #333', borderRadius: '0', padding: '10px 0', color: '#fff', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', letterSpacing: '1px' }} 
                onFocus={(e) => e.target.style.borderColor = '#fff'}
                onBlur={(e) => e.target.style.borderColor = '#333'}
              />
            </div>

            <button 
              onClick={() => onLogin()}
              style={{ width: '100%', background: '#fff', color: '#000', border: 'none', borderRadius: '0', padding: '16px', fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', cursor: 'pointer', marginTop: '20px', transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#ddd'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              Iniciar Sesión
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
              <a href="#" style={{ color: '#888', fontSize: '12px', textDecoration: 'none', letterSpacing: '1px', textTransform: 'uppercase' }}>¿Olvidaste tu contraseña?</a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: '#444', fontSize: '11px', letterSpacing: '2px', marginTop: '6px' }}>
              <span style={{ flex: 1, height: '1px', background: '#222' }} />O<span style={{ flex: 1, height: '1px', background: '#222' }} />
            </div>

            <button
              id="login-open-registro"
              onClick={onRegister}
              style={{ width: '100%', background: 'transparent', color: '#fff', border: '2px solid #ff0000', borderRadius: '0', padding: '14px', fontSize: '13px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 20px rgba(255,0,0,0.15)' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#ff0000'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              ¿Primera vez en ACC? Regístrate aquí
            </button>
          </div>
          
        </div>
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
      setError('CLAVE INCORRECTA. INTENTE DE NUEVO.');
    }
  }

  if (!selectedRole) {
    return (
      <div className="modal-overlay" style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '500px', background: '#000', padding: '40px', borderRadius: '0' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#fff', fontSize: '30px', cursor: 'pointer', zIndex: 10, fontWeight: '300' }}>×</button>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src="/newlogo.png" alt="ACC Logo" style={{ height: '50px', marginBottom: '40px' }} />
            <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 10px 0', textAlign: 'center' }}>SELECCIONA TU ROL</h2>
            <p style={{ color: '#888', fontSize: '12px', margin: '0 0 40px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>¿A QUÉ PANEL DESEAS INGRESAR?</p>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div 
                onClick={() => setSelectedRole('encargado')}
                style={{ width: '100%', padding: '20px', border: '2px solid #333', background: 'transparent', color: '#fff', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '900', fontSize: '14px' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#fff'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#333'}
              >
                ADMINISTRADOR
              </div>
              <div 
                onClick={() => setSelectedRole('fundador')}
                style={{ width: '100%', padding: '20px', border: '2px solid #333', background: 'transparent', color: '#fff', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '900', fontSize: '14px' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#fff'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#333'}
              >
                FUNDADOR
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: '400px', background: '#000', padding: '40px', borderRadius: '0' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: '#fff', fontSize: '30px', cursor: 'pointer', zIndex: 10, fontWeight: '300' }}>×</button>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img src="/newlogo.png" alt="ACC Logo" style={{ height: '50px', marginBottom: '40px' }} />
          <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 10px 0', textAlign: 'center' }}>ACCESO {selectedRole.toUpperCase()}</h2>
          <p style={{ color: '#888', fontSize: '12px', margin: '0 0 40px 0', textTransform: 'uppercase', letterSpacing: '1px' }}>INGRESA TU CLAVE DE ACCESO</p>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleVerify(); }}
                placeholder="CLAVE" 
                style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '2px solid #333', borderRadius: '0', padding: '10px 0', color: '#fff', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s', letterSpacing: '1px', textAlign: 'center' }} 
                onFocus={(e) => e.target.style.borderColor = '#fff'}
                onBlur={(e) => e.target.style.borderColor = '#333'}
              />
            </div>
            {error && <p style={{ color: '#fff', fontSize: '12px', marginTop: '-15px', marginBottom: '0', textAlign: 'center', background: '#333', padding: '8px', fontWeight: 'bold' }}>{error}</p>}

            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <button 
                onClick={() => { setSelectedRole(null); setPassword(''); setError(''); }}
                style={{ flex: 1, background: 'transparent', color: '#888', border: '2px solid #333', borderRadius: '0', padding: '16px', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', transition: 'color 0.2s, border-color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.borderColor = '#333'; }}
              >
                VOLVER
              </button>
              <button 
                onClick={handleVerify}
                style={{ flex: 1, background: '#fff', color: '#000', border: 'none', borderRadius: '0', padding: '16px', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#ddd'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                VERIFICAR
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SedesAdminModal({ onClose, onSelectSede }) {
  const sedesList = [
    { name: 'Jose Luis Bustamante y Rivero', bg: SEDE_IMG.bustamante },
    { name: 'Sachaca', bg: SEDE_IMG.sachaca },
    { name: 'Cerro Colorado', bg: SEDE_IMG.cerroColorado },
    { name: 'Cercado', bg: SEDE_IMG.cercado },
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
  const [shopCategory, setShopCategory] = useState('TODOS');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [notification, setNotification] = useState(null);

  const [productsList, setProductsList] = useState([
    {
      id: 1,
      name: 'Rashguard Oficial Pro ACC',
      category: 'Ropa de Combate',
      price: 120,
      priceFormatted: 'S/ 120.00',
      stock: 14,
      badge: 'MÁS VENDIDO',
      badgeBg: '#ff0000',
      image: '/assets/acc_shop_rashguard.png',
      sizes: ['S', 'M', 'L', 'XL'],
      description: 'Rashguard de compresión profesional anti-bacteriana de secado rápido. Diseñado para resistir los entrenamientos más exigentes de BJJ, Grappling y MMA en el Arequipa Combat Club.'
    },
    {
      id: 2,
      name: 'Guantes Leather Pro ACC 16oz',
      category: 'Equipamiento',
      price: 190,
      priceFormatted: 'S/ 190.00',
      stock: 8,
      badge: 'PRO SPEC',
      badgeBg: '#d97706',
      image: '/assets/acc_shop_gloves.png',
      sizes: ['12oz', '14oz', '16oz'],
      description: 'Cuero natural de grano entero con relleno de espuma inyectada triple densidad. Excelente protección articular y fijación de muñeca para Sparring y trabajo pesado de saco.'
    },
    {
      id: 3,
      name: 'Fight Shorts Tactical ACC',
      category: 'Ropa de Combate',
      price: 95,
      priceFormatted: 'S/ 95.00',
      stock: 3,
      badge: '¡ÚLTIMAS UNIDADES!',
      badgeBg: '#dc2626',
      image: '/assets/acc_shop_shorts.png',
      sizes: ['30', '32', '34', '36'],
      description: 'Shorts de combate ultraligeros con aperturas laterales ergonómicas, entrepierna elastizada de alta amplitud y cintura siliconada antideslizante.'
    },
    {
      id: 4,
      name: 'Hoodie ACC Lion Edition',
      category: 'Ropa Casual',
      price: 160,
      priceFormatted: 'S/ 160.00',
      stock: 18,
      badge: 'NUEVO',
      badgeBg: '#2563eb',
      image: '/assets/acc_shop_hoodie.png',
      sizes: ['M', 'L', 'XL'],
      description: 'Polerón oversize de algodón pesado premium (380 GSM) con forro térmico rojo interno en la capucha y el emblemático león ACC en bordado de alta densidad.'
    },
    {
      id: 5,
      name: 'Vendas Pro Elastic 4.5m ACC',
      category: 'Accesorios',
      price: 35,
      priceFormatted: 'S/ 35.00',
      stock: 25,
      badge: 'ESSENTIAL',
      badgeBg: '#059669',
      image: '/assets/acc_shop_wraps.png',
      sizes: ['4.5m'],
      description: 'Vendas semiflexibles de mezcla algodón-poliéster de 4.5 metros. Grosor óptimo para máxima protección metacarpiana y fijación de muñeca.'
    },
    {
      id: 6,
      name: 'Maletín Deportivo Tactical ACC',
      category: 'Accesorios',
      price: 175,
      priceFormatted: 'S/ 175.00',
      stock: 5,
      badge: 'EDICIÓN LIMITADA',
      badgeBg: '#7c3aed',
      image: '/assets/acc_shop_duffel.png',
      sizes: ['50 Litros'],
      description: 'Maletín técnico impermeable 50L de alta resistencia. Cuenta con compartimento aireado exclusivo para guantes/calzado húmedo y correas tácticas ajustables.'
    }
  ]);

  const handleReserveProduct = (product, size, qty) => {
    if (product.stock < qty) return;
    setProductsList(prev => prev.map(p => p.id === product.id ? { ...p, stock: p.stock - qty } : p));
    setNotification(`¡Reserva confirmada! ${qty}x ${product.name} (Talla: ${size || product.sizes[0]}) reservado. Tienes 24h para recogerlo en cualquiera de nuestras sedes.`);
    setSelectedProduct(null);
    setTimeout(() => setNotification(null), 6000);
  };

  const sedesList = [
    { name: 'Sede JLBYR', fullName: 'Jose Luis Bustamante y Rivero', bg: SEDE_IMG.bustamante },
    { name: 'Sede Sachaca', fullName: 'Sachaca', bg: SEDE_IMG.sachaca },
    { name: 'Sede C. Colorado', fullName: 'Cerro Colorado', bg: SEDE_IMG.cerroColorado },
    { name: 'Sede Cercado', fullName: 'Cercado', bg: SEDE_IMG.cercado },
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
          background: `linear-gradient(rgba(150,0,0,0.85), rgba(20,0,0,0.95)), url("${FOTOS.mmaControl}")`, 
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
              background: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(10,10,10,1)), url("${FOTOS.patadaJaula}")`,
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
        <div style={{ padding: '40px 20px 10px 20px', textAlign: 'center', background: '#000' }}>
          <h1 style={{ margin: 0, fontSize: '3.5rem', fontWeight: '900', textTransform: 'uppercase', color: '#fff', letterSpacing: '2px' }}>TIENDA OFICIAL ACC</h1>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Notification Banner */}
            {notification && (
              <div style={{ background: 'rgba(5, 150, 105, 0.2)', border: '1px solid #059669', color: '#34d399', padding: '16px 24px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}>
                <span>{notification}</span>
                <button onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', color: '#34d399', fontSize: '20px', cursor: 'pointer' }}>✕</button>
              </div>
            )}

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', borderBottom: '1px solid #222', paddingBottom: '15px' }}>
              {['TODOS', 'Equipamiento', 'Ropa de Combate', 'Ropa Casual', 'Accesorios'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setShopCategory(cat)}
                  style={{
                    background: shopCategory === cat ? '#ff0000' : '#141414',
                    color: shopCategory === cat ? '#fff' : '#888',
                    border: '1px solid ' + (shopCategory === cat ? '#ff0000' : '#262626'),
                    padding: '10px 22px',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {cat} {cat === 'TODOS' ? `(${productsList.length})` : `(${productsList.filter(p => p.category === cat).length})`}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '30px' }}>
              {productsList
                .filter(p => shopCategory === 'TODOS' || p.category === shopCategory)
                .map(product => {
                  const isLowStock = product.stock > 0 && product.stock <= 5;
                  const isOutOfStock = product.stock === 0;

                  return (
                    <div 
                      key={product.id}
                      style={{
                        background: '#0d0d0d',
                        border: '1px solid #222',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-6px)';
                        e.currentTarget.style.borderColor = '#ff0000';
                        e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 0, 0, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = '#222';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      onClick={() => {
                        setSelectedProduct(product);
                        setSelectedSize(product.sizes[0]);
                        setBuyQuantity(1);
                      }}
                    >
                      {/* Product Image Container */}
                      <div style={{ position: 'relative', height: '320px', background: '#121212', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />

                        {/* Top Badge */}
                        <span style={{ position: 'absolute', top: '15px', left: '15px', background: product.badgeBg, color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {product.badge}
                        </span>

                        {/* Stock Counter Badge */}
                        <div style={{ position: 'absolute', bottom: '15px', right: '15px', backdropFilter: 'blur(8px)', background: isOutOfStock ? 'rgba(239, 68, 68, 0.9)' : isLowStock ? 'rgba(217, 119, 6, 0.9)' : 'rgba(16, 185, 129, 0.9)', color: '#fff', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }}></span>
                          {isOutOfStock ? 'AGOTADO' : isLowStock ? `¡Últimas ${product.stock} unidades!` : `Stock: ${product.stock} dispon.`}
                        </div>
                      </div>

                      {/* Product Info */}
                      <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: '#ff0000', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {product.category}
                          </span>
                          <h3 style={{ margin: '8px 0 12px 0', fontSize: '20px', fontWeight: '800', color: '#fff', lineHeight: '1.3' }}>
                            {product.name}
                          </h3>
                          <p style={{ color: '#888', fontSize: '13px', margin: '0 0 18px 0', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {product.description}
                          </p>
                        </div>

                        <div>
                          {/* Price & Sizes */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                            <div>
                              <span style={{ fontSize: '11px', color: '#666', textTransform: 'uppercase', display: 'block' }}>PRECIO OFICIAL</span>
                              <span style={{ fontSize: '24px', fontWeight: '900', color: '#fff' }}>{product.priceFormatted}</span>
                            </div>

                            <div style={{ display: 'flex', gap: '5px' }}>
                              {product.sizes.map(size => (
                                <span key={size} style={{ background: '#1c1c1c', border: '1px solid #333', color: '#ccc', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                                  {size}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Action Button */}
                          <button 
                            disabled={isOutOfStock}
                            style={{ 
                              width: '100%', 
                              background: isOutOfStock ? '#333' : '#ff0000', 
                              color: isOutOfStock ? '#666' : 'white', 
                              border: 'none', 
                              padding: '14px', 
                              borderRadius: '6px', 
                              fontWeight: '900', 
                              fontSize: '14px', 
                              textTransform: 'uppercase', 
                              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                              letterSpacing: '0.5px'
                            }}
                          >
                            {isOutOfStock ? 'SIN STOCK DISPONIBLE' : 'VER DETALLES Y COMPRAR'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Dialog for Selected Product */}
            {selectedProduct && (
              <div 
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 9999,
                  background: 'rgba(0,0,0,0.85)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'center',
                  padding: '20px'
                }}
                onClick={() => setSelectedProduct(null)}
              >
                <div 
                  style={{
                    background: '#111',
                    border: '1px solid #333',
                    borderRadius: '16px',
                    width: '100%',
                    maxWidth: '850px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'row',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                    position: 'relative'
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  {/* Close button */}
                  <button 
                    onClick={() => setSelectedProduct(null)}
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '18px', zIndex: 10 }}
                  >
                    ✕
                  </button>

                  {/* Left Column: Image */}
                  <div style={{ flex: '1', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', borderRight: '1px solid #222' }}>
                    <img src={selectedProduct.image} alt={selectedProduct.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>

                  {/* Right Column: Details */}
                  <div style={{ flex: '1', padding: '35px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ color: '#ff0000', fontWeight: '800', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {selectedProduct.category}
                      </span>
                      <h2 style={{ margin: '10px 0 10px 0', fontSize: '26px', fontWeight: '900', color: '#fff' }}>
                        {selectedProduct.name}
                      </h2>
                      <div style={{ fontSize: '30px', fontWeight: '900', color: '#ff0000', marginBottom: '15px' }}>
                        {selectedProduct.priceFormatted}
                      </div>

                      {/* Stock Indicator inside Modal */}
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', marginBottom: '20px', color: selectedProduct.stock > 5 ? '#34d399' : '#fbbf24' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: selectedProduct.stock > 5 ? '#34d399' : '#fbbf24' }}></span>
                        <span>Stock disponible: <strong>{selectedProduct.stock} unidades en almacén ACC</strong></span>
                      </div>

                      <p style={{ color: '#aaa', fontSize: '14px', lineHeight: '1.6', margin: '0 0 25px 0' }}>
                        {selectedProduct.description}
                      </p>

                      {/* Size Selection */}
                      <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', color: '#fff', fontSize: '12px', fontWeight: 'bold', marginBottom: '10px', textTransform: 'uppercase' }}>
                          SELECCIONAR TALLA / TAMAÑO:
                        </label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          {selectedProduct.sizes.map(size => (
                            <button
                              key={size}
                              onClick={() => setSelectedSize(size)}
                              style={{
                                background: selectedSize === size ? '#ff0000' : '#1e1e1e',
                                color: selectedSize === size ? '#fff' : '#888',
                                border: '1px solid ' + (selectedSize === size ? '#ff0000' : '#333'),
                                padding: '10px 18px',
                                borderRadius: '6px',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', color: '#fff', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>
                          CANTIDAD:
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <button 
                            onClick={() => setBuyQuantity(prev => Math.max(1, prev - 1))}
                            style={{ background: '#222', border: '1px solid #444', color: '#fff', width: '36px', height: '36px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '18px' }}
                          >
                            -
                          </button>
                          <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', minWidth: '20px', textAlign: 'center' }}>
                            {buyQuantity}
                          </span>
                          <button 
                            onClick={() => setBuyQuantity(prev => Math.min(selectedProduct.stock, prev + 1))}
                            style={{ background: '#222', border: '1px solid #444', color: '#fff', width: '36px', height: '36px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '18px' }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Modal Purchase Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <button 
                        onClick={() => handleReserveProduct(selectedProduct, selectedSize, buyQuantity)}
                        style={{
                          background: '#ff0000',
                          color: '#fff',
                          border: 'none',
                          padding: '16px',
                          borderRadius: '8px',
                          fontWeight: '900',
                          fontSize: '14px',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          letterSpacing: '0.5px'
                        }}
                      >
                        ⚡ RESERVAR Y RECOGER EN SEDE (S/ {(selectedProduct.price * buyQuantity).toFixed(2)})
                      </button>

                      <button 
                        onClick={() => {
                          const text = encodeURIComponent(`Hola ACC! Deseo comprar ${buyQuantity}x ${selectedProduct.name} (Talla: ${selectedSize || 'Estándar'}) por un total de S/ ${(selectedProduct.price * buyQuantity).toFixed(2)}. ¿Tienen stock en sede?`);
                          window.open(`https://wa.me/51999999999?text=${text}`, '_blank');
                        }}
                        style={{
                          background: '#128c7e',
                          color: '#fff',
                          border: 'none',
                          padding: '14px',
                          borderRadius: '8px',
                          fontWeight: '800',
                          fontSize: '13px',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justify: 'center',
                          gap: '8px'
                        }}
                      >
                        💬 PEDIR POR WHATSAPP INMEDIATO
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
