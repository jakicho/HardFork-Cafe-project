pragma solidity ^0.4.24;

import "./SafeMath.sol";

/** @title Entity describes the core aspects of a hypothetical brick and mortar
business called the "Hard Fork Cafe" Bar. This contract is not aimed to live
on its own on the eth blockchain. It aims to be linked with an IRL business.
It is a 'template' intended to real owners of IRL bars & cafes businesses who
want to transition their business toward a more transparent economic system
by letting their customers know exactly where their money goes each time they
buy a beer. But also by letting them engaged in the business by buying a share
or being an employee.*/
contract Entity {

    using SafeMath for uint;

    bool isStopped = false; // emergency stop

    address internal managerAddress;
    address internal govAddress = 0x0;

    // fixed at creation of the contract
    string private barName;
    uint private assetValue; // in wei
    uint internal maxShares; // 1 share per owner, at creation, all are owned by the Manager
    uint private maxEmployees;

    // product stocks to sell
    uint public beerStock;
    uint public wineStock;

    uint internal taxRatio; // tax on beverage from 0 to 90 defined by the Government
    uint internal salaryRatio; // salary on beverage from 0 to 90 defined by the Manager
    uint internal dividendRatio; // dividend on each sales defined by the Manager

    uint internal treasuryBalance; // use to buy more stocks, currently not implemented
    uint internal govBalance;

    struct Owner { string name; uint balance; }
    struct Employee { string name; uint balance; }

    /**
    * @dev we store in this struct the price of a beverage as well as the profit
    * each economic participant will get after the sell is made to a customer.
    * @param drink: type of drinks (pint of beer or glass of wine)
    * @param price: price in wei of the beverage
    * @param customer: address of the buyer of this beverage
    * @param toGov: profit (tax) that the Government will get from this sell
    * @param toEmployee: salary that the employee will get after serving the customer
    * @param toShareHolders: profit that the shareHolders will get after the sell
    * @param toTreasury: remainin that will go to the treasury of the Bar
    */
    struct Beverage {
        Drinks drink;
        uint price;
        address customer;
        uint toGov;
        uint toEmployee;
        uint toShareHolders;
        uint toTreasury;
    }

    mapping(address => Owner) internal ownersMap;
    mapping(address => uint) internal ownersIdMap; // position in ownersList
    mapping(address => bool) internal isOwnerMap;

    mapping(address => Employee) internal employeesMap;
    mapping(address => uint) internal employeesIdMap;
    mapping(address => bool) internal isEmployeeMap;

    mapping(address => bool) internal lastPayCheckMap; // allows fired employees to withdraw funds
    mapping(address => uint) internal customerPendingOrders; // nb of pending order

    address[] internal ownersList; // length <= maxShares
    address[] employeesList; // length <= maxEmployees

    enum Drinks { PinteOfBeer, GlassOfWine } //types of drink the bar sells
    Beverage[2] beverages;

    event BeerPriceEvent ();
    event WinePriceEvent ();
    event SalaryRatioEvent ();
    event DividendRatioEvent ();
    event WithdrawEvent ();


    // emergency stop
    modifier authorized {
        require(!isStopped);
        _;
    }

    modifier hasBeerInStock() {
        require(beerStock > 0);
        _;
    }

    modifier hasWineInStock() {
        require(wineStock > 0);
        _;
    }

    modifier isManager() {
        require(msg.sender == managerAddress);
        _;
    }

    modifier isNotManager() {
        require(msg.sender != managerAddress);
        _;
    }

    modifier isGov() {
        require(msg.sender == govAddress);
        _;
    }

    modifier noGovYet() {
        require(govAddress == 0x0);
        _;
    }

    modifier isOwner() {
        require(isOwnerMap[msg.sender]);
        _;
    }

    modifier isNotOwner() {
        require(!isOwnerMap[msg.sender]);
        _;
    }

    modifier isEmployee() {
        require(isEmployeeMap[msg.sender]);
        _;
    }

    modifier isEmployeeAddress(address _employee) {
        require(isEmployeeMap[_employee]);
        _;
    }

    modifier isNotEmployee() {
        require(!isEmployeeMap[msg.sender]);
        _;
    }

    modifier isShareAvailable() {
        require(ownersList.length < maxShares);
        _;
    }

    modifier isJobAvailable() {
        require(maxEmployees > employeesList.length);
        _;
    }

    modifier isParticipant() {
        require(
            msg.sender == managerAddress ||
            msg.sender == govAddress ||
            isOwnerMap[msg.sender] ||
            isEmployeeMap[msg.sender]);
        _;
    }

    /** @dev at deployment of the contract, it creates a bar with default values
    * the person who deploy this contract is the owner of an IRL bar
    */
    constructor() public {
        managerAddress = msg.sender;
        barName = "HARD FORK CAFE";

        // default values
        assetValue = 500000000000000000000; // 500 ethers
        maxShares = 100; // number of shares, the manager is willing to sell
        maxEmployees = 10; // number of jobs, the manager proposed

        beerStock = 400;
        wineStock = 250;

        taxRatio = 33;
        salaryRatio = 10;
        dividendRatio = 40;

        Owner memory _newOwner = Owner("BOB THE MANAGER", 0);
        ownersMap[msg.sender] = _newOwner;
        ownersIdMap[msg.sender] = ownersList.push(msg.sender) - 1;
        isOwnerMap[msg.sender] = true;

        beverages[0] = Beverage(Drinks.PinteOfBeer, 24054982817869417, 0x0, 0, 0, 0, 0);
        beverages[1] = Beverage(Drinks.GlassOfWine, 17182130584192440, 0x0, 0, 0, 0, 0);

        _updateRevenuesOnProduct(0);
        _updateRevenuesOnProduct(1);
    }

    // EMERGENCY STOP ----------------------------------------------------------

    function stopContract() public isManager {
        isStopped = true;
    }

    function resumeContract() public isManager {
        isStopped = false;
    }

    // EXTERNAL ----------------------------------------------------------------

    /** @dev allows the manager to set the price of a beer */
    function setBeerPrice(uint _priceInWei) external isManager {
        Beverage storage _beer = beverages[0];
        _beer.price = _priceInWei;
        _updateRevenuesOnProduct(0);
        emit BeerPriceEvent();
    }

    /** @dev allows the manager to set the price of a glass of wine */
    function setWinePrice(uint _priceInWei) external isManager {
        Beverage storage _wine = beverages[1];
        _wine.price = _priceInWei;
        _updateRevenuesOnProduct(1);
        emit WinePriceEvent();
    }

    /** @dev allows the manager to set the percentage of the selling price that
    * will be allocated to the employee. (TaxRatio is applied first) */
    function setSalaryRatio(uint _salaryRatio) external isManager {
        if(_salaryRatio >= 0 && _salaryRatio < 100) {
            salaryRatio = _salaryRatio;
            _updateRevenuesOnProduct(0);
            _updateRevenuesOnProduct(1);
            emit SalaryRatioEvent();
        }
    }

    /** @dev allows the manager to set the percentage of the selling price that
    * will be allocated to the co-owners. */
    function setDividendRatio(uint _dividendRatio) external isManager {
        if(_dividendRatio >= 0 && _dividendRatio < 100) {
            dividendRatio = _dividendRatio;
            _updateRevenuesOnProduct(0);
            _updateRevenuesOnProduct(1);
            emit DividendRatioEvent();
        }
    }

    /** @dev allows the government, the manager, the employee and the ex-employee
    * to withdraw their profits. */
    function withdraw() external isParticipant authorized {
        uint _amountToWithdraw;
        uint balanceBeforeTransfer = address(this).balance;
        if(msg.sender == govAddress) {
            // government
            _amountToWithdraw = govBalance;
            govBalance = 0;
            require(msg.sender.send(_amountToWithdraw));
            assert(address(this).balance == balanceBeforeTransfer - _amountToWithdraw);

        } else if(msg.sender == managerAddress || isOwnerMap[msg.sender]) {
            // manager or co-owner
            Owner storage _owner = ownersMap[msg.sender];
            _amountToWithdraw = _owner.balance;
            _owner.balance = 0;
            require(msg.sender.send(_amountToWithdraw));
            assert(address(this).balance == balanceBeforeTransfer - _amountToWithdraw);

        } else if(isEmployeeMap[msg.sender] || lastPayCheckMap[msg.sender]) {
            // employee or ex-employee
            Employee storage _employee = employeesMap[msg.sender];
            _amountToWithdraw = _employee.balance;
            _employee.balance = 0;
            lastPayCheckMap[msg.sender] = false;
            require(msg.sender.send(_employee.balance));
            assert(address(this).balance == balanceBeforeTransfer - _amountToWithdraw);
        }

        emit WithdrawEvent();
    }

    /** @dev retrieves the profit distribution of a pint of beer or glass of wine
    * _id: id of the beverage (beer or wine)
    * @return price: price in wei of the beverage
    * @return toGov: profit (tax) that the Government will get from this sell
    * @return toEmployee: salary that the employee will get after serving the customer
    * @return toShareHolders: profit that the shareHolders will get after the sell
    * @return toTreasury: remainin that will go to the treasury of the Bar
    */
    function getRevenueDistribution(uint _id) external view
    returns(uint, uint, uint, uint, uint) {
        Beverage memory product = beverages[_id];
        return(
            product.price,
            product.toGov,
            product.toEmployee,
            product.toShareHolders,
            product.toTreasury
            );
    }


    /** @dev retrieve basic values of the bar
     * @return barName
     * @return assetValue value of the Bar in Wei
     * @return managerAddress
     * @return govAddress
     * @return maxShares
     * @return maxEmployees
     */
    function getBarFixData() external view
    returns(string, uint, address, address, uint, uint) {
        return(
            barName,
            assetValue,
            managerAddress,
            govAddress,
            maxShares,
            maxEmployees);
    }

    /** @dev retrieve values (that depends on the economic activity) of the bar
     * @return shares available
     * @return address balances
     * @return treasuryBalance
     * @return jobsavailable
     * @return beerStock
     * @return wineStock
     */
    function getBarVariables() external view
    returns(uint, uint, uint, uint, uint, uint) {
        uint _sharesAvailable = maxShares.sub(ownersList.length);
        uint _jobsAvailable = maxEmployees.sub(employeesList.length);
        uint _addressBalance = address(this).balance;
        return(
            _sharesAvailable,
            _addressBalance,
            treasuryBalance,
            _jobsAvailable,
            beerStock,
            wineStock);
    }

    /** @return price of Beer
     * @return price of wine
     * @return salary ratio
     * @return dividendRatio
     * @return taxRatio
     */
    function getEconomicVariables() external view
    returns(uint, uint, uint, uint, uint) {
        uint beerPrice = beverages[0].price;
        uint winePrice = beverages[1].price;
        return(beerPrice, winePrice, salaryRatio, dividendRatio, taxRatio);
    }

    /** @dev retrieves information of the current user
     * @return string name of the user if any
     * @return uint account balance
     * @return uint type of the user
     * 0: not in the blockchain
     * 1: if owner
     * 2: if employee
     * 3: if gov
     * 4: if ex-employee about to withdraw last fund
     */
    function getUserAccount(address _address) external view
    returns(string, uint, uint) {
        if(isOwnerMap[_address]) {
            Owner memory _owner = ownersMap[_address];
            return(_owner.name, _owner.balance, 1);

        } else if(isEmployeeMap[_address]) {
            Employee memory _employee = employeesMap[_address];
            return (_employee.name, _employee.balance, 2);

        } else if(_address == govAddress) {
            return("government", govBalance, 3);

        } else if(lastPayCheckMap[_address]) {
            Employee memory _exEmployee = employeesMap[_address];
            return (_exEmployee.name, _exEmployee.balance, 4);
        }

        return ("", 0,  0);
    }

    // PUBLIC VIEW -------------------------------------------------------------

    function getGovAddress() public view returns(address) {
        return govAddress;
    }

    function getGovBalance() public view returns(uint) {
        return govBalance;
    }

    function getTreasuryBalance() public view returns(uint) {
        return treasuryBalance;
    }

    function getEmployeesListNumbers() public view returns(uint, uint){
        return(employeesList.length, maxEmployees); //taken, max
    }

    function getOwnerListNumbers() public view returns(uint, uint){
        return(ownersList.length, maxShares); //taken, max
    }

    function getContractBalance() public view returns(uint) {
        return address(this).balance;
    }

    function getAvailableJobs() public view returns(uint) {
        return maxEmployees - employeesList.length;
    }

    // INTERNAL ----------------------------------------------------------------

    /** @return the value of a share in wei */
    function _getSharePrice() internal view returns(uint){
        return assetValue.div(maxShares); // in wei
    }

    /** @return the price of a beverage */
    function _getPrice(uint _productId) internal view returns(uint) {
        Beverage memory product = beverages[_productId];
        return product.price;
    }

    /** @dev update the revenueAllocation whenever
     * the manager changes the salaryRatio or the dividendRatio
     * the govermnet changes the taxRatio
     * Ratios are applied in this order: TaxRatio, SalaryRatio, DividendRatio
     * remaining goes to the treasury
     */
    function _updateRevenuesOnProduct(uint _id) internal {
        Beverage storage product = beverages[_id];
        product.toGov = product.price.mul(taxRatio).div(100);
        product.toEmployee = ( product.price.sub(product.toGov) ).mul(salaryRatio).div(100);
        product.toShareHolders = ( product.price.sub(product.toGov).sub(product.toEmployee) ).mul(dividendRatio).div(100);
        product.toTreasury = product.price.sub(product.toGov).sub(product.toEmployee).sub(product.toShareHolders);
    }

    // fallback ----------------------------------------------------------------
    function () public authorized payable {}
}
