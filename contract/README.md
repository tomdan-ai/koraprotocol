# Kora Vault Contract

This directory contains the CosmWasm smart contract that stores a user's DCA strategy on-chain.

## Contract Overview

The contract supports:

- **SetStrategy**: stores or updates the caller's strategy (`amount_per_order`, `interval_seconds`, `market_id`).
- **PauseStrategy / ResumeStrategy**: toggles an existing strategy on/off.
- **GetStrategy**: query a specific address's stored strategy.
- **GetAllStrategies**: list all stored strategies (for demo/testing).

## Build

### Option 1: Docker (recommended)

```bash
# from repo root
docker run --rm -v "$(pwd)/contract:/code" -w /code cosmwasm/rust-optimizer:0.16.0
```

This produces a `artifacts/` folder containing the optimized `.wasm` binary.

### Option 2: Local Cargo

```bash
cd contract
cargo build
```

## Deploy

Use `injectived tx wasm store` and `injectived tx wasm instantiate` as shown in the day-3 instructions.

Once deployed, set the contract address in your frontend `.env`:

```env
NEXT_PUBLIC_VAULT_CONTRACT_ADDRESS=<your_contract_address>
```
