<script setup>
import global_vars from '@/config/global_vars';
import NavBar from '../components/NavBar.vue';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import ComboBox from '../components/ComboBox.vue';

const route = useRoute();

const id = route.params.id;
const user_id = sessionStorage.getItem('user_id');
const is_same_user = (user_id == id);

const canUserRoleBeChanged = true;

const errorMessage = ref('');

const form = ref({
    username : '',
    fullname : '',
    email : '',
    is_active : false,
    role : '',
    user_edit_id : user_id
})

const fetchUserData = async () => {
    try {
        const response = await fetch(`${global_vars.api_url}/users/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            form.value.username = data.username;
            form.value.fullname = data.fullname;
            form.value.email = data.email;
            form.value.is_active = data.is_active;
            form.value.role = data.role;

            //si el usuario es admin, nadie deberia poder cambiar su rol
            canUserRoleBeChanged = (data.role == 'admin') || data.id == user_id;
        } else {
            errorMessage.value = 'Error al obtener los datos del usuario.';
        }
    } catch (error) {
        console.error('Error al obtener los datos del usuario:', error);
    }
}

const handleSubmit = async () => {
    if (!validateForm()) {
        return;
    }

    if (id) {
        await handleUpdate();
    }

    if (!errorMessage.value) {
        console.log('Usuario creado');
    }
}

const handleUpdate = async () => {
    try {
        const response = await fetch(`${global_vars.api_url}/users/update/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(form.value)
        });

        const data = await response.json();
        if (!response.ok) {
            errorMessage.value = data.message;
            return;
        }
    } catch (error){
        console.log(error);
        errorMessage.value = 'Error al actualizar el usuario.';
    }
}

const validateForm = () => {
    if (!form.value.username || !form.value.fullname || !form.value.email) {
        errorMessage.value = 'Por favor complete todos los campos.';
        return false;
    }
    return true;
}
onMounted(() => {
    if (id) {
        fetchUserData();
    }
});

</script>

<template>
    <main class="d-flex">
        <NavBar />
        <div class="container p-3 m-3">
            <div class="">
                <div class="card p-3">
                    <div>
                        <router-link to="/seguridad/usuarios" class="btn btn-secondary">Volver atrás</router-link>
                    </div>
                    <h2>Datos del Usuario</h2>
                    <form class="form" @submit.prevent="handleSubmit">
                        <div class="form-group">
                            <label for="username" class="form-label">Usuario</label>
                            <input type="text" class="form-control" id="username" v-model="form.username" required>
                        </div>
                        <div class="form-group">
                            <label for="fullname" class="form-label">Nombre Completo</label>
                            <input type="text" class="form-control" id="fullname" v-model="form.fullname" required>
                        </div>
                        <div class="form-group">
                            <label for="email" class="form-label">Email</label>
                            <input type="email" class="form-control" id="email" v-model="form.email" required>
                        </div>
                        <div class="form-group">
                            <label for="role" class="form-label">Rol</label>
                            <ComboBox is-primitive-array="true" :data-source="global_vars.ROLES"
                                :default-value="form.role" :disabled="canUserRoleBeChanged"/>
                        </div>
                        <div v-if="!is_same_user" class="form-group p-1 m-3">
                            <input type="checkbox" id="is_active" v-model="form.is_active" class="form-check-input-lg check-box-lg me-3">
                            <label for="is_active" class="form-check-label">Activo</label>
                        </div>
                        <div class="container p-3 w-100 d-flex justify-content-between">
                            <button class="btn btn-success" type="submit">Guardar</button>
                        </div>
                    </form>
                    <p v-if="errorMessage" class="text-danger">{{ errorMessage }}</p>
                </div>
            </div>
        </div>
    </main>
</template>

<style>
    .check-box-lg{
        width: 20px;
        height: 20px;
    }
</style>