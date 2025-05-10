<script setup>
import { ref } from 'vue';
import NavBar from '../components/NavBar.vue';
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import global_vars from '@/config/global_vars';

const router = useRouter()
const route = useRoute()

const user_id = sessionStorage.getItem('user_id');
const nivel_cuenta_id = route.params.id;

console.log(user_id)

const form = ref({
    nombre : '',
    profundidad : 0,
    longitud_maxima: 0,
    user_id : user_id,
    nivel_cuenta_id : 0
})

const errorMessage = ref('');

const handleSubmit = async () => {
    if(route.params.id){

    }else{
        await handleCreate();
    }
}

const handleCreate = async () => {
    try{
        const response = await fetch(`${global_vars.api_url}/nivel_cuenta/create`, {
            method: 'POST',
            headers : {
                "Content-Type" : 'application/json'
            },
            body : JSON.stringify(form.value)
        });

        const data = await response.json()
        if(!response.status.ok){
            errorMessage.value = data.message;
            return;
        }
        router.push('/clasificadores/niveles_cuenta')
    }catch(error){
        console.log(error);
    }
}

const fetchNivelCuentaData = async () => {
    const response = await fetch(`${global_vars.api_url}/nivel_cuenta/${nivel_cuenta_id}`, {
        method: 'GET'
    })

    const data = await response.json()
    if(!response.status){
        errorMessage.value = data.message;
    }else{
        form.value.nombre = data.nombre;
        form.value.profundidad = data.profundidad;
        form.value.longitud_maxima = data.longitud_maxima;
    }
}

if(route.params.id){
    onMounted(fetchNivelCuentaData)
}

</script>

<template>
    <main class="d-flex">
        <NavBar />
        <div class="container p-3 m-3">
            <div class="">
                <div class="card p-3">
                    <div>
                        <router-link to="/clasificadores/niveles_cuenta" class="btn btn-secondary">Volver atrás</router-link>
                    </div>
                    <h2>Crear nivel de Cuenta</h2>
                    <form class="form" @submit.prevent="handleSubmit">
                        <div class="form-group">
                            <label class="control-label">Nombre de nivel de cuenta:</label>
                            <input v-model="form.nombre" type="text" placeholder="nombre" class="form-control"/>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Profundidad (Número entero):</label>
                            <input v-model="form.profundidad" type="number" value="1" min="1" max="4" class="form-control"/>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Longitud Máxima (Número entero):</label>
                            <input v-model="form.longitud_maxima" type="number" value="1" min="1" max="4" class="form-control"/>
                        </div>
                        <input v-model="form.user_id" type="hidden" />
                        <div class="container p-3">
                            <button class="btn btn-success" type="submit">Guardar</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </main>
</template>