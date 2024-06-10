"use client"
import { useEffect, useState } from 'react';
import { generateRandomString, copyToClipboard, shuffleArray, removeSpaces } from '@/components/helpers';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { v4 as uuidv4 } from "uuid"
import Image from 'next/image';
import { db } from '@/firebase';
import LoadingScreen from './Loader';
import { doc, getDoc } from "firebase/firestore";


export default function CreateGamePage() {
    const searchParams = useSearchParams()
    const [gameDetails, setGameDetails] = useState<{ nickname: string, players: string }>({ nickname: "", players: "2" })
    const [isLoading, setIsLoading] = useState<any>(false)
    const [shareLink, setShareLink] = useState<string>("")
    const [gameState, setGameState] = useState<string>("")
    const [room, setRoom] = useState<string>("")
    const router = useRouter()
    const pattern = ["red", "green", "blue", "yellow"]
    const [isCreated, setIsCreated] = useState<boolean>(false)
    const [loadError, setLoadError] = useState<boolean>(false)



    function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void {
        setGameDetails({ ...gameDetails, [e.target.name]: e.target.value })
    }

    useEffect(() => {
        async function validateState() {
            const game = searchParams.has("id")
            const id = searchParams.get("id") as string
            let existingDetails = localStorage.getItem("colourMatcherPlayerData") != null && localStorage.getItem("colourMatcherPlayerData") != undefined ? JSON.parse(localStorage.getItem("colourMatcherPlayerData") as string) : ""
            // debugger

            if ((game && existingDetails) && (id == existingDetails.roomId)) {
                await checkExistingGameData(existingDetails)
                return
            }
            if ((game && existingDetails) && (id != existingDetails.roomId)) {
                localStorage.removeItem("colourMatcherPlayerData")
            }

            if (game) {
                const docRef = doc(db, "games", id)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    setRoom(id)
                    setGameState("join")
                    return
                }
            }
            if (existingDetails) {
                await checkExistingGameData(existingDetails)
                return
            }

            setGameState("new")
        }

        validateState()
    }, [])

    async function checkExistingGameData({ roomId, playerId }: { roomId: string, playerId: string }) {
        let players: any[] = []
        const docRef = doc(db, "games", roomId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            players = docSnap.data().players
            const currentPlayer = players.find(player => player.id == playerId)
            if (currentPlayer) {
                router.push(`/home`)
                return
            }
            localStorage.removeItem("colourMatcherPlayerData")
            setGameState("new")
            return
        }

        localStorage.removeItem("colourMatcherPlayerData")
        setGameState("new")
        return
    }

    async function createNewGame(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        setLoadError(false)
        if (isCreated) {
            router.push(`/home`)
            return
        }
        const trimmedName = removeSpaces(gameDetails.nickname).trim()
        const roomId = generateRandomString() + trimmedName
        const shuffledPattern = shuffleArray(pattern)
        const defaultShuffle = shuffleArray(pattern)
        const playerID = uuidv4()
        const newGameData = {
            document: roomId,
            defaultPattern: defaultShuffle,
            player: [{ id: playerID, pattern: shuffledPattern, nickname: gameDetails.nickname, played: ["", "", "", ""], roundsWon: "0" }],
            isNew: true
        }
        try {
            const newGame = await axios.post(`${process.env.newGame}`, newGameData, {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            if (newGame.status == 200) {
                setShareLink(`https://colour-matcher-game.vercel.app?id=${roomId}`)
                localStorage.setItem("colourMatcherPlayerData", JSON.stringify({ roomId: roomId, playerId: playerID, url: `https://colour-matcher-game.vercel.app?id=${roomId}`, nickname: gameDetails.nickname }))
                setIsCreated(true)
                setIsLoading(false)
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                setIsLoading(false)
                setLoadError(true)
                console.error('Error message:', error.message)
                if (error.response) {
                    setLoadError(true)
                    setIsLoading(false)
                    console.error('Response data:', error.response.data)
                    console.error('Response status:', error.response.status)
                }
            } else {
                setLoadError(true)
                console.error('Unexpected error:', error);
                setIsLoading(false)
            }
        }
        // router.push(`/home?id=${roomId}&nickname=${gameDetails.nickname}`)
    }

    async function joinNewGame(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsLoading(true)
        // const roomId = generateRandomString() + gameDetails.nickname
        const shuffledPattern = shuffleArray(pattern)
        const playerID = uuidv4()
        const newGameData = {
            document: room,
            defaultPattern: [],
            player: { id: playerID, pattern: shuffledPattern, nickname: gameDetails.nickname, played: ["", "", "", ""], roundsWon: "0" },
            isNew: false
        }
        try {
            const newGame = await axios.post(`${process.env.newGame}`, newGameData, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            if (newGame.status === 200) {
                setIsLoading(false)
                localStorage.setItem("colourMatcherPlayerData", JSON.stringify({ roomId: room, playerId: playerID, url: `https://colour-matcher-game.vercel.app?id=${room}`, nickname: gameDetails.nickname }))
                router.push(`/home`)
                // console.log(newGame.data.message);
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error message:', error.message)
                setIsLoading(false)
                if (error.response) {
                    console.error('Response data:', error.response.data)
                    console.error('Response status:', error.response.status)
                    setIsLoading(false)
                }
            } else {
                console.error('Unexpected error:', error);
                setIsLoading(false)
            }
        }
    }



    return (
        <main className="flex h-[450px] w-full border border-[#DF93D2] rounded flex-col gap-[5px] items-center justify-start p-2 font-poppins">
            <form onSubmit={createNewGame} className={`${gameState == "new" ? "flex" : "hidden"} flex-col p-2 borde rounded-[5px] border-[green]  w-[350px] items-start box-border`}>
                <div className='relative w-[184px] h-[64px] self-center'>
                    <Image alt='logo' src="/images/colour-matcher-loader.svg" fill={true} />
                </div>
                {/* <label className="borde mt-[5px] w-full rounded px-[2px]" htmlFor="username">Nickname</label> */}
                <input value={gameDetails.nickname} onChange={(e) => { handleInputChange(e) }} type="text" placeholder='Enter your nickname' className="w-[327px] h-[44px] rounded-[30px] text-center font-[be] border rounded px-[2px] mt-[28px]" name="nickname" />
                {/* <label className="borde mt-[20px] w-full" htmlFor="password">How many players?</label>
                <select value={gameDetails.players} onChange={handleInputChange} name='players' className='borde'>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                </select> */}

                <div className="mt-[20px] borde flex flex-col w-full">
                    <div className="w-full flex justify-between">
                        <button disabled={gameDetails.nickname == "" || isCreated || isLoading} type='submit' className={`px-2 border rounded relative w-[327px] h-[44px] rounded-[30px] text-center font-[be] justify-center text-[#fff] active:text-[#000] active:bg-[#FFF] items-center bg-[#000] ${isLoading || isCreated ? "hidden": "flex"}`}>
                            <h2 className={`${isLoading || isCreated ? "hidden" : ""}`}>Create Game</h2>
                        </button>
                        <button disabled={true} className={`justify-center items-center ${isLoading ? "flex": "hidden"} w-[327px] h-[44px] rounded-[30px]`}>
                            <LoadingScreen type='button' />
                        </button>
                        <button type='submit' className={`px-2 border rounded relative w-[327px] h-[44px] rounded-[30px] text-center font-[be] justify-center text-[#fff] active:text-[#000] active:bg-[#FFF] items-center bg-[#20958E] ${!isCreated || isLoading ? "hidden" : ""}`}>Join Game</button>
                        <input value={"Error occured, try again"} readOnly className={`px-2 borde rounded text-[9px] font-[700] text-[red] ${loadError ? "" : "hidden"}`} />
                    </div>
                </div>
            </form>
            <div className={`${gameState == "new" ? "flex" : "hidden"} justify-between w-[350px] borde mt-[5px] flex-col`}>
                <button onClick={() => { copyToClipboard(shareLink) }} className={`px-2 border rounded relative w-[327px] h-[44px] rounded-[30px] text-center font-[be] justify-center text-[#fff] active:text-[#000] active:bg-[#FFF] items-center bg-[#AFD802]  ${!shareLink ? "hidden" : ""}`}>Copy share link</button>
            </div>
            <form onSubmit={joinNewGame} className={`${gameState == "join" ? "flex" : "hidden"} flex-col p-2 border border-[green] w-[400px] items-start box-border`}>
                <h2 className="self-center">Welcome to Colour Matcher</h2>
                <label className="border w-full" htmlFor="username">Nickname</label>
                <input value={gameDetails.nickname} onChange={(e) => { handleInputChange(e) }} type="text" placeholder='Enter your nickname' className="w-full border mt-[5px]" name="nickname" />

                <div className="mt-[20px] borde flex flex-col w-full">
                    <div className="w-full flex justify-between">
                        <button disabled={gameDetails.nickname == ""} type='submit' className="px-2 border rounded">
                            <h2 className={`${isLoading ? "hidden" : ""}`}>Join Game</h2>
                            <div className={`relative borde h-[25px] w-[30px] ${isLoading ? "" : "hidden"}`}>
                                <Image alt='' src={"/images/loading-state.svg"} fill={true} />
                            </div>
                        </button>
                    </div>
                </div>
            </form>

        </main>
    )
}
