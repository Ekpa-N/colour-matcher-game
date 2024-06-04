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

exports.createGame = onRequest({ maxInstances: 10, cors: true, invoker: "public" }, async (request, response) => {
    const { document, defaultPattern, player, isNew } = request.body
    let gameCreated
    const docRef = db.collection('games').doc(document)
    if(isNew) {
        let thisPlayer = {...player[0], isOwner: true}
        gameCreated = await docRef.set({ default: defaultPattern, players: [thisPlayer], turn: "0" })
    }
    if(!isNew) {
        let thisPlayer = {...player, isOwner: false}
        gameCreated = await docRef.update({ players: FieldValue.arrayUnion(thisPlayer)})
    }
    response.send(gameCreated)
})
