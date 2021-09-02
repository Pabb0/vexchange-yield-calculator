import { utils } from 'ethers'
import { Pair, WVET } from 'vexchange-sdk'
import PairABI from '../abis/IVexchangeV2Pair.json'
import lodash from 'lodash'

const getReserves = async (connex, token1, token1Name) => {
	const token0 = WVET[1]
	const pairAddress = Pair.getAddress(token0, token1)
	const getReservesABI = lodash.find(PairABI.abi, { name: 'getReserves' })
	const getResevesMethod = connex.thor.account(pairAddress).method(getReservesABI)

	const reserves = await getResevesMethod.call().then(data => data.decoded)
	const { reserve0, reserve1 } = reserves


	const returnMap = new Map();
	returnMap.set(token0.name, parseFloat(utils.formatUnits(reserve1, 18)))
	returnMap.set(token1Name, parseFloat(utils.formatUnits(reserve0, 18)))
	return returnMap
}

export default getReserves