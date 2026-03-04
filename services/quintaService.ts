import { cosmosService } from './cosmosAdapter';

const ENTITY = 'Quinta';

export interface Quinta {
    name: string;
}

const getQuintas = async (): Promise<Quinta[]> => {
    return await cosmosService.getAll<Quinta>(ENTITY);
};

export const quintaService = {
    getQuintas,
};
