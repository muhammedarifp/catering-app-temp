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
