var Customers = artifacts.require("./Customers.sol");

// test suite
contract('Customers', function(accounts) {
    //var beerPrice = 24054982817869417;
    var beerPrice = 40000000000000000;
    var winePrice = 30000000000000000;
    var customersInstance;
    var manager = accounts[0];
    var customer3 = accounts[3]; // employee
    var customer4 = accounts[4];

    it("should order a beer (customer)", function() {
        return Customers.deployed().then(function(instance){
            customersInstance = instance;
            return customersInstance.setBeerPrice(beerPrice, { from: manager});
        }).then(function(data) {
            return customersInstance.orderBeer({from:
                customer4,
                value: beerPrice,
                gas: 500000});
        }).then(function() {
            return customersInstance.getOrdersData();
        }).then(function(data) {
            assert.equal(data[0], 1, "Pending order must be 1");
            assert.equal(data[1], 0, "CurrentOrder must be at index 0");
        });
    });

    it("should order a wine (customer) & increment pending order", function() {
        return Customers.deployed().then(function(instance){
            customersInstance = instance;
            return customersInstance.setWinePrice(winePrice, { from: manager});
        }).then(function(data) {
            return customersInstance.orderWine({from:
                customer4,
                value: winePrice,
                gas: 500000});
        }).then(function() {
            return customersInstance.getOrdersData();
        }).then(function(data) {
            assert.equal(data[0], 2, "Pending order must be 2");
            assert.equal(data[1], 0, "CurrentOrder must be at index 0");
        });
    });

    it("should get the price of beer & a pint (from internal function)", function() {
        return Customers.deployed().then(function(instance){
            customersInstance = instance;
            return customersInstance.getPrice(0);
        }).then(function(data) {
            assert.equal(data, beerPrice, "price of a beer must be " + data + " / "+ beerPrice);
            return customersInstance.getPrice(1);
        }).then(function(data) {
            assert.equal(data, winePrice, "price of a wine must be " + winePrice);
        });
    });

    it("should serve the first order of a customer (employee)", function() {
        return Customers.deployed().then(function(instance){
            customersInstance = instance;
            return customersInstance.beEmployee("Chris Barista", {from: customer3});
        }).then(function() {
            return customersInstance.serveCustomer({from: customer3});
        }).then(function() {
            return customersInstance.getOrdersData();
        }).then(function(data) {
            assert.equal(data[0], 1, "Pending order must be 0 " + data[0]);
            assert.equal(data[1], 1, "CurrentOrder must be at index 1" + data[1]);
        });
    });

    it("should get proper revenue distribution after the service (employee)", function() {
        return Customers.deployed().then(function(instance){
            customersInstance = instance;
            return customersInstance.serveCustomer({from: customer3});
        }).then(function() {
            return customersInstance.getGovBalance();
        }).then(function(data) {
            assert.equal(data, 23100000000000000, "Gov balance must be 23100000000000000 wei");
            return customersInstance.getUserAccount(manager);
        }).then(function(data) {
            assert.equal(data[1], 16884000000000000, "Manager balance must be 16884000000000000 wei");
            return customersInstance.getUserAccount(customer3);
        }).then(function(data) {
            assert.equal(data[1], 4690000000000000, "Employee balance must be 4690000000000000 wei");
            return customersInstance.getTreasuryBalance();
        }).then(function(data) {
            assert.equal(data, 25326000000000000, "Employee balance must be 25326000000000000 wei");
            //return customersInstance.getTreasuryBalance();
        });
    });

});
