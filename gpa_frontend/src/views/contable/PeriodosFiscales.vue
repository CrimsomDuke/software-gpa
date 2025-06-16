<script setup>
import { ref, onMounted } from 'vue'
import NavBar from '../components/NavBar.vue'

const periodos = ref([])
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const errorMessage = ref('')
const successMessage = ref('')

// Formulario para nuevo período
const form = ref({
  nombre: '',
  fecha_inicio: '',
  fecha_fin: '',
  user_id: sessionStorage.getItem('user_id')
})

// Verificar si un período tiene asientos generados
const verificarAsientosGenerados = async (periodoId) => {
  try {
    const response = await fetch(`http://localhost:3000/periodo_fiscal/${periodoId}/asientos-status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      return data.success ? data.data : { apertura: false, cierre: false }
    }
  } catch (error) {
    console.error('Error al verificar asientos:', error)
  }
  return { apertura: false, cierre: false }
}

// Obtener períodos fiscales
const fetchPeriodos = async () => {
  try {
    const response = await fetch('http://localhost:3000/periodo_fiscal', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      const periodosData = data.success ? data.data : data

      // Verificar asientos para cada período
      for (let periodo of periodosData) {
        const asientosStatus = await verificarAsientosGenerados(periodo.id)
        periodo.asientos_apertura = asientosStatus.apertura || false
        periodo.asientos_cierre = asientosStatus.cierre || false
      }

      periodos.value = periodosData
    }
  } catch (error) {
    console.error('Error al obtener períodos:', error)
  }
}

// Función helper para mostrar estado de asientos
const getEstadoAsientos = (periodo) => {
  if (periodo.asientos_apertura && periodo.asientos_cierre) {
    return { texto: 'Completos', clase: 'bg-success' }
  } else if (periodo.asientos_apertura || periodo.asientos_cierre) {
    return { texto: 'Parciales', clase: 'bg-warning' }
  } else {
    return { texto: 'Sin generar', clase: 'bg-secondary' }
  }
}

// Abrir modal para nuevo período
const abrirModalNuevo = () => {
  form.value = {
    nombre: '',
    fecha_inicio: '',
    fecha_fin: '',
    user_id: sessionStorage.getItem('user_id')
  }
  isEditing.value = false
  editingId.value = null
  errorMessage.value = ''
  successMessage.value = ''
  showModal.value = true
}

// Abrir modal para editar
const abrirModalEditar = (periodo) => {
  form.value = {
    nombre: periodo.nombre,
    fecha_inicio: periodo.fecha_inicio,
    fecha_fin: periodo.fecha_fin,
    user_id: sessionStorage.getItem('user_id')
  }
  isEditing.value = true
  editingId.value = periodo.id
  errorMessage.value = ''
  successMessage.value = ''
  showModal.value = true
}

// Cerrar modal
const cerrarModal = () => {
  showModal.value = false
  form.value = {
    nombre: '',
    fecha_inicio: '',
    fecha_fin: '',
    user_id: sessionStorage.getItem('user_id')
  }
}

// Validar formulario
const validarFormulario = () => {
  if (!form.value.nombre || !form.value.fecha_inicio || !form.value.fecha_fin) {
    errorMessage.value = 'Todos los campos son obligatorios'
    return false
  }

  if (form.value.fecha_inicio >= form.value.fecha_fin) {
    errorMessage.value = 'La fecha de inicio debe ser anterior a la fecha de fin'
    return false
  }

  return true
}

// Crear período fiscal
const crearPeriodo = async () => {
  if (!validarFormulario()) return

  try {
    const response = await fetch('http://localhost:3000/periodo_fiscal/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre: form.value.nombre,
        fecha_inicio: form.value.fecha_inicio,
        fecha_fin: form.value.fecha_fin,
        user_id: parseInt(form.value.user_id)
      })
    })

    const data = await response.json()

    if (response.ok) {
      successMessage.value = 'Período fiscal creado exitosamente'
      setTimeout(() => {
        cerrarModal()
        fetchPeriodos() // Recargar la lista
      }, 1500)
    } else {
      errorMessage.value = data.message || 'Error al crear el período fiscal'
    }
  } catch (error) {
    console.error('Error al crear período:', error)
    errorMessage.value = 'Error al crear el período fiscal'
  }
}

// Actualizar período fiscal
const actualizarPeriodo = async () => {
  if (!validarFormulario()) return

  try {
    const response = await fetch(`http://localhost:3000/periodo_fiscal/update/${editingId.value}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre: form.value.nombre,
        fecha_inicio: form.value.fecha_inicio,
        fecha_fin: form.value.fecha_fin,
        user_id: parseInt(form.value.user_id)
      })
    })

    const data = await response.json()

    if (response.ok) {
      successMessage.value = 'Período fiscal actualizado exitosamente'
      setTimeout(() => {
        cerrarModal()
        fetchPeriodos() // Recargar la lista
      }, 1500)
    } else {
      errorMessage.value = data.message || 'Error al actualizar el período fiscal'
    }
  } catch (error) {
    console.error('Error al actualizar período:', error)
    errorMessage.value = 'Error al actualizar el período fiscal'
  }
}

