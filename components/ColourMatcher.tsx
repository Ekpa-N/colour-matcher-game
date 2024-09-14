"use client"
import React, { useEffect, useState } from "react";
import AppContext from "./Provider";


type ColourProps = {
    pattern?: any;
    toChange: string;
    switchColour: (idx: number, type?: string) => void;
    type: string,
    pickColor: (idx: number, color: string) => void;
    // palette: string[]

}

const ColourMatcher: React.FC<ColourProps> = ({ pattern = [], toChange, switchColour, type, pickColor }) => {
    const [isActive, setIsActive] = useState<string>("")
    const [colors, setColors] = useState<string[]>(["", "", "", "", ""])
    const [palette, setPalette] = useState<string[]>(["#20958E", "#AFD802", "#DF93D2", "#F7E270", "#B3EBF2"])

    useEffect(() => {
        setColors(["", "", "", "", ""])
    }, [pattern])

    // function chooseColor(idx: number, color: string) {
    //     pickColor(idx, color)
    //     if (color == "" || color == palette[palette.length-1]) {
    //         setColors((currentState: any) => {
    //             currentState[idx] = palette[0]
    //             return currentState
    //         })
    //         return
    //     }
    //     setColors((currentState: any) => {
    //       currentState[idx] = palette[palette.indexOf(color) + 1]
    //       return currentState
    //     })

    //     return
    // }
    function chooseColor(idx: number, color: string) {
        pickColor(idx, color)

        let newColor = ""
        if (color === "" || color === palette[palette.length - 1]) {
            newColor = palette[0]
        } else {
            newColor = palette[palette.indexOf(color) + 1]
        }

        // Use a copy of the current state to ensure immutability
        setColors(prevColors => {
            const updatedColors = [...prevColors]
            updatedColors[idx] = newColor
            return updatedColors
        })
    }


    const handleMouseDown = (colour?: string) => {
        setIsActive(colour as string);
    };

    const handleMouseUp = () => {
        setIsActive("");
    };

    return (
        <div className={`border-blac w-[100%] flex justify-between ${type == "win" ? "rounded-[20px] border" : "rounded-[30px]"} p-[2px]`}>
            {pattern.map((colour: string, idx: number) => {

                if (type == "win") {
                    return (
                        <button key={idx} style={{ backgroundColor: colour }} className={`w-[19px] h-[19px] border bg-[#fffff0] text-[#000080]  rounded-[50%]`}>
                        </button>
                    )
                }
                if (type == "play") {
                    return (
                        <button onClick={() => { chooseColor(idx, colors[idx]) }} key={idx} style={{ backgroundColor: colors[idx] }} className={`w-[40px] border bg-[lightgray] text-[gray] h-[40px] flex items-center justify-center rounded-[50%]`}>
                                {colors[idx] ? "" : idx+1}
                        </button> //style={{backgroundColor: colour}}
                    )
                }
            })}
        </div>
    )
}

export default ColourMatcher