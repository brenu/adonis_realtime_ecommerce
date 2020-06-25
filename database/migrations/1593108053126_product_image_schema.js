'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class ProductImageSchema extends Schema {
  up() {
    this.create('product_image', table => {
      table.increments();
      table.integer('image_id').usigned();
      table.integer('product_id').usigned();
      table
        .foreign('image_id')
        .references('id')
        .inTable('images')
        .onDelete('cascade');

      table
        .foreign('product_id')
        .references('id')
        .inTable('products')
        .onDelete('cascade');
    });
  }

  down() {
    this.drop('product_image');
  }
}

module.exports = ProductImageSchema;
