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
    <div style="margin-bottom:22px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div style="width:3px;height:18px;background:#f59e0b;border-radius:2px;flex-shrink:0"></div>
        <div style="font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#1e293b">${category}</div>
        <div style="flex:1;height:1px;background:#e2e8f0"></div>
      </div>
      <div style="padding-left:13px">
        ${items.map(item => `
          <div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid #f8fafc">
            <div style="width:5px;height:5px;border-radius:50%;background:#f59e0b;flex-shrink:0"></div>
            <div style="font-size:13px;color:#1a1a1a;font-weight:500">${item}</div>
          </div>`).join('')}
      </div>
    </div>
  `).join('')

  const benefitsSection = data.services.length > 0 ? `
    <div style="background:#f8fafc;border-radius:10px;padding:18px 20px;margin-top:24px;border-left:3px solid #1e293b">
      <div style="font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#1e293b;margin-bottom:12px">Customer Benefits</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px">
        ${data.services.map(s => `
          <div style="display:flex;align-items:center;gap:6px;background:#fff;border:1px solid #e2e8f0;border-radius:100px;padding:5px 14px">
            <span style="color:#f59e0b;font-size:12px;font-weight:800">✓</span>
            <span style="font-size:12px;color:#374151;font-weight:500">${s.serviceName}${s.description ? ` <span style="color:#94a3b8;font-size:11px">(${s.description})</span>` : ''}</span>
          </div>`).join('')}
      </div>
    </div>
  ` : ''

  const infoItems = [
    { label: 'Client', value: data.clientName },
    { label: 'Contact', value: data.clientContact },
    { label: 'Venue', value: data.location },
    { label: 'Occasion', value: data.occasion || '—' },
    { label: 'Guests', value: String(data.peopleCount) },
    { label: 'Service', value: data.serviceType || '—' },
    { label: 'Date', value: fmtMenuDate(data.eventDate) },
    { label: 'Time', value: data.eventTime },
  ]

  const infoCell = (item: { label: string; value: string }) => `
    <div style="padding:10px 0;border-bottom:1px solid #e2e8f0">
      <div style="font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#94a3b8;margin-bottom:3px">${item.label}</div>
      <div style="font-size:13px;font-weight:600;color:#0f172a">${item.value}</div>
    </div>
  `
  const infoLeft = infoItems.slice(0, 4).map(infoCell).join('')
  const infoRight = infoItems.slice(4).map(infoCell).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${data.quotationNumber} — ${data.clientName}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html{height:100%}
    body{font-family:'Segoe UI',system-ui,Arial,sans-serif;background:#fff;color:#1a1a1a;-webkit-print-color-adjust:exact;print-color-adjust:exact;display:flex;flex-direction:column;min-height:100vh}
    .main-content{flex:1}
    .footer-bar{background:#0f172a;padding:16px 56px;display:flex;justify-content:space-between;align-items:center}
    @media print{body{min-height:100vh}}
  </style>
</head>
<body>

  <!-- Full-width dark header -->
  <div style="background:linear-gradient(135deg,#0f172a 0%,#1e293b 70%,#334155 100%);padding:36px 56px;text-align:center;position:relative;overflow:hidden">
    <div style="position:absolute;left:-40px;top:-40px;width:200px;height:200px;border-radius:50%;background:rgba(245,158,11,0.06)"></div>
    <div style="position:absolute;right:-20px;bottom:-30px;width:140px;height:140px;border-radius:50%;background:rgba(245,158,11,0.05)"></div>
    <div style="position:relative">
      <div style="font-size:32px;font-weight:900;color:#fff;letter-spacing:4px;text-transform:uppercase;line-height:1">CaterPro</div>
      <div style="font-size:9px;letter-spacing:5px;color:#f59e0b;margin-top:6px;text-transform:uppercase;font-weight:700">Catering &amp; Banquet Services</div>
      <div style="font-size:9px;color:#64748b;margin-top:4px;font-style:italic;letter-spacing:1px">Where Every Feast Tells a Story</div>
      <div style="margin-top:10px;display:inline-block;padding:4px 18px;border-bottom:1px solid rgba(245,158,11,0.4);">
        <span style="font-size:9px;letter-spacing:3px;color:#f59e0b;text-transform:uppercase;font-weight:700">Quotation Menu</span>
        <span style="font-size:9px;margin-left:8px;color:#fff">#${data.quotationNumber}</span>
      </div>
    </div>
  </div>

  <!-- Amber accent bar -->
  <div style="height:3px;background:linear-gradient(90deg,#f59e0b,#fbbf24,#fde68a)"></div>

  <div class="main-content">

    <!-- Client info grid (2 columns, 4 rows) -->
    <div style="padding:20px 56px 0;background:#fff">
      <div style="display:flex;margin-bottom:28px">
        <div style="flex:1;padding-right:32px">
          ${infoLeft}
        </div>
        <div style="width:1px;background:#e2e8f0"></div>
        <div style="flex:1;padding-left:32px">
          ${infoRight}
        </div>
      </div>
    </div>

    <!-- Menu content -->
    <div style="padding:0 56px 40px">

      <!-- Section heading -->
      <div style="text-align:center;margin-bottom:24px">
        <div style="display:inline-flex;align-items:center;gap:12px">
          <div style="width:40px;height:1px;background:#e2e8f0"></div>
          <span style="font-size:9px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#94a3b8">Menu</span>
          <div style="width:40px;height:1px;background:#e2e8f0"></div>
        </div>
      </div>

      <!-- Dish categories -->
      ${data.dishes.length > 0 ? menuSections : '<p style="color:#94a3b8;text-align:center;padding:24px 0;font-size:12px">No dishes added</p>'}

      <!-- Customer Benefits -->
      ${benefitsSection}

    </div>

  </div>

  <!-- Footer -->
  <div style="border-top:1px solid #e5e7eb;padding-top:18px;display:flex;justify-content:space-between;align-items:center">
    <span style="font-size:12.5px;font-weight:700;color:#111827">Thank you for choosing CaterPro!</span>
    <span style="font-size:10px;color:#9ca3af">${fmtDate(new Date())}</span>
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
