import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
    const { currentUser } = useAuth();

    return (
        <header className="flex items-center justify-end px-6 py-4 bg-white border-b">
            <div className="flex items-center">
                <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">{currentUser?.name}</p>
                    <p className="text-xs text-gray-500">{currentUser?.role}</p>
                </div>
                
            </div>
        </header>
    );
};

export default Header;