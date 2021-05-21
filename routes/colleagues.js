const router = require('express').Router()
const auth = require('../middleware/auth')
const User = require('../models/User')

/**
 * @description get colleagues - either students or teachers
 * @access private
 * @query role
 */
router.get('/', auth, async (req, res) => {
  // extract 'role' query param, e.g. /api/colleagues?role=student
  const { role } = req.query
  // if the param is not provided, return 400 to the client
  if (!role)
    return res.status(400).send({ message: `Bad request - missing query param 'role'` })

  try {
    // fetch user data
    const user = await User.findById(req.userID)
    // if no user is found, return 404
    if (!user) return res.status(404).send({ message: 'User not found' })

    // fetch all colleagues where the 'role' query param and user's school and programme match
    const allColleagues = await User.find({
      role,
      school: user.school,
      programme: user.programme,
    }).select('-password')
    // return them to the client
    return res.send(allColleagues)
  } catch ({ message }) {
    console.log(message)
    return res.status(500).send({ message })
  }
})

/**
 * @description get colleague detail
 * @access private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    // fetch a colleague by the :id variable above
    const colleague = await User.findById(req.params.id).select('-password')
    // if no colleague is found, return 404
    if (!colleague) return res.status(404).send({ message: 'Colleague not found' })
    // return the data back to the client
    return res.send(colleague)
  } catch ({ message }) {
    console.log(message)
    return res.status(500).send({ message })
  }
})

module.exports = router
