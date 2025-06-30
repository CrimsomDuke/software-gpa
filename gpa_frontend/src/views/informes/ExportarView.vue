<script setup>
import { ref, onMounted } from 'vue'
import NavBar from '../components/NavBar.vue'

const formatos = ['pdf', 'xlsx', 'html']
const exportando = ref(false)
const mensaje = ref(null)
const transacciones = ref([])
const transaccionSeleccionada = ref('')

// Obtener transacciones al montar el componente
onMounted(async () => {
  try {
    const response = await fetch('http://localhost:3000/transaccion') // Asegúrate de tener este endpoint
    if (!response.ok) throw new Error('Error al obtener transacciones')
    transacciones.value = await response.json()
  } catch (err) {
    console.error(err)
    mensaje.value = 'No se pudieron cargar las transacciones'
  }
})

const exportar = async (formato) => {
  if (!transaccionSeleccionada.value) {
    mensaje.value = 'Seleccione una transacción primero'
    return
  }

  exportando.value = true
  mensaje.value = null

  try {
    const response = await fetch(`http://localhost:3000/export/${formato}?transaccion_id=${transaccionSeleccionada.value}`)
    if (!response.ok) throw new Error('Error al exportar archivo')

    const contentDisposition = response.headers.get('Content-Disposition')
    const match = contentDisposition?.match(/filename="(.+)"/)
    const fileName = match?.[1] || `export.${formato}`

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    mensaje.value = `Exportación ${formato.toUpperCase()} completada`
  } catch (err) {
    console.error(err)
    mensaje.value = `Error: ${err.message}`
  } finally {
    exportando.value = false
  }
}
</script>

<template>
  <div class="d-flex">
    <NavBar />
    <div class="container p-3 m-3">
      <h2>Exportar Transacciones</h2>

      <div class="mb-3">
        <label for="transaccionSelect" class="form-label">Seleccione una transacción:</label>
        <select
          id="transaccionSelect"
          class="form-select"
          v-model="transaccionSeleccionada"
        >
          <option disabled value="">-- Seleccione --</option>
          <option v-for="tx in transacciones" :key="tx.id" :value="tx.id">
            {{ tx.descripcion || ('Transacción #' + tx.id) }}
          </option>
        </select>
      </div>

      <div class="mb-3">
        <button
          v-for="formato in formatos"
          :key="formato"
          class="btn btn-outline-primary me-2"
          @click="exportar(formato)"
          :disabled="exportando"
        >
          Exportar {{ formato.toUpperCase() }}
        </button>
      </div>

      <div v-if="mensaje" class="alert" :class="mensaje.includes('Error') ? 'alert-danger' : 'alert-success'">
        {{ mensaje }}
      </div>
    </div>
  </div>
</template>
