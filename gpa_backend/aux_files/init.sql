
INSERT INTO "Roles"("name", "description", "level", "createdAt", "updatedAt")
VALUES('Admin', 'Administrador del sistema', 10, CURRENT_DATE, CURRENT_DATE);

INSERT INTO "Roles"("name", "description", "level", "createdAt", "updatedAt")
VALUES('Contador', 'El contador épico', 5, CURRENT_DATE, CURRENT_DATE);

INSERT INTO "Roles"("name", "description", "level", "createdAt", "updatedAt")
VALUES('Auxiliar', 'El auxiliar', 1, CURRENT_DATE, CURRENT_DATE);

INSERT INTO "Users"(id, username, fullname, email, "password", is_active, role_id, "createdAt", "updatedAt")
VALUES(nextval('"Users_id_seq"'::regclass), 'admin', 'Admin Admin', 'admin@gmail.com', 'admin1234', TRUE, 1, CURRENT_DATE, CURRENT_DATE);

UPDATE "Users" SET role_id = 1
WHERE username LIKE 'admin';

INSERT INTO "Personas"("nombre", "apellido", "fecha_nacimiento", "telefono", "email", "user_id", "createdAt", "updatedAt")
VALUES ('SuperAdmin', 'Admin', '0001-01-01', '99999999', 'superadmin@gmail.com', 1, current_date, current_date);