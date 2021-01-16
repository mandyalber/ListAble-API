require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV, CLIENT_ORIGIN } = require('./config')
const categoryRouter = require('./categories/categoryRouter')
const listRouter = require('./lists/listRouter')
const itemRouter = require('./items/itemRouter')

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common'

app.use(morgan(morganOption))
app.use(helmet())

app.use(
  cors({
      origin: CLIENT_ORIGIN
  })
)

app.get('/', (req, res) => {
  res.json('Server for ListAble Client')
})

app.use('/api/category', categoryRouter)
app.use('/api/list', listRouter)
app.use('/api/item', itemRouter)

app.use(function errorHandler(error, req, res, next) {
  let response
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } }
  } else {
    console.error(error)
    response = { message: error.message, error }
  }
  res.status(500).json(response)
})

module.exports = app