import { WVET, Fetcher} from 'vexchange-sdk';
import PairABI from '../abis/IVexchangeV2Pair.json'
import Big from 'big.js';

const weiToEth = b => b.div(Big("1000000000000000000"));


const getLiquidityToken = async (connex, web3, address) => {
    const token = await Fetcher.fetchTokenData(1, address, connex);
	const wvet = WVET[1];
	const pair = await Fetcher.fetchPairData(wvet, token, connex);

	const pairContract = new web3.eth.Contract(PairABI.abi, pair.liquidityToken.address); 
    const lpAmount = await pairContract.methods.totalSupply().call();

	return parseFloat(weiToEth(Big(lpAmount)));
};
    
export default getLiquidityToken