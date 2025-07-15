
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

-- ========================================
-- DATOS ADICIONALES PARA EL SISTEMA
-- ========================================

-- Insertar más usuarios
INSERT INTO "Users"(username, fullname, email, "password", is_active, role_id, "createdAt", "updatedAt")
VALUES 
('contador01', 'María González', 'maria.gonzalez@empresa.com', 'contador123', TRUE, 2, CURRENT_DATE, CURRENT_DATE),
('auxiliar01', 'Juan Pérez', 'juan.perez@empresa.com', 'auxiliar123', TRUE, 3, CURRENT_DATE, CURRENT_DATE),
('auxiliar02', 'Ana López', 'ana.lopez@empresa.com', 'auxiliar123', TRUE, 3, CURRENT_DATE, CURRENT_DATE);

-- Insertar personas para los nuevos usuarios
INSERT INTO "Personas"("nombre", "apellido", "fecha_nacimiento", "telefono", "email", "user_id", "createdAt", "updatedAt")
VALUES 
('María', 'González', '1985-03-15', '22334455', 'maria.gonzalez@empresa.com', 2, CURRENT_DATE, CURRENT_DATE),
('Juan', 'Pérez', '1990-07-22', '33445566', 'juan.perez@empresa.com', 3, CURRENT_DATE, CURRENT_DATE),
('Ana', 'López', '1988-11-10', '44556677', 'ana.lopez@empresa.com', 4, CURRENT_DATE, CURRENT_DATE);

-- Insertar TipoCuenta
INSERT INTO "TipoCuenta"(nombre, descripcion, "createdAt", "updatedAt")
VALUES 
('activo', 'Bienes y derechos de la empresa', CURRENT_DATE, CURRENT_DATE),
('pasivo', 'Obligaciones y deudas de la empresa', CURRENT_DATE, CURRENT_DATE),
('capital', 'Patrimonio de la empresa', CURRENT_DATE, CURRENT_DATE),
('ingresos', 'Ingresos operacionales y no operacionales', CURRENT_DATE, CURRENT_DATE),
('egresos', 'Gastos y costos de la empresa', CURRENT_DATE, CURRENT_DATE),
('cuentas_de_orden', 'Cuentas de control y orden', CURRENT_DATE, CURRENT_DATE);

-- Insertar NivelCuenta
INSERT INTO "NivelCuenta"(nombre, profundidad, longitud_maxima, "createdAt", "updatedAt")
VALUES 
('cuenta', 1, 1, CURRENT_DATE, CURRENT_DATE),
('grupo', 2, 2, CURRENT_DATE, CURRENT_DATE),
('subgrupo', 3, 4, CURRENT_DATE, CURRENT_DATE),
('mayor', 4, 6, CURRENT_DATE, CURRENT_DATE),
('analitica', 5, 8, CURRENT_DATE, CURRENT_DATE);

-- Insertar CentroCostos
INSERT INTO "CentroCostos"(codigo, nombre, descripcion, esta_activo, "createdAt", "updatedAt")
VALUES 
('CC001', 'Administración General', 'Centro de costo para gastos administrativos', TRUE, CURRENT_DATE, CURRENT_DATE),
('CC002', 'Ventas', 'Centro de costo para actividades de ventas', TRUE, CURRENT_DATE, CURRENT_DATE),
('CC003', 'Producción', 'Centro de costo para procesos productivos', TRUE, CURRENT_DATE, CURRENT_DATE),
('CC004', 'Recursos Humanos', 'Centro de costo para gestión de personal', TRUE, CURRENT_DATE, CURRENT_DATE),
('CC005', 'Sistemas', 'Centro de costo para tecnología', TRUE, CURRENT_DATE, CURRENT_DATE);

