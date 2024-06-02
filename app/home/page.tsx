"use client"
import Image from "next/image";
import ColourMatcher from "@/components/ColourMatcher";
import AppContext from "@/components/Provider";
import { useEffect, useState, useRef, ReactEventHandler, ReactHTMLElement } from "react";
import { io } from 'socket.io-client';
import { useRouter, useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid"
import { ReactSortable } from "react-sortablejs";
import Sortable from "sortablejs"
import { db } from '@/firebase';
import useSWRSubscription from 'swr/subscription'
import { useSubscription } from "@/hooks/customHooks";
import { collection, addDoc, getDocs, limit, query, where, doc, updateDoc, setDoc, getDoc, startAt, startAfter, getCountFromServer, serverTimestamp, endBefore, onSnapshot } from "firebase/firestore";
import { isIdentical } from "@/components/helpers";


export default function PlayerHome() {
  const [localData, setLocalData] = useState<any>({ nickname: "", playerId: "", url: "", roomId: "12345678" })
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pattern, setPattern] = useState<string[]>(["red", "blue", "green", "yellow", "purple", "black"])
  const [currentPattern, setCurrentPattern] = useState<string[]>(["", "", "", "", "", ""])
  const [toChange, setToChange] = useState<string>("")
  const [isWon, setIsWon] = useState<boolean>(false)
  const [turn, setTurn] = useState<any>()

  async function checkExistingGameData({ roomId, playerId, nickname }: { roomId: string, playerId: string, nickname: string }) {
    let players: any[] = []
    const game = searchParams.has("id")
    const id = searchParams.get("id") as string
    const docRef = doc(db, "games", roomId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      players = docSnap.data().players
      const currentPlayer = players.find(player => player.id == playerId)
      if (currentPlayer) {
        const socket = io(`${process.env.api}:3002`, {
          query: {
            customId: playerId,
            nickname: nickname,
            roomId: roomId
          }
        })
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

  const { data, error } = useSubscription(localData)

  useEffect(() => {
    if (error && error.hasOwnProperty("played")) {
      setCurrentPattern(error.played)
      setIsWon(error.isWon)
      setTurn(error.isTurn)
    }
  }, [error])

  useEffect(() => {
    let existingDetails = localStorage.getItem("colourMatcherPlayerData") != null && localStorage.getItem("colourMatcherPlayerData") != undefined ? JSON.parse(localStorage.getItem("colourMatcherPlayerData") as string) : ""
    if (existingDetails) {
      setLocalData(existingDetails)
      checkExistingGameData(existingDetails)
      return
    }
    router.push("/")
  }, [])

  async function play() {
    const dataRef = doc(db, "games", localData.roomId)
    const gameDoc = await getDoc(dataRef)
    if (gameDoc.exists()) {
      const thePlayers = gameDoc.data().players
      const currentTurn = Number(gameDoc.data().turn)
      const newTurn = currentTurn < thePlayers.length-1 ? currentTurn + 1 : 0
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
    <main className="flex min-h-screen flex-col gap-[20px] items-center justify-center p-2">
      <h2 className={`p-2 border rounded-[10px] font-[700] flex justify-center items-center text-center h-[60px] w-[250px]`}>
        {`${isWon ? "You have won this round": turn ? "Your turn" : ""}`}
      </h2>
      <h2>Colour Match</h2>
      <div className="flex flex-col w-[100%] md:flex-row md:justify-around gap-[20px]">
        <ColourMatcher type="play" pattern={currentPattern} toChange={toChange} switchColour={switchColour} />
        <ColourMatcher type="default" pattern={pattern} toChange={toChange} switchColour={switchColour} />
      </div>

      <button onClick={() => { play() }} className="border p-2 rounded mt-[20px]">Play Pattern</button>
    </main>
  )
  // return (
  //   <AppContext.Consumer>
  //     {({ defaultPatternError, defaultPattern, defaultPatterns, playerPatterns, makeSwitch, makeSwitchToo, playerOneSwitch, playerTwoSwitch, resetDefault, playerOnePattern, playerTwoPattern, playerOnePatternError, playerTwoPatternError }) => {
  //     }}
  //   </AppContext.Consumer>
  // )
}
