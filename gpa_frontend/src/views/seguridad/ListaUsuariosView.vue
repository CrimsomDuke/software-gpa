<script setup>
import { ref, onMounted } from 'vue';
import global_vars from '@/config/global_vars';
import NavBar from '../components/NavBar.vue';

const users = ref([]);
const errorMessage = ref('');

const fetchUsers = async () => {
    try {
        console.log("APIIIII")
        const response = await fetch(`${global_vars.api_url}/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            users.value = await response.json();
        } else {
            errorMessage.value = 'Error al obtener los usuarios.';
        }
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
    }
}

onMounted(fetchUsers);
//execute the function when the component is mounted
</script>

<template>
    <div class="d-flex">
        <NavBar />
        <div class="container p-3 m-3">
            <div>
                <h2>Lista de Usuarios</h2>
                <div class="card">
                    <h3 v-if="errorMessage">{{ errorMessage }}</h3>
                    <table class="table table-striped table-bordered table-hover">
                        <thead>
                            <tr>
                                <th class="gradient-blue text-white">Nombre</th>
                                <th class="gradient-blue text-white">Usuario</th>
                                <th class="gradient-blue text-white">Email</th>
                                <th class="gradient-blue text-white">Rol</th>
                                <th class="gradient-blue text-white">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="user in users" :key="user.id" >
                                <td class="text-center">{{ user.fullname }}</td>
                                <td class="text-center">{{ user.username }}</td>
                                <td class="text-center">{{ user.email }}</td>
                                <td class="text-center">{{ user.role }}</td>
                                <td class="text-center">
                                    <router-link :to="{ name: 'UsuariosFormEdit', params: { id: user.id } }" class="btn btn-primary">
                                        Editar
                                    </router-link>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>