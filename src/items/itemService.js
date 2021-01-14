const itemService = {
    getAllItems(knex){
        return knex.select('*').from('items')
    },
    getItemById(knex, id){
        return knex.select('*').from('items').where('id',id).first()
    },
    insertItem(knex, newItem){
        return knex.insert(newItem).into('items')
            .returning('*').then(rows => {return rows[0]})
    },
    deleteItem(knex, id){
        return knex('items').where('id', id).delete()
    },
    updateItem(knex, id, updatedItem){
        return knex('items').where('id', id)
            .update(updatedItem, returning=true).returning('*')
    }
}

module.exports = itemService