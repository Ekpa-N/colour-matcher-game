import { motion } from "framer-motion";
import Image from "next/image";

type LoaderProps = {
   type: string
} 

export default function LoadingScreen({type}: LoaderProps) {
    const dim = type == "screen" ? "w-[100px] h-[100px]" : "w-[20px] h-[20px]"
    return (
        <motion.div
            className={`${dim} flex borde border-blac justify-center items-center relative`}
            animate={{
                scale: [1, 2],
                // rotate: [0, 0, 180, 180, 0],
                // borderRadius: ["0%", "0%", "50%", "50%", "0%"],
            }}
            transition={{
                duration: 1,
                ease: "linear",
                // times: [0, 0, 0, 0],
                repeat: Infinity,
                repeatDelay: 0,
            }}
        >
            
            <div className="w-[80%] h-[80%] rounded-[50%] z-[2] bg-[#F7E270] absolute">
            </div>
            <div className="w-[60%] h-[60%] rounded-[50%] z-[4] bg-[#DF93D2] absolute">
            </div>
            <div className="w-[40%] rounded-[50%] h-[40%] z-[6] bg-[#AFD802] absolute">
            </div>
            <div className="w-[20%] rounded-[50%] h-[20%] z-[8] bg-[#20958E] absolute">
            </div>
        </motion.div>
    )
}