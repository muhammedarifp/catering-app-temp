import jsPDF from 'jspdf'
import 'jspdf-autotable'

// Extend jsPDF to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number
    }
  }
}

// Prisma Decimal type compatible
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
      dish: {
        name: string
      }
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

export function generateInvoicePDF(invoiceData: InvoiceData) {
  const doc = new jsPDF()

  // Company Header
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('CATERING SERVICES', 105, 20, { align: 'center' })

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Your Company Address Line 1', 105, 28, { align: 'center' })
  doc.text('Your Company Address Line 2', 105, 33, { align: 'center' })
  doc.text('Phone: +91 XXXXXXXXXX | Email: info@catering.com', 105, 38, { align: 'center' })

  // Invoice Title
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', 105, 50, { align: 'center' })

  // Invoice Details
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Invoice Number: ${invoiceData.invoiceNumber}`, 20, 60)
  doc.text(`Issue Date: ${new Date(invoiceData.issueDate).toLocaleDateString()}`, 20, 66)
  if (invoiceData.dueDate) {
    doc.text(`Due Date: ${new Date(invoiceData.dueDate).toLocaleDateString()}`, 20, 72)
  }

  // Client Details
  doc.setFont('helvetica', 'bold')
  doc.text('BILL TO:', 20, 85)
  doc.setFont('helvetica', 'normal')
  doc.text(invoiceData.event.clientName, 20, 91)
  doc.text(`Contact: ${invoiceData.event.clientContact}`, 20, 97)

  // Event Details
  doc.setFont('helvetica', 'bold')
  doc.text('EVENT DETAILS:', 120, 85)
  doc.setFont('helvetica', 'normal')
  doc.text(invoiceData.event.name, 120, 91)
  doc.text(`Date: ${new Date(invoiceData.event.eventDate).toLocaleDateString()}`, 120, 97)
  doc.text(`Time: ${invoiceData.event.eventTime}`, 120, 103)
  doc.text(`Location: ${invoiceData.event.location}`, 120, 109)
  doc.text(`Guests: ${invoiceData.event.guestCount}`, 120, 115)

  // Dishes Table
  const dishesData = invoiceData.event.dishes.map((dish) => [
    dish.dish.name,
    dish.quantity.toString(),
    `₹${Number(dish.pricePerPlate).toFixed(2)}`,
    `₹${(dish.quantity * Number(dish.pricePerPlate)).toFixed(2)}`,
  ])

  // @ts-ignore - autoTable is added to jsPDF via plugin
  doc.autoTable({
    startY: 125,
    head: [['Dish', 'Quantity', 'Price/Plate', 'Total']],
    body: dishesData,
    theme: 'striped',
    headStyles: { fillColor: [41, 128, 185] },
    styles: { fontSize: 9 },
  })

  // Services Table (if any)
  if (invoiceData.event.services.length > 0) {
    const servicesData = invoiceData.event.services.map((service) => [
      service.serviceName,
      service.description || '-',
      `₹${Number(service.price).toFixed(2)}`,
    ])

    // @ts-ignore - autoTable is added to jsPDF via plugin
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Service', 'Description', 'Price']],
      body: servicesData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 9 },
    })
  }

  // Totals
  const finalY = doc.lastAutoTable.finalY + 10

  doc.setFont('helvetica', 'normal')
  doc.text('Subtotal:', 130, finalY)
  doc.text(`₹${Number(invoiceData.subtotal).toFixed(2)}`, 180, finalY, { align: 'right' })

  doc.text('Tax (18% GST):', 130, finalY + 6)
  doc.text(`₹${Number(invoiceData.tax).toFixed(2)}`, 180, finalY + 6, { align: 'right' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text('Total Amount:', 130, finalY + 14)
  doc.text(`₹${Number(invoiceData.totalAmount).toFixed(2)}`, 180, finalY + 14, { align: 'right' })

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Paid Amount:', 130, finalY + 22)
  doc.text(`₹${Number(invoiceData.paidAmount).toFixed(2)}`, 180, finalY + 22, { align: 'right' })

  doc.setFont('helvetica', 'bold')
  const balanceColor = Number(invoiceData.balanceAmount) > 0 ? [220, 53, 69] : [40, 167, 69]
  doc.setTextColor(balanceColor[0], balanceColor[1], balanceColor[2])
  doc.text('Balance Due:', 130, finalY + 30)
  doc.text(`₹${Number(invoiceData.balanceAmount).toFixed(2)}`, 180, finalY + 30, { align: 'right' })

  // Footer
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(8)
  doc.text('Thank you for your business!', 105, 280, { align: 'center' })
  doc.text('For any queries, please contact us at the above details.', 105, 285, { align: 'center' })

  return doc
}

export function downloadInvoice(invoiceData: InvoiceData) {
  const doc = generateInvoicePDF(invoiceData)
  doc.save(`Invoice-${invoiceData.invoiceNumber}.pdf`)
}
