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
const fmt = (v: DecimalLike) =>
  `₹${n(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

// ── STANDARD INVOICE ──────────────────────────────────────────────────────────
function generateStandardInvoiceHTML(data: InvoiceData): string {
  const { event } = data
  const isPaid = n(data.balanceAmount) <= 0

  const allItems = [
    ...event.dishes.map(d => ({
      name: d.dish?.name || '—',
      sub: `${d.quantity} plates × ${fmt(d.pricePerPlate)}`,
      amount: d.quantity * n(d.pricePerPlate),
    })),
    ...event.services.map(s => ({
      name: s.serviceName,
      sub: s.description || 'Additional service',
      amount: n(s.price),
    })),
  ]

  const itemRows = allItems.map(r => `
    <div style="display:flex;align-items:center;padding:13px 0;border-bottom:1px solid #f3f4f6">
      <div style="flex:1;min-width:0;padding-right:16px">
        <div style="font-size:13px;font-weight:600;color:#111827">${r.name}</div>
        <div style="font-size:11px;color:#9ca3af;margin-top:2px">${r.sub}</div>
      </div>
      <div style="font-size:13px;font-weight:700;color:#111827;white-space:nowrap">${fmt(r.amount)}</div>
    </div>`).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Invoice ${data.invoiceNumber}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',system-ui,Arial,sans-serif;font-size:13px;color:#111827;background:#fff;line-height:1.5;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .wrap{max-width:660px;margin:0 auto;padding:48px 44px}
    @media(max-width:600px){.wrap{padding:24px 20px}}
    @media print{.wrap{padding:32px 28px}}
  </style>
</head>
<body>
<div class="wrap">

  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:28px;border-bottom:1px solid #e5e7eb;margin-bottom:32px">
    <div>
      <div style="font-size:30px;font-weight:900;letter-spacing:-1px;color:#111827;line-height:1">INVOICE</div>
      <div style="font-size:12px;color:#9ca3af;margin-top:6px;letter-spacing:0.3px">#${data.invoiceNumber}</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:17px;font-weight:900;letter-spacing:-0.3px;color:#111827">CaterPro</div>
      <div style="font-size:9.5px;color:#9ca3af;letter-spacing:1.5px;text-transform:uppercase;margin-top:3px">Catering &amp; Banquet</div>
      <div style="margin-top:10px;display:inline-block;padding:5px 14px;border-radius:100px;font-size:10px;font-weight:700;letter-spacing:0.3px;
        ${isPaid ? 'background:#dcfce7;color:#15803d' : 'background:#fef3c7;color:#92400e'}">
        ${isPaid ? '✓ PAID' : 'PAYMENT PENDING'}
      </div>
    </div>
  </div>

  <!-- Bill To + Event Details -->
  <div style="display:flex;gap:32px;margin-bottom:36px">
    <div style="flex:1">
      <div style="font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;margin-bottom:10px">Bill To</div>
      <div style="font-size:16px;font-weight:800;color:#111827;line-height:1.2">${event.clientName}</div>
      <div style="font-size:12px;color:#6b7280;margin-top:5px">${event.clientContact}</div>
    </div>
    <div style="flex:1;padding-left:32px;border-left:1px solid #e5e7eb">
      <div style="font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#9ca3af;margin-bottom:10px">Event</div>
      <div style="font-size:16px;font-weight:800;color:#111827;line-height:1.2">${event.name}</div>
      <div style="font-size:12px;color:#6b7280;margin-top:5px">${fmtDate(event.eventDate)} · ${event.eventTime}</div>
      <div style="font-size:12px;color:#6b7280">${event.location} · ${event.guestCount} guests</div>
    </div>
  </div>

  <!-- Dates strip -->
  <div style="display:flex;gap:24px;margin-bottom:28px;font-size:11.5px;color:#9ca3af">
    <span>Issued: <strong style="color:#374151">${fmtDate(data.issueDate)}</strong></span>
    ${data.dueDate ? `<span>Due: <strong style="color:#374151">${fmtDate(data.dueDate)}</strong></span>` : ''}
  </div>

  <!-- Items header -->
  <div style="display:flex;justify-content:space-between;padding-bottom:8px;border-bottom:2px solid #111827;font-size:9.5px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#9ca3af;margin-bottom:2px">
    <span>Description</span>
    <span>Amount</span>
  </div>

  <!-- Items -->
  <div style="margin-bottom:32px">
    ${itemRows || '<div style="padding:24px 0;text-align:center;color:#9ca3af;font-size:12px">No items added</div>'}
  </div>

  <!-- Totals -->
  <div style="display:flex;justify-content:flex-end;margin-bottom:44px">
    <div style="width:240px">
      <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px">
        <span style="color:#6b7280">Subtotal</span>
        <span style="color:#374151">${fmt(data.subtotal)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:12px">
        <span style="color:#6b7280">GST (18%)</span>
        <span style="color:#374151">${fmt(data.tax)}</span>
      </div>
      <div style="border-top:2px solid #111827;margin:10px 0"></div>
      <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:17px;font-weight:900;color:#111827">
        <span>Total</span>
        <span>${fmt(data.totalAmount)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;font-weight:600;color:#15803d">
        <span>Paid</span>
        <span>${fmt(data.paidAmount)}</span>
      </div>
      <div style="margin-top:12px;padding:13px 16px;border-radius:8px;${isPaid ? 'background:#f0fdf4' : 'background:#fffbeb;border:1px solid #fde68a'}">
        <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:800;${isPaid ? 'color:#15803d' : 'color:#92400e'}">
          <span>Balance Due</span>
          <span>${fmt(data.balanceAmount)}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div style="border-top:1px solid #e5e7eb;padding-top:18px;display:flex;justify-content:space-between;align-items:center">
    <span style="font-size:12.5px;font-weight:700;color:#111827">Thank you for choosing CaterPro!</span>
    <span style="font-size:10px;color:#9ca3af">${fmtDate(new Date())}</span>
  </div>

</div>
</body>
</html>`
}

