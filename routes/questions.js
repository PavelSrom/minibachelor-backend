const router = require('express').Router()
const { check, validationResult } = require('express-validator')
const auth = require('../middleware/auth')
const User = require('../models/User')
const Question = require('../models/Question')
const Comment = require('../models/Comment')

/**
 * @description get questions by criteria
 * @access private
 */
router.get('/', auth, async (req, res) => {
  const { user, school, programme, sortBy } = req.query

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
router.post(
  '/',
  [
    auth,
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description must be a string').isString(),
    check('isPublic', 'Publicity status required').isBoolean(),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
      return res.status(400).send({ message: 'Validation error', errors: errors.array() })

    const { title, description, isPublic } = req.body

    try {
      const user = await User.findById(req.userID)
      if (!user) return res.status(404).send({ message: 'User not found' })

      const newQuestion = new Question({
        userId: user._id,
        userName: user.name,
        userSurname: user.surname,
        school: user.school,
        programme: user.programme,
        title,
        description,
        isPublic,
      })
      await newQuestion.save()

      return res.status(201).send(newQuestion)
    } catch ({ message }) {
      console.log(message)
      return res.status(500).send({ message })
    }
  }
)

/**
 * @description delete a question by id
 * @access private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const questionToDelete = await Question.findById(req.params.id)
    if (!questionToDelete) return res.status(404).send({ message: 'Question not found' })

    // remove all comments for that question as well
    await Comment.remove({ entityId: questionToDelete._id })
    await questionToDelete.remove()

    return res.send({ message: 'Question removed successfully' })
  } catch ({ message }) {
    console.log(message)
    return res.status(500).send({ message })
  }
})

module.exports = router
