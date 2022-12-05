(function () {
    /**
     * 로그아웃 클릭 핸들러입니다.
     */
    function logout() {
        fetch('/auth/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((res) => res.json())
            .then((response) => {
                if (response.result === 'success') {
                    location.reload();
                }
            })
            .catch((err) => {
                alert(err.message);
            });
    }

    /**
     * 로그아웃 버튼을 추가합니다.
     */
    function bootstrap() {
        const logoutButton = document.createElement('button');
        logoutButton.innerHTML = '로그아웃';

        logoutButton.classList.add('btn', 'try-out__btn', 'col-12', 'mb4');

        logoutButton.addEventListener('click', logout);

        const swaggerUi = document.getElementById('swagger-ui');
        const header = swaggerUi.querySelector('.information-container ');

        header.appendChild(logoutButton);
    }

    window.addEventListener('load', () => {
        bootstrap();
    });
})();
