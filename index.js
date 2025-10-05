const { ethers } = require('ethers');
const axios = require('axios');
const fs = require('fs');
const readline = require('readline');
const dotenv = require('dotenv');

dotenv.config();

const colors = {
    reset: '\x1b[0m', cyan: '\x1b[36m', green: '\x1b[32m', yellow: '\x1b[33m',
    red: '\x1b[31m', white: '\x1b[37m', bold: '\x1b[1m',
};
const logger = {
    info: (msg) => console.log(`${colors.white}[➤] ${msg}${colors.reset}`),
    warn: (msg) => console.log(`${colors.yellow}[⚠] ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}[✗] ${msg}${colors.reset}`),
    success: (msg) => console.log(`${colors.green}[✅] ${msg}${colors.reset}`),
    loading: (msg) => console.log(`${colors.cyan}[⟳] ${msg}${colors.reset}`),
    step: (msg) => console.log(`\n${colors.cyan}${colors.bold}[➤] ${msg}${colors.reset}`),
    banner: () => {
        console.log(`${colors.cyan}${colors.bold}`);
        console.log(`---------------------------------------------`);
        console.log(`   Neura Bot - Airdrop Insiders    `);
        console.log(`---------------------------------------------${colors.reset}\n`);
    },
};

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const ask = (rl, q) => new Promise((res) => rl.question(q, res));

const NEURA_RPC = 'https://testnet.rpc.neuraprotocol.io/';
const CONTRACTS = {
    SWAP_ROUTER: '0x5AeFBA317BAba46EAF98Fd6f381d07673bcA6467',
    WANKR: '0xbd833b6ecc30caeabf81db18bb0f1e00c6997e7a', 
};
const ABIS = {
    SWAP_ROUTER: ['function multicall(bytes[] data) payable returns (bytes[] results)'],
    ERC20: [
        'function approve(address spender, uint256 amount) external returns (bool)',
        'function balanceOf(address account) external view returns (uint256)',
        'function allowance(address owner, address spender) external view returns (uint256)',
        'function decimals() external view returns (uint8)',
    ],
};

const routerIface = new ethers.Interface(ABIS.SWAP_ROUTER);
const abi = ethers.AbiCoder.defaultAbiCoder();

function encodeInnerSwap({ tokenIn, tokenOut, recipient, deadlineMs, amountInWei }) {
    const innerParams = abi.encode(
        ['address','address','uint256','address','uint256','uint256','uint256','uint256'],
        [ tokenIn, tokenOut, 0n, recipient, BigInt(deadlineMs), BigInt(amountInWei), 27n, 0n ]
    );
    return '0x1679c792' + innerParams.slice(2);
}

function encodeRouterMulticall(calls) {
    return routerIface.encodeFunctionData('multicall', [calls]);
}

/**
 * 
 */
async function fetchAvailableTokens() {
    logger.info('Fetching available swap tokens...');
    try {
        const endpoint = "https://api.goldsky.com/api/public/project_cmc8t6vh6mqlg01w19r2g15a7/subgraphs/analytics/1.0.0/gn";
        const query = `query AllTokens { tokens { id symbol name decimals } }`;
        const body = { operationName: "AllTokens", variables: {}, query: query };
        const response = await axios.post(endpoint, body);
        const tokens = response.data.data.tokens;
        
        const uniqueTokens = new Map();
        for (const token of tokens) {
            if (!token.symbol || token.symbol.includes(' ')) continue;
            const symbol = token.symbol.toUpperCase();
            if (!uniqueTokens.has(symbol)) {
                uniqueTokens.set(symbol, {
                    address: token.id,
                    symbol: symbol,
                    decimals: parseInt(token.decimals, 10),
                });
            }
        }

        if (uniqueTokens.has('WANKR')) {
             uniqueTokens.set('ANKR', { ...uniqueTokens.get('WANKR'), symbol: 'ANKR' });
        }
        
        logger.success(`Found ${uniqueTokens.size} unique swappable tokens.`);
        return Array.from(uniqueTokens.values()).sort((a,b) => a.symbol.localeCompare(b.symbol));
    } catch (e) {
        logger.error(`Failed to fetch tokens: ${e.message}`);
        return [];
    }
}


