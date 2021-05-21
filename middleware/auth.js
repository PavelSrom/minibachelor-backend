const jwt = require('jsonwebtoken')
const { getKey } = require('../utils/get-key')

module.exports = async (req, res, next) => {
  const token = req.header('x-auth-token')
  if (!token) return res.status(401).send({ message: 'Missing token' })

  try {
    const decoded = jwt.verify(token, getKey('jwtSecret'))
    req.userID = decoded.id

    next()
  } catch (err) {
    return res.status(403).send({ message: 'Invalid token' })
  }
}
