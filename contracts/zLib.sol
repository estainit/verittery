//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

// https://github.com/miguelmota/solidity-idiosyncrasies

contract Utils {
    // function stringLength(string memory str) public returns (uint256) {
    //     uint256 length = 0;
    //     uint256 i = 0;
    //     bytes memory strBytes = bytes(str);

    //     while (i < strBytes.length) {
    //         if (strBytes[i] >> 7 == 0) {
    //             i += 1;
    //         } else if (strBytes[i] >> 5 == 0x6) {
    //             i += 2;
    //         } else if (strBytes[i] >> 4 == 0xE) {
    //             i += 3;
    //         } else if (strBytes[i] >> 3 == 0x1E) {
    //             i += 4;
    //         } else {
    //             i += 1;
    //         }

    //         length++;
    //     }
    // }

    // function addressToString(address addr) public returns (string calldata) {
    //     bytes memory b = new bytes(20);
    //     for (uint256 i = 0; i < 20; i++) {
    //         b[i] = bytes1(uint8(uint256(addr) / (2**(8 * (19 - i)))));
    //     }
    //     return string(b);
    // }

    // function bytes32ToString(bytes32 x) public view returns (string memory) {
    //     bytes memory bytesString = new bytes(32);
    //     uint256 charCount = 0;
    //     for (uint256 j = 0; j < 32; j++) {
    //         bytes1 char = bytes1(bytes32(uint256(x) * 2**(8 * j)));
    //         if (char != 0) {
    //             bytesString[charCount] = char;
    //             charCount++;
    //         }
    //     }
    //     bytes memory bytesStringTrimmed = new bytes(charCount);
    //     for (uint256 j = 0; j < charCount; j++) {
    //         bytesStringTrimmed[j] = bytesString[j];
    //     }
    //     return string(bytesStringTrimmed);
    // }

    // function bytesToAddress(bytes calldata _address) public returns (address) {
    //     uint160 m = 0;
    //     uint160 b = 0;

    //     for (uint8 i = 0; i < 20; i++) {
    //         m *= 256;
    //         b = uint160(_address[i]);
    //         m += (b);
    //     }

    //     return address(m);
    // }
}
