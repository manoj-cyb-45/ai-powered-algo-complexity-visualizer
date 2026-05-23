import { useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { ALGORITHM_TEMPLATES } from '../../utils/customAlgoEngine'

const TEMPLATE_KEYS = Object.keys(ALGORITHM_TEMPLATES)

/**
 * CustomAlgorithmEditor
 * Props:
 *   code          string
 *   onChange      fn(newCode)
 *   activeTemplate string key
 *   onTemplateChange fn(key)
 *   disabled      bool
 *   error         string | null
 */
export default function CustomAlgorithmEditor({
  code,
  onChange,
  activeTemplate,
  onTemplateChange,
  disabled,
  error,
}) {
  const editorRef = useRef(null)

  const handleEditorMount = (editor) => {
    editorRef.current = editor
    // Remove distracting minimap and scrollbars
    editor.updateOptions({
      minimap:     { enabled: false },
      scrollbar:   { vertical: 'hidden', horizontal: 'hidden' },
      lineNumbers: 'on',
      fontSize:    13,
      fontFamily:  "'Fira Code', 'Cascadia Code', monospace",
      fontLigatures: true,
      padding:     { top: 12, bottom: 12 },
      wordWrap:    'on',
    })
  }

  // When template changes, inject the new code
  const handleTemplateSelect = (key) => {
    onTemplateChange(key)
    onChange(ALGORITHM_TEMPLATES[key].code)
  }

  return (
    <div className="space-y-3">
      {/* Template selector */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-gray-400 text-xs uppercase tracking-wider">Template</p>
          <span className="text-gray-600 text-xs">or write your own ↓</span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {TEMPLATE_KEYS.map(key => {
            const t = ALGORITHM_TEMPLATES[key]
            return (
              <button
                key={key}
                onClick={() => handleTemplateSelect(key)}
                disabled={disabled}
                className={`px-3 py-1.5 rounded-lg border text-xs transition-all disabled:opacity-50 ${
                  activeTemplate === key
                    ? 'border-cyber-500/40 bg-cyber-500/10 text-cyber-400 font-bold'
                    : 'glass border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Monaco Editor */}
      <div
        className={`rounded-xl overflow-hidden border transition-all ${
          error
            ? 'border-red-500/40'
            : 'border-white/10 focus-within:border-cyber-500/30'
        }`}
        style={{ height: '300px' }}
      >
        <Editor
          height="300px"
          defaultLanguage="javascript"
          value={code}
          onChange={v => onChange(v ?? '')}
          theme="vs-dark"
          onMount={handleEditorMount}
          options={{
            readOnly:    disabled,
            contextmenu: false,
          }}
        />
      </div>

      {/* Error display */}
      {error && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/25">
          <span className="text-red-400 text-xs mt-0.5 shrink-0">⚠</span>
          <p className="text-red-300 text-xs font-code leading-relaxed">{error}</p>
        </div>
      )}

      {/* API quick-reference */}
      <div className="glass rounded-xl border border-white/5 p-3">
        <p className="text-gray-500 text-xs uppercase tracking-wider mb-2">Helper API</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {[
            ['compare(i, j)',         'yellow', 'highlight comparison'],
            ['swap(i, j)',            'orange', 'swap + animate'],
            ['mark(i, type?)',        'pink',   'mark active/pivot/found'],
            ['markSorted(...i)',      'green',  'permanently done'],
            ['setPointer(name, i)',   'blue',   'show pointer label'],
            ['setValue(i, val)',      'teal',   'overwrite value'],
          ].map(([sig, col, desc]) => (
            <div key={sig} className="flex gap-2 items-baseline">
              <code className={`text-${col}-400 text-xs font-code shrink-0`}>{sig}</code>
              <span className="text-gray-600 text-xs truncate">{desc}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t border-white/5">
          <p className="text-gray-600 text-xs">
            Read <code className="text-gray-400">arr[i]</code> freely.
            {' '}Use <code className="text-gray-400">setValue(i, v)</code> to mutate (records a step).
          </p>
        </div>
      </div>
    </div>
  )
}
