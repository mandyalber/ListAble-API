const listService = {
    getAllLists(knex){
        return knex.select('*').from('lists')
    },
    getListById(knex, id){
        return knex.select('*').from('lists').where('id',id).first()
    },
    insertList(knex, newList){
        return knex.insert(newList).into('lists')
            .returning('*').then(rows => {return rows[0]})
    },
    deleteList(knex, id){
        return knex('lists').where('id', id).delete()
    },
    updateList(knex, id, updatedList){
        return knex('lists').where('id', id)
            .update(updatedList, returning=true).returning('*')
    }
}

module.exports = listService