'use client'
import React from 'react'

type Props = {
  data?: { stakingApy?: number; inflation?: number; bondedRatio?: number }
}

export default function YieldsPanel({ data }: Props) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-gradient-to-b from-white via-white to-zinc-50 p-4 shadow-sm dark:from-[#05141a] dark:via-[#04121a] dark:to-[#021018] dark:border-zinc-800">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Yield Summary</h3>
          <div className="text-xs text-zinc-500">On-chain staking metrics</div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
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
