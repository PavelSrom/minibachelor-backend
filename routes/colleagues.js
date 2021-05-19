const router = require('express').Router()
const auth = require('../middleware/auth')
const User = require('../models/User')

/**
 * @description get colleagues - either students or teachers
 * @access private
 * @query role
 */
router.get('/', auth, async (req, res) => {
  const { role } = req.query
  if (!role) return res.status(400).send({ message: 'Bad request' })

  try {
    const user = await User.findById(req.userID)
    if (!user) return res.status(404).send({ message: 'User not found' })

    const allColleagues = await User.find({
      role,
      school: user.school,
      programme: user.programme,
    })

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
    const colleague = await User.findById(req.params.id)
    if (!colleague) return res.status(404).send({ message: 'Colleague not found' })

    return res.send(colleague)
  } catch ({ message }) {
    console.log(message)
    return res.status(500).send({ message })
  }
})

module.exports = router
