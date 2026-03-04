
import React, { useState, useEffect } from 'react';
import { StockItem, WineType, ID } from '../types';

interface EditWineModalProps {
  isOpen: boolean;
  onClose: () => void;
  wine: StockItem | null;
  onUpdateWine: (id: ID, updatedData: Partial<StockItem>) => void;
}

const EditWineModal: React.FC<EditWineModalProps> = ({ isOpen, onClose, wine, onUpdateWine }) => {
  const [brand, setBrand] = useState('');
  const [wineName, setWineName] = useState('');
  const [wineType, setWineType] = useState<WineType>('Tinto');

  useEffect(() => {
    if (wine) {
      setBrand(wine.brand);
      setWineName(wine.wineName);
      setWineType(wine.wineType);
    }
  }, [wine]);

  if (!isOpen || !wine) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalBrand = brand.trim().toUpperCase() === 'ALTANO' ? 'ALTANO' : brand.trim();
    onUpdateWine(wine.id, {
      brand: finalBrand,
      wineName: wineName.trim(),
      wineType,
    });
    onClose();
  };

  const wineTypes: WineType[] = ['Tinto', 'Branco', 'Rosé', 'Porto', 'Espumante'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-purple-600 p-6 text-white">
          <h2 className="text-2xl font-bold">Modificar Vinho</h2>
          <p className="text-purple-100 text-sm mt-1">Corrija os dados básicos do vinho.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="edit-brand" className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
            <input
              type="text"
              id="edit-brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="edit-wineName" className="block text-sm font-medium text-gray-700 mb-1">Nome do Vinho</label>
            <input
              type="text"
              id="edit-wineName"
              value={wineName}
              onChange={(e) => setWineName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="edit-wineType" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Vinho</label>
            <select
              id="edit-wineType"
              value={wineType}
              onChange={(e) => setWineType(e.target.value as WineType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
            >
              {wineTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditWineModal;
