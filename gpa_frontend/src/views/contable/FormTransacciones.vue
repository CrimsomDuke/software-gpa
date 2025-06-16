<script setup>
import NavBar from '../components/NavBar.vue';
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';


const route = useRoute();
const router = useRouter();

const id = route.params.id;
const user_id = sessionStorage.getItem('user_id');

const errorMessage = ref('');
const successMessage = ref('');

const form = ref({
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
    tipo_transaccion: '',
    periodo_fiscal_id: '',
    usuario_id: user_id,
    transaccion_detalles: []
});

const detalle = ref({
    cuenta_id: '',
    debito: 0,
    credito: 0,
    descripcion: ''
});

const tiposTransaccion = ['ingreso', 'egreso', 'traspaso', 'apertura', 'cierre'];
const cuentas = ref([]);
const periodosFiscales = ref([]);

const fetchCuentas = async () => {
    try {
        const response = await fetch(`http://localhost:3000/cuenta`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            cuentas.value = data.success ? data.data : data;
        }
    } catch (error) {
        console.error('Error al obtener cuentas:', error);
    }
};

const fetchPeriodosFiscales = async () => {
    try {
        const response = await fetch(`http://localhost:3000/periodo_fiscal`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            periodosFiscales.value = data.success ? data.data : data;
        }
    } catch (error) {
        console.error('Error al obtener períodos fiscales:', error);
    }
};

const fetchTransaccionData = async () => {
    if (!id) return;

    try {
        const response = await fetch(`http://localhost:3000/transaccion/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            const transaccionData = data.success ? data.data : data;

            form.value.descripcion = transaccionData.descripcion;
            form.value.fecha = transaccionData.fecha.split('T')[0];
            form.value.tipo_transaccion = transaccionData.tipo_transaccion;
            form.value.periodo_fiscal_id = transaccionData.periodo_fiscal_id;
            form.value.transaccion_detalles = transaccionData.DetalleTransaccions || transaccionData.transaccion_detalles || [];
        } else {
            errorMessage.value = 'Error al obtener los datos de la transacción.';
        }
    } catch (error) {
        console.error('Error al obtener transacción:', error);
        errorMessage.value = 'Error al obtener los datos de la transacción.';
    }
};

const getCuentaNombre = (cuentaId) => {
    const cuenta = cuentas.value.find(c => c.id == cuentaId);
    return cuenta ? `${cuenta.codigo} - ${cuenta.nombre}` : cuentaId;
};

const agregarDetalle = () => {
    if (!detalle.value.cuenta_id) {
        errorMessage.value = 'Debe seleccionar una cuenta.';
        return;
    }

    if (detalle.value.debito > 0 && detalle.value.credito > 0) {
        errorMessage.value = 'Un detalle no puede tener tanto débito como crédito.';
        return;
    }

    if (detalle.value.debito === 0 && detalle.value.credito === 0) {
        errorMessage.value = 'Debe ingresar un valor en débito o crédito.';
        return;
    }

    form.value.transaccion_detalles.push({ ...detalle.value });

    // Limpiar formulario de detalle
    detalle.value = {
        cuenta_id: '',
        debito: 0,
        credito: 0,
        descripcion: ''
    };

    errorMessage.value = '';
};

const eliminarDetalle = (index) => {
    form.value.transaccion_detalles.splice(index, 1);
};

const calcularTotales = () => {
    const totalDebito = form.value.transaccion_detalles.reduce((sum, det) => sum + parseFloat(det.debito || 0), 0);
    const totalCredito = form.value.transaccion_detalles.reduce((sum, det) => sum + parseFloat(det.credito || 0), 0);
    return { totalDebito, totalCredito };
};

const validateForm = () => {
    if (!form.value.descripcion || !form.value.fecha || !form.value.tipo_transaccion || !form.value.periodo_fiscal_id) {
        errorMessage.value = 'Por favor complete todos los campos obligatorios.';
        return false;
    }

    if (form.value.transaccion_detalles.length < 2) {
        errorMessage.value = 'Debe agregar al menos 2 detalles (partida doble).';
        return false;
    }

    const { totalDebito, totalCredito } = calcularTotales();
    if (Math.abs(totalDebito - totalCredito) > 0.01) {
        errorMessage.value = 'Los totales de débito y crédito deben ser iguales.';
        return false;
    }

    return true;
};

const handleSubmit = async () => {
    errorMessage.value = '';

    if (!validateForm()) {
        return;
    }

    if (id) {
        await handleUpdate();
    } else {
        await handleCreate();
    }
};

const handleCreate = async () => {
    try {
        const response = await fetch(`http://localhost:3000/transaccion/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(form.value)
        });

        const data = await response.json();
        if (!response.ok) {
            errorMessage.value = data.message || 'Error al crear la transacción.';
            return;
        }

        successMessage.value = 'Transacción creada exitosamente.';
        setTimeout(() => {
            router.push('/contable/transacciones');
        }, 2000);
    } catch (error) {
        console.error('Error al crear transacción:', error);
        errorMessage.value = 'Error al crear la transacción.';
    }
};

