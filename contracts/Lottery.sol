//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.0;

import "./Admin.sol";

// We import this library to be able to use console.log
// import "hardhat/console.sol";

// This is the main building block for smart contracts.
contract Lottery {
    string public name = "The Simplest and clearest Verifiable Lottery";
    address payable public owner;
    address payable public contractCommissionAddress;
    uint8 public contractCommissionRate = 71; // 7.1 percent
    enum GameState {
        OnGoing,
        Revealing,
        Drawing,
        Finished
    }
    GameState public gameState = GameState.Finished;
    mapping(string => GameState) gameStates;
    bool canStartANewGame = true;
    bytes dummyFlagBytes;
    bytes32 dummyFlag32;
    string dummyFlagStr;

    struct Ticket {
        uint256 _id;
        uint256 ticketLuckyNumber; // this will be revealed in "Revealing" phase
        address payable buyer;
        string ticketHash;
        string buyDate; // in this format 2020-11-27 18:39:01.923
        string playerAliasName;
    }
    mapping(uint256 => Ticket) tickets;
    Ticket theWinner;

    uint256 gameStartedTime;
    uint256 lastTicketSellTime;
    uint256 soldTicketsCount = 0;
    uint256 soldTicketsValue = 0;
    uint256 oneTicketPriceByWei = 1000000 * 100; // 100Gwei
    mapping(string => bool) ticketsHashes;
    mapping(uint256 => string) dummyHashMap;

    // error functions

    // modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // events
    event GameStarted(bool stat, string message);
    event LogTicketSold(
        bool stat,
        address buyer,
        uint256 soldTicketsCount,
        string ticketHash,
        string buyDate,
        string playerAliasName
    );
    event LogDummyBid(string mmssgg, uint256 vall);
    event LogPickedWinner(bool stat, string message, Ticket winner);
    event LogPaidToWinner(address buyer);
    event LogCalculatedWinner(
        bool stat,
        string message,
        uint256 winnerTicketInx
    );

    /**
     * Contract initialization.
     */
    constructor() {
        owner = payable(msg.sender);
        contractCommissionAddress = owner;

        soldTicketsCount = 0;
        soldTicketsValue = 0;

        gameStates["OnGoing"] = GameState.OnGoing;
        gameStates["Revealing"] = GameState.Revealing;
        gameStates["Drawing"] = GameState.Drawing;
        gameStates["Finished"] = GameState.Finished;
    }

    function pauseGame() external onlyOwner {
        canStartANewGame = false;
    }

    function resumeGame() external onlyOwner {
        canStartANewGame = true;
    }

    function deleteCurrentGame() external onlyOwner {
        canStartANewGame = false;

        theWinner.ticketHash = "";
        soldTicketsCount = 0;
        soldTicketsValue = 0;
        gameState = GameState.OnGoing;

        canStartANewGame = true;
    }

    function getContractCommissionRate() external view returns (uint8) {
        return contractCommissionRate;
    }

    function setContractCommissionRate(uint8 rate) external onlyOwner {
        contractCommissionRate = rate;
    }

    function getTicketPriceInWei() external view returns (uint256) {
        return oneTicketPriceByWei;
    }

    function setTicketPriceInWei(uint256 price) external onlyOwner {
        oneTicketPriceByWei = price;
    }

    function changeGameState(string calldata stat) external onlyOwner {
        gameState = gameStates[stat];
    }

    function setContractCommissionAddress(
        address payable _contractCommissionAddress
    ) external onlyOwner {
        contractCommissionAddress = _contractCommissionAddress;
    }

    function getContractCommissionAddress()
        external
        view
        onlyOwner
        returns (address payable)
    {
        return contractCommissionAddress;
    }

    function changeTicketPrice(uint256 _oneTicketPriceByWei)
        external
        onlyOwner
    {
        oneTicketPriceByWei = _oneTicketPriceByWei;
    }

    function dummyBid(address payable theReceiver) public payable {
        //console.log(msg);
        bool sent = theReceiver.send(msg.value); // transfer pledged amounts to owner
        if (!sent) {
            revert("Failed on dummy bid");
        }
        emit LogDummyBid("LogDummyBid: > > > > > > > > ", msg.value);
    }

    function buyATicket(
        string memory ticketHash,
        string memory buyDate,
        uint256 ticketCount,
        string memory playerAliasName
    ) external payable {
        if (!canStartANewGame) {
            revert(
                "The Game is paused for maintenence. Please try again later"
            );
        }

        if (ticketCount != 1) {
            revert("This feature doesn't support yet");
        }

        if (msg.value < oneTicketPriceByWei) {
            revert(
                string(
                    abi.encodePacked(
                        "Your should pay ",
                        oneTicketPriceByWei,
                        " in order to buy ticket!"
                    )
                )
            );
        }

        if (gameState == GameState.Finished) {
            // start new game
            theWinner.ticketHash = "";
            soldTicketsCount = 0;
            soldTicketsValue = 0;
            gameState = GameState.OnGoing;
            gameStartedTime = block.timestamp;
        }

        if (ticketsHashes[ticketHash]) {
            // the hash already existed!
            emit LogTicketSold(
                false,
                msg.sender,
                soldTicketsCount,
                ticketHash,
                "the hash already existed!",
                playerAliasName
            );
        }

        soldTicketsCount++;
        tickets[soldTicketsCount] = Ticket(
            soldTicketsCount,
            0,
            payable(msg.sender),
            ticketHash,
            buyDate,
            playerAliasName
        );
        soldTicketsValue += msg.value;

        lastTicketSellTime = block.timestamp;

        emit LogTicketSold(
            true,
            msg.sender,
            soldTicketsCount,
            ticketHash,
            buyDate,
            playerAliasName
        );
    }

    function pickDummyHashMap() public view returns (string[] memory) {
        string[] memory _dummyHashMap = new string[](soldTicketsCount);
        for (uint256 inx = 1; inx <= soldTicketsCount; inx++) {
            _dummyHashMap[inx - 1] = dummyHashMap[inx];
        }

        return _dummyHashMap;
    }

    function pickDummyFlagBytes() public view returns (bytes memory) {
        return dummyFlagBytes;
    }

    function pickDummyFlag32() public view returns (bytes32) {
        return dummyFlag32;
    }

    function pickDummyFlagStr() public view returns (string memory) {
        return dummyFlagStr;
    }

    function toHex16(bytes16 data) internal pure returns (bytes32 result) {
        uint8 caseSensetiveSwitch = 39; // 7 for upper case
        result =
            (bytes32(data) &
                0xFFFFFFFFFFFFFFFF000000000000000000000000000000000000000000000000) |
            ((bytes32(data) &
                0x0000000000000000FFFFFFFFFFFFFFFF00000000000000000000000000000000) >>
                64);
        result =
            (result &
                0xFFFFFFFF000000000000000000000000FFFFFFFF000000000000000000000000) |
            ((result &
                0x00000000FFFFFFFF000000000000000000000000FFFFFFFF0000000000000000) >>
                32);
        result =
            (result &
                0xFFFF000000000000FFFF000000000000FFFF000000000000FFFF000000000000) |
            ((result &
                0x0000FFFF000000000000FFFF000000000000FFFF000000000000FFFF00000000) >>
                16);
        result =
            (result &
                0xFF000000FF000000FF000000FF000000FF000000FF000000FF000000FF000000) |
            ((result &
                0x00FF000000FF000000FF000000FF000000FF000000FF000000FF000000FF0000) >>
                8);
        result =
            ((result &
                0xF000F000F000F000F000F000F000F000F000F000F000F000F000F000F000F000) >>
                4) |
            ((result &
                0x0F000F000F000F000F000F000F000F000F000F000F000F000F000F000F000F00) >>
                8);
        result = bytes32(
            0x3030303030303030303030303030303030303030303030303030303030303030 +
                uint256(result) +
                (((uint256(result) +
                    0x0606060606060606060606060606060606060606060606060606060606060606) >>
                    4) &
                    0x0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F0F) *
                caseSensetiveSwitch
        );
    }

    function toHex(bytes32 data) public pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "0x",
                    toHex16(bytes16(data)),
                    toHex16(bytes16(data << 128))
                )
            );
    }

    function uint2str(uint256 _i) internal pure returns (string memory str) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        j = _i;
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + (j % 10)));
            j /= 10;
        }
        str = string(bstr);
    }

    function revealTicketLuckyNumber(
        string calldata ticketHash,
        uint256 ticketLuckyNumber,
        string calldata theSalt
    ) public returns (bool) {
        for (uint256 i = 1; i <= soldTicketsCount; i++) {
            if (
                (keccak256(abi.encodePacked(tickets[i].ticketHash)) ==
                    keccak256(abi.encodePacked(ticketHash))) &&
                (keccak256(abi.encodePacked(ticketHash)) !=
                    keccak256(abi.encodePacked("")))
            ) {
                // verify the ticket hash
                bytes memory clearText = abi.encodePacked(
                    uint2str(ticketLuckyNumber),
                    ";",
                    tickets[i].buyDate,
                    ";",
                    tickets[i].playerAliasName,
                    ";",
                    theSalt
                );
                bytes32 bytesHash = sha256(clearText);
                //string memory finalHash = string(abi.encodePacked(bytesHash));
                string memory finalHash = toHex((bytesHash));

                if (
                    keccak256(abi.encodePacked((finalHash))) ==
                    keccak256(abi.encodePacked("0x", ticketHash))
                ) {
                    tickets[i].ticketLuckyNumber = ticketLuckyNumber;
                    return true;
                }
            }
        }
        return false;
    }

    // Convert an hexadecimal character to their value
    function fromHexChar(uint8 c) public pure returns (uint8 res) {
        if (bytes1(c) >= bytes1("0") && bytes1(c) <= bytes1("9")) {
            return c - uint8(bytes1("0"));
        }
        if (bytes1(c) >= bytes1("a") && bytes1(c) <= bytes1("f")) {
            return 10 + c - uint8(bytes1("a"));
        }
        if (bytes1(c) >= bytes1("A") && bytes1(c) <= bytes1("F")) {
            return 10 + c - uint8(bytes1("A"));
        }
    }

    // Convert an hexadecimal string to raw bytes
    function fromHex(string memory s) public pure returns (bytes memory) {
        bytes memory ss = bytes(s);
        require(ss.length % 2 == 0); // length must be even
        bytes memory r = new bytes(ss.length / 2);
        for (uint256 i = 0; i < ss.length / 2; ++i) {
            r[i] = bytes1(
                fromHexChar(uint8(ss[2 * i])) *
                    16 +
                    fromHexChar(uint8(ss[2 * i + 1]))
            );
        }
        return r;
    }

    function dummyFillTickets(uint256[] calldata _ticketsLuckyNumbers)
        external
        onlyOwner
    {
        soldTicketsCount = 0;
        for (uint256 inx = 0; inx < _ticketsLuckyNumbers.length; inx++) {
            soldTicketsCount = inx + 1;

            Ticket memory tmpTkt;
            tmpTkt._id = soldTicketsCount;
            tmpTkt.ticketLuckyNumber = _ticketsLuckyNumbers[inx]; // this will be revealed in "Revealing" phase
            // tmpTkt.buyer = "buyer";
            // tmpTkt.ticketHash = "ticketHash";
            // tmpTkt.buyDate = "buyDate";
            // tmpTkt.playerAliasName = "playerAliasName";

            tickets[soldTicketsCount] = tmpTkt;
        }
    }

    function transfer(address payable to, uint256 amount) public onlyOwner {
        //require(msg.sender==owner);
        to.transfer(amount);
    }

    /// for public call
    function getWinner() external view returns (Ticket memory) {
        return theWinner;
    }

    function pickWinner(bool shouldPayToWinner) external {
        pickTheWinner(false, shouldPayToWinner);
    }

    function pickTheWinner(
        bool shouldForceRecalculateWinner,
        bool shouldPayToWinner
    ) internal onlyOwner {
        if (
            !shouldForceRecalculateWinner &&
            (abi.encodePacked(theWinner.ticketHash).length > 0)
        ) {
            emit LogPickedWinner(true, "", theWinner);
            return;
        }

        if (gameState != GameState.Drawing) {
            emit LogPickedWinner(
                false,
                "You can not draw winner in this stage",
                theWinner
            );
            return;
        }

        // calculate and pick the winner(s),
        // for now we just consider tickets by their buy order ascending,
        // but later we will change the order by ticket hash in order to reduce manipulating
        (
            bool calcStat,
            string memory calcMsg,
            uint256 winnerTicketInx
        ) = calculateWinner(false);
        if (!calcStat) emit LogPickedWinner(false, calcMsg, theWinner);

        theWinner = tickets[winnerTicketInx];

        if (shouldPayToWinner) {
            assert(owner == msg.sender);

            theWinner.buyer.transfer(getNetPrizeAmountInToken());
            // bool sent = withdrawWinner({
            //     value:getNetPrizeAmountInToken()
            // }); // transfer pledged amounts to owner
            // if (!sent) {
            //     emit LogPickedWinner(
            //         false,
            //         "Failed in prize transfer",
            //         theWinner
            //     );
            //     return;
            // }

            // emit LogPaidToWinner(theWinner.buyer);
        }

        emit LogPickedWinner(true, "Done! ", theWinner);
    }

    function calculateWinner(bool emitResult)
        public
        returns (
            bool stat,
            string memory,
            uint256 winnerTicketInx
        )
    {
        uint256 firstRevealedTicketIndex = 0;
        for (uint256 i = 1; i <= soldTicketsCount; i++) {
            if (tickets[i].ticketLuckyNumber > 0) {
                firstRevealedTicketIndex = i;
                break;
            }
        }
        if (firstRevealedTicketIndex == 0) {
            if (emitResult)
                emit LogCalculatedWinner(
                    false,
                    "None of tickets are revealed!",
                    0
                );
            return (false, "None of tickets are revealed!", 0);
        }

        uint256 winnerTicketIndex = firstRevealedTicketIndex;
        for (
            uint256 candidInx = 1;
            candidInx <= soldTicketsCount;
            candidInx++
        ) {
            // this ticket already got as first winner
            if (candidInx == firstRevealedTicketIndex) continue;

            // asigning two numbers to compare
            uint256 winnerLuckyNumber = tickets[winnerTicketIndex]
                .ticketLuckyNumber; // previous round winner

            // this ticket didn't revealed yet!
            if (tickets[candidInx].ticketLuckyNumber == 0) continue;

            uint256 candidNumber = tickets[candidInx].ticketLuckyNumber;

            if ((winnerLuckyNumber > 0) && (candidNumber > 0)) {
                if (winnerLuckyNumber == candidNumber) {
                    // the first accurance of the equal number is winner
                    //
                    // bytes memory winnerTicketHash = fromHex(
                    //     tickets[winnerTicketIndex].ticketHash
                    // );
                    // bytes memory currentTicketHash = fromHex(
                    //     tickets[candidInx].ticketHash
                    // );
                    // dummyFlagBytes = winnerTicketHash;
                    // string memory winnerMark = "";
                    // for (uint8 byteNumber = 0; byteNumber < 16; byteNumber++) {
                    //     if (abi.encodePacked(winnerMark).length > 0) continue;
                    //     // compare first 16 bytes of two ticket hashes in order to pick the winner
                    //     if (
                    //         winnerTicketHash[byteNumber] >
                    //         currentTicketHash[byteNumber]
                    //     ) {
                    //         winnerMark = "prev";
                    //     }
                    // }
                    // if (
                    //     keccak256(abi.encodePacked(winnerMark)) ==
                    //     keccak256(abi.encodePacked("prev"))
                    // ) {
                    //     winnerTicketIndex = winnerTicketIndex;
                    // } else {
                    //     winnerTicketIndex = candidInx;
                    // }
                } else {
                    if (winnerLuckyNumber > candidNumber) {
                        if (candidNumber > (winnerLuckyNumber / 2) + 1) {
                            winnerTicketIndex = candidInx;
                        }
                    } else {
                        if (winnerLuckyNumber < (candidNumber / 2) + 1) {
                            winnerTicketIndex = candidInx;
                        }
                    }
                }
            }
        }

        if (emitResult)
            emit LogCalculatedWinner(true, "Done", winnerTicketIndex);

        return (true, "Done", winnerTicketIndex);
    }

    function withdrawWinner() public payable onlyOwner returns (bool) {
        return theWinner.buyer.send(msg.value);
    }

    function getDrawingDate() external {
        // Drawing will start in next 25 minutes!
    }

    function extractTickets() public view returns (Ticket[] memory) {
        Ticket[] memory ticketsList = new Ticket[](soldTicketsCount);
        for (uint256 inx = 1; inx <= soldTicketsCount; inx++) {
            ticketsList[inx - 1] = tickets[inx];
        }
        return ticketsList;
    }

    function getReminedTime() external view returns (uint256, uint256) {
        return (block.timestamp, lastTicketSellTime);
    }

    function getContractBalance() public view returns (uint256) {
        return owner.balance;
    }

    function getPrizeAmountInToken() public view returns (uint256) {
        return soldTicketsValue; // (oneTicketPriceByWei * soldTicketsCount);
    }

    function getCurrentGameCommission()
        external
        view
        onlyOwner
        returns (uint256)
    {
        return getPrizeCommissionInToken();
    }

    function getPrizeCommissionInToken() internal view returns (uint256) {
        return ((getPrizeAmountInToken() * contractCommissionRate) / 10000);
    }

    function getNetPrizeAmountInToken() public view returns (uint256) {
        return getPrizeAmountInToken() - getPrizeCommissionInToken();
    }

    function getGameInfo()
        external
        view
        returns (
            GameState,
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        return (
            gameState,
            soldTicketsCount,
            getNetPrizeAmountInToken(),
            block.timestamp,
            lastTicketSellTime
        );
    }

    // function getBetByticketHash(string calldata ticketHash)
    //     public
    //     view
    //     returns (Bet memory)
    // {
    //     Bet memory bet = tickets[ticketHash];
    //     return bet;
    // }

    function endGame() public onlyOwner {}
}
