
const global_vars = require('../config/global');
const db = require('../models/');
const user = require('../models/user');
const AuditLogService = require('../services/audit_log.service');
const sha1 = require('sha1');

exports.getAllUsers = async (req, res) => {
    try {
        const users = await db.User.findAll();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await db.User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.registerUser = async (req, res) => {
    console.log(req.body)
    const { username, email, password, role } = req.body;

    if(global_vars.user_roles.indexOf(role) === -1){
        return res.status(400).json({ message: 'Invalid role' });
    }
    try {

        const existingUser = await db.User.findOne({ where: { username : username } });
        if (existingUser) {
            return res.status(400).json({ message: 'Usuario ya existe' });
        }

        const hashedPassword = await sha1(password); // Hash the password using sha1

        const newUser = await db.User.create({
            username : username,
            email : email,
            password: hashedPassword, // Hash the password before saving it
            role : role,
        });

        // Create an audit log for user creation
        await AuditLogService.createAuditLog('create', newUser.id, 'User', newUser.id);

        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: `Internal server error: ${error}` });
    }
}

exports.loginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await db.User.findOne({ where: { username } });
        if (!user) {
            return res.status(401).json({ message: 'Usuario o contraseña invalidos' });
        }

        const isPasswordValid = verifyPassword(password, user.password); // Compare the hashed password with the stored hashed password
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Usuario o contraseña invalidos' });
        }

        // Create an audit log for user login
        await AuditLogService.createAuditLog('login', user.id, 'User', user.id);

        res.status(200).json(user);
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: `Internal server error: ${error}` });
    }
}

exports.changeUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if(global_vars.user_roles.indexOf(role) === -1){
        return res.status(400).json({ message: 'Rol invalido' });
    }
    try {
        const user = await db.User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        user.role = role;
        await user.save();

        // Create an audit log for user role change
        await AuditLogService.createAuditLog('update', user.id, 'User', user.id);

        res.status(200).json(user);
    } catch (error) {
        console.error('Error changing user role:', error);
        res.status(500).json({ message: `Internal server error` });
    }
}

const verifyPassword = (password, hashedPassword) => {
    return sha1(password) === hashedPassword; // Compare the hashed password with the stored hashed password
}

