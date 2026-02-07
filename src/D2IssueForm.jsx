import React, { useState, useEffect } from 'react'

const STORAGE_KEY = 'd2_issues_v1'

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
    }

    const next = [record, ...list]
    setList(next)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setForm(initialForm)
  }

  const ngRate = calcRate(form.ng_qty, form.total_qty)
  const scrapRate = calcRate(form.scrap_qty, form.total_qty)

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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
