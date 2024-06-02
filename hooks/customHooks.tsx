import { useState, useEffect } from "react";
import { db } from '@/firebase';
import useSWRSubscription from 'swr/subscription'
import { collection, addDoc, getDocs, limit, query, where, doc, updateDoc, setDoc, getDoc, startAt, startAfter, getCountFromServer, serverTimestamp, endBefore, onSnapshot } from "firebase/firestore";
import { isIdentical } from "@/components/helpers";



async function fetchDefaultPattern(playerInfo: string) {
    let newData: any = []
    const docRef = doc(db, "games", playerInfo)
    const docSnapshot = await getDoc(docRef)
    if (docSnapshot.exists()) {
        newData = docSnapshot.data()
    }
    return newData
}

function useSubscription(playerInfo: {nickname: string, playerId: string, roomId: string, url: string}) {
    const[playerData, setPlayerData] = useState<any>({nickname:"", playerId:"",url:"", roomId:"12345678"})

    useEffect(()=>{
        setPlayerData(playerInfo)
    },[playerInfo])
    const { data, error } = useSWRSubscription(
        ["games", playerData.roomId],
        (key, { next }) => {
            const docRef = doc(db, ...key);
            const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
                if (docSnapshot.exists()) {
                    console.log("data found")
                    let thisPlayer = docSnapshot.data().players.find((player:any) => player.id == playerData.playerId)
                    let thisPlayerTurn = docSnapshot.data().players.findIndex((player:any) => player.id == playerData.playerId)
                    const currentTurn = docSnapshot.data().turn
                    const isTurn = thisPlayerTurn.toString() == currentTurn
                    console.log("this player turn: ", docSnapshot.data().players[Number(currentTurn)].nickname)
                    const nextPlayer = docSnapshot.data().players[Number(currentTurn)].nickname
                    const isWon = isIdentical(thisPlayer.played, docSnapshot.data().default)
                    thisPlayer = {...thisPlayer, isWon:isWon, isTurn: isTurn, isPlaying:`${nextPlayer} is playing`}
                    next(thisPlayer);
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