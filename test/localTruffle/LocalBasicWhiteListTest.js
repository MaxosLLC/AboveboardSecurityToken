let BasicWhiteList = artifacts.require('contracts/BasicWhiteList.sol');

contract('BasicWhiteList', function(accounts) {

    let basicWhiteList;

    //Sometimes throws error when importing from helpers

    const assertEvent = function(contract, filter) {
        return new Promise((resolve, reject) => {
            var event = contract[filter.event]();
            event.watch();
            event.get((error, logs) => {
                var log = _.filter(logs, filter);
                if (log) {
                    resolve(log);
                } else {
                    throw Error("Failed to find filtered event for " + filter.event);
                }
            });
            event.stopWatching();
        });
    }

    beforeEach(async () => {

        basicWhiteList = await BasicWhiteList.new({from: accounts[0]});

    });

    it("Test basic functions in BasicWhiteList", async function() {
        
        await basicWhiteList.add(accounts[0]);

        await assertEvent(basicWhiteList, 
            { event: "MemberAdded", logIndex: 0, args: { member: accounts[0] }});

        assert.equal(await basicWhiteList.verify(accounts[0]), true);
        await basicWhiteList.remove(accounts[0]);

        await assertEvent(basicWhiteList, 
            { event: "MemberRemoved", logIndex: 1, args: { member: accounts[0] }});

        assert.equal(await basicWhiteList.verify(accounts[0]), false);

    });

    

});