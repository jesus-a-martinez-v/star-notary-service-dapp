const StarNotary = artifacts.require("StarNotary");

let accounts;
let owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async () => {
    const tokenId = 1;
    const instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', tokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(tokenId), 'Awesome Star!')
});

it('lets user1 put up their star for sale', async () => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const starId = 2;
    const starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    assert.equal(await instance.starsForSale.call(starId), starPrice);
});

it('lets user1 get the funds after the sale', async () => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const user2 = accounts[2];
    const starId = 3;
    const starPrice = web3.utils.toWei(".01", "ether");
    const balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    const balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starId, {from: user2, value: balance});
    const balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    const value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    const value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async () => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const user2 = accounts[2];
    const starId = 4;
    const starPrice = web3.utils.toWei(".01", "ether");
    const balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async () => {
    const instance = await StarNotary.deployed();
    const user1 = accounts[1];
    const user2 = accounts[2];
    const starId = 5;
    const starPrice = web3.utils.toWei(".01", "ether");
    const balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});

    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice: 0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    const value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

// Implement Task 2 Add supporting unit tests

it('can add the star name and star symbol properly', async () => {
    const starId = 6;
    const instance = await StarNotary.deployed();
    await instance.createStar('Awesome Star!', starId, {from: accounts[0]})

    assert.equal(await instance.name.call(), 'Star Notary');
    assert.equal(await instance.symbol.call(), 'STN');
});

it('lets 2 users exchange stars', async () => {
    const firstStarId = 7;
    const instance = await StarNotary.deployed();
    await instance.createStar('Supernova', firstStarId, {from: accounts[0]})
    assert.equal(accounts[0], await instance.ownerOf.call(firstStarId))

    const secondStarId = 8;
    await instance.createStar('Sun', secondStarId, {from: accounts[1]})
    assert.equal(accounts[1], await instance.ownerOf.call(secondStarId))

    await instance.exchangeStars(firstStarId, secondStarId, {from: accounts[0]});
    assert.equal(accounts[1], await instance.ownerOf.call(firstStarId));
    assert.equal(accounts[0], await instance.ownerOf.call(secondStarId));

    ////////

    const thirdStarId = 9;
    await instance.createStar('Tatooine', thirdStarId, {from: accounts[2]})
    assert.equal(accounts[2], await instance.ownerOf.call(thirdStarId))

    const fourthStarId = 10;
    await instance.createStar('Coruscant', fourthStarId, {from: accounts[3]})
    assert.equal(accounts[3], await instance.ownerOf.call(fourthStarId))

    await instance.exchangeStars(thirdStarId, fourthStarId, {from: accounts[3]});
    assert.equal(accounts[3], await instance.ownerOf.call(thirdStarId));
    assert.equal(accounts[2], await instance.ownerOf.call(fourthStarId));
});

it('lets a user transfer a star', async () => {
    const starId = 11;
    const instance = await StarNotary.deployed();
    await instance.createStar('Supernova', starId, {from: accounts[0]})
    assert.equal(accounts[0], await instance.ownerOf.call(starId))
    await instance.transferStar(accounts[1], starId, {from: accounts[0]});
    assert.equal(accounts[1], await instance.ownerOf.call(starId))
});

it('lookUptokenIdToStarInfo test', async () => {
    const starId = 12;
    const instance = await StarNotary.deployed();
    await instance.createStar('Best Star in the Galaxy', starId, {from: accounts[0]})

    assert.equal(await instance.lookUptokenIdToStarInfo.call(starId), 'Best Star in the Galaxy');
});