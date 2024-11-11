export const tornadoAbi = [
    {
        inputs: [
            {
                internalType: "address",
                name: "_hasher",
                type: "address",
            },
            {
                internalType: "address",
                name: "_verifier",
                type: "address",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        inputs: [],
        name: "Tornado__AlreadySpent",
        type: "error",
    },
    {
        inputs: [],
        name: "Tornado__DepositAmountInvalid",
        type: "error",
    },
    {
        inputs: [],
        name: "Tornado__DuplicateCommitment",
        type: "error",
    },
    {
        inputs: [],
        name: "Tornado__NotRoot",
        type: "error",
    },
    {
        inputs: [],
        name: "Tornado__PaymentFailed",
        type: "error",
    },
    {
        inputs: [],
        name: "Tornado__ProofInvalid",
        type: "error",
    },
    {
        inputs: [],
        name: "Tornado__TreeFull",
        type: "error",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint256",
                name: "root",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256[10]",
                name: "hashPairings",
                type: "uint256[10]",
            },
            {
                indexed: false,
                internalType: "uint8[10]",
                name: "hashDirections",
                type: "uint8[10]",
            },
        ],
        name: "Deposit",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "to",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "nullifierHash",
                type: "uint256",
            },
        ],
        name: "Withdrawal",
        type: "event",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        name: "commitments",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "denomination",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_commitment",
                type: "uint256",
            },
        ],
        name: "deposit",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint8",
                name: "",
                type: "uint8",
            },
        ],
        name: "lastLevelHash",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "nextLeafIdx",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        name: "nullifierHashes",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        name: "roots",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "treeLevel",
        outputs: [
            {
                internalType: "uint8",
                name: "",
                type: "uint8",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256[2]",
                name: "a",
                type: "uint256[2]",
            },
            {
                internalType: "uint256[2][2]",
                name: "b",
                type: "uint256[2][2]",
            },
            {
                internalType: "uint256[2]",
                name: "c",
                type: "uint256[2]",
            },
            {
                internalType: "uint256[2]",
                name: "input",
                type: "uint256[2]",
            },
        ],
        name: "withdraw",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
];
