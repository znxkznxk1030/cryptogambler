pragma solidity ^0.4.19;

import "./gamblerfactory.sol";

contract GamblerFeeding is GamblerFactory{
    
    modifier ownerOf(uint gamblerId){
        require(gamblerToOwner[gamblerId] == msg.sender);
        _;
    }
    
    function _triggerCooldown(Gambler storage _gambler) internal {
        _gambler.readyTime = uint32(now + cooldownTime);
    }
    
    function _isReady(Gambler storage _gambler) internal view returns (bool) {
        return (_gambler.readyTime <= now);
    }
    
    function _generateNewDna(uint _gamblerDna, uint _oppositeDna) internal pure returns (uint) {
        return (_gamblerDna + _oppositeDna) / 2;
    }
    
    function feedAndMultiply(uint _gamblerId, uint _oppositeDna) internal ownerOf(_gamblerId) {
        Gambler storage gambler = gamblers[_gamblerId]; 
        require(_isReady(gambler));
        uint newDna = _generateNewDna(gambler.dna, _oppositeDna);
        _createGambler("ysysysys", newDna);
        _triggerCooldown(gambler);
    }
}
