var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

var contractInstance = new web3.eth.Contract(ABI_DEFINITION, CONTRACT_ADDRESS); 
var accounts;
var selectedAccount = 0;
var targetAccount = 0;
var toggleAccount = true;

var games;


function startRspGame() {
		contractInstance.methods.startGame(accounts[targetAccount]).send({from: accounts[selectedAccount], gas:1000000})
		.then(console.log);
}

function getGameState(gameId) {
	contractInstance.methods.getGameState(gameId).call({from: accounts[selectedAccount]})
	.then(function(gameState) {
		console.log(gameState);
	});
	
}

function getWinner(gameId, cb){
	contractInstance.methods.getWinner(gameId).call({from: accounts[selectedAccount]})
	.then(function(address){
		console.log(address);
		cb(address, gameId);
	});
}

function getGameInfo() {
	contractInstance.methods.games(i).send({from: accounts[selectedAccount]})
	.then(console.log);
}

function beats(gameId, type) {
	contractInstance.methods.beats(gameId, type).send({
			from: accounts[selectedAccount]})
	.then(console.log);
}

function getPlayingGames(){
	$('#games-list').empty();
	contractInstance.methods.getPlayingGames(accounts[selectedAccount]).call({from:accounts[selectedAccount]})
	.then(function(games) {
		console.log(games);
		for(let i = 0; i < games.length; i++) {
			(function(){
				let gameId = games[i];
				$('#games-list').append(
				`<div class="item" id="game_${gameId}">
				    <i class="large chess rock middle aligned icon"></i>
				    <div class="content">
				      <a class="header" >id : ${gameId}</a>
				      <div class="description" id="state_${gameId}"></div>
				    </div>
				  </div>`
				);
				console.log(gameId);
			 	getWinner(gameId, function(result, game_id){
					console.log(game_id);
					console.log(gameId);
					let isFinished = result[0];
					let winner = result[1];
					$('#state_' + game_id).empty();
					if(!isFinished){
						state = 'playing';
						$('#game_' + game_id).append(`
							<button class="ui icon button" onclick="beats(${game_id}, 1)">
							  <i class="hand rock outline icon"></i>
							</button>
							<button class="ui icon button" onclick="beats(${game_id}, 3)">
							  <i class="hand scissors outline icon"></i>
							</button>
							<button class="ui icon button" onclick="beats(${game_id}, 2)">
							  <i class="hand paper outline icon"></i>
							</button>
						`);
					} else if (winner === '0x0000000000000000000000000000000000000000'){
						state = 'draw';
					} else if (winner === accounts[selectedAccount]){
						state = 'win';	
					} else {
						state = 'lose';	
					}
	
					$('#state_' + gameId).append(state);
				});

			})();
		}
			
	});
}

function displaySeletedAddress() {
	$('#selected-value').empty();
	$('#selected-label').empty();
	$('#selected-value').append(`my Account`);
	$('#selected-label').append(`${accounts[selectedAccount]}`);

	$('#target-value').empty();
	$('#target-label').empty();
	$('#target-value').append(`other Account`);
	$('#target-label').append(`${accounts[targetAccount]}`)
}

$(document).ready(function() {
	web3.eth.getAccounts(function (err, _accounts) {
		if (err) throw err;

		accounts = _accounts;
		for(let i = 0; i < _accounts.length; i++){
			(function(){
			let account = _accounts[i];


			$("#accounts-list").append(
			`<div class="item">
			    <i class="large address card outline middle aligned icon"></i>
			    <div class="content">
			      <a class="header" id="account_${i}">${account}</a>
			      <div class="description" >address : ${i}</div>
			    </div>
			  </div>`
			);
		

			$("#account_" + i).click(function() {
				console.log(i);
				if(toggleAccount) {
					selectedAccount = i;
					getPlayingGames();
				}
				else{
					targetAccount = i;
				}
				displaySeletedAddress();
			})
			})();
		}

		$('#toggle-account').click(function(){
			toggleAccount= !toggleAccount;	
		});

		selectedAccount = 0;
		displaySeletedAddress();

	});

	$("#start-game").click(function() {
		startRspGame();	
	});


});












