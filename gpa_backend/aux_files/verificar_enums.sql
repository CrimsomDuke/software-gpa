-- Script para verificar los valores ENUM disponibles en la base de datos
-- Ejecuta estas consultas para conocer los valores exactos que debes usar

-- Consultar valores del enum TipoCuenta
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'enum_TipoCuenta_nombre'
ORDER BY e.enumsortorder;

-- Consultar valores del enum NivelCuenta
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'enum_NivelCuenta_nombre'
ORDER BY e.enumsortorder;

-- Consultar valores del enum tipo_transaccion
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname = 'enum_Transaccions_tipo_transaccion'
ORDER BY e.enumsortorder;

-- Consultar todos los tipos ENUM en la base de datos
SELECT 
    t.typname as enum_name,
    array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
GROUP BY t.typname
ORDER BY t.typname;
