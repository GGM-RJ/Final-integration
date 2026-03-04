
import React from 'react';
import { Page } from '../App';
import { useAuth } from '../contexts/AuthContext';
import { Permission } from '../types';

interface SidebarProps {
    activePage: Page;
    setActivePage: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
    const { currentUser, logout } = useAuth();
    
    const allMenuItems: Page[] = ['Dashboard', 'Vinhos', 'Movimentar Vinhos', 'Stock', 'Histórico', 'Relatórios', 'Usuários'];

    const getVisibleMenuItems = (): Page[] => {
        if (!currentUser) return [];
        switch (currentUser.role) {
            case 'Supervisor':
                return allMenuItems;
            case 'Operador':
                // Operators see Dashboard plus their permitted pages
                return ['Dashboard', ...allMenuItems.filter(item => currentUser.permissions?.includes(item as Permission))];
            case 'Visitante':
                return ['Vinhos'];
            case 'Quinta':
                 return ['Dashboard', 'Vinhos', 'Movimentar Vinhos'];
            default:
                return [];
        }
    };

    const visibleMenuItems = getVisibleMenuItems();

    // If the current active page is not in the visible items, default to the first visible item
    React.useEffect(() => {
        if (currentUser && !visibleMenuItems.includes(activePage)) {
            if (currentUser.role === 'Visitante') {
                setActivePage('Vinhos');
            } else {
                setActivePage('Dashboard');
            }
        }
    }, [currentUser, visibleMenuItems, activePage, setActivePage]);

    return (
        <aside className="w-64 flex-shrink-0 bg-sky-50 border-r flex flex-col">
            <div className="h-16 flex items-center justify-center text-2xl font-bold text-sky-800 border-b border-sky-200">
                <span>Vinho Stock</span>
            </div>
            <nav className="mt-4 flex-grow">
                <ul>
                    {visibleMenuItems.map(item => (
                        <li key={item}>
                            <a
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActivePage(item);
                                }}
                                className={`flex items-center px-6 py-3 text-gray-700 hover:bg-sky-100 hover:text-sky-700 ${
                                    activePage === item ? 'bg-sky-200 text-sky-800 font-semibold' : ''
                                }`}
                            >
                                <span className="ml-3">{item}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="p-4 border-t border-sky-100">
                <button
                    onClick={logout}
                    className="w-full px-4 py-2 text-sm text-sky-700 bg-sky-100 rounded-md hover:bg-sky-200 focus:outline-none"
                >
                    Sair
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