// Enviar formulario
const enviarFormulario = () => {
  if (isEditing.value) {
    actualizarPeriodo()
  } else {
    crearPeriodo()
  }
}

// Cerrar período fiscal
const cerrarPeriodo = async (periodo) => {
  if (confirm(`¿Está seguro de cerrar el período fiscal "${periodo.nombre}"? Esta acción no se puede deshacer.`)) {
    try {
      const response = await fetch(`http://localhost:3000/periodo_fiscal/cerrar/${periodo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: parseInt(sessionStorage.getItem('user_id'))
        })
      })

      if (response.ok) {
        alert('Período fiscal cerrado exitosamente')
        fetchPeriodos()
      } else {
        const data = await response.json()
        alert(data.message || 'Error al cerrar el período fiscal')
      }
    } catch (error) {
      console.error('Error al cerrar período:', error)
      alert('Error al cerrar el período fiscal')
    }
  }
}

// Generar asientos de apertura
const generarAsientosApertura = async (periodo) => {
  if (confirm(`¿Generar asientos de apertura para "${periodo.nombre}"?`)) {
    try {
      const response = await fetch(`http://localhost:3000/periodo_fiscal/${periodo.id}/generar-asientos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: parseInt(sessionStorage.getItem('user_id')),
          tipo_asiento: "apertura"
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Asientos de apertura generados exitosamente')
        fetchPeriodos() // Recargar con estado actualizado
      } else {
        alert(data.message || 'Error al generar asientos de apertura')
      }
    } catch (error) {
      console.error('Error al generar asientos:', error)
      alert('Error al generar asientos de apertura')
    }
  }
}

