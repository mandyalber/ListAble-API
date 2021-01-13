const categoryService = {
    getAllCategories(knex){
        return knex.select('*').from('categories')
    },
}

module.exports = categoryService