
import { User, ID } from '../types';
import { cosmosService } from './cosmosAdapter';
import { generateId } from '../utils/idGenerator';

const ENTITY = 'User';

const getUsers = async (): Promise<User[]> => {
    return await cosmosService.getAll<User>(ENTITY);
};

const saveUser = async (user: Omit<User, 'id'> | User): Promise<User> => {
    let savedUser: User;
    if ('id' in user && user.id) {
        const idStr = String(user.id);
        const updated = await cosmosService.update<User>(ENTITY, idStr, user);
        savedUser = updated || (user as User);
    } else {
        const newUser: User = {
            ...user,
            id: generateId(),
        } as User;
        const created = await cosmosService.create<User>(ENTITY, newUser);
        savedUser = created || newUser;
    }
    return savedUser;
};

const deleteUser = async (id: ID): Promise<void> => {
    const success = await cosmosService.delete(ENTITY, id);
    if (!success) {
        throw new Error(`Falha ao deletar usuário com ID ${id}`);
    }
};

export const userService = {
    getUsers,
    saveUser,
    deleteUser,
};
