"use client"
import Image from "next/image";
import ColourMatcher from "@/components/ColourMatcher";
import AppContext from "@/components/Provider";

export default function One() {
  return (
    <AppContext.Consumer>
      {({ defaultPattern, defaultPatterns, playerPatterns, makeSwitch, makeSwitchToo, playerOneSwitch, playerTwoSwitch, resetDefault, playerOnePattern, playerTwoPattern, playerOnePatternError}) => {
        return (
          <main className="flex min-h-screen flex-col w-[100%] items-center justify-center gap-[50px] p-4">
            <button onClick={()=>{resetDefault()}} className="border p-2 rounded">Reset Default</button>
            <ColourMatcher makeSwitchToo={makeSwitchToo} makeSwitch={makeSwitch} defaultColours={defaultPattern} player={1} playerColours={playerOnePattern} toSwitch={playerOneSwitch} type="one" patternError={playerOnePatternError}/>
          </main>
        )
      }}
    </AppContext.Consumer>
  )
}
