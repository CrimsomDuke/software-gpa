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
const tipo_cuenta_id = route.params.id;

console.log(user_id)

const form = ref({
    nombre : '',
    descripcion : '',
    user_id : user_id,
    tipo_cuenta_id : 0
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
        router.push('/clasificadores/tipos_cuenta');
    }
}

const handleCreate = async () => {
    try{
        const response = await fetch(`${global_vars.api_url}/tipo_cuenta/create`, {
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
    console.log('update');
    try{
        const response = await fetch(`${global_vars.api_url}/tipo_cuenta/update/${tipo_cuenta_id}`, {
            method: 'PATCH',
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
        const response = await fetch(`${global_vars.api_url}/tipo_cuenta/delete/${tipo_cuenta_id}`, {
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
    if(!form.value.descripcion){
        errorMessage.value = 'La profundidad es requerida';
        return false;
    }
    return true;
}

const fetchNivelCuentaData = async () => {
    const response = await fetch(`${global_vars.api_url}/tipo_cuenta/${tipo_cuenta_id}`, {
        method: 'GET'
    })

    const data = await response.json()
    if(!response.status){
        errorMessage.value = data.message;
    }else{
        form.value.nombre = data.nombre;
        form.value.descripcion = data.descripcion;
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
                        <router-link to="/clasificadores/tipos_cuenta" class="btn btn-secondary">Volver atrás</router-link>
                    </div>
                    <h2>Establecer nivel de Cuenta</h2>
                    <form class="form" @submit.prevent="handleSubmit">
                        <div class="form-group">
                            <label class="control-label">Nombre de nivel de cuenta:</label>
                            <CustomComboBox v-model="form.nombre" :dataSource="global_vars.TIPOS_CUENTAS" :default-value="form.nombre"
                                :isPrimitiveArray="true"/>
                        </div>
                        <div class="form-group">
                            <label class="control-label">Descripcion: </label>
                            <input v-model="form.descripcion" type="text" minlength="6" max="50" class="form-control" required/>
                        </div>
                        <input v-model="form.user_id" type="hidden" />
                        <div class="container p-3 w-100 d-flex justify-content-between">
                            <button class="btn btn-success" type="submit">Guardar</button>
                            <button class="btn btn-danger" type="button" @click="async () => { 
                                await handleDelete(); router.push('/clasificadores/tipos_cuenta')}">
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