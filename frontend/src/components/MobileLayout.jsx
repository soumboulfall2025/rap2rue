import { FaMapMarkerAlt, FaCompass, FaCamera, FaUsers, FaUser, FaPlus } from 'react-icons/fa';

export default function MobileLayout({ tabs, activeTab, setActiveTab, children, onFabClick, fabIcon, bottomNav, fabLabel }) {
  return (
    <div className="min-h-screen bg-black flex flex-col relative pb-20">
      {/* Barre d'onglets horizontale */}
      {tabs && (
        <div className="sticky top-0 z-20 bg-black/90 flex overflow-x-auto border-b border-white/10 shadow-md">
          {tabs.map((tab, idx) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(idx)}
              className={`px-6 py-3 text-base font-bold whitespace-nowrap transition rounded-t-2xl mx-1 mt-1 mb-0.5 focus:outline-none focus:ring-2 focus:ring-[#1DB954] ${activeTab === idx ? 'bg-[#1DB954] text-black shadow-lg' : 'bg-[#18181b] text-white/80 hover:bg-[#232323]'}`}
              aria-current={activeTab === idx ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Contenu principal */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-3">
        {children}
      </div>

      {/* Bouton flottant */}
      {onFabClick && (
        <button
          className="fixed bottom-24 right-6 z-40 bg-[#1DB954] text-black p-5 rounded-full shadow-2xl border-4 border-white/10 hover:bg-red-600 hover:text-white transition text-3xl flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-[#1DB954]/50"
          onClick={onFabClick}
          aria-label={fabLabel || 'Action principale'}
        >
          {fabIcon || <FaPlus />}
        </button>
      )}

      {/* Barre de navigation en bas */}
      <nav className="fixed bottom-0 left-0 w-full bg-[#18181b] border-t border-white/10 flex justify-between items-center px-2 py-2 z-50 shadow-2xl">
        {bottomNav ? bottomNav : (
          <>
            <NavIcon icon={<FaMapMarkerAlt />} label="Localisation" />
            <NavIcon icon={<FaCompass />} label="Découvrir" />
            <NavIcon icon={<FaCamera />} label="Caméra" />
            <NavIcon icon={<FaUsers />} label="Communauté" />
            <NavIcon icon={<FaUser />} label="Profil" />
          </>
        )}
      </nav>
    </div>
  );
}

function NavIcon({ icon, label }) {
  return (
    <button className="flex flex-col items-center justify-center flex-1 text-white hover:text-[#1DB954] transition focus:outline-none focus:ring-2 focus:ring-[#1DB954]">
      <span className="text-2xl mb-0.5">{icon}</span>
      <span className="text-xs font-semibold">{label}</span>
    </button>
  );
}
