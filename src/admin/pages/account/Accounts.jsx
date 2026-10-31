import { useState } from 'react';
import { PageHead } from '../../components/ui/PageHead';
import { Tabs } from '../../components/ui/Tabs';
import { useApp } from '../../context/AppContext';
import { AuditTab } from './AuditTab';
import { SecurityTab } from './SecurityTab';
import { SessionsTab } from './SessionsTab';

export function Accounts() {
  const { perms } = useApp();
  const [tab, setTab] = useState('security');
  const tabs = [
    { id: 'security', label: 'Profile and Security', icon: 'ShieldCheck' },
    { id: 'sessions', label: 'Active Sessions', icon: 'Laptop' },
    { id: 'audit', label: 'Audit Logs', icon: 'ScrollText', lock: !perms.audit },
  ];
  return (
    <div>
      <PageHead title="Profile and Accounts" sub="Security, device sessions, staff attendance and audit trail" />
      <div className="mb-5">
        <Tabs tabs={tabs} value={tab} onChange={setTab} />
      </div>
      {tab === 'security' && <SecurityTab />}
      {tab === 'sessions' && <SessionsTab />}
      {tab === 'audit' && <AuditTab />}
    </div>
  );
}
