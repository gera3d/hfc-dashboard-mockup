# Agent Department Management Feature

## Overview
The Agent Department Manager allows you to quickly reassign agents to different departments directly in the Agent Performance table. Each agent's department is shown as an interactive dropdown where you can change their assignment or create new departments on the fly.

## Features

### 1. **Inline Department Dropdowns**
- Each agent row shows their department as a dropdown menu
- Click to see all available departments
- Select a new department to instantly reassign the agent
- No need to navigate away from the main table

### 2. **Create New Departments**
- Select "+ Create New Department" from any dropdown
- Enter the department name in the modal
- Agent is automatically assigned to the new department
- New department immediately available for all agents

### 3. **Real-time Updates**
- Changes apply instantly in the UI
- Charts and tables update automatically
- Visual feedback confirms the change
- No page refresh needed

### 4. **Smart Grouping**
- Agents are grouped by department in the table
- Department headers show all agents in that category
- Subtotals calculated per department
- Easy to see team structure at a glance

## How to Use

### Reassigning an Agent to an Existing Department

1. Scroll to the **Agent Performance** table (below the charts)
2. Find the agent you want to reassign
3. Click on their **Department dropdown** (in the second column)
4. Select the new department from the list
5. The agent immediately moves to the new department group
6. A confirmation message appears

**Example**: Moving "BillyH" from "IFP" to "Medicare/Small Biz"
- Click the dropdown next to BillyH's name
- Select "Medicare/Small Biz"
- BillyH now appears under the Medicare/Small Biz group

### Creating a New Department

1. Click any agent's **Department dropdown**
2. Scroll to the bottom and select **"+ Create New Department"**
3. A modal appears asking for the department name
4. Enter the name (e.g., "Life Insurance", "Claims", "Commercial Lines")
5. Click **Create Department** or press Enter
6. The agent is automatically assigned to the new department
7. The new department is now available in all dropdowns

**Example**: Creating a "Life Insurance" department
- Click any dropdown → Select "+ Create New Department"
- Type: "Life Insurance"
- Press Enter or click Create
- Agent moves to the new department
- All other agents can now be assigned to Life Insurance

## Current Departments

Based on your Google Sheets data:

### IFP (Individual & Family Plans)
- BillyH, Chris, EsmeraldaM, GaryB, JacobL, Jaxon
- JohnnyC, LoganB, MitchC, Rodney, StevenM, WendyB

### Medicare/Small Biz
- Agents handling Medicare and Small Business insurance

### Admin
- AnyaS, JohnH
- Administrative support staff

### Custom Departments
You can create additional departments as needed:
- Life Insurance
- Commercial Lines  
- Claims Processing
- Customer Service
- Sales Team
- And any others specific to your agency

## Keyboard Shortcuts

- **Click dropdown**: Open department menu
- **↑/↓ Arrow keys**: Navigate departments in dropdown
- **Enter**: Select highlighted department
- **Esc**: Cancel/close modal
- **Type in modal**: Enter new department name
- **Enter in modal**: Create department

## Visual Design

### Department Dropdown
- Clean, modern select element
- Hover effect (blue border)
- Clear visual hierarchy
- "+ Create New Department" option at bottom (blue text)

### Create Department Modal
- Centered overlay with dark backdrop
- Large input field with placeholder text
- Primary action button (blue)
- Cancel button (gray)
- Loading spinner during creation

### Table Organization
- Department header rows (gray background)
- Agent rows grouped by department
- Subtotal rows per department (blue background)
- Grand total at top (green background)
- Hover effects on agent rows

## Technical Implementation

### Current State
- ✅ Inline department dropdowns in Agent Performance table
- ✅ Create new departments on the fly
- ✅ Instant UI updates (no page refresh)
- ✅ Department grouping in tables
- ✅ Automatic chart/table recalculation
- ⏳ Google Sheets persistence (manual update required)

### How It Works

1. **User selects new department** → Dropdown onChange triggers
2. **Local state updates** → Agents and Reviews arrays updated immediately
3. **UI recalculates** → Charts and tables reflect new assignments
4. **Alert confirms** → User gets feedback about the change
5. **Manual sync** → User updates Google Sheet when ready

### Data Flow

```
AgentTable Component
  ↓ (User selects department)
handleDepartmentChange
  ↓ (agentId, departmentId)
handleAgentDepartmentUpdate (in page.tsx)
  ↓ (Updates local state)
  ├─ setAgents() → Update agent's department_id
  ├─ setReviews() → Update all reviews for that agent
  └─ Alert user → Confirm change with instructions
    ↓
UI Re-renders
  ├─ Agent moves to new department group
  ├─ Department subtotals recalculate
  ├─ Charts update (Department Comparison, etc.)
  └─ Problem Spotlight adjusts
```

### Google Sheets Integration Status
**Important Note**: Department assignment changes are displayed immediately in the dashboard but need to be manually updated in your Google Sheet for persistence. 

**To persist changes:**
1. Note which agents you reassigned
2. Open your Google Sheet
3. Update the department_id column for those agents
4. Click "Sync from Sheets" in the dashboard to reload

### Future Enhancement
Direct Google Sheets API integration is planned to automatically write changes back to your spreadsheet. This will require:
- Google Sheets API credentials with write permissions
- OAuth authentication flow
- Real-time synchronization webhook
- Conflict resolution for concurrent edits

## Data Structure

### Agent Object
```typescript
{
  id: string            // Unique agent ID (e.g., "agent-1")
  agent_key: string     // Agent key from Google Sheets (e.g., "BillyH")
  display_name: string  // Friendly display name (e.g., "Billy H.")
  department_id: string // Department ID (e.g., "dept-1")
}
```

### Department Object
```typescript
{
  id: string    // Unique department ID (e.g., "dept-1")
  name: string  // Department name (e.g., "IFP")
}
```

## Benefits for Your Insurance Agency

### 1. **Organizational Clarity**
- Know exactly which agents handle which insurance products
- Identify coverage gaps in specific departments
- Plan staffing and training needs

### 2. **Performance Tracking**
- Compare agent performance within departments
- Identify top performers in each insurance line
- Track which products need more support

### 3. **Training & Development**
- Group agents by department for targeted training
- Identify cross-training opportunities
- Track career progression paths

### 4. **Operational Efficiency**
- Quickly route customer inquiries to the right department
- Balance workload across teams
- Improve customer service response times

## Tips for Best Use

1. **Keep Assignments Current**: Update agent departments when roles change
2. **Use Meaningful Names**: Department names should match your internal terminology
3. **Regular Reviews**: Periodically review agent assignments to ensure accuracy
4. **Cross-Training**: Consider temporary assignments for cross-trained agents

## Next Steps

### Immediate Actions
1. Review the current agent-department assignments
2. Identify any unassigned agents
3. Plan any department reassignments needed
4. Update your Google Sheet to match desired assignments

### Future Improvements
- Direct Google Sheets write-back capability
- Department performance comparisons in charts
- Agent transfer history tracking
- Bulk assignment operations
- Department capacity planning tools

## Support

If you need to add new departments or modify the structure:
1. Update `src/data/departments.json` with new departments
2. Update your Google Sheets with matching department IDs
3. Re-sync data using the "Sync from Sheets" button

---

**Last Updated**: October 9, 2025  
**Feature Status**: ✅ Active (View/Plan Mode) | ⏳ Google Sheets Sync (Coming Soon)
