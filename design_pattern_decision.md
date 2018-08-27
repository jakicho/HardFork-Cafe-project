# DESIGN PATTERNS

### Security Pattern - Emergency Stop
The creator of these contracts is the manager of the bar. I have implemented an emergency stop in the Entity.sol contract *(variable: isStopped; modifier: authorized, functions: stopContract() & resumeContract())*. The manager is the only one who can exectute these 2 functions. The modifier *"authorized"* is used for the execution of the *withdraw()* function and the *orderBeer()/orderWine()* functions (Customer.sol)

### Behavioral Pattern - Guard Check
* Require() is used in the contracts to check the inputs of the user (msg.value)
* Assert() is used in the contracts to check an invariant when the user withdraw funds from the contract (Withdraw function in the entity.sol contract)

### Behavioral Pattern - State Machine
It wasn't necessary for me to implement this pattern in this project because this pattern exposed different functionalities according to its state, while I exposed different functionalities according to the type of users (bar manager, government, employee, customers). The only state's change of this project is the emergency stop that disable/enable critical functionalities.

### Behavioral Pattern - Randomness
By the nature of this project (& on the contrary of a cards game for example), I didn't need to use this pattern.

### Security Pattern - Access Restriction
I use this pattern to expose functionalities according to the user's role (bar manager, government, employee, customers) with the use of modifiers. You can see those modifiers for example in the Entity.sol contract (as well as the others)

### Security Pattern - Checks Effects Interactions
I use this pattern against re-entrancy attacks. You can check the implementation in the *withdraw()* function (entity.sol)

### Security Pattern - Pull over Push
I use this pattern to handle the transfer of ethers when an employee is fired by the manager. Rather than pushing the payment of the salary to the employee before firing him. I change the state of the employee to an ex-employee allowing him to later withdraw his funds. You can see the implementation in the *_removeEmployee()* function of the employees.sol contract
