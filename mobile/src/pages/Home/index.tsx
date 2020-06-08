import React, { useState, useEffect } from 'react';
import { Feather as Icon } from '@expo/vector-icons';
import { View, ImageBackground, Image, StyleSheet, Text } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';

import { getUfList } from '../../services/uf';
import { getCitiesList } from '../../services/city';

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

const Home = () => {
    const [ufs, setUfs] = useState<ProvinciaResponse[]>([]);
    const [cities, setCities] = useState<DepartamentoResponse[]>([]);

    const [selectedUf, setSelectedUf] = useState<string>('0');
    const [selectedCity, setSelectedCity] = useState<string>('0');

    const navigation = useNavigation();

    useEffect(() => {
        getUfList()
            .then(response => {
                setUfs(response.provincias);
            })
            .catch(err => console.log(err));
    }, []);

    useEffect(() => {
        if (selectedUf === '0') return;

        getCitiesList(Number(selectedUf))
            .then(response => {
                setCities(response.departamentos);
                setSelectedCity('0');
            })
            .catch(err => console.log(err));
    }, [selectedUf]);

    function _handleNavigateToPoints() {
        //console.log(selectedCity, selectedUf);
        navigation.navigate('Points', {
            city_id: selectedCity,
            uf_id: selectedUf
        });
    }

    function _handleChangeUf(value: string) {
        setSelectedUf(value);
    }

    function _handleChangeCity(value: string) {
        setSelectedCity(value);
    }

    return (
        <ImageBackground
            style={styles.container}
            source={require('../../assets/home-background.png')}
            imageStyle={{ width: 274, height: 368 }}
        >

            <View style={styles.main}>
                <Image source={require('../../assets/logo.png')} />
                <Text style={styles.title}>Su lugar de recolección de residuos</Text>
                <Text style={styles.description}>Ayudamos a personas a encontrar puntos de recolección de forma eficiente</Text>
            </View>

            <View style={styles.footer}>

                <RNPickerSelect
                    placeholder={{ label: 'Seleccione la Provincia' }}
                    style={{
                        inputAndroid: styles.input,
                        inputIOS: styles.input,
                    }}
                    onValueChange={_handleChangeUf}
                    items={
                        ufs.map(uf => {
                            return { key: uf.id, value: uf.id, label: uf.nombre };
                        })
                    }
                />

                <RNPickerSelect
                    placeholder={{ label: 'Seleccione la Ciudad' }}
                    style={{
                        inputAndroid: styles.input,
                        inputIOS: styles.input,
                    }}
                    onValueChange={_handleChangeCity}
                    items={
                        cities.map(city => {
                            return { key: city.id, value: city.id, label: city.nombre };
                        })
                    }
                />

                <RectButton style={styles.button} onPress={_handleNavigateToPoints}>
                    <View style={styles.buttonIcon}>
                        <Text>
                            <Icon name='arrow-right' color='#FFF' size={24} />
                        </Text>
                    </View>
                    <Text style={styles.buttonText}>
                        Entrar
                    </Text>
                </RectButton>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 32
    },

    main: {
        flex: 1,
        justifyContent: 'center',
    },

    title: {
        color: '#322153',
        fontSize: 32,
        fontFamily: 'Ubuntu_700Bold',
        maxWidth: 260,
        marginTop: 64,
    },

    description: {
        color: '#6C6C80',
        fontSize: 16,
        marginTop: 16,
        fontFamily: 'Roboto_400Regular',
        maxWidth: 260,
        lineHeight: 24,
    },

    footer: {},

    select: {},

    input: {
        height: 60,
        backgroundColor: '#FFF',
        borderRadius: 10,
        marginBottom: 8,
        paddingHorizontal: 24,
        fontSize: 16,
    },

    button: {
        backgroundColor: '#34CB79',
        height: 60,
        flexDirection: 'row',
        borderRadius: 10,
        overflow: 'hidden',
        alignItems: 'center',
        marginTop: 8,
    },

    buttonIcon: {
        height: 60,
        width: 60,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center'
    },

    buttonText: {
        flex: 1,
        justifyContent: 'center',
        textAlign: 'center',
        color: '#FFF',
        fontFamily: 'Roboto_500Medium',
        fontSize: 16,
    }
});

export default Home;