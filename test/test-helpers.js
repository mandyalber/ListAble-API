function makeCategoryArray() {
    return [
        { id: 1, name: 'test category 1' },
        { id: 2, name: 'test category 2' },
    ]
}
function makeListArray() {
    return [
        { id: 1, name: 'test list 1', categoryId: 1 },
        { id: 2, name: 'test list 2', categoryId: 2 },
    ]
}
function makeItemArray() {
    return [
        { id: 1, name: 'test item 1', listId: 1 },
        { id: 2, name: 'test item 2', listId: 2 },
    ]
}
function makeFixtures() {
    const testCategories = makeCategoryArray()
    const testLists = makeListArray()
    const testItems = makeItemArray()

    return { testCategories, testLists, testItems }
}

function cleanTables(db) {
    return db.raw('TRUNCATE categories, lists, items RESTART IDENTITY;')
}

function seedCategories(db, categories) {
    return db.into('categories').insert(categories)
}

function seedLists(db, categories, lists = []) {
    return db.transaction(async trans => {
        await seedCategories(trans, categories)
        await trans.into('lists').insert(lists)
    })
}

function seedItems(db, categories, lists, items = []) {
    return db.transaction(async trans => {
        await seedLists(trans, categories, lists = [])
        await trans.into('items').insert(items)
    })
}
module.exports = {
    makeFixtures,
    cleanTables,
    seedCategories,
    seedLists,
    seedItems
}

