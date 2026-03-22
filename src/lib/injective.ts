import {
  IndexerGrpcSpotApi,
  IndexerGrpcDerivativesApi,
  ChainGrpcBankApi,
  IndexerGrpcAccountApi,
  ChainGrpcWasmApi,
  MsgExecuteContract,
} from '@injectivelabs/sdk-ts'
import { getNetworkEndpoints, Network } from '@injectivelabs/networks'

const envNetwork = process.env.NEXT_PUBLIC_NETWORK
export const NETWORK = envNetwork === 'testnet' ? Network.Testnet : Network.Mainnet
export const ENDPOINTS = getNetworkEndpoints(NETWORK)

export const spotApi = new IndexerGrpcSpotApi(ENDPOINTS.indexer)
export const derivativesApi = new IndexerGrpcDerivativesApi(ENDPOINTS.indexer)
export const bankApi = new ChainGrpcBankApi(ENDPOINTS.grpc)
export const wasmApi = new ChainGrpcWasmApi(ENDPOINTS.grpc)
export const accountApi = new IndexerGrpcAccountApi(ENDPOINTS.indexer)

/**
 * Helpers for constructing wasm execute contract messages
 */
export function createExecuteContractMsg(sender: string, contractAddress: string, msg: object, funds: Array<{ denom: string; amount: string }> = []) {
  return MsgExecuteContract.fromJSON({
    sender,
    contractAddress,
    msg,
    funds,
  })
}

export function setStrategyMsg(sender: string, contractAddress: string, params: { market_id: string; amount_per_order: string; interval_seconds: number }) {
  return createExecuteContractMsg(sender, contractAddress, { set_strategy: params })
}

export function pauseStrategyMsg(sender: string, contractAddress: string) {
  return createExecuteContractMsg(sender, contractAddress, { pause_strategy: {} })
}

export function resumeStrategyMsg(sender: string, contractAddress: string) {
  return createExecuteContractMsg(sender, contractAddress, { resume_strategy: {} })
}