const itemService = {
    getAllItems(knex){
        return knex.select('*').from('items')
    },
    insertItem(knex, newItem){
        return knex.insert(newItem).into('items')
            .returning('*').then(rows => {return rows[0]})
    },
}

module.exports = itemService