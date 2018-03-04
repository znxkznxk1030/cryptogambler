pragma solidity ^0.4.19;

import "./safemath.sol";

contract GamblerFactory{
    
    using SafeMath for uint256;
    
    event NewGambler(uint gamblerId, string name, uint dna);
    
    uint dnaDigit = 16;
    uint dnaModulus = 10 ** dnaDigit;
    uint cooldownTime = 1 minutes;
    
    struct Gambler{
        string name;
        uint dna;
        uint32 level;
        uint32 readyTime;
        uint32 winCount;
        uint32 defeatCount;
        uint8 consecutiveWinCount;
        uint8 consecutiveDefeatCount;
    }
    
    Gambler[] gamblers;
    
    mapping(uint => address) public gamblerToOwner;
    mapping(address => uint) ownerGamblerCount;
    
    function _createGambler(string _name, uint _dna) internal {
        uint id = gamblers.push(Gambler(_name, _dna, 1, 0, 0, 0, 0, 0));
        gamblerToOwner[id] = msg.sender;
        ownerGamblerCount[msg.sender] = ownerGamblerCount[msg.sender].add(1);
    }
    
    function _generateRandomDna(string _str) private view returns (uint) {
        uint rand = uint(keccak256(_str));
        return rand % dnaModulus;
    }
    
    function createRandomGambler(string _name) public {
        require(ownerGamblerCount[msg.sender] == 0);
        uint randDna = _generateRandomDna(_name);
        _createGambler(_name, randDna);
    }
}
