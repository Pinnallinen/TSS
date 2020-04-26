const path = require('path')
const root = path.join(__dirname, '..', '..', '..')
const config = require(path.join(root, 'config'))

const casual = require('casual')
const moment = require('moment')
const _ = require('lodash')

casual.seed(config.seeds.seed)

exports.seed = async function(knex) {
  moment.locale(Intl.DateTimeFormat().resolvedOptions().locale)
  const start = moment(config.seeds.startDate)
  const end = moment(config.seeds.endDate)
  const diff = Math.abs(start.diff(end, 'days'))
  const days = diff + 1

  const ranges = await knex('range')
        .select('id')
  process.stdout.write(
    `From ${start.format('L')} to ${end.format('L')} (${days} days)
${ranges.length} ranges * ${days} days = ${ranges.length * days} reservations...`)

  const reservations = await Promise.all(_.flatten(_.times(days, (i) => {
    const day = start.clone().add(i, 'days')
    return ranges
      .map(({id}) => casual.range_reservation(id, day.format('YYYY-MM-DD')))
  })))
  console.log('done')
  process.stdout.write('Inserting...')
  await Promise.all(
    _.chunk(reservations, config.seeds.chunkSize)
      .map(async (reservationBatch) => (
        knex('range_reservation')
          .insert(reservationBatch))))
  console.log('done')
}

casual.define('range_reservation', async (rangeId, date) => {
  return {
    range_id: rangeId,
    date: date,
    available: !!casual.integer(0, 3)
  }
})
