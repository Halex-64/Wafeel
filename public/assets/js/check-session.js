// fetch(`${window.location.origin}/auth/check-session`)
//     .then(response => response.json())
//     .then(data => {
//         if (!data.loggedIn) {
//             window.location.href = '/login.html'; // Redirecionar para login se não estiver logado
//         } else {
//             console.log(`Usuário logado: ${data.user.email}`);
//         }
//     })
//     .catch(error => console.error('Erro ao verificar sessão:', error));