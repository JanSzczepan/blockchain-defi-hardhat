import { getWeth } from './getWeth'

async function main() {
   await getWeth()
}

main()
   .then(() => process.exit(0))
   .catch((e) => {
      console.error(e)
      process.exit(1)
   })
