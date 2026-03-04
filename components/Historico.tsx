import React, { useState, useMemo } from 'react';
import { TransferLog, TransferStatus } from '../types';
import { handlePrint } from '../utils/print';
import { handleExportXLSX } from '../utils/export';
import { quintaService } from '../services/quintaService';

interface HistoricoProps {
  transferHistory: TransferLog[];
  quintas: {name: string}[];
}

const getStatusBadge = (status: TransferStatus) => {
    if (status.startsWith('Aprovado')) {
        return 'bg-green-100 text-green-800';
    }
    switch (status) {
        case 'Pendente':
            return 'bg-yellow-100 text-yellow-800';
        case 'Reprovado':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

const getMovementTypeBadge = (type: 'Entrada' | 'Saída') => {
    switch (type) {
        case 'Entrada':
            return 'bg-blue-100 text-blue-800';
        case 'Saída':
            return 'bg-orange-100 text-orange-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

const Historico: React.FC<HistoricoProps> = ({ transferHistory, quintas }) => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedQuinta, setSelectedQuinta] = useState<string>('Todas');

    const allQuintas = useMemo(() => {
        return ['Todas', ...quintas.map(q => q.name), 'Consumo'];
    }, [quintas]);

    const filteredHistory = useMemo(() => {
        return transferHistory.filter(log => {
            // Date filter
            if (selectedDate) {
                const filterDateStart = new Date(selectedDate);
                filterDateStart.setHours(0, 0, 0, 0);
                
                const filterDateEnd = new Date(filterDateStart);
                filterDateEnd.setDate(filterDateEnd.getDate() + 1);
                
                const logDate = new Date(log.date);
                if (!(logDate >= filterDateStart && logDate < filterDateEnd)) {
                    return false;
                }
            }

            // Quinta filter
            if (selectedQuinta !== 'Todas') {
                if (log.fromQuinta !== selectedQuinta && log.toQuinta !== selectedQuinta) {
                    return false;
                }
            }

            return true;
        });
    }, [transferHistory, selectedDate, selectedQuinta]);

    const sortedHistory = [...filteredHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const generatePrintContent = (logs: TransferLog[]) => {
        const tableRows = logs.map(log => {
            const normalizedBrand = log.brand.trim().toUpperCase() === 'ALTANO' ? 'ALTANO' : log.brand;
            return `
                <tr>
                    <td>${new Date(log.date).toLocaleString()}</td>
                    <td>${normalizedBrand} - ${log.wineName}</td>
                    <td>${log.movementType}</td>
                    <td>${log.status}</td>
                    <td style="text-align: right;">${log.quantity}</td>
                    <td>${log.fromQuinta}</td>
                    <td>${log.toQuinta}</td>
                    <td>${log.toWhom}</td>
                </tr>
            `;
        }).join('');

        return `
            <table>
                <thead>
                    <tr>
                        <th>Data e Hora</th>
                        <th>Vinho</th>
                        <th>Tipo</th>
                        <th>Status</th>
                        <th style="text-align: right;">Qtd</th>
                        <th>De</th>
                        <th>Para</th>
                        <th>Para Quem/Finalidade</th>
                    </tr>
                </thead>
                <tbody>${tableRows}</tbody>
            </table>
        `;
    };

    const printFilteredLogs = (title: string, logs: TransferLog[]) => {
        if (logs.length === 0) {
            alert(`Nenhuma movimentação para o período: ${title}`);
            return;
        }
        const content = generatePrintContent(logs);
        handlePrint(title, content);
    };

    const handlePrintDaily = () => {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(todayStart);
        todayEnd.setDate(todayEnd.getDate() + 1);
        let logs = transferHistory.filter(log => new Date(log.date) >= todayStart && new Date(log.date) < todayEnd);
        if (selectedQuinta !== 'Todas') {
            logs = logs.filter(log => log.fromQuinta === selectedQuinta || log.toQuinta === selectedQuinta);
        }
        printFilteredLogs(`Relatório Diário (Quinta: ${selectedQuinta})`, logs);
    };

    const handlePrintWeekly = () => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - dayOfWeek);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        let logs = transferHistory.filter(log => new Date(log.date) >= weekStart && new Date(log.date) < weekEnd);
        if (selectedQuinta !== 'Todas') {
            logs = logs.filter(log => log.fromQuinta === selectedQuinta || log.toQuinta === selectedQuinta);
        }
        printFilteredLogs(`Relatório Semanal (Quinta: ${selectedQuinta})`, logs);
    };

    const handlePrintMonthly = () => {
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        let logs = transferHistory.filter(log => new Date(log.date) >= monthStart && new Date(log.date) < monthEnd);
        if (selectedQuinta !== 'Todas') {
            logs = logs.filter(log => log.fromQuinta === selectedQuinta || log.toQuinta === selectedQuinta);
        }
        printFilteredLogs(`Relatório Mensal (Quinta: ${selectedQuinta})`, logs);
    };

    const handlePrintYearly = () => {
        const today = new Date();
        const yearStart = new Date(today.getFullYear(), 0, 1);
        const yearEnd = new Date(today.getFullYear() + 1, 0, 1);
        let logs = transferHistory.filter(log => new Date(log.date) >= yearStart && new Date(log.date) < yearEnd);
        if (selectedQuinta !== 'Todas') {
            logs = logs.filter(log => log.fromQuinta === selectedQuinta || log.toQuinta === selectedQuinta);
        }
        printFilteredLogs(`Relatório Anual (Quinta: ${selectedQuinta})`, logs);
    };
    
    const handleExport = () => {
        if (sortedHistory.length === 0) {
            alert("Não há dados para exportar com os filtros selecionados.");
            return;
        }

        const dataToExport = sortedHistory.map(log => ({
            'Data e Hora': new Date(log.date).toLocaleString(),
            'Marca': log.brand.trim().toUpperCase() === 'ALTANO' ? 'ALTANO' : log.brand,
            'Vinho': log.wineName,
            'Tipo': log.movementType,
            'Quantidade': log.quantity,
            'Origem': log.fromQuinta,
            'Destino': log.toQuinta,
            'Para Quem/Finalidade': log.toWhom,
            'Status': log.status,
            'Aprovador': log.approverName || 'N/A',
        }));

        handleExportXLSX(dataToExport, `historico_movimentacoes_${new Date().toISOString().split('T')[0]}`);
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Histórico de Movimentações</h2>
            
             <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 flex-wrap">
                <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <label htmlFor="date-filter" className="text-sm font-medium text-gray-700">Filtrar por dia:</label>
                        <input
                            type="date"
                            id="date-filter"
                            onChange={e => {
                                const dateValue = e.target.value;
                                if (dateValue) {
                                    setSelectedDate(new Date(dateValue + 'T00:00:00'));
                                } else {
                                    setSelectedDate(null);
                                }
                            }}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                         <button onClick={() => {
                            const input = document.getElementById('date-filter') as HTMLInputElement;
                            if(input) input.value = '';
                            setSelectedDate(null);
                         }} className="text-sm text-purple-600 hover:underline">Limpar</button>
                    </div>
                    <div className="flex items-center gap-2">
                        <label htmlFor="quinta-filter" className="text-sm font-medium text-gray-700">por Quinta:</label>
                        <select
                            id="quinta-filter"
                            value={selectedQuinta}
                            onChange={e => setSelectedQuinta(e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white"
                        >
                            {allQuintas.map(q => <option key={q} value={q}>{q}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                     <button onClick={handleExport} className="px-3 py-1.5 text-xs bg-green-600 text-white font-semibold rounded-md hover:bg-green-700">Baixar Excel (.xlsx)</button>
                     <button onClick={handlePrintDaily} className="px-3 py-1.5 text-xs bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300">Imprimir Diário</button>
                     <button onClick={handlePrintWeekly} className="px-3 py-1.5 text-xs bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300">Imprimir Semanal</button>
                     <button onClick={handlePrintMonthly} className="px-3 py-1.5 text-xs bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300">Imprimir Mensal</button>
                     <button onClick={handlePrintYearly} className="px-3 py-1.5 text-xs bg-gray-200 text-gray-800 font-semibold rounded-md hover:bg-gray-300">Imprimir Anual</button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Data e Hora</th>
                            <th scope="col" className="px-6 py-3">Vinho</th>
                            <th scope="col" className="px-6 py-3 text-center">Tipo</th>
                            <th scope="col" className="px-6 py-3 text-right">Qtd</th>
                            <th scope="col" className="px-6 py-3">De</th>
                            <th scope="col" className="px-6 py-3">Para</th>
                            <th scope="col" className="px-6 py-3">Para Quem/Finalidade</th>
                            <th scope="col" className="px-6 py-3 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedHistory.length > 0 ? sortedHistory.map(log => (
                            <tr key={log.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4">{new Date(log.date).toLocaleString()}</td>
                                <td className="px-6 py-4 font-medium">{log.brand.trim().toUpperCase() === 'ALTANO' ? 'ALTANO' : log.brand} - {log.wineName}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getMovementTypeBadge(log.movementType)}`}>
                                        {log.movementType}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right font-bold">{log.quantity}</td>
                                <td className="px-6 py-4">{log.fromQuinta}</td>
                                <td className="px-6 py-4">{log.toQuinta}</td>
                                <td className="px-6 py-4">{log.toWhom}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusBadge(log.status)}`}>
                                        {log.status}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={8} className="text-center text-gray-500 py-8">
                                    Nenhum registro encontrado para o filtro selecionado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Historico;