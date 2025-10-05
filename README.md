# Neuraverse Auto Bot

Automated token swap bot for Neura Protocol Testnet. This bot supports multiple wallets and can perform automatic back-and-forth swaps.

## Features

- ✅ Multi-wallet support (handle multiple wallets simultaneously)
- ✅ Auto token swap with retry mechanism
- ✅ Automatic back-and-forth swaps (A→B then B→A)
- ✅ Auto ERC20 token approval
- ✅ Support for native token (ANKR) and ERC20 tokens
- ✅ Automatic token list fetching from subgraph

## Requirements

- Node.js version 16 or higher
- npm or yarn
- Wallet private key with ANKR balance on Neura Testnet

## Installation

1. Clone this repository:
```bash
git clone https://github.com/vikitoshi/Neuraverse-Auto-Bot.git
cd Neuraverse-Auto-Bot
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in the root folder:
```bash
cp .env.example .env
```

4. Edit `.env` file and add your wallet private keys:
```env
PRIVATE_KEY_1=your_private_key_here
PRIVATE_KEY_2=your_private_key_here
PRIVATE_KEY_3=your_private_key_here
```

> **⚠️ IMPORTANT:** Never share your private keys with anyone!

## Usage

1. Run the bot:
```bash
node index.js
```

2. The bot will display a list of available tokens

3. Select tokens to swap:
   - Enter the number for the FROM token (token to swap)
   - Enter the number for the TO token (destination token)

4. Enter the amount of tokens to swap

5. Enter how many times to perform the swap cycle

6. The bot will start swapping automatically for all wallets

## How It Works

The bot will perform the following steps for each wallet:

1. **Swap A → B**: Swap token A to token B
2. **Wait 10 seconds**
3. **Swap B → A**: Swap back token B to token A (using entire balance)
4. **Wait 10 seconds**
5. Repeat the cycle according to the specified number

## File Structure

```
Neuraverse-Auto-Bot/
├── index.js          # Main bot file
├── package.json      # Dependencies and scripts
├── .env             # Configuration file (private keys)
├── .env.example     # Template for .env file
└── README.md        # Documentation
```

## Configuration

### RPC Endpoint
```javascript
const NEURA_RPC = 'https://testnet.rpc.neuraprotocol.io/';
```

### Smart Contracts
- **Swap Router**: `0x5AeFBA317BAba46EAF98Fd6f381d07673bcA6467`
- **WANKR**: `0xbd833b6ecc30caeabf81db18bb0f1e00c6997e7a`

### Retry Settings
- Max retries: 3 attempts
- Delay between retries: 10 seconds
- Gas limit: 600,000

## Tips & Tricks

1. **Native Token Balance**: Ensure wallet has enough ANKR for gas fees
2. **Gas Reserve**: Bot automatically reserves 0.005 ANKR for gas fees
3. **Multiple Wallets**: Add more wallets using `PRIVATE_KEY_N` format in `.env` file
4. **Monitoring**: Watch the colorful logging output for each transaction status

## Troubleshooting

### Error: "No private keys found"
- Make sure `.env` file is created and contains private keys
- Format must be: `PRIVATE_KEY_1=0x...`

### Error: "Insufficient balance"
- Ensure wallet has enough tokens to swap
- Ensure there's ANKR balance for gas fees

### Error: "Swap transaction reverted"
- Check if the token pair has sufficient liquidity
- Wait a moment and try again

### Error: "Failed to fetch tokens"
- Check internet connection
- Subgraph API might be down, try again later

## Security

⚠️ **SECURITY WARNING:**
- Never commit `.env` file to repository
- Never share your private keys with anyone
- Use a separate wallet for testing
- This bot is for Testnet, DO NOT use on Mainnet without thorough code review

## Important Links

- **GitHub**: https://github.com/vikitoshi/Neuraverse-Auto-Bot.git
- **Neura Explorer**: https://testnet.neuraprotocol.io/
- **Neura RPC**: https://testnet.rpc.neuraprotocol.io/

## Disclaimer

This bot is created for educational purposes and testing on Testnet. Use at your own risk. The developer is not responsible for any loss of funds or other issues that may occur.

## License

MIT License

## Contributing

Pull requests and issue reports are welcome! Please open an issue first to discuss major changes.

---
