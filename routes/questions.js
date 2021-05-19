const router = require('express').Router()
const auth = require('../middleware/auth')

/**
 * @description get questions by criteria
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
 * @description post a new question
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
 * @description delete a question by id
 * @access private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
  } catch ({ message }) {
    console.log(message)
    return res.status(500).send({ message })
  }
})
