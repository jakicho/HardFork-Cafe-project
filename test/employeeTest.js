var Employees = artifacts.require("./Employees.sol");

// test suite
contract('Employees', function(accounts) {
    var employeesInstance;
    var manager = accounts[0]; // government
    var customer2 = accounts[2]; // coowner
    var customer3 = accounts[3]; // employee
    var customer4 = accounts[4]; // employee

    it("should convert the customer to an employee", function() {
        return Employees.deployed().then(function(instance){
            employeesInstance = instance;
            return employeesInstance.beEmployee("Chris Barista", {from: customer3});
        }).then(function() {
            return employeesInstance.getUserAccount(customer3);
        }).then(function(data) {
            assert.equal(data[0], "Chris Barista", "The name must be Chris Barista");
            assert.equal(data[1], 0, "Balance must be null");
            assert.equal(data[2], 2, "Type must be 2");
        });
    });

    it("should get customer orders", function() {
        return Employees.deployed().then(function(instance){
            employeesInstance = instance;
            return employeesInstance.getOrdersData();
        }).then(function(data) {
            assert.equal(data[0], 0, "no pending order");
            assert.equal(data[1], 0, "index at 0");
        });
    });

    it("should quit job (employee)", function() {
        return Employees.deployed().then(function(instance){
            employeesInstance = instance;
            return employeesInstance.getBarVariables();
        }).then(function(data) {
            assert.equal(data[3], 9, "must be 9");
            return employeesInstance.quitJob({from: customer3});
        }).then(function() {
            return employeesInstance.getUserAccount(customer3);
        }).then(function(data) {
            assert.equal(data[0], "Chris Barista", "Chris Barista is returned.");
            assert.equal(data[1], 0, "Balance must be null"); // test this
            assert.equal(data[2], 4, "Type must be 4");
            return employeesInstance.getBarVariables();
        }).then(function(data) {
            assert.equal(data[3], 10, "must be 10");
        });
    });

    it("should fire an employee (manager)", function() {
        return Employees.deployed().then(function(instance){
            employeesInstance = instance;
            return employeesInstance.beEmployee("Julie Barista", {from: customer4});
        }).then(function() {
            return employeesInstance.getUserAccount(customer4);
        }).then(function(data) {
            assert.equal(data[0], "Julie Barista", "The name must be Julie Barista");
            assert.equal(data[1], 0, "Balance must be null");
            assert.equal(data[2], 2, "Type must be 2");
            return employeesInstance.fireEmployee(customer4, {from: manager});
        }).then(function() {
            return employeesInstance.getUserAccount(customer4);
        }).then(function(data) {
            assert.equal(data[0], "Julie Barista", "Julie Barista is returned.");
            assert.equal(data[1], 0, "Balance must be null"); // test this
            assert.equal(data[2], 4, "Type must be 4");
            return employeesInstance.getBarVariables();
        }).then(function(data) {
            assert.equal(data[3], 10, "must be 10");
        });
    });

    it("should withdraw profit (manager)", function() {
        return Employees.deployed().then(function(instance) {
            employeesInstance = instance;
            return employeesInstance.beOwner("Jimmy Coowner", {from:
                customer2,
                value: 5000000000000000000, // 5 ethers
                gas: 500000});
        }).then(function() {
            return employeesInstance.getUserAccount(manager);
        }).then(function(data) {
            assert.equal(data[0], "BOB THE MANAGER", "name must be:  BOB THE MANAGER");
            assert.equal(data[1], 5000000000000000000, "balance must be 5000000000000000000");
            assert.equal(data[2], 1, "type must be 1 (owner)");
            return employeesInstance.getContractBalance();
        }).then(function(data) {
            assert.equal(data, 5000000000000000000, "contract balance must be 5000000000000000000");
            return employeesInstance.withdraw();
        }).then(function() {
            return employeesInstance.getUserAccount(manager);
        }).then(function(data) {
            assert.equal(data[0], "BOB THE MANAGER", "name must be:  BOB THE MANAGER");
            assert.equal(data[1], 0, "balance must be 0" + data[1]);
            assert.equal(data[2], 1, "type must be 1 (owner)");
        });
    });

});
