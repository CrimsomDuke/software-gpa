
const { Sequelize } = require('sequelize');

const sequelizeInst = new Sequelize({
    dialect : 'postgres',
    database : 'gpa-db',
    username : 'postgres',
    password : 'root',
    host : 'localhost',
    port : 5432
})

sequelizeInst.authenticate()
    .then(() => {
        console.log('DB Connection was fully stablished')
    })
    .catch((err) => {
        console.error("Unable to connect to the DB", err);
    });

module.exports = {
    sequelizeInst, Sequelize
}