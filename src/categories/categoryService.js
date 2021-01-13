const categoryService = {
    getAllCategories(knex) {
        return knex.select('*').from('categories')
    },
    insertCategory(knex, newCat) {
        return knex.insert(newCat).into('categories')
            .returning('*').then(rows => { return rows[0] })
    },
}

module.exports = categoryService