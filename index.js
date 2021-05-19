const express = require('express')
const mongoose = require('mongoose')
const { getKey } = require('./utils/get-key')

const app = express()

app.use(express.json())
app.use('/api/auth', require('./routes/auth'))
app.use('/api/questions', require('./routes/questions'))
app.use('/api/projects', require('./routes/projects'))
app.use('/api/comments', require('./routes/comments'))
app.use('/api/colleagues', require('./routes/colleagues'))

const PORT = process.env.PORT || 5000

mongoose
  .connect(getKey('mongoURI'), {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}...`))
  })
