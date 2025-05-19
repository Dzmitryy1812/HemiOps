document.addEventListener('DOMContentLoaded', async () => {
    console.log('Страница загружена:', new Date().toISOString());
    let score = 0;
    let level = 1;
    let walletAddress = null;
    let playerName = 'Игрок 1';
    let contract = null;
    let isUserInitiated = false; // Флаг для пользовательских действий

    // Конфигурация сети Hemi
    const HEMI_CHAIN_ID = '0xa7cf'; // 43111 в шестнадцатеричном формате
    const HEMI_NETWORK_PARAMS = {
        chainId: '0xa7cf',
        chainName: 'Hemi',
        rpcUrls: ['https://rpc.hemi.network'], // Проверить: замените на актуальный RPC URL
        nativeCurrency: {
            name: 'Hemi',
            symbol: 'ETH',
            decimals: 18,
        },
        blockExplorerUrls: ['https://explorer.hemi.xyz/'], // Проверить: замените на актуальный URL
    };
    const contractAddress = '0xa523082CfaC400c6913E71A54365E7aBda30fE75';
    const contractABI = [
        {
            "anonymous": false,
            "inputs": [
                {"indexed": true, "internalType": "address", "name": "playerAddress", "type": "address"},
                {"indexed": false, "internalType": "uint256", "name": "score", "type": "uint256"},
                {"indexed": false, "internalType": "uint256", "name": "level", "type": "uint256"}
            ],
            "name": "PlayerUpdated",
            "type": "event"
        },
        {
            "inputs": [
                {"internalType": "uint256", "name": "_score", "type": "uint256"},
                {"internalType": "uint256", "name": "_level", "type": "uint256"}
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
                        {"internalType": "address", "name": "playerAddress", "type": "address"},
                        {"internalType": "uint256", "name": "score", "type": "uint256"},
                        {"internalType": "uint256", "name": "level", "type": "uint256"},
                        {"internalType": "uint256", "name": "lastUpdated", "type": "uint256"}
                    ],
                    "internalType": "struct Leaderboard.Player[]",
                    "name": "",
                    "type": "tuple[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "address", "name": "_player", "type": "address"}],
            "name": "getPlayer",
            "outputs": [
                {
                    "components": [
                        {"internalType": "address", "name": "playerAddress", "type": "address"},
                        {"internalType": "uint256", "name": "score", "type": "uint256"},
                        {"internalType": "uint256", "name": "level", "type": "uint256"},
                        {"internalType": "uint256", "name": "lastUpdated", "type": "uint256"}
                    ],
                    "internalType": "struct Leaderboard.Player",
                    "name": "",
                    "type": "tuple"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getPlayerCount",
            "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
            "name": "playerAddresses",
            "outputs": [{"internalType": "address", "name": "", "type": "address"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "address", "name": "", "type": "address"}],
            "name": "players",
            "outputs": [
                {"internalType": "address", "name": "playerAddress", "type": "address"},
                {"internalType": "uint256", "name": "score", "type": "uint256"},
                {"internalType": "uint256", "name": "level", "type": "uint256"},
                {"internalType": "uint256", "name": "lastUpdated", "type": "uint256"}
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];

    // Проверка сети Hemi
    async function checkNetwork() {
        console.log('Вызов checkNetwork:', new Date().toISOString());
        console.trace('Стек вызовов checkNetwork');
        if (!isUserInitiated) {
            console.log('checkNetwork заблокирован: не инициировано пользователем');
            return false;
        }
        if (typeof window.ethereum !== 'undefined') {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            console.log('Текущий chainId:', chainId);
            if (chainId !== HEMI_CHAIN_ID) {
                console.log('Переключение на Hemi с chainId:', HEMI_CHAIN_ID);
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: HEMI_CHAIN_ID }],
                    });
                } catch (error) {
                    if (error.code === 4902) {
                        try {
                            console.log('Добавление сети Hemi:', HEMI_NETWORK_PARAMS);
                            await window.ethereum.request({
                                method: 'wallet_addEthereumChain',
                                params: [HEMI_NETWORK_PARAMS],
                            });
                            await window.ethereum.request({
                                method: 'wallet_switchEthereumChain',
                                params: [{ chainId: HEMI_CHAIN_ID }],
                            });
                        } catch (addError) {
                            console.error('Ошибка добавления сети Hemi:', addError);
                            console.log('Не удалось добавить сеть Hemi. Пожалуйста, добавьте сеть вручную в MetaMask с Chain ID: 43111.');
                            return false;
                        }
                    } else {
                        console.error('Ошибка переключения сети:', error);
                        console.log('Пожалуйста, переключитесь на сеть Hemi (Chain ID: 43111) в MetaMask.');
                        return false;
                    }
                }
            }
            return true;
        } else {
            console.log('MetaMask не установлен');
            return false;
        }
    }

    // Инициализация контракта
    async function initContract() {
        if (typeof window.ethereum !== 'undefined') {
            const provider = new window.Web3(window.ethereum);
            contract = new provider.eth.Contract(contractABI, contractAddress);
            console.log('Контракт инициализирован');
        }
    }

    // Проверка состояния MetaMask при загрузке
    async function checkMetaMaskStatus() {
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            console.log('MetaMask: подключённые аккаунты при загрузке:', accounts);
            window.ethereum.on('chainChanged', (chainId) => {
                console.log('MetaMask: смена сети на:', chainId);
            });
            window.ethereum.on('accountsChanged', (accounts) => {
                console.log('MetaMask: смена аккаунта:', accounts);
            });
        } else {
            console.log('MetaMask не установлен при загрузке');
        }
    }
    checkMetaMaskStatus();

    // Загрузка Web3.js
    if (!window.Web3) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/web3@1.8.0/dist/web3.min.js';
        script.onerror = () => {
            console.error('Ошибка загрузки Web3.js');
            console.log('Не удалось загрузить необходимые библиотеки.');
        };
        document.head.appendChild(script);
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

            if (score >= 100) {
                level++;
                if (level > 5) level = 1;
                document.getElementById('level').textContent = `Level: ${level}`;
                document.body.className = `level-${level}`;
                score = 0;
                document.getElementById('score').textContent = `Score: ${score}`;

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
            console.log('Клик по кнопке Connect Wallet!');
            isUserInitiated = true; // Разрешаем вызов checkNetwork
            if (await checkNetwork()) {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    walletAddress = accounts[0];
                    playerName = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
                    document.getElementById('wallet').textContent = `Wallet: ${playerName}`;
                    console.log('Кошелёк подключён:', walletAddress);
                    await initContract();
                    await updateLeaderboard();
                } catch (error) {
                    console.error('Ошибка подключения кошелька:', error);
                    console.log('Не удалось подключить кошелёк. Проверьте MetaMask.');
                }
            }
            isUserInitiated = false; // Сбрасываем флаг
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

    // Обновление лидерборда по кнопке
    const refreshLeaderboardButton = document.getElementById('refresh-leaderboard');
    if (refreshLeaderboardButton) {
        refreshLeaderboardButton.addEventListener('click', updateLeaderboard);
    }
});
