'use client'
import React from 'react'

type Props = {
  data?: { stakingApy?: number; inflation?: number; bondedRatio?: number }
}

export default function YieldsPanel({ data }: Props) {
  return (
    <div className="rounded-lg border border-zinc-100 bg-white p-4 shadow-sm dark:bg-[#04121a] dark:border-zinc-800">
      <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Yield Summary</h3>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <div className="text-xs text-zinc-500">Staking APY</div>
          <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{(data?.stakingApy ?? 0).toFixed(2)}%</div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-zinc-500">Inflation</div>
          <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{(data?.inflation ?? 0).toFixed(2)}%</div>
        </div>
        <div className="space-y-1">
          <div className="text-xs text-zinc-500">Bonded Ratio</div>
          <div className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{(data?.bondedRatio ?? 0).toFixed(2)}</div>
        </div>
      </div>
    </div>
  )
}
