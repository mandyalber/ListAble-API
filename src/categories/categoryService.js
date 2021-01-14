const categoryService = {
    getAllCategories(knex) {
        return knex.select('*').from('categories')
    },
    getCategoryById(knex, id){
        return knex.select('*').from('categories').where('id',id).first()
    },
    insertCategory(knex, newCat) {
        return knex.insert(newCat).into('categories')
            .returning('*').then(rows => { return rows[0] })
    },
    deleteCategory(knex, id){
        return knex('categories').where('id', id).delete()
    },
    updateCategory(knex, id, updatedCategory){
        return knex('categories').where('id', id)
            .update(updatedCategory, returning=true).returning('*')
    }
}

module.exports = categoryService