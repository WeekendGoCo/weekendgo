import { Users, Hotel, FileText, Activity } from "lucide-react";

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Hotels" value="1,245" icon={<Hotel />} trend="+12%" trendUp={true} />
        <StatCard title="Active Contracts" value="48" icon={<FileText />} trend="+5%" trendUp={true} />
        <StatCard title="Total Users" value="8,902" icon={<Users />} trend="+18%" trendUp={true} />
        <StatCard title="API Requests" value="1.2M" icon={<Activity />} trend="-2%" trendUp={false} />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Sync Activity</h2>
        <div className="space-y-4">
          <ActivityRow status="Success" provider="WebBeds" message="Synced 450 prices" time="2 mins ago" />
          <ActivityRow status="Success" provider="Booking.com" message="Updated metadata for 120 hotels" time="15 mins ago" />
          <ActivityRow status="Warning" provider="TBO" message="Rate limit approaching" time="1 hour ago" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, trendUp }: { title: string, value: string, icon: React.ReactNode, trend: string, trendUp: boolean }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>
          <h3 className="text-3xl font-bold mt-2 text-slate-900">{value}</h3>
        </div>
        <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
          {icon}
        </div>
      </div>
      <div className={`mt-4 text-sm font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
        {trend} from last month
      </div>
    </div>
  );
}

function ActivityRow({ status, provider, message, time }: { status: string, provider: string, message: string, time: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
      <div className="flex items-center gap-4">
        <div className={`w-2 h-2 rounded-full ${status === 'Success' ? 'bg-green-500' : 'bg-amber-500'}`} />
        <div>
          <p className="font-medium text-slate-900">{provider}</p>
          <p className="text-sm text-slate-500">{message}</p>
        </div>
      </div>
      <div className="text-sm text-slate-500">{time}</div>
    </div>
  );
}
