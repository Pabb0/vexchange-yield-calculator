import { Fetcher, WVET } from 'vexchange-sdk';
import Web3 from 'web3';
import { thorify } from 'thorify';
import { Driver, SimpleNet } from '@vechain/connex-driver';
import { Framework } from '@vechain/connex-framework';
import { allTokens } from './utils/tokens.js';
import getVolume from './utils/api/getVolume.js';
import getReserves from './utils/api/getReserves.js';
import getLiquidityToken from './utils/api/getLiquidityToken.js';
import CoinGecko from 'coingecko-api';
import dfd from 'danfojs-node'
import pkg from 'nodeplotlib';
const { plot } = pkg;
import info from './info.json'


const net = new SimpleNet("http://45.32.212.120:8669/");
const web3 = thorify(new Web3(), "http://45.32.212.120:8669/");

const driver = await Driver.connect(net);
const connex = new Framework(driver);


const getAllVolumes = async (connex, web3, tokens) => {
	const volumes = new Map();


	await Promise.all(tokens.map(async (value) => {
		const address = value.address
		const volume = await getVolume(connex, web3, address)
		volumes.set(value.name, volume)
	}));

	return volumes;
}

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

const getPrice = async () => {
	const CoinGeckoClient = new CoinGecko();
	return CoinGeckoClient.simple.price(
		{
			ids: ['vechain'],
			vs_currencies: ['usd'],
	});
}



const reserves = await getAllReserves(connex, allTokens)
const liquidityTokens = await getAllLiquidityTokens(connex, web3, allTokens)

const myLiquidity = info['VeChain Thor']['Pool Tokens'] // VET-VTHO

const poolPercentage = myLiquidity / liquidityTokens.get('VeChain Thor')

const totalVetAmount = reserves.get('VeChain Thor').get('Wrapped VET')
const totalVthoAmount = reserves.get('VeChain Thor').get('VeChain Thor')

const amountOfVet = totalVetAmount * poolPercentage
const amountOfVtho = totalVthoAmount * poolPercentage

console.log(`You have ${amountOfVet} amount of VET and ${amountOfVtho} amount of VTHO`)

const df = await dfd.read_csv('./data/VET-VTHO-data.csv')

const startDate = new Date(
	info['VeChain Thor']['Start Date']['year'], 
	info['VeChain Thor']['Start Date']['month'] - 1,
	info['VeChain Thor']['Start Date']['day']) // Month index starts at 0
const dateNow = Date.now()
const elapsed = dateNow - startDate.getTime()
const daysSince = Math.round(elapsed / (1000 * 3600 * 24));

const vthoPerVetPerDay = 0.000432

const prices = await getPrice()
const priceOfVet = prices.data.vechain.usd
const priceOfVtho = priceOfVet*totalVetAmount/totalVthoAmount

const [initialAmountOfVet, initialAmountOfVtho] = df.loc({ rows:[0], columns: ['Amount of VET', 'Amount of VTHO']}).data[0]

const vthoGeneration = initialAmountOfVet * vthoPerVetPerDay * daysSince
const earningsInitialAmount = (initialAmountOfVet * priceOfVet) + (initialAmountOfVtho + vthoGeneration) * priceOfVtho
const earningsNow = amountOfVet * priceOfVet + amountOfVtho * priceOfVtho
const APY = ((earningsNow / earningsInitialAmount) - 1) * (365 / daysSince)

const newColumn = [[daysSince, amountOfVet, amountOfVtho, APY]]
let updatedDf = df.append(newColumn)

const x_values = updatedDf.loc({columns: ['Days passed']}).col_data[0]
const y_values = updatedDf.loc({columns: ['APY']}).col_data[0]

const data = [{x: x_values, y: y_values, type: 'line', name: 'VET-VTHO APY'}];
const layout = {
	title: 'APY', 
	showlegend: true, 
	xaxis: {
		title: 'Days Since'
	}
}

await updatedDf.to_csv('./data/VET-VTHO-data.csv')

plot(data, layout)



