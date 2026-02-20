type DecimalLike = number | { toNumber(): number } | string

interface InvoiceData {
  invoiceNumber: string
  issueDate: Date
  dueDate?: Date | null
  event: {
    name: string
    clientName: string
    clientContact: string
    location: string
    eventDate: Date
    eventTime: string
    guestCount: number
    dishes: Array<{
      quantity: number
      pricePerPlate: DecimalLike
      dish: { name: string }
    }>
    services: Array<{
      serviceName: string
      description?: string | null
      price: DecimalLike
    }>
  }
  subtotal: DecimalLike
  tax: DecimalLike
  totalAmount: DecimalLike
  paidAmount: DecimalLike
  balanceAmount: DecimalLike
}

const n = (v: DecimalLike) => Number(v)
const fmt = (v: DecimalLike) => `₹${n(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

function generateInvoiceHTML(data: InvoiceData): string {
  const { event } = data
  const balance = n(data.balanceAmount)
  const isPaid = balance <= 0

  const dishRows = event.dishes.map(d => `
    <tr>
      <td>${d.dish?.name || '—'}</td>
      <td class="center">${d.quantity}</td>
      <td class="right">${fmt(d.pricePerPlate)}</td>
      <td class="right">${fmt(d.quantity * n(d.pricePerPlate))}</td>
    </tr>
  `).join('')

  const serviceRows = event.services.length > 0 ? `
    <div class="section">
      <h3 class="section-title">Additional Services</h3>
      <table>
        <thead>
          <tr>
            <th>Service</th>
            <th>Description</th>
            <th class="right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${event.services.map(s => `
            <tr>
              <td>${s.serviceName}</td>
              <td class="muted">${s.description || '—'}</td>
              <td class="right">${fmt(s.price)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  ` : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${data.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12px;
      color: #1a1a1a;
      background: #fff;
      line-height: 1.6;
    }

    .page {
      max-width: 794px;
      margin: 0 auto;
      padding: 40px 48px;
    }

    /* ── Header ── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 24px;
      border-bottom: 3px solid #18181b;
      margin-bottom: 32px;
    }

    .brand h1 {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #18181b;
    }

    .brand p {
      font-size: 11px;
      color: #71717a;
      margin-top: 2px;
    }

    .invoice-meta { text-align: right; }

    .invoice-meta .invoice-number {
      font-size: 20px;
      font-weight: 700;
      color: #18181b;
    }

    .invoice-meta .dates {
      font-size: 11px;
      color: #52525b;
      margin-top: 6px;
      line-height: 1.8;
    }

    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      margin-top: 8px;
    }
    .badge-paid   { background: #dcfce7; color: #15803d; }
    .badge-unpaid { background: #fef9c3; color: #a16207; }

    /* ── Info Cards ── */
    .info-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 28px;
    }

    .info-card {
      background: #f4f4f5;
      border-radius: 10px;
      padding: 16px 20px;
    }

    .info-card h4 {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #71717a;
      margin-bottom: 10px;
    }

    .info-card p {
      font-size: 12px;
      color: #18181b;
      font-weight: 500;
      margin-bottom: 4px;
    }

    .info-card .label {
      font-size: 10px;
      color: #71717a;
      font-weight: 400;
    }

    /* ── Section ── */
    .section { margin-bottom: 28px; }

    .section-title {
      font-size: 13px;
      font-weight: 700;
      color: #18181b;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e4e4e7;
    }

    /* ── Table ── */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11.5px;
    }

    thead { background: #18181b; color: #fff; }

    thead th {
      padding: 10px 14px;
      font-weight: 600;
      text-align: left;
      font-size: 11px;
      letter-spacing: 0.3px;
    }

    tbody tr { border-bottom: 1px solid #f0f0f0; }
    tbody tr:last-child { border-bottom: none; }

    tbody tr:nth-child(even) { background: #fafafa; }

    tbody td {
      padding: 10px 14px;
      color: #27272a;
    }

    .center { text-align: center; }
    .right   { text-align: right; }
    .muted   { color: #71717a; font-size: 11px; }

    /* ── Totals ── */
    .totals-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-top: 4px;
    }

    .totals {
      width: 280px;
      background: #f4f4f5;
      border-radius: 10px;
      padding: 16px 20px;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      font-size: 12px;
      color: #52525b;
    }

    .total-row.divider {
      border-top: 1px solid #e4e4e7;
      margin-top: 6px;
      padding-top: 10px;
    }

    .total-row.grand {
      font-size: 14px;
      font-weight: 800;
      color: #18181b;
    }

    .total-row.paid   { color: #15803d; font-weight: 600; }
    .total-row.balance-due { color: #b45309; font-weight: 700; }
    .total-row.balance-ok  { color: #15803d; font-weight: 700; }

    /* ── Footer ── */
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e4e4e7;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer p { font-size: 10px; color: #a1a1aa; }

    .footer .thank-you {
      font-size: 13px;
      font-weight: 600;
      color: #18181b;
    }

    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .page { padding: 20px 28px; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="brand">
      <h1>CaterPro</h1>
      <p>Professional Catering Services</p>
    </div>
    <div class="invoice-meta">
      <div class="invoice-number">INVOICE</div>
      <div class="dates">
        <strong>#${data.invoiceNumber}</strong><br/>
        Issued: ${fmtDate(data.issueDate)}<br/>
        ${data.dueDate ? `Due: ${fmtDate(data.dueDate)}` : ''}
      </div>
      <span class="status-badge ${isPaid ? 'badge-paid' : 'badge-unpaid'}">
        ${isPaid ? 'Paid' : 'Payment Pending'}
      </span>
    </div>
  </div>

  <!-- Bill To + Event Info -->
  <div class="info-row">
    <div class="info-card">
      <h4>Bill To</h4>
      <p>${event.clientName}</p>
      <p class="label">Contact: ${event.clientContact}</p>
    </div>
    <div class="info-card">
      <h4>Event Details</h4>
      <p>${event.name}</p>
      <p class="label">${fmtDate(event.eventDate)} &nbsp;|&nbsp; ${event.eventTime}</p>
      <p class="label">${event.location}</p>
      <p class="label">${event.guestCount} guests</p>
    </div>
  </div>

  <!-- Dishes -->
  <div class="section">
    <h3 class="section-title">Dishes</h3>
    <table>
      <thead>
        <tr>
          <th>Dish</th>
          <th class="center">Plates</th>
          <th class="right">Rate / Plate</th>
          <th class="right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${event.dishes.length > 0 ? dishRows : `<tr><td colspan="4" class="muted" style="text-align:center;padding:16px">No dishes added</td></tr>`}
      </tbody>
    </table>
  </div>

  <!-- Services -->
  ${serviceRows}

  <!-- Totals -->
  <div class="totals-wrapper">
    <div class="totals">
      <div class="total-row">
        <span>Subtotal</span>
        <span>${fmt(data.subtotal)}</span>
      </div>
      <div class="total-row">
        <span>GST (18%)</span>
        <span>${fmt(data.tax)}</span>
      </div>
      <div class="total-row divider grand">
        <span>Total</span>
        <span>${fmt(data.totalAmount)}</span>
      </div>
      <div class="total-row paid">
        <span>Paid</span>
        <span>${fmt(data.paidAmount)}</span>
      </div>
      <div class="total-row ${isPaid ? 'balance-ok' : 'balance-due'}">
        <span>Balance Due</span>
        <span>${fmt(data.balanceAmount)}</span>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer">
    <p class="thank-you">Thank you for your business!</p>
    <p>For queries, please contact us.</p>
  </div>

</div>
</body>
</html>`
}