/**
 * 
 */
class SwapBot {
    constructor(privateKey) {
        this.provider = new ethers.JsonRpcProvider(NEURA_RPC);
        this.wallet = new ethers.Wallet(privateKey, this.provider);
        this.address = this.wallet.address;
    }

    /**
     * 
     * @param {object} tokenIn
     * @param {object} tokenOut 
     * @param {string} amountInStr
     */
    async performSwap(tokenIn, tokenOut, amountInStr) {
        if (!amountInStr || isNaN(parseFloat(amountInStr)) || parseFloat(amountInStr) <= 0) {
            throw new Error(`Invalid or zero amount provided: "${amountInStr}"`);
        }

        logger.step(`Swapping ${amountInStr} ${tokenIn.symbol} → ${tokenOut.symbol}...`);
        try {
            const amountInWei = ethers.parseUnits(amountInStr, tokenIn.decimals);
            const isNativeSwapIn = tokenIn.symbol === 'ANKR';

            if (!isNativeSwapIn) {
                const tokenContract = new ethers.Contract(tokenIn.address, ABIS.ERC20, this.wallet);
                const allowance = await tokenContract.allowance(this.address, CONTRACTS.SWAP_ROUTER);

                if (allowance < amountInWei) {
                    logger.loading(`Approving ${tokenIn.symbol} for router...`);
                    const approveTx = await tokenContract.approve(CONTRACTS.SWAP_ROUTER, ethers.MaxUint256);
                    const approveRcpt = await approveTx.wait();
                    if (approveRcpt.status !== 1) throw new Error('Approve transaction failed');
                    logger.success('Approval successful.');
                } else {
                    logger.info('Sufficient allowance already exists.');
                }
            }
            
            const deadlineMs = BigInt(Date.now()) + 20n * 60n * 1000n;
            const tokenInAddressForRouter = isNativeSwapIn ? CONTRACTS.WANKR : tokenIn.address;

            const inner = encodeInnerSwap({
                tokenIn: tokenInAddressForRouter,
                tokenOut: tokenOut.address,
                recipient: this.address,
                deadlineMs,
                amountInWei,
            });
            const data = encodeRouterMulticall([inner]);
            const txValue = isNativeSwapIn ? amountInWei : 0n; 

            logger.info(`Sending swap transaction...`);
            const tx = await this.wallet.sendTransaction({
                to: CONTRACTS.SWAP_ROUTER,
                data,
                value: txValue,
                gasLimit: 600_000,
            });
            logger.loading(`Swap tx sent. Hash: ${tx.hash}`);

            const rcpt = await tx.wait();
            if (rcpt.status !== 1) throw new Error(`Swap tx reverted on-chain.`);
            logger.success(`Swap successful: https://testnet.neuraprotocol.io/tx/${rcpt.hash}`);

        } catch (e) {
            const msg = e?.shortMessage || e?.message || String(e);
            logger.error(`Swap failed: ${msg}`);
            throw e;
        }
    }

    /**
     * 
     * @returns {boolean}
     */
    async performSwapWithRetries(tokenIn, tokenOut, amountInStr, maxRetries = 3) {
        for (let i = 0; i < maxRetries; i++) {
            try {
                await this.performSwap(tokenIn, tokenOut, amountInStr);
                return true; 
            } catch (error) {
                const message = error.shortMessage || error.message || '';
                if (message.includes('Invalid or zero amount provided')) {
                    logger.error(`Swap aborted: ${message}`);
                    return false; 
                }
                
                logger.warn(`Attempt ${i + 1}/${maxRetries} failed: ${message}. Retrying in 10 seconds...`);
                
                if (i === maxRetries - 1) {
                    logger.error(`Swap failed after ${maxRetries} attempts.`);
                    return false; 
                }
                await delay(10000);
            }
        }
        return false;
    }
}

