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
  // extract query params from the request
  const { user, school, programme, sortBy } = req.query
  // setup filtering and sorting objects
  const filter = {}
  const sort = {}
  // if query param exists, assign it to where it should be
  if (user) filter.userId = user
  if (school) filter.school = school
  if (programme) filter.programme = programme
  if (sortBy) sort.createdAt = sortBy === 'newest' ? 1 : -1

  try {
    // fetch all questions with the filtering and sorting params
    const allQuestions = await Question.find(filter).sort(sort)
    // return them to the client
    return res.send(allQuestions)
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
    // request body validation
    const errors = validationResult(req)
    if (!errors.isEmpty())
      return res.status(400).send({ message: 'Validation error', errors: errors.array() })
    // extract things from the request body
    const { title, description, isPublic } = req.body

    try {
      // fetch a user by its id
      const user = await User.findById(req.userID).select('-password')
      // if no user is found, return 404
      if (!user) return res.status(404).send({ message: 'User not found' })
      // create a new question entity, give it the data it needs
      const newQuestion = new Question({
        userId: user._id,
        userName: user.name,
        userSurname: user.surname,
        school: user.school,
        programme: user.programme,
        title, // syntax shortcut: 'title' = 'title: title'
        description,
        isPublic,
      })
      // save question to db
      await newQuestion.save()
      // return the question to the client
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
    // fetch the question that should be deleted
    const questionToDelete = await Question.findById(req.params.id)
    // if no such question is found, return 404
    if (!questionToDelete) return res.status(404).send({ message: 'Question not found' })
    // if IDs don't match, you're not allowed to delete it - return 403
    if (questionToDelete.userId.toString() !== req.userID)
      return res.status(403).send({ message: 'Access denied' })

    // remove all comments for that question as well
    await Comment.remove({ entityId: questionToDelete._id })
    // remove the question itself
    await questionToDelete.remove()
    // return response to the client
    return res.send({ message: 'Question removed successfully' })
  } catch ({ message }) {
    console.log(message)
    return res.status(500).send({ message })
  }
})

module.exports = router
