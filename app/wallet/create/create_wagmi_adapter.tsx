import { cookieStorage, createStorage } from 'wagmi'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, sepolia } from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit/networks'
import { http } from 'viem'

// Get projectId from https://cloud.reown.com
export const projectId = 'a745ef05eb2952ea62028b3756dbb503'
// process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) {
  throw new Error('Project ID is not defined')
}

export const networks = [mainnet, sepolia] as [AppKitNetwork, ...AppKitNetwork[]]
const transports = {
    [mainnet.id]: http('https://rpc.payload.de'),
    [sepolia.id]: http('https://1rpc.io/sepolia')
}

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks,
  transports
})

export const config = wagmiAdapter.wagmiConfig