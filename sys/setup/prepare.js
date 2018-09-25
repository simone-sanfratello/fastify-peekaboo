const settings = require('a-settings')
const tollo = require('tollo')
const pg = require('pg')

if (settings.env !== 'dev' && settings.env !== 'alpha') {
  console.log('RUN ONLY ON DEV ENV')
  process.exit(-1)
}

const samples = require('../../test/samples')

tollo.start = async function () {
  tollo.global.server = await require('../../main')

  const _sql = `
    TRUNCATE TABLE ... RESTART IDENTITY CASCADE;
    TRUNCATE TABLE ... RESTART IDENTITY CASCADE`

  tollo.global.db = new pg.Client(settings.db.connection)
  await tollo.global.db.connect()
  await tollo.global.db.query(_sql)
}

tollo.end = async function () {
  await tollo.global.db.end()
  console.log('prepare done')
  process.exit(0)
}

// insert
tollo.add({
  'insert users': {
    /* @todo ... */
    cases: [
      {
        describe: 'insert user #0',
        input: [samples.data.users[0]]
      }

    ]
  }
})

tollo.run()
