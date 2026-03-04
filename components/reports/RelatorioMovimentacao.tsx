import React, { useState, useMemo } from 'react';
import { TransferLog } from '../../types';
import { handlePrint } from '../../utils/print';
import { handleExportXLSX } from '../../utils/export';
import { quintaService } from '../../services/quintaService';

interface RelatorioMovimentacaoProps {
  transferHistory: TransferLog[];
  quintas: {name: string}[];
}

const RelatorioMovimentacao: React.FC<RelatorioMovimentacaoProps> = ({ transferHistory, quintas }) => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const [selectedQuinta, setSelectedQuinta] = useState('Todas');

  const filteredTransfers = useMemo(() => {
    return transferHistory.filter(log => {
      const logDate = new Date(log.date);
      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T23:59:59');

      const isDateInRange = logDate >= start && logDate <= end;
      if (!isDateInRange) return false;

      const isQuintaMatch = selectedQuinta === 'Todas' || log.fromQuinta === selectedQuinta || log.toQuinta === selectedQuinta;
      if (!isQuintaMatch) return false;

      return true;
    });
  }, [transferHistory, startDate, endDate, selectedQuinta]);

  const summary = useMemo(() => {
    return filteredTransfers.reduce((acc, log) => {
        if(log.movementType === 'Entrada') {
            acc.entradas += log.quantity;
        } else {
            acc.saidas += log.quantity;
        }
        return acc;
    }, { entradas: 0, saidas: 0 });
  }, [filteredTransfers]);

  const generateReportContent = () => {
    const tableRows = filteredTransfers.map(log => {
        const normalizedBrand = log.brand.trim().toUpperCase() === 'ALTANO' ? 'ALTANO' : log.brand;
        return `
            <tr>
                <td>${new Date(log.date).toLocaleString()}</td>
                <td>${normalizedBrand} - ${log.wineName}</td>
                <td>${log.movementType}</td>
                <td style="text-align: right;">${log.quantity}</td>
                <td>${log.fromQuinta}</td>
                <td>${log.toQuinta}</td>
                <td>${log.status}</td>
            </tr>
        `;
    }).join('');

    return `
        <div class="summary">
            <strong>Resumo do Período (${new Date(startDate).toLocaleDateString()} a ${new Date(endDate).toLocaleDateString()}):</strong><br>
            Quinta: ${selectedQuinta}<br>
            Total de Entradas: ${summary.entradas} garrafas<br>
            Total de Saídas: ${summary.saidas} garrafas
        </div>
        <table>
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Vinho</th>
                    <th>Tipo</th>
                    <th style="text-align: right;">Qtd</th>
                    <th>De</th>
                    <th>Para</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
  };

  const onPrint = () => {
      const title = `Relatório de Movimentação (${new Date(startDate).toLocaleDateString()} a ${new Date(endDate).toLocaleDateString()})`;
      handlePrint(title, generateReportContent());
  };

  const onExport = () => {
    const dataToExport = filteredTransfers.map(log => ({
        Data: new Date(log.date).toLocaleString(),
        Marca: log.brand.trim().toUpperCase() === 'ALTANO' ? 'ALTANO' : log.brand,
        Vinho: log.wineName,
        TipoMovimento: log.movementType,
        Quantidade: log.quantity,
        Origem: log.fromQuinta,
        Destino: log.toQuinta,
        Solicitante: log.requesterName,
        Status: log.status,
    }));
    handleExportXLSX(dataToExport, `movimentacao_${startDate}_a_${endDate}`);
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
                Exportar para XLSX
            </button>
             <button onClick={onPrint} className="px-4 py-2 text-sm bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700">
                Imprimir Relatório
            </button>
        </div>

        <div className="p-4 bg-gray-50 border rounded-lg mb-6">
            <h3 className="font-bold text-lg text-gray-800">Resumo do Período Selecionado</h3>
            <p className="text-gray-600">Total de Entradas: <span className="font-bold text-green-600">{summary.entradas}</span> garrafas</p>
            <p className="text-gray-600">Total de Saídas: <span className="font-bold text-red-600">{summary.saidas}</span> garrafas</p>
        </div>

      {filteredTransfers.length > 0 ? (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th className="px-6 py-3">Data</th>
                        <th className="px-6 py-3">Vinho</th>
                        <th className="px-6 py-3">Tipo</th>
                        <th className="px-6 py-3 text-right">Quantidade</th>
                        <th className="px-6 py-3">De</th>
                        <th className="px-6 py-3">Para</th>
                        <th className="px-6 py-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTransfers.map(log => (
                        <tr key={log.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4">{new Date(log.date).toLocaleString()}</td>
                            <td className="px-6 py-4 font-medium">{log.brand.trim().toUpperCase() === 'ALTANO' ? 'ALTANO' : log.brand} - {log.wineName}</td>
                            <td className="px-6 py-4">{log.movementType}</td>
                            <td className="px-6 py-4 text-right font-bold">{log.quantity}</td>
                            <td className="px-6 py-4">{log.fromQuinta}</td>
                            <td className="px-6 py-4">{log.toQuinta}</td>
                            <td className="px-6 py-4">{log.status}</td>
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

export default RelatorioMovimentacao;