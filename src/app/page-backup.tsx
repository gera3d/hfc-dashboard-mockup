import LoginPage from '@/components/LoginPage';

/**
 * Lightweight wrapper that keeps the legacy dashboard route alive while
 * delegating to the new LoginPage experience. The previous full dashboard
 * implementation now lives in knowledge-base/page-backup-legacy.txt for
 * historical reference and to keep the build free from parse issues.
 */
export default function HomePage() {
  return <LoginPage />;
}
