// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Hasher} from "./MiMC5Sponge.sol";
import {ReentrancyGuard} from "./ReentrancyGuard.sol";

interface IVerifier {
    function verifyProof(
        uint[2] calldata a,
        uint[2][2] calldata b,
        uint[2] calldata c,
        uint[3] calldata input
    ) external;
}

contract Tornado is ReentrancyGuard {
    error Tornado__DepositAmountInvalid();
    error Tornado__DuplicateCommitment();
    error Tornado__TreeFull();
    error Tornado__AlreadySpent();
    error Tornado__NotRoot();
    error Tornado__ProofInvalid();
    error Tornado__PaymentFailed();

    address verifier;
    Hasher hasher;

    uint8 public treeLevel = 10;
    uint256 public denomination = 1 ether; // 1 ETH
    uint256 public nextLeafIdx = 0; // 下一个叶子节点索引

    mapping(uint256 => bool) public roots;
    mapping(uint8 => uint256) public lastLevelHash;
    mapping(uint256 => bool) public nullifierHashes;
    mapping(uint256 => bool) public commitments;

    uint256[10] levelDefaults = [
        45746124336667668771272876581171488238527511665968299621767714263924626198616,
        56245745170010623041481857868446302897575646028954227141897422409025452484626,
        46872487164984761411716043728502812938747428370770841714136164411052487030819,
        20498187957985370276184752431063476878269850000550780140798964382873641555484,
        13125451477187387604885097558488808260345123601481278389705122520126671498700,
        33926859176440688612045633305202518250580068186561302874398262750676945959727,
        70983669370537487980542244549277029280260724908059671028091818047887616126926,
        99324812762296045589810608258103973271082505359595516800228297678541886713740,
        32079643823298354935632551306851131517503225315725391379516851253948923140186,
        34953895695030442110021356845109859074115160811390932865343872788568256045930
    ];

    event Deposit(
        uint256 root,
        uint256[10] hashPairings,
        uint8[10] hashDirections
    );
    event Withdrawal(address to, uint256 nullifierHash);

    constructor(address _hasher, address _verifier) {
        hasher = Hasher(_hasher);
        verifier = _verifier;
    }

    function deposit(uint256 _commitment) external payable nonReentrant {
        if (msg.value != denomination) revert Tornado__DepositAmountInvalid();
        if (commitments[_commitment]) revert Tornado__DuplicateCommitment();
        if (nextLeafIdx >= 2 ** treeLevel) revert Tornado__TreeFull();

        uint256 newRoot;
        uint256[10] memory hashPairings; // 哈希对
        uint8[10] memory hashDirections; // 哈希方向

        uint256 currentIdx = nextLeafIdx;
        uint256 currentHash = _commitment;

        uint256 left;
        uint256 right;
        uint256[2] memory ins;

        // 遍历整个默克尔树的每一层
        for (uint8 i = 0; i < treeLevel; i++) {
            // 保存当前层的哈希值，用于后续计算
            lastLevelHash[treeLevel] = currentHash;

            if (currentIdx % 2 == 0) {
                // 如果当前索引是偶数，说明是左节点
                left = currentHash; // 左节点使用当前哈希
                right = levelDefaults[i]; // 右节点使用该层的默认值
                hashPairings[i] = levelDefaults[i]; // 记录配对的哈希值（右节点）
                hashDirections[i] = 0; // 记录方向为左（0）
            } else {
                // 如果当前索引是奇数，说明是右节点
                left = lastLevelHash[i]; // 左节点使用上一个保存的哈希值
                right = currentHash; // 右节点使用当前哈希
                hashPairings[i] = lastLevelHash[i]; // 记录配对的哈希值（左节点）
                hashDirections[i] = 1; // 记录方向为右（1）
            }

            // 准备输入数组用于哈希计算
            ins[0] = left;
            ins[1] = right;

            // 使用 MiMC5Sponge 哈希函数计算父节点的哈希值
            // 设置 gas 限制为 150000，使用 _commitment 作为额外输入
            uint256 h = hasher.MiMC5Sponge{gas: 150000}(ins, _commitment);

            // 更新当前哈希值为新计算的父节点哈希
            currentHash = h;
            // 更新索引，向上移动到父节点的位置（除以2）
            currentIdx = currentIdx / 2;
        }
        newRoot = currentHash;
        roots[newRoot] = true;
        nextLeafIdx++;

        // 为下一次存款准备
        commitments[_commitment] = true;
        emit Deposit(newRoot, hashPairings, hashDirections);
    }

    function withdraw(
        uint[2] calldata a,
        uint[2][2] calldata b,
        uint[2] calldata c,
        uint[2] calldata input
    ) external payable nonReentrant {
        uint256 _root = input[0];
        uint256 _nullifierHash = input[1];

        if (nullifierHashes[_nullifierHash]) {
            revert Tornado__AlreadySpent();
        }
        if (!roots[_root]) {
            revert Tornado__NotRoot();
        }

        uint256 _addr = uint256(uint160(msg.sender));

        (bool verifyOK, ) = verifier.call(
            abi.encodeCall(
                IVerifier.verifyProof,
                (a, b, c, [_root, _nullifierHash, _addr])
            )
        );
        if (!verifyOK) {
            revert Tornado__ProofInvalid();
        }

        nullifierHashes[_nullifierHash] = true;
        address payable target = payable(msg.sender);

        (bool ok, ) = target.call{value: denomination}("");
        if (!ok) {
            revert Tornado__PaymentFailed();
        }
        emit Withdrawal(msg.sender, _nullifierHash);
    }
}
