import * as XLSX from 'xlsx'

// Events Template
export const eventsTemplate = [
  {
    'Event Name': 'Sample Wedding',
    'Event Type': 'MAIN_EVENT',
    'Status': 'UPCOMING',
    'Client Name': 'John Doe',
    'Client Contact': '9876543210',
    'Location': 'Grand Hotel, Mumbai',
    'Event Date': '2024-12-25',
    'Event Time': '18:00',
    'Guest Count': 200,
    'Total Amount': 150000,
    'Paid Amount': 50000,
  },
  {
    'Event Name': 'Sample Local Order',
    'Event Type': 'LOCAL_ORDER',
    'Status': 'UPCOMING',
    'Client Name': 'Jane Smith',
    'Client Contact': '9876543211',
    'Location': 'Home Delivery',
    'Event Date': '2024-12-20',
    'Event Time': '12:00',
    'Guest Count': 50,
    'Total Amount': 25000,
    'Paid Amount': 25000,
  },
]

// Dishes Template
// Price Unit options: per plate, per kg, per L, per ml, per item
export const dishesTemplate = [
  {
    'Dish Name': 'Butter Chicken',
    'Description': 'Creamy tomato-based curry',
    'Category': 'Main Course',
    'Price Unit': 'per plate',
    'Cost Price': 120,
    'Selling Price': 250,
    'Ingredients (comma separated)': 'Chicken, Butter, Tomato, Cream, Spices',
    'Quantities (comma separated)': '500, 50, 200, 100, 50',
    'Units (comma separated)': 'g, g, g, ml, g',
  },
  {
    'Dish Name': 'Basmati Rice',
    'Description': 'Long-grain basmati rice',
    'Category': 'Main Course',
    'Price Unit': 'per kg',
    'Cost Price': 80,
    'Selling Price': 150,
    'Ingredients (comma separated)': 'Basmati Rice, Water, Salt',
    'Quantities (comma separated)': '1, 2, 10',
    'Units (comma separated)': 'kg, l, g',
  },
  {
    'Dish Name': 'Payasam',
    'Description': 'Traditional milk dessert',
    'Category': 'Desserts',
    'Price Unit': 'per L',
    'Cost Price': 60,
    'Selling Price': 120,
    'Ingredients (comma separated)': 'Milk, Sugar, Vermicelli',
    'Quantities (comma separated)': '1, 200, 100',
    'Units (comma separated)': 'l, g, g',
  },
  {
    'Dish Name': 'Mineral Water Bottle',
    'Description': '500ml packaged drinking water',
    'Category': 'Drinks',
    'Price Unit': 'per item',
    'Cost Price': 10,
    'Selling Price': 20,
    'Ingredients (comma separated)': '',
    'Quantities (comma separated)': '',
    'Units (comma separated)': '',
  },
]

// Expenses Template
export const expensesTemplate = [
  {
    'Event Name': 'John Doe Wedding',
    'Category': 'DELIVERY',
    'Description': 'Delivery charges to venue',
    'Amount': 5000,
    'Date': '2024-12-25',
  },
  {
    'Event Name': 'Jane Smith Order',
    'Category': 'MANPOWER',
    'Description': 'Staff charges',
    'Amount': 3000,
    'Date': '2024-12-20',
  },
]

export function downloadTemplate(type: 'events' | 'dishes' | 'expenses') {
  let data: any[]
  let filename: string

  switch (type) {
    case 'events':
      data = eventsTemplate
      filename = 'events_template.xlsx'
      break
    case 'dishes':
      data = dishesTemplate
      filename = 'dishes_template.xlsx'
      break
    case 'expenses':
      data = expensesTemplate
      filename = 'expenses_template.xlsx'
      break
    default:
      return
  }

  // Create worksheet
  const ws = XLSX.utils.json_to_sheet(data)

  // Set column widths
  const colWidths = Object.keys(data[0]).map((key) => ({
    wch: Math.max(key.length, 20),
  }))
  ws['!cols'] = colWidths

  // Create workbook
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Template')

  // Download file
  XLSX.writeFile(wb, filename)
}

export function parseExcelFile(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        resolve(jsonData)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = (error) => reject(error)
    reader.readAsBinaryString(file)
  })
}

