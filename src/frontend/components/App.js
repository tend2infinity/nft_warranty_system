
import logo from './logo.png';
import './App.css';
import MarketplaceAbi from '../contractsData/Marketplace.json'
import MarketplaceAddress from '../contractsData/Marketplace-address.json'
import Navigation from './Navbar';
import NFTabi from '../contractsData/NFT.json'
import NFTAddress from '../contractsData/NFT-address.json'
import { useState } from 'react';
import { ethers } from "ethers" //allow us to talk to ethereum nodes
//ethers is gonna connect to metamask and metamask is already connected to blockchain so ethers use metamask as its ethereum provider

import Home from './Home.js'
import Create from './Create.js'
import MyListedItems from './MyListedItems.js'
import MyPurchases from './MyPurchases.js'
import Spinner from 'react-bootstrap/esm/Spinner';

import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";


function App() {
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)
  const [nft, setNFT] = useState({})
  const [marketplace, setMarketplace] = useState({})
  //metmask login/connect
  const web3Handler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0]);
    //get provider from Metamask
    const provider = new ethers.providers.Web3Provider(window.ethereum)

    //Set signer
    const signer = provider.getSigner()

    loadContracts(signer)
  }

  const loadContracts = async (signer) => {
    //fetch deployed copies of contracts
    const marketplace = new ethers.Contract(MarketplaceAddress.address, MarketplaceAbi.abi, signer)
    setMarketplace(marketplace)
    const nft = new ethers.Contract(NFTAddress.address, NFTabi.abi, signer)
    setNFT(nft)
    setLoading(false);
  }

  return (
    <BrowserRouter>
      <div>
        <Navigation web3Handler={web3Handler} account={account} />
        <div>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
              <Spinner animation="border" style={{ display: 'flex' }} />
              <p className='mx-3 my-0'>Awaiting Metamask Connection...</p>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={
                <Home marketplace={marketplace} nft={nft}/>
               } />
              <Route path="/create" element={
                <Create marketplace={marketplace} nft={nft}/>
               }/>
              <Route path="/my-listed-items" element={
                <MyListedItems marketplace={marketplace} nft={nft} account={account}/>
               }/>
              <Route path="/my-purchases"  element={
                <MyPurchases marketplace={marketplace} nft={nft} account={account}/> 
              }/>
            </Routes>
          )}

        </div>

      </div>
    </BrowserRouter>

  );
}

export default App;
