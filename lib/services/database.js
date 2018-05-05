const levelup = require('levelup')
const leveldown = require('leveldown')
const db = levelup(leveldown(`${__dirname}/../../database`))

exports.getUTF8 = async (id) => {
  const value = db.get(id)

  return value.toString('UTF8')
}

exports.getObject = async (id) => {
  const value = db.get(id)

  return JSON.parse(value.toString('UTF8'))
}

exports.setUTF8 = (id, value) => db.put(id, value)

exports.setObject = (id, value) => db.put(id, JSON.stringify(value))
