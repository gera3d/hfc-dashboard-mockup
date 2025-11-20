# Google Sheets API Setup Guide

This guide will help you set up Google Sheets API access for faster, paginated data downloads.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project" or select an existing project
3. Note your Project ID

## Step 2: Enable Google Sheets API

1. In the Cloud Console, go to **APIs & Services > Library**
2. Search for "Google Sheets API"
3. Click **Enable**

## Step 3: Create Service Account

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > Service Account**
3. Enter a name (e.g., "HFC Dashboard Sheets Reader")
4. Click **Create and Continue**
5. Skip optional steps and click **Done**

## Step 4: Generate Service Account Key

1. In the **Credentials** page, find your service account
2. Click on the service account email
3. Go to the **Keys** tab
4. Click **Add Key > Create new key**
5. Choose **JSON** format
6. Click **Create** - this will download a JSON file

## Step 5: Save Credentials

1. Rename the downloaded file to `google-sheets-credentials.json`
2. Move it to your project root: `hfc-dashboard-mockup/google-sheets-credentials.json`
3. **IMPORTANT:** This file is already in `.gitignore` - never commit it to git!

## Step 6: Share Your Google Sheet

1. Open your Google Sheet
2. Click **Share**
3. Add the service account email (from the JSON file, looks like `xxx@xxx.iam.gserviceaccount.com`)
4. Give it **Viewer** access
5. Click **Done**

## Step 7: Get Your Sheet ID

Your Sheet ID is in the URL:
```
https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
```

Copy the SHEET_ID part.

## Step 8: Configure Environment Variables

Create or update `.env.local` in your project root:

```env
GOOGLE_SHEET_ID=your_sheet_id_here
GOOGLE_APPLICATION_CREDENTIALS=./google-sheets-credentials.json
```

## Step 9: Restart Your Development Server

```bash
npm run dev
```

## Verification

After setup, try syncing from Settings page. You should see:
- Faster download speeds (chunks of 1000 rows)
- Better progress updates (20%, 40%, 60%, etc.)
- No timeouts even with 20,000+ rows

## Troubleshooting

**"Permission denied"**: Make sure you shared the sheet with the service account email

**"Credentials not found"**: Check that `google-sheets-credentials.json` is in the project root

**"API not enabled"**: Go back to Cloud Console and enable Google Sheets API

## Current Sheet Information

- Current Sheet ID (from published CSV): Extract from your CSV URL
- Estimated rows: ~22,600
- File size: ~13MB
- With pagination: Should complete in 30-60 seconds instead of 3+ minutes
