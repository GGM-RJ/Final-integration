import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { userService } from '../services/userService';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  login: (username: string, password: string) => boolean | string;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
        const savedUser = localStorage.getItem('currentUser');
        return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
        return null;
    }
  });
  
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
      const loadUsers = async () => {
          try {
              const loadedUsers = await userService.getUsers();
              console.log('[AuthContext] Loaded users from DB:', loadedUsers);
              setUsers(loadedUsers);
          } catch (error) {
              console.error('[AuthContext] Error loading users:', error);
          }
      };
      loadUsers();
  }, []);

  const login = (username: string, password: string): boolean | string => {
    // Procura o usuário na lista carregada (que contém as edições e novos usuários do LocalStorage/DB)
    const userFound = users.find(u => u.username === username);
    
    // Verifica se o usuário existe e se a senha corresponde
    if (userFound && userFound.password === password) {
      if (userFound.isBlocked) {
        return 'blocked';
      }
      const userToStore = { ...userFound };
      // Remove a senha antes de salvar na sessão por segurança
      delete userToStore.password; 
      setCurrentUser(userToStore);
      localStorage.setItem('currentUser', JSON.stringify(userToStore));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const value = { currentUser, users, setUsers, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};