const ethers = require("ethers");

const num = 20;

async function generate() {
    for (let i = 0; i < num; i++) {
        // uint256
        let n = ethers.toBigInt(ethers.randomBytes(32));
        console.log(n.toString());
    }
}

generate().catch((err) => {
    console.log(err);
    process.exit(1);
});
