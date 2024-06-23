"use client"
import Image from "next/image";
import ColourMatcher from "@/components/ColourMatcher";
import AppContext from "@/components/Provider";
import { useEffect, useState, useRef, ReactEventHandler, ReactHTMLElement } from "react";
import { io } from 'socket.io-client';
import { useRouter } from "next/navigation";
import { db } from '@/firebase';
import { useSubscription } from "@/hooks/customHooks";
import { shuffleArray, matchChecker, copyToClipboard, isIdentical, getInsult, iconButtons } from "@/components/helpers";
import { collection, addDoc, getDocs, limit, query, where, doc, updateDoc, setDoc, getDoc, startAt, startAfter, getCountFromServer, serverTimestamp, endBefore, onSnapshot, deleteDoc } from "firebase/firestore";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { ClassNames } from "@emotion/react";
import { List, ListItemText, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import LoadingScreen from "@/components/Loader";
import axios from "axios";
import { RiRobot3Line, RiRobot2Line } from "react-icons/ri";


const style = {
  position: 'absolute' as 'absolute',
  top: '45%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#fffff0',
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  borderRadius: "20px"
};
const styleTwo = {
  position: 'absolute' as 'absolute',
  top: '40%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 350,
  height: 500,
  bgcolor: '#fffff0',
  boxShadow: 24,
  p: 4,
  display: "flex",
  flexDirection: "column",
  overflow: "auto",
  borderRadius: "20px"
};

const styleThree = {
  fontSize: "30px"
}

const warnModal = {
  width: "300px",
  height: "200px",
  border: "1px solid yellow"
}

const instructionList = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  borderRadius: "10px"
}

const buttonStyle = {
  width: "140px",
  marginTop: "10px",
  border: "1px solid #fffff0",
  color: "#000008"
}

const leaderBoardButton = {
  minWidth: "80px",
  selfAlign: "left",
  color: "#000080",
  backgroundColor: "#fffff0",
  border: "1px solid #000008",
  // boxShadow: "1",
}

const loserInsults = [
  "Here's an idea that might help you in the next round: Try to play smarter!",
  "I've seen kittens with better skills than you!",
  "With skills like this? I hope there are no people who look up to you",
  "Words of encouragement: everyone's better at this than you!",
  "I don't want to encourage you, it'd just be false hope",
  "No one's good at everything . . . but you're not at anything",
  "It takes skill to be this bad",
  "Are you allergic to winning?",
  "I promise you, winning isn't luck",
  "It's not your fault you lost. It's our fault for believing in you",
  "No, seriously. Play for real in the next round.",
  "Well, you tried. They can never take THAT away from you.",
  "Better luck next time huh...sike! Who are we kidding with skills like yours?",
  "I have no words",
  "You're really getting better at this losing thing",
  "The odds were never really in your favor",
  "I really hope no one's watching you play",
  "You really don't have it in you",
  "Leave the game now and we'll forget this ever hapened",
  "Surely you can't be comfortable living like this"
]

const winnerInsults = [
  "Congratulations! Now it's time to find someone your own size",
  "You didn't have to stunt this hard. You're hurting someone's child",
  "I always believed in you!",
  "Hail! The conquering hero",
  "Guess who didn't get insulted this round? Not the losers!!!",
  "You deserve good things. All winners do.",
  "LOL! Your opponents thought! They really thought!",
  "We should be friends. Text me, you champion, you.",
  "You must wonder what losing feels like...sike! Who cares!",
  "Kick ass, take names! Just not these losers' names.",
  "You need new playmates. Winners can't be seen rolling with this crew",
  "Can you hear that? No it's not rain, it's the tears you caused",
  "I heard them say you got lucky...losers eh, always saying something"
]


