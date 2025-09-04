import { FSHelper } from '../index'

async function main() {
    const fs = new FSHelper();
    await fs.rmr('../../../zip (copie)')
}

main().then(() => console.log('done'))
