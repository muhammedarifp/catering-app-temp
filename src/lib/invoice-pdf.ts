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
      qty: d.quantity,
      rate: n(d.pricePerPlate),
      amount: d.quantity * n(d.pricePerPlate),
    })),
    ...event.services.map(s => ({
      name: s.serviceName + (s.description ? ` (${s.description})` : ''),
      qty: 1,
      rate: n(s.price),
      amount: n(s.price),
    })),
  ]

  const rows = allItems.map((r, i) => `
    <tr style="background:${i % 2 === 0 ? '#fff' : '#f9fafb'}">
      <td style="padding:9px 12px;border-bottom:1px solid #e5e7eb;font-size:11.5px">${r.name}</td>
      <td style="padding:9px 12px;border-bottom:1px solid #e5e7eb;text-align:center;font-size:11.5px">${r.qty}</td>
      <td style="padding:9px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:11.5px">${fmt(r.rate)}</td>
      <td style="padding:9px 12px;border-bottom:1px solid #e5e7eb;text-align:right;font-size:11.5px;font-weight:500">${fmt(r.amount)}</td>
    </tr>`).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Invoice ${data.invoiceNumber}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',Arial,sans-serif;font-size:12px;color:#111827;background:#fff;line-height:1.5}
    .wrap{max-width:760px;margin:0 auto;padding:36px 40px}
    @media(max-width:600px){.wrap{padding:20px 16px}.two-col{display:block!important}.two-col>div{width:100%!important;margin-bottom:12px}}
    @media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}.wrap{padding:20px 24px}}
  </style>
