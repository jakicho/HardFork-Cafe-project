var Entity = artifacts.require("./Entity.sol");

// test suite
contract('Entity', function(accounts) {
    var entityInstance;
    var manager = accounts[0];
    var managerName = "BOB THE MANAGER";
    var barName = "HARD FORK CAFE";
    var assetValue = 500000000000000000000;
    var govAddress = 0x0;
    var maxShares = 100;
    var maxEmployees = 10;
    var beerPrice = 40000000000000000; // in wei
    var winePrice = 30000000000000000;

    // new value for testing
    var beerPrice2 = 80000000000000000;
    var beerGovTax = 26400000000000000;
    var beerEmployeeSalary = 5360000000000000;
    var beerCoownerDividends = 19296000000000000;
    var beerTreasury = 28944000000000000;

    var winePrice2 = 70000000000000000;
    var wineGovTax = 23100000000000000;
    var wineEmployeeSalary = 4690000000000000;
    var wineCoownerDividends = 16884000000000000;
    var wineTreasury = 25326000000000000;

    var salaryRatio = 5;
    var dividendsRatio = 20;

    it("should get data of the bar manager", function() {
        return Entity.deployed().then(function(instance) {
            entityInstance = instance;
            return entityInstance.getUserAccount(manager);
        }).then(function(data) {
            assert.equal(data[0], managerName, "name must be:  " + managerName);
            assert.equal(data[1], 0, "balance must be 0");
            assert.equal(data[2], 1, "type must be 1 (owner)");
        });
    });

    it("should get the initial distribution ratio of profits that will be applied for each sale (beer & wine)", function() {
        return Entity.deployed().then(function(instance){
            entityInstance = instance;
            return entityInstance.getEconomicVariables();
        }).then(function(data) {
            assert.equal(data[0], 24054982817869417, "Beer price must be set at ");
            assert.equal(data[1], 17182130584192440, "Wine price must be set at ");
            assert.equal(data[2], 10, "Salary ratio must be set at ");
            assert.equal(data[3], 40, "Dividend ratio must be set at ");
            assert.equal(data[4], 33, "Tax ratio must be set at ");
        });
    });

    it("should set the price of a pint of beer and a glass of wine (right for manager only)", function() {
        return Entity.deployed().then(function(instance) {
            entityInstance = instance;
            return entityInstance.setBeerPrice(beerPrice, { from: manager});
        }).then(function() {
            return entityInstance.getEconomicVariables();
        }).then(function(data) {
            assert.equal(data[0], beerPrice, "beer must cost " + beerPrice + "wei");
            return entityInstance.setWinePrice(winePrice, { from: manager});
        }).then(function() {
            return entityInstance.getEconomicVariables();
        }).then(function(data) {
            assert.equal(data[1], winePrice, "wine must cost " + winePrice + "wei");
        });
    });

    it("should get the revenue distribution of a beer & a glass of wine after prices have been changed", function() {
        return Entity.deployed().then(function(instance) {
            entityInstance = instance;
            return entityInstance.setBeerPrice(beerPrice2, { from: manager});
        }).then(function() {
            return entityInstance.getRevenueDistribution(0);
        }).then(function(data) {
            assert.equal(data[0], beerPrice2, "Price of a pinte must be set at  " + beerPrice2);
            assert.equal(data[1], beerGovTax, "Government Tax must be set at  " + beerGovTax);
            assert.equal(data[2], beerEmployeeSalary, "Salary for an employee must be set at  " + beerEmployeeSalary);
            assert.equal(data[3], beerCoownerDividends, "Dividends for the to shareHolders must be set at  " + beerCoownerDividends);
            assert.equal(data[4], beerTreasury, "Remaining for the treasury must be set at  " + beerTreasury);
            return entityInstance.setWinePrice(winePrice2, { from: manager});
        }).then(function() {
            return entityInstance.getRevenueDistribution(1);
        }).then(function(data) {
            assert.equal(data[0], winePrice2, "Price of a glass of wine must be set at  " + winePrice2);
            assert.equal(data[1], wineGovTax, "Government Tax must be set at  " + wineGovTax);
            assert.equal(data[2], wineEmployeeSalary, "Salary for an employee must be set at  " + wineEmployeeSalary);
            assert.equal(data[3], wineCoownerDividends, "Dividends for the to shareHolders must be set at  " + wineCoownerDividends);
            assert.equal(data[4], wineTreasury, "Remaining for the treasury must be set at  " + wineTreasury);
        });
    });

    it("should set the salary ratio & the dividend ratio (right for manager only)", function() {
        return Entity.deployed().then(function(instance) {
            entityInstance = instance;
            return entityInstance.setSalaryRatio(salaryRatio, { from: manager});
        }).then(function() {
            return entityInstance.setDividendRatio(dividendsRatio, { from: manager});
        }).then(function() {
            return entityInstance.getEconomicVariables();
        }).then(function(data) {
            assert.equal(data[2], salaryRatio, "salary ratio must be set at  " + salaryRatio);
            assert.equal(data[3], dividendsRatio, "dividends ratio must be set at  " + dividendsRatio);
        });
    });

    it("should get the bar data (fix and variables)", function() {
        return Entity.deployed().then(function(instance) {
            entityInstance = instance;
            return entityInstance.getBarFixData();
        }).then(function(data) {
            assert.equal(data[0], barName, "The name of the bar must be " + barName);
            assert.equal(data[1], assetValue, "The value in wei of the bar must be " + assetValue);
            assert.equal(data[2], manager, "The manager address must be " + manager);
            assert.equal(data[3], govAddress, "The goverment address must be default at " + govAddress);
            assert.equal(data[4], maxShares, "The max shares must be " + maxShares);
            assert.equal(data[5], maxEmployees, "The max employee must be " + maxEmployees);
            return entityInstance.getBarVariables();
        }).then(function(data) {
            assert.equal(data[0], maxShares - 1, "available shares must be " + maxShares -1); // the manager keeps at least 1 of the 100 shares
            assert.equal(data[1], 0, "contract balance must be " + 0);
            assert.equal(data[2], 0, "treasury balance must be " + 0);
            assert.equal(data[3], maxEmployees, "jobs available must be " + maxEmployees);
            assert.equal(data[4], 400, "beer stock must be " + 400);
            assert.equal(data[5], 250, "wine stock must be " + 250);
        });
    });
});
