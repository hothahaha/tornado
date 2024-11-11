import {ethers} from "ethers";

const utils = {
    moveDecimalLeft: (str, count) => {
        let start = str.length - count;
        let prePadding = "";

        while (start < 0) {
            prePadding += "0";
            start++;
        }

        str = prePadding + str;
        let result = str.slice(0, start) + "." + str.slice(start);
        if (result[0] == ".") {
            result = "0" + result;
        }

        return result;
    },
    BN256ToBin: (str) => {
        let r = BigInt(str).toString(2);
        let prePadding = "";
        let paddingCount = 256 - r.length;
        for (let i = 0; i < paddingCount; i++) {
            prePadding += "0";
        }
        return prePadding + r;
    },
    BN256ToHex: (n) => {
        let nstr = BigInt(n).toString(16);
        while (nstr.length < 64) {
            nstr = "0" + nstr;
        }
        nstr = `0x${nstr}`;
        return nstr;
    },
    BNToDecimal: (bn) => {
        return ethers.toBigInt(bn).toString();
    },
    reverseCoordinate: (p) => {
        let r = [0, 0];
        r[0] = p[1];
        r[1] = p[0];
        return r;
    },
};

export default utils;
