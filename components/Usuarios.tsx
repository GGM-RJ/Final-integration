import React, { useState } from 'react';
import { User, ID } from '../types';
import AddUserModal from './AddUserModal';

interface UsuariosProps {
    users: User[];
    quintas: {name: string}[];
    onSaveUser: (user: Omit<User, 'id'> | User) => void;
    onDeleteUser: (id: ID) => void;
}

const Usuarios: React.FC<UsuariosProps> = ({ users, quintas, onSaveUser, onDeleteUser }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);

    const handleOpenModal = (user: User | null = null) => {
        setUserToEdit(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setUserToEdit(null);
        setIsModalOpen(false);
    };

    const handleSave = (user: Omit<User, 'id'> | User) => {
        onSaveUser(user);
        handleCloseModal();
    };
    
    const handleDelete = (user: User) => {
        onDeleteUser(user.id);
    }

    return (
        <>
            <div className="bg-white p-8 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Gerenciamento de Usuários</h2>
                    <button
                        onClick={() => handleOpenModal()}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                        Adicionar Usuário
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nome</th>
                                <th scope="col" className="px-6 py-3">Username</th>
                                <th scope="col" className="px-6 py-3">Função</th>
                                <th scope="col" className="px-6 py-3">Quinta</th>
                                <th scope="col" className="px-6 py-3 text-center">Status</th>
                                <th scope="col" className="px-6 py-3 text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className={`bg-white border-b hover:bg-gray-50 ${user.isBlocked ? 'opacity-60 grayscale' : ''}`}>
                                    <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                                    <td className="px-6 py-4">{user.username}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            user.role === 'Quinta' ? 'bg-purple-100 text-purple-800' :
                                            user.role === 'Supervisor' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{user.quintaName || '-'}</td>
                                    <td className="px-6 py-4 text-center">
                                        {user.isBlocked ? (
                                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                                                Bloqueado
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                                Ativo
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center space-x-2">
                                        <button onClick={() => handleOpenModal(user)} className="font-medium text-purple-600 hover:underline">Editar</button>
                                        <button 
                                            onClick={() => onSaveUser({ ...user, isBlocked: !user.isBlocked })} 
                                            className={`font-medium hover:underline ${user.isBlocked ? 'text-green-600' : 'text-orange-600'}`}
                                        >
                                            {user.isBlocked ? 'Desbloquear' : 'Bloquear'}
                                        </button>
                                        <button onClick={() => handleDelete(user)} className="font-medium text-red-600 hover:underline">Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <AddUserModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                userToEdit={userToEdit}
                quintas={quintas}
            />
        </>
    );
};

export default Usuarios;