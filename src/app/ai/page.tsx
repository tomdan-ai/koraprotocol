"use client"

import React from 'react'
import WalletConnect from '@/components/WalletConnect'
import AIChat from '@/components/AIChat'

export default function AIPage() {
  return (
    <div className="min-h-screen px-6 py-8">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Kora AI Assistant</h1>
          <p className="mt-1 text-sm text-zinc-300">Ask questions about Injective markets or your wallet portfolio.</p>
        </div>
        <WalletConnect />
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.25fr,0.75fr]">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-6">
          <AIChat />
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-6">
          <h2 className="text-sm font-semibold text-white">Tips</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-zinc-300">
            <li>Connect your wallet to get portfolio-aware answers.</li>
            <li>Ask about current market movers and best yield pools.</li>
            <li>Use the prebuilt prompt buttons to get started quickly.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
