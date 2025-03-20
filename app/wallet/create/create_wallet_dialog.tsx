"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FormEvent, useState } from 'react';
import { saveWalletName } from './create_mnemonics';
import { createWallet } from './create_local_wallet';

interface CreateWalletDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onWalletCreated: () => void;
}

export function CreateWalletDialog({ open, onOpenChange, onWalletCreated }: CreateWalletDialogProps) {
    const [walletName, setWalletName] = useState('');
    const [password, setPassword] = useState('');


    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // 添加创建钱包的逻辑
        saveWalletName(walletName);
        createWallet('aabb');
        console.log("创建钱包...");
        // 创建完毕后关闭模态框
        await onWalletCreated();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
            <DialogTitle>创建新钱包</DialogTitle>
            <DialogDescription>
                请填写相关信息以创建新钱包。
            </DialogDescription>
            </DialogHeader>
            <div>
            <form onSubmit={handleSubmit}>
                <label className="block mb-2">钱包名称</label>
                <input
                    type="text"
                    value={walletName}
                    onChange={(e) => setWalletName(e.target.value)}
                    className="border rounded p-2 mb-4 w-full"
                />
                {/* <p>当前钱包名称：{walletName}</p> */}
                <label className="block mb-2">请输入密码:</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border rounded p-2 mb-4 w-full"
                />
                <Button type="submit">创建钱包</Button>
            </form>
            </div>
        </DialogContent>
        </Dialog>
    );
}