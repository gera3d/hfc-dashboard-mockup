// Sample reviews data - this will be replaced with real data from Google Sheets
export const sampleReviews = [
  // Recent reviews (last 7 days)
  {
    id: "rev-1",
    ext_review_id: "ext-001",
    agent_id: "agent-1",
    department_id: "dept-1",
    rating: 5,
    comment: "Greg was extremely helpful and answered all my questions about the policy. Great service!",
    review_ts: "2025-09-25T14:30:00-07:00",
    source: "Website Contact Form"
  },
  {
    id: "rev-2", 
    ext_review_id: "ext-002",
    agent_id: "agent-2",
    department_id: "dept-1",
    rating: 4,
    comment: "Sarah provided good information, though it took a while to get through.",
    review_ts: "2025-09-25T10:15:00-07:00",
    source: "Phone Survey"
  },
  {
    id: "rev-3",
    ext_review_id: "ext-003", 
    agent_id: "agent-3",
    department_id: "dept-2",
    rating: 5,
    comment: "Mike explained the Medicare options clearly. Very satisfied with the service.",
    review_ts: "2025-09-24T16:45:00-07:00",
    source: "Google Reviews"
  },
  {
    id: "rev-4",
    ext_review_id: "ext-004",
    agent_id: "agent-1",
    department_id: "dept-1", 
    rating: 3,
    comment: "Service was okay but I expected faster response times.",
    review_ts: "2025-09-24T11:20:00-07:00",
    source: "Email Campaign"
  },
  {
    id: "rev-5",
    ext_review_id: "ext-005",
    agent_id: "agent-4",
    department_id: "dept-2",
    rating: 5,
    comment: "Lisa was fantastic! She helped me understand all the Medicare supplement options.",
    review_ts: "2025-09-23T13:10:00-07:00",
    source: "Referral"
  },
  {
    id: "rev-6",
    ext_review_id: "ext-006",
    agent_id: "agent-5",
    department_id: "dept-3",
    rating: 4,
    comment: "John provided solid advice for our small business insurance needs.",
    review_ts: "2025-09-23T09:30:00-07:00",
    source: "Website Contact Form"
  },
  {
    id: "rev-7",
    ext_review_id: "ext-007",
    agent_id: "agent-2",
    department_id: "dept-1",
    rating: 2,
    comment: "Had to call multiple times to get my questions answered. Not very satisfied.",
    review_ts: "2025-09-22T15:45:00-07:00",
    source: "Phone Survey"
  },
  {
    id: "rev-8",
    ext_review_id: "ext-008",
    agent_id: "agent-6",
    department_id: "dept-3",
    rating: 5,
    comment: "Amy went above and beyond to find the right coverage for our team. Excellent!",
    review_ts: "2025-09-21T14:20:00-07:00",
    source: "Social Media"
  },
  {
    id: "rev-9",
    ext_review_id: "ext-009",
    agent_id: "agent-7",
    department_id: "dept-4",
    rating: 4,
    comment: "Tom handled our admin request efficiently. Good communication.",
    review_ts: "2025-09-20T11:15:00-07:00",
    source: "Email Campaign"
  },
  {
    id: "rev-10",
    ext_review_id: "ext-010",
    agent_id: "agent-8",
    department_id: "dept-4",
    rating: 1,
    comment: "Very disappointed with the service. Jen seemed unprepared and couldn't answer basic questions.",
    review_ts: "2025-09-19T16:30:00-07:00",
    source: "Website Contact Form"
  },

  // This month (September 2025) - additional reviews
  {
    id: "rev-11",
    ext_review_id: "ext-011",
    agent_id: "agent-1",
    department_id: "dept-1",
    rating: 5,
    comment: "Outstanding service from Greg. He made the whole process easy to understand.",
    review_ts: "2025-09-15T13:45:00-07:00",
    source: "Google Reviews"
  },
  {
    id: "rev-12",
    ext_review_id: "ext-012",
    agent_id: "agent-3",
    department_id: "dept-2",
    rating: 4,
    comment: "Mike was knowledgeable about Medicare plans. Appreciated his patience.",
    review_ts: "2025-09-12T10:30:00-07:00",
    source: "Phone Survey"
  },
  {
    id: "rev-13",
    ext_review_id: "ext-013",
    agent_id: "agent-4",
    department_id: "dept-2",
    rating: 5,
    comment: "Lisa provided excellent guidance on Medicare Advantage options. Highly recommend!",
    review_ts: "2025-09-10T15:20:00-07:00",
    source: "Referral"
  },
  {
    id: "rev-14",
    ext_review_id: "ext-014",
    agent_id: "agent-5",
    department_id: "dept-3",
    rating: 3,
    comment: "John's advice was helpful but the follow-up could have been better.",
    review_ts: "2025-09-08T12:10:00-07:00",
    source: "Website Contact Form"
  },
  {
    id: "rev-15",
    ext_review_id: "ext-015",
    agent_id: "agent-6",
    department_id: "dept-3",
    rating: 5,
    comment: "Amy found us great coverage at a competitive rate. Very professional.",
    review_ts: "2025-09-05T14:15:00-07:00",
    source: "Email Campaign"
  },

  // Earlier this year (for "This year" filter)
  {
    id: "rev-16",
    ext_review_id: "ext-016",
    agent_id: "agent-2",
    department_id: "dept-1",
    rating: 4,
    comment: "Sarah was helpful in explaining the different plan options available.",
    review_ts: "2025-08-28T11:30:00-07:00",
    source: "Phone Survey"
  },
  {
    id: "rev-17",
    ext_review_id: "ext-017",
    agent_id: "agent-1",
    department_id: "dept-1",
    rating: 5,
    comment: "Greg's expertise saved us money on our policy. Fantastic agent!",
    review_ts: "2025-08-22T16:45:00-07:00",
    source: "Google Reviews"
  },
  {
    id: "rev-18",
    ext_review_id: "ext-018",
    agent_id: "agent-3",
    department_id: "dept-2",
    rating: 2,
    comment: "Mike seemed rushed and didn't take time to explain the details properly.",
    review_ts: "2025-08-15T09:20:00-07:00",
    source: "Website Contact Form"
  },
  {
    id: "rev-19",
    ext_review_id: "ext-019",
    agent_id: "agent-7",
    department_id: "dept-4",
    rating: 5,
    comment: "Tom processed our administrative changes quickly and accurately.",
    review_ts: "2025-07-30T13:15:00-07:00",
    source: "Social Media"
  },
  {
    id: "rev-20",
    ext_review_id: "ext-020",
    agent_id: "agent-8",
    department_id: "dept-4",
    rating: 3,
    comment: "Jen was adequate but didn't go the extra mile like I expected.",
    review_ts: "2025-07-20T10:45:00-07:00",
    source: "Email Campaign"
  },
  {
    id: "rev-21",
    ext_review_id: "ext-021",
    agent_id: "agent-4",
    department_id: "dept-2",
    rating: 5,
    comment: "Lisa's knowledge of Medicare is impressive. She found the perfect plan for me.",
    review_ts: "2025-06-25T14:30:00-07:00",
    source: "Referral"
  },
  {
    id: "rev-22",
    ext_review_id: "ext-022",
    agent_id: "agent-5",
    department_id: "dept-3",
    rating: 4,
    comment: "John provided good small business insurance options. Professional service.",
    review_ts: "2025-06-18T11:20:00-07:00",
    source: "Phone Survey"
  },
  {
    id: "rev-23",
    ext_review_id: "ext-023",
    agent_id: "agent-6",
    department_id: "dept-3",
    rating: 5,
    comment: "Amy went out of her way to ensure we got the best rates. Exceptional service!",
    review_ts: "2025-05-30T15:10:00-07:00",
    source: "Website Contact Form"
  },
  {
    id: "rev-24",
    ext_review_id: "ext-024",
    agent_id: "agent-2",
    department_id: "dept-1",
    rating: 1,
    comment: "Sarah was unprofessional and didn't seem to know the products well. Very disappointing.",
    review_ts: "2025-05-15T12:45:00-07:00",
    source: "Google Reviews"
  },
  {
    id: "rev-25",
    ext_review_id: "ext-025",
    agent_id: "agent-1",
    department_id: "dept-1",
    rating: 5,
    comment: "Greg consistently delivers outstanding service. He's our go-to agent for all insurance needs.",
    review_ts: "2025-04-22T13:30:00-07:00",
    source: "Referral"
  }
];