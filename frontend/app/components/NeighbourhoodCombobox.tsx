'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { NEIGHBOURHOODS } from '@/lib/constants'

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  id?: string
}

export default function NeighbourhoodCombobox({
  value,
  onChange,
  placeholder = 'Search neighbourhoods',
  id,
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const [highlightIndex, setHighlightIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listboxId = useId()

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) {
      return NEIGHBOURHOODS
    }
    return NEIGHBOURHOODS.filter((name) => name.toLowerCase().includes(needle))
  }, [query])

  useEffect(() => {
    if (!open) {
      setQuery(value)
    }
  }, [open, value])

  useEffect(() => {
    setHighlightIndex(0)
  }, [query])

  useEffect(() => {
    if (!open) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  const selectOption = (option: string) => {
    onChange(option)
    setQuery(option)
    setOpen(false)
    inputRef.current?.blur()
  }

  const handleInputChange = (nextQuery: string) => {
    setQuery(nextQuery)
    setOpen(true)

    const exactMatch = NEIGHBOURHOODS.find(
      (name) => name.toLowerCase() === nextQuery.trim().toLowerCase(),
    )
    if (exactMatch) {
      onChange(exactMatch)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      setHighlightIndex((current) =>
        filtered.length === 0 ? 0 : Math.min(current + 1, filtered.length - 1),
      )
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setOpen(true)
      setHighlightIndex((current) => Math.max(current - 1, 0))
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      if (open && filtered[highlightIndex]) {
        selectOption(filtered[highlightIndex])
      }
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      setQuery(value)
      return
    }
  }

  return (
    <div className="combobox" ref={containerRef}>
      <div className="combobox-control">
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          autoComplete="off"
          value={query}
          placeholder={placeholder}
          onFocus={() => {
            setOpen(true)
            setQuery(value)
          }}
          onChange={(event) => handleInputChange(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          className="combobox-toggle"
          aria-label={open ? 'Close neighbourhood list' : 'Open neighbourhood list'}
          aria-expanded={open}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            if (open) {
              setOpen(false)
              setQuery(value)
              return
            }
            setOpen(true)
            setQuery(value)
            inputRef.current?.focus()
          }}
        >
          ▾
        </button>
      </div>

      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          className="combobox-list"
          aria-label="Neighbourhood options"
        >
          {filtered.length === 0 ? (
            <li className="combobox-empty">No neighbourhoods match your search.</li>
          ) : (
            filtered.map((name, index) => (
              <li key={name}>
                <button
                  type="button"
                  role="option"
                  aria-selected={name === value}
                  className={`combobox-option${index === highlightIndex ? ' is-active' : ''}`}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setHighlightIndex(index)}
                  onClick={() => selectOption(name)}
                >
                  {name}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  )
}
