const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userSurname: {
      type: String,
      required: true,
    },
    school: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    demoUrl: {
      type: String,
      required: true,
    },
    otherUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

module.exports = Project = mongoose.model('Project', projectSchema)
