
import { useUserStore } from "@/stores/user_store";
import { toRaw } from "vue";

const isAuthenticated = () => {
    return sessionStorage.getItem('user_id') !== null;
};

//los Guards son funciones que se ejecutan antes de entrar a una ruta
const IsAuthenticatedGuard = async (to, from, next) => {
    if (isAuthenticated()) {
        next();
    } else {
        next({ name: 'Login' });
    }
}

const isUserAuthorized = (userRoleLevel, requiredRoleLevel) => {
    return userRoleLevel >= requiredRoleLevel;
}

const IsAuthorizedRoleGuard = async (to, from, next) => {

    if(!isAuthenticated()) {
        next({ name: 'Login' });
        return;
    }

    const currentUser = toRaw(await useUserStore().getUser());
    const userRoleLevel = parseInt(currentUser.role.level);
    const requiredRoleLevel = to.meta.requiredRoleLevel;

    if (isUserAuthorized(userRoleLevel, requiredRoleLevel)) {
        next();
    } else {
        alert("Usuario no autorizado para esta pagina.");
        next({ name: 'Home' });
    }
}

const Guards = {
    IsAuthenticatedGuard,
    IsAuthorizedRoleGuard
}

//export all guards
export default Guards;