
const isAuthenticated = () => {
    return sessionStorage.getItem('user_id') !== null;
};

//los Guards son funciones que se ejecutan antes de entrar a una ruta
const IsAuthenticatedGuard = (to, from, next) => {
    if (isAuthenticated()) {
        next();
    } else {
        next({ name: 'Login' });
    }
}

const Guards = {
    IsAuthenticatedGuard
}

//export all guards
export default Guards;