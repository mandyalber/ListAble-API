const express = require('express')
const path = require('path')
const xss = require('xss')
const itemService = require('./itemService')
const itemRouter = express.Router()
const jsonParser = express.json()

const serializeItem = (item) => ({
    id: item.id,
    name: xss(item.name),
    listId: item.listId
})

itemRouter
    .route('/')
    .get((req, res, next) => {
        itemService.getAllItems(req.app.get('db'))
            .then(items => {
                res.json(items)
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { name, listId } = req.body
        const newItem = { name, listId }

        if (!name) {
            return res.status(400)
                .json({ error: { message: 'missing name in request body' } })
        }
        if (!listId) {
            return res.status(400)
                .json({ error: { message: 'missing list id in request body' } })
        }

        itemService.insertItem(req.app.get('db'), newItem)
            .then(item => {
                res.status(201).location(path.posix.join(req.originalUrl, `/${item.id}`))
                    .json(serializeItem(item))
            })
            .catch(next)
    })

module.exports = itemRouter