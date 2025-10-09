# Google Sheets Integration Setup

This guide will help you connect your Google Sheets data to the HFC Reviews Dashboard.

## 📋 Prerequisites

Your Google Sheet should have columns that match these expected fields:

### Required Columns:
- `review_id` - Unique identifier for each review
- `agent_id` - Agent identifier
- `agent_name` - Agent display name
- `department_id` - Department identifier  
- `department_name` - Department name
- `rating` - Star rating (1-5)
- `review_date` - Date of the review
- `comment` - Review comment/text
- `source` - Review source (e.g., "Google", "Yelp", etc.)

### Optional Columns:
- `ext_review_id` - External review ID
- `agent_key` - Agent key/username

## 🔧 Setup Steps

### Step 1: Enable Google Sheets API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

### Step 2: Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy the API key (you'll need it for Step 4)
4. **Important**: Restrict the API key:
   - Click on the API key you just created
   - Under "API restrictions", select "Restrict key"
   - Choose "Google Sheets API"
   - Under "Website restrictions", add your domain(s)

### Step 3: Make Your Sheet Public (Read-Only)

Your Google Sheet needs to be accessible via the API:

**Option A: Public Sheet (Easiest)**
1. Open your Google Sheet
2. Click "Share" in the top right
3. Change permissions to "Anyone with the link" > "Viewer"

**Option B: Service Account (More Secure)**
- Create a service account in Google Cloud Console
- Share your sheet with the service account email
- Use service account credentials instead of API key

### Step 4: Configure the Dashboard

1. Copy the example environment file:
   ```bash
   copy .env.local.example .env.local
   ```

2. Edit `.env.local` and add your API key:
   ```
   NEXT_PUBLIC_GOOGLE_SHEETS_API_KEY=your_actual_api_key_here
   ```

3. Your spreadsheet ID is already configured: `10ooffH9zMhvadCs0LlJXTWti0U2Vm38s7quYfeZGOe4`

### Step 5: Test the Integration

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:3000
3. Check the browser console for messages like:
   - "Loaded reviews from Google Sheets: X"
   - Or warning messages if there are issues

## 🔍 Troubleshooting

### Common Issues:

**"API key not found"**
- Make sure `.env.local` exists and has the correct API key
- Restart the development server after adding the API key

**"No data found in the spreadsheet"**
- Check that your sheet has data and is publicly accessible
- Verify column names match the expected format

**"Google Sheets API error: 403"**
- Your API key might not have permission
- Make sure the Google Sheets API is enabled
- Check API key restrictions

**"Google Sheets API error: 400"**
- The spreadsheet ID or sheet name might be incorrect
- Make sure the sheet exists and is accessible

### Debug Mode:

Add this to your `.env.local` to see detailed logs:
```
NEXT_PUBLIC_DEBUG_SHEETS=true
```

## 📊 Data Format Example

Your Google Sheet should look like this:

| review_id | agent_id | agent_name | department_id | department_name | rating | review_date | comment | source |
|-----------|----------|------------|---------------|-----------------|--------|-------------|---------|--------|
| rev-001 | agent-1 | John Smith | dept-1 | Sales | 5 | 2024-01-15 | Great service! | Google |
| rev-002 | agent-2 | Jane Doe | dept-2 | Support | 4 | 2024-01-16 | Very helpful | Yelp |

## 🔄 Data Refresh

- Data is cached for 5 minutes to improve performance
- The dashboard will automatically fetch fresh data when the cache expires
- You can force a refresh by reloading the page

## 📞 Need Help?

If you're having trouble with the setup, here are some things to check:

1. **Sheet URL**: Your current sheet URL is correct
2. **Permissions**: Make sure the sheet is publicly readable
3. **API Key**: Verify it's properly set in `.env.local`
4. **Column Names**: Check they match the expected format (case-insensitive)
5. **Data Types**: Rating should be numbers 1-5, dates should be in a standard format