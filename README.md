# HardFork-Cafe-project
*A smartcontract template for a fully transparent brick and mortar business.*

**Project ideas:** For this project, I have chosen to implement my own idea.

**What this project is about:**
* What if you can enter in your favorite bar, cafe, restaurant in your neighborhood and know exactly at any times how much the bar is making, and where the money goes?
* What if you can know exactly how much the employees and the owner are making each time you buy a single pinte of beer?
* What if you can know how much the government take from this business? What if you can own a piece of this bar?

Usually all those information are hidden to the public. The **"HardFork Cafe project"** is a prototype of a brick and mortar business run completely transparently where every decision
made by the manager is recorded on the blockchain as well as all the economic activities of this business.

The "HardFork Cafe project" aims to bridge the gap between fully decentralised and purely digital projects and real world centralised businesses. To do so it doesn't aim to reinvent the governance of a business; on the contrary **this prototype keeps intact the centralized decision-making framework of a small brick and mortar business. But it makes those decisions and its economic activities fully transparent and proposes to anyone to be a shareholder of the company.**

# User Stories: 
*There are 6 different roles surrounding the activities of a simple business: Customers, Employees, Co-owners, Government, Manager, Suppliers.*

**The customer** can order something to drink (a beer or a glass of wine). But he can also see for each single drink that he buys, how much goes to the shareholders, the employee that served him, the government, the coowners. If he is interested, he can buy a share of this bar to get dividends from each sales. He can also be an employee.

**The employee** can serve the customer (he always serves the first waiting customer). He doesn't have a fix salary. His salary is a percentage of each single sale he made. He can quit the business and withdraw the money he made at any time.

**Co-owners** can simply withdraw their dividends. But they don't make any decision.

**The government** can define the tax on each sales and collect the taxes at anytime.

**The manager** can fire an employee, define the salary ratio, the price of each beverage, the ratio of the dividends and withdraw his profits.

**The Supplier** sells to the manager the stock he needs to run his business (not implemented in this prototype)

# How to set it up and test the UI
	1. Launch ganache on port 8545
	2. Deploy the contract: truffle migrate --compile-all --reset
	3. Open your browser and set metamask on Localhost 8545
	4. Launch the local dev server with the command: npm run dev (the URL http://localhost:3000/ should be opened)
	5. import the ganache addresses in metamask
	6. set your metamask account to the 1rst address of ganache. On the webpage, you should see that your name (on the "current account panel") is "Bob the manager"
	7. All the information you see are taking from the blockchain NB: some functionalities may not fully working but not necessary for the grade).
	8. Testing the UI:
		1. Make sure that your metamask account has been reset (settings/reset account). Otherwise transactions will failed.
		2. As the manager you can "set the beer price" & sign the transaction with metamask. After the page reloads, you should see your value in the "Values set by the manager' panel. Data within the "Revenue Allocation" panel is also updated. You can set the other values as well.
		3. If you change your metamask accounts, and reload the page, you will have the role of a customer. From there you can endorse a different role with this account (co-owner, employee, government) or buy something to drink. Data displayed with update accordingly

# TESTS
All tests are written in javascript the mocha framework.
You can run those test by typing: **truffle test --network development or truffle test --network ganache**

When running those tests, you'll see the description of each one of them (beginning with "should....")
