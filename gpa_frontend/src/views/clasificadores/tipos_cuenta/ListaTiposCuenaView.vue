<script setup>
import { ref, onMounted } from 'vue';
import global_vars from '@/config/global_vars';
import NavBar from '../../components/NavBar.vue';
import { RouterLink } from 'vue-router';

const tiposCuenta = ref([]);
const errorMessage = ref('');

const fetchTiposCuenta = async () => {
    try {
        const response = await fetch(`${global_vars.api_url}/tipo_cuenta`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json() 
            errorMessage.value = error.message || 'Error al obtener los tipos de cuenta';
            return;
        } 

        const data = await response.json();
        if (data.length === 0) {
            errorMessage.value = 'No hay tipos de cuenta disponibles.';
        } else {
            tiposCuenta.value = data;
        }
    } catch (error) {
        console.error('Error al obtener los tipos de cuenta:', error);
    }
}

onMounted(fetchTiposCuenta);

</script>

<template>
    <main class="d-flex">
        <NavBar />
        <div class="container p-3 m-3">
            <div>
                <h2>Lista de tipos de Cuenta</h2>
                <div class="container">
                    <div class="container p-3">
                        <router-link to="/clasificadores/tipos_cuenta/form" class="btn btn-primary">Crear Nivel Cuenta</router-link>
                    </div>
                    <table class="table table-striped table-bordered table-hover">
                        <thead>
                            <tr>
                                <th class="gradient-blue text-white">Nombre</th>
                                <th class="gradient-blue text-white">Descripcion</th>
                                <th class="gradient-blue text-white">Editar</th>
                            </tr>
                        </thead>
                        <tbody>
                            <h3 v-if="errorMessage">{{ errorMessage }}</h3>
                            <tr v-for="tipo in tiposCuenta" :key="tipo.id">
                                <td class="text-center">{{ tipo.nombre }}</td>
                                <td class="text-center">{{ tipo.descripcion }}</td>
                                <td class="text-center">
                                    <router-link :to="{ name: 'TipoCuentasFormEdit', params: { id: tipo.id } }" class="btn btn-primary">
                                        Editar
                                    </router-link>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>
</template>