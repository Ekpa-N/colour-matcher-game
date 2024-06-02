"use client"
import { GoogleLogin } from '@react-oauth/google';
import { io } from 'socket.io-client';
import { ReactEventHandler, useEffect, useState } from 'react';
import { generateRandomString, copyToClipboard, shuffleArray } from '@/components/helpers';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { v4 as uuidv4 } from "uuid"
import { db } from '@/firebase';
import { Suspense } from 'react'
import { collection, addDoc, getDocs, limit, query, where, doc, updateDoc, setDoc, getDoc, startAt, startAfter, getCountFromServer, serverTimestamp, endBefore } from "firebase/firestore";
import CreateGamePage from '@/components/createGamePage';


export default function HomePage() {





  return (
    <main className="flex min-h-screen flex-col gap-[20px] items-center justify-center p-2">
      <Suspense fallback={<p>Loading feed...</p>}>
        <CreateGamePage />
      </Suspense>
    </main>
  )
}
