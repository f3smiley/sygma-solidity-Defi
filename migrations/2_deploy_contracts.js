const CrossChainTransfer = artifacts.require("CrossChainTransfer");
const DWETH = artifacts.require("DWETH");
const ETHBurn = artifacts.require("ETHBurn");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(CrossChainTransfer).then(function() {
    return deployer.deploy(DWETH, CrossChainTransfer.address);
  }).then(function() {
    return deployer.deploy(ETHBurn, CrossChainTransfer.address);
  });
};