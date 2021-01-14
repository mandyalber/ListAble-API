const express = require('express')
const path = require('path')
const xss = require('xss')
const categoryService = require('./categoryService')
const categoryRouter = express.Router()
const jsonParser = express.json()

const serializeCategory = (cat) => ({
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

categoryRouter
    .route('/:categoryId')
    .all((req, res, next) => {
        if (isNaN(parseInt(req.params.categoryId))) {
            return res.status(400)
                .json({ error: { message: 'invalid id' } })
        }
        categoryService.getCategoryById(req.app.get('db'), req.params.categoryId)
            .then(category => {
                if (!category) {
                    return res.status(404)
                        .json({ error: { message: 'category does not exist' } })
                }
                res.category = category
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeCategory(category))
    })
    .patch(jsonParser, (req, res, next) => {
        const { name } = req.body
        const updatedCategory = { name }
        console.log(req.body)
        if (!name) {
            return res.status(400)
                .json({ error: { message: 'request must contain name to update' } })
        }
        categoryService.updateCategory(req.app.get('db'), req.params.categoryId, updatedCategory)
            .then(updatedCategory => {
                res.status(200).json(serializeCategory(updatedCategory))
            })
            .catch(next)
    })
    .delete((req, res, next) => {
        categoryService.deleteCategory(req.app.get('db'), req.params.categoryId)
            .then(category => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = categoryRouter