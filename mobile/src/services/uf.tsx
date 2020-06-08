import axios from 'axios';

export const getUfList = async () => {
    const response = await axios
        .get('https://apis.datos.gob.ar/georef/api/provincias');
    return response.data;
};

export const getUf = async (id: string) => {
    const response = await axios
        .get(`https://apis.datos.gob.ar/georef/api/provincias?id=${id}`);
    return response.data;
};
