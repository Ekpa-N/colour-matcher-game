"use client"
import Image from "next/image";
import ColourMatcher from "@/components/ColourMatcher";
import AppContext from "@/components/Provider";
import { useEffect, useState, useRef, ReactEventHandler, ReactHTMLElement } from "react";
import { io } from 'socket.io-client';
import { useRouter } from "next/navigation";
import { db } from '@/firebase';
import { useSubscription } from "@/hooks/customHooks";
import { shuffleArray } from "@/components/helpers";
import { collection, addDoc, getDocs, limit, query, where, doc, updateDoc, setDoc, getDoc, startAt, startAfter, getCountFromServer, serverTimestamp, endBefore, onSnapshot } from "firebase/firestore";


export default function PlayerHome() {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [localData, setLocalData] = useState<any>({ nickname: "", playerId: "", url: "", roomId: "12345678" })
  const router = useRouter()
  // const searchParams = useSearchParams()
  const [pattern, setPattern] = useState<string[]>(["red", "blue", "green", "yellow"])
  const [currentPattern, setCurrentPattern] = useState<string[]>(["", "", "", ""])
  const [toChange, setToChange] = useState<string>("")
  const [isWon, setIsWon] = useState<boolean>(false)
  const [turn, setTurn] = useState<any>()
  const [isPlaying, setIsPlaying] = useState<any>("")
  const [hasWon, setHasWon] = useState<any>(false)
  const [winningPattern, setWinningPattern] = useState<boolean>(false)

  async function checkExistingGameData(existingDetails: any) {
    let players: any[] = []
    const docRef = doc(db, "games", existingDetails.roomId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      players = docSnap.data().players
      const currentPlayer = players.find(player => player.id == existingDetails.playerId)
      if (currentPlayer) {
        setLocalData(existingDetails)
        return
      }
      localStorage.removeItem("colourMatcherPlayerData")
      router.push("/")
      return
    }
    localStorage.removeItem("colourMatcherPlayerData")
    router.push("/")
    return
  }

  // useEffect(()=>{
  //   if(localData.playerId) {      
  //   }
  // }, [localData])

  const { data, error } = useSubscription(localData)
  useEffect(() => {
    async function validateState() {
      let existingDetails = localStorage.getItem("colourMatcherPlayerData") != null && localStorage.getItem("colourMatcherPlayerData") != undefined ? JSON.parse(localStorage.getItem("colourMatcherPlayerData") as string) : ""
      if (existingDetails) {
        await checkExistingGameData(existingDetails)
        // setLocalData(existingDetails)
        return
      }

      router.push("/")
    }

    validateState()
  }, [])

  useEffect(() => {
    if (error && error.hasOwnProperty("played")) {
      setCurrentPattern(error.played)
      setIsWon(error.isWon)
      setTurn(error.isTurn)
      setIsPlaying(error.isPlaying)
      setHasWon(error.hasWon)
      if (localData.playerId) {
        setIsLoading(false)
      }
    }
  }, [error])



  async function play() {
    if (!turn || isWon) {
      return
    }
    const dataRef = doc(db, "games", localData.roomId)
    const gameDoc = await getDoc(dataRef)
    if (gameDoc.exists()) {
      const thePlayers = gameDoc.data().players
      const currentTurn = Number(gameDoc.data().turn)
      const newTurn = currentTurn < thePlayers.length - 1 ? currentTurn + 1 : 0
      const thisPlayer = gameDoc.data().players.find((player: any) => player.id == localData.playerId)
      const thisPlayerIndex = gameDoc.data().players.findIndex((player: any) => player.id == localData.playerId)
      thisPlayer.played = currentPattern
      const newPlayers = thePlayers.map((player: any) => {
        if (player.id == localData.playerId) {
          return thisPlayer
        }
        return player
      })
      await updateDoc(dataRef, {
        players: newPlayers,
        turn: newTurn.toString()
      })
      console.log("changed")
    } else {
      console.log("No such document!");
    }
  }

  async function reset() {
    if (!isWon && !hasWon) {
      console.log("reset clicked")
      return
    }
    const dataRef = doc(db, "games", localData.roomId)
    const gameDoc = await getDoc(dataRef)
    if (gameDoc.exists()) {
      const thePlayers = gameDoc.data().players
      const newDefault = shuffleArray(gameDoc.data().default)
      const playsReset = thePlayers.map((player: any) => {
        player.played = ["", "", "", ""]
        return player
      })
      await updateDoc(dataRef, {
        players: playsReset,
        turn: "0",
        default: newDefault
      })
      console.log("Reset")
    }
  }

  function switchColour(idx: number, type?: string): void {
    if (type == "play") {
      const theCurrentPattern = currentPattern
      theCurrentPattern[idx] = toChange
      setCurrentPattern(theCurrentPattern)
      setToChange("")
      return
    }
    setToChange(pattern[idx])
  }

  return (
    <main className="flex relative flex-col gap-[20px] items-center justify-center p-2">
      <div className=""></div>
      <h2 className={`p-2 border rounded-[10px] font-[700] flex justify-center items-center text-center h-[60px] w-[250px]`}>
        {`${isWon ? "You have won this round!" : hasWon ? hasWon : turn ? "Your turn" : isPlaying}`}
      </h2>
      <h2>Colour Match</h2>
      <div className="flex flex-col w-[100%] md:w-[400px] gap-[20px]">
        <ColourMatcher type="play" pattern={currentPattern} toChange={toChange} switchColour={switchColour} />
        <ColourMatcher type="default" pattern={pattern} toChange={toChange} switchColour={switchColour} />
      </div>

      <button onClick={() => { play() }} className="border p-2 rounded mt-[20px]">Play Pattern</button>
      <button onClick={() => { reset() }} className={`border p-2 rounded mt-[20px] ${isWon ? "" : hasWon ? "" : "hidden"}`}>Reset</button>
      <div className={`absolute border text-black w-[95%] ${isLoading ? "" : "hidden"} opacity-[0.1] h-[90%]`}></div>
    </main>
  )
}
