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

    before('cleanup', () => helpers.cleanTables(db))

    afterEach('cleanup', () => helpers.cleanTables(db))

    describe('GET /api/item', () => {
        context('given no items in the db', () => {
            it('responds 200 with an empty list', () => {
                return supertest(app)
                    .get('/api/item')
                    .expect(200, [])
            })
        })
        context('given there are items in the db', () => {
            beforeEach('insert categories & lists', () => {
                return helpers.seedTables(db, testCategories, testLists, testItems)
            })
            it('responds 200 and list of all items', () => {
                return supertest(app)
                    .get('/api/item')
                    .expect(200)
                    .expect(res => {
                        expect(res.body).to.be.a('array')
                        expect(res.body).to.have.length(testItems.length)
                        res.body.forEach(item => {
                            expect(item).to.be.a('object')
                            expect(item).to.include.keys('id', 'name', 'listId', 'complete')
                        })
                    })


            })
        })
    })

    describe('GET /api/item/:itemId', () => {
        beforeEach('insert some items', () => {
            return helpers.seedTables(db, testCategories, testLists, testItems)
        })
        it('should return the correct item when given an id', () => {
            let testItem
            return db('items').first().then(item => {
                testItem = item
                return supertest(app)
                    .get(`/api/item/${testItem.id}`)
                    .expect(200)
            })
                .then(res => {
                    expect(res.body).to.be.a('object')
                    expect(res.body).to.include.keys('id', 'name', 'listId', 'complete')
                    expect(res.body.id).to.equal(testItem.id)
                    expect(res.body.name).to.equal(testItem.name)
                    expect(res.body.listId).to.equal(testItem.listId)
                    expect(res.body.complete).to.equal(testItem.complete)
                })
        })
        it('should respond 404 when item does not exist', () => {
            let fakeItem = {
                id: 4,
                name: 'item that does not exist',
                listId: 1,
                complete: false
            }
            return supertest(app)
                .get(`/api/item/${fakeItem.id}`)
                .expect(404, '{"error":{"message":"item does not exist"}}')

        })
        it('should respond 400 when given an invalid id', () => {
            return supertest(app)
                .get('/api/item/a')
                .expect(400, '{"error":{"message":"invalid id"}}')
        })
    })

    describe('POST /api/item', () => {
        beforeEach('insert some items', () => {
            return helpers.seedTables(db, testCategories, testLists, testItems)
        })
        it('should respond 201 and create new item', () => {
            const newItem = {
                name: 'new item',
                listId: 1
            }
            return supertest(app)
                .post('/api/item')
                .send(newItem)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.be.a('object')
                    expect(res.body).to.include.keys('id', 'name', 'listId', 'complete')
                    expect(res.body.name).to.equal(newItem.name)
                    expect(res.body.listId).to.equal(newItem.listId)
                    expect(res.body.complete).to.be.false
                    expect(res.headers.location).to.equal(`/api/item/${res.body.id}`)
                })
        })
        it('should respond 400 when missing data', () => {
            const badItem = {
                title: 'bad item',
                listId: 1
            }
            return supertest(app)
                .post('/api/item')
                .send(badItem)
                .expect(400)
        })
    })

    describe('PATCH /api/item', () => {
        beforeEach('insert some items', () => {
            return helpers.seedTables(db, testCategories, testLists, testItems)
        })
        it('should respond 200 and update item when given valid data', () => {
            const updateItem = {
                name: 'update item'
            }
            return db('items').first().then(item => {
                testItem = item
                return supertest(app)
                    .patch(`/api/item/${item.id}`)
                    .send(updateItem)
                    .expect(200)
            })
                .then(res => {
                    expect(res.body).to.be.a('object')
                    expect(res.body).to.include.keys('id', 'name', 'listId', 'complete')
                    expect(res.body.name).to.equal(updateItem.name)

                })
        })
        //if bad data, respond 400
        it('should respond 400 given bad data', () => {
            const badItem = {
                title: 'update item'
            }
            return db('items').first().then(item => {
                return supertest(app)
                    .patch(`/api/item/${item.id}`)
                    .send(badItem)
                    .expect(400)
            })
        })
    })

    describe('DELETE /api/item', () => {
        beforeEach('insert some items', () => {
            return helpers.seedTables(db, testCategories, testLists, testItems)
        })
        it('should respond 204 and delete item', () => {
            return db('items').first().then(item => { 
                return supertest(app)
                    .delete(`/api/item/${item.id}`)
                    .expect(204)
            })
        })
    })
})