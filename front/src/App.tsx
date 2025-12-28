import { useState, useEffect } from 'react'

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestBody {
  name?: string
  value?: string
}

interface DoRequestOptions {
  method: Method
  path: string
  headers?: Record<string, string>
  body?: RequestBody
}

interface CorsConfig {
  enabled: boolean
  allowOrigin: string
  allowMethods: string
  allowHeaders: string
}

function App() {
  const [backend, setBackend] = useState('http://localhost:8080')
  const [output, setOutput] = useState('結果がここに表示されます')

  // CORS 設定（バックエンドから取得）
  const [corsConfig, setCorsConfig] = useState<CorsConfig>({
    enabled: true,
    allowOrigin: '*',
    allowMethods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    allowHeaders: 'Content-Type, Authorization',
  })
  const [configLoading, setConfigLoading] = useState(false)

  // 各セクションの Content-Type 設定
  const [itemsUseJson, setItemsUseJson] = useState(false)
  const [postUseJson, setPostUseJson] = useState(true)

  // Form states
  const [postName, setPostName] = useState('newItem')
  const [postValue, setPostValue] = useState('test')
  const [putId, setPutId] = useState(1)
  const [putName, setPutName] = useState('updated')
  const [putValue, setPutValue] = useState('newValue')
  const [patchId, setPatchId] = useState(1)
  const [patchValue, setPatchValue] = useState('patched')
  const [deleteId, setDeleteId] = useState(1)

  /** CORS 設定を取得 */
  const fetchCorsConfig = async () => {
    try {
      setConfigLoading(true)
      const res = await fetch(backend + '/api/cors-config')
      const data = await res.json()
      setCorsConfig(data)
    } catch (err) {
      console.error('Failed to fetch CORS config:', err)
    } finally {
      setConfigLoading(false)
    }
  }

  /** CORS 設定を更新 */
  const updateCorsConfig = async (newConfig: Partial<CorsConfig>) => {
    try {
      setConfigLoading(true)
      const res = await fetch(backend + '/api/cors-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      })
      const data = await res.json()
      setCorsConfig(data)
    } catch (err) {
      console.error('Failed to update CORS config:', err)
    } finally {
      setConfigLoading(false)
    }
  }

  // 初回読み込み時に CORS 設定を取得
  useEffect(() => {
    fetchCorsConfig()
  }, [backend])

  /** リクエストを送信する関数 */
  const doRequest = async ({ method, path, headers, body }: DoRequestOptions) => {
    if (!backend.trim()) {
      alert('Set backend URL first')
      return
    }

    setOutput(`${method} ${path} ...\n`)

    const options: RequestInit = {
      method,
      credentials: 'omit',
    }

    if (headers && Object.keys(headers).length > 0) {
      options.headers = headers
    }

    if (body) {
      const contentType = headers?.['Content-Type']
      if (contentType === 'application/json') {
        options.body = JSON.stringify(body)
      } else {
        options.body = new URLSearchParams(body as Record<string, string>).toString()
      }
    }

    try {
      const res = await fetch(backend + path, options)
      const text = await res.text()
      const headerInfo = headers ? `Headers: ${JSON.stringify(headers)}\n` : ''
      setOutput(`${method} ${path}\n${headerInfo}Status: ${res.status}\n\n${text}`)
    } catch (err) {
      setOutput(`${method} ${path}\nError: ${err}`)
    }
  }

  /** Content-Type ヘッダーを生成 */
  const getContentTypeHeader = (useJson: boolean): Record<string, string> => {
    return useJson 
      ? { 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/x-www-form-urlencoded' }
  }

  /** checkbox コンポーネント */
  const JsonCheckbox = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <label className="checkbox-label">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      Content-Type: application/json
    </label>
  )

  return (
    <>
      <h1>CORS Test Front</h1>

      {/* Backend URL を設定するフォーム */}
      <div className="section">
        <h3>Backend URL</h3>
        <input
          type="text"
          value={backend}
          onChange={(e) => setBackend(e.target.value)}
          style={{ width: '70%' }}
        />
      </div>

      {/* CORS 設定パネル */}
      <div className="section cors-config">
        <h3>🔧 バックエンド CORS 設定 (バックエンドの CORS 設定を動的に変更可能)</h3>
        {configLoading && <p>Loading...</p>}
        
        <div className="config-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={corsConfig.enabled}
              onChange={(e) => setCorsConfig({ ...corsConfig, enabled: e.target.checked })}
            />
            CORS 有効
          </label>
        </div>

        <div className="config-row">
          <label>Access-Control-Allow-Origin:</label>
          <input
            type="text"
            value={corsConfig.allowOrigin}
            onChange={(e) => setCorsConfig({ ...corsConfig, allowOrigin: e.target.value })}
            style={{ width: '300px' }}
          />
        </div>

        <div className="config-row">
          <label>Access-Control-Allow-Methods:</label>
          <input
            type="text"
            value={corsConfig.allowMethods}
            onChange={(e) => setCorsConfig({ ...corsConfig, allowMethods: e.target.value })}
            style={{ width: '300px' }}
          />
        </div>

        <div className="config-row">
          <label>Access-Control-Allow-Headers:</label>
          <input
            type="text"
            value={corsConfig.allowHeaders}
            onChange={(e) => setCorsConfig({ ...corsConfig, allowHeaders: e.target.value })}
            style={{ width: '300px' }}
          />
        </div>

        <div className="config-buttons">
          <button onClick={() => updateCorsConfig(corsConfig)}>
            設定を保存
          </button>
          <button onClick={fetchCorsConfig} className="secondary">
            リセット
          </button>
        </div>
      </div>

      {/* Response を表示する */}
      <div className="section">
        <h3>Response</h3>
        <pre>{output}</pre>
      </div>

      {/* GET /api/items */}
      <div className="section">
        <h3><span className="method get">GET</span> /api/items</h3>
        <JsonCheckbox checked={itemsUseJson} onChange={setItemsUseJson} />
        <p>{itemsUseJson ? '→ Preflight 発生 (Content-Type: application/json)' : '→ Simple Request (ヘッダーなし)'}</p>
        <button onClick={() => doRequest({
          method: 'GET',
          path: '/api/items',
          headers: itemsUseJson ? { 'Content-Type': 'application/json' } : undefined
        })}>
          Get All Items
        </button>
      </div>

      {/* POST /api/items */}
      <div className="section">
        <h3><span className="method post">POST</span> /api/items</h3>
        <JsonCheckbox checked={postUseJson} onChange={setPostUseJson} />
        <p>{postUseJson ? '→ Preflight 発生 (Content-Type: application/json)' : '→ Simple Request (Content-Type: application/x-www-form-urlencoded)'}</p>
        <div className="input-group">
          <input
            type="text"
            placeholder="name"
            value={postName}
            onChange={(e) => setPostName(e.target.value)}
          />
          <input
            type="text"
            placeholder="value"
            value={postValue}
            onChange={(e) => setPostValue(e.target.value)}
          />
          <button onClick={() => doRequest({
            method: 'POST',
            path: '/api/items',
            headers: getContentTypeHeader(postUseJson),
            body: { name: postName, value: postValue }
          })}>
            Create Item
          </button>
        </div>
      </div>

      {/* PUT /api/items/:id */}
      <div className="section">
        <h3><span className="method put">PUT</span> /api/items/:id</h3>
        <p>→ Preflight 発生 (PUT メソッド自体がプリフライト必須)</p>
        <div className="input-group">
          <input
            type="number"
            value={putId}
            onChange={(e) => setPutId(Number(e.target.value))}
          />
          <input
            type="text"
            placeholder="name"
            value={putName}
            onChange={(e) => setPutName(e.target.value)}
          />
          <input
            type="text"
            placeholder="value"
            value={putValue}
            onChange={(e) => setPutValue(e.target.value)}
          />
          <button onClick={() => doRequest({
            method: 'PUT',
            path: `/api/items/${putId}`,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: { name: putName, value: putValue }
          })}>
            Update Item
          </button>
        </div>
      </div>

      {/* PATCH /api/items/:id */}
      <div className="section">
        <h3><span className="method patch">PATCH</span> /api/items/:id</h3>
        <p>→ Preflight 発生 (PATCH メソッド自体がプリフライト必須)</p>
        <div className="input-group">
          <input
            type="number"
            value={patchId}
            onChange={(e) => setPatchId(Number(e.target.value))}
          />
          <input
            type="text"
            placeholder="value"
            value={patchValue}
            onChange={(e) => setPatchValue(e.target.value)}
          />
          <button onClick={() => doRequest({
            method: 'PATCH',
            path: `/api/items/${patchId}`,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: { value: patchValue }
          })}>
            Patch Item
          </button>
        </div>
      </div>

      {/* DELETE /api/items/:id */}
      <div className="section">
        <h3><span className="method delete">DELETE</span> /api/items/:id</h3>
        <p>→ Preflight 発生 (DELETE メソッド自体がプリフライト必須)</p>
        <div className="input-group">
          <input
            type="number"
            value={deleteId}
            onChange={(e) => setDeleteId(Number(e.target.value))}
          />
          <button onClick={() => doRequest({
            method: 'DELETE',
            path: `/api/items/${deleteId}`
          })}>
            Delete Item
          </button>
        </div>
      </div>
    </>
  )
}

export default App
