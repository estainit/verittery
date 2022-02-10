# The only Verifiable "Pick 4" Lottery

This repository contains proper solidity codes and a simple frontend for lottery game.

## What is the Verifiable randomness, and why it sholud be considered?

The verifiable randomness is a mechanisem by which every participators in an activity are sure about randomly selecting a winner (or a group of winners). Each participator can validate the results and being sure the fact that the selection wasn't biased.
This randomness is useful (and sometimes crutial) in games and some governing situations. For example in order to be sure the validator of next block is selected pure randomly, or to find the first player in a game, or ...
Here we have used this algorithm for a lottery game. Participants in each round of the game can personally check and confirm the correctness and operation of the algorithm.

## How this algorithm works

Each game has 2 stages.

- In the first stage, each player takes a random number and sends it in hashed format to smart contract.
- After a certain time frame, the players have to reveal their numbers.
- Smart contract controlls the revealed numbers with their proper hashes which already recorded on blockchain.
- Now the smart contract picks the winner

```sh
order by receiving timestamp
the smart contract takse two number secuentially, lets call them A and B
the logic to select winner is so simple.
if (A==B)
  A is winner (first ticket is winner)

if (A > B){
   if (A/2 < B){
     B is winner
   }else{
     A is winner
   }
}else{
   if (B/2 < A){
     A is winner
   }else{
     B is winner
   }
}

```

**Happy _Randomness_!**
