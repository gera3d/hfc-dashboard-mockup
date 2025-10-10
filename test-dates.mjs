import { loadReviews } from './src/data/dataService.ts';

loadReviews().then(reviews => {
  console.log('Total reviews loaded:', reviews.length);
  
  // Sample first 5 reviews
  const sample = reviews.slice(0, 5);
  console.log('\nFirst 5 review dates:');
  sample.forEach(r => {
    const date = new Date(r.review_ts);
    console.log(`  - ${r.review_ts} | Year: ${date.getFullYear()} | Agent: ${r.agent_name}`);
  });
  
  // Count by year
  const from2025 = reviews.filter(r => {
    const date = new Date(r.review_ts);
    return date.getFullYear() === 2025;
  });
  
  const from2024 = reviews.filter(r => {
    const date = new Date(r.review_ts);
    return date.getFullYear() === 2024;
  });
  
  console.log(`\nReviews from 2025: ${from2025.length}`);
  console.log(`Reviews from 2024: ${from2024.length}`);
  console.log(`Other years: ${reviews.length - from2025.length - from2024.length}`);
});
