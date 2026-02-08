import React, { useState, useEffect } from 'react'

const STORAGE_KEY = 'd2_issues_v2'

const initialForm = {
  customer_name: '',
  model_name: '',
  product_code: '',
  model_code: '',
  spec_no8_flag: false,
  spec_no9_flag: false,
  spec_ns_flag: false,
  issue_title: '',
  component_name: '',
  part_face_flag: false,
  part_sole_flag: false,
  part_crown_flag: false,
  part_toe_flag: false,
  part_heel_flag: false,
  process_code: '',
  issue_5w2h: '',
  total_qty: '',
  ng_qty: '',
  scrap_qty: '',
}

const ROUTES = [
  { code: '', name: '請選擇' },
  { code: 'C80', name: 'C80 粗加工' },
  { code: 'D10', name: 'D10 熔煉' },
  { code: 'D20', name: 'D20 鑄造' },
  { code: 'D30', name: 'D30 熱處理' },
  { code: 'D40', name: 'D40 粗加工' },
  { code: 'D60', name: 'D60 精加工' },
  { code: 'D70', name: 'D70 外觀研磨' },
  { code: 'D80', name: 'D80 組裝' },
  { code: 'D90', name: 'D90 包裝檢驗' },
]

function calcRate(numerator, denominator) {
  const n = Number(numerator)
  const d = Number(denominator)
  if (!d || isNaN(n) || isNaN(d)) return ''
  const v = (n / d) * 100
  if (!isFinite(v)) return ''
  return v.toFixed(1)
}

