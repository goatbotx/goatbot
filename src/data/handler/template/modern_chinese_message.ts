import { IOtherWallet, IUser } from "../../repository/database/models/user";
import ICallback from "../../types/callback/callback";
import jwt from 'jsonwebtoken';

export class ModernChineseMessageTemplete {
    static decryptToken = (data: any): string => {
        return jwt.verify(data, process.env.SECRET_ENCRYPTION_KEY!) as string;
    }

    static welcome = () => (
        "══════[ 🐐 GoatBot 🐐 ]══════\n"+
        "🎉 恭喜您找到了 G.O.A.T（最棒的 Telegram）加密機器人！我們來這裡是為了加速您的加密之旅。\n\n"+
        
         "📖 快速指南：\n\n"+
         "1. 錢包中心 📔：您的加密貨幣指揮中心！檢視、建立、匯入、管理錢包、發送/接收和查看這些 💰 餘額。\n\n"+
         "2. 交易📈：潛入金融海洋！市場買入🛍和賣出🏷，限價買入🛍和賣出🏷，並在交易中保持鷹派👁。\n\n"+
         "3. 機器人中心 🤖：像專業人士一樣自動化！狙擊手 🎯、領跑者 🏃、鏡像 🪞 機器人等。\n\n"+
         "4. 賺錢 🌱：將你的種子培育成參天大樹！深入了解推薦 🤝 並提出你的主張 🏰。\n\n"+
         "5. 設定 ⚙️：按照您的風格自訂 GoatBot！自訂、調整並使其真正屬於您。\n"
    );

    static defaultMessage = (message: string) => (
        "══════[ 🐐 GoatBot 🐐 ]══════\n"+
        ` ${message}\n`+
        "_______________________________________________\n"
    )

    static generateWalletEntities = (message: string, wallets: IUser['wallets'], isTitled = true) => {
        let offset = 0;
        const entities: any = [];
    
        const header = 
            "══════[ 🐐 GoatBot 🐐 ]══════\n\n"+
            (isTitled ? "🐐 GoatBot | 網站\n" : "")+
            `${message} \n\n` +
            "══🔳 Your Wallets 🔳══\n\n"
        offset += header.length;
    
        const walletTexts = wallets.map((wallet, index) => {
            // Add entity for "Wallet_wX"
            entities.push({ offset: offset + 2, length: `Wallet_w${index + 1}`.length, type: 'bold' });
            entities.push({
                offset: offset + 2,
                length: `Wallet_w${index + 1}`.length,
                type: 'text_link',
                url: `https://etherscan.io/address/${wallet.address}`
            });
            offset += `▰ Wallet_w${index + 1} ▰\n\n`.length;
    
            const balanceText = `Bal: ${wallet.balance} ETH (${wallet.balance_in_dollar}) \- \n`;
            offset += balanceText.length;
    
            entities.push({ offset: offset, length: wallet.address.length, type: 'code' });
            offset += `${wallet.address}\`\n`.length;
    
            return `▰ Wallet_w${index + 1} ▰\n${balanceText} ${wallet.address}\n\n`;
        });
    
        const text = header + walletTexts.join('');
    
        return { text, entities };
    };

    static generateExportWalletEntities = ({ wallets }:{ wallets: IUser['wallets']}) => {
        let offset = 0;
        const entities: any = [];
    
        const header = 
            "══════[ 🐐 GoatBot 🐐 ]══════\n\n"+
            "🐐 GoatBot | Website\n"+
            "使用所有 Telegram 機器人中最出色的 GOATBOT 提升您的加密貨幣交易 \n\n"+
            "══🔳 你的錢包 🔳══\n\n"
        offset += header.length;
    
        const walletTexts = wallets.map((wallet, index) => {
            // Add entity for "Wallet_wX"
            entities.push({ offset: offset + 2, length: `Wallet_w${index + 1}`.length, type: 'bold' });
            entities.push({
                offset: offset + 2,
                length: `Wallet_w${index + 1}`.length,
                type: 'text_link',
                url: `https://etherscan.io/address/${wallet.address}`
            });
            offset += `▰ Wallet_w${index + 1} ▰\n\n`.length;
    
            // Add entity for balance and transactions
            const balanceText = `Bal: ${wallet.balance} ETH\n`;
            offset += balanceText.length;
    
            // Add entity for wallet address (bold and text_link)
            entities.push({ offset: offset+" address: ".length, length: wallet.address.length, type: 'code' });
            offset += `Address: ${wallet.address}\`\n`.length;

            entities.push({ offset: offset+" private key: ".length, length: this.decryptToken(wallet.private_key).length, type: 'code' });
            offset += `Private key: ${this.decryptToken(wallet.private_key)}\`\n\n`.length;
    
            return `▰ Wallet_w${index + 1} ▰\n${balanceText}\n address: ${wallet.address}\n private key: ${this.decryptToken(wallet.private_key)}\n\n`;
        });
    
        const text = header + walletTexts.join('');
    
        return { text, entities };
    };

