const express = require('express')
const path = require('path')
const xss = require('xss')
const listService = require('./listService')
const listRouter = express.Router()
const jsonParser = express.json()

const serializeList = (list) => ({
    id: list.id,
    name: xss(list.name),
    categoryId: list.categoryId
})

listRouter
    .route('/')
    .get((req, res, next) => {
        listService.getAllLists(req.app.get('db'))
            .then(lists => {
                res.json(lists)
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { name, categoryId } = req.body
        const newList = { name, categoryId }

        if (!name) {
            return res.status(400)
                .json({ error: { message: 'missing name in request body' } })
        }
        if (!categoryId) {
            return res.status(400)
                .json({ error: { message: 'missing category id in request body' } })
        }

        listService.insertList(req.app.get('db'), newList)
            .then(list => {
                res.status(201).location(path.posix.join(req.originalUrl, `/${list.id}`))
                    .json(serializeList(list))
            })
            .catch(next)
    })

module.exports = listRouter