export default function PlayerHome() {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [localData, setLocalData] = useState<any>({ nickname: "", playerId: "", url: "", roomId: "12345678" })
  const router = useRouter()
  // const searchParams = useSearchParams()
  const [pattern, setPattern] = useState<string[]>(["#20958E", "#AFD802", "#DF93D2", "#F7E270"])
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
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [open, setOpen] = useState(false);
  const [instructions, setInstructions] = useState(false);
  const [readHelp, setReadHelp] = useState<boolean>(true)
  const [insult, setInsult] = useState<string>("")
  const [currentRound, setCurrentRound] = useState<string>("")
  const [isOwner, setIsOwner] = useState<boolean>(false)
  const [showPlayers, setShowPlayers] = useState<boolean>(false)
  const [showModes, setShowModes] = useState<boolean>(false)
  const [ownerLogged, setOwnerLogged] = useState<boolean>(false)
  const [owner, setOwner] = useState<any>("")
  const [timer, setTimer] = useState<any>("")
  const [socket, setSocket] = useState<any>()
  const [playerStatus, setPlayerStatus] = useState<string[]>([])
  const [isTimedMode, setIsTimedMode] = useState<boolean>(false)
  const [isCpuActive, setIsCpuActive] = useState<boolean>(false)
  const [urlCopied, setUrlCopied] = useState<boolean>(false)

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleInstructionsOpen = () => setInstructions(true);
  const handleInstructionsClose = () => {
    localStorage.setItem("isReload", "true")
    setInstructions(false)
  };

  const handleHelpClose = () => setReadHelp(false);
  // const handleHelpOpen = () => setReadHelp(true);
  const playersRef = useRef<HTMLButtonElement>(null)
  const modesRef = useRef<HTMLButtonElement>(null)
  const modes: { name: string, key: string, func: (mode: boolean) => Promise<void> }[] = [
    {
      name: "Timed",
      key: "timed",
      func: timedMode
    }
  ]

  function handleClickOutside(event: MouseEvent) {
    if (playersRef.current && !playersRef.current.contains(event.target as Node)) {
      setShowPlayers(false);
    }
    if (modesRef.current && !modesRef.current.contains(event.target as Node)) {
      setShowModes(false);
    }
  };
  useEffect(() => {
    if (localData.playerId != "") {
      const newSocket = io("https://colour-matcher-server-811abd218ab9.herokuapp.com", { // http://localhost:3004 http://192.168.0.101:3004  https://colour-matcher-server-811abd218ab9.herokuapp.com
        // path: "/home",
        query: {
          nickname: localData.nickname,
          room: localData.roomId,
          playerID: localData.playerId
        }
      })

      setSocket(newSocket)
    }
  }, [localData])

  useEffect(() => {
    const showStatus = setInterval(() => {
      setPlayerStatus([])
    }, 3000)
    if (socket) {
      socket.on("receive_message", (data: any) => {
        setPlayerStatus(prevStatus => [...prevStatus, data])
        console.log("message from socket: ", data)
      })
      socket.on("turn", (data: any) => {
        console.log("Turn Status: ", data)
      })
    }
    return () => clearInterval(showStatus)
  }, [socket])

  function changeTurn(turnStatus: boolean) {
    socket.emit("start_game", { turn: turnStatus })
  }

  async function checkExistingGameData(existingDetails: any) {
    let players: any[] = []
    const docRef = doc(db, "games", existingDetails.roomId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      players = docSnap.data().players
      const currentPlayer = players.find(player => player.id == existingDetails.playerId)
      if (currentPlayer) {
        // const isReload = JSON.parse(localStorage.getItem("isReload") as string)
        // if (!isReload) {
        //   setInstructions(true)
        // }
        setLocalData(existingDetails)
        // const newSocket = io("http://localhost:3004", {
        //   path: "/home",
        //   query: {
        //     nickname: existingDetails.nickname,
        //     room: existingDetails.roomId
        //   }
        // })

        // setSocket(newSocket)
        return
      }
      localStorage.removeItem("colourMatcherPlayerData")
      if (socket) {
        socket.disconnect()
      }
      router.push("/")
      return
    }
    localStorage.removeItem("colourMatcherPlayerData")
    if (socket) {
      socket.disconnect()
    }
    router.push("/")
    return
  }

  function handleSelectEvict(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setEvict(e.target.value)
  }

  useEffect(() => {
    const yourTimer = setInterval(() => {
      if (turn && timer) {
        if (timer > 1) {
          setTimer(timer - 1);
          console.log(`Timer: 00:${String(timer - 1).padStart(2, '0')}`);
        } else if (timer <= 1) {
          setTimer(0);
          clearInterval(yourTimer)
          console.log(`Timer: 00:00`);
          // Additional logic can be placed here when wait reaches 0
        }
      }
    }, 1000);

    return () => clearInterval(yourTimer);
  }, [turn, timer]);



  async function endGame() {
    const dataRef = doc(db, "games", localData.roomId)
    socket.emit("start_game", { turn: false })
    const killRoomTimeout = setTimeout(() => {
      socket.emit("end_game", { roomId: localData.roomId })
      clearTimeout(killRoomTimeout)
    }, 3000)
    // socket.disconnect()
    // debugger
    const gameDoc = await deleteDoc(dataRef)
  }

  async function evictPlayer(id: string) {
    const dataRef = doc(db, "games", localData.roomId)
    const gameDoc = await getDoc(dataRef)
    if (gameDoc.exists()) {
      const thePlayers = gameDoc.data().players
      let newPlayers = thePlayers.filter((player: any) => player.id !== id)
      let currentTurn = gameDoc.data().turn
      // debugger
      if (isCpuActive) {
        // debugger
        await updateDoc(dataRef, {
          turn: "0",
          players: newPlayers,
          cpu: false
        })
      } else if (newPlayers.length <= Number(currentTurn)) {
        currentTurn = newPlayers.length - 1
        // debugger
        await updateDoc(dataRef, {
          turn: currentTurn.toString(),
          players: newPlayers
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

  async function timedMode(mode: boolean) {
    // debugger
    const dataRef = doc(db, "games", localData.roomId)
    const gameDoc = await getDoc(dataRef)
    if (gameDoc.exists()) {
      await updateDoc(dataRef, {
        timed: mode
      })
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
        socket.disconnect()
      } else {
        await updateDoc(dataRef, {
          players: newPlayers
        })
        socket.disconnect()
      }
    } else {
      console.log("No such document!");
    }
  }

  const { data, error } = useSubscription({ playerInfo: localData, socket: socket })

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
    if (showPlayers || showModes) {
      window.addEventListener('click', handleClickOutside);
    } else {
      window.removeEventListener('click', handleClickOutside);
    }

    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [showPlayers, showModes]);

  useEffect(() => {
    if (error == "removed") {
      // localStorage.removeItem("colourMatcherPlayerData")
      localStorage.clear()
      router.push("/")
    }
    if (error && error.hasOwnProperty("played")) {
      // setCurrentPattern(error.played)
      setCurrentRound(error.currentRound)
      setIsWon(error.isWon)
      setTurn(error.isTurn)
      setIsPlaying(error.isPlaying)
      setHasWon(error.hasWon)
      setIsOwner(error.isOwner)
      setOwner(error.owner)
      setIsTimedMode(error.isTimed)
      setOwnerLogged(error.ownerLogged)
      setLeaderboard(error.leaderBoard.sort((a: any, b: any) => Number(b.rounds) - Number(a.rounds)))
      // if (error.ownership) {
      // let allPlayersList = [{ nickName: "", id: "" }]
      setAllPlayers(error.ownership.filter((player: any) => player.id != localData.playerId))
      // }
      if (error.isOwner) {
        setIsCpuActive(error.cpu)
      }
      if (error.winningPattern) {
        setWinningPattern(error.winningPattern)
        setMatchCount(0)
        if (error.isWon) {
          setInsult(getInsult(winnerInsults))
        }
        if (!error.isWon && error.hasWon) {
          setInsult(getInsult(loserInsults))
        }
        setTimer("")
        socket.emit("start_game", { turn: false })
        handleOpen()
      } else {
        if (error.isTimed) {
          socket.emit("start_game", { turn: error.nextTurn.toString(), roomId: localData.roomId })
          if (error.isTurn) {
            setTimer("timer")
          } else {
            setTimer("")
          }
        } else {
          setTimer("")
          socket.emit("start_game", { turn: false })
        }
        setWinningPattern(error.played)
        handleClose()
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
      const defaultPattern = gameDoc.data().default
      const thePlayers = gameDoc.data().players
      const currentTurn = Number(gameDoc.data().turn)
      const newTurn = currentTurn < thePlayers.length - 1 ? currentTurn + 1 : 0
      const thisPlayer = gameDoc.data().players.find((player: any) => player.id == localData.playerId)
      const thisPlayerIndex = gameDoc.data().players.findIndex((player: any) => player.id == localData.playerId)
      thisPlayer.played = currentPattern
      const matched = isIdentical(currentPattern, defaultPattern)
      if (matched) {
        thisPlayer.roundsWon = (Number(thisPlayer.roundsWon) + 1).toString()
      }
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
      //using a try/catch
      // try {
      //   debugger
      //   const played = await axios.post(`${process.env.play}`, {
      //     roomID: localData.roomId,
      //     players: newPlayers,
      //     turn: newTurn.toString()
      //   }, {
      //     headers: {
      //       "Content-Type": "application/json"
      //     }
      //   })
      // } catch (error) { console.log("error: ") }

      // using a socket
      // socket.emit("start_game", { turn: newTurn.toString(), roomId:localData.roomId, players: newPlayers })   


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

  // original play function
  // async function play() {
  //   if (!turn || isWon) {
  //     return
  //   }
  //   const dataRef = doc(db, "games", localData.roomId)
  //   const gameDoc = await getDoc(dataRef)
  //   if (gameDoc.exists()) {
  //     const defaultPattern = gameDoc.data().default
  //     const thePlayers = gameDoc.data().players
  //     const currentTurn = Number(gameDoc.data().turn)
  //     const newTurn = currentTurn < thePlayers.length - 1 ? currentTurn + 1 : 0
  //     const thisPlayer = gameDoc.data().players.find((player: any) => player.id == localData.playerId)
  //     const thisPlayerIndex = gameDoc.data().players.findIndex((player: any) => player.id == localData.playerId)
  //     thisPlayer.played = currentPattern
  //     const matched = isIdentical(currentPattern, defaultPattern)
  //     if (matched) {
  //       thisPlayer.roundsWon = (Number(thisPlayer.roundsWon) + 1).toString()
  //     }
  //     const newPlayers = thePlayers.map((player: any) => {
  //       if (player.id == localData.playerId) {
  //         return thisPlayer
  //       }
  //       return player
  //     })
  //     await updateDoc(dataRef, {
  //       players: newPlayers,
  //       turn: newTurn.toString()
  //     })
  //     const template = gameDoc.data().default
  //     const currentMatchCount = matchChecker(currentPattern, template)
  //     setMatchCount(currentMatchCount)
  //     // console.log("The match count is: ", matchCount)
  //     setCurrentPattern(["", "", "", ""])
  //     console.log("changed")
  //   } else {
  //     console.log("No such document!");
  //   }
  // }

  function copyUrl() {
    copyToClipboard(localData.url)
    setUrlCopied(true)
    const copyLinkNotify = setTimeout(() => {
      setUrlCopied(false)
      clearTimeout(copyLinkNotify)
    }, 400)
  }

  async function reset(action?: string) {
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
      const nextRound = Number(gameDoc.data().round) + 1
      const playsReset = thePlayers.map((player: any, idx: number) => {
        player.played = ["", "", "", ""]
        if (action == "reset") {
          player.roundsWon = "0"
        }
        if (isCpuActive && idx == 1) {
          player.pattern = []
        }
        return player
      })
      // const turn = Math.floor(Math.random() * thePlayers.length)
      // console.log("new turn: ", turn)
      // debugger
      await updateDoc(dataRef, {
        players: playsReset,
        turn: isCpuActive ? "0" : Math.floor(Math.random() * thePlayers.length).toString(),
        default: newDefault,
        round: action == "reset" ? "0" : nextRound.toString()
      })
      handleClose()
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

  if (isLoading) {
    return (
      <div className="flex w-full h-[600px] justify-center items-center">
        <LoadingScreen type="screen" />
      </div>
    )
  }


  return (
    <main className="flex relative flex-col gap-[10px] border  h-[700px] items-center justify-start pt-[20px] px-[2px]">
      <div className="absolute border right-[1px]">
      </div>
      <div className='relative w-[104px] h-[24px] self-center'>
        <Image alt='logo' src="/images/colour-matcher-loader.svg" fill={true} />
      </div>

      <div className="w-fit px-[10px] flex justify-center items-center text-[11px] h-[20px] rounded-[10px] bg-[black] text-[white] font-be">
        <h2>Round {currentRound}</h2>
      </div>


      <div className="flex relative flex-col border border-black rounded-[7px] w-[90%] md:w-[400px] pb-[27px] items-center justify-start pt-[17px] px-[2px]">
        <div className="flex gap-[11px] relative items-center">
          <div className={`${isLoading ? "hidden" : ""} border border-black rounded-[10px] font-[700] flex justify-center items-center text-center font-be text-[8px] h-[20px] px-[6px] w-fit`}>
            {`${ownerLogged ? (isWon ? "You have won this round!" : hasWon ? hasWon : turn ? "Your turn" : isPlaying) : `waiting for "our majesty", ${owner}, to majestically join`}`}
          </div>
          <div className={` ${isLoading ? "hidden" : "border border-black rounded-[10px] font-[700] flex justify-center items-center text-center font-be text-[7px] px-[6px] h-[20px] w-fit"}`}>You matched {matchCount}</div>

        </div>
        <div className={`borde ${isLoading ? "hidden" : ""} text-center mt-[5px] h-[24px] w-[107px] ${isWon || hasWon ? "fanc" : ""}  ${winningPattern ? "" : ""}`}>
          <ColourMatcher type="win" pattern={winningPattern} toChange={toChange} switchColour={switchColour} />
        </div>


        <div className={`flex ${isLoading ? "hidden" : ""}  flex-col items-center w-[202px] mt-[65px]  gap-[22px] relative`}>
          <ColourMatcher type="play" pattern={currentPattern} toChange={toChange} switchColour={switchColour} />
          <div className="border-t w-[259px] border-[#D4D8BE] top-[49%] absolute"></div>
          <ColourMatcher type="default" pattern={pattern} toChange={toChange} switchColour={switchColour} />
        </div>
      </div>



      <button onClick={() => { play() }} className={`border ${isLoading ? "hidden" : ""} border-black active:bg-[#f6ebf4] ${turn ? "" : "text-[gray]"} active:text-[#338f1f] w-[328px] active:text-[#fff] h-[44px] rounded-[50px] font-be font-[600]`}>Play Your Selection</button>
      <div className="borde justify-end flex w-[328px] relative">
        <div id="countdown">
          <svg>
            <circle className={`${timer}`} r="19" cx="21" cy="21"></circle>
          </svg>
        </div>
        <button onClick={() => { exitGame() }} className={`border ${isOwner ? "hidden" : ""} border-black active:bg-[#f6ebf4] active:text-[#338f1f] w-[156px] active:text-[#fff] h-[44px] rounded-[50px] font-be font-[600]`}>Leave Game</button>
        <button onClick={() => { endGame() }} className={`border ${!isOwner ? "hidden" : ""} border-black active:bg-[#f6ebf4] active:text-[#338f1f] w-[156px] active:text-[#fff] h-[44px] rounded-[50px] font-be font-[600]`}>End Game</button>
      </div>


      <div className={`absolute border text-black w-full ${isLoading ? "" : "hidden"} flex items-center justify-center h-full`}>
        <div className={`relative borde h-[50px] w-[50px] mt-[250px]`}>
          <Image alt='' src={"/images/loading-state.svg"} fill={true} />
        </div>
      </div>
      <div className={`borde mt-[29px] w-[280px] justify-between flex relative`}>
        <div className={`${showPlayers ? "" : "hidden"} absolute border border-[red] w-[100px] text-[12px] bottom-[45px] bg-[#F5F5F5] p-[10px] rounded-[10px]`}>
          {allPlayers && allPlayers.map((player: any, idx: number) => {
            return (
              <div key={idx} className="flex items-center gap-[5px]">
                <button onClick={() => { evictPlayer(player.id) }} className={`w-[13px] h-[13px] cursor-pointer  rounded-[50%] bg-[#F86464] ${isOwner ? "flex" : "hidden"} justify-center items-center`}>
                  <div className="bg-white h-[2px] w-[8px] rounded-[2px]"></div>
                </button>
                <h2>{player.nickName}</h2>
              </div>
            )
          })}
        </div>
        <div className={`${urlCopied ? "flex items-center justify-center" : "hidden"} absolute border border-[black] left-[180px]  text-[12px] bottom-[35px] bg-[#F5F5F5] px-[5px] rounded-[10px]`}>
          <h2>Link Copied!</h2>
        </div>
        <div className={`${showModes ? "" : "hidden"} absolute border border-[red] w-[100px] text-[12px] left-[180px] bottom-[45px] bg-[#F5F5F5] p-[10px] rounded-[10px]`}>
          {modes.map((mode: any, idx: number) => {
            if (isOwner) {
              return (
                <div key={idx} className="flex items-center gap-[5px]">
                  <button disabled={isCpuActive} onClick={() => { mode.func(!isTimedMode) }} className={`w-[13px] h-[13px]  rounded-[50%] ${isTimedMode ? "bg-[#F86464]" : isCpuActive ? "bg-[darkgray]" : "bg-[lightgreen]"} ${isOwner ? "flex" : "hidden"} justify-center items-center`}>
                    <div className="bg-white h-[2px] w-[8px] rounded-[2px]"></div>
                  </button>
                  <h2 className={`${isCpuActive ? "text-[darkgray]":""}`}>{mode.name}</h2>
                </div>
              )
            }
            return (
              <div key={idx} className="flex items-center gap-[5px]">
                <div className={`w-[13px] h-[13px] cursor-pointer  rounded-[50%] ${isTimedMode ? "bg-[lightgreen]" : "bg-[#F86464]"} flex justify-center items-center`}>
                </div>
                <h2>{mode.name}</h2>
              </div>
            )
          })}
        </div>
        <button ref={playersRef} onClick={() => { setShowPlayers(!showPlayers) }} className="relative w-[35px] h-[35px] px-[2px] active:border rounded-[5px] active:border-[lightgreen]">
          <div className="w-[30px] h-[30px] relative">
            <Image alt="Players" fill={true} src="../icons/player-icon.svg" />
          </div>

        </button>
        <button onClick={() => { handleOpen() }} className="relative w-[35px] h-[35px] px-[2px] active:border rounded-[5px] active:border-[lightgreen]">
          <div className="w-[30px] h-[30px] relative">
            <Image alt="Players" fill={true} src="../icons/trophy.svg" />
          </div>

        </button>
        <button onClick={() => { handleInstructionsOpen() }} className="relative w-[35px] h-[35px] px-[2px] active:border rounded-[5px] active:border-[lightgreen]">
          <div className="w-[30px] h-[30px] relative">
            <Image alt="Players" fill={true} src="../icons/help.svg" />
          </div>
        </button>
        <button ref={modesRef} onClick={() => { setShowModes(!showModes) }} className="relative w-[35px]  px-[2px] active:border rounded-[5px] active:border-[lightgreen] h-[35px]">
          <div className="w-[30px] h-[30px] relative">
            <Image alt="Players" fill={true} src="../icons/modes.svg" />
          </div>
        </button>
        <button onClick={() => { copyUrl() }} className={` ${allPlayers ? "relative w-[35px] h-[35px]" : "hidden"} px-[2px] active:border rounded-[5px] active:border-[lightgreen] `}>
          <div className="w-[30px] h-[30px] relative">
            <Image className="cursor-pointer" alt="Players" fill={true} src="../icons/copy-link.svg" />
          </div>
        </button>
        <button disabled={isCpuActive || (allPlayers.length > 0)} onClick={() => { socket.emit("add_bot") }} className={`${isOwner ? "relative w-[30px] h-[30px]" : "hidden"}  pt-[2px] active:border rounded-[5px] active:border-[lightgreen] ${isCpuActive ? "border border-[lightgreen]" : ""} flex items-center justify-center`}>
          <div className="w-[30px] h-[30px] relative borde">
            <RiRobot3Line className={`-rotate-[90] ${isCpuActive ? "text-[lightgreen]" : "text-[red]"} w-[28px] h-[28px]`} />
          </div>
        </button>
      </div>
      <Modal
        open={open}
        onClose={handleClose}
      // aria-labelledby="modal-modal-title"
      // aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Table sx={{ width: 350 }} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Player</TableCell>
                <TableCell align="right">Rounds won</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {leaderboard.map((row) => (
                <TableRow
                  key={row.nickName}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.nickName}
                  </TableCell>
                  <TableCell align="right">{row.rounds}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Typography variant="h6" component="h2">
            {insult}
          </Typography>
          <Box>
            <Button sx={buttonStyle} disabled={isWon || hasWon ? false : !isWon || !hasWon ? true : false} onClick={() => { reset() }} className={`border border-[#000008]`}>Next Round</Button>
            <Button sx={buttonStyle} disabled={isWon || hasWon ? false : !isWon || !hasWon ? true : false} onClick={() => { reset("reset") }} className={`border border-[#000008] ml-[10px]`}>Reset Game</Button>
          </Box>
        </Box>
      </Modal>
      <Modal
        open={instructions}
        onClose={handleInstructionsClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={styleTwo}>
          <Typography variant="h4" component="h2">
            How to play.
          </Typography>
          <List sx={instructionList}>
            <ListItemText primary="Tap/click any coloured circle to highlight it and select that colour." />
            <ListItemText primary="Next, tap/click any of the four circles with a plus sign to apply your selected colour." />
            <ListItemText primary="Repeat steps 1 and 2 above as many times as you like to create a pattern with all four colours." />
            <ListItemText primary={`Click/tap the "Play Selection" button to play your pattern and wait for your opponent.`} />
            <ListItemText primary={`The turn notification bar at the top left displays whose turn it is.`} />
            <ListItemText primary={`The hint bar at the top right displays how many correct colour matches you played on your last turn.`} />
            <ListItemText primary={`A round ends when someone plays a pattern that matches the game's secret pattern.`} />
            <ListItemText primary={`The leaderboard displays a record of players' scores starting with the hightest.`} />
            <ListItemText primary={`Click/tap the "Next Round" button to keep the scores and restart the game with a new pattern.`} />
            <ListItemText primary={`Click/tap the "Reset" button to erase the scores and restart the game with a new pattern.`} />
          </List>
        </Box>
      </Modal>
      <div className="flex flex-col gap-[3px]">
        {playerStatus.map((status: string) => {
          return (
            <div className={`flex min-w-[50px] border min-h-[20px] rounded-[10px] items-center justify-center bg-[#F5F5F5] px-[5px]`}>
              {status}
            </div>
          )
        })}
      </div>
    </main>
  )
}
