"use client"
import Image from "next/image";
import ColourMatcher from "@/components/ColourMatcher";
import AppContext from "@/components/Provider";
import { useEffect, useState } from "react";

export default function Home() {
  const [timer, setTimer] = useState<{ ms: number, s: number, m: number }>({ ms: 0, s: 0, m: 1 })
  const [countdown, setIsCountdown] = useState<boolean>(false)


  // clearInterval(countdown)

  useEffect(() => {
    let counter: NodeJS.Timeout;
    if (countdown) {
      counter = setInterval(() => {
        setTimer((prevTimer) => {
          let { ms, s, m } = prevTimer;
          if (ms > 0) {
            ms -= 1;
          } else if (s > 0) {
            s -= 1;
            ms = 99; // Reset ms to 99 (assuming 100 ms per second)
          } else if (m > 0) {
            m -= 1;
            s = 59; // Reset s to 59
            ms = 99; // Reset ms to 99
          } else {
            clearInterval(counter); // Stop the countdown when it reaches 0
            setIsCountdown(false);
          }
          return { ms, s, m };
        });
      }, 10); // Update interval for milliseconds
    }
    return () => clearInterval(counter); // Clear interval on component unmount
  }, [countdown]);

  function startCountdown() {
    setIsCountdown(true)
  }


  return (
    <AppContext.Consumer>
      {({ defaultPatternError, defaultPattern, defaultPatterns, playerPatterns, makeSwitch, makeSwitchToo, playerOneSwitch, playerTwoSwitch, resetDefault, playerOnePattern, playerTwoPattern, playerOnePatternError, playerTwoPatternError }) => {

        return (
          <main className="flex min-h-screen flex-col gap-[20px] items-center justify-center p-2">
            <button onClick={() => { resetDefault() }} className="border p-2 rounded">Reset Default</button>
            <div className="flex flex-col w-[100%] md:flex-row md:justify-around gap-[20px]">
              <ColourMatcher makeSwitchToo={makeSwitchToo} makeSwitch={makeSwitch} defaultColours={defaultPatternError} player={1} playerColours={playerOnePatternError} toSwitch={playerOneSwitch} />
              <ColourMatcher makeSwitchToo={makeSwitchToo} makeSwitch={makeSwitch} defaultColours={defaultPatternError} player={2} playerColours={playerTwoPatternError} toSwitch={playerTwoSwitch} />
            </div>
            <div>{timer.m}:{timer.s}</div>
            <button onClick={() => { startCountdown() }} className="border p-2 rounded">Start Timer</button>
          </main>
        )
      }}
    </AppContext.Consumer>
  )
}
