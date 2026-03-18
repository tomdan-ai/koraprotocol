import {
  IndexerGrpcSpotApi,
  IndexerGrpcDerivativesApi,
  ChainGrpcBankApi,
  IndexerGrpcAccountApi,
} from '@injectivelabs/sdk-ts'
import { getNetworkEndpoints, Network } from '@injectivelabs/networks'

export const NETWORK = Network.Mainnet
export const ENDPOINTS = getNetworkEndpoints(NETWORK)

export const spotApi = new IndexerGrpcSpotApi(ENDPOINTS.indexer)
export const derivativesApi = new IndexerGrpcDerivativesApi(ENDPOINTS.indexer)
export const bankApi = new ChainGrpcBankApi(ENDPOINTS.grpc)
export const accountApi = new IndexerGrpcAccountApi(ENDPOINTS.indexer)