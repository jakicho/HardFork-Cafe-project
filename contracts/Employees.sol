pragma solidity ^0.4.23;

import "./Owners.sol";

/** @title Employees describes specific functions to be an employee of the bar */
contract Employees is Owners {

    Beverage[] ordersList; // array that stores customer's orders
    uint currentOrder = 0; // used by the employee to serve the customers

    event EmployeeEvent();

    modifier hasOrders() {
        require(currentOrder < ordersList.length);
        _;
    }

    /** @dev allows the current user to be an employee of the bar.
      * Everybody can be an employee as long as there are enough jobs available
      */
    function beEmployee(string _name) external isNotEmployee isJobAvailable {
        require(bytes(_name).length <= 20);
        Employee memory _newEmployee = Employee(_name, 0);
        employeesMap[msg.sender] = _newEmployee; // check memory storage state of a map
        employeesIdMap[msg.sender] = employeesList.push(msg.sender) - 1;
        isEmployeeMap[msg.sender] = true;
        emit EmployeeEvent();
    }

    /** @dev get the state of the orders.
    * @return _pendingOrdersNb: number of customers waiting to be served
    * @return currentOrder: the next customer to serve*/
    function getOrdersData() external view returns(uint, uint) {
        uint _pendingOrdersNb = ordersList.length - currentOrder;
        return (_pendingOrdersNb, currentOrder); // pending orders, orders served
    }

    /**
    * @dev Employee serves the customer IRL. This function split the revenues
    * from the single sale and distribute it to the government, the manager,
    * the employee who served the customer, the shareHolders/co-owners.
    */
    function serveCustomer() public authorized isEmployee hasOrders{
        require(currentOrder < ordersList.length);
        Beverage memory bebida = ordersList[currentOrder];

        // remove 1 unit from the stock
        if(bebida.drink == Drinks.PinteOfBeer) {
            beerStock--;
        } else if(bebida.drink == Drinks.GlassOfWine) {
            wineStock--;
        }

        // redistribution ------------

        customerPendingOrders[customer]--; // reduce pending order from the customer
        address customer = bebida.customer;

        // toEmployee
        Employee storage _worker = employeesMap[msg.sender];
        _worker.balance = _worker.balance.add(bebida.toEmployee);

        govBalance = govBalance.add(bebida.toGov);
        treasuryBalance = treasuryBalance.add(bebida.toTreasury);

        // uint toShareHolders
        bebida.toShareHolders;
        uint dividendPerShare = bebida.toShareHolders.div(maxShares);

        // manager
        Owner storage _manager = ownersMap[managerAddress];
        _manager.balance =_manager.balance.add(dividendPerShare.mul(1+ maxShares - ownersList.length));

        // co-owners
        for (uint i=1; i<ownersList.length; i++) {
            address _ownerAddress = ownersList[i];
            Owner storage _owner = ownersMap[_ownerAddress];
            _owner.balance += dividendPerShare;
        }

        currentOrder++;
    }

    function quitJob() public isEmployee {
        _removeEmployee(msg.sender);
    }

    function fireEmployee(address _employee) public isManager isEmployeeAddress(_employee){
        _removeEmployee(_employee);
    }

    function _removeEmployee(address _employee) private returns(uint){
        uint index = employeesIdMap[_employee];
        if(employeesList.length > 2 || index < employeesList.length -1) {
            // we put the last address to the index of
            // the employee address we want to delete
            address lastAddress = employeesList[employeesList.length-1];
            employeesList[index] = lastAddress;
            employeesIdMap[lastAddress] = index;
        }

        delete employeesList[employeesList.length-1];
        employeesList.length--;
        isEmployeeMap[_employee] = false;
        lastPayCheckMap[_employee] = true; // allow the user to withdraw his salary

        return(employeesList.length);
    }
}
