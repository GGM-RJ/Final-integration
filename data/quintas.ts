
import { ID } from '../types';

export interface Quinta {
    id: ID;
    name: string;
}

export const quintas: Quinta[] = [
    { id: 'q-bomfim', name: "Quinta do Bomfim" },
    { id: 'q-malvedos', name: "Quinta dos Malvedos" },
    { id: 'q-canais', name: "Quinta dos Canais" },
    { id: 'q-vesuvio', name: "Quinta do Vesuvio" }
];
