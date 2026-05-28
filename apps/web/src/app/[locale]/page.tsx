import {AppShell} from '@/components/layout/AppShell';
import {DashboardOverview} from '@/components/dashboard/DashboardOverview';

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardOverview />
    </AppShell>
  );
}
