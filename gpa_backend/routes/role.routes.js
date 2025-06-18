

module.exports = (app) => {
    const controller = require('../controllers/role.controller');

    app.get('/roles', controller.getAllRoles);
    app.post('/roles/create', controller.createRole)

    app.get('/roles/:id', controller.getRoleById);
    app.put('/roles/update/:id', controller.updateRole);
    app.delete('/roles/delete/:id', controller.deleteRole);
}