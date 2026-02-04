import React, { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './App.css'

function App() {
  const [fileTree, setFileTree] = useState([])
  const [currentFileContent, setCurrentFileContent] = useState(null)
  const [currentFilePath, setCurrentFilePath] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedFolders, setExpandedFolders] = useState({})

  useEffect(() => {
    fetch('/manifest.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load manifest')
        return res.json()
      })
      .then(data => {
        setFileTree(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError('Failed to load system directory structure.')
        setLoading(false)
      })
  }, [])

  const fetchFileContent = async (path) => {
    try {
      // Pre pend /content because manifest paths are relative to public content root
      // but in manifest.json generator we made them relative to public.
      // Let's verify manifest structure.
      // If manifest path is "content/Computer-Science/foo.md", then fetch("/content/Computer-Science/foo.md")

      const response = await fetch(`/${path}`)
      if (!response.ok) throw new Error('Failed to fetch file')
      const text = await response.text()
      setCurrentFileContent(text)
      setCurrentFilePath(path)
    } catch (err) {
      console.error(err)
      setCurrentFileContent('# Error\nFailed to load file content.')
    }
  }

  const toggleFolder = (path) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }))
  }

  const renderTree = (items) => {
    return (
      <ul className="pl-4 space-y-1 border-l border-green-900/50 ml-2">
        {items.map((item, index) => {
          if (item.type === 'directory') {
            const isExpanded = expandedFolders[item.path]
            return (
              <li key={item.path + index}>
                <div
                  className="cursor-pointer hover:text-green-300 transition-colors flex items-center gap-2 select-none"
                  onClick={() => toggleFolder(item.path)}
                >
                  <span className="text-green-600">{isExpanded ? '[-]' : '[+]'}</span>
                  <span className="font-bold">{item.name}/</span>
                </div>
                {isExpanded && item.children && renderTree(item.children)}
              </li>
            )
          } else {
            return (
              <li
                key={item.path + index}
                className={`cursor-pointer hover:text-green-300 transition-colors pl-6 ${currentFilePath === item.path ? 'text-green-300 bg-green-900/20' : ''}`}
                onClick={() => fetchFileContent(item.path)}
              >
                {item.name}
              </li>
            )
          }
        })}
      </ul>
    )
  }

  return (
    <div className="min-h-screen bg-black text-green-400 p-4 md:p-8 font-mono selection:bg-green-500 selection:text-black">
      {/* Header */}
      <header className="border-b border-green-900 pb-4 mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tighter uppercase italic">
            System.Archive / <span className="text-white animate-pulse">Brain-Vault</span>
          </h1>
          <p className="text-xs text-green-700 mt-2">Status: Online | Encryption: Active | Mode: Static_Read_Only</p>
        </div>
        <div className="text-right text-[10px] text-green-900 hidden md:block">
          SECURE CONNECTION ESTABLISHED<br />
          VERCEL_DEPLOY_READY
        </div>
      </header>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1 border border-green-900 p-4 bg-zinc-950/50 h-[fit-content] max-h-[80vh] overflow-y-auto custom-scrollbar">
          <h2 className="text-xl mb-4 border-l-4 border-green-500 pl-2 text-white">Directories</h2>
          {loading ? (
            <div className="text-green-700 animate-pulse">Scanning filesystem...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <div className="text-sm">
              {renderTree(fileTree)}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="md:col-span-3 space-y-6">
          <div className="border border-green-500/30 p-6 bg-zinc-900/20 relative min-h-[60vh]">
            <div className="absolute top-0 right-0 p-1 text-[10px] bg-green-900 text-black">
              {currentFilePath ? currentFilePath : 'IDLE'}
            </div>

            {currentFileContent ? (
              <div className="prose prose-invert prose-p:text-green-300/80 prose-headings:text-green-400 prose-a:text-green-200 prose-strong:text-white prose-code:text-green-200 max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {currentFileContent}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50 pt-20">
                <div className="w-16 h-16 border-2 border-green-900 rounded-full border-t-green-500 animate-spin"></div>
                <p>Waiting for data selection...</p>
                <p className="text-xs max-w-md">
                  Select a file from the directory tree to decipher its contents.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App