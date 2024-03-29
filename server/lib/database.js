const {dbPath} = require('./consts')

const knex = exports.knex = require('knex')({
  'client': 'pg',
  'connection': dbPath,
  'useNullAsDefault': true
})

exports.init = () => {
  return knex.schema.hasTable('contacts').then((exists) => {
    if (!exists) {
      return knex.schema.createTable('contacts', (table) => {
        table.increments('id').primary().notNullable()
        table.string('name', 255).notNullable()
        table.boolean('hidden').notNullable().defaultTo(false)
        table.bigInteger('updateFrequency')
        table.bigInteger('avgUpdateFrequency')
        table.bigInteger('recUpdateFrequency')
        table.float('avgUpdatesPerMonth')
        table.string('googleId', 255).unique()
        table.string('exchangeId', 512).unique()
        table.timestamps()
      })
    } else {
      return knex.schema.hasColumn('contacts', 'avgUpdateFrequency').then(exists => {
        if (!exists) {
          return knex.schema.alterTable('contacts', table => {
            table.bigInteger('avgUpdateFrequency')
          })
        }
      })
        .then(() => {
          return knex.schema.hasColumn('contacts', 'avgUpdatesPerMonth').then(exists => {
            if (!exists) {
              return knex.schema.alterTable('contacts', table => {
                table.float('avgUpdatesPerMonth')
              })
            }
          })
        })
        .then(() => {
          return knex.schema.hasColumn('contacts', 'recUpdateFrequency').then(exists => {
            if (!exists) {
              return knex.schema.alterTable('contacts', table => {
                table.bigInteger('recUpdateFrequency')
              })
            }
          })
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
            table.dateTime('date').notNullable()
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
      return knex.schema.hasTable('photos').then((exists) => {
        if (!exists) {
          return knex.schema.createTable('photos', (table) => {
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
    .then(() => {
      return knex.schema.hasTable('tags').then((exists) => {
        if (!exists) {
          return knex.schema.createTable('tags', (table) => {
            table.increments('id').primary().notNullable()
            table.string('tag', 255).unique().notNullable()
            table.timestamps()
          })
        }
      })
    })
    .then(() => {
      return knex.schema.hasTable('contacts_tags').then((exists) => {
        if (!exists) {
          return knex.schema.createTable('contacts_tags', (table) => {
            table.increments('id').primary().notNullable()
            table.integer('contact_id').notNullable().references('id').inTable('contacts')
            table.integer('tag_id').notNullable().references('id').inTable('tags')
            table.unique(['contact_id', 'tag_id'])
          })
        }
      })
    })
}