export function validateEventsData(data: any[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const requiredFields = [
    'Event Name',
    'Event Type',
    'Status',
    'Client Name',
    'Client Contact',
    'Location',
    'Event Date',
    'Event Time',
    'Guest Count',
    'Total Amount',
    'Paid Amount',
  ]

  data.forEach((row, index) => {
    requiredFields.forEach((field) => {
      if (!row[field]) {
        errors.push(`Row ${index + 2}: Missing ${field}`)
      }
    })

    // Validate event type
    if (row['Event Type'] && !['MAIN_EVENT', 'LOCAL_ORDER'].includes(row['Event Type'])) {
      errors.push(`Row ${index + 2}: Invalid Event Type. Must be MAIN_EVENT or LOCAL_ORDER`)
    }

    // Validate status
    if (
      row['Status'] &&
      !['UPCOMING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(row['Status'])
    ) {
      errors.push(
        `Row ${index + 2}: Invalid Status. Must be UPCOMING, IN_PROGRESS, COMPLETED, or CANCELLED`
      )
    }

    // Validate numbers
    if (row['Guest Count'] && isNaN(Number(row['Guest Count']))) {
      errors.push(`Row ${index + 2}: Guest Count must be a number`)
    }
    if (row['Total Amount'] && isNaN(Number(row['Total Amount']))) {
      errors.push(`Row ${index + 2}: Total Amount must be a number`)
    }
    if (row['Paid Amount'] && isNaN(Number(row['Paid Amount']))) {
      errors.push(`Row ${index + 2}: Paid Amount must be a number`)
    }

    // Validate date
    if (row['Event Date']) {
      const date = new Date(row['Event Date'])
      if (isNaN(date.getTime())) {
        errors.push(`Row ${index + 2}: Invalid Event Date format. Use YYYY-MM-DD`)
      }
    }
  })

  return { valid: errors.length === 0, errors }
}

const VALID_PRICE_UNITS = ['per plate', 'per kg', 'per L', 'per ml', 'per item']

export function validateDishesData(data: any[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const requiredFields = ['Dish Name', 'Category']

  data.forEach((row, index) => {
    requiredFields.forEach((field) => {
      if (!row[field]) {
        errors.push(`Row ${index + 2}: Missing ${field}`)
      }
    })

    // Validate price unit
    if (row['Price Unit'] && !VALID_PRICE_UNITS.includes(row['Price Unit'])) {
      errors.push(`Row ${index + 2}: Invalid Price Unit. Must be one of: ${VALID_PRICE_UNITS.join(', ')}`)
    }

    // Validate prices
    if (row['Cost Price'] && isNaN(Number(row['Cost Price']))) {
      errors.push(`Row ${index + 2}: Cost Price must be a number`)
    }
    if (row['Selling Price'] && isNaN(Number(row['Selling Price']))) {
      errors.push(`Row ${index + 2}: Selling Price must be a number`)
    }

    // Validate ingredients consistency (only if any ingredient column is filled)
    const ingredients = row['Ingredients (comma separated)']
      ? row['Ingredients (comma separated)'].split(',').map((s: string) => s.trim()).filter(Boolean)
      : []
    const quantities = row['Quantities (comma separated)']
      ? row['Quantities (comma separated)'].split(',').map((s: string) => s.trim()).filter(Boolean)
      : []
    const units = row['Units (comma separated)']
      ? row['Units (comma separated)'].split(',').map((s: string) => s.trim()).filter(Boolean)
      : []

    if (ingredients.length > 0 && (ingredients.length !== quantities.length || ingredients.length !== units.length)) {
      errors.push(
        `Row ${index + 2}: Ingredients, Quantities, and Units must have the same number of items`
      )
    }
  })

  return { valid: errors.length === 0, errors }
}

export function transformEventsDataForUpload(data: any[], userId: string) {
  return data.map((row) => ({
    name: row['Event Name'],
    eventType: row['Event Type'],
    status: row['Status'],
    clientName: row['Client Name'],
    clientContact: row['Client Contact'],
    location: row['Location'],
    eventDate: new Date(row['Event Date']),
    eventTime: row['Event Time'],
    guestCount: Number(row['Guest Count']),
    totalAmount: Number(row['Total Amount']),
    paidAmount: Number(row['Paid Amount']),
    createdById: userId,
  }))
}

export function downloadGroceryList(events: any[]) {
  const rows: any[] = []

  for (const event of events) {
    if (!event.dishes || event.dishes.length === 0) continue

    for (const eventDish of event.dishes) {
      const dish = eventDish.dish
      if (!dish) continue

      if (dish.ingredients && dish.ingredients.length > 0) {
        for (const ing of dish.ingredients) {
          rows.push({
            'Event': event.name,
            'Event Date': new Date(event.eventDate).toLocaleDateString('en-IN'),
            'Dish': dish.name,
            'Plates Ordered': eventDish.quantity,
            'Ingredient': ing.ingredientName,
            'Qty per Plate': Number(ing.quantity),
            'Unit': ing.unit,
            'Total Qty Needed': Number((Number(ing.quantity) * eventDish.quantity).toFixed(3)),
          })
        }
      } else {
        rows.push({
          'Event': event.name,
          'Event Date': new Date(event.eventDate).toLocaleDateString('en-IN'),
          'Dish': dish.name,
          'Plates Ordered': eventDish.quantity,
          'Ingredient': '—',
          'Qty per Plate': '',
          'Unit': '',
          'Total Qty Needed': '',
        })
      }
    }
  }

  if (rows.length === 0) return

  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = Object.keys(rows[0]).map((key) => ({ wch: Math.max(key.length + 4, 18) }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Grocery List')

  const today = new Date().toISOString().split('T')[0]
  XLSX.writeFile(wb, `grocery-list-${today}.xlsx`)
}

export function transformDishesDataForUpload(data: any[]) {
  return data.map((row) => {
    const ingredientNames = row['Ingredients (comma separated)']
      ? row['Ingredients (comma separated)'].split(',').map((i: string) => i.trim()).filter(Boolean)
      : []
    const quantities = row['Quantities (comma separated)']
      ? row['Quantities (comma separated)'].split(',').map((q: string) => parseFloat(q.trim()))
      : []
    const units = row['Units (comma separated)']
      ? row['Units (comma separated)'].split(',').map((u: string) => u.trim()).filter(Boolean)
      : []

    return {
      name: row['Dish Name'],
      description: row['Description'] || '',
      category: row['Category'],
      pricePerPlate: row['Cost Price'] ? Number(row['Cost Price']) : 0,
      priceUnit: row['Price Unit'] || 'per plate',
      sellingPricePerPlate: row['Selling Price'] ? Number(row['Selling Price']) : 0,
      ingredients: ingredientNames.map((ing: string, idx: number) => ({
        ingredientName: ing,
        quantity: quantities[idx] || 0,
        unit: units[idx] || 'g',
      })),
    }
  })
}
