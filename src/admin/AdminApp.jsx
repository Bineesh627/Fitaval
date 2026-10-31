import { useState, useEffect, useMemo, useRef } from 'react';
import { Icon } from './components/Icon';
import { NotifDrawer } from './components/NotifDrawer';
import { ScannerModal } from './components/ScannerModal';
import { Btn } from './components/ui/Button';
import { Modal } from './components/ui/Modal';
import { Toasts } from './components/ui/Toasts';
import { AppCtx } from './context/AppContext';
import { ALERTS0 } from './data/alerts';
import { APPROVALS0 } from './data/approvals';
import { AUDIT0 } from './data/audit';
import { BR } from './data/branches';
import { makeGym } from './data/gyms';
import { seedMembers } from './data/members';
import { PLANS0 } from './data/plans';
import { ROLES, permsFor } from './data/roles';
import { SESSIONS0 } from './data/sessions';
import { STAFF0 } from './data/staff';
import { Header } from './layout/Header';
import { Sidebar } from './layout/Sidebar';
import { iso, TODAY, uid } from './lib/utils';
import { useAdminTheme } from './lib/theme';
import { Accounts } from './pages/account/Accounts';
import { Dashboard } from './pages/dashboard/Dashboard';
import { GymManagement } from './pages/gyms/GymManagement';
import { SubscriptionPlans } from './pages/gyms/SubscriptionPlans';
import { GymDetail } from './pages/gyms/detail/GymDetail';
import { UserManagement } from './pages/users/UserManagement';
import { logout } from '../portal/session';
import { seedFeed, OCCUPANCY0, SCANS_TODAY0 } from './data/feed';
import { adminClient } from './api/client';

