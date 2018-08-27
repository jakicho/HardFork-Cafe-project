App = {
  web3Provider: null,
  ownersInstanceGlob: null,
  contracts: {},
  managerAccount: '0x0',
  govAccount: '0x0000000000000000000000000000000000000000',
  account: '0x0',
  sharePricee: 0,
  maxShares: 0,
  maxJobs: 0,
  sharesAvailable: 0,
  jobsAvailable: 0,
  beerPriceWei: 0,
  winePriceWei: 0,
  ethToUsdRate: 291,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("Customers.json", function(customers) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.Customers = TruffleContract(customers);
      // Connect provider to interact with contract
      App.contracts.Customers.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  render: function() {
    var ownersInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
      }
    });

    // Load contract data
    App.contracts.Customers.deployed().then(function(instance) {
        ownersInstanceGlob = instance;
        return ownersInstanceGlob.getBarFixData();

    }).then(function(data) {
        var barName = $("#barName");
        var assetValue = $("#assetValue");
        var managerAddress = $("#managerAddress");
        var govAddress = $("#govAddress");
        var maxShares = $("#maxShares");
        var sharePrice = $("#sharePrice");
        var maxEmployees = $("#maxEmployees");

        App.managerAccount = data[2];
        App.govAccount = data[3];
        App.sharePricee = data[1]/data[4]; // in wei
        App.maxShares = data[4];
        App.maxJobs = data[5];

        barName.text(data[0]);
        assetValue.text(web3.fromWei(data[1], 'ether'));
        managerAddress.text(data[2]);
        govAddress.text(data[3]);
        maxShares.text(data[4]);
        sharePrice.text(web3.fromWei(App.sharePricee, "ether"));
        maxEmployees.text(data[5]);

        loader.hide();
        content.show();

        App.getBarVariables();
        App.getEconomicVariables();
        App.getRevenueDistribution();
        App.getCurrentAccount();
        App.getOrdersData();
        App.getNbPendingOrders(); // only if customer
        App.bindButtons();
    });
  },

  getEconomicVariables: function() {
      ownersInstanceGlob.getEconomicVariables().then(function(data) {
          var beerPrice = $("#beerPrice");
          var winePrice = $("#winePrice");
          var beerPriceCustomer = $("#beerPriceCustomer");
          var winePriceCustomer = $("#winePriceCustomer");
          var salaryRatio = $("#salaryRatio");
          var dividendRatio = $("#dividendRatio");
          var taxRatio = $("#taxRatio");

          var beerPriceUsd = web3.fromWei(data[0], "ether") * App.ethToUsdRate;
          var winePriceUsd = web3.fromWei(data[1], "ether") * App.ethToUsdRate;
          App.beerPriceWei = data[0];
          App.winePriceWei = data[1];

          beerPrice.text("$" + beerPriceUsd);
          winePrice.text("$" + winePriceUsd);
          beerPriceCustomer.text("~$" + beerPriceUsd);
          winePriceCustomer.text("~$" + winePriceUsd);
          salaryRatio.text(data[2] + "%");
          dividendRatio.text(data[3] + "%");
          taxRatio.text(data[4] + "%");
      });
  },

  getBarVariables: function() {
      ownersInstanceGlob.getBarVariables().then(function(data) {
          App.sharesAvailable = data[0];
          App.jobsAvailable = data[3];

          var sharesNumber = $("#sharesNumber");
          var balance = $("#balance");
          var treasury = $("#treasury");
          var jobsNumber = $("#jobsNumber");
          var beerNumber = $("#beerNumber");
          var wineNumber = $("#wineNumber");

          var addressBalance = web3.fromWei(data[1], "ether") * App.ethToUsdRate;
          balance.text("$" + addressBalance);

          var treasuryBalance = web3.fromWei(data[2], "ether") * App.ethToUsdRate;
          treasury.text("$" + treasuryBalance);

          sharesNumber.text(data[0] + "/" + App.maxShares);
          jobsNumber.text(data[3] + "/" + App.maxJobs);
          beerNumber.text(data[4]);
          wineNumber.text(data[5]);
      });
  },

  getRevenueDistribution: function() {
      ownersInstanceGlob.getRevenueDistribution(0).then(function(data) {
          $("#distrBeerPrice").text("$" + (web3.fromWei(data[0], "ether") * App.ethToUsdRate).toFixed(2));
          $("#distrBeerTax").text("$" + (web3.fromWei(data[1], "ether") * App.ethToUsdRate).toFixed(2));
          $("#distrBeerSalary").text("$" + (web3.fromWei(data[2], "ether") * App.ethToUsdRate).toFixed(2));
          $("#distrBeerDividend").text("$" + (web3.fromWei(data[3], "ether") * App.ethToUsdRate).toFixed(2));
          $("#distrBeerTreasury").text("$" + (web3.fromWei(data[4], "ether") * App.ethToUsdRate).toFixed(2));
      });

      ownersInstanceGlob.getRevenueDistribution(1).then(function(data) {
          $("#distrWinePrice").text("$" + (web3.fromWei(data[0], "ether") * App.ethToUsdRate).toFixed(2));
          $("#distrWineTax").text("$" + (web3.fromWei(data[1], "ether") * App.ethToUsdRate).toFixed(2));
          $("#distrWineSalary").text("$" + (web3.fromWei(data[2], "ether") * App.ethToUsdRate).toFixed(2));
          $("#distrWineDividend").text("$" + (web3.fromWei(data[3], "ether") * App.ethToUsdRate).toFixed(2));
          $("#distrWineTreasury").text("$" + (web3.fromWei(data[4], "ether") * App.ethToUsdRate).toFixed(2));
      });
  },

  getCurrentAccount: function() {
      ownersInstanceGlob.getUserAccount(App.account).then(function(data){
          var userType = data[2];

          $("#actionsPanel").show();

          var yourName = $("#yourName");
          var yourFunds = $("#yourFunds");
          var currentAddress = $("#currentAddress");
          var role = $("#role");

          // role panels
          var panelManager = $("#panelManager");
          var panelGovernment = $("#panelGovernment");
          var panelCoOwner = $("#panelCoOwner");
          var panelEmployee = $("#panelEmployee");
          var panelCustomer = $("#panelCustomer");
          var govWarning = $("#govWarning");

          // main Role buttons
          var beGovCel = $("#beGovCel");
          var beOwnerCel = $("#beOwnerCel");
          var beEmployeeCel = $("#beEmployeeCel");

          panelManager.hide();
          panelGovernment.hide();
          panelCoOwner.hide();
          panelEmployee.hide();
          panelCustomer.hide();
          govWarning.hide();

          // customers
          beGovCel.hide();
          beOwnerCel.hide();
          beEmployeeCel.hide();

          currentAddress.text(App.account);
          yourFunds.text("$" + web3.fromWei(data[1], "ether") * App.ethToUsdRate);

          if(userType == 0) {
              yourName.text("");
          } else {
              yourName.text(data[0]);
          }

          if(App.account == App.managerAccount) {
              // manager
              role.text("BAR MANAGER");
              panelManager.show();

          } else if(App.account == App.govAccount && App.govAccount != '0x0000000000000000000000000000000000000000') {
              // government
              role.text("GOVERNMENT");
              panelGovernment.show();
              govWarning.hide();

          } else if (userType == 1 ) {
              // owner
              role.text("BAR CO-OWNER");
              panelCoOwner.show();

          } else if (userType == 2) {
              // employee
              role.text("BAR EMPLOYEE");
              panelEmployee.show();

          } else if (userType == 0) {
              // customer
              role.text("CUSTOMER");
              panelCustomer.show();

              if(App.jobsAvailable != 0) {
                  beEmployeeCel.show();
              }

              if(App.sharesAvailable != 0) {
                  beOwnerCel.show();
              }

              if(App.govAccount == '0x0000000000000000000000000000000000000000') {
                  beGovCel.show();
              }
          }

          if(App.govAccount == '0x0000000000000000000000000000000000000000') {
              govWarning.show();
          }

      });
  },

  getOrdersData: function() {
      ownersInstanceGlob.getOrdersData().then(function(data){
          var mainPendingOrders = $("#mainPendingOrders");
          mainPendingOrders.text(data[0]);

          var mainOrdersServed = $("#mainOrdersServed");
          mainOrdersServed.text(data[1]);
      });
  },

  getNbPendingOrders: function() {
      ownersInstanceGlob.getNbPendingOrders(App.account).then(function(nbPendingOrders){
          var customerPendingOrders = $("#customerPendingOrders");
          customerPendingOrders.text(nbPendingOrders);
      });
  },

  listenForEvents: function() {
      App.contracts.Customers.deployed().then(function(instance) {
          // Restart Chrome if you are unable to receive this event
          // This is a known issue with Metamask
          // https://github.com/MetaMask/metamask-extension/issues/2393
          instance.GovEvent({}, {
              fromBlock: 0,
              toBlock: 'latest'
          }).watch(function(error, event) {
              console.log("govEvent triggered", event)
              App.render();
          });

          instance.OwnerEvent({}, {
              fromBlock: 0,
              toBlock: 'latest'
          }).watch(function(error, event) {
              console.log("ownerEvent triggered", event)
              App.render();
          });

          instance.EmployeeEvent({}, {
              fromBlock: 0,
              toBlock: 'latest'
          }).watch(function(error, event) {
              console.log("employeeEvent triggered", event)
              App.render();
          });

          instance.BeerPriceEvent({}, {
              fromBlock: 0,
              toBlock: 'latest'
          }).watch(function(error, event) {
              console.log("new BeerPrice triggered", event)
              App.render();
          });

          instance.WinePriceEvent({}, {
              fromBlock: 0,
              toBlock: 'latest'
          }).watch(function(error, event) {
              console.log("new WinePrice triggered", event)
              App.render();
          });

          instance.SalaryRatioEvent({}, {
              fromBlock: 0,
              toBlock: 'latest'
          }).watch(function(error, event) {
              console.log("new Salary ratio triggered", event)
              App.render();
          });

          instance.DividendRatioEvent({}, {
              fromBlock: 0,
              toBlock: 'latest'
          }).watch(function(error, event) {
              console.log("new Dividend ratio triggered", event)
              App.render();
          });

          instance.TaxRatioEvent({}, {
              fromBlock: 0,
              toBlock: 'latest'
          }).watch(function(error, event) {
              console.log("new Tax ratio triggered", event)
              App.render();
          });

          instance.BuyOrderEvent({}, {
              fromBlock: 0,
              toBlock: 'latest'
          }).watch(function(error, event) {
              console.log("new Buy order triggered", event)
              App.render();
          });

          instance.WithdrawEvent({}, {
              fromBlock: 0,
              toBlock: 'latest'
          }).watch(function(error, event) {
              console.log("new WithdrawEvent triggered", event)
              App.render();
          });
      });
  },

  bindButtons: function() {
      // take role
      $(document).on('click', '#beGov', App.handleGov);
      $(document).on('click', '#beOwner', App.handleOwner);
      $(document).on('click', '#beEmployee', App.handleEmployee);

      // manager actions
      $(document).on('click', '#setBeerPrice', App.handleSetBeerPrice);
      $(document).on('click', '#setWinePrice', App.handleSetWinePrice);
      $(document).on('click', '#setSalaryRatio', App.handleSetSalaryRatio);
      $(document).on('click', '#setDividendRatio', App.handleSetDividendRatio);

      // government actions
      $(document).on('click', '#setTaxRatio', App.handleSetTaxRatio);

      // customer actions
      $(document).on('click', '#buyBeer', App.handleBuyBeer);
      $(document).on('click', '#buyWine', App.handleBuyWine);

      // employee actions
      $(document).on('click', '#serveCustomer', App.handleServeCustomer);

      $(document).on('click', '#withdrawFunds', App.handleWithdraw);

  },

  handleWithdraw: function() {
      ownersInstanceGlob.withdraw({
          from: App.account,
          gas: 500000
      }).catch(function(error) {
          console.error(error);
      });
  },

  handleGov: function() {
      ownersInstanceGlob.beGovernment({
           from: App.account,
           gas: 220000
        });

        $("#actionsPanel").hide();
  },

  handleOwner: function() {
      var newOwnerName = $("#inputOwnerName").val();

      if(newOwnerName != "") {
          ownersInstanceGlob.beOwner(newOwnerName, {
               from: App.account,
               value: web3.fromWei(App.sharePricee, "wei"),
               gas: 500000
           }).catch(function(error) {
               console.error(error);
           });

           $("#actionsPanel").hide();

      } else {
          $("#textOwnerError").text("ERROR: Put your name bitch" + App.sharePricee);
      }
  },

  handleEmployee: function() {
      var newEmployeeName = $("#inputEmployeeName").val();

      if(newEmployeeName != "") {
          ownersInstanceGlob.beEmployee(newEmployeeName, {
               from: App.account,
               gas: 500000
           }).catch(function(error) {
               console.error(error);
           });

           $("#actionsPanel").hide();

      } else {
          $("#textEmployeeError").text("ERROR: Put your employee name bitch");
      }
  },

  handleSetBeerPrice: function() {
      var inputBeerPrice = $("#inputBeerPrice").val();
      var beerPriceIndicator = $("#beerPriceIndicator");
      if(inputBeerPrice == '') {
          beerPriceIndicator.text("invalid price");
      } else {
          var PriceInEth = inputBeerPrice/App.ethToUsdRate;
          beerPriceIndicator.text("$"+inputBeerPrice + " or " + PriceInEth.toPrecision(4) + " ethers" );
          ownersInstanceGlob.setBeerPrice(web3.toWei(PriceInEth, 'ether'), {
              from: App.account,
              gas: 500000
          }).catch(function(error) {
              console.error(error);
          });

          $("#actionsPanel").hide();
      }
  },

  handleSetWinePrice: function() {
      var inputWinePrice = $("#inputWinePrice").val();
      var winePriceIndicator = $("#winePriceIndicator");
      if(inputWinePrice == '') {
          winePriceIndicator.text("invalid price");
      } else {
          var PriceInEth = inputWinePrice/App.ethToUsdRate;
          winePriceIndicator.text("$"+inputWinePrice + " or " + PriceInEth.toPrecision(4) + " ethers" );
          ownersInstanceGlob.setWinePrice(web3.toWei(PriceInEth, 'ether'), {
              from: App.account,
              gas: 500000
          }).catch(function(error) {
              console.error(error);
          });

          $("#actionsPanel").hide();
      }
  },

  handleSetSalaryRatio: function() {
      var inputSalaryRatio = $("#inputSalaryRatio").val();
      var salaryRatioIndicator = $("#salaryRatioIndicator");
      if(inputSalaryRatio == '' || inputSalaryRatio <= 0 || inputSalaryRatio >= 100) {
          salaryRatioIndicator.text("invalid ratio");
      } else {
          ownersInstanceGlob.setSalaryRatio(inputSalaryRatio, {
              from: App.account,
              gas: 500000
          }).catch(function(error) {
              console.error(error);
          });

          $("#actionsPanel").hide();

          salaryRatioIndicator.text("ratio : " + inputSalaryRatio);
      };
  },

  handleSetDividendRatio: function() {
      var inputDividendRatio = $("#inputDividendRatio").val();
      var dividendRatioIndicator = $("#dividendRatioIndicator");
      if(inputDividendRatio == '' || inputDividendRatio <= 0 || inputDividendRatio >= 100) {
          dividendRatioIndicator.text("invalid ratio");
      } else {
          ownersInstanceGlob.setDividendRatio(inputDividendRatio, {
              from: App.account,
              gas: 500000
          }).catch(function(error) {
              console.error(error);
          });

          $("#actionsPanel").hide();

          dividendRatioIndicator.text("ratio : " + inputDividendRatio);
      };
  },

  handleSetTaxRatio: function() {
      var inputTaxRatio = $("#inputTaxRatio").val();
      var taxRatioIndicator = $("#taxRatioIndicator");
      if(inputTaxRatio == '' || inputTaxRatio <= 0 || inputTaxRatio >= 100) {
          taxRatioIndicator.text("invalid ratio");
      } else {
          ownersInstanceGlob.setTaxRatio(inputTaxRatio, {
              from: App.account,
              gas: 500000
          }).catch(function(error) {
              console.error(error);
          });

          $("#actionsPanel").hide();

          taxRatioIndicator.text("ratio : " + inputTaxRatio);
      };
  },

  // customer action
  handleBuyBeer: function() {
      //var beerPriceCustomer = $("#beerPriceCustomer");
      //beerPriceCustomer.text("BEEER");
      ownersInstanceGlob.orderBeer({
           from: App.account,
           value: App.beerPriceWei,
           gas: 500000
       }).catch(function(error) {
           console.error(error);
       });

       $("#actionsPanel").hide();
  },

  handleBuyWine: function() {
      //var winePriceCustomer = $("#winePriceCustomer");
      //winePriceCustomer.text("WINE");
      ownersInstanceGlob.orderWine({
           from: App.account,
           value: App.winePriceWei,
           gas: 50000
       }).catch(function(error) {
           console.error(error);
       });

       $("#actionsPanel").hide();
  },

  // employee actions
  handleServeCustomer: function() {
      ownersInstanceGlob.serveCustomer({
           from: App.account,
           gas: 220000
        });

      $("#actionsPanel").hide();
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
