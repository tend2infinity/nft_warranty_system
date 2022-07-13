const {expect} = require("chai");

const toWei = (num) => ethers.utils.parseEther(num.toString())
const fromWei = (num) => ethers.utils.formatEther(num)
//wei is the smallest division of 1 ethereum , 1 ether = 10^18 wei

describe("NFTMarketplace", function(){
    let deployer,addr1,addr2,nft,marketplace
    let feePercent=1;
    let URI="Sample URI";
    beforeEach(async function() {
        // get contract factories
        const NFT = await ethers.getContractFactory("NFT");
        const Marketplace = await ethers.getContractFactory("Marketplace");

        //get signers
        [deployer, addr1, addr2] = await ethers.getSigners()
        //Deploy contracts
        nft = await NFT.deploy();
        marketplace = await Marketplace.deploy(feePercent);
    });
    describe("Deployment", function(){
        it("Should track name and symbol of the nft collection", async function(){
            expect(await nft.name()).to.equal("DApp NFT")
            expect(await nft.symbol()).to.equal("DAPP")
        })
        it("Should track feeAccount and feePercent of the marketplace", async function() {
            expect(await marketplace.feeAccount()).to.equal(deployer.address);
            expect (await marketplace.feePercent()).to.equal(1);

        })
    })
    describe("Minting NFTs", function () {
        it("Should track each minted NFT", async function(){
            //addr1 mints an nft
            await nft.connect(addr1).mint(URI)
            expect(await nft.tokenCount()).to.equal(1);
            expect(await nft.balanceOf(addr1.address)).to.equal(1);
            expect(await nft.tokenURI(1)).to.equal(URI);

            //addr2 mints an nft
            await nft.connect(addr2).mint(URI)
            expect(await nft.tokenCount()).to.equal(2);
            expect(await nft.balanceOf(addr2.address)).to.equal(1);
            expect(await nft.tokenURI(2)).to.equal(URI);
        })
    })

    describe("Making merketplace items", function () {
        beforeEach(async function() {
            await nft.connect(addr1).mint(URI)
            await nft.connect(addr1).setApprovalForAll(marketplace.address, true) //imp to approve marketplace contract to transer the nft to the buyer
        })

        it("Should track new item , transfer NFT from seller to marketplace and emit Offered event", async function(){
            //addr1 offers their nft at a price of 1 ether
            await expect(marketplace.connect(addr1).makeItem(nft.address,1,toWei(1))).to.emit(marketplace,"Offered")
            .withArgs(
                1,
                nft.address,
                1,
                toWei(1),
                addr1.address
            ) //the price is set in Wei
            //Owner of NFT should now br marketplace
            expect(await nft.ownerOf(1)).to.equal(marketplace.address);
            //item count should be equal to 1
            expect(await marketplace.itemCount()).to.equal(1)

            //get item from items mapping to check fields to ensure they are correct
            const item = await marketplace.items(1)
            expect (item.itemId).to.equal(1)
            expect (item.nft).to.equal(nft.address)
            expect (item.tokenId).to.equal(1)
            expect (item.price).to.equal(toWei(1))
            expect (item.sold).to.equal(false)
           
        })
        it("Should fail if price is set to zero", async function () {
            await expect(
                marketplace.connect(addr1).makeItem(nft.address,1,0)
            ).to.be.revertedWith("Price must be greater than zero");
        })
    })

})