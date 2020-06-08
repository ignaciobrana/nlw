import React, { useState, useEffect } from 'react';
import Constants from 'expo-constants';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather as Icon } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Alert } from 'react-native';

import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as IntentLauncherAndroid from 'expo-intent-launcher';

import { SvgUri } from 'react-native-svg';

import api from '../../services/api';

interface Point {
    id: number;
    image_url: string;
    image: string;
    name: string;
    whatsapp: string;
    email: string;
    city: string;
    uf: string;
    latitude: number;
    longitude: number;
}

interface Item {
    id: number;
    title: string;
    image_url: string;
}

interface Params {
    city_id: string;
    uf_id: string;
}

const Points = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const routeParams = route.params as Params;

    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);

    const [points, setPoints] = useState<Point[]>([]);
    const [items, setItems] = useState<Item[]>([]);

    useEffect(() => {
        api
            .get('items')
            .then(response => {
                setItems(response.data);
            });
    }, []);

    useEffect(() => {
        async function loadPosition() {
            const { status } = await Location.requestPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Ooooops...', 'Precisamos de su permiso para obtener la localización');
                return;
            }

            try {
                const providerStatus = await Location.getProviderStatusAsync();

                if (!providerStatus.locationServicesEnabled || !providerStatus.gpsAvailable) {
                    IntentLauncherAndroid.startActivityAsync(
                        IntentLauncherAndroid.ACTION_LOCATION_SOURCE_SETTINGS
                    );
                }

                const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });//Location.getCurrentPositionAsync();
                const { latitude, longitude } = location.coords;
                //console.log(latitude, longitude);
                setInitialPosition([latitude, longitude]);
            } catch (err) { console.log(err); }
        }
        loadPosition();
    }, []);

    useEffect(() => {
        //console.log(routeParams.city_id, routeParams.uf_id, selectedItems);
        api
            .get('points', {
                params: {
                    city: routeParams.city_id,
                    uf: routeParams.uf_id,
                    items: selectedItems
                }
            })
            .then(response => {
                setPoints(response.data.points);
                //console.log(response.data);
            })
            .catch(err => console.log(err));
    }, [selectedItems]);

    function _handleNavigateBack() {
        navigation.goBack();
    }

    function _handleNavigateToDetail(id: number) {
        navigation.navigate('Detail', { point_id: id });
    }

    function _handleOnPressItem(id: number) {
        const alreadySelected = selectedItems.indexOf(id);
        if (alreadySelected >= 0) {
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);
        } else {
            setSelectedItems([...selectedItems, id]);
        }
    }

    //console.log(points, points.length);
    return (
        <>
            <View style={styles.container}>
                <TouchableOpacity onPress={_handleNavigateBack}>
                    <Icon name='arrow-left' size={20} color='#34cb79' />
                </TouchableOpacity>

                <Text style={styles.title}>Bienvenido.</Text>
                <Text style={styles.description}>Busque en el mapa un punto de colecta.</Text>

                <View style={styles.mapContainer}>
                    {
                        initialPosition[0] !== 0 &&
                        (<MapView
                            style={styles.map}
                            initialRegion={{
                                latitude: initialPosition[0],
                                longitude: initialPosition[1],
                                latitudeDelta: 0.014,
                                longitudeDelta: 0.014,
                            }}
                        >
                            {
                                //Array.isArray(points) &&
                                points.map(point => (
                                    <Marker
                                        key={String(point.id)}
                                        style={styles.mapMarker}
                                        onPress={() => { _handleNavigateToDetail(point.id) }}
                                        coordinate={{
                                            latitude: Number(point.latitude.toPrecision(4)),
                                            longitude: Number(point.longitude.toPrecision(4)),
                                        }}
                                    >
                                        <View style={styles.mapMarkerContainer}>
                                            <Image
                                                style={styles.mapMarkerImage}
                                                source={{
                                                    uri: point.image_url,
                                                }}
                                            />
                                            <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                                        </View>
                                    </Marker>
                                ))
                            }
                        </MapView>)
                    }
                </View>
            </View>
            <View style={styles.itemsContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                >
                    {items.map(item => (
                        <TouchableOpacity
                            key={String(item.id)}
                            style={[
                                styles.item,
                                selectedItems.includes(item.id) ? styles.selectedItem : null
                            ]}
                            activeOpacity={0.6}
                            onPress={() => { _handleOnPressItem(item.id) }}
                        >
                            <SvgUri width={42} height={42} uri={item.image_url} />
                            <Text style={styles.itemTitle}>{item.title}</Text>
                        </TouchableOpacity>
                    )
                    )}

                </ScrollView>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 32,
        paddingTop: 20 + Constants.statusBarHeight,
    },

    title: {
        fontSize: 20,
        fontFamily: 'Ubuntu_700Bold',
        marginTop: 24,
    },

    description: {
        color: '#6C6C80',
        fontSize: 16,
        marginTop: 4,
        fontFamily: 'Roboto_400Regular',
    },

    mapContainer: {
        flex: 1,
        width: '100%',
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 16,
    },

    map: {
        width: '100%',
        height: '100%',
    },

    mapMarker: {
        width: 90,
        height: 80,
    },

    mapMarkerContainer: {
        width: 90,
        height: 70,
        backgroundColor: '#34CB79',
        flexDirection: 'column',
        borderRadius: 8,
        overflow: 'hidden',
        alignItems: 'center'
    },

    mapMarkerImage: {
        width: 90,
        height: 45,
        resizeMode: 'cover',
    },

    mapMarkerTitle: {
        flex: 1,
        fontFamily: 'Roboto_400Regular',
        color: '#FFF',
        fontSize: 13,
        lineHeight: 23,
    },

    itemsContainer: {
        flexDirection: 'row',
        marginTop: 16,
        marginBottom: 32,
    },

    item: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#eee',
        height: 120,
        width: 120,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 16,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'space-between',

        textAlign: 'center',
    },

    selectedItem: {
        borderColor: '#34CB79',
        borderWidth: 2,
    },

    itemTitle: {
        fontFamily: 'Roboto_400Regular',
        textAlign: 'center',
        fontSize: 13,
    },
});

export default Points;