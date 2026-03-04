
import React, { useState, useMemo } from 'react';
import { StockItem, ID, TransferLog } from '../types';
import AddWineModal from './AddWineModal';
import AdjustStockModal from './AdjustStockModal';
import EditWineModal from './EditWineModal';
import { useAuth } from '../contexts/AuthContext';
import { handlePrint } from '../utils/print';

interface StockProps {
  stock: StockItem[];
  transferHistory: TransferLog[];
  onAddWine: (newWine: Omit<StockItem, 'id'>) => void;
  onDeleteWine: (id: ID) => void;
  onAddStockQuantity: (id: ID, quantity: number) => void;
  onRemoveStockQuantity: (id: ID, quantity: number) => void;
  onUpdateLowStockAlert: (id: ID, status: boolean) => void;
  onUpdateWine: (id: ID, updatedData: Partial<StockItem>) => void;
}

const Stock: React.FC<StockProps> = ({ 
  stock, 
  transferHistory,
  onAddWine, 
  onDeleteWine, 
  onAddStockQuantity, 
  onRemoveStockQuantity,
  onUpdateLowStockAlert,
  onUpdateWine
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // FIX: Use ID instead of the whole object to avoid stale state in the modal
  const [selectedWineId, setSelectedWineId] = useState<ID | null>(null);
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isGeneralStockExpanded, setIsGeneralStockExpanded] = useState(false);

  const canAddWine = currentUser?.role === 'Supervisor' || 
                     (currentUser?.role === 'Operador' && currentUser.permissions?.includes('Stock'));
                     
  const canDeleteWine = currentUser?.role === 'Supervisor';

  const generalStock = stock.filter(item => !item.quintaName);
  const generalStockWithQuantity = useMemo(() => generalStock.filter(i => i.quantity > 0), [generalStock]);

  const filterStock = (data: StockItem[]) => {
    let filtered = data;
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(item => 
            item.brand.toLowerCase().includes(term) ||
            item.wineName.toLowerCase().includes(term) ||
            item.wineType.toLowerCase().includes(term)
        );
    }
    // Always sort by brand name
    return [...filtered].sort((a, b) => a.brand.localeCompare(b.brand));
  };
  
  const filteredGeneralStock = filterStock(generalStock);
  const generalStockToShow = isGeneralStockExpanded ? filteredGeneralStock : filteredGeneralStock.slice(0, 5);
  
  const getPendingStock = (item: StockItem) => {
    const pendingOut = transferHistory
        .filter(t => t.status === 'Pendente' && 
                t.brand.trim().toLowerCase() === item.brand.trim().toLowerCase() && 
                t.wineName.trim().toLowerCase() === item.wineName.trim().toLowerCase() && 
                (t.fromQuinta === (item.quintaName || 'Stock Geral')))
        .reduce((acc, t) => acc + t.quantity, 0);
        
    const pendingIn = transferHistory
        .filter(t => t.status === 'Pendente' && 
                t.brand.trim().toLowerCase() === item.brand.trim().toLowerCase() && 
                t.wineName.trim().toLowerCase() === item.wineName.trim().toLowerCase() && 
                (t.toQuinta === (item.quintaName || 'Stock Geral')))
        .reduce((acc, t) => acc + t.quantity, 0);
        
    return { pendingOut, pendingIn };
  };

  const handleOpenAdjustModal = (item: StockItem) => {
    setSelectedWineId(item.id);
    setIsAdjustModalOpen(true);
  };

  const handleOpenEditModal = (item: StockItem) => {
    setSelectedWineId(item.id);
    setIsEditModalOpen(true);
  };

  const handlePrintGeneralStock = () => {
    const sortedGeneralStock = [...generalStockWithQuantity].sort((a, b) => a.brand.localeCompare(b.brand));
    const tableRows = sortedGeneralStock.map(item => `
        <tr>
            <td>${item.brand.trim().toUpperCase() === 'ALTANO' ? 'ALTANO' : item.brand}</td>
            <td>${item.wineName}</td>
            <td>${item.wineType}</td>
            <td style="text-align: right;">${item.quantity}</td>
            <td style="text-align: center;">${item.lowStockAlert ? 'Sim' : 'Não'}</td>
        </tr>
    `).join('');

    const content = `
        <div class="summary">
            <strong>Resumo do Stock Geral:</strong><br>
            Total de Rótulos: ${generalStockWithQuantity.length}<br>
            Total de Garrafas: ${generalStockWithQuantity.reduce((acc, item) => acc + item.quantity, 0)}
        </div>
        <table>
            <thead>
                <tr>
                    <th>Marca</th>
                    <th>Nome do Vinho</th>
                    <th>Tipo</th>
                    <th style="text-align: right;">Qtd</th>
                    <th style="text-align: center;">Alerta</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;

    handlePrint('Stock Geral Consolidado', content);
  };

  const handlePrintFullStock = () => {
    const itemsWithStock = stock
        .filter(item => item.quantity > 0)
        .sort((a, b) => a.brand.localeCompare(b.brand));
    
    // Group by location
    const grouped = itemsWithStock.reduce((acc, item) => {
        const location = item.quintaName || 'Stock Geral';
        if (!acc[location]) acc[location] = [];
        acc[location].push(item);
        return acc;
    }, {} as { [key: string]: StockItem[] });

    const sections = Object.entries(grouped).map(([location, items]) => {
        const rows = items.map(item => `
            <tr>
                <td>${item.brand.trim().toUpperCase() === 'ALTANO' ? 'ALTANO' : item.brand}</td>
                <td>${item.wineName}</td>
                <td>${item.wineType}</td>
                <td style="text-align: right;">${item.quantity}</td>
            </tr>
        `).join('');

        return `
            <h3 style="margin-top: 20px; border-bottom: 2px solid #eee; padding-bottom: 5px;">${location}</h3>
            <table>
                <thead>
                    <tr>
                        <th>Marca</th>
                        <th>Nome do Vinho</th>
                        <th>Tipo</th>
                        <th style="text-align: right;">Qtd</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" style="text-align: right; font-weight: bold;">Total ${location}:</td>
                        <td style="text-align: right; font-weight: bold;">${items.reduce((acc, i) => acc + i.quantity, 0)}</td>
                    </tr>
                </tfoot>
            </table>
        `;
    }).join('');

    const content = `
        <div class="summary">
            <strong>Relatório Geral de Stock (Apenas itens com quantidade):</strong><br>
            Data: ${new Date().toLocaleString()}<br>
            Total de Garrafas no Sistema: ${itemsWithStock.reduce((acc, item) => acc + item.quantity, 0)}
        </div>
        ${sections}
    `;

    handlePrint('Relatório Geral de Stock', content);
  };

  // FIX: Derive selectedWine from current stock array to ensure reactivity
  const selectedWine = useMemo(() => {
    if (selectedWineId === null) return null;
    return stock.find(s => s.id === selectedWineId) || null;
  }, [stock, selectedWineId]);


  return (
    <>
      <div className="bg-white p-8 rounded-xl shadow-sm">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-800">Gestão de Stock</h2>
          </div>
          {canAddWine && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors shadow-sm"
            >
              Adicionar Vinho
            </button>
          )}
        </div>
        
        <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-700 flex items-center gap-2">
                    Stock Geral
                    <span className="text-xs font-normal text-gray-400">(Vinhos em armazém central)</span>
                </h3>
                <button 
                    onClick={handlePrintGeneralStock}
                    className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 font-semibold rounded-md hover:bg-gray-200 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    Imprimir Stock Geral
                </button>
            </div>

            {/* Destaque do Stock Geral (Apenas vinhos com quantidade > 0) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg shadow-sm">
                    <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">Total de Rótulos</p>
                    <p className="text-2xl font-bold text-purple-900">{generalStockWithQuantity.length}</p>
                </div>
                <div className="p-4 bg-green-50 border border-green-100 rounded-lg shadow-sm">
                    <p className="text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">Total de Garrafas</p>
                    <p className="text-2xl font-bold text-green-900">
                        {generalStockWithQuantity.reduce((acc, item) => acc + item.quantity, 0)}
                    </p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg shadow-sm">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Vinhos em Alerta</p>
                    <p className="text-2xl font-bold text-blue-900">
                        {generalStockWithQuantity.filter(item => item.lowStockAlert && item.quantity <= 6).length}
                    </p>
                </div>
            </div>

            <div className="mb-6">
                <div className="relative max-w-lg">
                    <input 
                        type="text"
                        placeholder="Pesquisar por marca, nome ou tipo no Stock Geral..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm text-sm"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Marca</th>
                        <th scope="col" className="px-6 py-3">Nome do Vinho</th>
                        <th scope="col" className="px-6 py-3">Tipo</th>
                        <th scope="col" className="px-6 py-3 text-right">Quantidade</th>
                        <th scope="col" className="px-6 py-3 text-center">Alerta</th>
                        {canDeleteWine && <th scope="col" className="px-6 py-3 text-center">Ações</th>}
                    </tr>
                    </thead>
                    <tbody>
                    {generalStockToShow.map((item) => {
                        const { pendingOut, pendingIn } = getPendingStock(item);
                        return (
                            <tr key={item.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 font-medium text-gray-900">{item.brand.trim().toUpperCase() === 'ALTANO' ? 'ALTANO' : item.brand}</td>
                              <td className="px-6 py-4">{item.wineName}</td>
                              <td className="px-6 py-4">{item.wineType}</td>
                              <td className={`px-6 py-4 text-right font-bold ${item.lowStockAlert && item.quantity <= 6 ? 'text-red-600' : 'text-gray-800'}`}>
                                <div className="flex flex-col items-end">
                                    <span>{item.quantity}</span>
                                    {(pendingOut > 0 || pendingIn > 0) && (
                                        <div className="flex flex-col items-end text-[10px] font-normal mt-1">
                                            {pendingOut > 0 && <span className="text-orange-500">-{pendingOut} pendente</span>}
                                            {pendingIn > 0 && <span className="text-blue-500">+{pendingIn} pendente</span>}
                                        </div>
                                    )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                            {item.lowStockAlert && item.quantity <= 6 ? (
                                <span className="text-red-600">
                                    <svg className="w-5 h-5 mx-auto" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
                                </span>
                            ) : (
                                <span className="text-gray-200">
                                    <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 00-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                </span>
                            )}
                          </td>
                          {canDeleteWine && (
                            <td className="px-6 py-4 text-center space-x-3">
                                <button 
                                    onClick={() => handleOpenEditModal(item)}
                                    className="text-blue-600 hover:text-blue-900 font-medium"
                                >
                                    Modificar
                                </button>
                                <button 
                                    onClick={() => handleOpenAdjustModal(item)}
                                    className="text-purple-600 hover:text-purple-900 font-medium"
                                >
                                    Ajustar
                                </button>
                                <button 
                                    onClick={() => onDeleteWine(item.id)}
                                    className="text-red-600 hover:text-red-900 font-medium"
                                >
                                    Excluir
                                </button>
                            </td>
                          )}
                        </tr>
                    )})}
                    </tbody>
                </table>
            </div>

            {filteredGeneralStock.length > 5 && (
                <div className="mt-4 text-center">
                    <button 
                        onClick={() => setIsGeneralStockExpanded(!isGeneralStockExpanded)}
                        className="text-sm text-purple-600 hover:text-purple-800 font-semibold"
                    >
                        {isGeneralStockExpanded ? 'Ver menos' : `Ver todos os ${filteredGeneralStock.length} rótulos`}
                    </button>
                </div>
            )}
        </div>
      </div>

      <AddWineModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAddWine={onAddWine} 
      />

      <AdjustStockModal 
        isOpen={isAdjustModalOpen} 
        onClose={() => {
            setIsAdjustModalOpen(false);
            setSelectedWineId(null);
        }} 
        wine={selectedWine}
        onAddQuantity={onAddStockQuantity}
        onRemoveQuantity={onRemoveStockQuantity}
        onUpdateLowStockAlert={onUpdateLowStockAlert}
      />

      <EditWineModal
        isOpen={isEditModalOpen}
        onClose={() => {
            setIsEditModalOpen(false);
            setSelectedWineId(null);
        }}
        wine={selectedWine}
        onUpdateWine={onUpdateWine}
      />
    </>
  );
};

export default Stock;
