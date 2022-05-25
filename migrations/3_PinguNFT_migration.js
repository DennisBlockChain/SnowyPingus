const Pingu = artifacts.require("Pingus");
const Snow = artifacts.require("Snow");

module.exports = function (deployer) {
  deployer.deploy(Pingu, Snow.address);
};
