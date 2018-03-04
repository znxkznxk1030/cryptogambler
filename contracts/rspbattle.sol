pragma solidity ^0.4.19;

contract RSPBattle {
    
    uint8 constant NULL = 0;
    uint8 constant ROCK = 1;
    uint8 constant PAPER = 2;
    uint8 constant SCISSORS = 3;
    
    event NewGame(uint gameId, address challenger, address opposite);
    
    struct Game {
        address challenger;
        address opposite;
        uint8[] rsptypes;
        bool isFinished;
    }
    
    Game[] public games;
    mapping (uint => address) winner;
    mapping (address => uint) playingGameCount;
    
    modifier isNotMe (address _address) {
        require(_address != msg.sender);
        _;
    }
    
    modifier validGame (uint gameId) {
        require(0 <= gameId && gameId < games.length);
        _;
    }
    
    function startGame(address _opposite) public isNotMe(_opposite) returns (uint8 []) {
        uint id = games.push(Game(msg.sender, _opposite, new uint8[](2), false)) - 1;
        NewGame(id, msg.sender, _opposite);
        playingGameCount[msg.sender]++;
        playingGameCount[_opposite]++;
        return (games[id].rsptypes);
    }
    
    function beats(uint gameId, uint8 rsptype) public validGame(gameId){
        Game storage game = games[gameId];
        require(!game.isFinished);
        require(0 < rsptype && rsptype <= 3);
        
        if (game.challenger == msg.sender && game.rsptypes[0] == NULL) {
            game.rsptypes[0] = rsptype;
        } else if (game.opposite == msg.sender && game.rsptypes[1] == NULL) {
            game.rsptypes[1] = rsptype;
        } else {
            return;
        }
        
        setGameResult(gameId);
        
    }
    
    function setGameResult(uint gameId) internal validGame(gameId) returns (bool) {
        Game storage game = games[gameId];
        if(game.isFinished || game.rsptypes[0] == NULL || game.rsptypes[1] == NULL) return;
        
        if (game.rsptypes[0] == game.rsptypes[1]){
            // draw
            
        } else if ((game.rsptypes[0] - game.rsptypes[1] + 2) % 3 == 0) {
            // challenger win
            winner[gameId] = game.challenger;
        } else {
            // opposite win
            winner[gameId] = game.opposite;
        }
        
        game.isFinished = true;
        return true;
    }
    
    function getGameState(uint gameId) public view validGame (gameId) returns (uint8 []) {
        Game storage game = games[gameId];
        return (game.rsptypes);
    }
    
    function getPlayingGames(address owner) public view returns(uint[]){
        uint[] memory result = new uint[](playingGameCount[owner]);
        uint counter = 0;
        for (uint i = 0; i < games.length; i++) {
            if (games[i].challenger == owner || games[i].opposite == owner)
            {
                result[counter++] = i;
            }
        }
        
        return result;
    }
    
    function getWinner(uint gameId) public view validGame(gameId) returns (bool, address) {
        return (games[gameId].isFinished, winner[gameId]);
    }
    
}
