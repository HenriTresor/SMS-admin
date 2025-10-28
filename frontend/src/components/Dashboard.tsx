import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './Card';
import Button from './Button';
import Input from './Input';
import api from '../utils/api';
import { API_ENDPOINTS } from '../constants';

interface User {
  id: string;
  email: string;
  balance: number;
  createdAt: string;
  devices: Device[];
}

interface Device {
  id: string;
  deviceId: string;
  isVerified: boolean;
  createdAt: string;
  user: User;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  createdAt: string;
  user: User;
}

interface Stats {
  totalUsers: number;
  totalDevices: number;
  verifiedDevices: number;
  totalTransactions: number;
  totalBalance: number;
  recentTransactions: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalDevices: 0,
    verifiedDevices: 0,
    totalTransactions: 0,
    totalBalance: 0,
    recentTransactions: 0,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'devices' | 'transactions'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [deviceFilter, setDeviceFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const navigate = useNavigate();

  console.log('Dashboard component mounted, token:', localStorage.getItem('adminToken'));

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterData();
  }, [users, devices, transactions, searchTerm, deviceFilter]);

  const fetchData = async () => {
    try {
      console.log('Fetching dashboard data...');
      const [usersRes, devicesRes, transactionsRes] = await Promise.all([
        api.get(API_ENDPOINTS.USERS),
        api.get(API_ENDPOINTS.DEVICES),
        api.get(API_ENDPOINTS.TRANSACTIONS),
      ]);

      console.log('API responses:', { usersRes, devicesRes, transactionsRes });

      const usersData = usersRes.data.users || [];
      const devicesData = devicesRes.data.devices || [];
      const transactionsData = transactionsRes.data.transactions || [];

      console.log('Parsed data:', { usersData: usersData.length, devicesData: devicesData.length, transactionsData: transactionsData.length });

      setUsers(usersData);
      setDevices(devicesData);
      setTransactions(transactionsData);

      // Calculate statistics
      const stats: Stats = {
        totalUsers: usersData.length,
        totalDevices: devicesData.length,
        verifiedDevices: devicesData.filter((d: Device) => d.isVerified).length,
        totalTransactions: transactionsData.length,
        totalBalance: usersData.reduce((sum: number, user: User) => sum + user.balance, 0),
        recentTransactions: transactionsData.filter((t: Transaction) =>
          new Date(t.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length,
      };
      setStats(stats);
      console.log('Stats calculated:', stats);

    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    // Filter users
    const filteredUsers = users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filteredUsers);

    // Filter devices
    let filteredDevices = devices.filter(device =>
      device.deviceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (deviceFilter !== 'all') {
      filteredDevices = filteredDevices.filter(device =>
        deviceFilter === 'verified' ? device.isVerified : !device.isVerified
      );
    }
    setFilteredDevices(filteredDevices);

    // Filter transactions
    const filteredTransactions = transactions.filter(transaction =>
      transaction.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTransactions(filteredTransactions);
  };

  const verifyDevice = async (deviceId: string) => {
    try {
      await api.put(`${API_ENDPOINTS.DEVICES}/${deviceId}/verify`);
      await fetchData(); // Refresh all data
    } catch (error) {
      console.error('Failed to verify device:', error);
      alert('Failed to verify device');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  const StatCard: React.FC<{ title: string; value: string | number; icon: string; accent: string }> = ({ title, value, icon, accent }) => (
    <Card className="p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-300/80">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-full border border-white/10 ${accent}`}>
          <span className="text-xl">{icon}</span>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-14 w-14 rounded-full border-4 border-white/20 border-t-indigo-400 animate-spin" />
          <p className="text-sm text-slate-400">Loading admin dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute top-1/2 right-0 h-80 w-80 -translate-y-1/2 rounded-full bg-purple-500/10 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-slate-600/20 blur-3xl" />
      </div>

      <div className="relative z-10">
        <header className="border-b border-white/10 bg-slate-900/60 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
            <div>
              <h1 className="text-3xl font-semibold text-white">Credit Jambo Admin</h1>
              <p className="text-sm text-slate-300/80">Savings management &amp; device security hub</p>
            </div>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-6 py-10">
          <div className="mb-8">
            <nav className="flex flex-wrap gap-3">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'users', label: 'Users', icon: '👥' },
                { id: 'devices', label: 'Devices', icon: '📱' },
                { id: 'transactions', label: 'Transactions', icon: '💰' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 rounded-full px-5 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-white/20 text-white shadow-lg shadow-slate-900/30'
                        : 'bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {activeTab !== 'overview' && (
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <Input
                  placeholder="Search by email, device, or type"
                  value={searchTerm}
                  onChange={setSearchTerm}
                  className="w-full"
                />
              </div>
              {activeTab === 'devices' && (
                <select
                  value={deviceFilter}
                  onChange={(e) => setDeviceFilter(e.target.value as any)}
                  className="h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <option value="all">All devices</option>
                  <option value="verified">Verified only</option>
                  <option value="unverified">Unverified only</option>
                </select>
              )}
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  title="Total users"
                  value={stats.totalUsers}
                  icon="👥"
                  accent="bg-indigo-500/15 text-indigo-200"
                />
                <StatCard
                  title="Total balance"
                  value={`$${stats.totalBalance.toLocaleString()}`}
                  icon="💰"
                  accent="bg-emerald-500/15 text-emerald-200"
                />
                <StatCard
                  title="Verified devices"
                  value={`${stats.verifiedDevices}/${stats.totalDevices}`}
                  icon="📱"
                  accent="bg-sky-500/15 text-sky-200"
                />
                <StatCard
                  title="24h transactions"
                  value={stats.recentTransactions}
                  icon="⚡"
                  accent="bg-amber-500/15 text-amber-200"
                />
              </div>

              <Card title="Recent transactions" className="p-6">
                <div className="space-y-4">
                  {filteredTransactions.slice(0, 8).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between border-b border-white/10 pb-4 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            transaction.type === 'deposit'
                              ? 'bg-emerald-500/15 text-emerald-200'
                              : 'bg-rose-500/15 text-rose-200'
                          }`}
                        >
                          {transaction.type === 'deposit' ? '↑' : '↓'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{transaction.user.email}</p>
                          <p className="text-xs text-slate-300/80">
                            {new Date(transaction.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`text-sm font-semibold ${
                          transaction.type === 'deposit' ? 'text-emerald-300' : 'text-rose-300'
                        }`}
                      >
                        {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount}
                      </div>
                    </div>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <p className="py-6 text-center text-sm text-slate-300/70">No transactions found</p>
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'users' && (
            <Card title={`Users (${filteredUsers.length})`} className="p-6">
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{user.email}</p>
                      <p className="text-xs text-slate-300/70">
                        {user.devices.length} device{user.devices.length !== 1 ? 's' : ''} • Joined{' '}
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-emerald-300">${user.balance.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <p className="py-6 text-center text-sm text-slate-300/70">No users found</p>
                )}
              </div>
            </Card>
          )}

          {activeTab === 'devices' && (
            <Card title={`Devices (${filteredDevices.length})`} className="p-6">
              <div className="space-y-4">
                {filteredDevices.map((device) => (
                  <div
                    key={device.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div>
                      <p className="font-mono text-sm text-white">{device.deviceId}</p>
                      <p className="text-xs text-slate-300/70">{device.user.email}</p>
                      <p className="text-xs text-slate-400/70">
                        Added {new Date(device.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          device.isVerified
                            ? 'bg-emerald-500/15 text-emerald-200'
                            : 'bg-rose-500/15 text-rose-200'
                        }`}
                      >
                        {device.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                      {!device.isVerified && (
                        <Button
                          size="sm"
                          onClick={() => verifyDevice(device.id)}
                          className="bg-emerald-600 text-white hover:bg-emerald-500"
                        >
                          Verify
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                {filteredDevices.length === 0 && (
                  <p className="py-6 text-center text-sm text-slate-300/70">No devices found</p>
                )}
              </div>
            </Card>
          )}

          {activeTab === 'transactions' && (
            <Card title={`Transactions (${filteredTransactions.length})`} className="p-6">
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          transaction.type === 'deposit'
                            ? 'bg-emerald-500/15 text-emerald-200'
                            : 'bg-rose-500/15 text-rose-200'
                        }`}
                      >
                        {transaction.type === 'deposit' ? '↑' : '↓'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{transaction.user.email}</p>
                        <p className="text-xs text-slate-300/70">
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} •{' '}
                          {new Date(transaction.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`text-lg font-semibold ${
                        transaction.type === 'deposit' ? 'text-emerald-300' : 'text-rose-300'
                      }`}
                    >
                      {transaction.type === 'deposit' ? '+' : '-'}${transaction.amount}
                    </div>
                  </div>
                ))}
                {filteredTransactions.length === 0 && (
                  <p className="py-6 text-center text-sm text-slate-300/70">No transactions found</p>
                )}
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
;

export default Dashboard;
