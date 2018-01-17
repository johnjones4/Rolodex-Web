const knex = exports.knex = require('knex')({
  'client': 'sqlite',
  'connection': {
    'filename': './database.sqlite'
  },
  'useNullAsDefault': true
})

exports.init = () => {
  return knex.schema.hasTable('contacts').then((exists) => {
    if (!exists) {
      return knex.schema.createTable('contacts', (table) => {
        table.increments('id').primary().notNullable()
        table.string('name', 255).notNullable()
        table.boolean('hidden').notNullable().defaultTo(false)
        table.integer('updateFrequency')
        table.string('googleId', 255).unique()
        table.string('exchangeId', 512).unique()
        table.timestamps()
      })
    }
  })
    .then(() => {
      return knex.schema.hasTable('interactions').then((exists) => {
        if (!exists) {
          return knex.schema.createTable('interactions', (table) => {
            table.increments('id').primary().notNullable()
            table.string('external_id', 512).notNullable()
            table.string('source', 255).notNullable()
            table.string('type', 255)
            table.dateTime('date')
            table.string('description', 255)
            table.unique(['external_id', 'source'])
            table.timestamps()
          })
        }
      })
    })
    .then(() => {
      return knex.schema.hasTable('contacts_interactions').then((exists) => {
        if (!exists) {
          return knex.schema.createTable('contacts_interactions', (table) => {
            table.increments('id').primary().notNullable()
            table.integer('contact_id').notNullable().references('id').inTable('contacts')
            table.integer('interaction_id').notNullable().references('id').inTable('interactions')
            table.unique(['contact_id', 'interaction_id'])
          })
        }
      })
    })
    .then(() => {
      return knex.schema.hasTable('notes').then((exists) => {
        if (!exists) {
          return knex.schema.createTable('notes', (table) => {
            table.increments('id').primary().notNullable()
            table.text('note').notNullable()
            table.integer('contact_id').references('id').inTable('contacts')
            table.integer('interaction_id').references('id').inTable('interactions')
            table.timestamps()
          })
        }
      })
    })
    .then(() => {
      return knex.schema.hasTable('locations').then((exists) => {
        if (!exists) {
          return knex.schema.createTable('locations', (table) => {
            table.increments('id').primary().notNullable()
            table.string('description', 255).unique().notNullable()
            table.double('latitude')
            table.double('longitude')
            table.timestamps()
          })
        }
      })
    })
    .then(() => {
      return knex.schema.hasTable('contacts_locations').then((exists) => {
        if (!exists) {
          return knex.schema.createTable('contacts_locations', (table) => {
            table.increments('id').primary().notNullable()
            table.integer('contact_id').notNullable().references('id').inTable('contacts')
            table.integer('location_id').notNullable().references('id').inTable('locations')
            table.unique(['contact_id', 'location_id'])
          })
        }
      })
    })
    .then(() => {
      return knex.schema.hasTable('organizations').then((exists) => {
        if (!exists) {
          return knex.schema.createTable('organizations', (table) => {
            table.increments('id').primary().notNullable()
            table.string('name', 255).unique().notNullable()
            table.timestamps()
          })
        }
      })
    })
    .then(() => {
      return knex.schema.hasTable('positions').then((exists) => {
        if (!exists) {
          return knex.schema.createTable('positions', (table) => {
            table.increments('id').primary().notNullable()
            table.string('title', 255)
            table.integer('contact_id').notNullable().references('id').inTable('contacts')
            table.integer('organization_id').references('id').inTable('organizations')
            table.timestamps()
          })
        }
      })
    })
    .then(() => {
      return knex.schema.hasTable('emails').then((exists) => {
        if (!exists) {
          return knex.schema.createTable('emails', (table) => {
            table.increments('id').primary().notNullable()
            table.string('email', 255).notNullable().unique()
            table.integer('contact_id').notNullable().references('id').inTable('contacts')
            table.timestamps()
          })
        }
      })
    })
    .then(() => {
      return knex.schema.hasTable('phones').then((exists) => {
        if (!exists) {
          return knex.schema.createTable('phones', (table) => {
            table.increments('id').primary().notNullable()
            table.string('phone', 255).notNullable()
            table.integer('contact_id').notNullable().references('id').inTable('contacts')
            table.unique(['contact_id', 'phone'])
            table.timestamps()
          })
        }
      })
    })
    .then(() => {
      return knex.schema.hasTable('urls').then((exists) => {
        if (!exists) {
          return knex.schema.createTable('urls', (table) => {
            table.increments('id').primary().notNullable()
            table.string('url', 255).notNullable()
            table.integer('contact_id').notNullable().references('id').inTable('contacts')
            table.unique(['contact_id', 'url'])
            table.timestamps()
          })
        }
      })
    })
    .then(() => {
      return knex.schema.hasTable('config').then((exists) => {
        if (!exists) {
          return knex.schema.createTable('config', (table) => {
            table.increments('id').primary().notNullable()
            table.string('key', 255).unique().notNullable()
            table.json('config').notNullable().defaultTo('{}')
            table.timestamps()
          })
        }
      })
    })
}
