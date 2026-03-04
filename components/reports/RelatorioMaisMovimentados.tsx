import React, { useMemo, useState } from 'react';
import { TransferLog } from '../../types';
import { handlePrint } from '../../utils/print';
import { handleExportCSV } from '../../utils/export';
import { quintaService } from '../../services/quintaService';

interface RelatorioMaisMovimentadosProps {
  transferHistory: TransferLog[];
  quintas: {name: string}[];
}

interface WineMovementStats {
    key: string;
    brand: string;
    wineName: string;
    transferCount: number;
    totalQuantity: number;
}

const RelatorioMaisMovimentados: React.FC<RelatorioMaisMovimentadosProps> = ({ transferHistory, quintas }) => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const [selectedQuinta, setSelectedQuinta] = useState('Todas');


  const rankedWines = useMemo(() => {
    const filteredHistory = transferHistory.filter(log => {
        const logDate = new Date(log.date);
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T23:59:59');
  
        const isDateInRange = logDate >= start && logDate <= end;
        if (!isDateInRange) return false;
  
        const isQuintaMatch = selectedQuinta === 'Todas' || log.fromQuinta === selectedQuinta || log.toQuinta === selectedQuinta;
        if (!isQuintaMatch) return false;
  
        return true;
      });

    const stats: { [key: string]: WineMovementStats } = {};

    filteredHistory.forEach(log => {
      const key = `${log.brand}-${log.wineName}`;
      if (!stats[key]) {
        stats[key] = {
          key,
          brand: log.brand,
          wineName: log.wineName,
          transferCount: 0,
          totalQuantity: 0,
        };
      }
      stats[key].transferCount += 1;
      stats[key].totalQuantity += log.quantity;
    });
    
    return Object.values(stats).sort((a, b) => b.transferCount - a.transferCount || b.totalQuantity - a.totalQuantity);
  }, [transferHistory, startDate, endDate, selectedQuinta]);

  const generateReportContent = () => {
    const tableRows = rankedWines.map((wine, index) => {
        const normalizedBrand = wine.brand.trim().toUpperCase() === 'ALTANO' ? 'ALTANO' : wine.brand;
        return `
            <tr>
                <td style="text-align: center; font-weight: bold;">${index + 1}</td>
                <td>${normalizedBrand}</td>
                <td>${wine.wineName}</td>
                <td style="text-align: right;">${wine.transferCount}</td>
                <td style="text-align: right;">${wine.totalQuantity}</td>
            </tr>
        `;
    }).join('');

    return `
        <div class="summary">
            <strong>Filtros Aplicados:</strong><br>
            Período: ${new Date(startDate).toLocaleDateString()} a ${new Date(endDate).toLocaleDateString()}<br>
            Quinta: ${selectedQuinta}
        </div>
        <table>
            <thead>
                <tr>
                    <th style="text-align: center;">Rank</th>
                    <th>Marca</th>
                    <th>Nome do Vinho</th>
                    <th style="text-align: right;">Nº de Movimentações</th>
                    <th style="text-align: right;">Qtd. Total Movida</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
  };

  const onPrint = () => {
      const title = `Relatório de Vinhos Mais Movimentados`;
      handlePrint(title, generateReportContent());
  };
  
  const onExport = () => {
    const dataToExport = rankedWines.map((wine, index) => ({
        Rank: index + 1,
        Marca: wine.brand.trim().toUpperCase() === 'ALTANO' ? 'ALTANO' : wine.brand,
        Vinho: wine.wineName,
        NumeroDeMovimentacoes: wine.transferCount,
        QuantidadeTotalMovida: wine.totalQuantity,
    }));
    handleExportCSV(dataToExport, `vinhos_mais_movimentados_${startDate}_a_${endDate}`);
  }

  const allQuintas = ['Todas', ...quintas.map(q => q.name), 'Stock Geral', 'Consumo'];

  return (
    <div>
        <div className="p-4 bg-gray-50 border rounded-lg mb-6 space-y-4">
            <h3 className="font-bold text-lg text-gray-800">Filtros do Relatório</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Data de Início</label>
                    <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500"/>
                </div>
                 <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Data de Fim</label>
                    <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500"/>
                </div>
                <div>
                    <label htmlFor="selectedQuinta" className="block text-sm font-medium text-gray-700">Quinta</label>
                    <select id="selectedQuinta" value={selectedQuinta} onChange={e => setSelectedQuinta(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-purple-500">
                        {allQuintas.map(q => <option key={q} value={q}>{q}</option>)}
                    </select>
                </div>
            </div>
        </div>
        <div className="flex justify-end mb-4 gap-2">
            <button onClick={onExport} className="px-4 py-2 text-sm bg-green-600 text-white font-semibold rounded-md hover:bg-green-700">
                Exportar para CSV
            </button>
            <button onClick={onPrint} className="px-4 py-2 text-sm bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700">
                Imprimir Relatório
            </button>
        </div>
        {rankedWines.length > 0 ? (
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-center">Rank</th>
                            <th className="px-6 py-3">Vinho</th>
                            <th className="px-6 py-3 text-right">Nº de Movimentações</th>
                            <th className="px-6 py-3 text-right">Qtd. Total Movida</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rankedWines.map((wine, index) => (
                            <tr key={wine.key} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 text-center font-bold text-lg text-purple-700">{index + 1}</td>
                                <td className="px-6 py-4 font-medium">
                                    <div className="text-gray-800">{wine.brand.trim().toUpperCase() === 'ALTANO' ? 'ALTANO' : wine.brand}</div>
                                    <div className="text-gray-500 text-xs">{wine.wineName}</div>
                                </td>
                                <td className="px-6 py-4 text-right font-semibold">{wine.transferCount}</td>
                                <td className="px-6 py-4 text-right font-bold text-gray-800">{wine.totalQuantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        ) : (
             <p className="text-center text-gray-500 py-8">Nenhuma movimentação encontrada para os filtros selecionados.</p>
        )}
    </div>
  );
};

export default RelatorioMaisMovimentados;