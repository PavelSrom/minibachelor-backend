const router = require('express').Router()
const auth = require('../middleware/auth')

/**
 * please note that we use the same routes for both questions and projects
 * the Comment entity has questionId or projectId, take care of that
 */

/**
 * @description get all comments for question or project
 * @access private
 */
router.get('/:entityId/comments', auth, async (req, res) => {
  try {
  } catch ({ message }) {
    console.log(message)
    return res.status(500).send({ message })
  }
})

/**
 * @description create a new comment for question or project
 * @access private
 */
router.post('/:entityId/comments', auth, async (req, res) => {
  try {
  } catch ({ message }) {
    console.log(message)
    return res.status(500).send({ message })
  }
})

/**
 * @description delete a comment for question or project
 * @access private
 */
router.delete('/:entityId/:commentId', auth, async (req, res) => {
  try {
  } catch ({ message }) {
    console.log(message)
    return res.status(500).send({ message })
  }
})

module.exports = router
