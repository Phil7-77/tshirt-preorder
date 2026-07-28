/**
 * Chalaph T-Shirt Pre-order — Google Apps Script backend
 *
 * SETUP
 * 1. Create a Google Sheet named e.g. "Chalaph T-Shirt Pre-orders"
 * 2. Extensions → Apps Script → paste this entire file
 * 3. Set SCRIPT_API_KEY below to a long random secret (same as VITE_SHEETS_API_KEY)
 * 4. Run initializeSheet once (Run → initializeSheet) and approve permissions
 * 5. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy the Web app URL into VITE_SHEETS_API_URL
 */

var SCRIPT_API_KEY = 'CHANGE_ME_TO_A_LONG_SECRET'
var SHEET_NAME = 'Orders'
var PAYMENT_FOLDER_NAME = 'Chalaph T-Shirt Payments'

function initializeSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var sheet = ss.getSheetByName(SHEET_NAME)
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME)
  }
  sheet.clear()
  sheet.appendRow([
    'id',
    'local',
    'name',
    'phone',
    'color',
    'size',
    'paymentStatus',
    'paymentFileId',
    'paymentUrl',
    'createdAt',
    'updatedAt',
  ])
  sheet.setFrozenRows(1)
  getOrCreatePaymentFolder_()
}

function doGet(e) {
  return jsonOutput_({ ok: true, message: 'Chalaph T-Shirt API. Use POST with action list|create|update|delete.' })
}

function doPost(e) {
  try {
    var body = parseBody_(e)
    if (!body || body.apiKey !== SCRIPT_API_KEY) {
      return jsonOutput_({ ok: false, error: 'Unauthorized' })
    }

    var action = body.action
    if (action === 'list') return jsonOutput_({ ok: true, orders: listOrders_() })
    if (action === 'create') return jsonOutput_({ ok: true, order: createOrder_(body.order) })
    if (action === 'update') return jsonOutput_({ ok: true, order: updateOrder_(body.order) })
    if (action === 'delete') {
      deleteOrder_(body.id)
      return jsonOutput_({ ok: true })
    }

    return jsonOutput_({ ok: false, error: 'Unknown action' })
  } catch (err) {
    return jsonOutput_({ ok: false, error: String(err && err.message ? err.message : err) })
  }
}

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) return null
  return JSON.parse(e.postData.contents)
}

function jsonOutput_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  )
}

function getSheet_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME)
  if (!sheet) {
    throw new Error('Orders sheet missing. Run initializeSheet() first.')
  }
  return sheet
}

function listOrders_() {
  var sheet = getSheet_()
  var values = sheet.getDataRange().getValues()
  if (values.length < 2) return []

  var orders = []
  for (var i = 1; i < values.length; i++) {
    var row = values[i]
    if (!row[0]) continue
    orders.push(rowToOrder_(row))
  }

  orders.sort(function (a, b) {
    return String(b.updatedAt).localeCompare(String(a.updatedAt))
  })
  return orders
}

function createOrder_(input) {
  if (!input) throw new Error('Missing order')
  var id = input.id || Utilities.getUuid()
  var now = new Date().toISOString()
  var payment = upsertPayment_(id, input.paymentDataUrl || '', '')

  var order = {
    id: id,
    local: input.local || '',
    name: String(input.name || '').trim(),
    phone: String(input.phone || '').trim(),
    color: input.color || '',
    size: input.size || '',
    paymentDataUrl: payment.paymentUrl,
    createdAt: input.createdAt || now,
    updatedAt: now,
  }

  if (!order.name || !order.phone) throw new Error('Name and phone are required')

  getSheet_().appendRow([
    order.id,
    order.local,
    order.name,
    order.phone,
    order.color,
    order.size,
    payment.paymentStatus,
    payment.paymentFileId,
    payment.paymentUrl,
    order.createdAt,
    order.updatedAt,
  ])

  return order
}

