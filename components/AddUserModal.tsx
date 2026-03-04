import React, { useState, useEffect } from 'react';
import { User, UserRole, Permission } from '../types';
import { quintaService } from '../services/quintaService';

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (user: Omit<User, 'id'> | User) => void;
    userToEdit: User | null;
    quintas: {name: string}[];
}

const allPermissions: Permission[] = ['Vinhos', 'Stock', 'Movimentar Vinhos', 'Histórico', 'Relatórios', 'Usuários', 'Aprovar'];
const allRoles: UserRole[] = ['Supervisor', 'Operador', 'Visitante', 'Quinta'];

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onSave, userToEdit, quintas }) => {
    const allQuintaNames = quintas.map(q => q.name);
    const [formData, setFormData] = useState<Partial<User>>({
        username: '',
        password: '',
        name: '',
        role: 'Visitante',
        permissions: [],
        quintaName: '',
        isBlocked: false,
    });

    useEffect(() => {
        if (userToEdit) {
            setFormData({
                ...userToEdit,
                password: '', // Don't show existing password
            });
        } else {
            setFormData({
                username: '',
                password: '',
                name: '',
                role: 'Visitante',
                permissions: [],
                quintaName: '',
                isBlocked: false,
            });
        }
    }, [userToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePermissionChange = (permission: Permission) => {
        setFormData(prev => {
            const currentPermissions = prev.permissions || [];
            const newPermissions = currentPermissions.includes(permission)
                ? currentPermissions.filter(p => p !== permission)
                : [...currentPermissions, permission];
            return { ...prev, permissions: newPermissions };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const dataToSave = { ...formData };
        if (userToEdit) {
            // If password is not changed, don't send it back (or send original)
            if (!dataToSave.password) {
                delete dataToSave.password;
            }
        } else {
            // For new user, password is required
            if (!dataToSave.password) {
                alert('A senha é obrigatória para novos usuários.');
                return;
            }
        }
        
        onSave(userToEdit ? { ...userToEdit, ...dataToSave } : (dataToSave as Omit<User, 'id'>));
    };

    if (!isOpen) return null;
    
    const inputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{userToEdit ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
                        <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className={inputClasses} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Username</label>
                        <input type="text" name="username" value={formData.username || ''} onChange={handleChange} className={inputClasses} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Senha</label>
                        <input type="password" name="password" value={formData.password || ''} onChange={handleChange} className={inputClasses} placeholder={userToEdit ? "Deixe em branco para não alterar" : ""} required={!userToEdit} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Função</label>
                        <select name="role" value={formData.role} onChange={handleChange} className={inputClasses} required>
                            {allRoles.map(role => <option key={role} value={role}>{role}</option>)}
                        </select>
                    </div>

                    {formData.role === 'Operador' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Permissões</label>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                {allPermissions.map(permission => (
                                    <label key={permission} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.permissions?.includes(permission)}
                                            onChange={() => handlePermissionChange(permission)}
                                            className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                                        />
                                        <span>{permission}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                    
                     {formData.role === 'Quinta' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Quinta Associada</label>
                            <select name="quintaName" value={formData.quintaName || ''} onChange={handleChange} className={inputClasses} required>
                                <option value="">Selecione uma Quinta</option>
                                {allQuintaNames.map(name => <option key={name} value={name}>{name}</option>)}
                            </select>
                        </div>
                    )}


                    <div className="flex items-center justify-end space-x-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUserModal;