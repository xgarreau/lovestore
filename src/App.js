import { useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import storeABI from "./contracts/storeABI.json";
const STORE_ADDRESS = "0x20402132a7e60899c5cBB1a403bb4665F20b6aF1";

// Reload page if network is changed
if (window.ethereum) {
  window.ethereum.on('chainChanged', function (networkId) {
      window.location.reload();
  });
}

function App() {
  const [isConnected, setConnected] = useState(false);
  const [buyBtnString, setBuyBtnString] = useState("Buy LOVE")
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState(0);
  const [buyAmount, setBuyAmount] = useState(0);
  const [lovePerZen, setLovePerZen] = useState(100);

  async function connectWallet () {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask to use this dApp!');
      return;
    }
    try {
      const ethProvider = new ethers.providers.Web3Provider(window.ethereum);
      await ethProvider.send('eth_requestAccounts', []);
      const signer = await ethProvider.getSigner();

      const signerAddress = await signer.getAddress();
      const signerBalance = await signer.getBalance();

      const store = new ethers.Contract(STORE_ADDRESS, storeABI, signer);
      const _lovePerZen = await store.lovePerZEN();
      setLovePerZen(_lovePerZen);

      setAccount(signerAddress);
      setBalance(parseFloat(ethers.utils.formatEther(signerBalance)));
      setConnected (true);
    } catch (e) {
      console.log(e);
    }
    window.ethereum.on('accountsChanged', function (accounts) {
      window.location.reload();
    });
  };

  async function buyLove() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const store = new ethers.Contract(STORE_ADDRESS, storeABI, signer);
    const amount = ethers.utils.parseEther(buyAmount.toString());
    const value = amount.div(lovePerZen);
    setBuyBtnString("💗");
    try {
      const tx = await store.buyLove(amount, {value: value.toString()});
      await tx.wait();
    } catch (e) {
      console.log(e);
    }
    setBuyBtnString("Buy LOVE");
    const signerBalance = await signer.getBalance();
    setBalance(parseFloat(ethers.utils.formatEther(signerBalance)));
  }

  return (
    <>
      <nav>
        <ul>
          <li>
            <a href="https://lovefaucet.mescryptos.fr/">Faucet</a>
          </li>
          <li>💗</li>
          <li>
            <a href="https://lovestore.mescryptos.fr/">Buy</a>
          </li>
          <li>💗</li>
          <li>
            <a href="https://lovestaking.mescryptos.fr/">Stake</a>
          </li>
        </ul>
      </nav>
      <div className="App">
        <h1>The LOVE store</h1>
        <header className="App-header">
          <img src="/5.jpg" className="App-logo" alt="logo" />
          {isConnected === true ?
            <>
              <p>
                Account: {account.substring(0, 6)+'...'+account.substring(account.length-4, account.length)}<br />
                Balance: {balance}
              </p>
              <div className="inputDiv">
                <div className="inputToken">LOVE</div>
                <input type="text" value={buyAmount} onChange={(e) => setBuyAmount(e.target.value)} />
                <div className="inputQties">
                <a href="#25" onClick={(e) => setBuyAmount(balance*lovePerZen/4)}>25%</a>
                <a href="#50" onClick={(e) => setBuyAmount(balance*lovePerZen/2)}>50%</a>
                <a href="#75" onClick={(e) => setBuyAmount(balance*lovePerZen*3/4)}>75%</a>
                <a href="#100" onClick={(e) => setBuyAmount(balance*lovePerZen)}>100%</a>
                </div>
              </div>
              <button onClick={buyLove} disabled={buyBtnString === "Buy LOVE" ? "" : "disabled"}>{buyBtnString}</button>
            </>
          :
            <>
              <button className="connectButton" onClick={connectWallet}>Connect Wallet</button>
            </>
          }
        </header>
      </div>
    </>
  );
}

export default App;
