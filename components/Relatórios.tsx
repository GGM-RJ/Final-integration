import React from 'react';

const Relatorios: React.FC = () => {
    return (
        <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Gerador de Relatórios</h2>
            <p className="text-gray-500 mb-6">
                Esta funcionalidade está em desenvolvimento. Em breve, você poderá gerar relatórios detalhados sobre estoque, transferências e vendas.
            </p>
            <div className="bg-gray-100 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700">Próximos Relatórios:</h3>
                <ul className="mt-4 text-left inline-block">
                    <li className="flex items-center text-gray-600 mb-2">
                        <svg className="w-4 h-4 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                        Relatório de Estoque por Quinta
                    </li>
                    <li className="flex items-center text-gray-600 mb-2">
                         <svg className="w-4 h-4 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                        Relatório de Movimentação Mensal
                    </li>
                    <li className="flex items-center text-gray-600">
                         <svg className="w-4 h-4 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                        Análise de Vinhos Mais Movimentados
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Relatorios;
