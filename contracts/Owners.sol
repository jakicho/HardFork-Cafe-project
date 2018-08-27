pragma solidity ^0.4.24;

import "./Entity.sol";

/** @title Owners describes specific functions to endorse the role of the Government
or to be a co-owner of the bar */
contract Owners is Entity {

    event GovEvent (address indexed _govAddress);
    event OwnerEvent (address indexed _ownerAddress);
    event TaxRatioEvent (address indexed _govAddress);

    /** @dev allows the current user to be an owner by buying 1 share (& 1 share
    * only for the specify address) of the bar directly from the Manager.
    * There is no sybil attack as this contract is supposed to be linked to
    * official documents outside the blockchain. The Manager is supposed to acquire
    * for non blockchain purposes documents of the co-owner.
    * Everybody can be an owner as long as there are enough share available.
    * All the remaining shares belong to the Manager.
    */
    function beOwner(string _name) external authorized isShareAvailable isNotOwner payable {
        require(msg.value == _getSharePrice());
        require(bytes(_name).length <= 20);
        Owner memory _newOwner = Owner(_name, 0);
        ownersMap[msg.sender] = _newOwner; // check memory storage state of a map
        ownersIdMap[msg.sender] = ownersList.push(msg.sender) - 1;
        isOwnerMap[msg.sender] = true;

        Owner storage _manager = ownersMap[managerAddress];
        _manager.balance = _manager.balance.add(_getSharePrice());
        emit OwnerEvent(govAddress);
    }

    /** @dev allows the current user to claim the role of the government.
    * in this prototype. Like a RPG, anyone can claim this role. IRL, this contract
    * would be linked to real government document allowing only the goverment to
    * claim this role. */
    function beGovernment() external isNotOwner noGovYet {
        govAddress = msg.sender;
        emit GovEvent(govAddress);
    }

    /** @dev allows the government to define the tax ratio applicable on beverages */
    function setTaxRatio(uint _taxRatio) external isGov {
        if(_taxRatio >= 0 && _taxRatio < 100) {
            taxRatio = _taxRatio;
            _updateRevenuesOnProduct(0);
            _updateRevenuesOnProduct(1);
            emit TaxRatioEvent(msg.sender);
        }
    }

    /** @return the ratio of taxes */
    function getTaxRatio() public view returns(uint) {
        return taxRatio;
    }

    /** for testing purpose of an internal function */
    function getSharePrice() public view returns(uint) {
        return _getSharePrice();
    }
}