-- Insertar ObjetoGastos
INSERT INTO "ObjetoGastos"(codigo, nombre, descripcion, esta_activo, "createdAt", "updatedAt")
VALUES 
('OG001', 'Sueldos y Salarios', 'Gastos de personal fijo', TRUE, CURRENT_DATE, CURRENT_DATE),
('OG002', 'Servicios Básicos', 'Agua, luz, teléfono, internet', TRUE, CURRENT_DATE, CURRENT_DATE),
('OG003', 'Materiales de Oficina', 'Papelería y suministros', TRUE, CURRENT_DATE, CURRENT_DATE),
('OG004', 'Mantenimiento', 'Mantenimiento de equipos e instalaciones', TRUE, CURRENT_DATE, CURRENT_DATE),
('OG005', 'Publicidad', 'Gastos de mercadeo y publicidad', TRUE, CURRENT_DATE, CURRENT_DATE),
('OG006', 'Capacitación', 'Formación y desarrollo del personal', TRUE, CURRENT_DATE, CURRENT_DATE),
('OG007', 'Viáticos', 'Gastos de viaje y alimentación', TRUE, CURRENT_DATE, CURRENT_DATE),
('OG008', 'Equipos de Computo', 'Hardware y software', TRUE, CURRENT_DATE, CURRENT_DATE);

-- Insertar Cuentas (Plan Contable)
-- Nivel 1 - Cuentas principales
INSERT INTO "Cuenta"(codigo, nombre, descripcion, esta_activa, tipo_cuenta_id, nivel_cuenta_id, cuenta_padre_id, objeto_gasto_id, "createdAt", "updatedAt")
VALUES 
('1', 'ACTIVO', 'Activos de la empresa', TRUE, 1, 1, NULL, NULL, CURRENT_DATE, CURRENT_DATE),
('2', 'PASIVO', 'Pasivos de la empresa', TRUE, 2, 1, NULL, NULL, CURRENT_DATE, CURRENT_DATE),
('3', 'PATRIMONIO', 'Patrimonio de la empresa', TRUE, 3, 1, NULL, NULL, CURRENT_DATE, CURRENT_DATE),
('4', 'INGRESOS', 'Ingresos de la empresa', TRUE, 4, 1, NULL, NULL, CURRENT_DATE, CURRENT_DATE),
('5', 'GASTOS', 'Gastos de la empresa', TRUE, 5, 1, NULL, NULL, CURRENT_DATE, CURRENT_DATE);

-- Nivel 2 - Grupos
INSERT INTO "Cuenta"(codigo, nombre, descripcion, esta_activa, tipo_cuenta_id, nivel_cuenta_id, cuenta_padre_id, objeto_gasto_id, "createdAt", "updatedAt")
VALUES 
('11', 'ACTIVO CORRIENTE', 'Activos líquidos y realizables', TRUE, 1, 2, (SELECT id FROM "Cuenta" WHERE codigo = '1'), NULL, CURRENT_DATE, CURRENT_DATE),
('12', 'ACTIVO NO CORRIENTE', 'Activos fijos y permanentes', TRUE, 1, 2, (SELECT id FROM "Cuenta" WHERE codigo = '1'), NULL, CURRENT_DATE, CURRENT_DATE),
('21', 'PASIVO CORRIENTE', 'Obligaciones a corto plazo', TRUE, 2, 2, (SELECT id FROM "Cuenta" WHERE codigo = '2'), NULL, CURRENT_DATE, CURRENT_DATE),
('22', 'PASIVO NO CORRIENTE', 'Obligaciones a largo plazo', TRUE, 2, 2, (SELECT id FROM "Cuenta" WHERE codigo = '2'), NULL, CURRENT_DATE, CURRENT_DATE),
('31', 'CAPITAL SOCIAL', 'Capital aportado', TRUE, 3, 2, (SELECT id FROM "Cuenta" WHERE codigo = '3'), NULL, CURRENT_DATE, CURRENT_DATE),
('32', 'RESULTADOS', 'Utilidades y pérdidas', TRUE, 3, 2, (SELECT id FROM "Cuenta" WHERE codigo = '3'), NULL, CURRENT_DATE, CURRENT_DATE),
('41', 'INGRESOS OPERACIONALES', 'Ingresos por ventas', TRUE, 4, 2, (SELECT id FROM "Cuenta" WHERE codigo = '4'), NULL, CURRENT_DATE, CURRENT_DATE),
('42', 'INGRESOS NO OPERACIONALES', 'Otros ingresos', TRUE, 4, 2, (SELECT id FROM "Cuenta" WHERE codigo = '4'), NULL, CURRENT_DATE, CURRENT_DATE),
('51', 'GASTOS OPERACIONALES', 'Gastos del giro del negocio', TRUE, 5, 2, (SELECT id FROM "Cuenta" WHERE codigo = '5'), NULL, CURRENT_DATE, CURRENT_DATE),
('52', 'GASTOS NO OPERACIONALES', 'Otros gastos', TRUE, 5, 2, (SELECT id FROM "Cuenta" WHERE codigo = '5'), NULL, CURRENT_DATE, CURRENT_DATE);

