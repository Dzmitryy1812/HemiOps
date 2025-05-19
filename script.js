document.addEventListener('DOMContentLoaded', async () => {
    console.log('HemiOps loaded:', new Date().toISOString());
    let score = 0;
    let level = 1;
    let walletAddress = null;
    let playerName = 'Player 1';
    let contract = null;

    // Hemi network configuration (kept for potential future use)
    const HEMI_CHAIN_ID = '0xa7cf'; // 43111 in hexadecimal
    const HEMI_NETWORK_PARAMS = {
        chainId: '0xa7cf',
        chainName: 'Hemi',
        rpcUrls: ['https://rpc.hemi.network'], // TODO: Verify and update RPC URL
        nativeCurrency: {
            name: 'Hemi',
            symbol: 'ETH',
            decimals: 18,
        },
        blockExplorerUrls: ['https://explorer.hemi.xyz/'], // TODO: Verify and update explorer URL
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

    // Initialize contract
    async function initContract() {
        console.log('Initializing contract for HemiOps:', new Date().toISOString());
        if (typeof window.ethereum !== 'undefined' && window.Web3) {
            try {
                const provider = new window.Web3(window.ethereum);
                contract = new provider.eth.Contract(contractABI, contractAddress);
                console.log('Contract initialized successfully:', contract);
            } catch (error) {
                console.error('Error initializing contract:', error);
            }
        } else {
            console.log('MetaMask or Web3.js not available, contract not initialized');
        }
    }

    // Check MetaMask status on load
    async function checkMetaMaskStatus() {
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            console.log('MetaMask: connected accounts on load:', accounts);
            window.ethereum.on('chainChanged', (chainId) => {
                console.log('MetaMask: network changed to:', chainId);
            });
            window.ethereum.on('accountsChanged', (accounts) => {
                console.log('MetaMask: account changed:', accounts);
                if (accounts.length > 0) {
                    walletAddress = accounts[0];
                    playerName = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
                    document.getElementById('wallet').textContent = `Wallet: ${playerName}`;
                    console.log('Wallet updated:', walletAddress);
                } else {
                    walletAddress = null;
                    document.getElementById('wallet').textContent = `Wallet: Not connected`;
                    console.log('Wallet disconnected');
                }
            });
        } else {
            console.log('MetaMask not installed on load');
        }
    }
    checkMetaMaskStatus();

    // Load Web3.js
    if (!window.Web3) {
        console.log('Loading Web3.js...');
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/web3@1.8.0/dist/web3.min.js';
        script.onload = () => console.log('Web3.js loaded');
        script.onerror = () => {
            console.error('Error loading Web3.js');
            console.log('Failed to load required libraries.');
        };
        document.head.appendChild(script);
    } else {
        console.log('Web3.js already available');
    }

    // Check for game elements
    const ducks = document.querySelectorAll('.duck a');
    console.log('Targets found:', ducks.length);

    // Handle target clicks
    ducks.forEach(duck => {
        duck.addEventListener('click', async (event) => {
            console.log('Target clicked:', duck.parentElement.id);
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

                console.log('Level completed: contract=', contract, 'walletAddress=',
