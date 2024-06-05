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
    const [isActive, setIsActive] = useState<string>("")

    const handleMouseDown = (colour?: string) => {
        setIsActive(colour as string);
    };

    const handleMouseUp = () => {
        setIsActive("");
    };

    return (
        <div className={`border border-blac w-[100%] flex justify-between ${type == "win" ? "rounded-[20px]" : "rounded-[30px]"} p-[3px]`}>
            {pattern.map((colour: string, idx: number) => {

                if (type == "win") {
                    return (
                        <button key={idx} style={{ backgroundColor: colour }} className={`w-[25px] h-[25px] border bg-[#fffff0] text-[#000080]  rounded-[50%]`}>
                        </button> 
                    )
                }
                if (colour == "") {
                    return (
                        <button onClick={() => { switchColour(idx, "play") }} key={idx} className={`w-[40px] border bg-[#fffff0] text-[#000080] h-[40px] rounded-[50%]`}>
                            +
                        </button> //style={{backgroundColor: colour}}
                    )
                }
                if (type == "play") {
                    return (
                        <button onClick={() => { switchColour(idx, "play") }} key={idx} style={{ backgroundColor: colour }} className={`w-[40px] border bg-[lightgray] h-[40px] rounded-[50%]`}>
                        </button> //style={{backgroundColor: colour}}
                    )
                }

                const bg = `bg-[${colour}]`
                const playButton = React.createElement(
                    'button',
                    {
                        onClick: () => { switchColour(idx) },
                        key: idx,
                        className: `w-[40px] border ${toChange == colour ? "border-black" : ""} h-[40px] rounded-[50%]`,
                        style:{backgroundColor: isActive == colour ? "#fffff0":colour},
                        onMouseDown: ()=> {handleMouseDown(colour)},
                        onMouseUp: ()=>{handleMouseUp()},
                        onMouseLeave: ()=>{handleMouseUp()},
                    }
                )
                return (
                    playButton
                    // <button onClick={() => { switchColour(idx) }} key={idx}  className={`w-[50px] border ${toChange == colour ? "border-black" : ""} h-[50px] ${bg}  rounded-[50%]`}>
                    // </button> 
                    //style={{backgroundColor: colour}}
                )
            })}
        </div>
    )
}

export default ColourMatcher