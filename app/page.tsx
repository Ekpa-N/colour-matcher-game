"use client"
import { Suspense } from 'react'
import CreateGamePage from '@/components/CreateNewGame';
import LoadingScreen from '@/components/Loader';


export default function HomePage() {

  return (
    <main className="flex h-screen borde border-[red] w-screen flex-col gap-[20px] items-center justify-center p-2">
      <Suspense fallback={<LoadingScreen type='screen'/>}>
        <CreateGamePage />
        {/* <LoadingScreen type="button"/> */}
      </Suspense>
    </main>
  )
}
