import Button from "react-bootstrap/Button";
import { Form } from "react-bootstrap";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import EtherWallet from "./artifacts/contracts/EtherWallet.sol/EtherWallet.json";
import "./App.css";

function App() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  //Metamask handling
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [shouldDisable, setShouldDisable] = useState(false); //Should disable connect button while connecting to metamask

  //EtherWallet Smart contract handling
  const [scBalance, setScBalance] = useState(0);
  const [ethToUseForDeposit, setEthToUseForDeposit] = useState(0);
  const [ethToUseForWithdrawal, setEthToUseForWithdrawal] = useState(0);
  const [ethAddrToUseForWithdrawal, setEthAddrToUseForWithdrawal] = useState(
    ethers.constants.AddressZero
  );

  useEffect(() => {
    //Get balance of the EtherWallet smart contract
    async function getEtherWalletBalance() {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(
          contractAddress,
          EtherWallet.abi,
          provider
        );
        let balance = await contract.balanceOf();
        balance = ethers.utils.formatEther(balance);
        console.log("SC balance:", balance);
        setScBalance(balance);
      } catch (err) {
        console.log(
          "Error while depositing ETH to EtherWallet smart contract: ",
          err
        );
      }
    }
    getEtherWalletBalance();
  }, []);

  //Connecting to Metamask wallet
  const connectToMetamask = async () => {
    console.log("Connecting to metamask..");
    setShouldDisable(true);
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // MetaMask requires requesting permission to connect users accounts
      await provider.send("eth_requestAccounts", []);

      const signer = provider.getSigner();
      const account = await signer.getAddress();
      let balance = await signer.getBalance();
      balance = ethers.utils.formatEther(balance);

      setAccount(account);
      setBalance(balance);
      setIsActive(true);
      setShouldDisable(false);
    } catch (error) {
      console.log("Error on connecting", error);
    }
  };

  //Disconnect from Metamask wallet
  const disconnectFromMetamask = async () => {
    console.log("Disconnecting wallet from App...");
    try {
      setAccount("");
      setBalance(0);
      setIsActive(false);
      //setShouldDisable(false)
    } catch (error) {
      console.log("Error on disconnecting", error);
    }
  };

  //Deposit ETH to the EtherWallet smart contract
  const depositToEtherWalletContract = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner(account);
      const contract = new ethers.Contract(
        contractAddress,
        EtherWallet.abi,
        signer
      );

      const transaction = await contract.deposit({
        value: ethers.utils.parseEther(ethToUseForDeposit.toString()),
      });

      await transaction.wait();
      setEthToUseForDeposit(0);

      let balance = await signer.getBalance();
      balance = ethers.utils.formatEther(balance);
      setBalance(balance);

      let scBalance = await contract.balanceOf();
      scBalance = ethers.utils.formatEther(scBalance);
      setScBalance(scBalance);

      console.log("Deposit successful");
    } catch (err) {
      console.log("Error on depositing", err);
    }
  };

  //Withdraw ETH from the EtherWallet smart contract
  const withdrawFromEtherWalletContract = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner(account);
      const contract = new ethers.Contract(
        contractAddress,
        EtherWallet.abi,
        signer
      );

      const transaction = await contract.withdraw(
        ethAddrToUseForWithdrawal,
        ethers.utils.parseEther(ethToUseForWithdrawal.toString())
      );

      let balance = await signer.getBalance();
      balance = ethers.utils.formatEther(balance);
      setBalance(balance);

      let scBalance = await contract.balanceOf();
      scBalance = ethers.utils.formatEther(scBalance);
      setScBalance(scBalance);
    } catch (error) {
      console.log("Error on withdrawing", error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        {!isActive ? (
          <>
            <Button
              variant="secondary"
              onClick={connectToMetamask}
              disabled={shouldDisable}
            >
              <img
                src="images/metamask.svg"
                alt="metamask"
                width="50"
                height="50"
              />
              Connect to Metamask
            </Button>
          </>
        ) : (
          <>
            <Button variant="danger" onClick={disconnectFromMetamask}>
              Disconnect Metamask{" "}
              <img
                src="images/hand.svg"
                alt="disconnect"
                width="50"
                height="50"
              />
            </Button>
            <div className="mt-2 mb-2">Connected Account:{account}</div>
            <div className="mt-2 mb-2">Balance:{balance} ETH</div>
            <Form>
              <Form.Group className="mb-3" controlId="numberInEth">
                <Form.Control
                  type="text"
                  placeholder="Enter amount in ETH"
                  onChange={(e) => setEthToUseForDeposit(e.target.value)}
                />
                <Button
                  variant="primary"
                  onClick={depositToEtherWalletContract}
                >
                  Deposit to EtherWallet Smart Contract
                </Button>
              </Form.Group>
            </Form>
            <Form>
              <Form.Group className="mb-3" controlId="numberInEthWithdraw">
                <Form.Control
                  type="text"
                  placeholder="Enter the amount in ETH"
                  onChange={(e) => setEthToUseForWithdrawal(e.target.value)}
                />
                <Form.Control
                  type="text"
                  placeholder="Enter the ETH address to withdraw to"
                  onChange={(e) => setEthAddrToUseForWithdrawal(e.target.value)}
                />
                <Button
                  variant="primary"
                  onClick={withdrawFromEtherWalletContract}
                >
                  Withdraw from EtherWallet Smart Contract
                </Button>
              </Form.Group>
            </Form>
          </>
        )}
        <div>EtherWallet Smart Contract Address:{contractAddress}</div>
        <div>EtherWallet Smart Contract Balance: {scBalance} ETH</div>
      </header>
    </div>
  );
}

export default App;
