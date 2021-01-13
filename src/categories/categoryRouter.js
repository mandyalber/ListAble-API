const express = require('express')
const categoryService = require('./categoryService')
const categoryRouter = express.Router()
const jsonParser= express.json()

categoryRouter
    .route('/')
    .get((req, res, next)=>{
        categoryService.getAllCategories(req.app.get('db'))
        .then(cats => {
            res.json(cats)
        })
        .catch(next)
    })

    module.exports = categoryRouter