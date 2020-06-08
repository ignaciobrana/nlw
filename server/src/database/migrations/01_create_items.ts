import Knex from 'knex';

export async function up(knex: Knex) {
    //Creamos la tabla
    return await knex.schema.createTable('items', table => {
        table.increments('id').primary();
        table.string('image').notNullable();
        table.string('title').notNullable();
    });
}

export async function down(knex: Knex) {
    //Volvemos Atras (Eliminamos la tabla)
    return await knex.schema.dropTable('items');
}