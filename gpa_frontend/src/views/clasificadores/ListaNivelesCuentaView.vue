<script setup>
import { ref, onMounted } from 'vue';
import global_vars from '@/config/global_vars';
import NavBar from '../components/NavBar.vue';
import router from '@/router';

const nivelesCuenta = ref([]);
const errorMessage = ref('');

const fetchNivelesCuenta = async () => {
    try {
        const response = await fetch(`${global_vars.api_url}/nivel_cuenta`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json() 
            errorMessage.value = error.message || 'Error al obtener los niveles de cuenta';
            return;
        } 

        const data = await response.json();
        if (data.length === 0) {
            errorMessage.value = 'No hay niveles de cuenta disponibles.';
        } else {
            nivelesCuenta.value = data;
        }
    } catch (error) {
        console.error('Error al obtener los niveles de cuenta:', error);
    }
}

onMounted(fetchNivelesCuenta);

</script>

<template>
    <main class="d-flex">
        <NavBar />
        <div class="container p-3 m-3">
            <div>
                <h2>Lista de Niveles de Cuenta</h2>
                <div class="container">
                    <div class="container p-3">
                        <router-link to="/clasificadores/niveles_cuenta/form" class="btn btn-primary">Crear Nivel Cuenta</router-link>
                    </div>
                    <table class="table table-striped table-bordered table-hover">
                        <thead>
                            <tr>
                                <th class="gradient-blue text-white">Nombre</th>
                                <th class="gradient-blue text-white">Profundidad</th>
                                <th class="gradient-blue text-white">Longitud Máxima</th>
                            </tr>
                        </thead>
                        <tbody>
                            <h3 v-if="errorMessage">{{ errorMessage }}</h3>
                            <tr v-for="nivel in nivelesCuenta" :key="nivel.id" >
                                <td>{{ nivel.nombre }}</td>
                                <td>{{ nivel.profundidad }}</td>
                                <td>{{ nivel.longitud_maxima }}</td>
                                <td><button class="btn btn-primary" @click="editNivel(nivel.id)">Editar</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>
</template>