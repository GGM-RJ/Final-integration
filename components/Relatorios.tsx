import React, { useState } from 'react';
import { StockItem, TransferLog } from '../types';
import RelatorioMovimentacao from './reports/RelatorioMovimentacao';
import RelatorioEstoque from './reports/RelatorioEstoque';

interface RelatoriosProps {
    stock: StockItem[];
    transferHistory: TransferLog[];
    quintas: {name: string}[];
}

type ReportTab = 'estoque' | 'movimentacao';

const Relatorios: React.FC<RelatoriosProps> = ({ stock, transferHistory, quintas }) => {
    const [activeTab, setActiveTab] = useState<ReportTab>('estoque');

    return (
        <div className="bg-white p-8 rounded-xl shadow-sm min-h-[600px]">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Relatórios e Análises</h2>
            
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    className={`py-2 px-4 font-medium text-sm focus:outline-none ${
                        activeTab === 'estoque'
                            ? 'border-b-2 border-purple-600 text-purple-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('estoque')}
                >
                    Stock Atual (Por Quinta / Geral)
                </button>
                <button
                    className={`py-2 px-4 font-medium text-sm focus:outline-none ${
                        activeTab === 'movimentacao'
                            ? 'border-b-2 border-purple-600 text-purple-600'
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setActiveTab('movimentacao')}
                >
                    Histórico de Movimentações
                </button>
            </div>

            <div className="mt-4">
                {activeTab === 'estoque' ? (
                    <div>
                         <p className="text-gray-500 mb-6">
                            Visualize e imprima o inventário atual de vinhos, filtrado por localizações específicas ou um relatório geral consolidado.
                        </p>
                        <RelatorioEstoque stock={stock} quintas={quintas} />
                    </div>
                ) : (
                    <div>
                        <p className="text-gray-500 mb-6">
                            Filtre o histórico de transferências, entradas e saídas por período e localização.
                        </p>
                        <RelatorioMovimentacao transferHistory={transferHistory} quintas={quintas} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Relatorios;