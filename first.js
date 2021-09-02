import { Fetcher } from 'vexchange-sdk';
import Web3 from 'web3';
import { thorify } from 'thorify';
import { Driver, SimpleNet } from '@vechain/connex-driver';
import { Framework } from '@vechain/connex-framework';
import { allTokens } from './utils/tokens.js';
import getReserves from './utils/api/getReserves.js';
import getLiquidityToken from './utils/api/getLiquidityToken.js';
import info from './info.json'
import dfd from 'danfojs-node'



const net = new SimpleNet("http://45.32.212.120:8669/");
const web3 = thorify(new Web3(), "http://45.32.212.120:8669/");

const driver = await Driver.connect(net);
const connex = new Framework(driver);

const getAllReserves = async (connex, tokens) => {
	const reserves = new Map();

	await Promise.all(tokens.map(async (value) => {
		const address = value.address
		const name = value.name
		const token = await Fetcher.fetchTokenData(1, address, connex);
		const reserve = await getReserves(connex, token, name)
		reserves.set(value.name, reserve)
	}));

	return reserves;
}

const getAllLiquidityTokens = async (connex, web3, tokens) => {
	const liquidityTokens = new Map(); 

	await Promise.all(tokens.map(async (value) => {
		const address = value.address
		const name = value.name
		const liquidityToken = await getLiquidityToken(connex, web3, address);
		liquidityTokens.set(name, liquidityToken);
	}))

	return liquidityTokens;
}

const reserves = await getAllReserves(connex, allTokens)
const liquidityTokens = await getAllLiquidityTokens(connex, web3, allTokens)

await Promise.all(allTokens.map( async (value) => {
	const tokenName = value.name

    const myLiquidity = info[tokenName]['Pool Tokens']
    const poolPercentage = myLiquidity / liquidityTokens.get(tokenName)

    const totalVetAmount = reserves.get(tokenName).get('Wrapped VET')
    const totalOtherAmount = reserves.get(tokenName).get(tokenName)

    const amountOfVet = totalVetAmount * poolPercentage
    const amountOther = totalOtherAmount * poolPercentage

    const data = [{ 'Days passed': 0, 'VET': amountOfVet, tokenName: amountOther, 'APY': 0 }]

    const df = new dfd.DataFrame(data)

    await df.to_csv(`./data/${tokenName}.csv`)
	
}))
