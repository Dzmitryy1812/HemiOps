document.addEventListener('DOMContentLoaded', async () => {
    console.log('Page loaded:', new Date().toISOString());
    let score = 0;
    let level = 1;
    let walletAddress = null;
    let playerName = 'Player 1';
    let contract = null;
    let gameStarted = false;

    const POINTS_TO_LEVEL_UP = {
        1: 100,
        2: 150,
        3: 200,
        4: 250,
        5: 300
    };

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
    const contractAddress = '0x6892735450a27F206ADf4f969dFD29e6d3d7199F';
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
        },
        {
            "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
            "name": "tokenURI",
            "outputs": [{"internalType": "string", "name": "", "type": "string"}],
            "stateMutability": "view",
            "type": "function"
        }
    ];

    function showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.className = type;
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 5000);
    }

    function isMetaMaskProvider() {
        return window.ethereum && window.ethereum.isMetaMask;
    }

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
                        document.getElementById('connect-wallet').textContent = 'Disconnect';
                    } else {
                        walletAddress = null;
                        document.getElementById('wallet').textContent = `Wallet: Not connected`;
                        console.log('Wallet disconnected');
                        showNotification('Wallet disconnected', 'info');
                        document.getElementById('mint-nft').disabled = true;
                        document.getElementById('connect-wallet').textContent = 'Connect Wallet';
                        contract = null;
                        clearLeaderboard();
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

    document.querySelectorAll('.duck img').forEach(img => {
        img.addEventListener('error', () => {
            console.error('Failed to load image:', img.src);
            showNotification('Failed to load duck image', 'error');
        });
        img.addEventListener('load', () => {
            console.log('Image loaded:', img.src);
        });
    });

    const ducks = document.querySelectorAll('.duck a');
    console.log('Ducks found:', ducks.length);

    function resetDucks() {
        document.querySelectorAll('.duck').forEach(duck => {
            duck.classList.remove('hidden');
            duck.style.display = 'block';
            console.log('Duck reset:', duck.id, 'Display:', getComputedStyle(duck).display);
        });
    }

    ducks.forEach(duck => {
        let hideTimeout;
        duck.addEventListener('click', async (event) => {
            event.preventDefault();
            if (!gameStarted) {
                console.log('Game not started, ignoring click');
                return;
            }
            const targetDuck = event.currentTarget.parentElement;
            console.log('Duck clicked:', targetDuck.id);
            const isGolden = targetDuck.id === 'duck5';
            const points = isGolden ? 50 : 10;
            score += points;
            document.getElementById('score').textContent = `Score: ${score}`;
            clearTimeout(hideTimeout);
            targetDuck.classList.add('hidden');
            console.log('Hidden class added:', targetDuck.classList.contains('hidden'), 
                        'Display:', getComputedStyle(targetDuck).display);
            hideTimeout = setTimeout(() => {
                targetDuck.classList.remove('hidden');
                targetDuck.style.display = 'block';
                console.log('Hidden class removed:', targetDuck.id, 
                            'Display:', getComputedStyle(targetDuck).display);
            }, 2000);

            const pointsToLevelUp = POINTS_TO_LEVEL_UP[level];
            if (score >= pointsToLevelUp) {
                level++;
                if (level > 5) level = 1;
                document.getElementById('level').textContent = `Level: ${level}`;
                document.body.className = `level-${level}`;
                score = 0;
                document.getElementById('score').textContent = `Score: ${score}`;
                resetDucks();
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

    const connectWalletButton = document.getElementById('connect-wallet');
    if (connectWalletButton) {
        connectWalletButton.addEventListener('click', async () => {
            if (!walletAddress) {
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
                        document.getElementById('connect-wallet').textContent = 'Disconnect';
                        document.getElementById('mint-nft').disabled = false;
                        await initContract();
                        await updateLeaderboard();
                    } catch (error) {
                        console.error('Wallet connection error:', error);
                        showNotification('Wallet connection error. Check MetaMask.', 'error');
                    }
                } else {
                    console.log('MetaMask is not installed');
                    showNotification('Install MetaMask to connect your wallet!', 'error');
                }
            } else {
                walletAddress = null;
                contract = null;
                document.getElementById('wallet').textContent = 'Wallet: Not connected';
                document.getElementById('connect-wallet').textContent = 'Connect Wallet';
                document.getElementById('mint-nft').disabled = true;
                clearLeaderboard();
                showNotification('Wallet disconnected. To fully disconnect, also disconnect in MetaMask.', 'info');
                console.log('Wallet disconnected');
            }
        });
    }

    function clearLeaderboard() {
        const tbody = document.querySelector('#leaderboard tbody');
        if (tbody) {
            tbody.innerHTML = '';
            console.log('Leaderboard cleared');
        }
    }

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

    const refreshLeaderboardButton = document.getElementById('refresh-leaderboard');
    if (refreshLeaderboardButton) {
        refreshLeaderboardButton.addEventListener('click', updateLeaderboard);
    }

    const startGameButton = document.getElementById('start-game');
    if (startGameButton) {
        startGameButton.addEventListener('click', () => {
            console.log('Starting game...');
            document.getElementById('menu').style.display = 'none';
            resetDucks();
            gameStarted = true;
        });
    }

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

    async function displayNFT(tokenId) {
        try {
            const tokenURI = await contract.methods.tokenURI(tokenId).call();
            console.log('Token URI:', tokenURI);
            const response = await fetch(tokenURI);
            const metadata = await response.json();
            console.log('NFT metadata:', metadata);
            const nftContainer = document.getElementById('nft-container');
            if (!nftContainer) {
                const newContainer = document.createElement('div');
                newContainer.id = 'nft-container';
                newContainer.style.position = 'absolute';
                newContainer.style.bottom = '10px';
                newContainer.style.right = '10px';
                newContainer.style.zIndex = '30';
                document.body.appendChild(newContainer);
            }
            const img = document.createElement('img');
            img.src = metadata.image;
            img.alt = metadata.name;
            img.style.maxWidth = '100px';
            img.style.margin = '5px';
            img.onerror = () => {
                console.error('Failed to load NFT image:', metadata.image);
                showNotification('Failed to load NFT image', 'error');
            };
            document.getElementById('nft-container').appendChild(img);
            showNotification(`NFT ${metadata.name} displayed!`, 'success');
        } catch (error) {
            console.error('Error displaying NFT:', error);
            showNotification('Error displaying NFT', 'error');
        }
    }

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
                
                // Извлекаем tokenId из событий транзакции
                const tokenId = result.events.NFTMinted.returnValues.tokenId;
                await displayNFT(tokenId);
            } catch (error) {
                console.error('Error minting NFT:', error);
                showNotification('Error minting NFT. Check MetaMask.', 'error');
            }
        });
    }
});
