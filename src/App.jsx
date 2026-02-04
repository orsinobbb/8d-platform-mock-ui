import React from 'react'

const MOCK_ISSUES = [
  {
    id: '8D-2026-001',
    model: 'XX-36I',
    customer: 'JPX One',
    title: '背蓋斷裂刀部報廢',
    status: 'D3 臨時對策中',
  },
  {
    id: '8D-2026-002',
    model: 'T100 4G',
    customer: 'TTL',
    title: '客戶抱怨壓傷比例偏高',
    status: 'D2 問題描述確認中',
  },
]

function App() {
  return (
    <div className="app-root">
      <header className="app-header">
        <h1>8D 問題處理平台 Mock UI</h1>
        <p className="subtitle">
          目前是純前端 Demo：資料存在瀏覽器 localStorage，之後會接正式 .NET 後端與 AI agent。
        </p>
      </header>

      <main className="app-main">
        <section className="panel">
          <h2>8D 問題單列表（示意資料）</h2>
          <p className="panel-desc">這裡先用假資料模擬之後的列表畫面與欄位結構。</p>

          <div className="table-wrapper">
            <table className="issue-table">
              <thead>
                <tr>
                  <th>8D 編號</th>
                  <th>機種 Model</th>
                  <th>客戶</th>
                  <th>問題點</th>
                  <th>狀態</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_ISSUES.map((issue) => (
                  <tr key={issue.id}>
                    <td>{issue.id}</td>
                    <td>{issue.model}</td>
                    <td>{issue.customer}</td>
                    <td>{issue.title}</td>
                    <td>
                      <span className="status-pill">{issue.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel muted">
          <h3>接下來要補上的功能</h3>
          <ol>
            <li>可以新增 / 編輯 / 刪除 8D 問題單（而不是只有假資料）。</li>
            <li>將 8D 問題單儲存在 localStorage 中。</li>
            <li>支援將所有案件匯出成 JSON 檔，以及從 JSON 匯入。</li>
          </ol>
          <p>
            你現在看到的是「前端 UI + GitHub Pages + GitHub Actions」的最小整合版本，之後會逐步把
            8D 流程與 .NET 後端接上。
          </p>
        </section>
      </main>
    </div>
  )
}

export default App
