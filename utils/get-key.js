const config = require('config')

const getKey = key =>
  process.env.NODE_ENV === 'production' ? process.env[key] : config.get(key)

module.exports = { getKey }
