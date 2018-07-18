const BasicWhiteList = artifacts.require('./BasicWhiteList.sol');

contract('BasicWhiteList', function(accounts) {

    let basicWhiteList;

    beforeEach(async () => {

        basicWhiteList = await BasicWhiteList.new({from: accounts[0]});

    });

    it("Test basic functions in BasicWhiteList", async function() {
        
        let w = await basicWhiteList.add(accounts[0]);
        assert.equal(w.logs[0].event, 'MemberAdded');

        assert.equal(await basicWhiteList.verify(accounts[0]), true);

        w = await basicWhiteList.remove(accounts[0]);
        assert.equal(w.logs[0].event, 'MemberRemoved');

        assert.equal(await basicWhiteList.verify(accounts[0]), false);

    });

    it("Add multiple buyers", async function() {

        await basicWhiteList.addBuyers([accounts[0], accounts[1]]);

        assert.equal(await basicWhiteList.verify(accounts[0]), true);
        assert.equal(await basicWhiteList.verify(accounts[1]), true);
    });

});