    static generateWalletBalanceEntities = (
        { message = "使用 GOATBOT 提升您的加密貨幣交易——所有 Telegram 機器人中最出色的",balances }:{ message?: string, balances: IOtherWallet[]}
    ) => {
        let offset = 0;
        const entities: any = [];
        
        const header = 
            "══════[ 🐐 GoatBot 🐐 ]══════\n\n"+
            "🐐 GoatBot | 網站 | 教學\n"+
            `${message} \n\n`+
            "══🔳 Your Wallets 🔳══\n\n"
        offset += header.length;
    
        const walletTexts = balances.map((balance, index) => {
            entities.push({ offset: offset + 2, length: `${balance.coin_name}`.length, type: 'bold' });
            entities.push({
                offset: offset + 2,
                length: `${balance.coin_name}`.length,
                type: 'text_link',
                url: `https://etherscan.io/address/${balance.contract_address ?? "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"}`
            });
            offset += `▰ ${balance.coin_name} ▰\n\n`.length;
    
            // Add entity for balance and transactions
            const balanceText = `Bal: ${balance.balance} ${balance.coin_name} (${balance.balance_in_dollar}) \n \-`;
            offset += balanceText.length;
    
            // Add entity for wallet address (bold and text_link)
            entities.push({ offset: offset, length: (`${balance.contract_address ?? "eth"}\n`).length, type: 'code' });
            offset += `${balance.contract_address ?? "eth"}\n`.length;
    
            return `▰ ${balance.coin_name} ▰\n ${balanceText}${balance.contract_address ?? "eth"}\n\n`;
        });

        if (walletTexts.length < 1) {
            walletTexts.push("你的錢包裡沒有代幣")
        }
    
        const text = header + walletTexts.join('');
    
        return { text, entities };
    };

    static buyNotificationMessage = (user: IUser, data: ICallback) => {
        let offset = 0;
        const entities: any = [];
        
        let text =  "══════[ 🐐 GoatBot 🐐 ]══════\n\n"
        text += "address:  ";

        entities.push({
            offset: text.length,
            length: data.wallet.length,
            type: 'text_link',
            url: `https://etherscan.io/address/${data.wallet}`
        });

        text += data.wallet;
        text += "\n";
        text += "transaction hash : "

        entities.push({
            offset: text.length,
            length: data.transactionHash.length,
            type: 'text_link',
            url: `https://etherscan.io/address/${data.transactionHash}`
        });
        text += data.transactionHash
        text += "\n";
        text += "amount: "
        text += data.amount
        text += "\n"
        text += "transaction type: "
        text += data.transactionType
        text += "\n";
    
        return { text, entities,  disable_web_page_preview: true };
    }
}
export class ModernChineseMessageEarnTemplate {
    static generateReferalMessage = (user: IUser) => {
        const entities: any = [];
    
        let text = 
            "══════[🐐山羊機器人🐐]══════\n\n"+
            "在 GoatBot 上推出無縫推薦體驗！當您的朋友使用您的推薦加入時\n"+
            "代碼，你們倆都賺取 1 $GOAT。要解鎖此獎金，請確保您的錢包中持有 4 個 GOAT 代幣\n"+
            "每位推薦用戶可享 30 天。今天就開始推薦並累積 $GOAT!\n\n"+
            "參與 goatbot 推薦計畫🤝。推薦、賺取、持有 $GOAT 並領取您的收入。\n\n"+
            "══🔳您的推薦資訊🔳══\n\n"+
            "推薦碼: "+(user?.referal?.referalCode ?? "code")+"\n\n";

        entities.push({
            offset: text.length - ((user?.referal?.referalCode ?? "code")?.length + 2),
            length: (user?.referal?.referalCode ?? "code").length,
            type: 'code',
        });
        
        text += 
            "總推薦數: "+(user?.referal?.totalEarnings ?? 0)+" \n\n"+
            "總收入: "+(user?.referal?.totalEarnings ?? 0)+" $Goat \n\n"+
            "可索取的收入: "+(user?.referal?.claimableEarnings ?? 0)+" $Goat \n\n";
    
        return { text, entities };
    }
}