import * as XLSX from 'xlsx';

type DecimalLike = number | { toNumber(): number } | string;

export interface ExcelMenuData {
    status?: string | null;
    quotationNumber: string;
    clientName: string;
    clientContact: string;
    location: string;
    eventDate: Date | string;
    eventTime: string;
    peopleCount: number;
    occasion?: string;
    serviceType?: string;
    dishes: Array<{
        quantity: number;
        pricePerPlate: DecimalLike;
        dish: {
            name: string;
            category?: string;
            ingredients?: Array<{ ingredientName: string; quantity: string | number; unit: string }>;
        };
    }>;
    services: Array<{
        serviceName: string;
        description?: string | null;
        price: DecimalLike;
    }>;
    includeSubItems?: boolean;
}

const fmtDate = (d: Date | string) =>
    new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export function downloadMenuExcel(data: ExcelMenuData) {
    const wb = XLSX.utils.book_new();
    const showPricing = data.status !== 'PENDING';

    // Prepare header info
    const wsData: any[][] = [
        ['CaterPro - Quotation', '', '', '', ''],
        ['Quotation #:', data.quotationNumber, '', 'Date Generated:', fmtDate(new Date())],
        [],
        ['Client Info', '', '', 'Event Info', ''],
        ['Name:', data.clientName, '', 'Event Name:', `${data.clientName}'s Event`],
        ['Contact:', data.clientContact, '', 'Date & Time:', `${fmtDate(data.eventDate)} ${data.eventTime}`],
        ['', '', '', 'Location:', data.location],
        ['', '', '', 'Guests:', data.peopleCount],
        ['', '', '', 'Occasion:', data.occasion || '—'],
        ['', '', '', 'Service:', data.serviceType || '—'],
        [],
    ];

    // Group dishes by category
    const groups: Map<string, any[]> = new Map();
    let dishesSubtotal = 0;
    for (const d of data.dishes) {
        const cat = (d.dish?.category || 'Others').toUpperCase();
        if (!groups.has(cat)) groups.set(cat, []);
        groups.get(cat)!.push(d);
        dishesSubtotal += Number(d.pricePerPlate) * Number(d.quantity);
    }

    // Dishes section
    wsData.push(['MENU ITEMS']);
    if (showPricing) {
        wsData.push(['Category / Item', 'Plates', 'Price per Plate', 'Subtotal', '']);
    } else {
        wsData.push(['Category / Item', '', '', '', '']);
    }

    if (data.dishes.length === 0) {
        wsData.push(['No dishes added']);
    } else {
        for (const [category, items] of groups.entries()) {
            wsData.push([category]);
            for (const item of items) {
                if (showPricing) {
                    wsData.push(['  • ' + (item.dish?.name || '—'), item.quantity, Number(item.pricePerPlate), Number(item.pricePerPlate) * item.quantity]);
                } else {
                    wsData.push(['  • ' + (item.dish?.name || '—')]);
                }

                // Add ingredients if requested
                if (data.includeSubItems && item.dish?.ingredients && item.dish.ingredients.length > 0) {
                    for (const ing of item.dish.ingredients) {
                        wsData.push(['    - ' + ing.ingredientName]);
                    }
                }
            }
            wsData.push([]); // blank line between categories
        }
    }

    let servicesSubtotal = 0;
    // Services section
    if (data.services.length > 0) {
        wsData.push(['SERVICES / BENEFITS']);
        if (showPricing) {
            wsData.push(['Service', '', 'Price', '', '']);
        }
        for (const s of data.services) {
            const desc = s.description ? ` (${s.description})` : '';
            if (showPricing) {
                servicesSubtotal += Number(s.price || 0);
                wsData.push(['  • ' + s.serviceName + desc, '', Number(s.price || 0)]);
            } else {
                wsData.push(['  • ' + s.serviceName + desc]);
            }
        }
    }

    wsData.push([]);

    if (showPricing) {
        wsData.push(['', '', 'Dishes Subtotal:', dishesSubtotal]);
        wsData.push(['', '', 'Services Subtotal:', servicesSubtotal]);
        wsData.push(['', '', 'Estimated Total:', dishesSubtotal + servicesSubtotal]);
        wsData.push([]);
    } else {
        wsData.push(['', 'Prices will be finalized and displayed upon quotation approval.', '', '', '']);
        wsData.push([]);
    }

    wsData.push(['', '', '', '', 'Thank you for choosing CaterPro!']);

    // Create worksheet and add to workbook
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Basic column width formatting
    ws['!cols'] = [
        { wch: 35 }, // Col A (Item)
        { wch: 10 }, // Col B (Plates / Blank)
        { wch: 15 }, // Col C (Price)
        { wch: 15 }, // Col D (Subtotals)
        { wch: 25 }, // Col E
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Quotation');

    // Trigger download
    XLSX.writeFile(wb, `Quotation_${data.quotationNumber}.xlsx`);
}

// ── WORD (.doc) DOWNLOAD ──────────────────────────────────────────────────────
export function downloadMenuWord(data: ExcelMenuData) {
    const fmtD = (d: Date | string) =>
        new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

    const showPricing = data.status !== 'PENDING';

    // Group dishes by category
    const groups: Map<string, typeof data.dishes> = new Map();
    for (const d of data.dishes) {
        const cat = (d.dish?.category || 'Others').toUpperCase();
        if (!groups.has(cat)) groups.set(cat, []);
        groups.get(cat)!.push(d);
    }

    // Build dish rows HTML
    let dishRows = '';
    for (const [category, items] of groups.entries()) {
        dishRows += `
            <tr>
                <td colspan="${showPricing ? 3 : 1}" style="background:#f1f5f9;font-weight:700;font-size:11pt;padding:6px 10px;color:#334155;letter-spacing:0.05em;">${category}</td>
            </tr>`;
        for (const item of items) {
            dishRows += `<tr>
                <td style="padding:5px 10px 5px 20px;font-size:10.5pt;color:#1e293b;">• ${item.dish?.name || '—'}</td>
                ${showPricing ? `<td style="padding:5px 10px;text-align:center;color:#475569;">${item.quantity}</td>` : ''}
                ${showPricing ? `<td style="padding:5px 10px;text-align:right;color:#475569;">₹${(Number(item.pricePerPlate) * item.quantity).toLocaleString('en-IN')}</td>` : ''}
            </tr>`;
            if (data.includeSubItems && item.dish?.ingredients?.length) {
                for (const ing of item.dish.ingredients) {
                    dishRows += `<tr><td colspan="${showPricing ? 3 : 1}" style="padding:2px 10px 2px 36px;font-size:9pt;color:#94a3b8;">– ${ing.ingredientName}</td></tr>`;
                }
            }
        }
        dishRows += `<tr><td colspan="${showPricing ? 3 : 1}" style="padding:2px;"></td></tr>`;
    }

    // Services
    let serviceRows = '';
    if (data.services.length > 0) {
        serviceRows = `
            <tr><td colspan="${showPricing ? 3 : 1}" style="height:12px;"></td></tr>
            <tr><td colspan="${showPricing ? 3 : 1}" style="background:#f1f5f9;font-weight:700;font-size:11pt;padding:6px 10px;color:#334155;letter-spacing:0.05em;">SERVICES / BENEFITS</td></tr>`;
        for (const s of data.services) {
            const desc = s.description ? ` <span style="color:#94a3b8;font-size:9pt;">(${s.description})</span>` : '';
            serviceRows += `<tr>
                <td style="padding:5px 10px 5px 20px;font-size:10.5pt;color:#1e293b;">• ${s.serviceName}${desc}</td>
                ${showPricing ? `<td style="padding:5px 10px;text-align:center;">—</td>` : ''}
                ${showPricing ? `<td style="padding:5px 10px;text-align:right;color:#475569;">₹${Number(s.price || 0).toLocaleString('en-IN')}</td>` : ''}
            </tr>`;
        }
    }

    const tableHeader = showPricing
        ? `<tr style="background:#e2e8f0;">
            <th style="padding:6px 10px;text-align:left;font-size:10pt;color:#475569;font-weight:600;">Item</th>
            <th style="padding:6px 10px;text-align:center;font-size:10pt;color:#475569;font-weight:600;">Qty</th>
            <th style="padding:6px 10px;text-align:right;font-size:10pt;color:#475569;font-weight:600;">Amount</th>
           </tr>`
        : '';

    const html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <title>Quotation ${data.quotationNumber}</title>
  <!--[if gte mso 9]>
  <xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml>
  <![endif]-->
  <style>
    body { font-family: Calibri, Arial, sans-serif; margin: 2cm; color: #1e293b; }
    table { border-collapse: collapse; width: 100%; }
    h1 { color: #0f172a; font-size: 18pt; margin-bottom: 4px; }
    p { margin: 2px 0; }
  </style>
</head>
<body>
  <!-- Header -->
  <table style="margin-bottom:20px;">
    <tr>
      <td style="width:60%;">
        <h1 style="margin:0;font-size:20pt;color:#0f172a;">CaterPro</h1>
        <p style="color:#64748b;font-size:9pt;margin-top:2px;">Catering Management</p>
      </td>
      <td style="text-align:right;vertical-align:top;">
        <p style="font-size:9pt;color:#64748b;">Quotation No.</p>
        <p style="font-size:14pt;font-weight:700;color:#0f172a;">${data.quotationNumber}</p>
        <p style="font-size:9pt;color:#64748b;">Date: ${fmtD(new Date())}</p>
      </td>
    </tr>
  </table>

  <!-- Client + Event Info -->
  <table style="margin-bottom:20px;border:1px solid #e2e8f0;">
    <tr>
      <td style="width:50%;padding:10px 14px;vertical-align:top;border-right:1px solid #e2e8f0;">
        <p style="font-weight:700;font-size:9pt;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;">Client</p>
        <p style="font-size:12pt;font-weight:700;color:#0f172a;">${data.clientName}</p>
        <p style="font-size:10pt;color:#475569;">${data.clientContact}</p>
      </td>
      <td style="width:50%;padding:10px 14px;vertical-align:top;">
        <p style="font-weight:700;font-size:9pt;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;">Event</p>
        <p style="font-size:10.5pt;color:#1e293b;"><b>Date:</b> ${fmtD(data.eventDate)} at ${data.eventTime}</p>
        <p style="font-size:10.5pt;color:#1e293b;"><b>Venue:</b> ${data.location}</p>
        <p style="font-size:10.5pt;color:#1e293b;"><b>Guests:</b> ${data.peopleCount}</p>
        ${data.occasion ? `<p style="font-size:10.5pt;color:#1e293b;"><b>Occasion:</b> ${data.occasion}</p>` : ''}
        ${data.serviceType ? `<p style="font-size:10.5pt;color:#1e293b;"><b>Service:</b> ${data.serviceType}</p>` : ''}
      </td>
    </tr>
  </table>

  <!-- Menu Items -->
  <p style="font-weight:700;font-size:9pt;color:#64748b;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">Menu</p>
  <table style="border:1px solid #e2e8f0;margin-bottom:20px;">
    ${tableHeader}
    ${dishRows}
    ${serviceRows}
  </table>

  ${!showPricing ? `<p style="font-size:9pt;color:#94a3b8;font-style:italic;margin-bottom:20px;">Prices will be finalized and shared upon quotation approval.</p>` : ''}

  <!-- Footer -->
  <table style="border-top:1px solid #e2e8f0;margin-top:30px;">
    <tr>
      <td style="padding-top:12px;font-size:9pt;color:#94a3b8;text-align:center;">
        Thank you for choosing CaterPro! &nbsp;|&nbsp; This is a computer-generated document.
      </td>
    </tr>
  </table>
</body>
</html>`;

    const blob = new Blob(['\ufeff', html], {
        type: 'application/msword',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Quotation_${data.quotationNumber}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
