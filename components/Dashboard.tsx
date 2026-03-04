
import React, { useMemo } from 'react';
import { StockItem, TransferLog, ID } from '../types';
import StatCard from './StatCard';
import { quintaService } from '../services/quintaService';
import { useAuth } from '../contexts/AuthContext';

// Icons
const LocationMarkerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l1.72-1.72a10 10 0 115.84 16.1" /></svg>;

interface DashboardProps {
    stock: StockItem[];
    transferHistory: TransferLog[];
    pendingTransfers: TransferLog[];
    quintas: {name: string}[];
    onApprove: (id: ID) => void;
    onReject: (id: ID) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stock, transferHistory, pendingTransfers, quintas, onApprove, onReject }) => {
    const { currentUser } = useAuth();

    const quintaStock = useMemo(() => stock.filter(item => item.quintaName), [stock]);

    const quintaStockSummary = useMemo(() => {
        const summary: { [key: string]: number } = {};
        
        quintaStock.forEach(item => {
            if (item.quintaName) {
                if (summary[item.quintaName]) {
                    summary[item.quintaName] += item.quantity;
                } else {
                    summary[item.quintaName] = item.quantity;
                }
            }
        });

        return Object.entries(summary).map(([quintaName, totalQuantity]) => ({
            quintaName,
            totalQuantity
        })).sort((a, b) => a.quintaName.localeCompare(b.quintaName));

    }, [quintaStock]);

    // Alertas de stock baixo geral
    const lowStockItems = stock.filter(item => item.lowStockAlert && item.quantity <= 6);

    const totalQuintas = quintas.length;
    
    // Últimas 5 atividades sem filtro
    const recentActivities = transferHistory.slice(0, 5);
    
    const canApprove = currentUser?.role === 'Supervisor' || (currentUser?.role === 'Operador' && currentUser.permissions?.includes('Aprovar'));

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard 
                    title="Total de Quintas" 
                    value={totalQuintas.toString()}
                    description="Locais de armazenamento ativos"
                    icon={<LocationMarkerIcon />}
                    borderColor="border-green-500"
                />
                
                <StatCard 
                    title="Transferências Pendentes" 
                    value={pendingTransfers.length.toString()}
                    description="Aguardando aprovação do sistema"
                    icon={<RefreshIcon />}
                    borderColor="border-orange-500"
                />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    Quintas
                    <span className="text-xs font-normal text-gray-400">(Stock consolidado por local)</span>
                </h2>

                {quintaStockSummary.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {quintaStockSummary.map(summary => (
                                <div key={summary.quintaName} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center shadow-sm">
                                    <span className="font-semibold text-gray-700">{summary.quintaName}</span>
                                    <span className="bg-purple-100 text-purple-700 font-bold px-2.5 py-1 rounded-full text-sm">
                                        {summary.totalQuantity} garrafas
                                    </span>
                                </div>
                            ))}
                        </div>
                        <p className="mt-2 text-[10px] text-gray-400 italic">
                            * As quantidades refletem apenas transferências aprovadas.
                        </p>
                    </>
                ) : (
                    <p className="text-gray-500 italic text-sm">Nenhuma quinta possui stock registado.</p>
                )}
            </div>

            {canApprove && pendingTransfers.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Transferências Pendentes</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                             <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Data</th>
                                    <th scope="col" className="px-6 py-3">Solicitante</th>
                                    <th scope="col" className="px-6 py-3">Vinho</th>
                                    <th scope="col" className="px-6 py-3 text-right">Qtd</th>
                                    <th scope="col" className="px-6 py-3">De</th>
                                    <th scope="col" className="px-6 py-3">Para</th>
                                    <th scope="col" className="px-6 py-3 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingTransfers.map(log => (
                                    <tr key={log.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4">{new Date(log.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-medium">{log.requesterName}</td>
                                        <td className="px-6 py-4">{log.brand.trim().toUpperCase() === 'ALTANO' ? 'ALTANO' : log.brand} - {log.wineName}</td>
                                        <td className="px-6 py-4 text-right font-bold">{log.quantity}</td>
                                        <td className="px-6 py-4">{log.fromQuinta}</td>
                                        <td className="px-6 py-4">{log.toQuinta}</td>
                                        <td className="px-6 py-4 text-center space-x-2">
                                            <button onClick={() => onApprove(log.id)} className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700">Aprovar</button>
                                            <button onClick={() => onReject(log.id)} className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Reprovar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Últimas Atividades</h2>
                </div>
                {recentActivities.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Data</th>
                                    <th scope="col" className="px-6 py-3">Vinho</th>
                                    <th scope="col" className="px-6 py-3 text-right">Qtd</th>
                                    <th scope="col" className="px-6 py-3">De</th>
                                    <th scope="col" className="px-6 py-3">Para</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentActivities.map(log => (
                                    <tr key={log.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4">{new Date(log.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 font-medium">{log.brand.trim().toUpperCase() === 'ALTANO' ? 'ALTANO' : log.brand} - {log.wineName}</td>
                                        <td className="px-6 py-4 text-right font-bold">{log.quantity}</td>
                                        <td className="px-6 py-4">{log.fromQuinta}</td>
                                        <td className="px-6 py-4">{log.toQuinta}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                log.status.startsWith('Aprovado') ? 'bg-green-100 text-green-800' :
                                                log.status === 'Reprovado' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-4 italic">Nenhuma atividade recente registrada.</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
