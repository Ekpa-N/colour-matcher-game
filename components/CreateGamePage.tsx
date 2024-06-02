"use client"
import { GoogleLogin } from '@react-oauth/google';
import { io } from 'socket.io-client';
import { ReactEventHandler, useEffect, useState } from 'react';
import { generateRandomString, copyToClipboard, shuffleArray } from '@/components/helpers';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { v4 as uuidv4 } from "uuid"
import { db } from '@/firebase';
import { collection, addDoc, getDocs, limit, query, where, doc, updateDoc, setDoc, getDoc, startAt, startAfter, getCountFromServer, serverTimestamp, endBefore } from "firebase/firestore";


export default function CreateGamePage() {
    const searchParams = useSearchParams()
    const [gameDetails, setGameDetails] = useState<{ nickname: string, players: string }>({ nickname: "", players: "2" })
    const [isLoading, setIsLoading] = useState<any>(false)
    const [shareLink, setShareLink] = useState<string>("")
    const [gameState, setGameState] = useState<string>("")
    const [room, setRoom] = useState<string>("")
    const router = useRouter()
    const pattern = ["red", "green", "blue", "yellow", "black", "purple"]
    const [isCreated, setIsCreated] = useState<boolean>(false)


    function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
        setGameDetails({ ...gameDetails, [e.target.name]: e.target.value })
    }

    // function testSocketConnection() {
    //   const socket = io(`${process.env.api}:3002` || "", {
    //     query: {
    //       customId: "customID",
    //       nickname: "nickname",
    //       roomId: "roomID"
    //     }
    //   })
    // }

    async function createNewGame(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (isCreated) {
            router.push(`/home`)
            return
        }
        const roomId = generateRandomString() + gameDetails.nickname
        const shuffledPattern = shuffleArray(pattern)
        const defaultShuffle = shuffleArray(pattern)
        const playerID = uuidv4()
        const newGameData = {
            document: roomId,
            defaultPattern: defaultShuffle,
            player: [{ id: playerID, pattern: shuffledPattern, nickname: gameDetails.nickname, played: ["", "", "", "", "", ""] }],
            isNew: true
        }
        try {
            const newGame = await axios.post(`https://colour-matcher-server.vercel.app/new-game`, newGameData);
            if (newGame.data.status === 200) {
                console.log(newGame.data.message);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error message:', error.message)
                if (error.response) {
                    console.error('Response data:', error.response.data)
                    console.error('Response status:', error.response.status)
                }
            } else {
                console.error('Unexpected error:', error);
            }
        }
        setShareLink(`${process.env.api}:3000?id=${roomId}`)
        localStorage.setItem("colourMatcherPlayerData", JSON.stringify({ roomId: roomId, playerId: playerID, url: `${process.env.apiToo}:3000?id=${roomId}`, nickname: gameDetails.nickname }))
        setIsCreated(true)
        // router.push(`/home?id=${roomId}&nickname=${gameDetails.nickname}`)
    }


    async function joinNewGame(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        // const roomId = generateRandomString() + gameDetails.nickname
        const shuffledPattern = shuffleArray(pattern)
        const playerID = uuidv4()
        const newGameData = {
            document: room,
            defaultPattern: [],
            player: { id: playerID, pattern: shuffledPattern, nickname: gameDetails.nickname, played: ["", "", "", "", "", ""] },
            isNew: false
        }
        try {
            const newGame = await axios.post(`${process.env.api}:3002/new-game`, newGameData);
            if (newGame.data.status === 200) {
                localStorage.setItem("colourMatcherPlayerData", JSON.stringify({ roomId: room, playerId: playerID, url: `${process.env.apiToo}:3000?id=${room}`, nickname: gameDetails.nickname }))
                router.push(`/home`)
                console.log(newGame.data.message);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error message:', error.message)
                if (error.response) {
                    console.error('Response data:', error.response.data)
                    console.error('Response status:', error.response.status)
                }
            } else {
                console.error('Unexpected error:', error);
            }
        }
    }

    async function checkExistingGameData({ roomId, playerId }: { roomId: string, playerId: string }) {
        let players: any[] = []
        // const game = searchParams.has("id")
        // const id = searchParams.get("id") as string
        const docRef = doc(db, "games", roomId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            players = docSnap.data().players
            const currentPlayer = players.find(player => player.id == playerId)
            if (currentPlayer) {
                router.push(`/home?player=${playerId}&room=${roomId}`)
                return
            }
            localStorage.removeItem("colourMatcherPlayerData")
            setGameState("new")
            return
        }
        setGameState("new")
        return
    }


    useEffect(() => {
        const game = searchParams.has("id")
        const id = searchParams.get("id") as string
        // local Storage test data {"roomId":"VgX@4PVaaoEkpa", "playerId":"9e6f178a-b3ec-4fb5-9b7b-26bfcd1f7dcb"}
        let existingDetails = localStorage.getItem("colourMatcherPlayerData") != null && localStorage.getItem("colourMatcherPlayerData") != undefined ? JSON.parse(localStorage.getItem("colourMatcherPlayerData") as string) : ""
        if (existingDetails) {
            checkExistingGameData(existingDetails)
            return
        }
        if (game) {
            setRoom(id)
            setGameState("join")
        } else {
            setGameState("new")
        }
    }, [])




    return (
        <main className="flex min-h-screen flex-col gap-[20px] items-center justify-center p-2">
            <form onSubmit={createNewGame} className={`${gameState == "new" ? "flex" : "hidden"} flex-col p-2 border border-[green] w-[400px] items-start box-border`}>
                <h2 className="self-center">Welcome to Colour Matcher</h2>
                <label className="border w-full" htmlFor="username">Nickname</label>
                <input value={gameDetails.nickname} onChange={(e) => { handleInputChange(e) }} type="text" placeholder='Enter your nickname' className="w-full border mt-[5px]" name="nickname" />
                <label className="border mt-[20px] w-full" htmlFor="password">How many players?</label>
                <select value={gameDetails.players} onChange={handleInputChange} name='players' className='border'>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                </select>

                <div className="mt-[20px] borde flex flex-col w-full">
                    <div className="w-full flex justify-between">
                        <button disabled={gameDetails.nickname == "" || isCreated} type='submit' className="px-2 border rounded">Create Game</button>
                        <button type='submit' className={`px-2 border rounded ${isCreated ? "" : "hidden"}`}>Join Game</button>
                    </div>
                </div>
            </form>
            <div className={`${gameState == "new" ? "flex" : "hidden"} justify-between w-[400px] border mt-[10px]`}>
                <input value={shareLink} readOnly className='border outline-none px-[2px] w-[85%]' />
                <button onClick={() => { copyToClipboard(shareLink) }} className='border box-border  p-[2px]'> copy </button>
            </div>
            <form onSubmit={joinNewGame} className={`${gameState == "join" ? "flex" : "hidden"} flex-col p-2 border border-[green] w-[400px] items-start box-border`}>
                <h2 className="self-center">Welcome to Colour Matcher</h2>
                <label className="border w-full" htmlFor="username">Nickname</label>
                <input value={gameDetails.nickname} onChange={(e) => { handleInputChange(e) }} type="text" placeholder='Enter your nickname' className="w-full border mt-[5px]" name="nickname" />

                <div className="mt-[20px] borde flex flex-col w-full">
                    <div className="w-full flex justify-between">
                        <button disabled={gameDetails.nickname == ""} type='submit' className="px-2 border rounded">Join Game</button>
                    </div>
                </div>
            </form>
            {/* <button onClick={()=>{testSocketConnection()}}>test</button> */}


        </main>
    )
}
