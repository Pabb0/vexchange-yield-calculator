import CoinGecko from 'coingecko-api';

const getPrice = async () => {
	const CoinGeckoClient = new CoinGecko();
	return CoinGeckoClient.simple.price(
		{
			ids: ['vechain'],
			vs_currencies: ['eur'],
	});
}

export default getPrice;