export function downloadInvoice(invoiceData: InvoiceData) {
  const html = generateInvoiceHTML(invoiceData)
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Please allow popups to download the invoice.')
    return
  }
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.onload = () => {
    printWindow.focus()
    printWindow.print()
  }
}

// ── Menu (Quotation Menu) ─────────────────────────────────────────────────────

interface MenuData {
  quotationNumber: string
  clientName: string
  clientContact: string
  location: string
  eventDate: Date | string
  eventTime: string
  peopleCount: number
  occasion?: string      // e.g. "NIKKAH", "WEDDING", "BIRTHDAY"
  serviceType?: string   // e.g. "BOX COUNTER", "BUFFET"
  dishes: Array<{
    quantity: number
    pricePerPlate: DecimalLike
    dish: { name: string; description?: string | null; category?: string }
  }>
  services: Array<{
    serviceName: string
    description?: string | null
  }>
}

function fmtMenuDate(d: Date | string): string {
  const date = new Date(d)
  const dd = String(date.getDate()).padStart(2, '0')
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const yy = String(date.getFullYear()).slice(2)
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
  const day = days[date.getDay()]
  return `${dd}.${mm}.${yy} & ${day}`
}

function generateMenuHTML(data: MenuData): string {
  // Group dishes by category (preserving insertion order)
  const groups: Map<string, string[]> = new Map()
  for (const d of data.dishes) {
    const cat = (d.dish?.category || 'Others').toUpperCase()
    if (!groups.has(cat)) groups.set(cat, [])
    groups.get(cat)!.push(d.dish?.name || '—')
  }

  const menuSections = Array.from(groups.entries()).map(([category, items]) => `
    <div class="menu-section">
      <div class="course-title">${category}</div>
      ${items.map(item => `<div class="menu-item">&#10148;&nbsp;${item}</div>`).join('')}
    </div>
  `).join('')

  const benefitsSection = data.services.length > 0 ? `
    <div class="menu-section">
      <div class="course-title">CUSTOMER BENEFITS</div>
      <ul class="benefits-list">
        ${data.services.map(s => `<li>${s.serviceName}${s.description ? ` <span class="desc">(${s.description})</span>` : ''}</li>`).join('')}
      </ul>
    </div>
  ` : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Menu - ${data.quotationNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 13px;
      color: #1a1a1a;
      background: #fff;
      line-height: 1.7;
    }

    .page {
      max-width: 794px;
      margin: 0 auto;
      padding: 40px 56px;
    }

    /* ── Logo / Brand ── */
    .brand-header {
      text-align: center;
      margin-bottom: 28px;
    }

    .brand-box {
      display: inline-block;
      background: #1a3a3a;
      color: #fff;
      padding: 18px 36px;
      border-radius: 6px;
    }

    .brand-box .brand-name {
      font-size: 26px;
      font-weight: 900;
      letter-spacing: 2px;
    }

    .brand-box .brand-sub {
      font-size: 10px;
      letter-spacing: 3px;
      color: #c9a96e;
      margin-top: 2px;
      text-transform: uppercase;
    }

    .brand-box .brand-tag {
      font-size: 9px;
      letter-spacing: 2px;
      color: #aaa;
      margin-top: 1px;
      text-transform: uppercase;
    }

    /* ── Info Table ── */
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 28px;
      font-size: 12px;
    }

    .info-table td {
      border: 1px solid #555;
      padding: 9px 14px;
    }

    .info-table .lbl {
      font-weight: 800;
      text-transform: uppercase;
      white-space: nowrap;
      width: 120px;
    }

    .info-table .val {
      font-weight: 500;
    }

    /* ── Course Sections ── */
    .menu-section {
      margin-bottom: 14px;
    }

    .course-title {
      font-size: 14px;
      font-weight: 900;
      text-decoration: underline;
      text-transform: uppercase;
      margin-bottom: 6px;
      margin-top: 4px;
      letter-spacing: 0.5px;
    }

    .menu-item {
      font-size: 13px;
      padding: 1px 0 1px 24px;
      color: #1a1a1a;
    }

    /* ── Customer Benefits ── */
    .benefits-list {
      list-style: disc;
      padding-left: 40px;
    }

    .benefits-list li {
      padding: 1px 0;
      font-size: 13px;
    }

    .desc {
      color: #555;
      font-size: 11px;
    }

    /* ── Footer ── */
    .footer {
      margin-top: 40px;
      border-top: 2px dashed #999;
      padding-top: 20px;
      text-align: center;
    }

    .footer .brand-footer {
      display: inline-block;
      background: #1a3a3a;
      color: #fff;
      padding: 10px 24px;
      border-radius: 4px;
      margin-bottom: 10px;
    }

    .footer .brand-footer .fn { font-size: 14px; font-weight: 800; letter-spacing: 2px; }
    .footer .brand-footer .fs { font-size: 9px; letter-spacing: 2px; color: #c9a96e; }

    .footer address {
      font-style: normal;
      font-size: 11px;
      color: #444;
      line-height: 1.8;
      margin-top: 6px;
    }

    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .page { padding: 24px 40px; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- Brand Header -->
  <div class="brand-header">
    <div class="brand-box">
      <div class="brand-name">CaterPro</div>
      <div class="brand-sub">Catering &amp; Banquet Hall</div>
      <div class="brand-tag">Good Taste To Life</div>
    </div>
  </div>

  <!-- Info Table -->
  <table class="info-table">
    <tr>
      <td class="lbl">NAME</td>
      <td class="val">${data.clientName}</td>
      <td class="lbl">NO OF GUEST</td>
      <td class="val">${data.peopleCount}</td>
    </tr>
    <tr>
      <td class="lbl">CONTACT NO</td>
      <td class="val">${data.clientContact}</td>
      <td class="lbl">SERVICE TYPE</td>
      <td class="val">${data.serviceType || ''}</td>
    </tr>
    <tr>
      <td class="lbl">VENUE</td>
      <td class="val">${data.location}</td>
      <td class="lbl">DATE &amp; DAY</td>
      <td class="val">${fmtMenuDate(data.eventDate)}</td>
    </tr>
    <tr>
      <td class="lbl">EVENT</td>
      <td class="val">${data.occasion || ''}</td>
      <td class="lbl">TIME</td>
      <td class="val">${data.eventTime}</td>
    </tr>
  </table>

  <!-- Menu Sections (grouped by category) -->
  ${data.dishes.length > 0 ? menuSections : '<p style="color:#888;text-align:center;padding:20px">No dishes added</p>'}

  <!-- Customer Benefits (Services) -->
  ${benefitsSection}

  <!-- Footer -->
  <div class="footer">
    <div class="brand-footer">
      <div class="fn">CaterPro</div>
      <div class="fs">Catering &amp; Banquet Hall</div>
    </div>
    <address>
      Ref: ${data.quotationNumber} &nbsp;|&nbsp; Prepared: ${fmtDate(new Date())}
    </address>
  </div>

</div>
</body>
</html>`
}

export function downloadMenu(menuData: MenuData) {
  const html = generateMenuHTML(menuData)
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    alert('Please allow popups to download the menu.')
    return
  }
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.onload = () => {
    printWindow.focus()
    printWindow.print()
  }
}
