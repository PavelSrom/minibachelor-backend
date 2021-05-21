const router = require('express').Router()
const { check, validationResult } = require('express-validator')
const auth = require('../middleware/auth')
const Project = require('../models/Project')
const User = require('../models/User')

/**
 * these endpoints would also return project for user and other colleague
 * use query params with the user id through which you will filter
 */

/**
 * @description get all projects by criteria
 * @access private
 * @query user, school, programme, sortBy
 */
router.get('/', auth, async (req, res) => {
  // extract possible query params from the req.query object
  const { user, school, programme, sortBy } = req.query
  // setup filtering and sorting objects to pass into db query
  const filter = {}
  const sort = {}
  // for all params - if it's passed in, add it to the objects
  if (user) filter.userId = user
  if (school) filter.school = school
  if (programme) filter.programme = programme
  if (sortBy) sort.createdAt = sortBy === 'newest' ? 1 : -1

  try {
    // fetch all projects, pass in filtering and sorting objects
    const allProjects = await Project.find(filter).sort(sort)
    // return response to the client
    return res.send(allProjects)
  } catch ({ message }) {
    console.log(message)
    return res.status(500).send({ message })
  }
})

/**
 * @description create new project
 * @access private
 */
router.post(
  '/',
  [
    auth,
    // validate request body fields
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description must be a string').isString(),
    check('demoUrl', 'Demo URL is required').isURL(),
    check('otherUrl', 'Must be a URL').isString(),
  ],
  async (req, res) => {
    // request body validation stuff
    const errors = validationResult(req)
    // if validation errors, return 400 and a response to the client
    if (!errors.isEmpty())
      return res.status(400).send({ message: 'Validation error', errors: errors.array() })
    // extract stuff from the request body
    const { title, description, demoUrl, otherUrl } = req.body

    try {
      // fetch user data without password
      const user = await User.findById(req.userID).select('-password')
      // if user not found, return 404
      if (!user) return res.status(404).send({ message: 'User not found' })
      // create a new project entity with the necessary fields
      const newProject = new Project({
        userId: user._id,
        userName: user.name,
        userSurname: user.surname,
        school: user.school,
        programme: user.programme,
        title,
        description,
        demoUrl,
        otherUrl,
      })
      // save into db
      await newProject.save()
      // return to the client
      return res.status(201).send(newProject)
    } catch ({ message }) {
      console.log(message)
      return res.status(500).send({ message })
    }
  }
)

/**
 * @description delete a project
 * @access private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    // fetch the project that should be deleted
    const projectToDelete = await Project.findById(req.params.id)
    // if not found, return 404
    if (!projectToDelete) return res.status(404).send({ message: 'Project not found' })
    // if userId and ID from token don't match, return 403 - forbidden
    if (projectToDelete.userId.toString() !== req.userID)
      return res.status(403).send({ message: 'Access denied' })

    // remove all comments for that project as well
    await Comment.remove({ entityId: projectToDelete._id })
    // remove project
    await projectToDelete.remove()
    // return response to client
    return res.send({ message: 'Project removed successfully' })
  } catch ({ message }) {
    console.log(message)
    return res.status(500).send({ message })
  }
})

module.exports = router
