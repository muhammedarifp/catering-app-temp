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