</head>
<body>
<div class="wrap">

  <!-- Header -->
  <table width="100%" style="margin-bottom:28px;border-bottom:2px solid #111827;padding-bottom:20px">
    <tr>
      <td>
        <div style="font-size:20px;font-weight:900;letter-spacing:-0.5px;color:#111827">CaterPro</div>
        <div style="font-size:10px;color:#6b7280;margin-top:2px;letter-spacing:0.5px">CATERING &amp; BANQUET SERVICES</div>
      </td>
      <td style="text-align:right;vertical-align:top">
        <div style="font-size:18px;font-weight:700;color:#111827;letter-spacing:1px">TAX INVOICE</div>
        <div style="font-size:11px;color:#374151;margin-top:4px;line-height:1.7">
          <strong>#${data.invoiceNumber}</strong><br/>
          Issued: ${fmtDate(data.issueDate)}<br/>
          ${data.dueDate ? `Due: ${fmtDate(data.dueDate)}` : ''}
        </div>
        <div style="display:inline-block;margin-top:6px;padding:3px 10px;border-radius:4px;font-size:10px;font-weight:700;letter-spacing:0.5px;
          ${isPaid ? 'background:#dcfce7;color:#15803d;border:1px solid #bbf7d0' : 'background:#fef3c7;color:#92400e;border:1px solid #fde68a'}">
          ${isPaid ? '✓ PAID' : 'PAYMENT PENDING'}
        </div>
      </td>
    </tr>
  </table>

  <!-- Bill To / Event -->
  <table width="100%" class="two-col" style="display:table;margin-bottom:24px">
    <tr>
      <td width="50%" style="vertical-align:top;padding-right:16px">
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin-bottom:6px">Bill To</div>
        <div style="font-size:13px;font-weight:700;color:#111827">${event.clientName}</div>
        <div style="font-size:11px;color:#6b7280;margin-top:2px">${event.clientContact}</div>
      </td>
      <td width="50%" style="vertical-align:top;padding-left:16px;border-left:1px solid #e5e7eb">
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#9ca3af;margin-bottom:6px">Event Details</div>
        <div style="font-size:13px;font-weight:700;color:#111827">${event.name}</div>
        <div style="font-size:11px;color:#6b7280;margin-top:2px">${fmtDate(event.eventDate)} &nbsp;·&nbsp; ${event.eventTime}</div>
        <div style="font-size:11px;color:#6b7280">${event.location}</div>
        <div style="font-size:11px;color:#6b7280">${event.guestCount} guests</div>
      </td>
    </tr>
  </table>

  <!-- Items Table -->
  <table width="100%" style="border-collapse:collapse;margin-bottom:20px;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden">
    <thead>
      <tr style="background:#111827;color:#fff">
        <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;letter-spacing:0.3px">Item</th>
        <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:600;width:60px">Qty</th>
        <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:600;width:110px">Rate</th>
        <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:600;width:110px">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${rows || `<tr><td colspan="4" style="padding:20px;text-align:center;color:#9ca3af;font-size:11px">No items</td></tr>`}
    </tbody>
  </table>

  <!-- Totals -->
  <table width="100%" style="margin-bottom:32px">
    <tr>
      <td width="55%"></td>
      <td width="45%">
        <table width="100%" style="font-size:11.5px">
          <tr>
            <td style="padding:4px 0;color:#6b7280">Subtotal</td>
            <td style="padding:4px 0;text-align:right;color:#374151">${fmt(data.subtotal)}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;color:#6b7280">GST (18%)</td>
            <td style="padding:4px 0;text-align:right;color:#374151">${fmt(data.tax)}</td>
          </tr>
          <tr style="border-top:2px solid #111827">
            <td style="padding:8px 0 4px;font-size:13px;font-weight:800;color:#111827">Total</td>
            <td style="padding:8px 0 4px;text-align:right;font-size:13px;font-weight:800;color:#111827">${fmt(data.totalAmount)}</td>
          </tr>
          <tr>
            <td style="padding:3px 0;color:#15803d;font-weight:600">Paid</td>
            <td style="padding:3px 0;text-align:right;color:#15803d;font-weight:600">${fmt(data.paidAmount)}</td>
          </tr>
          <tr>
            <td style="padding:3px 0;font-weight:700;${isPaid ? 'color:#15803d' : 'color:#b45309'}">Balance Due</td>
            <td style="padding:3px 0;text-align:right;font-weight:700;${isPaid ? 'color:#15803d' : 'color:#b45309'}">${fmt(data.balanceAmount)}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <!-- Footer -->
  <div style="border-top:1px solid #e5e7eb;padding-top:16px;display:flex;justify-content:space-between;align-items:center">
    <span style="font-size:12px;font-weight:600;color:#111827">Thank you for choosing CaterPro!</span>
    <span style="font-size:10px;color:#9ca3af">Generated: ${fmtDate(new Date())}</span>
  </div>

