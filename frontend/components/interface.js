import {useState} from "react";
import $u from "../utils/$u";
import {ethers} from "ethers";
import {tornadoAbi} from "../constants/tornadoAbi";

const wc = require("../circuit/witness_calculator.js");
const tornadoAddress = "0xdc64a140aa3e981100a9beca4e685f962f0cf6c9";

const Interface = () => {
    const [account, updateAccount] = useState(null);
    const [proofElements, updateProofElements] = useState(null);
    const [proofStringEl, updateProofStringEl] = useState(null);
    const [textArea, updateTextArea] = useState(null);
    let provider;
    let signer;

    const connectMetaMask = async () => {
        try {
            if (!window.ethereum) {
                alert("Please install MetaMask to use this app.");
                throw "no-metamask";
            }
            const [account] = await window.ethereum.request({method: "eth_requestAccounts"});
            provider = new ethers.BrowserProvider(window.ethereum);
            signer = await provider.getSigner();
            var network = await provider.getNetwork();
            var chainId = network.chainId;
            var balance = await provider.getBalance(account);
            balance = $u.moveDecimalLeft(ethers.toBigInt(balance).toString(), 18);

            var newAccountState = {
                chainId: chainId.toString(),
                address: account,
                balance: balance,
            };
            updateAccount(newAccountState);
        } catch (error) {
            console.error(error);
        }
    };

    const depositEther = async () => {
        const secret = ethers.toBigInt(ethers.randomBytes(32)).toString();
        const nullifier = ethers.toBigInt(ethers.randomBytes(32)).toString();

        const input = {
            secret: $u.BN256ToBin(secret).split(""),
            nullifier: $u.BN256ToBin(nullifier).split(""),
        };

        var res = await fetch("/deposit.wasm");
        var buffer = await res.arrayBuffer();
        var depositWC = await wc(buffer);

        const r = await depositWC.calculateWitness(input, 0);

        const commitment = r[1];
        const nullifierHash = r[2];

        const value = ethers.parseEther("1");
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(tornadoAddress, tornadoAbi, signer);

            // 监听Deposit事件
            contract.on("Deposit", (newRoot, hashPairings, hashDirections, event) => {
                console.log(newRoot);
                const proofElements = {
                    root: $u.BNToDecimal(newRoot),
                    nullifierHash: `${nullifierHash}`,
                    secret: secret,
                    nullifier: nullifier,
                    commitment: `${commitment}`,
                    hashPairings: hashPairings.map((item) => $u.BNToDecimal(item)),
                    hashDirections: hashDirections.map((item) => $u.BNToDecimal(item)),
                };
                console.log(proofElements);
                updateProofElements(btoa(JSON.stringify(proofElements)));
                event.removeListeners();
            });

            // 发送交易
            const tx = await contract.deposit(commitment, {value: value});
            await tx.wait();
        } catch (e) {
            console.log(e);
        }
    };

    const copyProof = () => {
        if (!!proofStringEl) {
            navigator.clipboard.writeText(proofStringEl.innerHTML);
        }
    };

    const withdraw = async () => {
        if (!textArea || !textArea.value) {
            alert("Please input the proof of deposit string.");
        }
        try {
            const proofString = textArea.value;
            const proofElements = JSON.parse(atob(proofString));
            const SnarkJS = window["snarkjs"];

            const proofInput = {
                root: proofElements.root,
                nullifierHash: proofElements.nullifierHash,
                recipient: $u.BNToDecimal(account.address),
                secret: $u.BN256ToBin(proofElements.secret).split(""),
                nullifier: $u.BN256ToBin(proofElements.nullifier).split(""),
                hashPairings: proofElements.hashPairings,
                hashDirections: proofElements.hashDirections,
            };

            const {proof, publicSignals} = await SnarkJS.groth16.fullProve(
                proofInput,
                "/withdraw.wasm",
                "/setup_final.zkey"
            );

            /* const callInputs = [
                proof.pi_a.slice(0, 2).map($u.BN256ToHex),
                proof.pi_b.slice(0, 2).map((row) => $u.reverseCoordinate(row.map($u.BN256ToHex))),
                proof.pi_c.slice(0, 2).map($u.BN256ToHex),
                publicSignals.slice(0, 2).map($u.BN256ToHex),
            ]; */

            const a = proof.pi_a.slice(0, 2).map($u.BN256ToHex);
            const b = proof.pi_b
                .slice(0, 2)
                .map((row) => $u.reverseCoordinate(row.map($u.BN256ToHex)));
            const c = proof.pi_c.slice(0, 2).map($u.BN256ToHex);
            const input = publicSignals.slice(0, 2).map($u.BN256ToHex);

            try {
                const provider = new ethers.BrowserProvider(window.ethereum);
                const signer = await provider.getSigner();
                const contract = new ethers.Contract(tornadoAddress, tornadoAbi, signer);

                const tx = await contract.withdraw(a, b, c, input);
                await tx.wait();

                console.log(tx);
            } catch (e) {
                console.log(e);
            }
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <div>
            {!!account ? (
                <div>
                    <p>ChainId: {account.chainId}</p>
                    <p>Wallet Address: {account.address}</p>
                    <p>Balance: {account.balance} ETH</p>
                </div>
            ) : (
                <div>
                    <button onClick={connectMetaMask}>Connnect MetaMask</button>
                </div>
            )}
            <div>
                <hr />
            </div>

            {!!account ? (
                <div>
                    {!!proofElements ? (
                        <div>
                            <p>
                                <strong>Proof of Deposit:</strong>
                            </p>
                            <div style={{maxWidth: "100vw", overflowWrap: "break-word"}}>
                                <span
                                    ref={(proofStringEl) => {
                                        updateProofStringEl(proofStringEl);
                                    }}
                                >
                                    {proofElements}
                                </span>
                            </div>
                            {!!proofStringEl && (
                                <button onClick={copyProof}>Copy Proof String</button>
                            )}
                        </div>
                    ) : (
                        <button onClick={depositEther}>Deposit 1 ETH</button>
                    )}
                </div>
            ) : (
                <div>
                    <p>You need to connect MetaMask to use this section.</p>
                </div>
            )}
            <div>
                <hr />
            </div>

            {!!account ? (
                <div>
                    <div>
                        <textarea
                            ref={(ta) => {
                                updateTextArea(ta);
                            }}
                        ></textarea>
                    </div>
                    <button onClick={withdraw}>Withdraw 1 ETH</button>
                </div>
            ) : (
                <div>
                    <p>You need to connect MetaMask to use this section.</p>
                </div>
            )}
        </div>
    );
};

export default Interface;