-- Nivel 3 - Subgrupos más detallados
INSERT INTO "Cuenta"(codigo, nombre, descripcion, esta_activa, tipo_cuenta_id, nivel_cuenta_id, cuenta_padre_id, objeto_gasto_id, "createdAt", "updatedAt")
VALUES 
('1101', 'CAJA Y BANCOS', 'Efectivo y equivalentes', TRUE, 1, 3, (SELECT id FROM "Cuenta" WHERE codigo = '11'), NULL, CURRENT_DATE, CURRENT_DATE),
('1102', 'CUENTAS POR COBRAR', 'Deudores comerciales', TRUE, 1, 3, (SELECT id FROM "Cuenta" WHERE codigo = '11'), NULL, CURRENT_DATE, CURRENT_DATE),
('1103', 'INVENTARIOS', 'Mercancías y materiales', TRUE, 1, 3, (SELECT id FROM "Cuenta" WHERE codigo = '11'), NULL, CURRENT_DATE, CURRENT_DATE),
('1201', 'PROPIEDADES PLANTA Y EQUIPO', 'Activos fijos tangibles', TRUE, 1, 3, (SELECT id FROM "Cuenta" WHERE codigo = '12'), NULL, CURRENT_DATE, CURRENT_DATE),
('2101', 'CUENTAS POR PAGAR', 'Proveedores y acreedores', TRUE, 2, 3, (SELECT id FROM "Cuenta" WHERE codigo = '21'), NULL, CURRENT_DATE, CURRENT_DATE),
('2102', 'OBLIGACIONES LABORALES', 'Nómina y prestaciones', TRUE, 2, 3, (SELECT id FROM "Cuenta" WHERE codigo = '21'), 1, CURRENT_DATE, CURRENT_DATE),
('5101', 'GASTOS DE PERSONAL', 'Sueldos y prestaciones', TRUE, 5, 3, (SELECT id FROM "Cuenta" WHERE codigo = '51'), 1, CURRENT_DATE, CURRENT_DATE),
('5102', 'GASTOS GENERALES', 'Gastos administrativos', TRUE, 5, 3, (SELECT id FROM "Cuenta" WHERE codigo = '51'), NULL, CURRENT_DATE, CURRENT_DATE);