// Generar asientos de cierre
const generarAsientosCierre = async (periodo) => {
  if (confirm(`¿Generar asientos de cierre para "${periodo.nombre}"?`)) {
    try {
      const response = await fetch(`http://localhost:3000/periodo_fiscal/${periodo.id}/generar-asientos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: parseInt(sessionStorage.getItem('user_id')),
          tipo_asiento: "cierre"
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('Asientos de cierre generados exitosamente')
        fetchPeriodos() // Recargar con estado actualizado
      } else {
        alert(data.message || 'Error al generar asientos de cierre')
      }
    } catch (error) {
      console.error('Error al generar asientos:', error)
      alert('Error al generar asientos de cierre')
    }
  }
}

onMounted(() => {
  fetchPeriodos()
})
</script>

<template>
  <div class="d-flex">
    <NavBar />
    <div class="container p-4 m-3">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2>Administración de Períodos Fiscales</h2>
        <button class="btn btn-primary btn-sm" @click="abrirModalNuevo">
          <i class="bi bi-plus-circle"></i> Nuevo Período
        </button>
      </div>

      <div class="card">
        <div class="card-header gradient-blue text-white">
          <h5 class="mb-0">Listado de Períodos Fiscales</h5>
        </div>
        <div class="card-body p-0">
          <table class="table table-striped table-bordered m-0">
            <thead class="gradient-blue text-white">
              <tr>
                <th>Nombre</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Estado</th>
                <th class="text-center">Asientos</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="periodo in periodos" :key="periodo.id">
                <td>{{ periodo.nombre }}</td>
                <td>{{ periodo.fecha_inicio }}</td>
                <td>{{ periodo.fecha_fin }}</td>
                <td>
                  <span :class="['badge', periodo.esta_cerrado ? 'bg-secondary' : 'bg-success']">
                    {{ periodo.esta_cerrado ? 'Cerrado' : 'Abierto' }}
                  </span>
                </td>
                <td class="text-center">
                  <div class="d-flex flex-column gap-1">
                    <!-- Estado general de asientos -->
                    <span :class="['badge', getEstadoAsientos(periodo).clase]">
                      {{ getEstadoAsientos(periodo).texto }}
                    </span>

                    <!-- Detalle específico -->
                    <div class="small">
                      <span :class="['badge', 'badge-sm', periodo.asientos_apertura ? 'bg-success' : 'bg-light text-dark']">
                        <i :class="['bi', periodo.asientos_apertura ? 'bi-check-circle' : 'bi-x-circle']"></i>
                        Apertura
                      </span>
                      <span :class="['badge', 'badge-sm', 'ms-1', periodo.asientos_cierre ? 'bg-success' : 'bg-light text-dark']">
                        <i :class="['bi', periodo.asientos_cierre ? 'bi-check-circle' : 'bi-x-circle']"></i>
                        Cierre
                      </span>
                    </div>
                  </div>
                </td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm">
                    <button
                      class="btn btn-outline-primary"
                      @click="abrirModalEditar(periodo)"
                      :disabled="periodo.esta_cerrado"
                      title="Editar"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>

                    <!-- Dropdown para asientos -->
                    <div class="dropdown">
                      <button
                        class="btn btn-outline-warning dropdown-toggle"
                        type="button"
                        :id="'dropdown-' + periodo.id"
                        data-bs-toggle="dropdown"
                        :disabled="periodo.esta_cerrado"
                        title="Generar Asientos"
                      >
                        <i class="bi bi-gear-fill"></i>
                      </button>
                      <ul class="dropdown-menu" :aria-labelledby="'dropdown-' + periodo.id">
                        <li>
                          <a
                            class="dropdown-item"
                            href="#"
                            @click.prevent="generarAsientosApertura(periodo)"
                            :class="{ 'text-success': periodo.asientos_apertura }"
                          >
                            <i :class="['bi', periodo.asientos_apertura ? 'bi-check-circle' : 'bi-play-circle']"></i>
                            {{ periodo.asientos_apertura ? 'Regenerar Apertura' : 'Asientos de Apertura' }}
                          </a>
                        </li>
                        <li>
                          <a
                            class="dropdown-item"
                            href="#"
                            @click.prevent="generarAsientosCierre(periodo)"
                            :class="{ 'text-success': periodo.asientos_cierre }"
                          >
                            <i :class="['bi', periodo.asientos_cierre ? 'bi-check-circle' : 'bi-stop-circle']"></i>
                            {{ periodo.asientos_cierre ? 'Regenerar Cierre' : 'Asientos de Cierre' }}
                          </a>
                        </li>
                      </ul>
                    </div>

                    <button
                      class="btn btn-outline-danger"
                      @click="cerrarPeriodo(periodo)"
                      :disabled="periodo.esta_cerrado"
                      title="Cerrar Período"
                    >
                      <i class="bi bi-lock"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal para crear/editar período fiscal -->
  <div class="modal fade" :class="{ show: showModal }" :style="{ display: showModal ? 'block' : 'none' }" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ isEditing ? 'Editar' : 'Nuevo' }} Período Fiscal
          </h5>
          <button type="button" class="btn-close" @click="cerrarModal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="enviarFormulario">
            <div class="mb-3">
              <label for="nombre" class="form-label">Nombre del Período *</label>
              <input
                type="text"
                class="form-control"
                id="nombre"
                v-model="form.nombre"
                placeholder="Ej: Ejercicio Fiscal 2025"
                required
              >
            </div>

            <div class="row">
              <div class="col-md-6">
                <div class="mb-3">
                  <label for="fecha_inicio" class="form-label">Fecha Inicio *</label>
                  <input
                    type="date"
                    class="form-control"
                    id="fecha_inicio"
                    v-model="form.fecha_inicio"
                    required
                  >
                </div>
              </div>

              <div class="col-md-6">
                <div class="mb-3">
                  <label for="fecha_fin" class="form-label">Fecha Fin *</label>
                  <input
                    type="date"
                    class="form-control"
                    id="fecha_fin"
                    v-model="form.fecha_fin"
                    required
                  >
                </div>
              </div>
            </div>

            <div v-if="errorMessage" class="alert alert-danger">
              {{ errorMessage }}
            </div>

            <div v-if="successMessage" class="alert alert-success">
              {{ successMessage }}
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="cerrarModal">
            Cancelar
          </button>
          <button type="button" class="btn btn-primary" @click="enviarFormulario">
            {{ isEditing ? 'Actualizar' : 'Crear' }} Período
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Backdrop del modal -->
  <div v-if="showModal" class="modal-backdrop fade show"></div>
</template>

<style scoped>
.gradient-blue {
  background: linear-gradient(180deg, #0f1355, #000000);
}

.modal.show {
  background-color: rgba(0, 0, 0, 0.5);
}

.btn-group-sm .btn {
  margin-right: 2px;
}

.badge-sm {
  font-size: 0.7em;
  padding: 0.2em 0.4em;
}

.small .badge {
  font-size: 0.65em;
}
</style>
