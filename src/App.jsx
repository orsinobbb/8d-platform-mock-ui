import React from 'react'

function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        <h1>8D 問題處理平台 Mock UI</h1>
        <p className="subtitle">
          目前是純前端 Demo：資料存在瀏覽器 localStorage，之後會接正式 .NET 後端。
        </p>
      </header>

      <main className="app-main">
        <section className="panel">
          <h2>接下來要做的</h2>
          <ol>
            <li>建立「8D 問題單列表」畫面</li>
            <li>建立「8D 問題單編輯」畫面（分 D1~D8 區塊）</li>
            <li>把資料存在 localStorage，並支援 JSON 匯出 / 匯入</li>
          </ol>
        </section>

        <section className="panel muted">
          <h3>現在可以先做的事</h3>
          <p>
            你可以先在本機跑 <code>npm install</code>、<code>npm run dev</code>，確認專案能啟動；
            之後我會把 8D 流程的實際 UI 填進來。
          </p>
        </section>
      </main>
    </div>
  )
}

export default App