-- Nivel 4 - Cuentas mayores
INSERT INTO "Cuenta"(codigo, nombre, descripcion, esta_activa, tipo_cuenta_id, nivel_cuenta_id, cuenta_padre_id, objeto_gasto_id, "createdAt", "updatedAt")
VALUES 
('110101', 'CAJA GENERAL', 'Efectivo en caja', TRUE, 1, 4, (SELECT id FROM "Cuenta" WHERE codigo = '1101'), NULL, CURRENT_DATE, CURRENT_DATE),
('110102', 'BANCOS NACIONALES', 'Cuentas corrientes y ahorros', TRUE, 1, 4, (SELECT id FROM "Cuenta" WHERE codigo = '1101'), NULL, CURRENT_DATE, CURRENT_DATE),
('510101', 'SUELDOS PERSONAL ADMINISTRATIVO', 'Salarios administración', TRUE, 5, 4, (SELECT id FROM "Cuenta" WHERE codigo = '5101'), 1, CURRENT_DATE, CURRENT_DATE),
('510102', 'PRESTACIONES SOCIALES', 'Cesantías, primas, vacaciones', TRUE, 5, 4, (SELECT id FROM "Cuenta" WHERE codigo = '5101'), 1, CURRENT_DATE, CURRENT_DATE),
('510201', 'SERVICIOS PÚBLICOS', 'Agua, luz, teléfono', TRUE, 5, 4, (SELECT id FROM "Cuenta" WHERE codigo = '5102'), 2, CURRENT_DATE, CURRENT_DATE),
('510202', 'MATERIALES Y SUMINISTROS', 'Papelería y materiales', TRUE, 5, 4, (SELECT id FROM "Cuenta" WHERE codigo = '5102'), 3, CURRENT_DATE, CURRENT_DATE),
('510203', 'MANTENIMIENTO Y REPARACIONES', 'Mantenimiento general', TRUE, 5, 4, (SELECT id FROM "Cuenta" WHERE codigo = '5102'), 4, CURRENT_DATE, CURRENT_DATE);

-- Insertar PeriodoFiscals
INSERT INTO "PeriodoFiscals"(nombre, fecha_inicio, fecha_fin, esta_cerrado, fecha_cierre, cerrado_por_id, "createdAt", "updatedAt")
VALUES 
('2024', '2024-01-01', '2024-12-31', TRUE, '2025-01-15 09:00:00', 1, CURRENT_DATE, CURRENT_DATE),
('2025', '2025-01-01', '2025-12-31', FALSE, NULL, NULL, CURRENT_DATE, CURRENT_DATE),
('2026', '2026-01-01', '2026-12-31', FALSE, NULL, NULL, CURRENT_DATE, CURRENT_DATE);

-- Insertar Presupuestos para 2025
INSERT INTO "Presupuestos"(monto_inicial, monto_modificado, fecha_modificacion, periodo_fiscal_id, centro_costo_id, objeto_gasto_id, modificado_por_id, fecha_creacion, fecha_actualizacion, cuenta_id)
VALUES 
(50000000.00, NULL, NULL, 2, 1, 1, NULL, CURRENT_DATE, CURRENT_DATE, (SELECT id FROM "Cuenta" WHERE codigo = '510101')),
(15000000.00, NULL, NULL, 2, 1, 2, NULL, CURRENT_DATE, CURRENT_DATE, (SELECT id FROM "Cuenta" WHERE codigo = '510201')),
(8000000.00, NULL, NULL, 2, 1, 3, NULL, CURRENT_DATE, CURRENT_DATE, (SELECT id FROM "Cuenta" WHERE codigo = '510202')),
(12000000.00, NULL, NULL, 2, 1, 4, NULL, CURRENT_DATE, CURRENT_DATE, (SELECT id FROM "Cuenta" WHERE codigo = '510203')),
(25000000.00, NULL, NULL, 2, 2, 1, NULL, CURRENT_DATE, CURRENT_DATE, (SELECT id FROM "Cuenta" WHERE codigo = '510101')),
(10000000.00, NULL, NULL, 2, 2, 5, NULL, CURRENT_DATE, CURRENT_DATE, NULL),
(20000000.00, NULL, NULL, 2, 3, 1, NULL, CURRENT_DATE, CURRENT_DATE, (SELECT id FROM "Cuenta" WHERE codigo = '510101')),
(5000000.00, NULL, NULL, 2, 4, 6, NULL, CURRENT_DATE, CURRENT_DATE, NULL),
(18000000.00, NULL, NULL, 2, 5, 8, NULL, CURRENT_DATE, CURRENT_DATE, NULL);

