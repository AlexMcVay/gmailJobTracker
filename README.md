# Job Application Email Manager

![Google Apps Script](https://img.shields.io/badge/Platform-Google%20Apps%20Script-blue?logo=google)
![Automation](https://img.shields.io/badge/Automation-Enabled-brightgreen)
![Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-Personal-lightgrey)

A Google Apps Script that automatically manages and organizes job application emails from Gmail into a structured Google Sheet for efficient tracking and follow-up.

---

## Overview

This script processes the Gmail inbox in two main phases:

1. **Initial Confirmation** – Logs general "application received" messages to the `Email Data` sheet.  
2. **Action Required** – Identifies and logs critical next-step emails (such as interviews, assessments, or offers) to the `Actionable Jobs` sheet.

---

## Key Features

### Data Freshness
Automatically clears the contents of both target sheets before each run, ensuring the most recent and relevant data is always displayed.

### Intelligent Filtering
Uses a refined `ACTION_SEARCH_PHRASE` for precision filtering:
- Scans only emails from the last four months  
- Excludes unwanted senders (`github.com`, etc.) and subjects  
- Captures only application-related messages

### Detailed Logging
The `Actionable Jobs` sheet records:
- Date  
- Sender name  
- Subject  
- Keyword that triggered the match  
- Full message body for quick reference

---

## Setup and Configuration

Before running, configure the Google Sheet connection.

### 1. Create Spreadsheet
 Go to Google Sheets
 Create a new worksheet named "Job tracker from email"
 Create one sheet named "Email Data"
 Create another sheet named "Actionable items"
 

### 2. Add this script 

Use Alt+/ to search for "Apps Script"
Paste the code from this project

### 3. Personalize everything
In your `job_processor.gs` file, replace the following placeholders:
 - `SPREADSHEET_ID` with your Google Sheet ID. It is in the URL https://docs.google.com/spreadsheets/d/
<YOUR_SHEET_ID>/edit
 - `INITIAL_SEARCH_PHRASE`  Adjust this to whatever job recruiters send you directly after you apply
 - `ACTION_SEARCH_PHRASE` You can edit the included keywords, time filters, and exclusions to match your preferred criteria. This query supports full Gmail search syntax — you can adjust sender exclusions, add new phrases, or extend the time window
 - `ACTION_KEYWORDS` Defines which keywords the script looks for inside the email body to confirm an actionable message. You can modify or extend this list to include other trigger phrases you’d like the script to recognize, such as “technical challenge,” “coding test,” or “hiring update.”

### 3. Run to ensure it works

- Click the Run button and give it some time to work.
- The first time you run this, you will be prompted to give the program permissions. This must be done to run the program.
- The execution Log should automatically show you when it is done. This may take some time if there are a lot of emails to sort through.
- Be sure to check the worksheet when it's done.

### (Optional) 4. Schedual Triggers

- Click on the clock icon in the AppScript window on the left.
- Click the blue "+ Add Trigger" button on the bottom right.
- Set the "Choose which function to run" setting to "processJobEmails"
- Set the "Choose which deployment should run" setting to "Head"
- Set the "Select event source"  setting to "Time Driven"
- -  This will create another setting labeled "Select type of time based trigger" Change this and the settings listed below it to run as often as you like.
- Click the Blue "Save" button on the bottom right.
