const router = require('express').Router()
const auth = require('../middleware/auth')

/**
 * these endpoints would also return project for user and other colleague
 * use query params with the user id through which you will filter
 */

/**
 * @description get all projects by criteria
 * @access private
 */
router.get('/', auth, async (req, res) => {
  try {
  } catch ({ message }) {
    console.log(message)
    return res.status(500).send({ message })
  }
})

/**
 * @description create new project
 * @access private
 */
router.post('/', auth, async (req, res) => {
  try {
  } catch ({ message }) {
    console.log(message)
    return res.status(500).send({ message })
  }
})

/**
 * @description delete a project
 * @access private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
  } catch ({ message }) {
    console.log(message)
    return res.status(500).send({ message })
  }
})

module.exports = router
