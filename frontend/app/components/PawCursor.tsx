'use client'

import { useEffect, useRef } from 'react'

export default function PawCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Inject a <style> tag that beats every UA stylesheet
    const style = document.createElement('style')
    style.id = 'paw-cursor-hide'
    style.textContent = `*, *::before, *::after { cursor: none !important; }`
    document.head.appendChild(style)
    // Also set directly on the root element as belt-and-braces
    document.documentElement.style.setProperty('cursor', 'none', 'important')

    const el = cursorRef.current
    if (!el) return

    const move = (e: MouseEvent) => {
      el.style.transform = `translate(${e.clientX - 12}px, ${e.clientY - 12}px)`
    }
    const hide = () => { el.style.opacity = '0' }
    const show = () => { el.style.opacity = '1' }

    window.addEventListener('mousemove', move)
    document.addEventListener('mouseleave', hide)
    document.addEventListener('mouseenter', show)

    return () => {
      document.getElementById('paw-cursor-hide')?.remove()
      document.documentElement.style.removeProperty('cursor')
      window.removeEventListener('mousemove', move)
      document.removeEventListener('mouseleave', hide)
      document.removeEventListener('mouseenter', show)
    }
  }, [])

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 28,
        height: 28,
        pointerEvents: 'none',
        zIndex: 99999,
        transition: 'opacity 0.2s',
        willChange: 'transform',
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32">
        <ellipse cx="16" cy="23" rx="7.5" ry="6.5" fill="#E8651A" stroke="#1A1108" strokeWidth="2.2"/>
        <ellipse cx="8.5" cy="15.5" rx="3.8" ry="3.2" fill="#E8651A" stroke="#1A1108" strokeWidth="1.8"/>
        <ellipse cx="16" cy="12.5" rx="3.8" ry="3.2" fill="#E8651A" stroke="#1A1108" strokeWidth="1.8"/>
        <ellipse cx="23.5" cy="15.5" rx="3.8" ry="3.2" fill="#E8651A" stroke="#1A1108" strokeWidth="1.8"/>
        <ellipse cx="13" cy="21" rx="2.2" ry="1.6" fill="#F9A85D" opacity="0.6"/>
      </svg>
    </div>
  )
}
