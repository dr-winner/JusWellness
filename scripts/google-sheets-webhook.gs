/**
 * Jus Wellness — Google Sheets Webhook
 * 
 * SETUP:
 * 1. Create a Google Sheet with 3 tabs: "Orders", "Wholesale", "Reviews"
 * 2. Add headers to each tab (Row 1):
 * 
 *    Orders tab:
 *    Timestamp | Customer Name | Phone | Address | Items Summary | Subtotal | Subscription Savings | Total
 * 
 *    Wholesale tab:
 *    Timestamp | Business Name | Contact Name | Phone | Email | Location | Business Type | Products | Weekly Volume | Message
 * 
 *    Reviews tab:
 *    Timestamp | Customer Name | Product | Rating | Review
 * 
 * 3. Open Extensions → Apps Script
 * 4. Replace the default code with this entire file
 * 5. Click Deploy → New deployment
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy the deployment URL
 * 7. Add to your .env.local:
 *    NEXT_PUBLIC_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_ID/exec
 */

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var sheetName = payload.sheet;
    var data = payload.data;
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return ContentService.createTextOutput(
        JSON.stringify({ error: "Sheet not found: " + sheetName })
      ).setMimeType(ContentService.MimeType.JSON);
    }
    
    var row = [];
    
    switch (sheetName) {
      case "Orders":
        row = [
          data.timestamp || new Date().toISOString(),
          data.customerName || "",
          data.customerPhone || "",
          data.customerAddress || "Pickup",
          data.itemsSummary || "",
          data.subtotal || 0,
          data.subscriptionSavings || 0,
          data.total || 0,
        ];
        break;
        
      case "Wholesale":
        row = [
          data.timestamp || new Date().toISOString(),
          data.businessName || "",
          data.contactName || "",
          data.phone || "",
          data.email || "",
          data.location || "",
          data.businessType || "",
          data.products || "",
          data.weeklyVolume || "",
          data.message || "",
        ];
        break;
        
      case "Reviews":
        row = [
          data.timestamp || new Date().toISOString(),
          data.customerName || "",
          data.product || "",
          data.rating || 0,
          data.text || "",
        ];
        break;
        
      default:
        return ContentService.createTextOutput(
          JSON.stringify({ error: "Unknown sheet: " + sheetName })
        ).setMimeType(ContentService.MimeType.JSON);
    }
    
    sheet.appendRow(row);
    
    return ContentService.createTextOutput(
      JSON.stringify({ success: true, sheet: sheetName })
    ).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// Allow GET for testing — returns a simple status
function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ status: "ok", app: "Jus Wellness Sheets Webhook" })
  ).setMimeType(ContentService.MimeType.JSON);
}