// ── PRO INVOICE ───────────────────────────────────────────────────────────────
function generateProInvoiceHTML(data: InvoiceData): string {
  const { event } = data
  const isPaid = n(data.balanceAmount) <= 0

  const dishItems = event.dishes.map(d => `
    <div style="display:flex;align-items:center;padding:14px 0;border-bottom:1px solid #e2e8f0">
      <div style="width:5px;height:36px;background:#f59e0b;border-radius:3px;margin-right:16px;flex-shrink:0"></div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:700;color:#1e293b">${d.dish?.name || '—'}</div>
        <div style="font-size:11px;color:#94a3b8;margin-top:2px">${d.quantity} plates &nbsp;·&nbsp; ${fmt(d.pricePerPlate)} per plate</div>
      </div>
      <div style="font-size:13px;font-weight:800;color:#1e293b;white-space:nowrap">${fmt(d.quantity * n(d.pricePerPlate))}</div>
    </div>`).join('')

  const serviceItems = event.services.map(s => `
    <div style="display:flex;align-items:center;padding:14px 0;border-bottom:1px solid #e2e8f0">
      <div style="width:5px;height:36px;background:#64748b;border-radius:3px;margin-right:16px;flex-shrink:0"></div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13px;font-weight:700;color:#1e293b">${s.serviceName}</div>
        ${s.description ? `<div style="font-size:11px;color:#94a3b8;margin-top:2px">${s.description}</div>` : ''}
      </div>
      <div style="font-size:13px;font-weight:800;color:#1e293b;white-space:nowrap">${fmt(s.price)}</div>
    </div>`).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Invoice ${data.invoiceNumber}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',system-ui,Arial,sans-serif;font-size:13px;background:#f1f5f9;color:#1e293b;line-height:1.5;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .outer{max-width:700px;margin:0 auto;padding:32px 20px}
    .card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.09)}
    @media(max-width:600px){.outer{padding:12px 8px}}
    @media print{body{background:#fff}.outer{padding:0}.card{box-shadow:none;border-radius:0}}
  </style>
</head>
<body>
<div class="outer">
<div class="card">

  <!-- Top Banner -->
  <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#334155 100%);padding:32px 36px;position:relative;overflow:hidden">
    <div style="position:absolute;right:-30px;top:-30px;width:160px;height:160px;border-radius:50%;background:rgba(245,158,11,0.08)"></div>
    <div style="position:absolute;right:50px;bottom:-20px;width:80px;height:80px;border-radius:50%;background:rgba(245,158,11,0.05)"></div>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;position:relative">
      <div>
        <div style="font-size:26px;font-weight:900;color:#fff;letter-spacing:0.5px;line-height:1">CaterPro</div>
        <div style="font-size:9px;letter-spacing:3.5px;color:#f59e0b;margin-top:5px;text-transform:uppercase">Catering &amp; Banquet Services</div>
        <div style="font-size:9px;color:#64748b;margin-top:3px;font-style:italic">Where Every Feast Tells a Story</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:10px;letter-spacing:2px;font-weight:600;color:#64748b;text-transform:uppercase">Invoice</div>
        <div style="font-size:22px;font-weight:900;color:#fff;margin-top:2px;letter-spacing:-0.5px">#${data.invoiceNumber}</div>
        <div style="margin-top:10px;display:inline-block;padding:5px 16px;border-radius:100px;font-size:10px;font-weight:700;letter-spacing:0.5px;
          ${isPaid ? 'background:#dcfce7;color:#15803d' : 'background:#fef3c7;color:#92400e'}">
          ${isPaid ? '✓ FULLY PAID' : 'PAYMENT PENDING'}
        </div>
      </div>
    </div>
  </div>

  <!-- Amber accent bar -->
  <div style="height:3px;background:linear-gradient(90deg,#f59e0b 0%,#fbbf24 60%,#fde68a 100%)"></div>

  <!-- Info section -->
  <div style="display:flex;gap:0;background:#f8fafc;border-bottom:1px solid #e2e8f0">
    <div style="flex:1;padding:22px 28px">
      <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;margin-bottom:10px">Billed To</div>
      <div style="font-size:15px;font-weight:800;color:#0f172a">${event.clientName}</div>
      <div style="font-size:12px;color:#64748b;margin-top:4px">${event.clientContact}</div>
    </div>
    <div style="width:1px;background:#e2e8f0"></div>
    <div style="flex:1;padding:22px 28px">
      <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;margin-bottom:10px">Event Details</div>
      <div style="font-size:15px;font-weight:800;color:#0f172a">${event.name}</div>
      <div style="font-size:12px;color:#64748b;margin-top:4px">${fmtDate(event.eventDate)} · ${event.eventTime}</div>
      <div style="font-size:12px;color:#64748b">${event.location} · ${event.guestCount} guests</div>
    </div>
  </div>

  <!-- Dates -->
  <div style="padding:12px 28px;background:#f8fafc;border-bottom:1px solid #e2e8f0;display:flex;gap:24px;font-size:11px;color:#94a3b8">
    <span>Issued: <strong style="color:#475569">${fmtDate(data.issueDate)}</strong></span>
    ${data.dueDate ? `<span>Due: <strong style="color:#475569">${fmtDate(data.dueDate)}</strong></span>` : ''}
  </div>

  <!-- Items -->
  <div style="padding:0 28px 8px">
    ${event.dishes.length > 0 ? `
    <div style="font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;padding:20px 0 4px">Dishes</div>
    ${dishItems}` : ''}

    ${event.services.length > 0 ? `
    <div style="font-size:9.5px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;padding:20px 0 4px">Services</div>
    ${serviceItems}` : ''}

    ${event.dishes.length === 0 && event.services.length === 0
      ? '<div style="padding:32px 0;text-align:center;color:#94a3b8;font-size:12px">No items added</div>'
      : ''}
  </div>

  <!-- Totals + Status -->
  <div style="display:flex;gap:0;border-top:1px solid #e2e8f0">
    <!-- Status left -->
    <div style="flex:1;padding:24px 28px;background:#f8fafc;display:flex;align-items:center">
      <div style="font-size:12px;${isPaid ? 'color:#15803d' : 'color:#92400e'};font-weight:600;line-height:1.5">
        ${isPaid
          ? '✓ This invoice has been<br/>fully settled. Thank you!'
          : 'Payment is pending.<br/>Please settle at your earliest.'}
      </div>
    </div>
    <!-- Summary right -->
    <div style="flex:1;padding:24px 28px;border-left:1px solid #e2e8f0">
      <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;color:#64748b">
        <span>Subtotal</span><span>${fmt(data.subtotal)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;color:#64748b">
        <span>GST (18%)</span><span>${fmt(data.tax)}</span>
      </div>
      <div style="border-top:2px solid #0f172a;margin:10px 0"></div>
      <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:17px;font-weight:900;color:#0f172a">
        <span>Total</span><span>${fmt(data.totalAmount)}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;font-weight:600;color:#15803d">
        <span>Paid</span><span>${fmt(data.paidAmount)}</span>
      </div>
      <div style="margin-top:12px;padding:12px 16px;border-radius:8px;background:${isPaid ? '#f0fdf4' : '#1e293b'}">
        <div style="display:flex;justify-content:space-between;font-size:14px;font-weight:800;${isPaid ? 'color:#15803d' : 'color:#f59e0b'}">
          <span>Balance Due</span><span>${fmt(data.balanceAmount)}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div style="background:#0f172a;padding:16px 28px;display:flex;justify-content:space-between;align-items:center">
    <span style="font-size:11.5px;color:#475569">Thank you for choosing <strong style="color:#f59e0b">CaterPro</strong></span>
    <span style="font-size:10px;color:#334155">${data.invoiceNumber} &nbsp;·&nbsp; ${fmtDate(new Date())}</span>
  </div>

</div>
</div>
</body>
</html>`
}

export function downloadInvoice(invoiceData: InvoiceData, type: 'standard' | 'pro' = 'standard') {
  const html = type === 'pro'
    ? generateProInvoiceHTML(invoiceData)
    : generateStandardInvoiceHTML(invoiceData)
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
  <title>${data.quotationNumber} - ${data.clientName} Menu</title>
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
      background: #1e293b;
      color: #fff;
      padding: 18px 44px;
      border-radius: 8px;
      border-bottom: 4px solid #f59e0b;
    }

    .brand-box .brand-name {
      font-size: 28px;
      font-weight: 900;
      letter-spacing: 3px;
      text-transform: uppercase;
    }

    .brand-box .brand-sub {
      font-size: 10px;
      letter-spacing: 4px;
      color: #f59e0b;
      margin-top: 3px;
      text-transform: uppercase;
    }

    .brand-box .brand-tag {
      font-size: 9px;
      letter-spacing: 1.5px;
      color: #94a3b8;
      margin-top: 2px;
      font-style: italic;
      text-transform: none;
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
      background: #1e293b;
      color: #fff;
      padding: 10px 24px;
      border-radius: 6px;
      border-bottom: 3px solid #f59e0b;
      margin-bottom: 10px;
    }

    .footer .brand-footer .fn { font-size: 14px; font-weight: 800; letter-spacing: 2px; }
    .footer .brand-footer .fs { font-size: 9px; letter-spacing: 2px; color: #f59e0b; }

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
      <div class="brand-sub">Catering &amp; Banquet Services</div>
      <div class="brand-tag">Where Every Feast Tells a Story</div>
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
      <td class="val">${data.serviceType || '—'}</td>
    </tr>
    <tr>
      <td class="lbl">VENUE</td>
      <td class="val">${data.location}</td>
      <td class="lbl">DATE &amp; DAY</td>
      <td class="val">${fmtMenuDate(data.eventDate)}</td>
    </tr>
    <tr>
      <td class="lbl">EVENT</td>
      <td class="val">${data.occasion || '—'}</td>
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
      <div class="fs">Catering &amp; Banquet Services</div>
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