-- Insertar algunas Transacciones de ejemplo
INSERT INTO "Transaccions"(referencia, descripcion, fecha, tipo_transaccion, es_generado_sistema, periodo_fiscal_id, usuario_id, fecha_creacion, fecha_actualizacion)
VALUES 
('TXN-2025-001', 'Apertura de periodo fiscal 2025', '2025-01-01', 'apertura', TRUE, 2, 1, CURRENT_DATE, CURRENT_DATE),
('TXN-2025-002', 'Pago nómina enero 2025', '2025-01-31', 'egreso', FALSE, 2, 2, CURRENT_DATE, CURRENT_DATE),
('TXN-2025-003', 'Ingreso por ventas enero', '2025-01-15', 'ingreso', FALSE, 2, 2, CURRENT_DATE, CURRENT_DATE),
('TXN-2025-004', 'Pago servicios públicos enero', '2025-01-20', 'egreso', FALSE, 2, 3, CURRENT_DATE, CURRENT_DATE),
('TXN-2025-005', 'Compra materiales de oficina', '2025-01-25', 'egreso', FALSE, 2, 3, CURRENT_DATE, CURRENT_DATE);

-- Insertar DetalleTransaccions
-- Detalles para TXN-2025-002 (Pago nómina)
INSERT INTO "DetalleTransaccions"(debito, credito, descripcion, transaccion_id, cuenta_id, "createdAt", "updatedAt")
VALUES 
(25000000.00, 0.00, 'Gasto por sueldos enero', 2, (SELECT id FROM "Cuenta" WHERE codigo = '510101'), CURRENT_DATE, CURRENT_DATE),
(0.00, 25000000.00, 'Salida de efectivo por nómina', 2, (SELECT id FROM "Cuenta" WHERE codigo = '110102'), CURRENT_DATE, CURRENT_DATE);

-- Detalles para TXN-2025-003 (Ingreso por ventas)
INSERT INTO "DetalleTransaccions"(debito, credito, descripcion, transaccion_id, cuenta_id, "createdAt", "updatedAt")
VALUES 
(35000000.00, 0.00, 'Ingreso en efectivo por ventas', 3, (SELECT id FROM "Cuenta" WHERE codigo = '110102'), CURRENT_DATE, CURRENT_DATE),
(0.00, 35000000.00, 'Ingresos por ventas enero', 3, (SELECT id FROM "Cuenta" WHERE codigo = '41'), CURRENT_DATE, CURRENT_DATE);

-- Detalles para TXN-2025-004 (Servicios públicos)
INSERT INTO "DetalleTransaccions"(debito, credito, descripcion, transaccion_id, cuenta_id, "createdAt", "updatedAt")
VALUES 
(2500000.00, 0.00, 'Gasto servicios públicos enero', 4, (SELECT id FROM "Cuenta" WHERE codigo = '510201'), CURRENT_DATE, CURRENT_DATE),
(0.00, 2500000.00, 'Pago servicios públicos', 4, (SELECT id FROM "Cuenta" WHERE codigo = '110102'), CURRENT_DATE, CURRENT_DATE);

-- Detalles para TXN-2025-005 (Materiales de oficina)
INSERT INTO "DetalleTransaccions"(debito, credito, descripcion, transaccion_id, cuenta_id, "createdAt", "updatedAt")
VALUES 
(1200000.00, 0.00, 'Compra materiales oficina', 5, (SELECT id FROM "Cuenta" WHERE codigo = '510202'), CURRENT_DATE, CURRENT_DATE),
(0.00, 1200000.00, 'Pago materiales oficina', 5, (SELECT id FROM "Cuenta" WHERE codigo = '110102'), CURRENT_DATE, CURRENT_DATE);

-- Insertar EjecucionPresupuestos
INSERT INTO "EjecucionPresupuestos"(monto, fecha_ejecucion, presupuesto_id, detalle_transaccion_id, fecha_creacion, "updatedAt")
VALUES 
(25000000.00, '2025-01-31', 1, 1, CURRENT_DATE, CURRENT_DATE),
(2500000.00, '2025-01-20', 2, 3, CURRENT_DATE, CURRENT_DATE),
(1200000.00, '2025-01-25', 3, 5, CURRENT_DATE, CURRENT_DATE);

