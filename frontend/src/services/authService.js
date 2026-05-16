import { apiRequest } from './api.js';

async function signup(name, email, password) {

    return apiRequest('/api/users/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
    });
}

async function login(email, password) {

    return apiRequest('/api/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });
}

export { signup, login };
