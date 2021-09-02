import getPrice from './utils/api/getPrice.js'
import dfd from 'danfojs-node'
import info from './info.json'

const updateData = async(reserves, liquidityTokens, tokenName) => {
    const myLiquidity = info[tokenName]['Pool Tokens']
    const poolPercentage = myLiquidity / liquidityTokens.get(tokenName)

    const totalVetAmount = reserves.get(tokenName).get('Wrapped VET')
    const totalOtherAmount = reserves.get(tokenName).get(tokenName)

    const amountOfVet = totalVetAmount * poolPercentage
    const amountOther = totalOtherAmount * poolPercentage

    let df = await dfd.read_csv(`./data/${tokenName}.csv`)

    const startDate = new Date(
	info[tokenName]['Start Date']['year'], 
	info[tokenName]['Start Date']['month'] - 1,
	info[tokenName]['Start Date']['day']) // Month index starts at 0
    
    const dateNow = Date.now()
    const elapsed = dateNow - startDate.getTime()
    const daysSince = Math.round(elapsed / (1000 * 3600 * 24));

    const vthoPerVetPerDay = 0.000432

    const prices = await getPrice()
    
    const priceOfVet = prices.data.vechain.usd 
    const priceOfOther = priceOfVet * totalVetAmount/totalOtherAmount
    const priceOfVtho = priceOfVet * reserves.get('VeChain Thor').get('Wrapped VET') / reserves.get('VeChain Thor').get('VeChain Thor')

    const [initialAmountOfVet, initialAmountOfOther] = df.loc({ rows:[0], columns: ['VET', tokenName]}).data[0]

    const vthoGeneration = initialAmountOfVet * vthoPerVetPerDay * daysSince
    const earningsInitialAmount = (initialAmountOfVet * priceOfVet) + (vthoGeneration * priceOfVtho) + (initialAmountOfOther * priceOfOther)
    
    const earningsNow = amountOfVet * priceOfVet + amountOther * priceOfOther
    const APY = ((earningsNow / earningsInitialAmount) - 1) * (365 / daysSince)

    const newColumn = [[daysSince, amountOfVet, amountOther, APY]]
    let updatedDf = df.append(newColumn)

    const x_values = updatedDf.loc({columns: ['Days passed']}).col_data[0]
    const y_values = updatedDf.loc({columns: ['APY']}).col_data[0]

    // await updatedDf.to_csv(`./data/${tokenName}.csv`)
    const data = {x: x_values, y: y_values, type: 'line', name: `${tokenName} APY`};
    
    return data

}

export default updateData;