export default function AdminApp() {
  const { theme, dark, toggleTheme } = useAdminTheme();
  const [section, setSection] = useState('dashboard');
  const [role, setRole] = useState('super');
  const [branch, setBranch] = useState('all');
  const [nav, setNav] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [logoutAsk, setLogoutAsk] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [bell, setBell] = useState(false);
  const [members, setMembers] = useState(seedMembers);
  const [audit, setAudit] = useState(AUDIT0);
  const [approvals, setApprovals] = useState(APPROVALS0);
  const [gyms, setGyms] = useState(() => Object.fromEntries(APPROVALS0.map((a, i) => [a.id, makeGym(a, i)])));
  const [gymId, setGymId] = useState('GYM001');
  const [approvedN, setApprovedN] = useState(0);
  const [plans, setPlans] = useState(PLANS0);
  const [sessions, setSessions] = useState(SESSIONS0);
  const [staff, setStaff] = useState(STAFF0);
  const [alerts, setAlerts] = useState(ALERTS0);
  const [broadcasts, setBroadcasts] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [occ, setOcc] = useState(OCCUPANCY0);
  const [scans, setScans] = useState(SCANS_TODAY0);
  const [feed, setFeed] = useState(seedFeed);
  const roleObj = ROLES.find((r) => r.id === role);
  const perms = useMemo(() => permsFor(role), [role]);
  const toast = (t) => {
    const id = uid();
    setToasts((ts) => [...ts.slice(-3), { id, ...t }]);
    if (!t.sticky) setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 4200);
    return id;
  };
  const updateToast = (id, patch) => setToasts((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  const dismiss = (id) => setToasts((ts) => ts.filter((t) => t.id !== id));
  const addAudit = (action, model, obj, before, after) =>
    setAudit((a) => [
      { id: 'a' + uid(), at: new Date(), action, actor: roleObj.user, model, obj, ip: '103.211.14.20', before, after },
      ...a,
    ]);
  const updateGym = (id, patch) => setGyms((m) => ({ ...m, [id]: { ...m[id], ...patch } }));
  const openGym = (id) => {
    setGymId(id);
    setSection('gymDetail');
  };
  const updateMember = (id, patch) => setMembers((ms) => ms.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  const recordScan = (m, dir, status) => {
    setFeed((f) => [{ id: uid(), name: m.name, branch: m.branch, dir, status, at: new Date() }, ...f].slice(0, 30));
    if (status === 'ACTIVE') {
      setOcc((o) => ({
        ...o,
        [m.branch]: Math.max(12, Math.min(BR[m.branch].cap - 2, o[m.branch] + (dir === 'IN' ? 1 : -1))),
      }));
      if (dir === 'IN') setScans((s) => ({ ...s, [m.branch]: s[m.branch] + 1 }));
    }
  };
  const startExport = (n, bf, done) => {
    const id = toast({
      title: 'Exporting members to Excel',
      desc: 'Streaming ' + n + ' rows…',
      progress: 4,
      sticky: true,
      done: false,
    });
    let p = 4;
    const t = setInterval(() => {
      p += Math.round(9 + Math.random() * 17);
      if (p >= 100) {
        clearInterval(t);
        updateToast(id, {
          title: 'Export ready',
          desc: n + ' rows · fitaval_members_' + iso(TODAY).replace(/-/g, '') + '.xlsx',
          progress: 100,
          done: true,
        });
        setTimeout(() => dismiss(id), 4200);
        addAudit(
          'EXPORT',
          'memberships.Membership',
          'bulk-export',
          { rows: 0 },
          { rows: n, format: 'xlsx', filter: { branch: bf } }
        );
        done();
      } else updateToast(id, { progress: p });
    }, 380);
  };
  const mref = useRef(members);
  mref.current = members;
  const cursor = useRef(2);
  useEffect(() => {
    const t = setInterval(() => {
      const ms = mref.current;
      const m = ms[(cursor.current++ * 7) % ms.length];
      const status = m.status === 'Active' ? 'ACTIVE' : m.status === 'Frozen' ? 'DENIED - FROZEN' : 'DENIED - EXPIRED';
      recordScan(m, status === 'ACTIVE' && Math.random() < 0.4 ? 'OUT' : 'IN', status);
    }, 6500);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    try {
      window.scrollTo(0, 0);
    } catch (e) {
      /* scroll not available */
    }
  }, [section]);
  const ctx = {
    section,
    setSection,
    role,
    setRole,
    roleObj,
    perms,
    branch,
    setBranch,
    members,
    updateMember,
    audit,
    addAudit,
    approvals,
    setApprovals,
    approvedN,
    setApprovedN,
    theme,
    dark,
    toggleTheme,
    gyms,
    gymId,
    updateGym,
    openGym,
    plans,
    setPlans,
    sessions,
    setSessions,
    staff,
    setStaff,
    alerts,
    setAlerts,
    broadcasts,
    setBroadcasts,
    toast,
    occ,
    scans,
    feed,
    recordScan,
    startExport,
    client: adminClient,
    adminClient,
  };
  return (
    <AppCtx.Provider value={ctx}>
      <div className="flex min-h-screen w-full">
        <Sidebar
          section={section}
          setSection={setSection}
          open={nav}
          onClose={() => setNav(false)}
          collapsed={collapsed}
          onCollapse={() => setCollapsed((c) => !c)}
          onLogout={() => setLogoutAsk(true)}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            onMenu={() => setNav(true)}
            onBell={() => setBell(true)}
            collapsed={collapsed}
            onCollapse={() => setCollapsed((c) => !c)}
          />
          <main
            className="gutter min-w-0 flex-1 py-6"
            style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom,0px))' }}
          >
            {section === 'dashboard' && <Dashboard />}
            {section === 'gym' && <GymManagement />}
            {section === 'plans' && <SubscriptionPlans />}
            {section === 'gymDetail' && <GymDetail />}
            {section === 'users' && <UserManagement />}
            {section === 'account' && <Accounts />}
          </main>
        </div>
      </div>
      {scanOpen && <ScannerModal onClose={() => setScanOpen(false)} />}
      {logoutAsk && (
        <Modal
          open={true}
          onClose={() => setLogoutAsk(false)}
          size="sm"
          title="Log out of Fitaval?"
          sub={roleObj.user}
          footer={
            <>
              <Btn onClick={() => setLogoutAsk(false)}>Stay signed in</Btn>
              <Btn
                v="dark"
                onClick={() => {
                  setLogoutAsk(false);
                  logout();
                }}
              >
                Log out
              </Btn>
            </>
          }
        >
          <p className="text-sm text-zinc-600">
            You will be signed out on this device. Other signed-in devices stay active.
          </p>
        </Modal>
      )}
      {bell && <NotifDrawer onClose={() => setBell(false)} />}
      <Toasts toasts={toasts} dismiss={dismiss} />
    </AppCtx.Provider>
  );
}
