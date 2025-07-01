import { useState } from 'react';
import MobileLayout from './MobileLayout';
import { FaPlus } from 'react-icons/fa';

const tabs = [
  { label: 'Tout' },
  { label: 'Non lus' },
  { label: 'Artistes' },
  { label: 'Albums' },
];

const mockList = [
  {
    id: 1,
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    title: 'Ninho',
    subtitle: 'Artiste',
    status: 'Nouveau',
    action: 'Écouter',
    color: 'bg-green-500',
    unread: true,
    type: 'Artistes',
  },
  {
    id: 2,
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    title: 'Album Street Vibes',
    subtitle: 'Album',
    status: 'À écouter',
    action: 'Ajouter',
    color: 'bg-yellow-500',
    unread: false,
    type: 'Albums',
  },
  {
    id: 3,
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
    title: 'SCH',
    subtitle: 'Artiste',
    status: 'Ajouté',
    action: 'Acheter',
    color: 'bg-blue-500',
    unread: false,
    type: 'Artistes',
  },
];

export default function MobileHome() {
  const [activeTab, setActiveTab] = useState(0);

  // Filtrage dynamique selon l’onglet
  const filteredList = mockList.filter((item) => {
    if (tabs[activeTab].label === 'Tout') return true;
    if (tabs[activeTab].label === 'Non lus') return item.unread;
    return item.type === tabs[activeTab].label;
  });

  return (
    <MobileLayout
      tabs={tabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onFabClick={() => alert('Action principale !')}
      fabIcon={<FaPlus />}
      fabLabel="Ajouter"
    >
      {filteredList.length === 0 && (
        <div className="text-center text-gray-400 py-10">Aucun résultat pour cet onglet.</div>
      )}
      {filteredList.map((item) => (
        <button
          key={item.id}
          className="w-full flex items-center bg-[#18181b] rounded-2xl shadow-lg p-3 gap-4 hover:bg-[#232323] active:scale-[0.98] transition group focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
          style={{ WebkitTapHighlightColor: 'transparent' }}
          aria-label={`${item.title}, ${item.status}`}
        >
          <img src={item.avatar} alt={item.title} className="w-14 h-14 rounded-full object-cover shadow-md border-2 border-[#1DB954]" />
          <div className="flex-1 text-left">
            <div className="font-bold text-lg text-white group-hover:text-[#1DB954]">{item.title}</div>
            <div className="text-xs text-gray-400">{item.subtitle}</div>
            <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full font-semibold ${item.color} text-black shadow`}>{item.status}</span>
          </div>
          <span className="ml-2 px-4 py-2 bg-[#1DB954] text-black rounded-full font-bold shadow hover:bg-white hover:text-[#1DB954] transition">
            {item.action}
          </span>
        </button>
      ))}
    </MobileLayout>
  );
}
