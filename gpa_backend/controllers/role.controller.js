

const db = require('../models/');

const AuditLogService = require('../services/audit_log.service');

exports.getAllRoles = async (req, res) => {
    try{
        const roles = await db.Role.findAll({
            order: [['level', 'ASC']]
        });
        if (!roles || roles.length === 0) {
            return res.status(404).json({ message: 'No se encontraron roles' });
        }
        return res.status(200).json(roles);
    }catch(err){
        console.error('Error fetching Roles:', err);
        return res.status(500).json({ message: 'Error obteniendo roles' });
    }
}

exports.getRoleById = async (req, res) => {
    const { id } = req.params;
    try {
        const role = await db.Role.findByPk(id);
        if (!role) {
            return res.status(404).json({ message: 'No se encontró el rol' });
        }
        return res.status(200).json(role);
    } catch (error) {
        console.error('Error fetching Role:', error);
        return res.status(500).json({ message: 'Error obteniendo rol' });
    }
}

exports.createRole = async (req, res) => {
    const { name, description, level, user_id } = req.body;

    try {
        if (!name || !level) {
            return res.status(400).json({ message: 'Los campos name y level son requeridos' });
        }

        if(!user_id){
            return res.status(400).json({ message: 'El campo user_id es requerido' });
        }

        const existingRole = await db.Role.findOne({ where: { name } });
        if (existingRole) {
            return res.status(400).json({ message: 'El rol ya existe' });
        }

        const currentUser = await db.User.findByPk(user_id, {
            include : [{
                model: db.Role,
                as: 'role'
            }]
        });
        if (!currentUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        //usuario no puede crear roles de nivel superior al suyo
        if(currentUser.role && currentUser.role.level <= level){
            return res.status(403).json({ message: 'No tienes permisos para crear un rol de este nivel' });
        }

        const newRole = await db.Role.create({ name, description, level });
        AuditLogService.createAuditLog('CREATE', currentUser.id, 'Role', newRole.id);
        
        return res.status(201).json(newRole);
    } catch (error) {
        console.error('Error creating Role:', error);
        return res.status(500).json({ message: 'Error creando rol' });
    }
}

exports.updateRole = async (req, res) => {
    const { id } = req.params;
    const { name, description, level, user_id } = req.body;

    try {
        const role = await db.Role.findByPk(id);
        if (!role) {
            return res.status(404).json({ message: 'No se encontró el rol' });
        }

        const currentUser = await db.User.findByPk(user_id, {
            include : [{
                model: db.Role,
                as: 'role'
            }]
        });

        if(!currentUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if(currentUser.role && currentUser.role.level <= level){
            return res.status(403).json({ message: 'No tienes permisos para actualizar un rol de este nivel' });
        }

        if(name){
            role.name = role.name; // 
        }
        if(description){
            role.description = description; // 
        }
        if(level !== undefined){
            role.level = level; 
        }
 
        await role.save();
        
        AuditLogService.createAuditLog('UPDATE', currentUser.id, 'Role', role.id);
        
        return res.status(200).json(role);
    } catch (error) {
        console.error('Error updating Role:', error);
        return res.status(500).json({ message: 'Error actualizando rol' });
    }
}

exports.deleteRole = async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body;

    try {
        const role = await db.Role.findByPk(id);
        if (!role) {
            return res.status(404).json({ message: 'No se encontró el rol' });
        }

        const currentUser = await db.User.findByPk(user_id, {
            include : [{
                model: db.Role,
                as: 'role'
            }]
        });

        if(!currentUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if(currentUser.role && currentUser.role.level <= role.level){
            return res.status(403).json({ message: 'No tienes permisos para eliminar un rol de este nivel' });
        }

        await role.destroy();
        
        AuditLogService.createAuditLog('DELETE', currentUser.id, 'Role', role.id);
        
        return res.status(204).send();
    } catch (error) {
        console.error('Error deleting Role:', error);
        return res.status(500).json({ message: 'Error eliminando rol' });
    }
}