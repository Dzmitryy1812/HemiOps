document.addEventListener('DOMContentLoaded', async () => {
    let score = 0;
    let level = 1;
    let walletAddress = null;
    let playerName = 'Игрок 1';
    let contract = null;

    // Конфигурация сети Hemi
    const HEMI_CHAIN_ID = '0xa7cf'; // 43111 в шестнадцатеричном формате
    const contractAddress = const contractAddress = '0xa523082CfaC400c6913E71A54365E7aBda30fE75'; // 
    const contractABI = [
        {
            "inputs": [
                {"name": "_score", "type": "uint256"},
                {"name": "_level", "type": "uint256"}
            ],
            "name": "updatePlayer",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getLeaderboard",
            "outputs": [
                {
                    "components": [
                        {"name": "playerAddress", "type": "address"},
                        {"name": "score", "type": "uint256"},
                        {"name": "level", "type": "uint256"},
                        {"name": "lastUpdated", "type": "uint256"}
                    ],
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];

    // Проверка сети Hemi
    async function checkNetwork() {
        if (typeof window.ethereum !== 'undefined') {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (chainId !== HEMI_CHAIN_ID) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: HEMI_CHAIN_ID }],
                    });
                } catch (error) {
                    console.error('Ошибка переключения сети:', error);
                    alert('Пожалуйста, переключитесь на сеть Hemi (Chain ID: 43111) в MetaMask.');
                    return false;
                }
            }
            return true;
        } else {
            alert('Установите MetaMask для проверки сети!');
            return false;
        }
    }

    // Инициализация контракта
    async function initContract() {
        if (await checkNetwork() && typeof window.ethereum !== 'undefined') {
            const provider = new window.Web3(window.ethereum);
            contract = new provider.eth.Contract(contractABI, contractAddress);
            console.log('Контракт инициализирован');
        }
    }

    // Загрузка Web3.js
    if (!window.Web3) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/web3@1.8.0/dist/web3.min.js';
        script.onload = initContract;
        script.onerror = () => console.error('Ошибка загрузки Web3.js');
        document.head.appendChild(script);
    } else {
        await initContract();
    }

    // Проверяем, найдены ли элементы
    const ducks = document.querySelectorAll('.duck a');
    console.log('Найдено уток:', ducks.length);

    // Обработка кликов по "уткам"
    ducks.forEach(duck => {
        duck.addEventListener('click', async (event) => {
            console.log('Клик по утке:', duck.parentElement.id);
            const targetDuck = event.currentTarget.parentElement;
            const isGolden = targetDuck.id === 'duck5';
            const points = isGolden ? 50 : 10;
            score += points;
            document.getElementById('score').textContent = `Score: ${score}`;
            targetDuck.classList.add('hidden');

            setTimeout(() => {
                targetDuck.classList.remove('hidden');
            }, 2000);

            // Смена уровня при достижении 100 очков
            if (score >= 100) {
                level++;
                if (level > 5) level = 1;
                document.getElementById('level').textContent = `Level: ${level}`;
                document.body.className = `level-${level}`;
                score = 0;
                document.getElementById('score').textContent = `Score: ${score}`;

                // Обновление лидерборда в смарт-контракте
                if (contract && walletAddress) {
                    try {
                        await contract.methods.updatePlayer(score, level).send({ from: walletAddress });
                        console.log('Лидерборд обновлён в смарт-контракте');
                        await updateLeaderboard();
                    } catch (error) {
                        console.error('Ошибка обновления лидерборда:', error);
                    }
                }
            }
        });
    });

    // Подключение кошелька через MetaMask
    const connectWalletButton = document.getElementById('connect-wallet');
    if (connectWalletButton) {
        connectWalletButton.addEventListener('click', async () => {
            if (typeof window.ethereum !== 'undefined') {
                try {
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
    }

    // Обновление лидерборда
    async function updateLeaderboard() {
        if (contract) {
            try {
                const leaderboardData = await contract.methods.getLeaderboard().call();
                const tbody = document.querySelector('#leaderboard tbody');
                if (tbody) {
                    tbody.innerHTML = '';
                    leaderboardData.forEach(player => {
                        if (player.playerAddress !== '0x0000000000000000000000000000000000000000') {
                            const displayName = `${player.playerAddress.slice(0, 6)}...${player.playerAddress.slice(-4)}`;
                            const lastUpdated = new Date(player.lastUpdated * 1000).toLocaleString();
                            tbody.innerHTML += `<tr><td>${displayName}</td><td>${player.score}</td><td>${player.level}</td><td>${lastUpdated}</td></tr>`;
                        }
                    });
                }
            } catch (error) {
                console.error('Ошибка загрузки лидерборда:', error);
            }
        }
    }

    // Инициализация лидерборда при загрузке
    updateLeaderboard();

    // Обновление лидерборда по кнопке
    const refreshLeaderboardButton = document.getElementById('refresh-leaderboard');
    if (refreshLeaderboardButton) {
        refreshLeaderboardButton.addEventListener('click', updateLeaderboard);
    }
});
