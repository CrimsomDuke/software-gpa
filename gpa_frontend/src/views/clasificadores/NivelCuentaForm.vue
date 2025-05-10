<script setup>
import { ref } from 'vue';
import NavBar from '../components/NavBar.vue';
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const user_id = sessionStorage.getItem('user_id');

console.log(user_id)

const router = useRouter()
const route = useRoute()

const form = ref({
    nombre : '',
    profundidad : 0,
    longitud_maxima: 0,
    user_id : user_id,
    nivel_cuenta_id : 0
})

const errorMessage = ref('');

const handleSubmit = async () => {
    if(route.params.id)
}

const fetchNivelCuentaData() => {

}

if(route.params.id){
    onMounted(fetchNivelCuentaData)
}

</script>

<template>
    <main class="d-flex">
        <NavBar />
        <div class="container p-3 m-3">
            <div class="w-50">
                <div class="card p-3">
                    <div>
                        <router-link to="/clasificadores/niveles_cuenta" class="btn btn-secondary">Volver atrás</router-link>
                    </div>
                    <h2>Crear nivel de Cuenta</h2>
                    <form class="form">
                        <div class="form-group">
                            <label class="control-label">Nombre de nivel de cuenta:</label>
                            <input type="text" placeholder="nombre" class="form-control"/>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Profundidad (Número entero):</label>
                            <input type="number" value="1" min="1" max="4" class="form-control"/>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Longitud Máxima (Número entero):</label>
                            <input type="number" value="1" min="1" max="4" class="form-control"/>
                        </div>
                        <div>
                            <button type="submit">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </main>
</template>