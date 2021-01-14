const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Items Endpoints', () => {
    let db

    const { testItems, testLists, testCategories } = helpers.makeFixtures()

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('cleanup', () => db.raw('TRUNCATE categories, lists, items RESTART IDENTITY;'))

    afterEach('cleanup', () => db.raw('TRUNCATE categories, lists, items RESTART IDENTITY;'))

    describe('GET /api/item', () => {
        //GET items
        context('given no items in the db', () => {
            beforeEach('insert categories & lists', () => {
                helpers.seedLists(
                    db,
                    helpers.seedCategories(db, testCategories),
                    helpers.seedLists(testLists)
                )
            })
            it('responds 200 with an empty list', ()=>{
                return supertest(app)
                .get('/api/item')
                .expect(200, [])
            })
        })
        //with items, respond 200 with array of items
        context('given there are items in the db', () => {

        })
        //with no items, respond 200 and empty array
    })


    describe('POST /api/item', () => {
        //POST items
        //item does not exist, respond 201 created with path
    })

    describe('PATCH /api/item', () => {
        //PATCH item
        //given a valid id, update item
        //if bad data, respond 400
        //if id not found, respond 404
    })
    describe('DELETE /api/item', () => {
        //DELETE item
        //given valid id, delete item
        //if invalid id, respond 404
    })
})