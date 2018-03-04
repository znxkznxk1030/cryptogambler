const fs = require('fs');
const solc = require('solc');
const Web3 = require('web3');
const http = require('http');

// Connect to local Ethereum node
const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

// Compile the source code
web3.eth.getAccounts(function (err, accounts) {

	if (err) {console.log(err); return ;}

	console.log(accounts);

	let ownAccount = accounts[2];
	let defaultAccount = web3.eth.defaultAccount;

	web3.eth.getBalance(ownAccount)
	.then(console.log);

	let input = fs.readFileSync('./contracts/rspbattle.sol');
	let output = solc.compile(input.toString(), 1);


	let bytecode = output.contracts[':RSPBattle'].bytecode;
	let abi = output.contracts[':RSPBattle'].interface;
	let Contract = new web3.eth.Contract(JSON.parse(abi), ownAccount);

	let deployedContract = null;

	Contract.deploy({
		data:'0x' + bytecode,
		arguments: []
	})
	.send({
	   	from: ownAccount,
		gas: 1000000,
		gasPrice: '30000000000000',
   	})
	.on('error', function (error) {
                console.log(error);
        })
        .on('transactionHash', function (transaction) {
                console.log('transactionHash : ' + transaction);
        })
        .on('confirmation', function (number, receipt) {
                console.log('number : ' + number + '\nreceipt : ' + receipt);
        })
   	.then(function (ContractInstance) {
		console.log('hello!');
		deployedContract = ContractInstance;

   	})
	.then(function () {
		const server = http.createServer(function (req, res) {
			res.writeHead(200);

			let fileContents = '';

			try {
				fileContents = fs.readFileSync(__dirname + req.url, 'utf8');
			} catch (e) {
				fileContents = fs.readFileSync(__dirname + '/static/rsp.html', 'utf8');
			}

			
			res.end(
				fileContents.replace(
                       	                /REPLACE_WITH_CONTRACT_ADDRESS/g,
                               	        deployedContract.options.address
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
	})
	.catch(function (error) {
	});
});


