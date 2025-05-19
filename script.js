document.addEventListener('DOMContentLoaded', () => {
    let score = 0;
    let level = 1;
    let walletAddress = null;

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
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const accounts = await provider.send('eth_requestAccounts', []);
                walletAddress = accounts[0];
                document.getElementById('wallet').textContent = `Wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
            } catch (error) {
                console.error('Ошибка подключения кошелька:', error);
                alert('Не удалось подключить кошелек. Проверьте MetaMask.');
            }
        } else {
            alert('Установите MetaMask для подключения кошелька!');
        }
    });

    // Обновление лидерборда
    document.getElementById('refresh-leaderboard').addEventListener('click', () => {
        // Пример статического лидерборда (замените на API при необходимости)
        const leaderboard = [
            { player: walletAddress ? `${walletAddress.slice(0, 6)}...` : 'Игрок 1', score: 150, level: 2 },
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
