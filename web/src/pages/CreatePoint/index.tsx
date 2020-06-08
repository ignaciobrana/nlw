import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import axios from 'axios';

import api from '../../services/api';

import Dropzone from '../../components/Dropzone';

import './styles.css';
import logo from '../../assets/logo.svg';

interface Item {
    id: number;
    image_url: string;
    title: string;
}

interface APIProvinciasDataResponse {
    provincias: ProvinciaResponse[];
}

interface APIDepartamentosDataResponse {
    departamentos: DepartamentoResponse[];
}

interface ProvinciaResponse {
    centroide: {
        lat: number;
        long: number;
    }
    id: number;
    nombre: string;
}

interface DepartamentoResponse {
    centroide: {
        lat: number;
        long: number;
    }
    id: number;
    nombre: string;
}

const CreatePoint = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<ProvinciaResponse[]>([]);
    const [cities, setCities] = useState<DepartamentoResponse[]>([]);
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
    });

    const [selectedUf, setSelectedUf] = useState<string>('0');
    const [selectedCity, setSelectedCity] = useState<string>('0');
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectedFile, setSelectedFile] = useState<File>();

    const history = useHistory(); //Manejador de historial del browser

    useEffect(() => {
        api.get('items')
            .then((response) => {
                setItems(response.data);
            });
    }, []);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            setInitialPosition([latitude, longitude]);
        });
    }, []);

    useEffect(() => {
        axios
            .get<APIProvinciasDataResponse>('https://apis.datos.gob.ar/georef/api/provincias')
            .then(response => {
                setUfs(response.data.provincias);
            })
            .catch(err => console.log(err));
    }, []);

    useEffect(() => {
        if (selectedUf === '0') return;

        axios
            .get<APIDepartamentosDataResponse>(`https://apis.datos.gob.ar/georef/api/departamentos?provincia=${selectedUf}`)
            .then(response => {
                setCities(response.data.departamentos);
                setSelectedCity('0');
                //console.log(response.data.departamentos);
            })
            .catch(err => console.log(err));
    }, [selectedUf]);

    const _handleChangeUf = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedUf(event.target.value);
    }

    const _handleChangeCity = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedCity(event.target.value);
    }

    const _handleMapClick = (event: LeafletMouseEvent) => {
        setSelectedPosition([event.latlng.lat, event.latlng.lng]);
    }

    const _handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData, [event.target.name]: event.target.value
        })
    }

    const _handleSelectItem = (id: number) => {
        const alreadySelected = selectedItems.findIndex(item => item === id);

        if (alreadySelected >= 0) {
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems([...filteredItems]);
        } else {
            setSelectedItems([...selectedItems, id]);
        }

    }

    const _handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        const { email, name, whatsapp } = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;
        
        const data = new FormData();
        data.append('name', name);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('uf', uf);
        data.append('city', city);
        data.append('latitude', String(latitude));
        data.append('longitude', String(longitude));
        data.append('items', items.join(','));

        if (selectedFile) {
            data.append('image', selectedFile);
        }

        await api.post('points', data);

        history.push('/'); //volvemos a la página raíz
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" />
                <Link to="/">
                    <FiArrowLeft />
                    Volver a home
                </Link>
            </header>

            <form onSubmit={_handleSubmit}>
                <h1>Registro Punto de Colecta</h1>

                <Dropzone onFileUploaded={setSelectedFile} />

                <fieldset>
                    <legend>
                        <h2>Datos</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nombre de la entidad</label>
                        <input type="text" name="name" id="name" onChange={_handleInputChange} />
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <input type="email" name="email" id="email" onChange={_handleInputChange} />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">WhatsApp</label>
                            <input type="text" name="whatsapp" id="whatsapp" onChange={_handleInputChange} />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Dirección</h2>
                        <span>Seleccione la Dirección en el mapa</span>
                    </legend>

                    <Map
                        center={initialPosition}
                        zoom={15}
                        onclick={_handleMapClick}
                    >
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Provincia</label>
                            <select
                                name="uf"
                                id="uf"
                                value={selectedUf}
                                onChange={_handleChangeUf}
                            >
                                <option value="0">Seleccione una Provincia</option>
                                {
                                    ufs.map(uf => (
                                        <option
                                            key={uf.id}
                                            value={uf.id}
                                        >
                                            {uf.nombre}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Ciudad</label>
                            <select
                                name="city"
                                id="city"
                                value={selectedCity}
                                onChange={_handleChangeCity}
                            >
                                <option value="0">Seleccione una Ciudad</option>
                                {
                                    cities.map(city => (
                                        <option
                                            key={city.id}
                                            value={city.id}
                                        >
                                            {city.nombre}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Items de Colecta</h2>
                        <span>Seleccione uno o más items de abajo</span>
                    </legend>

                    <ul className="items-grid">
                        {items.map(item =>
                            (<li
                                key={item.id}
                                onClick={() => { _handleSelectItem(item.id) }}
                                className={selectedItems.includes(item.id) ? 'selected' : ''}
                            >
                                <img src={item.image_url} alt={item.title} />
                                <span>{item.title}</span>
                            </li>)
                        )}
                    </ul>
                </fieldset>

                <button type="submit">Registrar punto de colecta</button>

            </form>
        </div>
    );
}

export default CreatePoint;