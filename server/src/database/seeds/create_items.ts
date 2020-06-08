import Knex from 'knex';

export async function seed(knex: Knex) {
    await knex('items').insert([
        { title: 'Lamparas', image: 'lamparas.svg'},
        { title: 'Pilas y Baterias', image: 'baterias.svg'},
        { title: 'Pepeles y Cartón', image: 'pepeles-carton.svg'},
        { title: 'Residuos Electrónicos', image: 'electronicos.svg'},
        { title: 'Residuos Organicos', image: 'organicos.svg'},
        { title: 'Aceites', image: 'aceite.svg'},
    ]);
}