async function main() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    logger.banner();

    const pks = Object.keys(process.env)
        .filter(k => k.startsWith('PRIVATE_KEY_'))
        .map(k => process.env[k])
        .filter(Boolean);

    if (!pks.length) {
        logger.error('No private keys found in .env file. Please add PRIVATE_KEY_1, PRIVATE_KEY_2, etc.');
        rl.close();
        return;
    }
    logger.info(`Found ${pks.length} wallet(s) in .env file.`);

    const tokens = await fetchAvailableTokens();
    if (!tokens.length) {
        rl.close();
        return;
    }

    console.log('\nAvailable tokens:');
    tokens.forEach((t, i) => console.log(`${i + 1}. ${t.symbol}`));

    const fromIndexStr = await ask(rl, '\nEnter number for the token to swap FROM: ');
    const toIndexStr = await ask(rl, 'Enter number for the token to swap TO: ');
    const fromIndex = parseInt(fromIndexStr, 10) - 1;
    const toIndex = parseInt(toIndexStr, 10) - 1;

    if (isNaN(fromIndex) || isNaN(toIndex) || !tokens[fromIndex] || !tokens[toIndex] || fromIndex === toIndex) {
        logger.error('Invalid token selection.');
        rl.close();
        return;
    }
    
    const tokenA = tokens[fromIndex];
    const tokenB = tokens[toIndex];

    const amountAStr = await ask(rl, `Enter amount of ${tokenA.symbol} to swap: `);
    const repeatStr = await ask(rl, 'How many times to swap? ');
    const repeats = parseInt(repeatStr, 10) || 1;

    for (const pk of pks) {
        const bot = new SwapBot(pk);
        logger.step(`--- Processing Wallet ${bot.address.slice(0,10)}... ---`);
        try {
            for (let j = 0; j < repeats; j++) {
                logger.step(`--- Swap Cycle ${j+1}/${repeats} ---`);

                const swapSuccess = await bot.performSwapWithRetries(tokenA, tokenB, amountAStr);

                if (swapSuccess) {
                    logger.loading('Waiting 10s before swapping back...');
                    await delay(10000);
                    
                    let amountBToSwapStr;
                    if (tokenB.symbol === 'ANKR') {
                        const balanceWei = await bot.provider.getBalance(bot.address);
                        const gasReserve = ethers.parseEther('0.005'); 
                        if (balanceWei > gasReserve) {
                            amountBToSwapStr = ethers.formatEther(balanceWei - gasReserve);
                        }
                    } else {
                        const tokenBContract = new ethers.Contract(tokenB.address, ABIS.ERC20, bot.wallet);
                        const tokenBBalance = await tokenBContract.balanceOf(bot.address);
                        if (tokenBBalance > 0n) {
                            amountBToSwapStr = ethers.formatUnits(tokenBBalance, tokenB.decimals);
                        }
                    }

                    if (amountBToSwapStr) {
                        await bot.performSwapWithRetries(tokenB, tokenA, amountBToSwapStr);
                    } else {
                        logger.warn(`No ${tokenB.symbol} balance found to swap back. Skipping reverse swap.`);
                    }
                } else {
                    logger.warn(`Skipping reverse swap because the initial swap from ${tokenA.symbol} to ${tokenB.symbol} failed.`);
                }

                logger.loading('Waiting 10s before next wallet/cycle...');
                await delay(10000);
            }
        } catch (e) {
            logger.error(`Swap flow failed for wallet ${bot.address}: ${e.message}`);
        }
    }

    rl.close();
    logger.success('All swap tasks completed.');
}

main().catch((err) => {
    logger.error(`A critical error occurred: ${err.message}`);
    process.exit(1);
});