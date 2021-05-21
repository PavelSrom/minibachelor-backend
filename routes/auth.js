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
    // fetch user data without password
    const user = await User.findById(req.userID).select('-password')
    // if not found, return 404
    if (!user) return res.status(404).send({ message: 'Unable to reauthorize' })
    // create new token, sign it and make it expire in 1 day
    const token = jwt.sign({ id: user._id }, getKey('jwtSecret'), {
      expiresIn: '1d',
    })
    // return the token to the client
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
    // fetch user data without password
    const user = await User.findById(req.userID).select('-password')
    // if not found, return 404
    if (!user) return res.status(404).send({ message: 'User not found' })
    // return user data to the client
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
    // validate request body
    check('name', 'First name is required').not().isEmpty(),
    check('surname', 'Last name is required').not().isEmpty(),
    check('email', 'Must be an email').isEmail(),
    check('password', 'Password at least 6 chars').isLength({ min: 6 }),
    check('role', 'Role is required').not().isEmpty(),
    check('school', 'School is required').not().isEmpty(),
    check('programme', 'Programme is required').not().isEmpty(),
  ],
  async (req, res) => {
    // check validation results
    const errors = validationResult(req)
    // if validation errors, return 400 and the errors back to the client
    if (!errors.isEmpty())
      return res.status(400).send({ message: 'Validation error', errors: errors.array() })

    // extract all data from the request body
    const { name, surname, email, password, role, school, programme } = req.body

    try {
      // try to find a user by the provided email
      const userExists = await User.findOne({ email })
      // if the user exists, that's bad - you can't have 2 users using same email
      if (userExists) return res.status(400).send({ message: 'User already exists' })
      // create a new user entity, feed it with the provided data
      const newUser = new User({
        name,
        surname,
        email,
        role,
        school,
        programme,
      })
      // hash password
      newUser.password = await bcrypt.hash(password, 8)
      // save user to db
      await newUser.save()
      // create a token for the user to use, sign it and expire in 1 day
      const token = jwt.sign({ id: newUser._id }, getKey('jwtSecret'), {
        expiresIn: '1d',
      })
      // return the token back to the client
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
    // validation stuff
    check('email', 'Must be an email').isEmail(),
    check('password', 'Password at least 6 chars').isLength({ min: 6 }),
  ],
  async (req, res) => {
    // validate request obdy
    const errors = validationResult(req)
    // if validation errors, return 400 and the errors to the client
    if (!errors.isEmpty())
      return res.status(400).send({ message: 'Validation error', errors: errors.array() })
    // extract email and password from the request body
    const { email, password } = req.body

    try {
      // try to find a user by the email provided
      const user = await User.findOne({ email })
      // if no such user exists, that's bad - invalid email - return 400 response
      if (!user) return res.status(400).send({ message: 'Invalid credentials' })
      // if email matches, proceed to compare passwords
      const match = await bcrypt.compare(password, user.password)
      // if passwords don't match, same thing - invalid credentials
      if (!match) return res.status(400).send({ message: 'Invalid credentials' })
      // only if both match, create a token, sign it and expire in 1 day
      const token = jwt.sign({ id: user._id }, getKey('jwtSecret'), {
        expiresIn: '1d',
      })
      // return the token back to the client
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
    // fetch data of user that should be deleted, without password
    const userToDelete = await User.findById(req.userID).select('-password')
    // if no such user is found, return 404
    if (!userToDelete) return res.status(404).send({ message: 'User not found' })

    // remove user's projects, questions, comments
    await Project.remove({ userId: userToDelete._id })
    await Question.remove({ userId: userToDelete._id })
    await Comment.remove({ userId: userToDelete._id })
    // remove the user itself
    await userToDelete.remove()
    // return a response back to the client
    return res.send({ message: 'User profile deleted' })
  } catch ({ message }) {
    console.log(message)
    return res.status(500).send({ message })
  }
})

module.exports = router
