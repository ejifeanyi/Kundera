# Kundera

**Decentralized Community Savings Circles on Stacks**

Kundera digitizes traditional group savings systems (like ROSCAs or susu) using Clarity smart contracts on the Stacks blockchain. It enables trusted communities to pool funds, rotate payouts, and earn yield — all governed by code, not intermediaries.

---

## Overview

Kundera allows users to create savings circles where participants contribute stablecoins regularly, and each round a different member receives the pooled funds. The system includes penalties, governance, and optional yield farming — all transparent and tamper-proof.

The protocol is powered by 7–10 modular Clarity smart contracts.

---

## Features

- Trustless group savings logic  
- On-chain contribution and payout tracking  
- Flexible payout scheduling (round-robin, lottery, vote)  
- Reputation-based penalties and rewards  
- DAO-style governance for rule adjustments  
- NFT-based reputation tracking  
- Integration with DeFi protocols (via Bitcoin bridges or off-chain execution)  
- Optional reward tokens for active users  

---

## Smart Contracts

### **circle-factory.clar**
- Initializes new savings circles with configurable rules  
- Tracks all active circles  

### **circle-core.clar**
- Manages rounds, contributions, and payouts  
- Maintains the lifecycle of each savings group  

### **member-access.clar**
- Manages circle membership and roles  
- Supports open/closed groups and access control  

### **fund-vault.clar**
- Escrows stablecoin deposits (via SIP-010 or wrapped tokens)  
- Ensures safe and auditable handling of funds  

### **payout-scheduler.clar**
- Automates payouts using block height, time, or consensus rules  
- Ensures fair rotation or lottery distribution  

### **penalty-engine.clar**
- Applies penalties for missed or late contributions  
- Handles dropout logic and replacement mechanisms  

### **governance-circle.clar**
- Enables voting on rule changes, disputes, and emergency exits  
- Delegated or direct voting by members  

### **reputation-badge.clar**
- Issues non-transferable NFTs as reputation tokens  
- Encourages reliability and long-term participation  

### **token-pool.clar** *(optional)*
- Distributes native $KUN tokens to incentivize users  
- May support staking for governance rights  

---

## Installation

1. Install [Clarinet CLI](https://docs.hiro.so/clarity/clarinet/install)  
2. Clone the repository  
3. Run a local install:
```bash
npm install
```
4. Compile contracts:
```bash
cd contracts
clarinet check
```

## Usage

Each Clarity contract is deployable independently or through the factory pattern.

- Use Postman or curl to interact via the Stacks API
- Recommended: Build a frontend with Next.js + Tailwind and connect with Stacks.js

Group creators can set:

- Contribution amount
- Round schedule (e.g. weekly, monthly)
- Penalty behavior
- Payout rotation method

## Testing

Tests are written using Typescript and vitest.

To run all tests:
```bash
npm run test
```

Unit and integration tests simulate real-world scenarios including:
- Circle creation
- Contribution and payout flow
- Member dropout and penalty
- DAO rule voting

## License
MIT License

