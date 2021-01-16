//GET categories
    //with categories, respond 200 with array of categories
    //with no categories, respond 200 and empty array

//POST category
    //categories does not exist, respond 201 created with path

//PATCH category
    //given a valid id, update category
    //if bad data, respond 400
    //if id not found, respond 404

//DELETE category
    //given valid id, delete category, lists and items associated
    //if invalid id, respond 404

    //GET lists
    //with lists, respond 200 with array of lists
    //with no lists, respond 200 and empty array

//POST list
    //list does not exist, respond 201 created with path

//PATCH list
    //given a valid id, update list
    //if bad data, respond 400
    //if id not found, respond 404

//DELETE list
    //given valid id, delete list and corresponding items
    //if invalid id, respond 404

const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe.only('Categories Endpoints', () => {
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

    describe('GET /api/category', () => {
        context('given no categories in the db', () => {
            it('responds 200 with an empty category', () => {
                return supertest(app)
                    .get('/api/category')
                    .expect(200, [])
            })
        })
        context('given there are categories in the db', () => {
            beforeEach('insert categories & categories', () => {
                return helpers.seedTables(db, testCategories, testLists, testItems)
            })
            it('responds 200 and list of all categories', () => {
                return supertest(app)
                    .get('/api/category')
                    .expect(200)
                    .expect(res => {
                        expect(res.body).to.be.a('array')
                        expect(res.body).to.have.length(testCategories.length)
                        res.body.forEach(category => {
                            expect(category).to.be.a('object')
                            expect(category).to.include.keys('id', 'name')
                        })
                    })
            })
        })
    })

    describe('GET /api/category/:categoryId', () => {
        beforeEach('insert some categories', () => {
            return helpers.seedTables(db, testCategories, testLists, testItems)
        })
        it('should return the correct category when given an id', () => {
            let testCategory
            return db('categories').first().then(category => {
                testCategory = category
                return supertest(app)
                    .get(`/api/category/${testCategory.id}`)
                    .expect(200)
            })
                .then(res => {
                    expect(res.body).to.be.a('object')
                    expect(res.body).to.include.keys('id', 'name')
                    expect(res.body.id).to.equal(testCategory.id)
                    expect(res.body.name).to.equal(testCategory.name)
                })
        })
        it('should respond 404 when category does not exist', () => {
            let fakeCategory = {
                id: 4,
                name: 'category that does not exist',
                categoryId: 1,
            }
            return supertest(app)
                .get(`/api/category/${fakeCategory.id}`)
                .expect(404, '{"error":{"message":"category does not exist"}}')

        })
        it('should respond 400 when given an invalid id', () => {
            return supertest(app)
                .get('/api/category/a')
                .expect(400, '{"error":{"message":"invalid id"}}')
        })
    })

    describe('POST /api/category', () => {
        beforeEach('insert some categories', () => {
            return helpers.seedTables(db, testCategories, testLists, testItems)
        })
        it('should respond 201 and create new category', () => {
            const newCategory = {
                name: 'new category'
            }
            return supertest(app)
                .post('/api/category')
                .send(newCategory)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.be.a('object')
                    expect(res.body).to.include.keys('id', 'name')
                    expect(res.body.name).to.equal(newCategory.name)
                    expect(res.headers.location).to.equal(`/api/category/${res.body.id}`)
                })
        })
        it('should respond 400 when bad data', () => {
            const badCategory = {
                title: 'bad category',
            }
            return supertest(app)
                .post('/api/category')
                .send(badCategory)
                .expect(400)
        })
    })

    describe('PATCH /api/category', () => {
        beforeEach('insert some categories', () => {
            return helpers.seedTables(db, testCategories, testLists, testItems)
        })
        it('should respond 200 and update category when given valid data', () => {
            const updateCategory = {
                name: 'update category'
            }
            return db('categories').first().then(category => {
                return supertest(app)
                    .patch(`/api/category/${category.id}`)
                    .send(updateCategory)
                    .expect(200)
            })
                .then(res => {
                    expect(res.body).to.be.a('object')
                    expect(res.body).to.include.keys('id', 'name')
                    expect(res.body.name).to.equal(updateCategory.name)

                })
        })
        //if bad data, respond 400
        it('should respond 400 given bad data', () => {
            const badCategory = {
                title: 'update category'
            }
            return db('categories').first().then(category => {
                return supertest(app)
                    .patch(`/api/category/${category.id}`)
                    .send(badCategory)
                    .expect(400)
            })
        })
    })

    describe('DELETE /api/category', () => {
        beforeEach('insert some categories', () => {
            return helpers.seedTables(db, testCategories, testLists, testItems)
        })
        it('should respond 204 and delete category', () => {
            return db('categories').first().then(category => { 
                return supertest(app)
                    .delete(`/api/category/${category.id}`)
                    .expect(204)
            })
        })
    })
})