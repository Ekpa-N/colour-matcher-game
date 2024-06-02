"use client"
import React, { ReactNode, useEffect, useState } from "react";
import AppContext from "./Provider";
import { db } from '../firebase/index'
import { collection, addDoc, getDocs, limit, query, where, doc, updateDoc, setDoc, getDoc, startAt, startAfter, getCountFromServer, serverTimestamp, endBefore, onSnapshot } from "firebase/firestore";
import useSWR, { mutate } from "swr";
import useSWRSubscription from 'swr/subscription'
import { GoogleLogin } from '@react-oauth/google';

type LayoutWrapperProps = {
    children: ReactNode;
}

const colours: string[] = [
    "red",
    "blue",
    "yellow",
    "green",
    "purple"
]

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
    const { data: defaultPattern, error: defaultPatternError } = useFirestoreSubscription("defaultPattern") //useSWR("defaultPattern", fetchDefaultPattern) // useFirestoreSubscription("defaultPattern")
    const { data: playerOnePattern, error: playerOnePatternError } = useFirestoreSubscription("playerone") //useSWR("playerone", fetchDefaultPattern)
    const { data: playerTwoPattern, error: playerTwoPatternError } = useFirestoreSubscription("playertwo") // useSWR("playertwo", fetchDefaultPattern)
    const [defaultPatterns, setDefaultPatterns] = useState<string[]>([])
    const [playerPatterns, setPlayerPatterns] = useState<{ one: string[], two: string[] }>({ one: [], two: [] })
    const [playerOneSwitch, setPlayerOneSwitch] = useState<{ first: number }>({ first: 5 })
    const [playerTwoSwitch, setPlayerTwoSwitch] = useState<{ first: number }>({ first: 5 })
    const [sideEffect, setSideEffect] = useState<number>(0)
    const [isOpen, setIsOpen] = useState<boolean>(false)

    

    function shuffleArray(arr: string[]): string[] {
        let shuffledArray = arr.slice(); // Create a copy of the array to avoid mutating the original
        for (let i = shuffledArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
            [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]; // Swap elements
        }
        return shuffledArray;
    }

    async function makeSwitch(position: number, player: string) {
        if (player == "one") {
            if (playerOneSwitch.first == 5) {
                setPlayerOneSwitch({ ...playerOneSwitch, first: position })
                return
            }
            const firstPick = playerOnePattern ? playerOnePattern[playerOneSwitch.first] : ""
            const secondPick = playerOnePattern ? playerOnePattern[position] : ""
            const newArray = playerOnePattern ? [...playerOnePattern] : []
            newArray[playerOneSwitch.first] = secondPick
            newArray[position] = firstPick
            const docRef = doc(db, "colours", "playerone");
            await updateDoc(docRef, {
                pattern: newArray
            })
            mutate("playerone")
            setPlayerOneSwitch({ ...playerOneSwitch, first: 5 })
            return
        }
        if (player == "two") {
            if (playerTwoSwitch.first == 5) {
                // debugger
                setPlayerOneSwitch({ ...playerTwoSwitch, first: position })
                return
            }
            const firstPick = playerTwoPattern ? playerTwoPattern[playerTwoSwitch.first] : ""
            const secondPick = playerTwoPattern ? playerTwoPattern[position] : ""
            const newArray = playerTwoPattern ? [...playerTwoPattern] : []
            // console.log("The new Array: ", newArray)
            newArray[playerTwoSwitch.first] = secondPick
            newArray[position] = firstPick
            // console.log("The switched Array: ", newArray)
            // const shuffled = shuffleArray(defaultPattern || [])
            const docRef = doc(db, "colours", "playertwo");
            // Set the "capital" field of the city 'DC'
            await updateDoc(docRef, {
                pattern: newArray
            })
            mutate("playertwo")
            setPlayerTwoSwitch({ ...playerOneSwitch, first: 5 })
            return
        }

    }

    async function makeSwitchToo(position: number, player: string) {
        if (player == "one") {
            if (playerOneSwitch.first == 5) {
                setPlayerOneSwitch({ ...playerOneSwitch, first: position })
                return
            }
            const firstPick = playerOnePatternError ? playerOnePatternError[playerOneSwitch.first] : ""
            const secondPick = playerOnePatternError ? playerOnePatternError[position] : ""
            const newArray = playerOnePatternError ? [...playerOnePatternError] : []
            newArray[playerOneSwitch.first] = secondPick
            newArray[position] = firstPick
            const docRef = doc(db, "colours", "playerone");
            await updateDoc(docRef, {
                pattern: newArray
            })
            mutate("playerone")
            setPlayerOneSwitch({ ...playerOneSwitch, first: 5 })
            return
        }

        if (player == "two") {
            if (playerTwoSwitch.first == 5) {
                // debugger
                setPlayerTwoSwitch({ ...playerTwoSwitch, first: position })
                return
            }
            const firstPick = playerTwoPatternError ? playerTwoPatternError[playerTwoSwitch.first] : ""
            const secondPick = playerTwoPatternError ? playerTwoPatternError[position] : ""
            const newArray = playerTwoPatternError ? [...playerTwoPatternError] : []
            newArray[playerTwoSwitch.first] = secondPick
            newArray[position] = firstPick
            const docRef = doc(db, "colours", "playertwo")
            await updateDoc(docRef, {
                pattern: newArray
            })
            mutate("playertwo")
            setPlayerTwoSwitch({ ...playerTwoSwitch, first: 5 })
            return
        }

    }

    async function resetDefault() {
        const shuffled = shuffleArray(defaultPatternError || [])
        const docRef = doc(db, "colours", "defaultPattern");
        await updateDoc(docRef, {
            pattern: shuffled
        })
        // mutate("defaultPattern")
    }

    async function fetchDefaultPattern(collectionItem: string) {
        let newData: string[] = []
        const docRef = doc(db, "colours", collectionItem)
        const docSnapshot = await getDoc(docRef)
        if (docSnapshot.exists()) {
            newData = docSnapshot.data().pattern
        }
        return newData
    }

    function useFirestoreSubscription(collectionItem: string) {
        const { data, error } = useSWRSubscription(
            ["colours", collectionItem],
            (key, { next }) => {
                const docRef = doc(db, ...key);
                const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
                    if (docSnapshot.exists()) {
                        next(docSnapshot.data().pattern);
                    } else {
                        next([]);
                    }
                });

                return unsubscribe;
            },
            { fallbackData: fetchDefaultPattern(collectionItem) }
        );

        return { data, error };
    }

    return (
        <div className={`${isOpen ? "overflow-hidden" : "min-h-screen"} flex flex-col`}>
            <AppContext.Provider value={{ defaultPatternError, defaultPattern, playerPatterns, makeSwitch, makeSwitchToo, playerOneSwitch, playerTwoSwitch, resetDefault, playerOnePattern, playerTwoPattern, defaultPatterns, playerOnePatternError, playerTwoPatternError }}>
                <div>
                    {children}
                </div>
            </AppContext.Provider>
        </div>
    )
};

export default LayoutWrapper;
