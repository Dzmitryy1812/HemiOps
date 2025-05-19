<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Стреляй по HEMI!</title>
  <link rel="stylesheet" href="style.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/ethers/6.13.2/ethers.umd.min.js"></script>
</head>
<body>
  <h2>Стреляй по HEMI!</h2>
  <div id="game-info">
    <button id="connect-wallet">Connect Wallet</button>
    <p id="wallet-address">Wallet: Not connected</p>
    <p id="score">Score: 0</p>
    <p id="level">Level: 1</p>
    <button id="refresh-leaderboard">Обновить</button>
    <div id="leaderboard">
      <h3>Лидерборд</h3>
      <table>
        <tr><th>Игрок</th><th>Очки</th><th>Уровень</th></tr>
      </table>
    </div>
  </div>
  <div class="range">
    <div class="duck" id="duck1"><a href="#duck1"><img src="target1.png" alt="Target 1"></a></div>
    <div class="duck" id="duck2"><a href="#duck2"><img src="target2.png" alt="Target 2"></a></div>
    <div class="duck" id="duck3"><a href="#duck3"><img src="target3.png" alt="Target 3"></a></div>
    <div class="duck" id="duck4"><a href="#duck4"><img src="target4.png" alt="Target 4"></a></div>
    <div class="duck" id="duck5"><a href="#duck5"><img src="target5.png" alt="Target 5"></a></div>
  </div>
  <script src="script.js"></script>
</body>
</html>'n
