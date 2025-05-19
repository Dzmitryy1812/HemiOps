let score = 0;
let walletAddress = "Not connected";
let currentLevel = 1;
const leaderboard = [];
const contractAddress = "0x715045cea81d1DcC604b6A379B94D6049CDaa5a0"; // Твой текущий адрес контракта
const abi = [
    {
        "inputs": [
            {"internalType": "uint256", "name": "_score", "type": "uint256"},
            {"internalType": "uint256", "name": "_level", "type": "uint256"}
        ],
        "name": "setScoreAndLevel",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getLeaderboard",
        "outputs": [
            {"internalType": "address[]", "name": "", "type": "address[]"},
            {"internalType": "uint256[]", "name": "", "type": "uint256[]"},
            {"internalType": "uint256[]", "name": "", "type": "uint256[]"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getPlayerCount",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "player", "type": "address"},
            {"internalType": "uint256", "name": "score", "type": "uint256"}
        ],
        "name": "ScoreUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {"indexed": true, "internalType": "address", "name": "player", "type": "address"},
            {"internalType": "uint256", "name": "level", "type": "uint256"}
        ],
        "name": "LevelUpdated",
        "type": "event"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "", "type": "address"}
        ],
        "name": "scores",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address", "name": "", "type": "address"}
        ],
        "name": "levels",
        "outputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "uint256", "name": "", "type": "uint256"}
        ],
        "name": "players",
        "outputs": [
            {"internalType": "address", "name": "", "type": "address"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

let provider, signer, contract;

const connectButton = document.getElementById("connect-wallet");
const walletDisplay = document.getElementById("wallet-address");
const scoreDisplay = document.getElementById("score");
const levelDisplay = document.createElement("p");
levelDisplay.id = "level";
levelDisplay.textContent = `Level: ${currentLevel}`;
document.getElementById("game-info").appendChild(levelDisplay);
const leaderboardTable = document.querySelector("#leaderboard table");

// Подключение MetaMask
connectButton.addEventListener("click", async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      walletAddress = accounts[0].slice(0, 6) + "..." + accounts[0].slice(-4);
      walletDisplay.textContent = `Wallet: ${walletAddress}`;
      connectButton.textContent = "Connected";
      connectButton.disabled = true;

      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
      contract = new ethers.Contract(contractAddress, abi, signer);

      console.log("Contract initialized:", contractAddress);
      leaderboard.push({ address: walletAddress, score: 0, level: 1 });
      await getLeaderboardFromChain();
    } catch (error) {
      console.error("Ошибка подключения:", error);
      walletDisplay.textContent = "Ошибка подключения";
    }
  } else {
    walletDisplay.textContent = "MetaMask не установлен";
  }
});

// Проверка и переключение сети
async function checkNetwork() {
  if (typeof window.ethereum !== "undefined") {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    const targetChainId = "0xa2f7"; // Chain ID 43111 в hex
    if (chainId !== targetChainId) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0xa2f7",
              chainName: "Hemi",
              rpcUrls: ["https://rpc.hemi.network/rpc"],
              nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18
              },
              blockExplorerUrls: ["https://explorer.hemi.xyz"]
            }
          ]
        });
      } catch (error) {
        console.error("Ошибка добавления/переключения сети:", error);
        walletDisplay.textContent = "Ошибка сети";
      }
    }
  }
}
checkNetwork();

// Подсчёт очков и запись в блокчейн
document.querySelectorAll(".duck").forEach(duck => {
  duck.addEventListener("click", async () => {
    duck.classList.add("hidden");
    score += currentLevel;
    scoreDisplay.textContent = `Score: ${score}`;
    if (walletAddress !== "Not connected" && contract) {
      try {
        console.log("Sending score and level to contract:", score, currentLevel);
        const tx = await contract.setScoreAndLevel(score, currentLevel);
        console.log("Transaction sent:", tx.hash);
        await tx.wait();
        console.log("Transaction confirmed");
        const player = leaderboard.find(p => p.address === walletAddress);
        if (player) {
          player.score = score;
          player.level = currentLevel;
        }
        await getLeaderboardFromChain();
      } catch (error) {
        console.error("Ошибка записи очков и уровня:", error);
      }
    }
    setTimeout(() => {
      duck.classList.remove("hidden");
      duck.style.animation = "none";
      setTimeout(() => {
        duck.style.animation = "";
      }, 10);
    }, 2000);
    checkLevelUp();
    resetInactivityTimer();
  });
});

// Получение лидерборда
async function getLeaderboardFromChain() {
  if (contract) {
    try {
      const [players, scores, levels] = await contract.getLeaderboard();
      console.log("Leaderboard fetched:", players, scores, levels);
      leaderboard.length = 0;
      for (let i = 0; i < players.length; i++) {
        leaderboard.push({
          address: players[i].slice(0, 6) + "..." + players[i].slice(-4),
          score: Number(scores[i]),
          level: Number(levels[i])
        });
      }
      updateLeaderboard();
    } catch (error) {
      console.error("Ошибка получения лидерборда:", error);
    }
  }
}

// Обновление лидерборда
function updateLeaderboard() {
  leaderboard.sort((a, b) => b.score - a.score || b.level - a.level);
  const topPlayers = leaderboard.slice(0, 5);
  const rows = topPlayers.map(player => `
    <tr style="${player.address === walletAddress ? 'background: rgba(255, 215, 0, 0.3);' : ''}">
      <td>${player.address}</td>
      <td>${player.score}</td>
      <td>${player.level || 1}</td>
    </tr>
  `).join("");
  leaderboardTable.innerHTML = `
    <tr><th>Игрок</th><th>Очки</th><th>Уровень</th></tr>
    ${rows}
  `;
}

// Проверка повышения уровня
function checkLevelUp() {
  const levelThresholds = [10, 30, 60, 100];
  for (let i = 0; i < levelThresholds.length; i++) {
    if (score >= levelThresholds[i] && currentLevel <= i + 1) {
      currentLevel = i + 2;
      levelDisplay.textContent = `Level: ${currentLevel}`;
      updateGameDifficulty();
      break;
    }
  }
}

// Обновление сложности игры
function updateGameDifficulty() {
  document.querySelectorAll(".duck").forEach(duck => {
    const baseSpeed = 8 - (currentLevel - 1) * 1.5;
    const floatSpeed = 1.6 - (currentLevel - 1) * 0.2;
    duck.style.animation = `fly ${baseSpeed}s linear infinite`;
    const duckId = duck.id;
    duck.querySelector("a").style.animation = `float ${floatSpeed}s infinite cubic-bezier(.58,.14,.46,.92)`;
  });
}

// Таймер бездействия
let inactivityTimer;
function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    if (currentLevel > 1) {
      currentLevel = 1;
      levelDisplay.textContent = `Level: ${currentLevel}`;
      updateGameDifficulty();
      alert("Вы бездействовали слишком долго! Уровень сброшен.");
    }
  }, 10000);
}
resetInactivityTimer();
