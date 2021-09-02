import { Fetcher } from 'vexchange-sdk';
import Web3 from 'web3';
import { thorify } from 'thorify';
import { Driver, SimpleNet } from '@vechain/connex-driver';
import { Framework } from '@vechain/connex-framework';
import { allTokens } from './utils/tokens.js';
import getVolume from './utils/api/getVolume.js';
import getReserves from './utils/api/getReserves.js';
import getLiquidityToken from './utils/api/getLiquidityToken.js';
import pkg from 'nodeplotlib';
const { plot } = pkg;
import updateData from './updateData.js';


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

const reserves = await getAllReserves(connex, allTokens)
const liquidityTokens = await getAllLiquidityTokens(connex, web3, allTokens)

const dataArray = []
await Promise.all(allTokens.map( async (value) => {
	const name = value.name
	const data = await updateData(reserves, liquidityTokens, name)

	dataArray.push(data);
	
}))

const layout = {
	title: 'APY', 
 	showlegend: true, 
 	xaxis: {
 		title: 'Days Since'
 	}
}

plot(dataArray, layout)
