pragma solidity ^0.4.19;

import "./gamblerfeeding.sol";

contract GamblerHelper is GamblerFeeding {
    function changeName(uint _gamblerId, string _name) external ownerOf(_gamblerId) {
        gamblers[_gamblerId].name = _name;
    }
    
    function getGamblersByOwner(address _owner) external view returns (uint[]) {
        uint[] memory result = new uint[](ownerGamblerCount[_owner]);
        uint counter = 0;
        
        for(uint i = 0; i < gamblers.length; i++) {
            if (gamblerToOwner[i] == _owner) {
                result[counter] = i;
                counter++;
            }
        }
        
        return result;
    }
    
}
