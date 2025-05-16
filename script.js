let score = 0;
let walletAddress = "Not connected";
const leaderboard = [];
const contractAddress = "YOUR_CONTRACT_ADDRESS"; // Замени на адрес контракта
const abi = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_score",
                "type": "uint256"
            }
        ],
        "name": "setScore",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getLeaderboard",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "",
                "type": "address[]"
            },
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getPlayerCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "player",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "score",
                "type": "uint256"
            }
        ],
        "name": "ScoreUpdated",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "scores",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "players",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

let provider, signer, contract;

const connectButton = document.getElementById("connect-wallet");
const walletDisplay = document.getElementById("wallet-address");
const scoreDisplay = document.getElementById("score");
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

      // Инициализация контракта
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
      contract = new ethers.Contract(contractAddress, abi, signer);

      // Добавляем игрока в лидерборд локально
      leaderboard.push({ address: walletAddress, score: 0 });
      await getLeaderboardFromChain();
    } catch (error) {
      console.error("Ошибка подключения:", error);
      walletDisplay.textContent = "Ошибка подключения";
    }
  } else {
    walletDisplay.textContent = "MetaMask не установлен";
  }
});

// Подсчёт очков и запись в блокчейн
document.querySelectorAll(".duck").forEach(duck => {
  duck.addEventListener("click", async () => {
    score++;
    scoreDisplay.textContent = `Score: ${score}`;
    if (walletAddress !== "Not connected" && contract) {
      try {
        const tx = await contract.setScore(score);
        await tx.wait(); // Ждём подтверждения транзакции
        const player = leaderboard.find(p => p.address === walletAddress);
        if (player) player.score = score;
        await getLeaderboardFromChain();
      } catch (error) {
        console.error("Ошибка записи очков:", error);
      }
    }
  });
});

// Получение лидерборда с блокчейна
async function getLeaderboardFromChain() {
  if (contract) {
    try {
      const [players, scores] = await contract.getLeaderboard();
      leaderboard.length = 0;
      for (let i = 0; i < players.length; i++) {
        leaderboard.push({
          address: players[i].slice(0, 6) + "..." + players[i].slice(-4),
          score: Number(scores[i])
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
  leaderboard.sort((a, b) => b.score - a.score);
  const rows = leaderboard.map(player => `
    <tr>
      <td>${player.address}</td>
      <td>${player.score}</td>
    </tr>
  `).join("");
  leaderboardTable.innerHTML = `
    <tr><th>Игрок</th><th>Очки</th></tr>
    ${rows}
  `;
}

// Проверка сети
async function checkNetwork() {
  if (typeof window.ethereum !== "undefined") {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    // Замени на Chain ID Hemi Testnet или Mumbai (0x13881)
    const targetChainId = "0xYOUR_HEMI_CHAIN_ID";
    if (chainId !== targetChainId) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: targetChainId }],
        });
      } catch (error) {
        console.error("Ошибка переключения сети:", error);
        walletDisplay.textContent = "Ошибка сети";
      }
    }
  }
}
checkNetwork();
