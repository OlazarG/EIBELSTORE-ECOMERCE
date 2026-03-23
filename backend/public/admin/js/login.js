const API_URL = '/api/auth/login';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.accessToken);
            localStorage.setItem('user', JSON.stringify(data));
            window.location.href = '../../../index.html';
        } else {
            errorMsg.textContent = data.message || 'Error al iniciar sesión';
            errorMsg.style.display = 'block';
            errorMsg.classList.remove('hidden');
        }
    } catch (error) {
        console.error(error);
        errorMsg.textContent = 'Error de conexión';
        errorMsg.style.display = 'block';
        errorMsg.classList.remove('hidden');
    }
});
