const router = require('express').Router()
const auth = require('../middleware/auth')

/**
 * @description get colleagues - either students or teachers
 * @access private
 * @query role
 */
router.get('/', auth, async (req, res) => {
  try {
  } catch ({ message }) {
    console.log(message)
    return res.status(500).send({ message })
  }
})

/**
 * @description get colleague detail
 * @access private
 */
router.get('/:id', auth, async (req, res) => {
  try {
  } catch ({ message }) {
    console.log(message)
    return res.status(500).send({ message })
  }
})

module.exports = router
