"use client"
import Image from "next/image";
import ColourMatcher from "@/components/ColourMatcher";
import AppContext from "@/components/Provider";
import { useEffect, useState, useRef, ReactEventHandler, ReactHTMLElement } from "react";
import { io } from 'socket.io-client';
import { useRouter } from "next/navigation";
import { db } from '@/firebase';
import { useSubscription } from "@/hooks/customHooks";
import { shuffleArray, matchChecker, copyToClipboard } from "@/components/helpers";
import { collection, addDoc, getDocs, limit, query, where, doc, updateDoc, setDoc, getDoc, startAt, startAfter, getCountFromServer, serverTimestamp, endBefore, onSnapshot, deleteDoc } from "firebase/firestore";


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
  const [winningPattern, setWinningPattern] = useState<boolean | string[]>(["", "", "", ""])
  const [matchCount, setMatchCount] = useState<number>(0)
  const [evict, setEvict] = useState<string>("")
  const [allPlayers, setAllPlayers] = useState<any>(false)

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

  function handleSelectEvict(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setEvict(e.target.value)
  }

  async function endGame() {
    const dataRef = doc(db, "games", localData.roomId)
    const gameDoc = await deleteDoc(dataRef)
  }

  async function evictPlayer() {
    if (evict == "") {
      return
    }
    const dataRef = doc(db, "games", localData.roomId)
    const gameDoc = await getDoc(dataRef)
    if (gameDoc.exists()) {
      const thePlayers = gameDoc.data().players
      let newPlayers = thePlayers.filter((player: any) => player.id !== evict)
      let currentTurn = gameDoc.data().turn
      // debugger
      if (newPlayers.length <= Number(currentTurn)) {
        currentTurn = newPlayers.length - 1
        // debugger
        await updateDoc(dataRef, {
          turn: currentTurn.toString(),
          players: newPlayers
        })
        // localStorage.removeItem("colourMatcherPlayerData")
        // router.push("/")
      } else {
        await updateDoc(dataRef, {
          players: newPlayers
        })
        // localStorage.removeItem("colourMatcherPlayerData")
        // router.push("/")
      }
    } else {
      console.log("No such document!");
    }
  }

  async function exitGame() {
    const dataRef = doc(db, "games", localData.roomId)
    const gameDoc = await getDoc(dataRef)
    if (gameDoc.exists()) {
      const thePlayers = gameDoc.data().players
      const newPlayers = thePlayers.filter((player: any) => player.id !== localData.playerId)
      let currentTurn = gameDoc.data().turn
      if (newPlayers.length <= Number(currentTurn)) {
        currentTurn = newPlayers.length - 1
        await updateDoc(dataRef, {
          players: newPlayers,
          turn: currentTurn.toString()
        })
      } else {
        await updateDoc(dataRef, {
          players: newPlayers
        })
      }
    } else {
      console.log("No such document!");
    }
  }

  const { data, error } = useSubscription(localData)
  useEffect(() => {
    async function validateState() {
      let existingDetails = localStorage.getItem("colourMatcherPlayerData") != null && localStorage.getItem("colourMatcherPlayerData") != undefined ? JSON.parse(localStorage.getItem("colourMatcherPlayerData") as string) : ""
      if (existingDetails) {
        await checkExistingGameData(existingDetails)
        return
      }
      router.push("/")
    }
    validateState()
  }, [])

  useEffect(() => {
    if (error == "removed") {
      localStorage.removeItem("colourMatcherPlayerData")
      router.push("/")
    }
    if (error && error.hasOwnProperty("played")) {
      // setCurrentPattern(error.played)
      setIsWon(error.isWon)
      setTurn(error.isTurn)
      setIsPlaying(error.isPlaying)
      setHasWon(error.hasWon)
      if (error.ownership) {
        let allPlayersList = [{ nickName: "", id: "" }]
        setAllPlayers([...allPlayersList, error.ownership.filter((player: any) => player.id != localData.playerId)].flat())
      }
      if (error.winningPattern) {
        setWinningPattern(error.winningPattern)
        setMatchCount(0)
      } else {
        setWinningPattern(error.played)
      }
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
      const template = gameDoc.data().default
      const currentMatchCount = matchChecker(currentPattern, template)
      setMatchCount(currentMatchCount)
      // console.log("The match count is: ", matchCount)
      setCurrentPattern(["", "", "", ""])
      console.log("changed")
    } else {
      console.log("No such document!");
    }
  }

  async function reset() {
    setMatchCount(0)
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
    <main className="flex relative flex-col gap-[10px] items-center justify-center p-2">
      <h2 className={`font-[600]`}> Colour Match</h2>
      <div className={`borde ${isLoading ? "hidden" : ""} text-center mt-[5px] w-[250px] ${isWon || hasWon ? "fancy" : ""}  ${winningPattern ? "" : ""}`}>
        <ColourMatcher type="win" pattern={winningPattern} toChange={toChange} switchColour={switchColour} />
      </div>
      <div className={`p-2 ${isLoading ? "hidden" : ""} border rounded-[10px] font-[700] flex justify-center items-center text-center fanc h-[60px] w-[250px]`}>
        {`${isWon ? "You have won this round!" : hasWon ? hasWon : turn ? "Your turn" : isPlaying}`}
      </div>
      <div className={` ${isLoading ? "hidden" : "border rounded-[10px] font-[700] flex justify-center items-center text-center fanc h-[60px] w-[250px]"}`}>You matched {matchCount}</div>
      <div className={`flex ${isLoading ? "hidden" : ""} flex-col w-[350px]  gap-[20px]`}>
        <ColourMatcher type="play" pattern={currentPattern} toChange={toChange} switchColour={switchColour} />
        <ColourMatcher type="default" pattern={pattern} toChange={toChange} switchColour={switchColour} />
      </div>

      <div className="flex w-[350px] borde min-h-[98px] items-end justify-between p-[2px]">
        <div className={`flex justify-between borde h-full flex-col ${allPlayers ? "" : "hidden"}`}>
          {/* <h2 className="borde w-full">Kickout Players</h2> */}
          <div className="flex flex-col min-h-[80px] borde gap-[5px]">
            <h2 className="text-[green]">Players List</h2>
            <select onChange={(e) => { handleSelectEvict(e) }} name='kickout' className='border w-[125px] rounded-[10px] h-[35px] outline-none'>
              {allPlayers && allPlayers.map((player: any, idx: number) => {
                return <option key={idx} className="border p-2" value={player.id}>{player.nickName}</option>
              })}
            </select>
            <button onClick={() => { evictPlayer() }} className="p-2 rounded border rounded-[10px] text-[#fffff0] active:text-[#fffff0] active:bg-[red] bg-[#1f606d]">Kickout Player</button>
          </div>
        </div>
        <button onClick={() => { exitGame() }} className={`border ${isLoading || allPlayers ? "hidden" : ""} p-2 rounded text-[#fffff0] active:text-[#fffff0] active:bg-[red] bg-[#1f606d]`}>Leave Game</button>
        <button onClick={() => { play() }} className={`border ${isLoading ? "hidden" : ""} text-[#f6ebf4] active:bg-[#f6ebf4] active:text-[#338f1f] bg-[#338f1f] p-2 font-[600] rounded`}>Play Selection</button>
      </div>
      <button onClick={() => { reset() }} className={`border p-2 rounded mt-[20px] ${isWon ? "" : hasWon ? "" : "hidden"}`}>Reset</button>
      <div className={`${allPlayers ? "flex" : "hidden"} justify-between w-[350px] gap-[5px] borde mt-[10px]`}>
        <input value={localData.url} readOnly className='border text-[9px] text-center outline-none px-[2px] grow' />
        <button onClick={() => { copyToClipboard(localData.url) }} className='border box-border font-[500] active:bg-[white] active:text-[green] flex justify-center items-center text-[15px] w-[85px] h-[35px]  bg-[green] text-[white] rounded-[5px]'> Copy Link </button>
      </div>
      <div className={`absolute border text-black w-full ${isLoading ? "" : "hidden"} flex items-center justify-center h-full`}>
        <div className={`relative borde h-[50px] w-[50px] mt-[250px]`}>
          <Image alt='' src={"/images/loading-state.svg"} fill={true} />
        </div>
      </div>
      <button onClick={() => { endGame() }} className={`border ${isLoading ? "hidden" : "text-[#fffff0] active:text-[red] active:bg-[#fffff0] bg-[red]"} p-2 rounded`}>End Game</button>
    </main>
  )
}
