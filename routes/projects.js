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
  const { user, school, programme, sortBy } = req.query

  const filter = {}
  const sort = {}

  if (user) filter.userId = user
  if (school) filter.school = school
  if (programme) filter.programme = programme
  if (sortBy) sort.createdAt = sortBy === 'newest' ? -1 : 1

  try {
    const allProjects = await Project.find(filter).sort(sort)

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
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description must be a string').isString(),
    check('demoUrl', 'Demo URL is required').isURL(),
    check('otherUrl', 'Must be a URL').isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
      return res.status(400).send({ message: 'Validation error', errors: errors.array() })

    const { title, description, demoUrl, otherUrl } = req.body

    try {
      const user = await User.findById(req.userID)
      if (!user) return res.status(404).send({ message: 'User not found' })

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
      await newProject.save()

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
    const projectToDelete = await Project.findById(req.params.id)
    if (!projectToDelete) return res.status(404).send({ message: 'Project not found' })
    if (projectToDelete.userId !== req.userID)
      return res.status(403).send({ message: 'Access denied' })

    // remove all comments for that project as well
    await Comment.remove({ entityId: projectToDelete._id })
    await projectToDelete.remove()

    return res.send({ message: 'Project removed successfully' })
  } catch ({ message }) {
    console.log(message)
    return res.status(500).send({ message })
  }
})

module.exports = router