const handleUpdate = async () => {
    try {
        const updateData = {
            descripcion: form.value.descripcion,
            fecha: form.value.fecha,
            tipo_transaccion: form.value.tipo_transaccion,
            periodo_fiscal_id: form.value.periodo_fiscal_id,
            usuario_id: form.value.usuario_id
        };

        const response = await fetch(`http://localhost:3000/transaccion/update/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        const data = await response.json();
        if (!response.ok) {
            errorMessage.value = data.message || 'Error al actualizar la transacción.';
            return;
        }

        successMessage.value = 'Transacción actualizada exitosamente.';
        setTimeout(() => {
            router.push('/contable/transacciones');
        }, 2000);
    } catch (error) {
        console.error('Error al actualizar transacción:', error);
        errorMessage.value = 'Error al actualizar la transacción.';
    }
};

onMounted(() => {
    fetchCuentas();
    fetchPeriodosFiscales();
    if (id) {
        fetchTransaccionData();
    }
});
</script>

<template>
    <main class="d-flex">
        <NavBar />
        <div class="container p-3 m-3">
            <div class="card p-3">
                <div class="mb-3">
                    <router-link to="/contable/transacciones" class="btn btn-secondary">Volver atrás</router-link>
                </div>

                <h2>{{ id ? 'Editar' : 'Nueva' }} Transacción</h2>

                <form @submit.prevent="handleSubmit">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group mb-3">
                                <label for="descripcion" class="form-label">Descripción *</label>
                                <input type="text" class="form-control" id="descripcion"
                                       v-model="form.descripcion" required>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="form-group mb-3">
                                <label for="fecha" class="form-label">Fecha *</label>
                                <input type="date" class="form-control" id="fecha"
                                       v-model="form.fecha" required>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group mb-3">
                                <label for="tipo_transaccion" class="form-label">Tipo de Transacción *</label>
                                <select class="form-control" id="tipo_transaccion"
                                        v-model="form.tipo_transaccion" required>
                                    <option value="">Seleccione un tipo</option>
                                    <option v-for="tipo in tiposTransaccion" :key="tipo" :value="tipo">
                                        {{ tipo.charAt(0).toUpperCase() + tipo.slice(1) }}
                                    </option>
                                </select>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="form-group mb-3">
                                <label for="periodo_fiscal" class="form-label">Período Fiscal *</label>
                                <select class="form-control" id="periodo_fiscal"
                                        v-model="form.periodo_fiscal_id" required>
                                    <option value="">Seleccione un período</option>
                                    <option v-for="periodo in periodosFiscales" :key="periodo.id" :value="periodo.id">
                                        {{ periodo.nombre }} ({{ periodo.fecha_inicio }} - {{ periodo.fecha_fin }})
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Sección de Detalles -->
                    <div class="mt-4">
                        <h4>Detalles de Transacción</h4>

                        <!-- Formulario para agregar detalles -->
                        <div class="card p-3 mb-3" v-if="!id">
                            <h5>Agregar Detalle</h5>
                            <div class="row">
                                <div class="col-md-3">
                                    <label class="form-label">Cuenta *</label>
                                    <select class="form-control" v-model="detalle.cuenta_id">
                                        <option value="">Seleccione cuenta</option>
                                        <option v-for="cuenta in cuentas" :key="cuenta.id" :value="cuenta.id">
                                            {{ cuenta.codigo }} - {{ cuenta.nombre }}
                                        </option>
                                    </select>
                                </div>

                                <div class="col-md-2">
                                    <label class="form-label">Débito</label>
                                    <input type="number" step="0.01" class="form-control"
                                           v-model="detalle.debito" min="0">
                                </div>

                                <div class="col-md-2">
                                    <label class="form-label">Crédito</label>
                                    <input type="number" step="0.01" class="form-control"
                                           v-model="detalle.credito" min="0">
                                </div>

                                <div class="col-md-3">
                                    <label class="form-label">Descripción</label>
                                    <input type="text" class="form-control" v-model="detalle.descripcion">
                                </div>

                                <div class="col-md-2">
                                    <label class="form-label">&nbsp;</label>
                                    <button type="button" class="btn btn-primary d-block" @click="agregarDetalle">
                                        Agregar
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Lista de detalles -->
                        <div class="table-responsive">
                            <table class="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>Cuenta</th>
                                        <th>Descripción</th>
                                        <th>Débito</th>
                                        <th>Crédito</th>
                                        <th v-if="!id">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(det, index) in form.transaccion_detalles" :key="index">
                                        <td>{{ getCuentaNombre(det.cuenta_id) }}</td>
                                        <td>{{ det.descripcion }}</td>
                                        <td class="text-end">${{ parseFloat(det.debito || 0).toFixed(2) }}</td>
                                        <td class="text-end">${{ parseFloat(det.credito || 0).toFixed(2) }}</td>
                                        <td v-if="!id">
                                            <button type="button" class="btn btn-sm btn-danger"
                                                    @click="eliminarDetalle(index)">
                                                Eliminar
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot>
                                    <tr class="fw-bold">
                                        <td colspan="2">TOTALES:</td>
                                        <td class="text-end">${{ calcularTotales().totalDebito.toFixed(2) }}</td>
                                        <td class="text-end">${{ calcularTotales().totalCredito.toFixed(2) }}</td>
                                        <td v-if="!id"></td>
                                    </tr>
                                    <tr v-if="Math.abs(calcularTotales().totalDebito - calcularTotales().totalCredito) > 0.01" class="table-warning">
                                        <td colspan="2"><strong>DIFERENCIA:</strong></td>
                                        <td colspan="2" class="text-center">
                                            <strong class="text-danger">
                                                ${{ Math.abs(calcularTotales().totalDebito - calcularTotales().totalCredito).toFixed(2) }}
                                            </strong>
                                        </td>
                                        <td v-if="!id"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    <div class="mt-4">
                        <button type="submit" class="btn btn-success me-2"
                                :disabled="Math.abs(calcularTotales().totalDebito - calcularTotales().totalCredito) > 0.01">
                            {{ id ? 'Actualizar' : 'Crear' }} Transacción
                        </button>
                        <router-link to="/contable/transacciones" class="btn btn-secondary">
                            Cancelar
                        </router-link>
                    </div>
                </form>

                <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>
                <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>
            </div>
        </div>
    </main>
</template>

<style scoped>
.table th, .table td {
    vertical-align: middle;
}

.text-end {
    text-align: right;
}

.table-warning {
    --bs-table-bg: #fff3cd;
}
</style>
