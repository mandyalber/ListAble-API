const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe.only('Lists Endpoints', () => {
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

    describe('GET /api/list', () => {
        context('given no lists in the db', () => {
            it('responds 200 with an empty list', () => {
                return supertest(app)
                    .get('/api/list')
                    .expect(200, [])
            })
        })
        context('given there are lists in the db', () => {
            beforeEach('insert categories & lists', () => {
                return helpers.seedTables(db, testCategories, testLists, testItems)
            })
            it('responds 200 and list of all lists', () => {
                return supertest(app)
                    .get('/api/list')
                    .expect(200)
                    .expect(res => {
                        expect(res.body).to.be.a('array')
                        expect(res.body).to.have.length(testLists.length)
                        res.body.forEach(list => {
                            expect(list).to.be.a('object')
                            expect(list).to.include.keys('id', 'name', 'categoryId')
                        })
                    })


            })
        })
    })

    describe('GET /api/list/:listId', () => {
        beforeEach('insert some lists', () => {
            return helpers.seedTables(db, testCategories, testLists, testItems)
        })
        it('should return the correct list when given an id', () => {
            let testList
            return db('lists').first().then(list => {
                testList = list
                return supertest(app)
                    .get(`/api/list/${testList.id}`)
                    .expect(200)
            })
                .then(res => {
                    expect(res.body).to.be.a('object')
                    expect(res.body).to.include.keys('id', 'name', 'categoryId')
                    expect(res.body.id).to.equal(testList.id)
                    expect(res.body.name).to.equal(testList.name)
                    expect(res.body.categoryId).to.equal(testList.categoryId)
                })
        })
        it('should respond 404 when list does not exist', () => {
            let fakeList = {
                id: 4,
                name: 'list that does not exist',
                categoryId: 1,
            }
            return supertest(app)
                .get(`/api/list/${fakeList.id}`)
                .expect(404, '{"error":{"message":"list does not exist"}}')

        })
        it('should respond 400 when given an invalid id', () => {
            return supertest(app)
                .get('/api/list/a')
                .expect(400, '{"error":{"message":"invalid id"}}')
        })
    })

    describe('POST /api/list', () => {
        beforeEach('insert some lists', () => {
            return helpers.seedTables(db, testCategories, testLists, testItems)
        })
        it('should respond 201 and create new list', () => {
            const newList = {
                name: 'new lsit',
                categoryId: 1
            }
            return supertest(app)
                .post('/api/list')
                .send(newList)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.be.a('object')
                    expect(res.body).to.include.keys('id', 'name', 'categoryId')
                    expect(res.body.name).to.equal(newList.name)
                    expect(res.body.categoryId).to.equal(newList.categoryId)
                    expect(res.headers.location).to.equal(`/api/list/${res.body.id}`)
                })
        })
        it('should respond 400 when missing data', () => {
            const badList = {
                title: 'bad list',
                categpry: 1
            }
            return supertest(app)
                .post('/api/list')
                .send(badList)
                .expect(400)
        })
    })

    describe('PATCH /api/list', () => {
        beforeEach('insert some lists', () => {
            return helpers.seedTables(db, testCategories, testLists, testItems)
        })
        it('should respond 200 and update list when given valid data', () => {
            const updateList = {
                name: 'update list'
            }
            return db('lists').first().then(list => {
                return supertest(app)
                    .patch(`/api/list/${list.id}`)
                    .send(updateList)
                    .expect(200)
            })
                .then(res => {
                    expect(res.body).to.be.a('object')
                    expect(res.body).to.include.keys('id', 'name', 'categoryId')
                    expect(res.body.name).to.equal(updateList.name)

                })
        })
        //if bad data, respond 400
        it('should respond 400 given bad data', () => {
            const badList = {
                title: 'update list'
            }
            return db('lists').first().then(list => {
                return supertest(app)
                    .patch(`/api/list/${list.id}`)
                    .send(badList)
                    .expect(400)
            })
        })
    })

    describe('DELETE /api/list', () => {
        beforeEach('insert some lists', () => {
            return helpers.seedTables(db, testCategories, testLists, testItems)
        })
        it('should respond 204 and delete list', () => {
            return db('lists').first().then(list => { 
                return supertest(app)
                    .delete(`/api/list/${list.id}`)
                    .expect(204)
            })
        })
    })
})