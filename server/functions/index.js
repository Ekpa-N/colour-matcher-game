/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const firestore = require('@google-cloud/firestore');
const { FieldValue } = require("firebase-admin/firestore");
const db = new firestore()

// const {initializeApp} = require("firebase-admin/app");
// const {getFirestore} = require("firebase-admin/firestore");


// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


function findTemplate(arrangements) {
    const permutations = getPermutations(["#20958E", "#AFD802", "#DF93D2", "#F7E270", "#B3EBF2"]);

    for (let permutation of permutations) {
        if (arrangements.every(arr => countMatches(arr.arrangement, permutation) === arr.matches)) {
            return permutation;
        }
    }

    return null;
}

function getNewPlay(originalArray, shuffledArray) {
    // First, find the indices where the elements match between the two arrays
    const lockedIndices = [];
    for (let i = 0; i < originalArray.length; i++) {
        if (originalArray[i] === shuffledArray[i]) {
            lockedIndices.push(i);
        }
    }

    // Create a list of indices that are not locked
    const unlockedIndices = [];
    for (let i = 0; i < shuffledArray.length; i++) {
        if (!lockedIndices.includes(i)) {
            unlockedIndices.push(i);
        }
    }

    // Create an array with the elements that are not locked
    const unlockedElements = unlockedIndices.map(index => shuffledArray[index]);

    // Shuffle the unlocked elements
    for (let i = unlockedElements.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [unlockedElements[i], unlockedElements[j]] = [unlockedElements[j], unlockedElements[i]];
    }

    // Place the shuffled elements back into their positions in the array
    const resultArray = [...shuffledArray];
    unlockedIndices.forEach((index, i) => {
        resultArray[index] = unlockedElements[i];
    });

    return resultArray;
}

function getPermutations(array) {
    if (array.length === 0) return [[]];

    const firstElem = array[0];
    const rest = array.slice(1);

    const permutationsWithoutFirst = getPermutations(rest);
    const allPermutations = [];

    permutationsWithoutFirst.forEach((permutation) => {
        for (let i = 0; i <= permutation.length; i++) {
            const permutationWithFirst = [...permutation.slice(0, i), firstElem, ...permutation.slice(i)];
            allPermutations.push(permutationWithFirst);
        }
    })

    return allPermutations;
}

function countMatches(arr1, arr2) {
    let matches = 0;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] === arr2[i]) {
            matches += 1;
        }
    }
    return matches;
}

function isIdentical(arr1, arr2) {
    // Check if the arrays have the same length
    // if (arr1.length !== arr2.length) {
    //     return false;
    // }

    // Compare each element in the arrays
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }

    // If all elements are identical, return true
    return true;
}

function matchChecker(arr1, arr2) {
    let count = 0
    arr1.forEach((colour, idx) => {
        if (colour == arr2[idx]) {
            count = count + 1
        }
    })
    return count
}

function shuffleArray(arr) {
    let shuffledArray = arr.slice(); // Create a copy of the array to avoid mutating the original
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; // Swap elements
    }
    return shuffledArray;
}

// exported functions

exports.createGame = onRequest({ maxInstances: 10, cors: true, invoker: "public" }, async (request, response) => {
    const { document, defaultPattern, player, isNew, isCpu } = request.body
    let gameCreated
    const docRef = db.collection('games').doc(document)
    if (isNew) {
        let thisPlayer = { ...player[0], isOwner: true }
        gameCreated = await docRef.set({ default: defaultPattern, players: [thisPlayer], turn: "0", round: "1", ownerLogged: false, owner: player[0].nickname, timed: false, cpu: false, justMatched: [{ nickname: player[0].nickname, matched: 0, pattern: ["", "", "", "", ""] }] })
    }
    if (!isNew) {
        let thisPlayer = { ...player, isOwner: false }
        let currentGame = await docRef.get()
        let newPlayers = currentGame.data().players.filter(player => player.id != "match-n-botter")
        newPlayers.push(thisPlayer)
        if (isCpu) {
            gameCreated = await docRef.update({ players: FieldValue.arrayUnion(thisPlayer), cpu: true, timed: false, justMatched: FieldValue.arrayUnion({ nickname: thisPlayer.nickname, matched: 0, pattern: ["", "", "", "", ""] }) })
        } else {
            gameCreated = await docRef.update({ players: newPlayers, cpu: false, justMatched: FieldValue.arrayUnion({ nickname: player.nickname, matched: 0, pattern: ["", "", "", "", ""] }) })
        }
    }
    response.send(gameCreated)
})

