import {
  IndexerGrpcSpotApi,
  IndexerGrpcDerivativesApi,
  ChainGrpcBankApi,
  IndexerGrpcAccountApi,
  ChainGrpcWasmApi,
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