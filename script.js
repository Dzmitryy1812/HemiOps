document.addEventListener('DOMContentLoaded', async () => {
    console.log('Page loaded:', new Date().toISOString());
    let score = 0;
    let level = 1;
    let walletAddress = null;
    let playerName = 'Player 1';
    let contract = null;
    let gameStarted = false;

    // Points required to level up for each level
    const POINTS_TO_LEVEL_UP = {
        1: 100,
        2: 150,
        3: 200,
        4: 250,
        5: 300
    };

    // Hemi network configuration
    const HEMI_CHAIN_ID = '0xa867';
    const HEMI_NETWORK_PARAMS = {
        chainId: '0xa867',
        chainName: 'Hemi',
        rpcUrls: ['https://rpc.hemi.network/rpc'],
        nativeCurrency: {
            name: 'Hemi',
            symbol: 'ETH',
            decimals: 18,
        },
        blockExplorerUrls: ['https://explorer.hemi.xyz/'],
    };
    const contractAddress = '0x6892735450a27F206ADf4f969dFD29e6d3d7199F'; // Update after deploying new contract
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
            "anonymous": false,
            "inputs": [
                {"indexed": true, "internalType": "address", "name": "player", "type": "address"},
                {"indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256"},
                {"indexed": false, "internalType": "uint256", "name": "level", "type": "uint256"}
            ],
            "name": "NFTMinted",
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
            "inputs": [
                {"internalType": "uint256", "name": "_level", "type": "uint256"}
            ],
            "name": "mintLevelNFT",
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
                        {"internalType": "uint256", "name": "lastUpdated", "type": "uint256"},
                        {"internalType": "bool[]", "name": "levelsMinted", "type": "bool[]"}
                    ],
                    "internalType": "struct HemiShooter.Player[]",
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
                        {"internalType": "uint256", "name": "lastUpdated", "type": "uint256"},
                        {"internalType": "bool[]", "name": "levelsMinted", "type": "bool[]"}
                    ],
                    "internalType": "struct HemiShooter.Player",
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

    // Function to show notifications
    function showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = type;
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 5000);
    }

    // Check if provider is MetaMask
    function isMetaMaskProvider() {
        return window.ethereum && window.ethereum.isMetaMask;
    }

    // Switch to Hemi network
    async function switchToHemiNetwork() {
        console.log('Checking Hemi network:', new Date().toISOString());
        try {
            const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (currentChainId !== HEMI_CHAIN_ID) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: HEMI_CHAIN_ID }],
                    });
                    console.log('Switched to Hemi network');
                    showNotification('Switched to Hemi network', 'success');
                } catch (switchError) {
                    if (switchError.code === 4902) {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [HEMI_NETWORK_PARAMS],
                        });
                        console.log('Hemi network added');
                        showNotification('Hemi network added', 'success');
                    } else {
                        throw switchError;
                    }
                }
            } else {
                console.log('Already on Hemi network');
            }
        } catch (error) {
            console.error('Error switching to Hemi network:', error);
            showNotification('Failed to switch to Hemi network', 'error');
        }
    }

    // Initialize contract
    async function initContract() {
        console.log('Initializing contract:', new Date().toISOString());
        if (isMetaMaskProvider() && window.Web3) {
            try {
                const provider = new window.Web3(window.ethereum);
                contract = new provider.eth.Contract(contractABI, contractAddress);
                console.log('Contract successfully initialized:', contract);
                showNotification('Contract successfully initialized', 'success');
            } catch (error) {
                console.error('Error initializing contract:', error);
                showNotification('Error initializing contract', 'error');
            }
        } else {
            console.log('MetaMask or Web3.js not available');
            showNotification('MetaMask or Web3.js not available', 'error');
        }
    }

    // Check MetaMask status
    async function checkMetaMaskStatus() {
        if (isMetaMaskProvider()) {
            try {
                await switchToHemiNetwork();
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                console.log('MetaMask: connected accounts on load:', accounts);
                window.ethereum.on('chainChanged', (chainId) => {
                    console.log('MetaMask: chain changed to:', chainId);
                    switchToHemiNetwork();
                });
                window.ethereum.on('accountsChanged', (accounts) => {
                    console.log('MetaMask: account changed:', accounts);
                    if (accounts.length > 0) {
                        walletAddress = accounts[0];
                        playerName = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
                        document.getElementById('wallet').textContent = `Wallet: ${playerName}`;
                        console.log('Wallet updated:', walletAddress);
                        showNotification('Wallet updated', 'success');
                        document.getElementById('mint-nft').disabled = false;
                    } else {
                        walletAddress = null;
                        document.getElementById('wallet').textContent = `Wallet: Not connected`;
                        console.log('Wallet disconnected');
                        showNotification('Wallet disconnected', 'info');
                        document.getElementById('mint-nft').disabled = true;
                    }
                });
            } catch (error) {
                console.error('Error checking MetaMask:', error);
                showNotification('Error checking MetaMask', 'error');
            }
        } else {
            console.log('MetaMask not installed or not a trusted provider');
            showNotification('Please use MetaMask', 'error');
        }
    }
    checkMetaMaskStatus();

    // Load Web3.js
    if (!window.Web3) {
        console.log('Loading Web3.js...');
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/web3@1.8.0/dist/web3.min.js';
        script.onload = () => {
            if (window.Web3 && window.Web3.version && window.Web3.version.startsWith('1.')) {
                console.log('Web3.js loaded, version:', window.Web3.version);
                showNotification('Web3.js loaded successfully', 'success');
            } else {
                console.error('Incompatible Web3.js version');
                showNotification('Incompatible Web3.js version', 'error');
            }
        };
        script.onerror = () => {
            console.error('Error loading Web3.js');
            showNotification('Failed to load Web3.js', 'error');
        };
        document.head.appendChild(script);
    } else {
        console.log('Web3.js already available, version:', window.Web3.version);
    }

    // Check if elements are found
    const ducks = document.querySelectorAll('.duck a');
    console.log('Ducks found:', ducks.length);

    // Handle clicks on ducks
    ducks.forEach(duck => {
        duck.addEventListener('click', async (event) => {
            if (!gameStarted) return; // Ignore clicks if game hasn't started
            console.log('Duck clicked:', duck.parentElement.id);
            const targetDuck = event.currentTarget.parentElement;
            const isGolden = targetDuck.id === 'duck5';
            const points = isGolden ? 50 : 10;
            score += points;
            document.getElementById('score').textContent = `Score: ${score}`;
            targetDuck.classList.add('hidden');

            setTimeout(() => {
                targetDuck.classList.remove('hidden');
            }, 2000);

            const pointsToLevelUp = POINTS_TO_LEVEL_UP[level];
            if (score >= pointsToLevelUp) {
                level++;
                if (level > 5) level = 1; // Cycle levels
                document.getElementById('level').textContent = `Level: ${level}`;
                document.body.className = `level-${level}`;
                score = 0;
                document.getElementById('score').textContent = `Score: ${score}`;

                console.log('Level up: contract=', contract, 'walletAddress=', walletAddress);
                if (contract && walletAddress) {
                    try {
                        console.log('Sending request to smart contract: updatePlayer', { score, level, from: walletAddress });
                        const result = await contract.methods.updatePlayer(score, level).send({ from: walletAddress });
                        console.log('Leaderboard updated in smart contract:', result);
                        showNotification('Player data updated on blockchain', 'success');
                        await updateLeaderboard();
                    } catch (error) {
                        console.error('Smart contract update error:', error);
                        showNotification('Error updating data in blockchain', 'error');
                    }
                } else {
                    console.log('Smart contract request failed: contract or walletAddress missing');
                    showNotification('Failed to update data: wallet or contract not connected', 'error');
                }
            }
        });
    });

    // Connect wallet via MetaMask
    const connectWalletButton = document.getElementById('connect-wallet');
    if (connectWalletButton) {
        connectWalletButton.addEventListener('click', async () => {
            console.log('Click on the Connect Wallet button!');
            if (isMetaMaskProvider()) {
                try {
                    await switchToHemiNetwork();
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    walletAddress = accounts[0];
                    playerName = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
                    document.getElementById('wallet').textContent = `Wallet: ${playerName}`;
                    console.log('Wallet connected:', walletAddress);
                    showNotification('Wallet successfully connected', 'success');
                    await initContract();
                    await updateLeaderboard();
                    document.getElementById('mint-nft').disabled = false;
                } catch (error) {
                    console.error('Wallet connection error:', error);
                    showNotification('Wallet connection error. Check MetaMask.', 'error');
                }
            } else {
                console.log('MetaMask is not installed');
                showNotification('Install MetaMask to connect your wallet!', 'error');
            }
        });
    }

    // Update leaderboard
    async function updateLeaderboard() {
        if (contract) {
            try {
                console.log('Leaderboard update...');
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
                    console.log('Leaderboard updated:', leaderboardData);
                    showNotification('Leaderboard successfully updated', 'success');
                }
            } catch (error) {
                console.error('Error loading leaderboard:', error);
                showNotification('Error loading leaderboard', 'error');
            }
        } else {
            console.log('Leaderboard not updated: contract not initialized');
            showNotification('Leaderboard not updated: contract not connected', 'error');
        }
    }

    // Refresh leaderboard on button click
    const refreshLeaderboardButton = document.getElementById('refresh-leaderboard');
    if (refreshLeaderboardButton) {
        refreshLeaderboardButton.addEventListener('click', updateLeaderboard);
    }

    // Handle "Start Game" button
    const startGameButton = document.getElementById('start-game');
    if (startGameButton) {
        startGameButton.addEventListener('click', () => {
            document.getElementById('menu').style.display = 'none';
            // Show ducks
            document.querySelectorAll('.duck').forEach(duck => {
                duck.style.display = 'block';
            });
            gameStarted = true;
        });
    }

    // Handle "How to Play" button
    const howToPlayButton = document.getElementById('how-to-play');
    const instructionsModal = document.getElementById('instructions-modal');
    const closeInstructions = document.getElementById('close-instructions');
    if (howToPlayButton) {
        howToPlayButton.addEventListener('click', () => {
            instructionsModal.style.display = 'flex';
        });
    }
    if (closeInstructions) {
        closeInstructions.addEventListener('click', () => {
            instructionsModal.style.display = 'none';
        });
    }

    // Handle "Mint NFT" button
    const mintNFTButton = document.getElementById('mint-nft');
    if (mintNFTButton) {
        mintNFTButton.addEventListener('click', async () => {
            if (!walletAddress || !contract) {
                showNotification('Please connect your wallet first', 'error');
                return;
            }

            try {
                const playerData = await contract.methods.getPlayer(walletAddress).call();
                const currentLevel = playerData.level;
                if (currentLevel < 1 || currentLevel > 5) {
                    showNotification('Invalid level to mint NFT', 'error');
                    return;
                }

                console.log('Minting NFT for level:', currentLevel);
                const result = await contract.methods.mintLevelNFT(currentLevel).send({ from: walletAddress });
                console.log('NFT minted:', result);
                showNotification(`NFT for level ${currentLevel} successfully minted!`, 'success');
            } catch (error) {
                console.error('Error minting NFT:', error);
                showNotification('Error minting NFT. Check MetaMask.', 'error');
            }
        });
    }
});
