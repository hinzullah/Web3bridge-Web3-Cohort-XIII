import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  sepolia,monadTestnet
} from 'wagmi/chains';
import {
  QueryClientProvider,
  QueryClient,
} from "@tanstack/react-query";


export const config = getDefaultConfig({
  appName: ' Dao App',
  projectId: import.meta.env.VITE_Wallet_Connect_Project_ID,
  chains: [sepolia,monadTestnet],
});