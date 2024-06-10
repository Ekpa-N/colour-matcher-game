"use client"
import Image from "next/image";
import ColourMatcher from "@/components/ColourMatcher";
import AppContext from "@/components/Provider";
import { useEffect, useState, useRef, ReactEventHandler, ReactHTMLElement } from "react";
import { io } from 'socket.io-client';
import { useRouter } from "next/navigation";
import { db } from '@/firebase';
import { useSubscription } from "@/hooks/customHooks";
import { shuffleArray, matchChecker, copyToClipboard, isIdentical, getInsult } from "@/components/helpers";
import { collection, addDoc, getDocs, limit, query, where, doc, updateDoc, setDoc, getDoc, startAt, startAfter, getCountFromServer, serverTimestamp, endBefore, onSnapshot, deleteDoc } from "firebase/firestore";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { ClassNames } from "@emotion/react";
import { List, ListItemText, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import LoadingScreen from "@/components/Loader";


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
  flexDirection: "column"
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
  overflow: "auto"
};

const instructionList = {
  display: "flex",
  flexDirection: "column",
  gap: "10px"
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
  const [insult, setInsult] = useState<string>("")
  const [currentRound, setCurrentRound] = useState<string>("")

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleInstructionsOpen = () => setInstructions(true);
  const handleInstructionsClose = () => setInstructions(false);

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
      setCurrentRound(error.currentRound)
      setIsWon(error.isWon)
      setTurn(error.isTurn)
      setIsPlaying(error.isPlaying)
      setHasWon(error.hasWon)
      setLeaderboard(error.leaderBoard.sort((a: any, b: any) => Number(b.rounds) - Number(a.rounds)))
      if (error.ownership) {
        let allPlayersList = [{ nickName: "", id: "" }]
        setAllPlayers([...allPlayersList, error.ownership.filter((player: any) => player.id != localData.playerId)].flat())
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
        handleOpen()
      } else {
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
      const playsReset = thePlayers.map((player: any) => {
        player.played = ["", "", "", ""]
        if (action == "reset") {
          player.roundsWon = "0"
        }
        return player
      })
      await updateDoc(dataRef, {
        players: playsReset,
        turn: "0",
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

      <div className="w-[67px] flex justify-center text-[11px] pb-[15px] h-[13px] rounded-[7px] bg-[black] text-[white] font-be">
        Round {currentRound}
      </div>


      <div className="flex flex-col border border-black rounded-[7px] w-[90%] pb-[27px] items-center justify-start pt-[17px] px-[2px]">
        <div className="flex gap-[5px]">
          <div className={`${isLoading ? "hidden" : ""} border border-black rounded-[10px] font-[700] flex justify-center items-center text-center font-be text-[8px] h-[13px] w-[70px]`}>
            {`${isWon ? "You have won this round!" : hasWon ? hasWon : turn ? "Your turn" : isPlaying}`}
          </div>
          <div className={` ${isLoading ? "hidden" : "border border-black rounded-[10px] font-[700] flex justify-center items-center text-center font-be text-[8px] h-[13px] w-[70px]"}`}>You matched {matchCount}</div>
        </div>
        <div className={`borde ${isLoading ? "hidden" : ""} text-center mt-[5px] h-[24px] w-[107px] ${isWon || hasWon ? "fancy" : ""}  ${winningPattern ? "" : ""}`}>
          <ColourMatcher type="win" pattern={winningPattern} toChange={toChange} switchColour={switchColour} />
        </div>


        <div className={`flex ${isLoading ? "hidden" : ""}  flex-col items-center w-[202px] mt-[65px]  gap-[22px] relative`}>
          <ColourMatcher type="play" pattern={currentPattern} toChange={toChange} switchColour={switchColour} />
          <div className="border-t w-[259px] border-[#D4D8BE] top-[49%] absolute"></div>
          <ColourMatcher type="default" pattern={pattern} toChange={toChange} switchColour={switchColour} />
        </div>
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
        <div className="flex gap-[5px] flex-col">
          {/* <button onClick={() => { reset() }} className={`border delet p-2 font-[600] active:bg-[#000080] active:text-[#fffff0] bg-[#fffff0] text-[#000080] rounded mt-[20px] ${isWon ? "" : hasWon ? "" : "hidden"}`}>Reset</button> */}
          <div className={`${isLoading ? "hidden" : ""}`}><Button sx={leaderBoardButton} className="h-[35px]" onClick={() => { handleInstructionsOpen() }}>Instructions</Button></div>
          {/* <button onClick={() => { play() }} className={`border ${isLoading ? "hidden" : ""} text-[#f6ebf4] active:bg-[#f6ebf4] active:text-[#338f1f] bg-[#338f1f] p-2 font-[600] rounded`}>Play Selection</button> */}
        </div>
      </div>
      <button onClick={() => { play() }} className={`border ${isLoading ? "hidden" : ""} border-black active:bg-[#f6ebf4] active:text-[#338f1f] w-[328px] active:text-[#fff] h-[44px] rounded-[50px] font-be font-[600]`}>Play Your Selection</button>


      <div className={`absolute border text-black w-full ${isLoading ? "" : "hidden"} flex items-center justify-center h-full`}>
        <div className={`relative borde h-[50px] w-[50px] mt-[250px]`}>
          <Image alt='' src={"/images/loading-state.svg"} fill={true} />
        </div>
      </div>
      <div className={` borde justify-between flex absolute bottom-[10px] w-[350px] gap-[5px] borde`}>
        <div className={`${isLoading ? "hidden" : ""}`}>
          <Button sx={leaderBoardButton} className="h-[35px]" onClick={() => { handleOpen() }}>Leaderboard</Button>
        </div>
        <div className={`${allPlayers ? "flex" : "hidden"}`}>
          <button onClick={() => { copyToClipboard(localData.url) }} className='border  box-border font-[500] active:bg-[white] active:text-[green] flex justify-center items-center text-[15px] w-[85px] h-[35px]  bg-[green] text-[white] rounded-[5px]'> Copy Link </button>
          <button onClick={() => { endGame() }} className={`border ${isLoading || !allPlayers ? "hidden" : "text-[#fffff0] active:text-[red] active:bg-[#fffff0] bg-[red]"} px-[3px] rounded`}>End Game</button>
        </div>
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
    </main>
  )
}
