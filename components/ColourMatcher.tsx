"use client"
import React, { useEffect, useState } from "react";
import AppContext from "./Provider";


type ColourProps = {
    defaultColours: string[];
    player: string | number;
    playerColours: string[];
    makeSwitch: (position: number, player: string)=>void;
    makeSwitchToo: (position: number, player: string)=>void;
    toSwitch: {first: number};
    type?: string;
    patternError?: any;
    playerToSwitch?: string
}

const ColourMatcher: React.FC<ColourProps> = ({ defaultColours=[], player, playerColours = [], makeSwitch, makeSwitchToo , toSwitch, type="default", patternError=[], playerToSwitch="one" }) => {
    const [playerPattern, setPlayerPattern] = useState<any []>([])

    useEffect(()=>{
        // setPlayerPattern(playerColours)
        // console.log("To switch: ", toSwitch)
    }, [toSwitch])

    useEffect(()=>{
    },[playerColours])


    if(type == "default") {
        return (
            <div className="border border-black w-[300px] flex p-2 flex-col">
                <h2>Player {player}</h2>
                <div className="flex justify-between mt-[100px]">
                    {defaultColours.map((colour, idx) => {
                        return (
                            <button key={idx} style={{backgroundColor: colour}} className="w-[50px] h-[50px] border rounded-[50%]"></button>
                        )
                    })}
                </div>
                <div className="flex justify-between mt-[30px]">
                    {playerColours.map((colour, idx) => {
                        return (
                            <button key={idx} style={{backgroundColor: colour}} className={`w-[50px] h-[50px] rounded-[50%] ${toSwitch.first == idx ? "border-[3px] border border-black" : "border"}`}></button>
                        )
                    })}
                </div>
            </div>
        )
    }
    return (
        <div className="border border-black w-[100%] flex p-2 flex-col">
            <div className="flex justify-between mt-[30px]">
                {patternError.map((colour:string, idx:number) => {
                    return (
                        <button onClick={()=>{makeSwitchToo(idx, playerToSwitch)}} key={idx} style={{backgroundColor: colour}} className={`w-[50px] h-[50px] rounded-[50%] ${toSwitch.first == idx ? "border-[3px] border border-black" : "border"}`}></button>
                    )
                })}
            </div>
        </div>
    )
}

export default ColourMatcher