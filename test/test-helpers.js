function makeCategoryArray() {
    return [
        { name: 'test category 1' },
        { name: 'test category 2' },
    ]
}
function makeListArray() {
    return [
        { name: 'test list 1', categoryId: 1 },
        { name: 'test list 2', categoryId: 2 },
    ]
}
function makeItemArray() {
    return [
        { name: 'test item 1', listId: 1},
        { name: 'test item 2', listId: 2},
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

function seedTables(db, categories, lists, items) {
    return db.insert(categories).into('categories')
        .then(() => {
            return db.insert(lists).into('lists')
        })
        .then(() => {
            return db.insert(items).into('items')
        })
}

module.exports = {
    makeFixtures,
    cleanTables,
    seedTables
}

