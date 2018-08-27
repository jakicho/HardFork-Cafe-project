var SafeMath = artifacts.require("./SafeMath.sol");
var Entity = artifacts.require("./Entity.sol");
var Owners = artifacts.require("./Owners.sol");
var Employees = artifacts.require("./Employees.sol");
var Customers = artifacts.require("./Customers.sol");

module.exports = function(deployer) {
    deployer.deploy(SafeMath);
    deployer.link(SafeMath, Entity);
    deployer.deploy(Entity);
    deployer.deploy(Owners);
    deployer.deploy(Employees);
    deployer.deploy(Customers);
};
