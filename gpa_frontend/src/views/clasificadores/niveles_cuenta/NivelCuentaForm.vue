<script setup>
import { ref } from 'vue';
import NavBar from '../../components/NavBar.vue';
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import global_vars from '@/config/global_vars';
import CustomComboBox from '../../components/ComboBox.vue';

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

    console.log(form.value.nombre)
    if(!validateForm()){
        return;
    }

    if(route.params.id){
        await handleUpdate();
    }else{
        await handleCreate();
    }

    if(!errorMessage.value){
        console.log('Nivel de cuenta creado');
        router.push('/clasificadores/niveles_cuenta');
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
    }catch(error){
        console.log(error);
    }
}

const handleUpdate = async () => {
    try{
        const response = await fetch(`${global_vars.api_url}/nivel_cuenta/update/${nivel_cuenta_id}`, {
            method: 'PUT',
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
    }catch(error){
        console.log(error);
    }
}

const handleDelete = async () => {
    if(!confirm('¿Está seguro de que desea eliminar este nivel de cuenta?')){
        return;
    }
    try{
        const response = await fetch(`${global_vars.api_url}/nivel_cuenta/delete/${nivel_cuenta_id}`, {
            method: 'DELETE',
            headers : {
                "Content-Type" : 'application/json'
            },
            body : JSON.stringify(form.value) //user id en el form
        });

        const data = await response.json()
        if(!response.status.ok){
            errorMessage.value = data.message;
            return;
        }
    }catch(error){
        console.log(error);
    }
}

const validateForm = () => {
    if(!form.value.nombre){
        errorMessage.value = 'El nombre de nivel de cuenta es requerido';
        return false;
    }
    if(!form.value.profundidad){
        errorMessage.value = 'La profundidad es requerida';
        return false;
    }
    if(!form.value.longitud_maxima){
        errorMessage.value = 'La longitud máxima es requerida';
        return false;
    }
    return true;
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
                    <h2>Establecer nivel de Cuenta</h2>
                    <form class="form" @submit.prevent="handleSubmit">
                        <div class="form-group">
                            <label class="control-label">Nombre de nivel de cuenta:</label>
                            <CustomComboBox v-model="form.nombre" :dataSource="global_vars.NIVELES_CUENTAS" :default-value="global_vars.NIVELES_CUENTAS[0]"
                                :isPrimitiveArray="true"/>
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
                        <div class="container p-3 w-100 d-flex justify-content-between">
                            <button class="btn btn-success" type="submit">Guardar</button>
                            <button class="btn btn-danger" type="button" @click="async () => { 
                                await handleDelete(); router.push('/clasificadores/niveles_cuenta')}">
                                Eliminar
                            </button>
                        </div>
                    </form>
                    <p v-if="errorMessage" class="text-danger">{{ errorMessage }}</p>
                </div>
            </div>
        </div>
    </main>
</template>