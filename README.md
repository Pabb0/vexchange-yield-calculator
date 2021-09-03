# Vexchange Yield Calculator

Starting project to get some practice with the Vexchange SDK.

This project tracks the APY of the most popular tokens on Vexchange (in an LP with VET):
  - VeThor Token
  - OceanEx
  - Safe Haven
  - VIMworld
  - VPunks Token
## Prerequisites
- Node.js
## How to run for the first time
- Clone the repository
- Add your info to [initial JSON file](info.json)
  - For every token you can set the amount of LP tokens you have (check [Vexchange](https://www.vexchange.io) for this) (or just leave it at 1000 if you just want to see the APY)
  - For every token you need to set the start date ( = current date).
- Run the following commands in your terminal
```
npm install
npm run-script first
npm run-script run
```
After running the script, a HTML page will open showing the forecasted APY's.

## Next runs
```
npm run-script run
```

## Disclaimer
This project is not affiliated with the Vexchange team. It was purely built for fun.