function updateOrder_(input) {
  if (!input || !input.id) throw new Error('Missing order id')
  var sheet = getSheet_()
  var values = sheet.getDataRange().getValues()
  var rowIndex = findRowIndex_(values, input.id)
  if (rowIndex < 0) throw new Error('Order not found')

  var existing = rowToOrder_(values[rowIndex])
  var existingFileId = String(values[rowIndex][7] || '')
  var payment = upsertPayment_(input.id, input.paymentDataUrl || '', existingFileId)
  var now = new Date().toISOString()

  var order = {
    id: input.id,
    local: input.local || existing.local,
    name: String(input.name || '').trim() || existing.name,
    phone: String(input.phone || '').trim() || existing.phone,
    color: input.color || existing.color,
    size: input.size || existing.size,
    paymentDataUrl: payment.paymentUrl,
    createdAt: existing.createdAt,
    updatedAt: now,
  }

  sheet.getRange(rowIndex + 1, 1, 1, 11).setValues([
    [
      order.id,
      order.local,
      order.name,
      order.phone,
      order.color,
      order.size,
      payment.paymentStatus,
      payment.paymentFileId,
      payment.paymentUrl,
      order.createdAt,
      order.updatedAt,
    ],
  ])

  return order
}

function deleteOrder_(id) {
  if (!id) throw new Error('Missing id')
  var sheet = getSheet_()
  var values = sheet.getDataRange().getValues()
  var rowIndex = findRowIndex_(values, id)
  if (rowIndex < 0) throw new Error('Order not found')

  var fileId = String(values[rowIndex][7] || '')
  if (fileId) {
    try {
      DriveApp.getFileById(fileId).setTrashed(true)
    } catch (ignore) {}
  }

  sheet.deleteRow(rowIndex + 1)
}

function findRowIndex_(values, id) {
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) return i
  }
  return -1
}

function rowToOrder_(row) {
  var fileId = String(row[7] || '')
  var paymentUrl = String(row[8] || '')
  if (fileId) {
    paymentUrl = 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w1200'
  }
  return {
    id: String(row[0] || ''),
    local: String(row[1] || ''),
    name: String(row[2] || ''),
    phone: String(row[3] || ''),
    color: String(row[4] || ''),
    size: String(row[5] || ''),
    paymentDataUrl: paymentUrl,
    createdAt: String(row[9] || ''),
    updatedAt: String(row[10] || ''),
  }
}

function upsertPayment_(orderId, paymentDataUrl, existingFileId) {
  if (!paymentDataUrl) {
    if (existingFileId) {
      try {
        DriveApp.getFileById(existingFileId).setTrashed(true)
      } catch (ignore) {}
    }
    return { paymentStatus: 'Unpaid', paymentFileId: '', paymentUrl: '' }
  }

  if (/^https?:\/\//i.test(paymentDataUrl)) {
    var fileId = existingFileId
    var idMatch = paymentDataUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/)
    if (idMatch && idMatch[1]) fileId = idMatch[1]
    return {
      paymentStatus: 'Paid',
      paymentFileId: fileId || '',
      paymentUrl: fileId
        ? 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w1200'
        : paymentDataUrl,
    }
  }

  if (paymentDataUrl.indexOf('data:') !== 0) {
    throw new Error('Invalid payment image')
  }

  if (existingFileId) {
    try {
      DriveApp.getFileById(existingFileId).setTrashed(true)
    } catch (ignore) {}
  }

  var match = paymentDataUrl.match(/^data:([^;]+);base64,(.+)$/)
  if (!match) throw new Error('Invalid payment data URL')

  var contentType = match[1]
  var bytes = Utilities.base64Decode(match[2])
  var blob = Utilities.newBlob(bytes, contentType, 'payment-' + orderId + '.jpg')
  var file = getOrCreatePaymentFolder_().createFile(blob)
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)

  return {
    paymentStatus: 'Paid',
    paymentFileId: file.getId(),
    paymentUrl: 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w1200',
  }
}

function getOrCreatePaymentFolder_() {
  var folders = DriveApp.getFoldersByName(PAYMENT_FOLDER_NAME)
  if (folders.hasNext()) return folders.next()
  return DriveApp.createFolder(PAYMENT_FOLDER_NAME)
}
