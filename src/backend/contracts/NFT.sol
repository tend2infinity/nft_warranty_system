pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFT is ERC721URIStorage {
    uint public tokenCount; 
    // state variable, only functions inside this contract can modify this state variable. Also changing this state variable means changing state of the blockchain and this will defininity require gas. Also this state will keep count of the no. of tokens

    constructor() ERC721("DApp NFT", "DAPP"){} 
    //called only once after it is deployed to the blockchain

    function mint(string memory _tokenURI) external returns(uint) { //tokenURI is just metadata for that particular contract
       tokenCount++;
       _safeMint(msg.sender, tokenCount); //msg.sender is the caller of that function 
       _setTokenURI(tokenCount, _tokenURI);
       return(tokenCount);
    } // to mint(make) new NFTs
}
