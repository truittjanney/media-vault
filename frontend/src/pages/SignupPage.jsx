import { signup } from '../services/authService.js';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    async function handleSubmit(event) {
        event.preventDefault();
        setErrorMessage('');

        try {
            const data = await signup(name, email, password);
            navigate('/login');

        } catch (error) {
            setErrorMessage(error.message);
        }
    }

    return (
        <div>
            <h1>MediaVault</h1>
            <h2>Create Your Account</h2>

            {errorMessage && <p>{errorMessage}</p>}

            <form onSubmit={handleSubmit}>
                <p>Name: </p>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                <p>Email: </p>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <p>Password: </p>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

                <button type="submit">Create Account</button>
            </form>
        </div>
    );
}

export default Signup;
