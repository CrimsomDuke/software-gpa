

SELECT * FROM "Users" u;
SELECT * FROM "AuditLogs" al;
SELECT * FROM "PeriodoFiscals" pf; 

SELECT * FROM "NivelCuenta" nc; 
SELECT * FROM "TipoCuenta" tc;

SELECT * FROM "CentroCostos"

SELECT * FROM "Presupuestos";
SELECT * FROM "Cuenta" c;
SELECT * FROM "Transaccions" t;
SELECT * FROM "DetalleTransaccions" dt;

SELECT transaccion_id, sum(debito), sum(credito) FROM "DetalleTransaccions" dt 

SELECT * FROM "Roles"