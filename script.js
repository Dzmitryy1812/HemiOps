document.addEventListener('DOMContentLoaded', () => {
    let score = 0;
    let level = 1;
    let walletAddress = null;
    let playerName = 'Игрок 1'; // По умолчанию, если кошелёк не подключён

    // Проверяем, найдены ли элементы
    const ducks = document.querySelectorAll('.duck a');
    console.log('Найдено уток:', ducks.length);

    // Обработка кликов по "уткам"
    ducks.forEach(duck => {
        duck.addEventListener('click', (event) => {
            console.log('Клик по утке:', duck.parentElement.id);
            const targetDuck = event.currentTarget.parentElement;
            // Проверяем, является ли это "золотой" уткой (duck5)
            const isGolden = targetDuck.id === 'duck5';
            const points = isGolden ? 50 : 10; // 50 очков за золотую, 10 за обычную
            score += points;
            document.getElementById('score').textContent = `Score: ${score}`;
            targetDuck.classList.add('hidden');

            // Показать только эту "утку" снова через 2 секунды
            setTimeout(() => {
                targetDuck.classList.remove('hidden');
            }, 2000);

            // Смена уровня при достижении 100 очков
            if (score >= 100) {
                level++;
                if (level > 5) level = 1; // Циклический переход
                document.getElementById('level').textContent = `Level: ${level}`;
                document.body.className = `level-${level}`;
                score = 0;
                document.getElementById('score').textContent = `Score: ${score}`;
            }
        });
    });

    // Подключение кошелька через MetaMask
    document.getElementById('connect-wallet').addEventListener('click', async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                // Запрашиваем доступ к аккаунту
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                walletAddress = accounts[0];
                playerName = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
                document.getElementById('wallet').textContent = `Wallet: ${playerName}`;
                console.log('Кошелёк подключён:', walletAddress);
            } catch (error) {
                console.error('Ошибка подключения кошелька:', error);
                alert('Не удалось подключить кошелёк. Проверьте MetaMask.');
            }
        } else {
            console.error('MetaMask не установлен');
            alert('Установите MetaMask для подключения кошелька!');
        }
    });

    // Обновление лидерборда
    document.getElementById('refresh-leaderboard').addEventListener('click', () => {
        // Пример статического лидерборда (замените на API при необходимости)
        const leaderboard = [
            { player: playerName, score: score, level: level },
            { player: 'Игрок 2', score: 100, level: 1 },
            { player: 'Игрок 3', score: 50, level: 1 }
        ];
        const tbody = document.querySelector('#leaderboard tbody');
        tbody.innerHTML = '';
        leaderboard.forEach(row => {
            tbody.innerHTML += `<tr><td>${row.player}</td><td>${row.score}</td><td>${row.level}</td></tr>`;
        });
    });
});
