const express = require('express')
const path = require('path')
const xss = require('xss')
const itemService = require('./itemService')
const itemRouter = express.Router()
const jsonParser = express.json()

const serializeItem = (item) => ({
    id: item.id,
    name: xss(item.name),
    listId: item.listId,
    complete: item.complete
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
        const { name, listId, complete = false } = req.body
        const newItem = { name, listId, complete }

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

itemRouter
    .route('/:itemId')
    .all((req, res, next) => {
        if (isNaN(parseInt(req.params.itemId))) {
            return res.status(400)
                .json({ error: { message: 'invalid id' } })
        }
        itemService.getItemById(req.app.get('db'), req.params.itemId)
            .then(item => {
                if (!item) {
                    return res.status(404)
                        .json({ error: { message: 'item does not exist' } })
                }
                res.item = item
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeItem(res.item))
    })
    .patch(jsonParser, (req, res, next) => {
        const { name, complete } = req.body
        const updatedItem = { name, complete }

        if (!name && !complete) {
            return res.status(400)
                .json({ error: { message: 'request must contain either name or complete fields to update' } })
        }
        itemService.updateItem(req.app.get('db'), req.params.itemId, updatedItem)
            .then(updatedItem => { 
                res.status(200).json(serializeItem(updatedItem[0]))
                //console.log('updatedItem ', updatedItem[0])
            })
            .catch(next)
    })
    .delete((req, res, next) => {
        itemService.deleteItem(req.app.get('db'), req.params.itemId)
            .then(item => {
                res.status(204).end()
            })
            .catch(next)
    })


module.exports = itemRouter