HemiOps: Web3 Game on the Hemi Blockchain
 
HemiOps is a browser-based game integrated with the Hemi blockchain, showcasing Web3 technologies combined with engaging gameplay. Players earn points by clicking on moving targets, and their progress is recorded in a decentralized leaderboard via a smart contract. Built as a Web3 builder, HemiOps demonstrates skills in developing decentralized applications (dApps), integrating with MetaMask, and creating an interactive user interface.
Project Overview
HemiOps blends simple gameplay with Web3 functionality:

Gameplay: Players click on moving targets (regular and golden) to earn points. Upon reaching 100 points, the level increases, and data is recorded on the blockchain.
Interface:
Wallet status ("Wallet: Not connected" or player address).
Current score ("Score: 0" and above).
Player level ("Level: 1" up to 5).
Leaderboard displaying: player address, points, level, and last update time.


Hemi Blockchain: The leaderboard is stored in a smart contract (address: 0xa523082CfaC400c6913E71A54365E7aBda30fE75) on the Hemi network (Chain ID: 0xa7cf / 43111, RPC: https://rpc.hemi.network/rpc).
MetaMask: Wallet connection with automatic switching to the Hemi network.
Responsiveness: Interface optimized for desktop and mobile devices.

The game is live at: https://hemiops.netlify.app/.
Creation Process
HemiOps was developed from scratch to showcase Web3 builder skills, including frontend development, blockchain integration, and security. Key stages:

Game Mechanics Design:

Implemented a target system (target1.png–target5.png for regular, target_golden.png for golden) with CSS animations for movement and a "floating" effect.
Point system: +10 for regular targets, +50 for golden. At 100 points, the level increases (1–5), background changes, and points reset.
Targets hide for 2 seconds after being clicked, adding dynamism.


Hemi Blockchain Integration:

Used Web3.js (v1.8.0) to interact with the smart contract.
Implemented functions: updating player data (updatePlayer), retrieving leaderboard (getLeaderboard).
Configured Hemi network (Chain ID: 0xa7cf, RPC: https://rpc.hemi.network/rpc).


MetaMask Integration:

Wallet connection via eth_requestAccounts.
Automatic switching to Hemi network, adding it if absent (wallet_addEthereumChain).


Interface and UX:

Developed HTML/CSS interface displaying wallet, score, level, and leaderboard.
Added CSS animations for targets and responsive design for mobile devices.
Implemented a notification system for feedback (successes, errors).


Hosting:

Deployed on Netlify for public access: https://hemiops.netlify.app/.



What Was Done
To ensure quality and reliability, the following improvements were implemented:

Automatic Network Switching: The switchToHemiNetwork function checks the current network and switches to Hemi, adding it if needed.
Notification System: Visual messages via <div id="notification"> inform about wallet connection, network switching, leaderboard updates, and errors.
Web3.js Version Check: Dynamic loading of Web3.js from CDN with compatibility verification (1.x).
Security: Verification that window.ethereum belongs to MetaMask (isMetaMaskProvider) prevents untrusted providers.
Fixes:
Updated image paths (target1.png–target5.png, target_golden.png).
Fixed typo in smart contract ABI (inputs dne → inputs).
Updated RPC URL to the correct one: https://rpc.hemi.network/rpc.



Smart Contract
The leaderboard is powered by a Solidity smart contract deployed on the Hemi blockchain. The contract manages player data, updates scores, and provides a sorted leaderboard. Below is the full code:
pragma solidity ^0.8.0;

contract Leaderboard {
    struct Player {
        address playerAddress;
        uint256 score;
        uint256 level;
        uint256 lastUpdated;
    }

    mapping(address => Player) public players;
    address[] public playerAddresses;

    event PlayerUpdated(address indexed playerAddress, uint256 score, uint256 level);

    // Update or add a player to the leaderboard
    function updatePlayer(uint256 _score, uint256 _level) public {
        require(_score <= 100, "Score cannot exceed 100"); // Limit to protect against invalid data
        require(_level <= 5, "Level cannot exceed 5");

        if (players[msg.sender].playerAddress == address(0)) {
            playerAddresses.push(msg.sender);
        }
        players[msg.sender] = Player(msg.sender, _score, _level, block.timestamp);
        emit PlayerUpdated(msg.sender, _score, _level);
    }

    // Retrieve data for a specific player
    function getPlayer(address _player) public view returns (Player memory) {
        return players[_player];
    }

    // Retrieve a sorted leaderboard (descending by score, limited to 10 players)
    function getLeaderboard() public view returns (Player[] memory) {
        uint256 limit = playerAddresses.length > 10 ? 10 : playerAddresses.length;
        Player[] memory result = new Player[](playerAddresses.length);
        
        // Copy all players
        for (uint256 i = 0; i < playerAddresses.length; i++) {
            result[i] = players[playerAddresses[i]];
        }

        // Sort by descending score (bubble sort for simplicity)
        for (uint256 i = 0; i < result.length; i++) {
            for (uint256 j = 0; j < result.length - i - 1; j++) {
                if (result[j].score < result[j + 1].score) {
                    Player memory temp = result[j];
                    result[j] = result[j + 1];
                    result[j + 1] = temp;
                }
            }
        }

        // Return only the top 10 players
        Player[] memory topPlayers = new Player[](limit);
        for (uint256 i = 0; i < limit; i++) {
            topPlayers[i] = result[i];
        }
        return topPlayers;
    }

    // Get the total number of players
    function getPlayerCount() public view returns (uint256) {
        return playerAddresses.length;
    }
}

The contract is deployed at 0xa523082CfaC400c6913E71A54365E7aBda30fE75 on the Hemi network.
Technologies

Frontend: HTML5, CSS3, JavaScript (ES6+)
Blockchain: Web3.js (v1.8.0), Hemi network (Chain ID: 0xa7cf, RPC: https://rpc.hemi.network/rpc)
Wallet: MetaMask
Styling: CSS animations, responsive layout
Hosting: Netlify


Potential Improvements

Leaderboard caching to reduce RPC load.
Adding fallback RPC URLs for increased reliability.
Local Web3.js copy to eliminate CDN dependency.
Adding sound effects and more animations to enhance UX.

License
MIT License. See the LICENSE file (if included).
Contact

GitHub: your-username
Email: your-email@example.com
Website: https://hemiops.netlify.app/


Built as a Web3 builder to demonstrate skills in developing decentralized applications.
