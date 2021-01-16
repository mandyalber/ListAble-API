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

listRouter
    .route('/:listId')
    .all((req, res, next) => {
        if (isNaN(parseInt(req.params.listId))) {
            return res.status(400)
                .json({ error: { message: 'invalid id' } })
        }
        listService.getListById(req.app.get('db'), req.params.listId)
            .then(list => {
                if (!list) {
                    return res.status(404)
                        .json({ error: { message: 'list does not exist' } })
                }
                res.list = list
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeList(res.list))
    })
    .patch(jsonParser, (req, res, next) => {
        const { name } = req.body
        const updatedList = { name }
        console.log(req.body)
        if (!name) {
            return res.status(400)
                .json({ error: { message: 'request must contain name to update' } })
        }
        listService.updateList(req.app.get('db'), req.params.listId, updatedList)
            .then(updatedList => {
                res.status(200).json(serializeList(updatedList[0]))
            })
            .catch(next)
    })
    .delete((req, res, next) => {
        listService.deleteList(req.app.get('db'), req.params.listId)
            .then(list => {
                res.status(204).end()
            })
            .catch(next)
    })


module.exports = listRouter