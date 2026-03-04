import React, { useState } from 'react';
import { StockItem, WineType } from '../types';

interface AddWineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWine: (newWine: Omit<StockItem, 'id'>) => void;
}

const wineTypes: WineType[] = ['Tinto', 'Branco', 'Rosé', 'Porto', 'Espumante'];

const AddWineModal: React.FC<AddWineModalProps> = ({ isOpen, onClose, onAddWine }) => {
  const [brand, setBrand] = useState('');
  const [wineName, setWineName] = useState('');
  const [wineType, setWineType] = useState<WineType>(wineTypes[0]);
  const [quantity, setQuantity] = useState<number | ''>('');
  const [lowStockAlert, setLowStockAlert] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (brand && wineName && wineType && quantity) {
      const finalBrand = brand.trim().toUpperCase() === 'ALTANO' ? 'ALTANO' : brand.trim();
      onAddWine({
        brand: finalBrand,
        wineName: wineName.trim(),
        wineType,
        quantity: Number(quantity),
        lowStockAlert,
      });
      // Reset form and close modal
      setBrand('');
      setWineName('');
      setWineType(wineTypes[0]);
      setQuantity('');
      setLowStockAlert(false);
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Adicionar Novo Vinho</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Marca do Vinho</label>
            <input
              type="text"
              id="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="wineName" className="block text-sm font-medium text-gray-700">Nome do Vinho</label>
            <input
              type="text"
              id="wineName"
              value={wineName}
              onChange={(e) => setWineName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="wineType" className="block text-sm font-medium text-gray-700">Tipo de Vinho</label>
            <select
              id="wineType"
              value={wineType}
              onChange={(e) => setWineType(e.target.value as WineType)}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              required
            >
              {wineTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantidade</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              required
            />
          </div>
          <div className="mb-6">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <input
                    type="checkbox"
                    checked={lowStockAlert}
                    onChange={(e) => setLowStockAlert(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <span>Alertar quando stock baixo (≤ 6 garrafas)</span>
            </label>
          </div>
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Salvar Vinho
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWineModal;