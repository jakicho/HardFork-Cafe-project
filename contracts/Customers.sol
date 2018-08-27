pragma solidity ^0.4.24;

import "./Employees.sol";

/** @title Customers describes specific functions of a customer of the Bar.
Users of this smartcontract are by default customers. */
contract Customers is Employees {

  event BuyOrderEvent ();

  /** @dev buy a pint of beer */
  function orderBeer() public payable authorized hasBeerInStock {
      require(msg.value == _getPrice(0));
      Beverage memory _newOrder = beverages[0];
      _newOrder.customer = msg.sender;
      ordersList.push(_newOrder);
      customerPendingOrders[msg.sender]++;
      emit BuyOrderEvent();
  }

  /** @dev buy a glass of wine */
  function orderWine() public payable authorized hasWineInStock {
      require(msg.value == _getPrice(1));
      ordersList.push(beverages[1]);
      emit BuyOrderEvent();
  }

  /** @return the number of customers waiting to be served. */
  function getNbPendingOrders(address customer) external view returns(uint) {
      return customerPendingOrders[customer];
  }

  /* for testing purpose of the internal function*/
  function getPrice(uint _productId) public view returns(uint){
      return _getPrice(_productId);
  }
}
