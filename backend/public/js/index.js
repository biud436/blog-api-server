window.addEventListener('load', () => {
    loginForm.addEventListener('submit', (e) => {
        const loginForm = document.getElementById('loginForm');
        const username = loginForm.username.value.trim();
        const password = loginForm.password.value.trim();

        e.preventDefault();
        if (username === '' || password === '') {
            alert('아이디와 비밀번호를 입력해주세요.');
            return;
        }

        checkUsernameAndPassword();
    });

    function checkUsernameAndPassword() {
        const loginForm = document.getElementById('loginForm');
        const username = loginForm.username.value;
        const password = loginForm.password.value;

        fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                password,
            }),
        })
            .then((res) => res.json())
            .then((res) => {
                if (res.result === 'success') {
                    location.href = '/docs';
                } else {
                    alert(res.message);
                }
            });
    }
});
