import { memo, useEffect, useState } from 'react'
import ChatPanel from './components/ChatPanel.jsx'
import MainBar from './components/MainBar.jsx'
import Overlays from './components/Overlays.jsx'
import { loadPlatformModules } from './lib/loadPlatformModules.js'

/*
 * The shell is rendered once by React and never re-rendered. The platform
 * modules (public/legacy) render page content into these stable containers
 * by id, so React must not reconcile over their DOM.
 */
const Shell = memo(function Shell() {
  return (
    <>
      <div className="wrap">
        <div className="frame">
          <ChatPanel />
          <main className="main">
            <MainBar />
            <div className="minner" id="app" />
          </main>
        </div>
      </div>
      <Overlays />
    </>
  )
})

export default function App() {
  const [error, setError] = useState(null)

  useEffect(() => {
    loadPlatformModules()
      .then(() => {
        const M = window.M
        // Suggestion chips: a screen can still claim a chip for its own UI; anything else goes to Milton.
        M.acts.ask = (q) => {
          const pg = M.pages[M.route.page]
          if (pg?.ask?.(q)) return
          document.getElementById('chat')?.classList.add('up')
          window.dispatchEvent(new CustomEvent('milton:ask', { detail: q }))
        }
      })
      .catch(setError)
  }, [])

  return (
    <>
      <Shell />
      {error && (
        <p role="alert" className="load-error">
          {'Milton could not start: '}
          {error.message}
        </p>
      )}
    </>
  )
}
