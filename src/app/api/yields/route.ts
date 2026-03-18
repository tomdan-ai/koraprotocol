import { ENDPOINTS } from '@/lib/injective'
import { ChainGrpcMintApi, ChainGrpcStakingApi } from '@injectivelabs/sdk-ts'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const mintApi = new ChainGrpcMintApi(ENDPOINTS.grpc)
    const stakingApi = new ChainGrpcStakingApi(ENDPOINTS.grpc)

    const [inflationResp, poolResp] = await Promise.all([
      mintApi.fetchInflation(),
      stakingApi.fetchPool(),
    ])

    // Access fields defensively (SDK responses vary by version)
    const inflation = (inflationResp && (inflationResp as any).inflation) ?? inflationResp ?? 0
    const pool: any = poolResp ?? {}

    const bondedTokens = Number(pool?.bondedTokens ?? pool?.bonded_tokens ?? 0)
    const notBondedTokens = Number(pool?.notBondedTokens ?? pool?.not_bonded_tokens ?? 0)
    const bondedRatio = bondedTokens + notBondedTokens > 0 ? bondedTokens / (bondedTokens + notBondedTokens) : 0

    const stakingApy = bondedRatio > 0 ? (Number(inflation) / bondedRatio) * 100 : 0

    return NextResponse.json({ stakingApy, inflation, bondedRatio })
  } catch (err) {
    return NextResponse.json({ error: (err as any).message ?? 'unknown' }, { status: 500 })
  }
}
