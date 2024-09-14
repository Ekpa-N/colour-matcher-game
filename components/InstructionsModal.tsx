"use client"

import { Box, Modal, Typography } from "@mui/material"
import { LiaLongArrowAltDownSolid } from "react-icons/lia"
import Image from "next/image";
import { RiRobot3Line } from "react-icons/ri";


const styleTwo = {
    position: 'absolute' as 'absolute',
    top: '40%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 380,
    height: 500,
    bgcolor: '#fffff0',
    boxShadow: 24,
    p: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "auto",
    borderRadius: "20px"
};

const navi = {
    left: '50%',
    transform: 'translate(-50%, -50%)',
}

const instructionStyle = {
    display: "flex",
    flexDirection: "column",
    // border: "1px solid green"
}

const instructionList = {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    borderRadius: "10px"
}

const instructionButtons = ["#20958E", "#AFD802", "#DF93D2", "#F7E270"]

type InstructionsProps = {
    instructions: boolean;
    handleInstructionsOpen: () => void;
    handleInstructionsClose: () => void;
    instructionsPage: number;
    handleInstructionsPage: (page: number) => void
}

export default function Instructions({ instructions, handleInstructionsClose, handleInstructionsOpen, instructionsPage, handleInstructionsPage }: InstructionsProps) {
    return (
        <>
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
                    <Box sx={instructionStyle}>
                        <p>Arrange the colours to match a secret pattern</p>
                        <div className={`${instructionsPage == 1 ? "flex" : "hidden"} flex-col`}>
                            <div className='flex mt-[20px]'>
                                <div className='border rounded-[10px] p-[5px] gap-[10px] flex flex-col h-fit'>
                                    <div className='flex gap-[5px]'>
                                        {instructionButtons.map((button: string, idx: number) => {
                                            return (
                                                <button key={idx} className={`w-[25px] flex justify-center items-center h-[25px] border bg-[#fffff0] text-[11px] border-[#D4D8BE] text-[#D4D8BE] rounded-[50%]`}>
                                                    {idx + 1}
                                                </button>
                                            )
                                        })}
                                    </div>
                                    {/* <div className='flex gap-[5px]'>
                                        {instructionButtons.map((button: string, idx: number) => {
                                            return (
                                                <button style={{ backgroundColor: `${button}` }} key={idx} className={`w-[25px] flex justify-center items-center h-[25px] border bg-[#fffff0] text-[11px] border-[#D4D8BE] text-[#D4D8BE] rounded-[50%]`}>
                                                </button>
                                            )
                                        })}
                                    </div> */}
                                </div>
                                <div className='borde rounded-[10px] grow flex-col'>
                                    <div className='flex relative items-center'>
                                        <LiaLongArrowAltDownSolid className='h-[35px] relative text-[gray]' />
                                        <p className='relative borde grow h-fit flex text-[13.5px] text-center'>Tap multiple times to set a color</p>
                                    </div>
                                    {/* <div className='flex relative items-center'>
                                        <LiaLongArrowAltDownSolid className='h-[35px] relative text-[gray]' />
                                        <p className='relative borde grow h-fit flex text-[13.5px] text-center'>Tap to pick a colour here</p>
                                    </div> */}
                                </div>
                            </div>
                            <div className='flex mt-[5px] items-center'>
                                <button className={`border border-black active:bg-[#f6ebf4] active:text-[#338f1f] w-[126px] active:text-[#fff] h-[15px] text-[12px] flex justify-center items-center rounded-[50px] font-be`}>Play Your Pattern</button>
                                <div className='flex relative items-center'>
                                    <LiaLongArrowAltDownSolid className='h-[35px] relative text-[gray]' />
                                    <p className='relative borde grow h-fit flex text-[13.5px] text-center'>Tap to play your turn</p>
                                </div>
                            </div>
                            <div className='flex mt-[5px] items-center'>
                                <div className='w-[125px] flex justify-center'>
                                    <div className='border flex gap-[5px] p-[2px] rounded-[10px]'>
                                        {instructionButtons.map((button: string, idx: number) => {
                                            return (
                                                <button key={idx} className={`w-[19px] h-[19px] border bg-[#fffff0] text-[#000080]  rounded-[50%]`}>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                                <div className='flex relative items-center'>
                                    <LiaLongArrowAltDownSolid className='h-[35px] relative text-[gray]' />
                                    <p className='relative borde grow h-fit flex text-[13.5px] text-center'>Shows your last selection</p>
                                </div>
                            </div>

                            <div className='flex mt-[5px] items-center'>
                                <div className='flex justify-center w-[126px]'>
                                    <button className={`border border-black p-[10px] active:bg-[#f6ebf4] active:text-[#338f1f] active:text-[#fff] h-[15px] text-[12px] flex justify-center items-center rounded-[50px] font-be`}>You matched 2</button>
                                </div>
                                <div className='flex relative items-center'>
                                    <LiaLongArrowAltDownSolid className='h-[35px] relative text-[gray]' />
                                    <p className='relative borde grow h-fit flex text-[13.5px] text-center'>Matches on last selection</p>
                                </div>
                            </div>
                            <div className='flex mt-[5px] items-center'>
                                <div className='flex justify-center w-[126px]'>
                                    <button className={`border border-black p-[10px] active:bg-[#f6ebf4] active:text-[#338f1f] active:text-[#fff] h-[15px] text-[12px] flex justify-center items-center rounded-[50px] font-be`}>Your Turn</button>
                                </div>
                                <div className='flex relative items-center'>
                                    <LiaLongArrowAltDownSolid className='h-[35px] relative text-[gray]' />
                                    <p className='relative borde grow h-fit flex text-[13.5px] text-center'>Shows current player</p>
                                </div>
                            </div>
                        </div>
                        <div className={`flex flex-col ${instructionsPage == 2 ? "flex" : "hidden"}`}>
                            <div className='flex mt-[5px] items-center'>
                                <div className='flex justify-center w-[126px]'>
                                    <button className="relative w-[35px] h-[35px] px-[2px] active:border rounded-[5px] active:border-[lightgreen]">
                                        <div className="w-[30px] h-[30px] relative">
                                            <Image alt="Players" fill={true} src="../icons/player-icon.svg" />
                                        </div>
                                    </button>
                                </div>
                                <div className='flex relative items-center'>
                                    <LiaLongArrowAltDownSolid className='h-[35px] relative text-[gray]' />
                                    <p className='relative borde grow h-fit flex text-[13.5px] text-center'>Tap to see list of players</p>
                                </div>
                            </div>
                            <div className='flex mt-[5px] items-center'>
                                <div className='flex justify-center w-[126px]'>
                                    <button className={` relative w-[35px] h-[35px] px-[2px] active:border rounded-[5px] active:border-[lightgreen] `}>
                                        <div className="w-[30px] h-[30px] relative">
                                            <Image className="cursor-pointer" alt="Players" fill={true} src="../icons/copy-link.svg" />
                                        </div>
                                    </button>
                                </div>
                                <div className='flex relative items-center'>
                                    <LiaLongArrowAltDownSolid className='h-[35px] relative text-[gray]' />
                                    <p className='relative borde grow h-fit flex text-[13.5px] text-center'>Tap for game link to share</p>
                                </div>
                            </div>
                            <div className='flex mt-[5px] items-center'>
                                <div className='flex justify-center w-[126px]'>
                                    <button className={`relative w-[30px] h-[30px]  pt-[2px] active:border rounded-[5px] active:border-[lightgreen] flex items-center justify-center`}>
                                        <div className="w-[30px] h-[30px] relative borde">
                                            <RiRobot3Line className={`-rotate-[90] w-[28px] h-[28px]`} />
                                        </div>
                                    </button>
                                </div>
                                <div className='flex relative items-center'>
                                    <LiaLongArrowAltDownSolid className='h-[35px] relative text-[gray]' />
                                    <p className='relative borde grow h-fit flex text-[13.5px] text-center'>*Tap to play with CPU</p>
                                </div>
                            </div>
                            <div className='flex mt-[5px] items-center'>
                                <div className='flex justify-center w-[126px]'>
                                    <button className="relative w-[35px]  px-[2px] active:border rounded-[5px] active:border-[lightgreen] h-[35px]">
                                        <div className="w-[30px] h-[30px] relative">
                                            <Image alt="Players" fill={true} src="../icons/modes.svg" />
                                        </div>
                                    </button>
                                </div>
                                <div className='flex relative items-center'>
                                    <LiaLongArrowAltDownSolid className='h-[35px] relative text-[gray]' />
                                    <p className='relative borde grow h-fit flex text-[13.5px] text-center'>*Tap for timed mode on/off</p>
                                </div>
                            </div>
                            <div className='flex mt-[5px] items-center'>
                                <div className='flex justify-center w-[126px]'>
                                    <button onClick={() => { handleInstructionsOpen() }} className="relative w-[35px] h-[35px] px-[2px] active:border rounded-[5px] active:border-[lightgreen]">
                                        <div className="w-[30px] h-[30px] relative">
                                            <Image alt="Players" fill={true} src="../icons/help.svg" />
                                        </div>
                                    </button>
                                </div>
                                <div className='flex relative items-center'>
                                    <LiaLongArrowAltDownSolid className='h-[35px] relative text-[gray]' />
                                    <p className='relative borde grow h-fit flex text-[13.5px] text-center'>Tap for instructions</p>
                                </div>
                            </div>
                            <div className='flex mt-[5px] items-center'>
                                <div className='flex justify-center w-[126px]'>
                                    <button className="relative w-[35px] h-[35px] px-[2px] active:border rounded-[5px] active:border-[lightgreen]">
                                        <div className="w-[30px] h-[30px] relative">
                                            <Image alt="Players" fill={true} src="../icons/trophy.svg" />
                                        </div>

                                    </button>
                                </div>
                                <div className='flex relative items-center'>
                                    <LiaLongArrowAltDownSolid className='h-[35px] relative text-[gray]' />
                                    <p className='relative borde grow h-fit flex text-[13.5px] text-center'>Tap to see leaderboard</p>
                                </div>
                            </div>
                            <p className="absolute bottom-[50px] left-[2px] text-[10px] font-[600] self-center">*Only visible to current game owner</p>
                        </div>

                        <div style={navi} className="flex absolute gap-[3px] bottom-[5px]">
                            <button onClick={() => { handleInstructionsPage(1) }} className={`w-[20px] h-[20px] border ${instructionsPage == 1 ? "bg-[gray]" : "bg-[lightgray]"}  text-[#000080]  rounded-[50%]`}>
                            </button>
                            <button onClick={() => { handleInstructionsPage(2) }} className={`w-[20px] h-[20px] border  ${instructionsPage == 2 ? "bg-[gray]" : "bg-[lightgray]"} text-[#000080]  rounded-[50%]`}>
                            </button>
                        </div>
                    </Box>
                </Box>
            </Modal>
        </>
    )
}