# avoiding common attacks

### Re-entrancy attack & Race conditions
To avoid recursive calls on external function calls, I have used the *Checks Effects interactions* (updating the state of the user balance before withdrawing the funds with the external call) You can check the implementation in the *withdraw()* function (entity.sol). Note that another solution would have been to use a *mutex* to lock a state (allowing or not the execution of the function to avoid the recursive call)

### Integer overflow (as users are able to input arbitrary data in the contracts)
In this project, **"The manager"** has the ability to fix the price of beverages (wine and beer at any values). To avoid integer overflow, I use **the safemath library** to handle all the basic math operations. (the safemath library is imported in the entity.sol contract)

### poison data
Integer oveflow is one of the possible "poison data". It is managed in the contract as stated above. In addition to that, the user can also enter his name (as a co-owner, or as an employee) and store it the eth blockchain. To handle that risk, I've limited the number of characters the user can enter for his name (20 max. You can see the implementation on the *beOwner()* function of the owners.sol contract or the *beEmployee()* function of the Employees.sol contract with the use of require statements.

### Exposure (functions & secrets)
When it is not necessary I've put all function accessibility to private or internal (depending on the cases). Also, this project doesn't rely on secret information. On the contrary, my project proposes to see in a transparent manner how the capital is distributed & allocated within a company when you buy a beer.

### Miner/Timestamp Vulnerabilities
Although I am aware of this attack vector, my project doesn't depend on the block timestamp (on the contrary of games for example). Hence, there are nothing particular to implement.

### Malicious Admins (not relevant to the current use case)
For projects that aim to be decentralised with distributed governance this is an important risk to consider. That being said the project I proposed is not about full decentralization and governance. Instead I take advantage of the blockchain to propose a high level of transparency in the way money flows in a brick and mortar business. It implies that the management is by the nature of this project still centralized and the manager of the physical brick and mortar business is not anonymous. If I wanted to have several key administrators of the company that execute this smartcontract, I would have implemented a multisig contract manager to be sure that any critical function execution are accepted by all those managers.

### Cross chain attack (not relevant to the current use case)
As the malicious admins risk, this project is not concern by the cross chain attack as the transactions are managed under the responsability of the manager. That being said contracts can be created from a hard-fork only adress on the ETH network to avoid this attack.

### TX.Origin
I don't use at all Tx.origin, instead I use msg.sender to know what type of user (manager, employee, co-owner, government) the contract has to deal with.