</div>
</body>
</html>`
}

// ── PRO INVOICE ───────────────────────────────────────────────────────────────
function generateProInvoiceHTML(data: InvoiceData): string {
  const { event } = data
  const isPaid = n(data.balanceAmount) <= 0

  const dishRows = event.dishes.map((d, i) => `
    <tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'}">
      <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:11.5px;color:#1e293b">${d.dish?.name || '—'}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:center;font-size:11.5px;color:#475569">${d.quantity}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:right;font-size:11.5px;color:#475569">${fmt(d.pricePerPlate)}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:right;font-size:11.5px;font-weight:600;color:#1e293b">${fmt(d.quantity * n(d.pricePerPlate))}</td>
    </tr>`).join('')

  const serviceRows = event.services.map((s, i) => `
    <tr style="background:${i % 2 === 0 ? '#fff' : '#f8fafc'}">
      <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:11.5px;color:#1e293b" colspan="2">${s.serviceName}${s.description ? `<span style="color:#94a3b8;font-size:10.5px"> — ${s.description}</span>` : ''}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0" colspan="1"></td>
      <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:right;font-size:11.5px;font-weight:600;color:#1e293b">${fmt(s.price)}</td>
    </tr>`).join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Invoice ${data.invoiceNumber}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',Arial,sans-serif;font-size:12px;background:#f1f5f9;color:#1e293b;line-height:1.5}
    .wrap{max-width:760px;margin:0 auto;padding:32px 20px}
    .card{background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08)}
    @media(max-width:600px){.wrap{padding:12px 8px}.hdr-flex{display:block!important}.hdr-flex>div{width:100%!important;text-align:left!important;margin-top:12px}}
    @media print{body{background:#fff;print-color-adjust:exact;-webkit-print-color-adjust:exact}.wrap{padding:0}.card{box-shadow:none}}
  </style>
</head>
<body>
<div class="wrap">
<div class="card">

  <!-- Top Banner -->
  <div style="background:linear-gradient(135deg,#1e293b 0%,#334155 100%);padding:28px 32px;position:relative;overflow:hidden">
    <div style="position:absolute;right:-20px;top:-20px;width:120px;height:120px;border-radius:50%;background:rgba(245,158,11,0.12)"></div>
    <div style="position:absolute;right:30px;top:30px;width:60px;height:60px;border-radius:50%;background:rgba(245,158,11,0.08)"></div>
    <div class="hdr-flex" style="display:flex;justify-content:space-between;align-items:flex-start;position:relative">
      <div>
        <div style="font-size:24px;font-weight:900;color:#fff;letter-spacing:1px">CaterPro</div>
        <div style="font-size:9px;letter-spacing:3px;color:#f59e0b;margin-top:3px;text-transform:uppercase">Catering &amp; Banquet Services</div>
        <div style="font-size:8.5px;color:#94a3b8;margin-top:2px;font-style:italic">Where Every Feast Tells a Story</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:11px;letter-spacing:2px;font-weight:600;color:#94a3b8;text-transform:uppercase">Invoice</div>
        <div style="font-size:20px;font-weight:800;color:#fff;margin-top:2px">#${data.invoiceNumber}</div>
        <div style="margin-top:8px;display:inline-block;padding:4px 14px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:0.5px;
          ${isPaid ? 'background:#dcfce7;color:#15803d' : 'background:#fef3c7;color:#92400e'}">
          ${isPaid ? '✓ FULLY PAID' : '⏳ PAYMENT PENDING'}
        </div>
      </div>
    </div>
  </div>

  <!-- Amber accent bar -->
  <div style="height:4px;background:linear-gradient(90deg,#f59e0b,#fbbf24)"></div>

  <!-- Info Grid -->
  <div style="padding:24px 32px;background:#f8fafc;border-bottom:1px solid #e2e8f0">
    <table width="100%">
      <tr>
        <td width="50%" style="vertical-align:top;padding-right:20px">
          <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:8px">Billed To</div>
          <div style="font-size:14px;font-weight:700;color:#1e293b">${event.clientName}</div>
          <div style="font-size:11px;color:#64748b;margin-top:3px">${event.clientContact}</div>
        </td>
        <td width="50%" style="vertical-align:top;padding-left:20px;border-left:2px solid #e2e8f0">
          <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;margin-bottom:8px">Event Details</div>
          <div style="font-size:14px;font-weight:700;color:#1e293b">${event.name}</div>
          <div style="font-size:11px;color:#64748b;margin-top:3px">${fmtDate(event.eventDate)} &nbsp;·&nbsp; ${event.eventTime}</div>
          <div style="font-size:11px;color:#64748b">${event.location}</div>
          <div style="font-size:11px;color:#64748b">${event.guestCount} guests</div>
        </td>
      </tr>
      <tr>
        <td style="padding-top:12px;font-size:10px;color:#94a3b8">
          Issued: <strong style="color:#475569">${fmtDate(data.issueDate)}</strong>
          ${data.dueDate ? `&nbsp;&nbsp;Due: <strong style="color:#475569">${fmtDate(data.dueDate)}</strong>` : ''}
        </td>
        <td></td>
      </tr>
    </table>
  </div>

  <!-- Items -->
  <div style="padding:0 32px 24px">
    ${event.dishes.length > 0 ? `
    <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;padding:20px 0 10px">Dishes</div>
    <table width="100%" style="border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
      <thead>
        <tr style="background:#1e293b;color:#fff">
          <th style="padding:10px 14px;text-align:left;font-size:10.5px;font-weight:600;letter-spacing:0.3px">Dish</th>
          <th style="padding:10px 14px;text-align:center;font-size:10.5px;font-weight:600;width:60px">Plates</th>
          <th style="padding:10px 14px;text-align:right;font-size:10.5px;font-weight:600;width:100px">Rate/Plate</th>
          <th style="padding:10px 14px;text-align:right;font-size:10.5px;font-weight:600;width:110px">Amount</th>
        </tr>
      </thead>
      <tbody>${dishRows}</tbody>
    </table>` : ''}

    ${event.services.length > 0 ? `
    <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#94a3b8;padding:20px 0 10px">Services</div>
    <table width="100%" style="border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
      <thead>
        <tr style="background:#334155;color:#fff">
          <th colspan="2" style="padding:10px 14px;text-align:left;font-size:10.5px;font-weight:600;letter-spacing:0.3px">Service</th>
          <th style="padding:10px 14px;width:60px"></th>
          <th style="padding:10px 14px;text-align:right;font-size:10.5px;font-weight:600;width:110px">Amount</th>
        </tr>
      </thead>
      <tbody>${serviceRows}</tbody>
    </table>` : ''}
  </div>

  <!-- Totals -->
  <div style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0">
    <table width="100%">
      <tr>
        <td width="55%">
          <div style="font-size:11px;color:#64748b;line-height:1.8">
            ${isPaid
              ? '<span style="color:#15803d;font-weight:600">✓ This invoice has been fully paid.</span>'
              : '<span style="color:#92400e;font-weight:600">⏳ Payment is pending. Please settle the balance at earliest.</span>'}
          </div>
        </td>
        <td width="45%" style="padding-left:24px">
          <table width="100%" style="font-size:12px">
            <tr>
              <td style="padding:3px 0;color:#64748b">Subtotal</td>
              <td style="padding:3px 0;text-align:right;color:#475569">${fmt(data.subtotal)}</td>
            </tr>
            <tr>
              <td style="padding:3px 0;color:#64748b">GST (18%)</td>
              <td style="padding:3px 0;text-align:right;color:#475569">${fmt(data.tax)}</td>
            </tr>
            <tr>
              <td colspan="2"><div style="border-top:2px solid #1e293b;margin:6px 0"></div></td>
            </tr>
            <tr>
              <td style="padding:3px 0;font-size:14px;font-weight:800;color:#1e293b">Total</td>
              <td style="padding:3px 0;text-align:right;font-size:14px;font-weight:800;color:#1e293b">${fmt(data.totalAmount)}</td>
            </tr>
            <tr>
              <td style="padding:3px 0;color:#15803d;font-weight:600">Paid</td>
              <td style="padding:3px 0;text-align:right;color:#15803d;font-weight:600">${fmt(data.paidAmount)}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:13px;font-weight:700;${isPaid ? 'color:#15803d' : 'color:#b45309'}">Balance Due</td>
              <td style="padding:4px 0;text-align:right;font-size:13px;font-weight:700;${isPaid ? 'color:#15803d' : 'color:#b45309'}">${fmt(data.balanceAmount)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </div>

  <!-- Footer Banner -->
  <div style="background:#1e293b;padding:16px 32px;display:flex;justify-content:space-between;align-items:center">
    <span style="font-size:11px;color:#94a3b8">Thank you for choosing <strong style="color:#f59e0b">CaterPro</strong></span>
    <span style="font-size:10px;color:#64748b">Ref: ${data.invoiceNumber} &nbsp;·&nbsp; ${fmtDate(new Date())}</span>
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
