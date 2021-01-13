const listService = {
    getAllLists(knex){
        return knex.select('*').from('lists')
    },
    insertList(knex, newList){
        return knex.insert(newList).into('lists')
            .returning('*').then(rows => {return rows[0]})
    },
}

module.exports = listService