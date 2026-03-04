
import React, { useState, useMemo } from 'react';
import { StockItem, ID } from '../types';
import WineCard from './WineCard';
import EditWineModal from './EditWineModal';
import { useAuth } from '../contexts/AuthContext';
import { quintaService } from '../services/quintaService';

interface VinhosProps {
    stock: StockItem[];
    quintas: {name: string}[];
    onUpdateWine: (id: ID, updatedData: Partial<StockItem>) => void;
}

const Vinhos: React.FC<VinhosProps> = ({ stock, quintas, onUpdateWine }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuinta, setSelectedQuinta] = useState('Todas as Quintas');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedWineId, setSelectedWineId] = useState<ID | null>(null);
  const { currentUser } = useAuth();

  const canEdit = currentUser?.role === 'Supervisor';

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleQuintaChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedQuinta(event.target.value);
  };

  const handleOpenEditModal = (id: ID) => {
    setSelectedWineId(id);
    setIsEditModalOpen(true);
  };

  const selectedWine = useMemo(() => {
    if (selectedWineId === null) return null;
    return stock.find(s => s.id === selectedWineId) || null;
  }, [stock, selectedWineId]);

  // Filtra para incluir apenas vinhos que estão em uma quinta e que têm quantidade > 0
  const winesInQuintasWithStock = stock.filter(wine => !!wine.quintaName && wine.quantity > 0);

  const filteredWines = winesInQuintasWithStock
    .filter(wine => {
        if (selectedQuinta === 'Todas as Quintas') {
            return true;
        }
        return wine.quintaName === selectedQuinta;
    })
    .filter(wine => {
      const term = searchTerm.toLowerCase();
      return (
        wine.brand.toLowerCase().includes(term) ||
        wine.wineName.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => a.brand.localeCompare(b.brand));
    
  const allQuintas = ['Todas as Quintas', ...quintas.map(q => q.name)];

  return (
    <div>
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full md:w-auto">
          <input
            type="text"
            placeholder="Pesquisar por marca ou nome do vinho..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>
            </div>
        </div>
        <div className="w-full md:w-auto md:min-w-[200px]">
          <select
            value={selectedQuinta}
            onChange={handleQuintaChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {allQuintas.map(quinta => (
              <option key={quinta} value={quinta}>
                {quinta}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredWines.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredWines.map((wine) => (
            <WineCard 
                key={wine.id} 
                wine={wine} 
                onEdit={canEdit ? () => handleOpenEditModal(wine.id) : undefined} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center bg-white p-8 rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold text-gray-700">Nenhum vinho encontrado</h3>
            <p className="text-gray-500 mt-2">Nenhum vinho com stock disponível foi encontrado nas quintas com os filtros selecionados.</p>
        </div>
      )}

      <EditWineModal
        isOpen={isEditModalOpen}
        onClose={() => {
            setIsEditModalOpen(false);
            setSelectedWineId(null);
        }}
        wine={selectedWine}
        onUpdateWine={onUpdateWine}
      />
    </div>
  );
};

export default Vinhos;
