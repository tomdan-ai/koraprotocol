import { accountApi, bankApi, spotApi } from '@/lib/injective'
import { getDefaultSubaccountId } from '@injectivelabs/sdk-ts'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const address = url.searchParams.get('address')
    if (!address) return NextResponse.json({ error: 'address required' }, { status: 400 })

    const subaccountId = getDefaultSubaccountId(address)

    const [balances, orders, positions] = await Promise.all([
      bankApi.fetchBalances(address),
      spotApi.fetchOrders({ subaccountId }),
      accountApi.fetchSubaccountBalances(subaccountId),
    ])

    return NextResponse.json({ balances, orders, positions })
  } catch (err) {
    return NextResponse.json({ error: (err as any).message ?? 'unknown' }, { status: 500 })
  }
}