exports.playerStatus = onRequest({ maxInstances: 10, cors: true, invoker: "public", timeoutSeconds: 180, memory: "1GiB" }, async (request, response) => {
    const { roomID, action } = request.body
    const docRef = db.collection('games').doc(roomID)
    if (action == "delete") {
        let currentGame = await docRef.get()
        let newPlayers = currentGame.data().players.filter(player => player.id != "match-n-botter")
        let botGone = await docRef.update({ players: newPlayers })
        response.send(botGone)
    } else if (action == "play") {
        let currentGame = await docRef.get()
        const bot = currentGame.data().players.find(player => player.id == "match-n-botter")
        if (bot.pattern.length == 0) {
            let thisPlay = shuffleArray(["#20958E", "#AFD802", "#DF93D2", "#F7E270", "#B3EBF2"])
            const matches = matchChecker(thisPlay, currentGame.data().default)
            const isMatched = isIdentical(thisPlay, currentGame.data().default)
            bot.played = thisPlay
            bot.pattern = [...bot.pattern, { arrangement: thisPlay, matches: matches }]
            if (isMatched) {
                bot.roundsWon = (Number(bot.roundsWon) + 1).toString()
            }
            const newPlayers = currentGame.data().players.map((player) => {
                if (player.id == bot.id) {
                    return bot
                }
                return player
            })
            const justMatched = currentGame.data().justMatched.map((item) => {
                if (item.nickname === bot.nickname) {
                    item.matched = matches
                    item.pattern = thisPlay
                    return item
                }
                return item
            })
            const played = await docRef.update({
                players: newPlayers,
                turn: "0",
                justMatched: justMatched
            })
            response.send(played)
        } else if (bot.pattern.length != 0) {
            let thisPlay = bot.level == "easy" ? findTemplate(bot.pattern) : getNewPlay(currentGame.data().default, bot.pattern[bot.pattern.length - 1].arrangement) //getNewPlay(currentGame.data().default, bot.pattern[bot.pattern.length-1].arrangement) //findTemplate(bot.pattern)
            // const hasWon = isIdentical(bot.played, currentGame.data().default)
            // if(hasWon) {
            //     return
            // }
            const isMatched = isIdentical(thisPlay, currentGame.data().default)
            const matches = matchChecker(thisPlay, currentGame.data().default)
            bot.played = thisPlay
            bot.pattern = [...bot.pattern, { arrangement: thisPlay, matches: matches }]
            if (isMatched) {
                bot.roundsWon = (Number(bot.roundsWon) + 1).toString()
            }
            const newPlayers = currentGame.data().players.map((player) => {
                if (player.id == bot.id) {
                    return bot
                }
                return player
            })

            const justMatched = currentGame.data().justMatched.map((item) => {
                if (item.nickname === bot.nickname) {
                    item.matched = matches
                    item.pattern = thisPlay
                    return item
                }
                return item
            })
            const played = await docRef.update({
                players: newPlayers,
                turn: "0",
                justMatched: justMatched
            })
            response.send(played)
        }
    }
})

exports.updateTurn = onRequest({ maxInstances: 10, cors: true, invoker: "public" }, async (request, response) => {
    const { roomID, turn } = request.body
    let gameCreated
    const docRef = db.collection('games').doc(roomID)
    gameCreated = await docRef.update({ turn: turn })
    response.send(gameCreated)
})
