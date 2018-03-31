let IssuanceWhiteList = artifacts.require('contracts/IssuanceWhiteList.sol');

contract('IssuanceWhiteList', function(accounts) {

    let issuanceWhiteList;

    beforeEach(async () => {

        issuanceWhiteList = await IssuanceWhiteList.new({from: accounts[0]});

    });

    it("Test agent - qualifier addition/removal", async function() {
        
        await issuanceWhiteList.setAgent(accounts[0]);
        await issuanceWhiteList.addQualifier(accounts[0]);
        await issuanceWhiteList.removeQualifier(accounts[0]);

    });

});