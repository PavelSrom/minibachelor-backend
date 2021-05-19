const express = require('express')
const mongoose = require('mongoose')
const { getKey } = require('./utils/get-key')

const app = express()

app.use(express.json())
app.use('/api/auth', require('./routes/auth'))

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
