//background.js
import EventEmitter from 'eventemitter3'
import { getWalletClient, getPublicClient, switchChain, getCurrentChain, getChains} from './create_mnemonics'
import { getWalletaddress } from '../create/create_local_wallet'
import { PublicClient, WalletClient, BlockTag, EIP1193Parameters, EIP1193Provider } from 'viem'
import { Chain } from 'viem/chains';
// import { EIP1193Parameters, EIP1193Provider, createWalletClient, fromHex, http, toHex } from 'viem'

interface ChainInfo {
  id: number;
  chain: Chain;
}

interface RpcTransactionRequest {
  from?: string;
  to: string;
  value?: string;
  gas?: string;
  gasPrice?: string;
  data?: string;
}

interface SwitchChainParam {
  chainId: string;
}

function isSwitchChainParam(param: unknown): param is SwitchChainParam {
  return (
    typeof param === 'object' &&
    param !== null &&
    'chainId' in param &&
    typeof (param as SwitchChainParam).chainId === 'string'
  );
}

interface RequestArguments {
  readonly method: string;
  readonly params?: readonly unknown[] | object;
}

// 添加类型守卫函数
function isValidParamsArray(params: unknown): params is unknown[] {
  return Array.isArray(params);
}

export class EthereumProvider extends EventEmitter {
  [key: string]: any;  // 添加字符串索引签名
  
  private laiPublicClient: PublicClient | undefined;
  private chainId: string
  private isLaiWallet: boolean
  private accounts: string[]
  private laiWalletClient: WalletClient | undefined;
  private currentChain: Chain | undefined;
  private initialized: Promise<void>
  private currentAccount: string;
  private chains: ChainInfo[]


  constructor() {
    super();
    this.isLaiWallet = true; // 自定义属性，用于标识你的钱包
    this.chainId = '0x1'; // 默认链 ID（例如 Ethereum 主网）
    this.accounts = []; // 当前账户列表
    this.chains = [];
    this.currentAccount = '0x0'
    
    this.initialized = this.initialize();
  }

  async initialize() {
    const publicClient = await getPublicClient();
    const walletClient = await getWalletClient();
    if (!publicClient || !walletClient) {
      throw new Error('Failed to initialize clients');
    }
    this.laiPublicClient = publicClient;
    this.laiWalletClient = walletClient;

    // 获取当前账户
    const { addresses } = await getWalletaddress();
    this.accounts = addresses;
    this.currentAccount = this.accounts[0] as `0x${string}`
    this.currentChain = await getCurrentChain()
    this.chainId = `0x${this.currentChain.id.toString(16)}`;

    this.chains = await getChains()
  }

  // 处理请求
  async request({ method, params}: EIP1193Parameters): Promise<ReturnType<EIP1193Provider['request']>> {
    await this.initialize()
    if (!this.laiPublicClient || !this.laiWalletClient) {
      throw new Error('Clients not initialized');
    }
    try {
      switch (method) {
        case 'eth_requestAccounts':
        case 'eth_accounts':
          return this.accounts;

        case 'eth_chainId':
          return this.chainId;

        case 'eth_getBalance':
          if (!params || !isValidParamsArray(params)) {
            throw new Error('Missing required parameter: address and blockTag');
          }
          const balance = await this.laiPublicClient.getBalance({
            address: (params[0] || this.currentAccount) as `0x${string}`,
            blockTag: (params[1] || 'latest') as BlockTag,
          });
          return balance.toString()

        case 'eth_sendTransaction':
          if (!params || !isValidParamsArray(params)) {
            throw new Error('Missing required parameter: tx');
          }
          const tx = (params[0] as RpcTransactionRequest);
          // 验证交易参数
          if (!tx || !tx.from || !tx.to) {
            throw new Error('缺少必需的交易参数');
          }
          if (tx.from.toLowerCase() !== this.currentAccount.toLowerCase()) {
            throw new Error('Invalid from address');
          }
          const txHash = await this.laiWalletClient.sendTransaction({
            to: tx.to as `0x${string}`,
            value: BigInt(tx.value || 0),
            gas: tx.gas ? BigInt(tx.gas) : undefined,
            data: tx.data as `0x${string}`,
            account: tx.from as `0x${string}`,
            chain: this.currentChain
          });
          return txHash

        case 'personal_sign':
          if (!params || !isValidParamsArray(params)) {
            throw new Error('Missing required parameter: message and signAddress');
          }
          const message = params[0] as string;
          const signAddress = params[1] as `0x${string}`;
          if (signAddress.toLowerCase() !== this.currentAccount.toLowerCase()) {
            throw new Error('Address mismatch');
          }
          const signature = await this.laiWalletClient.signMessage({ 
            message, account: this.currentAccount as `0x${string}`});
          return signature

        case 'wallet_switchEthereumChain':
          if (!params || !isValidParamsArray(params)) {
            throw new Error('Missing required parameter: chainId');
          }
          const param = params[0];

          if (typeof param !== 'object' || !param|| !('chainId' in param)) {
            throw new Error('Invalid parameter: chainId is required');
          }
          if (!isSwitchChainParam(param)) {
            throw new Error('无效的链 ID 参数格式');
          }
          const newChainId = parseInt(param.chainId, 16);
          const targetChain = this.chains.find((c: any) => c.id === newChainId);
          if (!targetChain) {
            throw new Error('Unsupported chain');
          }
          else {
            this.chainId = String(newChainId);
            switchChain(targetChain.chain)
          }
          
          chrome.runtime.sendMessage({ event: 'chainChanged', data: `0x${this.chainId}` });
          return null

        default:
          throw {
            code: -32601,
            message: `Unsupported method: ${method}`,
          };
      }
    } catch (error: any) {
      return{ error: { code: -32603, message: error.message } };
    }
  };
}


