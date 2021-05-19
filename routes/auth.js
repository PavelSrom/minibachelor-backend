const router = require('express').Router()
const { check, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { getKey } = require('../utils/get-key')
const auth = require('../middleware/auth')
const User = require('../models/User')
const Question = require('../models/Question')
const Project = require('../models/Project')
const Comment = require('../models/Comment')

/**
 * @description refresh token
 * @access private
 */
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userID).select('-password')
    if (!user) return res.status(404).send({ message: 'Unable to reauthorize' })

    const token = jwt.sign({ id: user._id }, getKey('jwtSecret'), {
      expiresIn: '1d',
    })

    return res.send({ token })
  } catch ({ message }) {
    console.log(message)
    return res.status(500).send({ message })
  }
})

/**
 * @description get user profile data
 * @access private
 */
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userID).select('-password')
    if (!user) return res.status(404).send({ message: 'User not found' })

    return res.send(user)
  } catch ({ message }) {
    console.log(message)
    return res.status(500).send({ message })
  }
})

/**
 * @description register new user
 * @access public
 */
router.post(
  '/register',
  [
    check('name', 'First name is required').not().isEmpty(),
    check('surname', 'Last name is required').not().isEmpty(),
    check('email', 'Must be an email').isEmail(),
    check('password', 'Password at least 6 chars').isLength({ min: 6 }),
    check('role', 'Role is required').not().isEmpty(),
    check('school', 'School is required').not().isEmpty(),
    check('programme', 'Programme is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
      return res.status(400).send({ message: 'Validation error', errors: errors.array() })

    const { name, surname, email, password, role, school, programme } = req.body

    try {
      const userExists = await User.findOne({ email })
      if (userExists) return res.status(400).send({ message: 'User already exists' })

      const newUser = new User({
        name,
        surname,
        email,
        role,
        school,
        programme,
      })
      newUser.password = await bcrypt.hash(password, 8)
      await newUser.save()

      const token = jwt.sign({ id: newUser._id }, getKey('jwtSecret'), {
        expiresIn: '1d',
      })

      return res.status(201).send({ token })
    } catch ({ message }) {
      console.log(message)
      return res.status(500).send({ message })
    }
  }
)

/**
 * @description login existing user
 * @access public
 */
router.post(
  '/login',
  [
    check('email', 'Must be an email').isEmail(),
    check('password', 'Password at least 6 chars').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
      return res.status(400).send({ message: 'Validation error', errors: errors.array() })

    const { email, password } = req.body

    try {
      const user = await User.findOne({ email })
      if (!user) return res.status(400).send({ message: 'Invalid credentials' })

      const match = await bcrypt.compare(password, user.password)
      if (!match) return res.status(400).send({ message: 'Invalid credentials' })

      const token = jwt.sign({ id: user._id }, getKey('jwtSecret'), {
        expiresIn: '1d',
      })

      return res.send({ token })
    } catch ({ message }) {
      console.log(message)
      return res.status(500).send({ message })
    }
  }
)

/**
 * @description delete user profile
 * @access private
 */
router.delete('/', auth, async (req, res) => {
  try {
    const userToDelete = await User.findById(req.userID).select('-password')
    if (!userToDelete) return res.status(404).send({ message: 'User not found' })

    // remove user's projects, questions, comments
    await Project.remove({ userId: userToDelete._id })
    await Question.remove({ userId: userToDelete._id })
    await Comment.remove({ userId: userToDelete._id })
    await userToDelete.remove()

    return res.send({ message: 'User profile deleted' })
  } catch ({ message }) {
    console.log(message)
    return res.status(500).send({ message })
  }
})

module.exports = router
