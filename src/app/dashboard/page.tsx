import type { Metadata } from 'next';
import Metrics from './analytics/components/Metrics';
import Monthly from './analytics/components/Monthly';
import TopEvents from './analytics/components/TopProducts';
import Leaderboard from './analytics/components/Leaderboard';
import RecentCheckIns from './analytics/components/RecentCheckIns';

export const metadata: Metadata = {
  title: 'Night Walk — Dashboard',
  description: 'Night Walk admin dashboard',
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Overview cards */}
      <Metrics />

      {/* Monthly activity chart */}
      <Monthly />

      {/* Three column row */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-5">
          <TopEvents />
        </div>
        <div className="col-span-12 xl:col-span-4">
          <Leaderboard />
        </div>
        <div className="col-span-12 xl:col-span-3">
          <RecentCheckIns />
        </div>
      </div>
    </div>
  );
}