export default function D2IssueForm() {
  const [form, setForm] = useState(initialForm)
  const [list, setList] = useState([])
  const [activeIssueId, setActiveIssueId] = useState(null)
  const [d3Form, setD3Form] = useState({
    d3_containment_action_code: '',
    d3_containment_desc: '',
    d3_containment_scope: '',
    d3_containment_owner_emp_id: '',
    d3_containment_effective_flag: false,
  })
  const [d4List, setD4List] = useState([])
  const [d4Draft, setD4Draft] = useState({
    root_cause_category: '',
    root_cause_code: '',
    root_cause_desc: '',
    is_primary: false,
    status: 'hypothesis',
    escape_point_process_code: '',
    escape_reason_code: '',
    escape_reason_desc: '',
  })

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) setList(parsed)
    } catch {
      // ignore parse error
    }
  }, [])

  const handleChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleD3Change = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setD3Form((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const now = new Date()
    const id = `D2-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate(),
    ).padStart(2, '0')}-${String(list.length + 1).padStart(3, '0')}`

    const total = Number(form.total_qty) || 0
    const ng = Number(form.ng_qty) || 0
    const scrap = Number(form.scrap_qty) || 0

    const record = {
      id,
      ...form,
      total_qty: total,
      ng_qty: ng,
      scrap_qty: scrap,
      ng_rate_pct: calcRate(ng, total),
      scrap_rate_pct: calcRate(scrap, total),
      created_at: now.toISOString(),
      d3_current: null,
      d3_history: [],
    }

    const next = [record, ...list]
    setList(next)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setForm(initialForm)
  }

  const ngRate = calcRate(form.ng_qty, form.total_qty)
  const scrapRate = calcRate(form.scrap_qty, form.total_qty)

  const openD3 = (issueId) => {
    setActiveIssueId(issueId)
    const target = list.find((x) => x.id === issueId)
    if (target && target.d3_current) {
      setD3Form(target.d3_current)
    } else {
      setD3Form({
        d3_containment_action_code: '',
        d3_containment_desc: '',
        d3_containment_scope: '',
        d3_containment_owner_emp_id: '',
        d3_containment_effective_flag: false,
      })
    }
    if (target && Array.isArray(target.d4_root_causes)) {
      setD4List(target.d4_root_causes)
    } else {
      setD4List([])
    }
  }

  const saveD3 = () => {
    if (!activeIssueId) return
    const now = new Date()
    setList((prev) => {
      const next = prev.map((item) => {
        if (item.id !== activeIssueId) return item
        const historyEntry = item.d3_current
          ? { ...item.d3_current, version_saved_at: now.toISOString() }
          : null
        const d3_history = historyEntry
          ? [historyEntry, ...(item.d3_history || [])]
          : item.d3_history || []
        return {
          ...item,
          d3_current: { ...d3Form },
          d3_history,
        }
      })
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const handleD4DraftChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setD4Draft((prev) => ({ ...prev, [field]: value }))
  }

  const addD4Cause = () => {
    if (!activeIssueId) return
    const trimmedDesc = (d4Draft.root_cause_desc || '').trim()
    if (!trimmedDesc) return
    const entry = {
      ...d4Draft,
      id: `${activeIssueId}-RC-${Date.now()}`,
      created_at: new Date().toISOString(),
    }
    const nextD4List = [entry, ...d4List]
    setD4List(nextD4List)
    setD4Draft({
      root_cause_category: '',
      root_cause_code: '',
      root_cause_desc: '',
      is_primary: false,
      status: 'hypothesis',
      escape_point_process_code: '',
      escape_reason_code: '',
      escape_reason_desc: '',
    })
    // 同步寫回 active issue 的 d4_root_causes
    setList((prev) => {
      const next = prev.map((item) =>
        item.id === activeIssueId ? { ...item, d4_root_causes: nextD4List } : item,
      )
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const removeD4Cause = (id) => {
    const nextD4List = d4List.filter((x) => x.id !== id)
    setD4List(nextD4List)
    if (activeIssueId) {
      setList((prev) => {
        const next = prev.map((item) =>
          item.id === activeIssueId ? { ...item, d4_root_causes: nextD4List } : item,
        )
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        return next
      })
    }
  }

  return (
    <div className="panel">
      <h2>D2 問題回報表單（最小可用版）</h2>
      <p className="panel-desc">
        這個頁面會對齊 D2 欄位 spec，先提供一個可以填寫、計算不良率並存到 localStorage 的最小版本。
      </p>

      <form className="d2-form" onSubmit={handleSubmit}>
        <div className="d2-row">
          <div className="field">
            <label>客戶</label>
            <input
              type="text"
              value={form.customer_name}
              onChange={handleChange('customer_name')}
              placeholder="例如：JPX One"
            />
          </div>
          <div className="field">
            <label>Model</label>
            <input
              type="text"
              value={form.model_name}
              onChange={handleChange('model_name')}
              placeholder="例如：IR-S2"
            />
          </div>
        </div>

        <div className="d2-row">
          <div className="field">
            <label>品代</label>
            <input
              type="text"
              value={form.product_code}
              onChange={handleChange('product_code')}
              placeholder="內部品代"
            />
          </div>
          <div className="field">
            <label>型號</label>
            <input
              type="text"
              value={form.model_code}
              onChange={handleChange('model_code')}
              placeholder="例如：XX-36I"
            />
          </div>
          <div className="field field-inline-checkboxes">
            <label>規格</label>
            <div className="checkbox-row">
              <label>
                <input
                  type="checkbox"
                  checked={form.spec_no8_flag}
                  onChange={handleChange('spec_no8_flag')}
                />
                #8
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={form.spec_no9_flag}
                  onChange={handleChange('spec_no9_flag')}
                />
                #9
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={form.spec_ns_flag}
                  onChange={handleChange('spec_ns_flag')}
                />
                #S
              </label>
            </div>
          </div>
        </div>

        <div className="d2-row">
          <div className="field">
            <label>問題點</label>
            <input
              type="text"
              value={form.issue_title}
              onChange={handleChange('issue_title')}
              placeholder="例如：夾鐵 / 氣孔 / 尺寸異常"
            />
          </div>
          <div className="field">
            <label>部件</label>
            <input
              type="text"
              value={form.component_name}
              onChange={handleChange('component_name')}
              placeholder="例如：背蓋 / 桿身"
            />
          </div>
        </div>

        <div className="d2-row">
          <div className="field">
            <label>部位</label>
            <div className="checkbox-row">
              <label>
                <input
                  type="checkbox"
                  checked={form.part_face_flag}
                  onChange={handleChange('part_face_flag')}
                />
                Face
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={form.part_sole_flag}
                  onChange={handleChange('part_sole_flag')}
                />
                Sole
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={form.part_crown_flag}
                  onChange={handleChange('part_crown_flag')}
                />
                Crown
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={form.part_toe_flag}
                  onChange={handleChange('part_toe_flag')}
                />
                Toe
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={form.part_heel_flag}
                  onChange={handleChange('part_heel_flag')}
                />
                Heel
              </label>
            </div>
          </div>
        </div>

        <div className="d2-row">
          <div className="field">
            <label>途程</label>
            <select value={form.process_code} onChange={handleChange('process_code')}>
              {ROUTES.map((r) => (
                <option key={r.code || 'empty'} value={r.code}>
                  {r.name}
                  {r.code && ` (${r.code})`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="d2-row">
          <div className="field full">
            <label>問題描述（5W2H）</label>
            <textarea
              rows={3}
              value={form.issue_5w2h}
              onChange={handleChange('issue_5w2h')}
              placeholder="Who / What / When / Where / Why / How / How much 簡要描述"
            />
          </div>
        </div>

        <div className="d2-row">
          <div className="field">
            <label>總數量</label>
            <input
              type="number"
              min="0"
              value={form.total_qty}
              onChange={handleChange('total_qty')}
            />
          </div>
          <div className="field">
            <label>不良數量</label>
            <input
              type="number"
              min="0"
              value={form.ng_qty}
              onChange={handleChange('ng_qty')}
            />
          </div>
          <div className="field">
            <label>報廢數量</label>
            <input
              type="number"
              min="0"
              value={form.scrap_qty}
              onChange={handleChange('scrap_qty')}
            />
          </div>
          <div className="field rates">
            <label>不良率 / 報廢率</label>
            <div className="rate-text">
              {ngRate !== '' || scrapRate !== '' ? (
                <span>
                  不良率：{ngRate || '--'}% ｜ 報廢率：{scrapRate || '--'}%
                </span>
              ) : (
                <span className="placeholder">請先填總數量 / 不良 / 報廢數量</span>
              )}
            </div>
          </div>
        </div>

        <div className="d2-actions">
          <button type="submit" className="btn primary">
            儲存 D2 問題單（寫入 localStorage）
          </button>
        </div>
      </form>

      <section className="d2-list">
        <h3>本機 D2 問題單列表</h3>
        {list.length === 0 ? (
          <p className="panel-desc">目前尚未建立任何 D2 問題單，請先在上方表單新增。</p>
        ) : (
          <div className="table-wrapper">
            <table className="issue-table">
              <thead>
                <tr>
                  <th>D2 編號</th>
                  <th>客戶</th>
                  <th>Model</th>
                  <th>品代 / 型號</th>
                  <th>途程</th>
                  <th>問題點</th>
                  <th>總數量</th>
                  <th>不良數</th>
                  <th>報廢數</th>
                  <th>不良率%</th>
                  <th>報廢率%</th>
                  <th>D3 臨時對策</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.customer_name}</td>
                    <td>{item.model_name}</td>
                    <td>
                      {item.product_code}
                      {item.model_code ? ` / ${item.model_code}` : ''}
                    </td>
                    <td>{item.process_code}</td>
                    <td>{item.issue_title}</td>
                    <td>{item.total_qty}</td>
                    <td>{item.ng_qty}</td>
                    <td>{item.scrap_qty}</td>
                    <td>{item.ng_rate_pct}</td>
                    <td>{item.scrap_rate_pct}</td>
                    <td>
                      <button
                        type="button"
                        className="btn secondary small"
                        onClick={() => openD3(item.id)}
                      >
                        {item.d3_current ? '編輯 D3' : '設定 D3'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {activeIssueId && (
        <section className="panel muted d3-panel">
          <h3>D3 臨時對策 - {activeIssueId}</h3>
          <div className="d3-form">
            <div className="d2-row">
              <div className="field">
                <label>臨時對策（代碼）</label>
                <select
                  value={d3Form.d3_containment_action_code}
                  onChange={handleD3Change('d3_containment_action_code')}
                >
                  <option value="">請選擇</option>
                  <option value="STOP_LINE">停線 / 停工</option>
                  <option value="100P_INSPECTION">100% 檢查</option>
                  <option value="SORTING">良品 / 不良品分選</option>
                  <option value="REWORK">重工</option>
                  <option value="CHANGE_PROCESS_PARAM">調整製程參數</option>
                  <option value="CHANGE_SUPPLIER">暫時更換供應來源</option>
                </select>
              </div>
              <div className="field">
                <label>負責人員工編號</label>
                <input
                  type="text"
                  value={d3Form.d3_containment_owner_emp_id}
                  onChange={handleD3Change('d3_containment_owner_emp_id')}
                  placeholder="例如：F0005343"
                />
              </div>
            </div>

            <div className="d2-row">
              <div className="field full">
                <label>適用範圍</label>
                <input
                  type="text"
                  value={d3Form.d3_containment_scope}
                  onChange={handleD3Change('d3_containment_scope')}
                  placeholder="例如：JPX One 客戶、XX-36I 機種、D20 當日所有批次"
                />
              </div>
            </div>

            <div className="d2-row">
              <div className="field full">
                <label>臨時對策說明</label>
                <textarea
                  rows={3}
                  value={d3Form.d3_containment_desc}
                  onChange={handleD3Change('d3_containment_desc')}
                  placeholder="簡要說明目前止血作法，例如：增加 100% 外觀檢查，隔離 2/8 日白班生產批次。"
                />
              </div>
            </div>

            <div className="d2-row">
              <div className="field">
                <label>目前判斷是否有效</label>
                <label className="checkbox-inline">
                  <input
                    type="checkbox"
                    checked={d3Form.d3_containment_effective_flag}
                    onChange={handleD3Change('d3_containment_effective_flag')}
                  />
                  止血看起來有效
                </label>
              </div>
            </div>

            <div className="d2-actions">
              <button type="button" className="btn primary" onClick={saveD3}>
                儲存 D3 臨時對策（寫入 localStorage）
              </button>
            </div>
          </div>

          <div className="d3-history">
            <h4>D3 歷史版本</h4>
            {list.find((x) => x.id === activeIssueId)?.d3_history?.length ? (
              <ul className="d3-history-list">
                {list
                  .find((x) => x.id === activeIssueId)
                  .d3_history.map((h, idx) => (
                    <li key={idx}>
                      <div>
                        <strong>{h.d3_containment_action_code || '（未填代碼）'}</strong>
                        <span className="d3-history-meta">
                          ｜ 儲存時間：{h.version_saved_at}
                        </span>
                      </div>
                      {h.d3_containment_desc && <div>{h.d3_containment_desc}</div>}
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="panel-desc">目前尚無歷史版本，儲存一次 D3 後會保留舊版本。</p>
            )}
          </div>
        </section>
      )}

      {activeIssueId && (
        <section className="panel muted d3-panel">
          <h3>D4 根本原因分析 - {activeIssueId}</h3>
          <div className="d3-form">
            <div className="d2-row">
              <div className="field">
                <label>原因大分類</label>
                <select
                  value={d4Draft.root_cause_category}
                  onChange={handleD4DraftChange('root_cause_category')}
                >
                  <option value="">請選擇</option>
                  <option value="design">設計</option>
                  <option value="material">材料</option>
                  <option value="machine">設備</option>
                  <option value="method">方法 / 作業</option>
                  <option value="man">人員</option>
                  <option value="environment">環境</option>
                  <option value="measurement">測試 / 量測</option>
                  <option value="supplier">供應商</option>
                </select>
              </div>
              <div className="field">
                <label>原因代碼</label>
                <input
                  type="text"
                  value={d4Draft.root_cause_code}
                  onChange={handleD4DraftChange('root_cause_code')}
                  placeholder="例如：MOLD_TEMP_LOW / TOOL_WEAR"
                />
              </div>
            </div>

            <div className="d2-row">
              <div className="field full">
                <label>原因說明</label>
                <textarea
                  rows={3}
                  value={d4Draft.root_cause_desc}
                  onChange={handleD4DraftChange('root_cause_desc')}
                  placeholder="描述此 root cause 的內容，例如模具溫度控制不足導致充填不良。"
                />
              </div>
            </div>

            <div className="d2-row">
              <div className="field">
                <label>狀態 / 是否主要原因</label>
                <div className="checkbox-row">
                  <select
                    value={d4Draft.status}
                    onChange={handleD4DraftChange('status')}
                  >
                    <option value="hypothesis">假設中</option>
                    <option value="confirmed">已確認</option>
                    <option value="rejected">已否決</option>
                  </select>
                  <label className="checkbox-inline">
                    <input
                      type="checkbox"
                      checked={d4Draft.is_primary}
                      onChange={handleD4DraftChange('is_primary')}
                    />
                    主要原因
                  </label>
                </div>
              </div>
            </div>

            <div className="d2-row">
              <div className="field">
                <label>應攔截製程段</label>
                <select
                  value={d4Draft.escape_point_process_code}
                  onChange={handleD4DraftChange('escape_point_process_code')}
                >
                  <option value="">請選擇</option>
                  {ROUTES.filter((r) => r.code).map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>漏檢原因代碼</label>
                <input
                  type="text"
                  value={d4Draft.escape_reason_code}
                  onChange={handleD4DraftChange('escape_reason_code')}
                  placeholder="例如：NO_CHECKPOINT / CHECK_NOT_EFFECTIVE"
                />
              </div>
            </div>

            <div className="d2-row">
              <div className="field full">
                <label>漏檢原因說明</label>
                <textarea
                  rows={2}
                  value={d4Draft.escape_reason_desc}
                  onChange={handleD4DraftChange('escape_reason_desc')}
                  placeholder="描述為何沒被攔住，例如檢驗頻率不足、未涵蓋此情境。"
                />
              </div>
            </div>

            <div className="d2-actions">
              <button type="button" className="btn primary" onClick={addD4Cause}>
                新增 D4 根本原因
              </button>
            </div>
          </div>

          <div className="d3-history">
            <h4>D4 原因清單</h4>
            {d4List.length ? (
              <ul className="d3-history-list">
                {d4List.map((rc) => (
                  <li key={rc.id}>
                    <div>
                      <strong>
                        {rc.root_cause_category || '（未選分類）'} /{' '}
                        {rc.root_cause_code || '（未填代碼）'}
                      </strong>
                      <span className="d3-history-meta">
                        ｜ 狀態：{rc.status}｜ 主要：{rc.is_primary ? '是' : '否'}
                      </span>
                    </div>
                    {rc.root_cause_desc && <div>{rc.root_cause_desc}</div>}
                    <div className="d3-history-meta">
                      應攔截製程：{rc.escape_point_process_code || '（未填）'}；漏檢原因：
                      {rc.escape_reason_code || '（未填）'}
                    </div>
                    <button
                      type="button"
                      className="btn secondary small"
                      onClick={() => removeD4Cause(rc.id)}
                    >
                      刪除此原因
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="panel-desc">尚未新增任何根本原因，請從上方表單新增。</p>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
