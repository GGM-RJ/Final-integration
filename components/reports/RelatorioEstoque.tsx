import React, { useState, useMemo } from 'react';
import { StockItem } from '../../types';
import { handlePrint } from '../../utils/print';
import { quintaService } from '../../services/quintaService';

interface RelatorioEstoqueProps {
  stock: StockItem[];
  quintas: {name: string}[];
}

const RelatorioEstoque: React.FC<RelatorioEstoqueProps> = ({ stock, quintas }) => {
  const [selectedLocation, setSelectedLocation] = useState('Todas');

  // Generate list of available locations including Quintas and General Stock
  const locations = useMemo(() => {
    const quintaNames = quintas.map(q => q.name);
    return ['Todas', 'Stock Geral', ...quintaNames];
  }, [quintas]);

  // Filter and Group Data
  const reportData = useMemo<{ [key: string]: StockItem[] }>(() => {
    const groups: { [key: string]: StockItem[] } = {};
    
    // Initialize groups based on selection to ensure specific order or existence
    if (selectedLocation === 'Todas') {
        groups['Stock Geral'] = [];
        quintas.forEach(q => groups[q.name] = []);
    } else {
        groups[selectedLocation] = [];
    }

    stock.forEach(item => {
        // Skip items with zero quantity
        if (item.quantity <= 0) return;

        const itemLocation = item.quintaName || 'Stock Geral';

        // Filter logic
        if (selectedLocation !== 'Todas' && itemLocation !== selectedLocation) {
            return;
        }

        if (!groups[itemLocation]) {
            groups[itemLocation] = [];
        }
        groups[itemLocation].push(item);
    });

    // Sort items within each group by brand
    Object.keys(groups).forEach(location => {
        groups[location].sort((a, b) => a.brand.localeCompare(b.brand));
    });

    // Remove empty groups if "Todas" is selected to avoid clutter, 
    // unless you want to show 0 stock locations (optional preference).
    // Here we keep them if they exist in the map to show "No stock".
    return groups;
  }, [stock, selectedLocation]);

  const generateReportContent = () => {
    const dateStr = new Date().toLocaleString();
    
    let htmlContent = `<div style="margin-bottom: 20px;"><strong>Data do Relatório:</strong> ${dateStr}</div>`;

    Object.entries(reportData).forEach(([location, items]: [string, StockItem[]]) => {
        // Skip locations with no available stock
        if (items.length === 0) return;
        
        const totalBottles = items.reduce((acc, item) => acc + item.quantity, 0);

        const tableRows = items.map(item => `
            <tr>
                <td>${item.brand.trim().toUpperCase() === 'ALTANO' ? 'ALTANO' : item.brand}</td>
                <td>${item.wineName}</td>
                <td>${item.wineType}</td>
                <td style="text-align: right; font-weight: bold;">${item.quantity}</td>
            </tr>
        `).join('');

        htmlContent += `
            <div style="page-break-inside: avoid; margin-bottom: 30px;">
                <h2 style="border-bottom: 2px solid #6b21a8; color: #4a044e; padding-bottom: 5px;">${location} <span style="font-size: 14px; color: #666; font-weight: normal;">(Total: ${totalBottles} garrafas)</span></h2>
                <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
                    <thead>
                        <tr style="background-color: #f3e8ff;">
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Marca</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Vinho</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Tipo</th>
                            <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Qtd</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        `;
    });

    return htmlContent;
  };

  const onPrint = () => {
    const title = selectedLocation === 'Todas' ? 'Relatório Geral de Stock (Todas as Localizações)' : `Relatório de Stock - ${selectedLocation}`;
    handlePrint(title, generateReportContent());
  };

  const totalBottlesInView = Object.values(reportData).reduce((acc: number, items: StockItem[]) => {
      return acc + items.reduce((sum, item) => sum + item.quantity, 0);
  }, 0);

  return (
    <div>
        <div className="bg-gray-50 p-4 rounded-lg border mb-6">
            <h3 className="font-bold text-lg text-gray-800 mb-4">Filtros de Stock</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-end">
                <div className="w-full sm:w-1/2">
                    <label htmlFor="locationSelect" className="block text-sm font-medium text-gray-700 mb-1">Selecione a Localização:</label>
                    <select
                        id="locationSelect"
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    >
                        {locations.map(loc => (
                            <option key={loc} value={loc}>{loc === 'Todas' ? 'Todas as Localizações (Relatório Completo)' : loc}</option>
                        ))}
                    </select>
                </div>
                <div className="w-full sm:w-auto">
                    <button 
                        onClick={onPrint} 
                        className="w-full sm:w-auto px-6 py-2 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 shadow-sm flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Imprimir Relatório
                    </button>
                </div>
            </div>
        </div>

        <div className="mb-4 text-right">
            <span className="text-sm font-medium text-gray-600">Total visualizado: <span className="text-purple-700 text-lg font-bold">{totalBottlesInView}</span> garrafas</span>
        </div>

        <div className="space-y-8">
            {Object.entries(reportData).map(([location, items]: [string, StockItem[]]) => {
                // Check if we should render this block
                if (items.length === 0) {
                     return null; 
                }
                
                const sectionTotal = items.reduce((acc, i) => acc + i.quantity, 0);

                return (
                    <div key={location} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                        <div className="bg-purple-50 px-6 py-3 border-b border-purple-100 flex justify-between items-center">
                            <h3 className="font-bold text-purple-900">{location}</h3>
                            <span className="text-xs font-semibold bg-purple-200 text-purple-800 px-2 py-1 rounded-full">
                                {sectionTotal} garrafas
                            </span>
                        </div>
                        
                        {items.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-600">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3">Marca</th>
                                            <th className="px-6 py-3">Nome do Vinho</th>
                                            <th className="px-6 py-3">Tipo</th>
                                            <th className="px-6 py-3 text-right">Quantidade</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map(item => (
                                            <tr key={item.id} className="border-b hover:bg-gray-50 last:border-b-0">
                                                <td className="px-6 py-3 font-medium">{item.brand.trim().toUpperCase() === 'ALTANO' ? 'ALTANO' : item.brand}</td>
                                                <td className="px-6 py-3">{item.wineName}</td>
                                                <td className="px-6 py-3">{item.wineType}</td>
                                                <td className="px-6 py-3 text-right font-bold text-gray-800">{item.quantity}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-6 text-center text-gray-400 italic text-sm">
                                Nenhum vinho em estoque nesta localização.
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    </div>
  );
};

export default RelatorioEstoque;