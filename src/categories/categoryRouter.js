const express = require('express')
const path = require('path')
const xss = require('xss')
const categoryService = require('./categoryService')
const categoryRouter = express.Router()
const jsonParser = express.json()

const serializeCat = (cat) => ({
    id: cat.id,
    name: xss(cat.name)
})

categoryRouter
    .route('/')
    .get((req, res, next) => {
        categoryService.getAllCategories(req.app.get('db'))
            .then(cats => {
                res.json(cats)
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { name } = req.body
        const newCat = { name }

        if (!name) {
            return res.status(400)
                .json({ error: { message: 'missing name in request body' } })
        }

        categoryService.insertCategory(req.app.get('db'), newCat)
            .then(cat => {
                res.status(201).location(path.posix.join(req.originalUrl, `/${cat.id}`))
                    .json(serializeCat(cat))
            })
            .catch(next)
    })

module.exports = categoryRouter