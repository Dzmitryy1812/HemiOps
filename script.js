let score = 0;
let walletAddress = "Not connected";
const leaderboard = []; // Локальный лидерборд

// Подключение MetaMask
const connectButton = document.getElementById("connect-wallet");
const walletDisplay = document.getElementById("wallet-address");
const scoreDisplay = document.getElementById("score");
const leaderboardTable = document.querySelector("#leaderboard table");

connectButton.addEventListener("click", async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      walletAddress = accounts[0].slice(0, 6) + "..." + accounts[0].slice(-4);
      walletDisplay.textContent = `Wallet: ${walletAddress}`;
      connectButton.textContent = "Connected";
      connectButton.disabled = true;
      // Добавляем игрока в лидерборд
      leaderboard.push({ address: walletAddress, score: 0 });
      updateLeaderboard();
    } catch (error) {
      console.error("Ошибка подключения:", error);
      walletDisplay.textContent = "Ошибка подключения";
    }
  } else {
    walletDisplay.textContent = "MetaMask не установлен";
  }
});

// Подсчёт очков
document.querySelectorAll(".duck").forEach(duck => {
  duck.addEventListener("click", () => {
    score++;
    scoreDisplay.textContent = `Score: ${score}`;
    // Обновляем лидерборд
    if (walletAddress !== "Not connected") {
      const player = leaderboard.find(p => p.address === walletAddress);
      if (player) player.score = score;
      updateLeaderboard();
    }
  });
});

// Обновление лидерборда
function updateLeaderboard() {
  // Сортируем по убыванию очков
  leaderboard.sort((a, b) => b.score - a.score);
  // Обновляем таблицу
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

// Проверка сети (например, Hemi или Polygon Mumbai)
async function checkNetwork() {
  if (typeof window.ethereum !== "undefined") {
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    // Hemi Testnet Chain ID (пример, уточни ID для Hemi)
    if (chainId !== "0xYOUR_HEMI_CHAIN_ID") {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xYOUR_HEMI_CHAIN_ID" }],
        });
      } catch (error) {
        console.error("Ошибка переключения сети:", error);
      }
    }
  }
}
checkNetwork();
