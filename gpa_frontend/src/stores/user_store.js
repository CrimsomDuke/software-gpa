
import {  onMounted, ref } from 'vue';
import global_vars from "@/config/global_vars";
import { defineStore } from 'pinia';
import { useRouter } from 'vue-router';

export const useUserStore = defineStore('user', () => {

    const user = ref(null);
    const router = useRouter();

    const fetchUserInSession = async() => {

        if (!sessionStorage.getItem('user_id')) {
            console.error('No user_id found in sessionStorage');
            router.push({ name: 'Login' });
            return;
        }

        try{
            const response = await fetch(`${global_vars.api_url}/users/${sessionStorage.getItem('user_id')}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
            });
            if (response.ok) {
            const data = await response.json();
            user.value = data;
            console.log('Usuario en sesión:', data);

            } else {
                console.error('Error al obtener el usuario en sesión');
            }
        } catch (error) {
            console.error('Error al obtener el usuario en sesión:', error);
        }
    }

    fetchUserInSession();
    
    async function setUser() {
        await fetchUserInSession();
    }

    async function getUser() {
        if(!user.value){
            await setUser();
        }
        return user.value;
    }

    return {
        user, getUser, setUser
    }
})