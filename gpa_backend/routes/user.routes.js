
module.exports = (app) => {
    const controller = require('../controllers/user.controller.js');

    //sin parametros
    app.get('/users', controller.getAllUsers);
    app.post('/users/register', controller.registerUser);
    app.post('/users/login', controller.loginUser);

    //con parametros
    app.get('/users/:id', controller.getUserById);
    app.put('/users/change_rol/:id', controller.changeUserRole);
    app.put('/users/update/:id', controller.updateUser);
}