-- Insertar Parámetros del sistema
INSERT INTO "Parametros"(clave, valor, descripcion, "createdAt", "updatedAt")
VALUES 
('empresa_nombre', 'Mi Empresa S.A.S', 'Nombre de la empresa', CURRENT_DATE, CURRENT_DATE),
('empresa_nit', '900123456-1', 'NIT de la empresa', CURRENT_DATE, CURRENT_DATE),
('empresa_direccion', 'Calle 123 #45-67', 'Dirección de la empresa', CURRENT_DATE, CURRENT_DATE),
('empresa_telefono', '+57 1 234 5678', 'Teléfono de la empresa', CURRENT_DATE, CURRENT_DATE),
('empresa_email', 'contabilidad@miempresa.com', 'Email de contacto', CURRENT_DATE, CURRENT_DATE),
('moneda_simbolo', 'COP', 'Símbolo de la moneda', CURRENT_DATE, CURRENT_DATE),
('moneda_nombre', 'Peso Colombiano', 'Nombre de la moneda', CURRENT_DATE, CURRENT_DATE),
('periodo_actual', '2025', 'Periodo fiscal activo', CURRENT_DATE, CURRENT_DATE),
('backup_frecuencia', 'diario', 'Frecuencia de respaldos', CURRENT_DATE, CURRENT_DATE),
('max_usuarios', '50', 'Máximo número de usuarios', CURRENT_DATE, CURRENT_DATE);

-- Insertar plantillas de Reportes
INSERT INTO "Reportes"(nombre, descripcion, ruta_plantilla, fecha_creacion, "updatedAt")
VALUES 
('Balance General', 'Reporte de balance general', '/templates/balance_general.ejs', CURRENT_DATE, CURRENT_DATE),
('Estado de Resultados', 'Reporte de pérdidas y ganancias', '/templates/estado_resultados.ejs', CURRENT_DATE, CURRENT_DATE),
('Flujo de Efectivo', 'Reporte de flujo de caja', '/templates/flujo_efectivo.ejs', CURRENT_DATE, CURRENT_DATE),
('Ejecución Presupuestal', 'Reporte de ejecución del presupuesto', '/templates/ejecucion_presupuesto.ejs', CURRENT_DATE, CURRENT_DATE),
('Libro Diario', 'Reporte del libro diario', '/templates/libro_diario.ejs', CURRENT_DATE, CURRENT_DATE),
('Mayor General', 'Reporte del mayor general', '/templates/mayor_general.ejs', CURRENT_DATE, CURRENT_DATE);

-- Insertar registros de auditoría de ejemplo
INSERT INTO "AuditLogs"("action", "userId", "tableName", "recordId", "timestamp", "createdAt", "updatedAt")
VALUES 
('CREATE', 1, 'Users', 2, '2025-01-01 08:00:00', CURRENT_DATE, CURRENT_DATE),
('CREATE', 1, 'Users', 3, '2025-01-01 08:15:00', CURRENT_DATE, CURRENT_DATE),
('CREATE', 1, 'Users', 4, '2025-01-01 08:30:00', CURRENT_DATE, CURRENT_DATE),
('CREATE', 2, 'Transaccions', 2, '2025-01-31 14:30:00', CURRENT_DATE, CURRENT_DATE),
('CREATE', 2, 'Transaccions', 3, '2025-01-15 10:45:00', CURRENT_DATE, CURRENT_DATE),
('UPDATE', 1, 'Presupuestos', 1, '2025-02-01 09:00:00', CURRENT_DATE, CURRENT_DATE),
('CREATE', 3, 'Transaccions', 4, '2025-01-20 16:20:00', CURRENT_DATE, CURRENT_DATE),
('CREATE', 3, 'Transaccions', 5, '2025-01-25 11:15:00', CURRENT_DATE, CURRENT_DATE);
