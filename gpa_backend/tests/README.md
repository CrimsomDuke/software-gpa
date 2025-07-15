# 🧪 UNIT TESTING - GPA Backend

## 📋 Tests Implementados

### **1. User Controller Tests** (`user.controller.test.js`)
- ✅ **GET /users** - Obtener todos los usuarios
- ✅ **GET /users/:id** - Obtener usuario por ID  
- ✅ **POST /users** - Registrar nuevo usuario
- ✅ **Validaciones**: Email, contraseña, datos requeridos

### **2. Presupuesto Controller Tests** (`presupuesto.controller.test.js`)
- ✅ **GET /presupuestos** - Obtener todos los presupuestos
- ✅ **GET /presupuestos/:id** - Obtener presupuesto por ID
- ✅ **POST /presupuestos** - Crear nuevo presupuesto  
- ✅ **Validaciones**: Montos positivos, relaciones FK, períodos válidos

### **3. Transacción Controller Tests** (`transaccion.controller.test.js`)
- ✅ **GET /transacciones** - Obtener todas las transacciones
- ✅ **GET /transacciones/:id** - Obtener transacción con detalles
- ✅ **POST /transacciones** - Crear transacción contable
- ✅ **Validaciones**: Balance contable (débitos = créditos), tipos de transacción

## 🚀 Cómo Ejecutar los Tests

### **Instalar Dependencias**
```bash
npm install
```

### **Ejecutar Tests**
```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch (para desarrollo)
npm run test:watch

# Ejecutar tests con reporte de cobertura
npm run test:coverage

# Ejecutar un test específico
npm test user.controller.test.js
```

## 📊 Cobertura de Tests

Los tests cubren:
- 🎯 **Casos exitosos** (Happy Path)
- ❌ **Casos de error** (Error Handling)
- 🔍 **Validaciones de negocio** (Business Logic)
- 🛡️ **Casos edge** (Edge Cases)
- 📋 **Principios contables** (Accounting Rules)

## 🏗️ Estructura de Tests

```
tests/
├── setup.js                      # Configuración global
├── user.controller.test.js        # Tests de usuarios
├── presupuesto.controller.test.js # Tests de presupuestos
└── transaccion.controller.test.js # Tests de transacciones
```

## 🔧 Configuración

### **Jest Config** (`jest.config.js`)
- Entorno Node.js
- Cobertura automática
- Setup global para tests
- Mocking de base de datos

### **Test Database**
- SQLite en memoria para tests
- No afecta la base de datos real
- Mocks de Sequelize models

## 📝 Patrones de Testing

### **Arrange-Act-Assert (AAA)**
```javascript
test('Debería crear usuario exitosamente', async () => {
  // Arrange
  const userData = testHelpers.createTestUser();
  db.User.create.mockResolvedValue(mockUser);

  // Act  
  const response = await request(app).post('/users').send(userData);

  // Assert
  expect(response.status).toBe(201);
  expect(response.body.message).toBe('User registered successfully');
});
```

### **Mocking Strategy**
- 🗄️ **Database mocking** con Jest
- 🔧 **Service mocking** para audit logs
- 📊 **Response mocking** para casos específicos

## 🎯 Escenarios Testados

### **Casos de Éxito (✅)**
- Creación de registros válidos
- Consultas exitosas
- Relaciones correctas entre entidades

### **Casos de Error (❌)**  
- Datos inválidos o faltantes
- Entidades no encontradas
- Errores de base de datos

### **Validaciones de Negocio (🔍)**
- Balance contable (débitos = créditos)
- Montos positivos en presupuestos
- Formatos de email y referencias
- Existencia de relaciones FK

## 📈 Métricas Objetivo

- ✅ **Cobertura de líneas**: >80%
- ✅ **Cobertura de funciones**: >90%
- ✅ **Cobertura de branches**: >75%
- ✅ **Tiempo de ejecución**: <30 segundos

## 🚨 Comandos Útiles

```bash
# Ver resultados detallados
npm test -- --verbose

# Ejecutar tests en un archivo específico
npm test -- presupuesto.controller.test.js

# Ejecutar tests con patrón
npm test -- --testNamePattern="POST"

# Debug de tests
npm test -- --detectOpenHandles
```

## 🛠️ Troubleshooting

### **Error: Cannot find module**
```bash
npm install jest supertest sqlite3
```

### **Tests muy lentos**
- Verificar que uses SQLite en memoria
- Revisar mocks de base de datos
- Usar `--detectOpenHandles` para encontrar conexiones abiertas

### **Errores de timeout**
- Aumentar timeout en `jest.config.js`
- Verificar que los mocks estén correctamente configurados

## 📚 Próximos Pasos

1. **Agregar más tests** para otros controladores
2. **Integration tests** para flujos completos
3. **Performance tests** para endpoints críticos
4. **End-to-end tests** con base de datos real

---

**¡Los tests están listos! 🎉** 

Ejecuta `npm test` para verificar que todo funcione correctamente.
