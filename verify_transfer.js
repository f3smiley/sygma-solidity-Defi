const Sygma = require('@sygma/sdk');

const sygma1 = new Sygma({rpcURL: 'https://eth.llamarpc.com'});

async function verifyTransfer(recipient) {
    try {
        const balance = await sygma1.methods.balanceOf(recipient).call();
        console.log(`Balance of ${recipient}: ${balance}`);
    } catch (error) {
        console.error(`Failed to verify transfer: ${error}`);
    }
}

module.exports = verifyTransfer;