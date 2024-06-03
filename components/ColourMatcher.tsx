"use client"
import React, { useEffect, useState } from "react";
import AppContext from "./Provider";


type ColourProps = {
    pattern?: any;
    toChange: string;
    switchColour: (idx: number, type?: string) => void;
    type: string

}

const ColourMatcher: React.FC<ColourProps> = ({ pattern = [], toChange, switchColour, type }) => {
    const [playerPattern, setPlayerPattern] = useState<any[]>([])

    return (
        <div className={`border border-blac w-[100%] flex justify-between p-2`}>
                {pattern.map((colour: string, idx: number) => {
                    if (type == "win") {
                        return (
                            <button key={idx} style={{ backgroundColor: colour }} className={`w-[40px] border bg-[lightgray] h-[40px] rounded-[50%]`}>
                            </button> //style={{backgroundColor: colour}}
                        )
                    }
                    if (colour == "") {
                        return (
                            <button onClick={() => { switchColour(idx, "play") }} key={idx} className={`w-[50px] border bg-[lightgray] h-[50px] rounded-[50%]`}>
                                +
                            </button> //style={{backgroundColor: colour}}
                        )
                    }
                    if (type == "play") {
                        return (
                            <button onClick={() => { switchColour(idx, "play") }} key={idx} style={{ backgroundColor: colour }} className={`w-[50px] border bg-[lightgray] h-[50px] rounded-[50%]`}>
                            </button> //style={{backgroundColor: colour}}
                        )
                    }

                    return (
                        <button onClick={() => { switchColour(idx) }} key={idx} style={{ backgroundColor: colour }} className={`w-[50px] border ${toChange == colour ? "border-black" : ""} bg-[lightgray] h-[50px] rounded-[50%]`}>
                        </button> //style={{backgroundColor: colour}}
                    )
                })}
        </div>
    )
}

export default ColourMatcher