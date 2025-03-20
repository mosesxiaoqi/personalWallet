'use client';
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import blockies from "ethereum-blockies"; // 确保先安装：npm install ethereum-blockies
import {checkWalletCreated, createWallet, getWalletaddress} from '../create/create_local_wallet';
import { CreateWalletDialog } from '../create/create_wallet_dialog'; // 根据实际路径调整

export function WalletConnectButton() {
  // 保存钱包地址状态，如果有地址，则显示 Identicon，否则显示 "Connect Wallet"

  const [wallet, setWallet] = useState("");
  const iconRef = useRef<HTMLButtonElement>(null);
  const [walletCreated, setWalletCreated] = useState<boolean>(false);
  const [showCreateUI, setShowCreateUI] = useState<boolean>(false);
  const [walletName, setWalletName] = useState('');

  const connectWallet = async () => {
    const {addresses, walletName} = await getWalletaddress();
    setWallet(addresses[0]);
    setWalletName(walletName);
  };

  const showWalletName = async () => {
    const {walletName} = await getWalletaddress();
    setWalletName(walletName);
  };

  // 在组件挂载时检查本地钱包状态
  useEffect(() => {
    async function check() {
      const walletExists = await checkWalletCreated();
      setWalletCreated(walletExists);
      if (walletExists) {
        await showWalletName();
      }
    }
    check();
  }, []);

  useEffect(() => {
    if (iconRef.current && wallet) {
      // 清除旧的图标（如果有）
      iconRef.current.innerHTML = "";
      // 生成 Identicon
      const icon = blockies.create({
        seed: wallet.toLowerCase(), // 使用钱包地址生成图标
        size: 8,                     // 每行8个小块
        scale: 5,                    // 每个小块的像素尺寸（可调整图标整体大小）
      });
      // 给 canvas 元素添加内联样式，设置圆角
      icon.style.borderRadius = "50%";
      // 将生成的canvas添加到容器中
      iconRef.current.appendChild(icon);
    }
  }, [wallet]);

  // 回调函数：当创建钱包成功后，更新钱包状态并关闭对话框
  const handleWalletCreated = async () => {
    await connectWallet();
    setShowCreateUI(false);
    setWalletCreated(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {wallet ? (
            <button
              ref={iconRef}
              className="w-10 h-10 rounded-full overflow-hidden p-0 border-0 bg-transparent cursor-pointer"
              title={wallet} // 鼠标悬停显示完整地址
              onClick={() => {
                console.log("Wallet icon clicked!");
              }}
            />
          ) : (
            <Button variant="outline">Connect Wallet</Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {walletCreated ? (
          <DropdownMenuItem onClick={() => connectWallet()}>
            {walletName}
          </DropdownMenuItem>
          ) : (
          <DropdownMenuItem onClick={() => setShowCreateUI(true)}>
            Create Wallet
          </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* 单独的创建钱包对话框 */}
      <CreateWalletDialog 
        open={showCreateUI}
        onOpenChange={setShowCreateUI}
        onWalletCreated={handleWalletCreated} />
    </>
  );
}
