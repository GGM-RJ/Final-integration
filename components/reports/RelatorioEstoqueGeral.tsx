import React, { useMemo } from 'react';
import { StockItem } from '../../types';
import { handlePrint } from '../../utils/print';

interface RelatorioEstoqueGeralProps {
  stock: StockItem[];
}

const RelatorioEstoqueGeral: React.FC<RelatorioEstoqueGeralProps> = ({ stock }) => {

  const generalStock = useMemo(() => {
    return stock
      .filter(item => !item.quintaName && item.quantity > 0)
      .sort((a, b) => a.brand.localeCompare(b.brand));
  }, [stock]);

  const summary = useMemo(() => {
    const totalItems = generalStock.length;
    const totalBottles = generalStock.reduce((acc, item) => acc + item.quantity, 0);
    return { totalItems, totalBottles };
  }, [generalStock]);

  const generateReportContent = () => {
    const tableRows = generalStock.map(item => `
        <tr>
            <td>${item.brand.trim().toUpperCase() === 'ALTANO' ? 'ALTANO' : item.brand}</td>
            <td>${item.wineName}</td>
            <td>${item.wineType}</td>
            <td style="text-align: right; font-weight: bold;">${item.quantity}</td>
        </tr>
    `).join('');

    return `
        <div class="summary">
            <strong>Resumo do Stock Geral:</strong><br>
            Total de Vinhos (rótulos diferentes): ${summary.totalItems}<br>
            Total de Garrafas: ${summary.totalBottles}
        </div>
        <table>
            <thead>
                <tr>
                    <th>Marca</th>
                    <th>Nome do Vinho</th>
                    <th>Tipo</th>
                    <th style="text-align: right;">Quantidade</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;
  };

  const onPrint = () => {
      handlePrint('Total em Stock Geral', generateReportContent());
  };

  return (
    <div>
        <div className="flex justify-end mb-4">
             <button onClick={onPrint} className="px-4 py-2 text-sm bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700">
                Imprimir Relatório
            </button>
        </div>
        <div className="p-4 bg-gray-50 border rounded-lg mb-6">
            <h3 className="font-bold text-lg text-gray-800">Resumo do Stock Geral</h3>
            <p className="text-gray-600">Total de Vinhos (rótulos diferentes): <span className="font-bold text-purple-700">{summary.totalItems}</span></p>
            <p className="text-gray-600">Total de Garrafas: <span className="font-bold text-purple-700">{summary.totalBottles}</span></p>
        </div>
      {generalStock.length > 0 ? (
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
                    {generalStock.map(item => (
                        <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium">{item.brand.trim().toUpperCase() === 'ALTANO' ? 'ALTANO' : item.brand}</td>
                            <td className="px-6 py-4">{item.wineName}</td>
                            <td className="px-6 py-4">{item.wineType}</td>
                            <td className="px-6 py-4 text-right font-bold text-gray-800">{item.quantity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">Nenhum item no Stock Geral.</p>
      )}
    </div>
  );
};

export default RelatorioEstoqueGeral;