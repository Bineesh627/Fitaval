import { useState, useEffect } from 'react';
import { ApprovalBadge } from '../../../components/ApprovalBadge';
import { LogoTile } from '../../../components/GymVisuals';
import { Icon } from '../../../components/Icon';
import { Stars } from '../../../components/Stars';
import { Btn } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Locked } from '../../../components/ui/PageHead';
import { Tabs } from '../../../components/ui/Tabs';
import { useApp } from '../../../context/AppContext';
import { avgRating } from '../../../lib/gym';
import { ReviewModal } from '../GymManagement';
import VerifiedTick from '../../../../shared/VerifiedTick';
import { useVerified, setVerified } from '../../../../shared/verified';
import { GymFinanceTab } from './GymFinanceTab';
import { ServicesModal, HoursEditModal, LocationModal, PhotosModal } from './GymModals';
import { GymStaffTab, GymTrainersTab, GymMembersTab } from './GymPeopleTabs';
import { GymReviewsTab } from './GymReviewsTab';
import { GymWalletTab } from './GymWalletTab';
import { OverviewTab } from './OverviewTab';

export function GymDetail() {
  const { gymId, gyms, approvals, setSection, perms, toast } = useApp();
  const g = gyms[gymId];
  const [tab, setTab] = useState('overview');
  const [modal, setModal] = useState(null);
  const [review, setReview] = useState(false);
  const verified = useVerified(gymId);
  useEffect(() => {
    setTab('overview');
    setModal(null);
  }, [gymId]);
  if (!g) return <Locked title="Gym not found" text="Go back to All Gyms and pick a gym from the list." />;
  const ap = approvals.find((a) => a.id === g.id);
  const edit = perms.editGym;
  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'LayoutGrid' },
    { id: 'staff', label: 'Staff (' + g.staff.length + ')', icon: 'BriefcaseBusiness' },
    { id: 'trainers', label: 'Trainers (' + g.trainers.length + ')', icon: 'Dumbbell' },
    { id: 'members', label: 'Members (' + g.members.length + ')', icon: 'Users', lock: !perms.members },
    { id: 'reviews', label: 'Reviews (' + (g.reviews || []).length + ')', icon: 'Star' },
    { id: 'finance', label: 'Finance (' + (g.txns || []).length + ')', icon: 'Receipt', lock: !perms.revenue },
    { id: 'wallet', label: 'Wallet', icon: 'Wallet', lock: !perms.revenue },
  ];
  return (
    <div>
      <nav aria-label="Breadcrumb" className="mb-4 flex min-w-0 items-center gap-1.5 text-sm text-zinc-500">
        <button onClick={() => setSection('gym')} className="shrink-0 hover:text-zinc-950">
          Gym Management
        </button>
        <Icon n="ChevronRight" size={14} className="shrink-0" />
        <button onClick={() => setSection('gym')} className="shrink-0 hover:text-zinc-950">
          All Gyms
        </button>
        <Icon n="ChevronRight" size={14} className="shrink-0" />
        <span className="truncate font-medium text-zinc-950">{g.name}</span>
      </nav>
      <Card className="mb-4 p-5 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <Btn size="sm" v="outline" onClick={() => setSection('gym')}>
            <Icon n="ArrowLeft" size={14} />
            Back to all gyms
          </Btn>
          <div className="flex items-center gap-2">
            {edit && (
              <Btn
                size="sm"
                v={verified ? 'soft' : 'outline'}
                aria-pressed={verified}
                onClick={() => {
                  setVerified(g.id, !verified);
                  toast({ title: verified ? 'Blue tick removed' : 'Gym verified', desc: g.name + (verified ? ' is no longer shown as verified.' : ' now shows a blue tick in its CRM.') });
                }}
              >
                <Icon n="BadgeCheck" size={14} />
                {verified ? 'Verified · Remove tick' : 'Give blue tick'}
              </Btn>
            )}
            {ap && <ApprovalBadge s={ap.status} />}
            {ap && (ap.status === 'Pending' || ap.status === 'Under Review') && (
              <Btn size="sm" v="primary" onClick={() => setReview(true)}>
                <Icon n="ClipboardCheck" size={14} />
                Review and approve
              </Btn>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center text-center">
          <LogoTile name={g.name} />
          <h1 className="mt-3 inline-flex items-center gap-1.5 text-xl font-semibold tracking-tight">
            {g.name}
            {verified && <VerifiedTick size={20} />}
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-zinc-500">
            <Icon n="MapPin" size={14} className="text-emerald-600" />
            {g.loc}
            <span className="text-zinc-300">·</span>
            {g.id}
            <span className="text-zinc-300">·</span>Owner {g.owner}
          </p>
          <button
            onClick={() => setTab('reviews')}
            className="mt-2 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm hover:bg-zinc-100"
            aria-label="View reviews"
          >
            <Stars v={avgRating(g.reviews || [])} />
            <span className="font-semibold tabular-nums">{avgRating(g.reviews || []).toFixed(1)}</span>
            <span className="text-zinc-500">({(g.reviews || []).length} reviews)</span>
          </button>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {[
              ['staff', 'Staff', g.staff.length, 'BriefcaseBusiness'],
              ['trainers', 'Trainers', g.trainers.length, 'Dumbbell'],
              ['members', 'Members', g.members.length, 'Users'],
            ].map(([id, l, n, ic]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3.5 py-1.5 text-sm hover:border-emerald-300 hover:bg-emerald-50"
              >
                <Icon n={ic} size={14} className="text-emerald-600" />
                <span className="font-semibold tabular-nums">{n}</span>
                <span className="text-zinc-600">{l}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>
      <div className="mb-5">
        <Tabs tabs={tabs} value={tab} onChange={setTab} />
      </div>
      {tab === 'overview' && <OverviewTab g={g} edit={edit} setModal={setModal} />}
      {tab === 'staff' && <GymStaffTab g={g} />}
      {tab === 'trainers' && <GymTrainersTab g={g} />}
      {tab === 'members' && <GymMembersTab g={g} />}
      {tab === 'reviews' && <GymReviewsTab g={g} />}
      {tab === 'finance' && <GymFinanceTab g={g} />}
      {tab === 'wallet' && <GymWalletTab g={g} />}
      {modal === 'services' && <ServicesModal g={g} onClose={() => setModal(null)} />}
      {modal === 'hours' && <HoursEditModal g={g} onClose={() => setModal(null)} />}
      {modal === 'location' && <LocationModal g={g} onClose={() => setModal(null)} />}
      {modal === 'photos' && <PhotosModal g={g} onClose={() => setModal(null)} />}
      {review && ap && <ReviewModal g={ap} onClose={() => setReview(false)} onDone={() => setSection('gym')} />}
    </div>
  );
}
