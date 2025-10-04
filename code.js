/**
 * Processes job application emails in two phases:
 * 1. Finds initial confirmation emails and logs them to the 'Email Data' sheet.
 * 2. Finds specific follow-up emails (interviews, assessments) and logs them to the 'Actionable Jobs' sheet.
 * 3. Clears both sheets at the start to ensure the data is always up-to-date.
 */
function processJobEmails() {
  // --- Configuration Variables ---
  // Spreadsheet ID must be updated prior to execution.
  const SPREADSHEET_ID = '1kehm_gWNazhhOz4TJIA3Ar1ClxMmEsv5jfinlVoe7Lg'; 
  
  // Sheet 1: Configuration for initial application confirmations
  const INITIAL_SHEET_NAME = 'Email Data';
  const INITIAL_LABEL_NAME = 'Applied';
  const INITIAL_SEARCH_PHRASE = '"Thank you for applying" OR "received your application"';

  // Sheet 2: Configuration for follow-up required (interviews, assessments)
  const ACTION_SHEET_NAME = 'Actionable Jobs';
  const ACTION_LABEL_NAME = 'Action Required: Follow Up';
  
  // Defines the complex Gmail search query to locate actionable job threads.
  // Applies job-related context, scheduling terms, and rigorous exclusion filters.
  const ACTION_SEARCH_PHRASE = 
    '((interview OR assessment OR "next steps" OR "we would like to proceed") AND ' + 
    '("schedule" OR "book time" OR "find a time" OR "availability" OR "calendy"))' +
    // TIME FILTER: Includes only messages from the last 4 months.
    ' after:4m' +
    // EXCLUSION LOGIC: Filters out promotional content, non-job-related senders, and specific names/phrases.
    ' -subject:"Job Alert" -subject:"Here\'s today\'s action plan"' + 
    ' -from:github.com -from:redditmail.com -from:medium.com -from:likewise.com -from:"Planet Fitness" ' + 
    ' -"Blaine Beebe" -"Olivia Mendenall" -"Longliveproductions" -"StatonSamuels" -"Tatlyn"' +
    ' -"VBANWRKFOURNIER" -"DARA-MICHELLE S GS-09 USAF AFMC 96 FSS/FSH"' +
    ' -models'; 
  
  // Keywords used for validation and logging of action items found within the email body.
  const ACTION_KEYWORDS = [
    'interview', 
    'assessment', 
    'quiz',
    'test',
    'proceed', 
    'offer letter', 
    'background check',
    'e-signature',
    'next steps',
    'move forward', // Note: This keyword was missing a comma in the original file, fixed here.
    'schedule',
    'book time',
    'find a time',
    'availability',
    'calendy' 
  ];

  let spreadsheet;
  try {
    spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (e) {
    Logger.log(`Error: Could not open spreadsheet with ID ${SPREADSHEET_ID}. Error: ${e}`);
    return;
  }

  // --- Helper Function to Extract Sender Name from the Gmail 'From' header string. ---
  function extractSenderName(from) {
    let senderName = '';
    // Attempts to capture the quoted name first.
    const nameMatch = from.match(/^"([^"]+)"/); 
    
    if (nameMatch && nameMatch[1]) {
        senderName = nameMatch[1];
    } else {
        // Uses the content before the angle bracket '<' as a fallback for unquoted names.
        const unquotedMatch = from.match(/(.*?)\s*</);
        if (unquotedMatch && unquotedMatch[1]) {
            senderName = unquotedMatch[1].trim(); 
        } else {
            senderName = from; // Fallback to the full 'From' string
        }
    }
    return senderName;
  }
  
  // --- Sheet Initialization and Data Clearing ---
  
  // Setup and clear Sheet 1: Initial Applications
  let initialSheet = spreadsheet.getSheetByName(INITIAL_SHEET_NAME);
  if (!initialSheet) {
    initialSheet = spreadsheet.insertSheet(INITIAL_SHEET_NAME);
  } else {
    // Clears all existing data in the sheet.
    initialSheet.clearContents(); 
    Logger.log(`Cleared existing content from sheet: '${INITIAL_SHEET_NAME}'`);
  }
  // Establishes standardized column headers in the first row.
  initialSheet.getRange('A1:E1').setValues([['Date', 'Sender Name', 'Subject', 'Thread ID', 'Full From']]);
  
  // Setup and clear Sheet 2: Actionable Jobs
  let actionSheet = spreadsheet.getSheetByName(ACTION_SHEET_NAME);
  if (!actionSheet) {
    actionSheet = spreadsheet.insertSheet(ACTION_SHEET_NAME);
  } else {
    // Clears all existing data in the sheet.
    actionSheet.clearContents(); 
    Logger.log(`Cleared existing content from sheet: '${ACTION_SHEET_NAME}'`);
  }
  // Establishes standardized column headers, including 'Message Body'.
  actionSheet.getRange('A1:F1').setValues([['Date', 'Sender Name', 'Subject', 'Action Keyword Found', 'Full From', 'Message Body']]);

  // --------------------------------------------------------------------------
  
  // --- Part 1: Initial Application Confirmations ('Applied' label) ---
  
  const initialThreads = GmailApp.search(INITIAL_SEARCH_PHRASE);
  Logger.log(`Found ${initialThreads.length} initial confirmation threads.`);

  let initialLabel = GmailApp.getUserLabelByName(INITIAL_LABEL_NAME) || GmailApp.createLabel(INITIAL_LABEL_NAME);
  
  const initialDataToWrite = [];
  
  for (let i = 0; i < initialThreads.length; i++) {
    const thread = initialThreads[i];
    const messages = thread.getMessages();
    
    if (messages.length > 0) {
      const firstMessage = messages[0];
      const from = firstMessage.getFrom();

      thread.addLabel(initialLabel);
      
      initialDataToWrite.push([
        firstMessage.getDate(), 
        extractSenderName(from), 
        firstMessage.getSubject(), 
        thread.getId(),
        from
      ]);
    }
  }

  if (initialDataToWrite.length > 0) {
    // Writes data starting on the row immediately following the header row.
    initialSheet.getRange(initialSheet.getLastRow() + 1, 1, initialDataToWrite.length, initialDataToWrite[0].length).setValues(initialDataToWrite);
    Logger.log(`Logged ${initialDataToWrite.length} application confirmation entries to '${INITIAL_SHEET_NAME}'.`);
  }
  
  // --------------------------------------------------------------------------
  
  // --- Part 2: Actionable Follow-Up Emails ('Action Required' label) ---
  
  const actionThreads = GmailApp.search(ACTION_SEARCH_PHRASE);
  Logger.log(`Found ${actionThreads.length} actionable follow-up threads based on refined search.`);
  
  let actionLabel = GmailApp.getUserLabelByName(ACTION_LABEL_NAME) || GmailApp.createLabel(ACTION_LABEL_NAME);

  const actionDataToWrite = [];
  let labeledCount = 0;

  for (let i = 0; i < actionThreads.length; i++) {
    const thread = actionThreads[i];
    const messages = thread.getMessages();
    
    // Skips threads that have already been processed and labeled.
    if (thread.getLabels().map(l => l.getName()).includes(ACTION_LABEL_NAME)) {
      continue;
    }
    
    const firstMessage = messages[0];
    
    // Retrieves the plain text content for keyword validation.
    const body = firstMessage.getPlainBody().toLowerCase(); 
    let foundKeyword = null;

    // Validates message body against the list of predefined ACTION_KEYWORDS.
    for (const keyword of ACTION_KEYWORDS) {
      if (body.includes(keyword)) {
        foundKeyword = keyword;
        break; 
      }
    }

    // Final check: only proceeds if an actionable keyword is detected in the body.
    if (foundKeyword) {
      thread.addLabel(actionLabel);
      labeledCount++;

      const from = firstMessage.getFrom(); 
      // Retrieves the plain text message body
      const messageBody = firstMessage.getPlainBody(); 

      // Logs extracted data to the destination sheet.
      actionDataToWrite.push([
        firstMessage.getDate(), 
        extractSenderName(from), 
        firstMessage.getSubject(), 
        foundKeyword, 
        from,
        messageBody
      ]);
    }
  }
  
  if (actionDataToWrite.length > 0) {
    // Writes data starting on the row immediately following the header row.
    actionSheet.getRange(actionSheet.getLastRow() + 1, 1, actionDataToWrite.length, actionDataToWrite[0].length).setValues(actionDataToWrite);
    Logger.log(`Logged ${actionDataToWrite.length} actionable follow-up entries to '${ACTION_SHEET_NAME}'.`);
  }
  
  Logger.log(`Total actionable emails labeled: ${labeledCount}. Script execution complete.`);
}
