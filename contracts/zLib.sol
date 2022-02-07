
// https://github.com/miguelmota/solidity-idiosyncrasies

stringLength(string memory str) public returns (uint256) {
  uint256 length = 0;
  uint256 i = 0;
  bytes memory strBytes = bytes(str);

  while (i < strBytes.length) {
    if (strBytes[i]>>7 == 0) {
      i+=1;
    } else if (strBytes[i]>>5 == 0x6) {
      i+=2;
    } else if (strBytes[i]>>4 == 0xE) {
      i+=3;
    } else if (strBytes[i]>>3 == 0x1E) {
      i+=4;
    } else {
      i+=1;
    }

    length++;
  }
}

  function addressToString(address addr) returns (string) {
    bytes memory b = new bytes(20);
    for (uint i = 0; i < 20; i++) {
      b[i] = byte(uint8(uint(addr) / (2**(8*(19 - i)))));
    }
    return string(b);
  }

  function bytes32ToString(bytes32 x) constant returns (string) {
    bytes memory bytesString = new bytes(32);
    uint charCount = 0;
    for (uint j = 0; j < 32; j++) {
      byte char = byte(bytes32(uint(x) * 2 ** (8 * j)));
      if (char != 0) {
        bytesString[charCount] = char;
        charCount++;
      }
    }
    bytes memory bytesStringTrimmed = new bytes(charCount);
    for (j = 0; j < charCount; j++) {
      bytesStringTrimmed[j] = bytesString[j];
    }
    return string(bytesStringTrimmed);
  }

  function bytesToAddress(bytes _address) public returns (address) {
    uint160 m = 0;
    uint160 b = 0;

    for (uint8 i = 0; i < 20; i++) {
        m *= 256;
        b = uint160(_address[i]);
        m += (b);
    }

    return address(m);
  }


