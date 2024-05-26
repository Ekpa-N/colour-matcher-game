"use client"
import Image from "next/image";
import ColourMatcher from "@/components/ColourMatcher";
import AppContext from "@/components/Provider";
import { ReactEventHandler, ReactHTMLElement } from "react";
import { useState } from "react";
import { db } from '../../firebase/index'
import { collection, addDoc, getDocs, limit, query, where, doc, updateDoc, setDoc, getDoc, startAt, startAfter, getCountFromServer, serverTimestamp, endBefore, onSnapshot } from "firebase/firestore";

export default function Registration() {
    const [formData, setFormData] = useState<{ name: string, center: string, phone: string }>({ name: "", center: "", phone: "" })
    const [isLoading, setIsLoading] = useState<boolean>(false)

    async function handleSubmit(e: any) {
        e.preventDefault()
        setIsLoading(true)
        await setDoc(doc(db, "registration", formData.phone), {
            name: formData.name,
            center: formData.center,
            phone: formData.phone
        });
        
        setFormData({ name: "", center: "", phone: "" })
        setIsLoading(false)
    }

    function handleChange(e:any) {
        setFormData({...formData, [e.target.name]:e.target.value})
    }
    return (
        <AppContext.Consumer>
            {({ defaultPattern, defaultPatterns, playerPatterns, makeSwitch, makeSwitchToo, playerOneSwitch, playerTwoSwitch, resetDefault, playerOnePattern, playerTwoPattern, playerOnePatternError }) => {
                return (
                    <main className="flex min-h-screen w-[100%] items-start justify-center gap-[20px] p-4">
                        <form className="flex w-[400px] borde p-2 flex-col gap-[30px]">
                            <label htmlFor="name">NAME</label>
                            <input onChange={(e)=>{handleChange(e)}} value={formData.name} name="name" className="outline-none border w-full" />
                            <label htmlFor="center">CENTER</label>
                            <input onChange={(e)=>{handleChange(e)}} value={formData.center} name="center" className="outline-none border w-full" />
                            <label htmlFor="phone">PHONE</label>
                            <input onChange={(e)=>{handleChange(e)}} value={formData.phone} name="phone" className="outline-none border w-full" />
                            <button disabled={isLoading} className="border p-4 w-fit self-center rounded" onClick={(e)=>{handleSubmit(e)}}>{isLoading ? "Uploading" : "Submit"}</button>
                        </form>
                    </main>
                )
            }}
        </AppContext.Consumer>
    )
}
