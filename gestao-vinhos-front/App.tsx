
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Vinhos from './components/Vinhos';
import Stock from './components/Stock';
import Transferir from './components/Transferir';
import Historico from './components/Historico';
import Relatorios from './components/Relatorios';
import Usuarios from './components/Usuarios';
import Footer from './components/Footer';

import { stockService } from './services/stockService';
import { transferService } from './services/transferService';
import { userService } from './services/userService';
import { quintaService } from './services/quintaService';
import { generateId } from './utils/idGenerator';

import { StockItem, TransferLog, User, ID } from './types';

export type Page = 'Dashboard' | 'Vinhos' | 'Stock' | 'Movimentar Vinhos' | 'Histórico' | 'Relatórios' | 'Usuários';

const AppContent: React.FC = () => {
  const { currentUser, users, setUsers } = useAuth();
  const [activePage, setActivePage] = useState<Page>('Dashboard');
  
  const [stock, setStock] = useState<StockItem[]>([]);
  const [transferHistory, setTransferHistory] = useState<TransferLog[]>([]);
  const [quintas, setQuintas] = useState<{name: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Helper to normalize stock data
  const normalizeStock = (data: StockItem[]): StockItem[] => {
      return data.map(item => ({
          ...item,
          brand: item.brand.trim().toUpperCase() === 'ALTANO' ? 'ALTANO' : item.brand
      }));
  };

  // Helper to normalize history data
  const normalizeHistory = (data: TransferLog[]): TransferLog[] => {
      return data.map(item => ({
          ...item,
          brand: item.brand.trim().toUpperCase() === 'ALTANO' ? 'ALTANO' : item.brand
      }));
  };

  // Load data from services on initial render
  const refreshData = async () => {
      setIsLoading(true);
      try {
        const [loadedStock, loadedHistory, loadedQuintas] = await Promise.all([
            stockService.getStock(),
            transferService.getTransferHistory(),
            quintaService.getQuintas()
        ]);
        
        setStock(normalizeStock(loadedStock));
        setTransferHistory(normalizeHistory(loadedHistory));
        setQuintas(loadedQuintas);
      } catch (error) {
          console.error("Failed to load data", error);
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
    if (currentUser) {
        refreshData();
        setActivePage('Dashboard');
    }
  }, [currentUser]);


  if (!currentUser) {
    return <Login />;
  }

  const pendingTransfers = transferHistory.filter(t => t.status === 'Pendente');

  const handleAddWine = async (newWine: Omit<StockItem, 'id'>) => {
    await stockService.addWine(newWine);
    // Refresh to get new ID and updated state
    const updatedStock = await stockService.getStock();
    setStock(normalizeStock(updatedStock));
  };
  
  const handleTransfer = async (transferLog: Omit<TransferLog, 'id' | 'date' | 'status'>) => {
      const canAutoApprove = currentUser?.role === 'Supervisor' || 
                             (currentUser?.role === 'Operador' && currentUser.permissions?.includes('Aprovar'));
      
      const status = currentUser?.role === 'Quinta' ? 'Pendente' : (canAutoApprove ? `Aprovado por ${currentUser?.name || 'Sistema'}` : 'Pendente');

      const newLog: TransferLog = {
          ...transferLog,
          id: generateId(), 
          date: new Date(),
          status: status,
      };

      if (status.startsWith('Aprovado')) {
          newLog.approverName = currentUser?.name;
      }
      
      await transferService.addTransfer(newLog);
      
      // NEW LOGIC: Always decrement source immediately if it's not an adjustment
      if (newLog.fromQuinta !== 'Ajuste de Stock') {
          await updateStockForTransfer(newLog, 'decrement');
      }

      // If it's auto-approved, also increment destination
      if (status.startsWith('Aprovado')) {
          await updateStockForTransfer(newLog, 'increment');
      }

      // Refresh history state
      const updatedHistory = await transferService.getTransferHistory();
      setTransferHistory(normalizeHistory(updatedHistory));
  };
  
  const updateStockForTransfer = async (log: TransferLog, action: 'decrement' | 'increment' | 'return') => {
      console.log(`[StockUpdate] Action: ${action} for transfer: ${log.brand} - ${log.wineName} (${log.quantity} garrafas)`);
      
      try {
          const currentStock = await stockService.getStock();
          const sourceIdentifier = log.fromQuinta === 'Stock Geral' ? undefined : log.fromQuinta;
          const destIdentifier = log.toQuinta === 'Stock Geral' ? undefined : log.toQuinta;

          // --- 1. DECREMENT SOURCE ---
          if (action === 'decrement') {
              const sourceItem = currentStock.find(s => 
                  s.brand.trim().toLowerCase() === log.brand.trim().toLowerCase() &&
                  s.wineName.trim().toLowerCase() === log.wineName.trim().toLowerCase() &&
                  (s.quintaName?.trim() || undefined) === (sourceIdentifier?.trim() || undefined)
              );

              if (sourceItem) {
                  const newQuantity = Math.max(0, sourceItem.quantity - log.quantity);
                  await stockService.updateItem({ ...sourceItem, quantity: newQuantity });
              }

              // If it's a real exit from the system (Consumo), also decrement the General Stock (Principal)
              if (sourceIdentifier && log.toQuinta === 'Consumo') {
                  const principalItem = currentStock.find(s => 
                      s.brand.trim().toLowerCase() === log.brand.trim().toLowerCase() &&
                      s.wineName.trim().toLowerCase() === log.wineName.trim().toLowerCase() &&
                      !s.quintaName
                  );
                  if (principalItem) {
                      const newPrincipalQty = Math.max(0, principalItem.quantity - log.quantity);
                      await stockService.updateItem({ ...principalItem, quantity: newPrincipalQty });
                  }
              }
          }

          // --- 2. INCREMENT DESTINATION ---
          if (action === 'increment') {
              if (log.toQuinta === 'Consumo') return; // Nothing to increment

              const destItem = currentStock.find(s => 
                  s.brand.trim().toLowerCase() === log.brand.trim().toLowerCase() &&
                  s.wineName.trim().toLowerCase() === log.wineName.trim().toLowerCase() &&
                  (s.quintaName?.trim() || undefined) === (destIdentifier?.trim() || undefined)
              );
              
              if (destItem) {
                  const newDestQty = destItem.quantity + log.quantity;
                  await stockService.updateItem({ ...destItem, quantity: newDestQty });
              } else {
                  const originalWine = currentStock.find(s => 
                    s.brand.trim().toLowerCase() === log.brand.trim().toLowerCase() && 
                    s.wineName.trim().toLowerCase() === log.wineName.trim().toLowerCase() && 
                    !s.quintaName
                  );
                  await stockService.addWine({
                      brand: log.brand.trim().toUpperCase() === 'ALTANO' ? 'ALTANO' : log.brand.trim(),
                      wineName: log.wineName,
                      wineType: originalWine?.wineType || 'Tinto',
                      quantity: log.quantity,
                      quintaName: destIdentifier,
                      lowStockAlert: originalWine?.lowStockAlert || false,
                  });
              }

              // If it's an Entry (Ajuste de Stock), we also increment the General Stock (Principal)
              if (destIdentifier && log.fromQuinta === 'Ajuste de Stock') {
                  const principalItem = currentStock.find(s => 
                      s.brand.trim().toLowerCase() === log.brand.trim().toLowerCase() &&
                      s.wineName.trim().toLowerCase() === log.wineName.trim().toLowerCase() &&
                      !s.quintaName
                  );
                  if (principalItem) {
                      const newPrincipalQty = principalItem.quantity + log.quantity;
                      await stockService.updateItem({ ...principalItem, quantity: newPrincipalQty });
                  } else {
                      await stockService.addWine({
                        brand: log.brand.trim().toUpperCase() === 'ALTANO' ? 'ALTANO' : log.brand.trim(),
                        wineName: log.wineName,
                        wineType: 'Tinto',
                        quantity: log.quantity,
                        quintaName: undefined,
                        lowStockAlert: false,
                      });
                  }
              }
          }

          // --- 3. RETURN TO SOURCE (On Rejection) ---
          if (action === 'return') {
              if (log.fromQuinta === 'Ajuste de Stock') return; // Cannot return an entry

              const sourceItem = currentStock.find(s => 
                  s.brand.trim().toLowerCase() === log.brand.trim().toLowerCase() &&
                  s.wineName.trim().toLowerCase() === log.wineName.trim().toLowerCase() &&
                  (s.quintaName?.trim() || undefined) === (sourceIdentifier?.trim() || undefined)
              );

              if (sourceItem) {
                  const newQuantity = sourceItem.quantity + log.quantity;
                  await stockService.updateItem({ ...sourceItem, quantity: newQuantity });
              }

              // If it was a consumption request, also return to General Stock
              if (sourceIdentifier && log.toQuinta === 'Consumo') {
                  const principalItem = currentStock.find(s => 
                      s.brand.trim().toLowerCase() === log.brand.trim().toLowerCase() &&
                      s.wineName.trim().toLowerCase() === log.wineName.trim().toLowerCase() &&
                      !s.quintaName
                  );
                  if (principalItem) {
                      const newPrincipalQty = principalItem.quantity + log.quantity;
                      await stockService.updateItem({ ...principalItem, quantity: newPrincipalQty });
                  }
              }
          }
          
          // Final refresh to update UI
          const finalStock = await stockService.getStock();
          setStock(normalizeStock(finalStock));
      } catch (error) {
          console.error(`[StockUpdate] Error updating stock:`, error);
          alert("Erro ao atualizar o stock. Por favor, verifique as quantidades manualmente.");
      }
  };

  const handleApproval = async (id: ID, newStatus: 'Aprovado' | 'Reprovado') => {
      const transferToProcess = transferHistory.find(log => log.id === id);

      if (transferToProcess) {
          const statusText = newStatus === 'Aprovado' 
            ? `Aprovado por ${currentUser?.name || 'Sistema'}` 
            : `Reprovado por ${currentUser?.name || 'Sistema'}`;
            
          const updatedTransfer = { ...transferToProcess, status: statusText };
          updatedTransfer.approverName = currentUser?.name;
          
          await transferService.updateTransfer(updatedTransfer);
          
          const updatedHistory = await transferService.getTransferHistory();
          setTransferHistory(normalizeHistory(updatedHistory));

          if (newStatus === 'Aprovado') {
              await updateStockForTransfer(updatedTransfer, 'increment');
          } else if (newStatus === 'Reprovado') {
              await updateStockForTransfer(updatedTransfer, 'return');
          }
      }
  };

  const handleSaveUser = async (user: Omit<User, 'id'> | User) => {
    await userService.saveUser(user);
    const updatedUsers = await userService.getUsers();
    setUsers(updatedUsers);
  };

  const handleDeleteUser = async (id: ID) => {
      if (currentUser?.role !== 'Supervisor') {
          alert("Apenas supervisores podem excluir usuários.");
          return;
      }

      // Ensure we compare as strings
      const idStr = String(id);
      const currentUserIdStr = String(currentUser?.id);

      if (currentUserIdStr === idStr) {
          alert("Você não pode deletar seu próprio usuário.");
          return;
      }

      const userToDelete = users.find(u => String(u.id) === idStr);
      if (!userToDelete) {
          alert("Usuário não encontrado.");
          return;
      }

      if (userToDelete.role === 'Quinta') {
          alert("Usuários do tipo 'Quinta' são fixos e não podem ser excluídos.");
          return;
      }

      if (window.confirm(`Tem certeza de que deseja excluir o usuário "${userToDelete.name}"?`)) {
          try {
              await userService.deleteUser(idStr);
              const updatedUsers = await userService.getUsers();
              setUsers(updatedUsers);
              alert("Usuário excluído com sucesso!");
          } catch (error) {
              console.error("Erro ao deletar usuário:", error);
              alert("Erro ao excluir usuário. Por favor, tente novamente.");
          }
      }
  }

  const handleDeleteWine = async (id: ID) => {
      if (currentUser?.role !== 'Supervisor') {
          alert("Apenas supervisores podem excluir vinhos.");
          return;
      }

      const wineToDelete = stock.find(item => item.id === id);

      if (!wineToDelete) {
          alert("Vinho não encontrado.");
          return;
      }

      if (wineToDelete.quantity > 0) {
          alert(`Não é possível excluir o vinho "${wineToDelete.brand} - ${wineToDelete.wineName}" pois ainda existem ${wineToDelete.quantity} garrafas no Stock Geral. Ajuste a quantidade para 0 antes de excluir.`);
          return;
      }

      const isInQuintaStock = stock.some(item => 
          item.brand === wineToDelete.brand &&
          item.wineName === wineToDelete.wineName &&
          item.quintaName 
      );

      if (isInQuintaStock) {
          alert(`Este vinho não pode ser excluído pois ainda existe stock em uma ou mais quintas. Transfira todo o stock para o "Stock Geral" e zere a quantidade antes de excluir.`);
          return;
      }

      await stockService.deleteWine(id);
      const updatedStock = await stockService.getStock();
      setStock(normalizeStock(updatedStock)); 
  };

  const handleAddStockQuantity = async (id: ID, quantityToAdd: number) => {
    if (currentUser?.role !== 'Supervisor') {
        alert("Apenas supervisores podem ajustar o stock.");
        return;
    }
    await stockService.addStockQuantity(id, quantityToAdd);
    const updatedStock = await stockService.getStock();
    setStock(normalizeStock(updatedStock)); 
  };

  const handleRemoveStockQuantity = async (id: ID, quantityToRemove: number) => {
    if (currentUser?.role !== 'Supervisor') {
        alert("Apenas supervisores podem ajustar o stock.");
        return;
    }
    await stockService.removeStockQuantity(id, quantityToRemove);
    const updatedStock = await stockService.getStock();
    setStock(normalizeStock(updatedStock)); 
  };

  const handleUpdateLowStockAlert = async (id: ID, status: boolean) => {
    if (currentUser?.role !== 'Supervisor') {
        alert("Apenas supervisores podem ajustar o stock.");
        return;
    }
    await stockService.toggleLowStockAlert(id, status);
    const updatedStock = await stockService.getStock();
    setStock(normalizeStock(updatedStock)); 
  };

  const handleUpdateWine = async (id: ID, updatedData: Partial<StockItem>) => {
    if (currentUser?.role !== 'Supervisor') {
        alert("Apenas supervisores podem modificar dados dos vinhos.");
        return;
    }
    
    const wineToUpdate = stock.find(s => s.id === id);
    if (!wineToUpdate) return;

    // If we are updating brand or name, we should update ALL entries 
    // for this wine across all quintas to keep them consistent.
    const affectedWines = stock.filter(s => 
        s.brand.trim().toLowerCase() === wineToUpdate.brand.trim().toLowerCase() &&
        s.wineName.trim().toLowerCase() === wineToUpdate.wineName.trim().toLowerCase()
    );

    try {
        for (const wine of affectedWines) {
            await stockService.updateItem({
                ...wine,
                ...updatedData
            });
        }
        const updatedStock = await stockService.getStock();
        setStock(normalizeStock(updatedStock));
        alert("Vinho atualizado com sucesso em todos os locais!");
    } catch (error) {
        console.error("Error updating wine:", error);
        alert("Erro ao atualizar o vinho.");
    }
  };


  const renderPage = () => {
    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <span className="ml-3 text-gray-600">Carregando dados...</span>
            </div>
        );
    }

    switch (activePage) {
      case 'Dashboard':
        return <Dashboard 
                  stock={stock} 
                  transferHistory={transferHistory} 
                  pendingTransfers={pendingTransfers}
                  quintas={quintas}
                  onApprove={(id) => handleApproval(id, 'Aprovado')}
                  onReject={(id) => handleApproval(id, 'Reprovado')}
                />;
      case 'Vinhos':
        return <Vinhos stock={stock} quintas={quintas} onUpdateWine={handleUpdateWine} />;
      case 'Stock':
        return <Stock 
                  stock={stock} 
                  transferHistory={transferHistory}
                  onAddWine={handleAddWine} 
                  onDeleteWine={handleDeleteWine} 
                  onAddStockQuantity={handleAddStockQuantity} 
                  onRemoveStockQuantity={handleRemoveStockQuantity}
                  onUpdateLowStockAlert={handleUpdateLowStockAlert}
                  onUpdateWine={handleUpdateWine}
                />;
      case 'Movimentar Vinhos':
        return <Transferir stock={stock} quintas={quintas} onTransfer={handleTransfer} />;
      case 'Histórico':
        return <Historico transferHistory={transferHistory} quintas={quintas} />;
      case 'Relatórios':
        return <Relatorios stock={stock} transferHistory={transferHistory} quintas={quintas} />;
      case 'Usuários':
        return <Usuarios users={users} quintas={quintas} onSaveUser={handleSaveUser} onDeleteUser={handleDeleteUser} />;
      default:
        return <Dashboard 
                  stock={stock} 
                  transferHistory={transferHistory}
                  pendingTransfers={pendingTransfers}
                  quintas={quintas}
                  onApprove={(id) => handleApproval(id, 'Aprovado')}
                  onReject={(id) => handleApproval(id, 'Reprovado')}
                />;
    }
  };

  return (
    <div className="flex h-screen bg-green-50 font-sans">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-green-50 p-6">
          {renderPage()}
        </main>
        <Footer />
      </div>
    </div>
  );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
