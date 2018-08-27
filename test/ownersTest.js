var Owners = artifacts.require("./Owners.sol");

// test suite
contract('Owners', function(accounts) {
    var ownersInstance;
    var manager = accounts[0]; // government
    var customer1 = accounts[1]; // government
    var customer2 = accounts[2]; // coowner
    var customer3 = accounts[3];
    var customer4 = accounts[4];

    it("should convert the customer to the government", function() {
        return Owners.deployed().then(function(instance){
            ownersInstance = instance;
            return ownersInstance.beGovernment({from: customer1});
        }).then(function() {
            return ownersInstance.getUserAccount(customer1);
        }).then(function(data) {
            assert.equal(data[0], "government", "The name must be government");
            assert.equal(data[1], 0, "Balance must be null");
            assert.equal(data[2], 3, "Type must be 3");
        });
    });

    it("should set the tax Ratio (government action)", function() {
        return Owners.deployed().then(function(instance) {
            ownersInstance = instance;
            return ownersInstance.setTaxRatio(55, { from: customer1});
        }).then(function() {
            return ownersInstance.getEconomicVariables();
        }).then(function(data) {
            assert.equal(data[4], 55, "tax must be at 55");
        });
    });

    it("should get the price of a share", function() {
        return Owners.deployed().then(function(instance) {
            ownersInstance = instance;
            return ownersInstance.getSharePrice();
        }).then(function(data){
            assert.equal(data, 5000000000000000000, "Share price must be at 5 ethers");
        });
    });

    it("should convert the customer to an owner", function() {
        return Owners.deployed().then(function(instance) {
            ownersInstance = instance;
            return ownersInstance.beOwner("Jimmy Coowner", {from:
                customer2,
                value: 5000000000000000000, // 5 ethers
                gas: 500000});
        }).then(function() {
            return ownersInstance.getUserAccount(customer2);
        }).then(function(data) {
            assert.equal(data[0], "Jimmy Coowner", "The name must be Jimmy Coowner");
            assert.equal(data[1], 0, "Balance must be null");
            assert.equal(data[2], 1, "Type must be 1");
        });
    });

    it("should have the manager balance increased after a new owner ", function() {
        return Owners.deployed().then(function(instance) {
            ownersInstance = instance;
            return ownersInstance.beOwner("Jessica Coowner", {from:
                customer3,
                value: 5000000000000000000, // 5 ethers
                gas: 500000});
        }).then(function() {
            return ownersInstance.getUserAccount(manager);
        }).then(function(data) {
            assert.equal(data[0], "BOB THE MANAGER", "The name must be BOB THE MANAGER");
            assert.equal(data[1], 10000000000000000000, "Balance must be 10 eth " + 10000000000000000000);
            assert.equal(data[2], 1, "Type must be 1");
        });
    });

});
