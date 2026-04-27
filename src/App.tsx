import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Footer from './components/Footer'
import pastryImg from './assets/pastry.png'
import bubbleImg from './assets/bubble.png'
import penImg from './assets/pen.png'
import andImg from './assets/and.png'
import windImg from './assets/windstorm.png'
import { FeedOverlay } from './components/FeedOverlay'
import Blog from './pages/Blog'
import BlogEntry from './pages/BlogEntry'

const kFont = { fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 900 } as const

function Homepage() {
  const [hoverText, setHoverText] = useState<string | null>(null)
  const hover = (text: string) => ({ onMouseEnter: () => setHoverText(text), onMouseLeave: () => setHoverText(null) })

  return (
    <div className="grid h-screen w-screen bg-white" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)' }}>
      {/* Blog — position 1 (r1c1) */}
      <div className="relative overflow-hidden bg-black" {...hover('My blog')}>
        <FeedOverlay />
      </div>
      {/* Text Me — position 2 (r1c2) */}
      <a href="sms:+12068608292" className="overflow-hidden" {...hover('Text me here')}>
        <img src={bubbleImg} alt="Text Me" className="w-full h-full object-cover" />
      </a>
      {/* Blackmoor — position 3 (r1c3) */}
      <a href="https://blackmoor-production.up.railway.app" target="_blank" rel="noopener noreferrer" className="overflow-hidden" {...hover('Shadow of the Wolf')}>
        <img src={andImg} alt="Blackmoor" className="w-full h-full object-cover" />
      </a>

      {/* Coming soon — position 4 (r2c1) */}
      <div className="flex items-center justify-center bg-white">
        <span style={{ ...kFont, fontSize: 'clamp(28px, 5vw, 72px)', lineHeight: 1.1 }}>
          coming soon
        </span>
      </div>
      {/* K — position 5 (center) */}
      <div className="relative flex items-center justify-center">
        <span style={{ ...kFont, fontSize: 'clamp(120px, 18vw, 280px)', lineHeight: 1, opacity: hoverText ? 0 : 1, transition: 'opacity 0.3s' }}>
          K
        </span>
        {hoverText && (
          <span className="absolute inset-[5%] flex items-center justify-center text-center" style={{ ...kFont, fontSize: 'clamp(28px, 5vw, 72px)', lineHeight: 1.1, opacity: 1, transition: 'opacity 0.3s', whiteSpace: 'pre-line' }}>
            {hoverText}
          </span>
        )}
      </div>
      {/* JustEdit — position 6 (r2c3) */}
      <a href="/justedit/justedit.html" target="_blank" rel="noopener noreferrer" className="overflow-hidden" {...hover('Write me here')}>
        <img src={penImg} alt="JustEdit" className="w-full h-full object-cover" />
      </a>

      {/* Coming soon — position 7 (r3c1) */}
      <div className="flex items-center justify-center bg-white">
        <span style={{ ...kFont, fontSize: 'clamp(28px, 5vw, 72px)', lineHeight: 1.1 }}>
          coming soon
        </span>
      </div>
      {/* Fast French — position 8 (r3c2) */}
      <a href="/fast-french/" target="_blank" rel="noopener noreferrer" className="overflow-hidden" {...hover('Fast French,\nmy French learning game')}>
        <img src={pastryImg} alt="Fast French" className="w-full h-full object-cover" />
      </a>
      {/* Wind — position 9 (r3c3) */}
      <a href="https://meticulous-eagerness-production-411f.up.railway.app" target="_blank" rel="noopener noreferrer" className="overflow-hidden" {...hover('Windy,\nmy real time wind project')}>
        <img src={windImg} alt="Wind" className="w-full h-full object-cover" />
      </a>
    </div>
  )
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogEntry />} />
      </Routes>
      <Footer />
    </>
  )
}
