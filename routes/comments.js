const router = require('express').Router()
const { check, validationResult } = require('express-validator')
const auth = require('../middleware/auth')
const User = require('../models/User')
const Comment = require('../models/Comment')

/**
 * @description get all comments for question or project
 * @access private
 */
router.get('/:entityId/comments', auth, async (req, res) => {
  try {
    const allComments = await Comment.find({ entityId: req.params.entityId }).sort({
      createdAt: -1,
    })

    return res.send(allComments)
  } catch ({ message }) {
    console.log(message)
    return res.status(500).send({ message })
  }
})

/**
 * @description create a new comment for question or project
 * @access private
 */
router.post(
  '/:entityId/comments',
  [auth, check('text', 'Text is required').not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
      return res.status(400).send({ message: 'Validation error', errors: errors.array() })

    const { text } = req.body

    try {
      const user = await User.findById(req.userID).select('-password')
      if (!user) return res.status(404).send({ message: 'User not found' })

      const newComment = new Comment({
        userId: user._id,
        entityId: req.params.entityId,
        userName: user.name,
        userSurname: user.surname,
        text,
      })

      return res.status(201).send(newComment)
    } catch ({ message }) {
      console.log(message)
      return res.status(500).send({ message })
    }
  }
)

/**
 * @description delete a comment for question or project
 * @access private
 */
router.delete('/:entityId/:commentId', auth, async (req, res) => {
  try {
    const commentToDelete = await Comment.findById(req.params.commentId)
    if (!commentToDelete) return res.status(404).send({ message: 'Comment not found' })
    if (commentToDelete.userId.toString() !== req.userID)
      return res.status(403).send({ message: 'Access denied' })

    await commentToDelete.remove()

    return res.send({ message: 'Comment removed successfully' })
  } catch ({ message }) {
    console.log(message)
    return res.status(500).send({ message })
  }
})

module.exports = router
