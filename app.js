const fs = require('fs');
const solc = require('solc');
const Web3 = require('web3');
const http = require('http');

// Connect to local Ethereum node
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

var ownerAccount;
var gas, gasPrice;

var deployContract = function (path, contractname, callback){
	let code = fs.readFileSync(path).toString();

	let output = solc.compile(code, 1);
	
	let bytecode = output.contracts[':' + contractname].bytecode;
	let abi = output.contracts[':' + contractname].interface;

	let Contract = new web3.eth.Contract(JSON.parse(abi), ownerAccount);
	let contractInstance;

	Contract.deploy({
		data : '0x' + bytecode,
		arguments : []
	})
	.send({
		from : ownerAccount,
		gas : gas,
		gasPrice : gasPrice
	})
	.on('error', function(error) {
		return callback(error);
	})
	.then(function(contractInstance) {
		return callback(null, contractInstance.options.address, abi);
	});
}

// Compile the source code
web3.eth.getAccounts(function (err, accounts) {

	if (err) {
		throw err;
	}

	ownerAccount = accounts[1];
	gas = 1000000;
	gasPrice = '30000000000000';

	web3.eth.getBalance(ownerAccount)
	.then(console.log);
	
	deployContract('./contracts/rspbattle.sol', 'RSPBattle', function (err, address, abi) {
		const server = http.createServer(function (req, res) {
			res.writeHead(200);

			let fileContents = '';

			try {
				fileContents = fs.readFileSync(__dirname + req.url, 'utf8');
			} catch (e) {
				fileContents = fs.readFileSync(__dirname + '/static/index.html', 'utf8');
			}

			
			res.end(
				fileContents.replace(
                       	                /REPLACE_WITH_CONTRACT_ADDRESS/g,
                               	        address
                              		).replace(
                               	        /REPLACE_WITH_ABI_DEFINITION/g,
                                       	abi
                               ));
		});	

		server.on('clientError', function (err, socket) {
		socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
		});

		server.listen(8000, function () {
			console.log('Listening on localhost:8000');
		});
	});
});


