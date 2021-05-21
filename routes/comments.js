const router = require('express').Router()
const { check, validationResult } = require('express-validator')
const auth = require('../middleware/auth')
const User = require('../models/User')
const Comment = require('../models/Comment')

/**
 * @description get all comments for question or project
 * @access private
 */
router.get('/:entityId', auth, async (req, res) => {
  try {
    // fetch all comments where the :entityId param matches, sort by newest
    const allComments = await Comment.find({ entityId: req.params.entityId }).sort({
      createdAt: -1,
    })
    // return them to the client
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
  '/:entityId',
  [auth, check('text', 'Text is required').not().isEmpty()],
  async (req, res) => {
    // validation stuff
    const errors = validationResult(req)
    if (!errors.isEmpty())
      return res.status(400).send({ message: 'Validation error', errors: errors.array() })
    // extract 'text' from the request body
    const { text } = req.body

    try {
      // fetch user's data
      const user = await User.findById(req.userID).select('-password')
      // if no user found, return 404
      if (!user) return res.status(404).send({ message: 'User not found' })
      // create a new comment entity, assign it with data
      const newComment = new Comment({
        userId: user._id,
        entityId: req.params.entityId,
        userName: user.name,
        userSurname: user.surname,
        text,
      })
      // save comment to db
      await newComment.save()
      // return back to client
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
    // fetch the comment that should be deleted
    const commentToDelete = await Comment.findById(req.params.commentId)
    // if no such comment exists, return 404
    if (!commentToDelete) return res.status(404).send({ message: 'Comment not found' })
    // if the comment's userId doesn't match the userID in request, you cannot delete it
    // because it is not your comment
    if (commentToDelete.userId.toString() !== req.userID)
      return res.status(403).send({ message: 'Access denied' })
    // delete comment from db
    await commentToDelete.remove()
    // return response to the client
    return res.send({ message: 'Comment removed successfully' })
  } catch ({ message }) {
    console.log(message)
    return res.status(500).send({ message })
  }
})

module.exports = router
