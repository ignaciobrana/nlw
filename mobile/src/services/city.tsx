import axios from 'axios';

export const getCitiesList = async (uf_id: number) => {
    const response = await axios
        .get(`https://apis.datos.gob.ar/georef/api/departamentos?provincia=${uf_id}`);
        return response.data;
};

export const getCity = async (id: string) => {
    const response = await axios
        .get(`https://apis.datos.gob.ar/georef/api/departamentos?id=${id}`);
        return response.data;
};