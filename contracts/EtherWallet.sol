// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract EtherWallet {
    // Gonna let one person(the deployer) able to send and withdraw from the wallet
    // Single person Ether wallet
  

    address payable public owner;

    constructor() {
        owner = payable(msg.sender);
    }
     // Implement the "deposit()" and "withdraw()" function
    
    function deposit() public payable {}

    function withdraw(address payable receiver, uint amount) public {
        require(msg.sender == owner, "Only owner can withdraw the Ether");
        receiver.transfer(amount);
    }
   // Implement the "balanceOf" to retrieve the current balance in the wallet
    function balanceOf() public view returns (uint) {
        return address(this).balance;
    }
}