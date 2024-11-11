const hre = require("hardhat");

async function main() {
    // deploy hasher
    const Hasher = await hre.ethers.getContractFactory("Hasher");
    const hasher = await Hasher.deploy();
    await hasher.waitForDeployment();
    console.log("Hasher deployed to:", hasher.target);

    // deploy verifier
    const Verifier = await hre.ethers.getContractFactory("Groth16Verifier");
    const verifier = await Verifier.deploy();
    await verifier.waitForDeployment();
    console.log("Verifier deployed to:", verifier.target);
    const verifierAddress = verifier.target;

    // deploy tornadp
    const hasherAddress = hasher.target;
    const Tornado = await hre.ethers.getContractFactory("Tornado");
    const tornado = await Tornado.deploy(hasherAddress, verifierAddress);
    await tornado.waitForDeployment();
    console.log("Tornado deployed to:", tornado.target);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
