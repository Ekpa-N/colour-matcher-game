import { useState, useEffect } from "react";
import { db } from '@/firebase';
import useSWRSubscription from 'swr/subscription'
import { collection, addDoc, getDocs, limit, query, where, doc, updateDoc, setDoc, getDoc, startAt, startAfter, getCountFromServer, serverTimestamp, endBefore, onSnapshot } from "firebase/firestore";
import { isIdentical } from "@/components/helpers";
import axios from "axios";



async function fetchDefaultPattern(playerInfo: string) {
    let newData: any = []
    const docRef = doc(db, "games", playerInfo)
    const docSnapshot = await getDoc(docRef)
    if (docSnapshot.exists()) {
        newData = docSnapshot.data()
    }
    return newData
}

type useSubscriptionProps = {
    playerInfo: {
        nickname: string,
        playerId: string,
        roomId: string,
        url: string
    },
    socket?: any
}

function useSubscription({ playerInfo, socket = "" }: useSubscriptionProps) {
    const [playerData, setPlayerData] = useState<any>({ nickname: "", playerId: "", url: "", roomId: "12345678" })

    useEffect(() => {
        setPlayerData(playerInfo)
    }, [playerInfo])
    const { data, error } = useSWRSubscription(
        ["games", playerData.roomId],
        (key, { next }) => {
            const docRef = doc(db, ...key);
            const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    let thisPlayer = docSnapshot.data().players.find((player: any) => player.id == playerData.playerId)
                    if (!thisPlayer) {
                        next("removed")
                    } else {
                        const allPlayers = docSnapshot.data().players.map((player: any) => {
                            return { nickName: player.nickname, id: player.id }
                        })
                        const leaderBoard = docSnapshot.data().players.map((player: any) => {
                            return { nickName: player.nickname, rounds: player.roundsWon }
                        })
                        let thisPlayerTurn = docSnapshot.data().players.findIndex((player: any) => player.id == playerData.playerId)
                        const ownerLogged = docSnapshot.data().ownerLogged
                        const owner = docSnapshot.data().owner
                        const currentTurn = docSnapshot.data().turn
                        const nextTurn = Number(currentTurn) < docSnapshot.data().players.length - 1 ? Number(currentTurn) + 1 : 0
                        const isTurn = thisPlayerTurn.toString() == currentTurn
                        const isWon = isIdentical(thisPlayer.played, docSnapshot.data().default)
                        const hasWon = docSnapshot.data().players.find((player: any) => isIdentical(player.played, docSnapshot.data().default) == true)
                        const nextPlayer = docSnapshot.data().players[Number(currentTurn)].nickname
                        const currentRound = docSnapshot.data().round
                        const isTimed = docSnapshot.data().timed
                        const isCpu = docSnapshot.data().cpu
                        thisPlayer = {
                            ...thisPlayer,
                            isWon: isWon,
                            isTurn: isTurn,
                            isPlaying: `${nextPlayer} is playing`,
                            hasWon: hasWon ? `${hasWon.nickname} has won this round!` : false,
                            winningPattern: hasWon ? docSnapshot.data().default : false,
                            ownership: allPlayers,
                            leaderBoard: leaderBoard,
                            currentRound: currentRound,
                            isOwner: thisPlayer.isOwner ? true : false,
                            ownerLogged: ownerLogged,
                            owner: owner,
                            nextTurn: nextTurn,
                            isTimed: isTimed,
                            cpu: isCpu
                        }
                        if (Number(currentTurn) == 1 && isCpu && !hasWon) {
                            // debugger
                            // socket.emit("cpu_play")
                            axios.post("https://playerstatus-djhwq4ivna-uc.a.run.app", { roomID: playerData.roomId, action: "play" }, {
                                headers: {
                                    "Content-Type": "application/json"
                                }
                            })
                        }
                        next(thisPlayer);
                    }
                } else if (playerData.roomId != "12345678" && !docSnapshot.exists()) {
                    next("removed")
                    // debugger
                    // console.log("it got here")
                } else {
                    next([]);

                }
            });

            return unsubscribe;
        },
        { fallbackData: fetchDefaultPattern(playerData.roomId) }
    );

    return { data, error };
}

export { useSubscription };