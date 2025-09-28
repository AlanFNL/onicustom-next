'use client'

import { Suspense } from 'react'
import App from './components/ui/App'

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <App />
    </Suspense>
  )
}
