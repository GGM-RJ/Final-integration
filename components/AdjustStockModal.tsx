
import React, { useState, useEffect } from 'react';
import { StockItem, ID } from '../types';

interface AdjustStockModalProps {
    isOpen: boolean;
    onClose: () => void;
    wine: StockItem | null;
    onAddQuantity: (id: ID, quantity: number) => void;
    onRemoveQuantity: (id: ID, quantity: number) => void;
    onUpdateLowStockAlert: (id: ID, status: boolean) => void;
}

const AdjustStockModal: React.FC<AdjustStockModalProps> = ({ 
    isOpen, 
    onClose, 
    wine, 
    onAddQuantity, 
    onRemoveQuantity,
    onUpdateLowStockAlert
}) => {
    const [quantityToAdd, setQuantityToAdd] = useState<number | ''>('');
    const [quantityToRemove, setQuantityToRemove] = useState<number | ''>('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setQuantityToAdd('');
            setQuantityToRemove('');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen || !wine) return null;

    const handleAdd = () => {
        setError('');
        const numQuantity = Number(quantityToAdd);
        if (!quantityToAdd || numQuantity <= 0) {
            setError('Por favor, insira uma quantidade válida para adicionar.');
            return;
        }
        onAddQuantity(wine.id, numQuantity);
        onClose();
    };

    const handleRemove = () => {
        setError('');
        const numQuantity = Number(quantityToRemove);
        if (!quantityToRemove || numQuantity <= 0) {
            setError('Por favor, insira uma quantidade válida para remover.');
            return;
        }
        if (numQuantity > wine.quantity) {
            setError(`A quantidade a remover não pode ser maior que o stock atual (${wine.quantity}).`);
            return;
        }
        onRemoveQuantity(wine.id, numQuantity);
        onClose();
    };

    const handleToggleAlert = () => {
        onUpdateLowStockAlert(wine.id, !wine.lowStockAlert);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Ajustar Stock</h2>
                    <button 
                        onClick={handleToggleAlert}
                        title={wine.lowStockAlert ? "Desativar alerta visual de stock baixo" : "Ativar alerta visual de stock baixo"}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase transition-all shadow-sm ${
                            wine.lowStockAlert 
                                ? 'bg-red-500 border-red-600 text-white' 
                                : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}
                    >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                        </svg>
                        {wine.lowStockAlert ? 'Alerta Ativado' : 'Alerta Desativado'}
                    </button>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl mb-6">
                    <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-1">{wine.brand}</p>
                    <p className="text-lg font-bold text-slate-900 leading-tight">{wine.wineName}</p>
                    <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
                        <span className="text-sm text-slate-600 font-medium">Stock Atual</span>
                        <span className={`text-2xl font-black ${wine.lowStockAlert && wine.quantity <= 6 ? 'text-red-600' : 'text-purple-600'}`}>
                            {wine.quantity}
                        </span>
                    </div>
                </div>

                <div className="space-y-5">
                    <div>
                        <label htmlFor="quantityToAdd" className="block text-xs font-bold text-slate-500 uppercase mb-2">Entrada de Garrafas (+)</label>
                         <div className="flex gap-2">
                             <input
                                type="number"
                                id="quantityToAdd"
                                value={quantityToAdd}
                                onChange={(e) => setQuantityToAdd(e.target.value === '' ? '' : Number(e.target.value))}
                                className="block w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-green-500 text-slate-800"
                                placeholder="Quantidade"
                                min="1"
                            />
                            <button
                                onClick={handleAdd}
                                className="px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-md active:scale-95"
                            >
                                Inserir
                            </button>
                         </div>
                    </div>

                    <div>
                        <label htmlFor="quantityToRemove" className="block text-xs font-bold text-slate-500 uppercase mb-2">Saída de Garrafas (-)</label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                id="quantityToRemove"
                                value={quantityToRemove}
                                onChange={(e) => setQuantityToRemove(e.target.value === '' ? '' : Number(e.target.value))}
                                className="block w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800"
                                placeholder="Quantidade"
                                min="1"
                                max={wine.quantity}
                            />
                            <button
                                onClick={handleRemove}
                                className="px-5 py-2.5 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-colors shadow-md active:scale-95"
                            >
                                Retirar
                            </button>
                        </div>
                    </div>
                    
                    {error && <p className="text-xs text-red-500 font-bold bg-red-50 p-2 rounded-lg text-center border border-red-100">{error}</p>}
                </div>

                <div className="mt-8">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors border border-slate-200"
                    >
                        Voltar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdjustStockModal;
