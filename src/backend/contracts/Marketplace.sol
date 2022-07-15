//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Marketplace is ReentrancyGuard {
    //state
    address payable public immutable feeAccount; //the account that receives fees
    uint public immutable feePercent; // the fee percentage on sales
    uint public itemCount;

    struct Item{
        uint itemId; //primary key for every item
        IERC721 nft; //instance of nft contract
        uint tokenId; //id of nft
        uint price;
        address payable seller;
        bool sold;
    }
    event Offered (
        uint itemId,
        address indexed nft, 
        uint tokenId,
        uint price,
        address indexed seller
    ); // 'indexed' allows us to search for Offered events using nft and seller addresses as filters

    event Bought(
        uint itemId,
        address indexed nft, 
        uint tokenId,
        uint price,
        address indexed seller,
        address indexed buyer
    );

    mapping(uint => Item) public items;

    constructor(uint _feePercent) { // this _feePercent is to be passed in deploy.js
        feeAccount = payable(msg.sender);
        feePercent = _feePercent;
    }

    function makeItem( IERC721 _nft, uint _tokenId, uint _price ) external nonReentrant {
        require(_price >0, "Price must be greater than zero");
        itemCount++;
        _nft.transferFrom(msg.sender, address(this), _tokenId);

        items[itemCount] = Item(
            itemCount,
            _nft,
            _tokenId,
            _price,
            payable(msg.sender),
            false
        );

        //emit event
        emit Offered(
            itemCount,
            address(_nft),
            _tokenId,
            _price,
            msg.sender
        );
    }

    //purchaseItem is payable so that the buyer could send the ether, this ether will be sent to the seller of that item and a small part of it goes to fee account i.e. to the deployer of marketplace contract
    function purchaseItem(uint _itemId) external payable nonReentrant { 
        uint _totalPrice = getTotalPrice(_itemId);
        Item storage item = items[_itemId];
        require(_itemId>0 && _itemId <= itemCount, "item doesn't exist");
        require(msg.value>= _totalPrice, "not enough ether to cover item price and market fee");
        require(!item.sold, "item already sold");
        //pay seller and feeAccount
        item.seller.transfer(item.price);
        feeAccount.transfer(_totalPrice - item.price);
        //update item to sold
        item.sold = true;
        //transfer nft to buyer
        item.nft.transferFrom(address(this), msg.sender, item.tokenId);

        //emit bought event
        emit Bought(
            _itemId,
            address(item.nft),
            item.tokenId,
            item.price,
            item.seller,
            msg.sender
        );
    }

    // getTotalPrice gives us the total price of an item including the price of item + the fee Percent included in marketPlace. Also view bcoz it can't modify any state variable
    function getTotalPrice(uint _itemId) view public returns(uint) {
        return( (items[_itemId].price*(100 + feePercent))/100);
    }


}