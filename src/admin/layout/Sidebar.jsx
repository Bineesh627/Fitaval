import { useState } from 'react';
import { Icon } from '../components/Icon';
import { Avatar } from '../components/ui/Avatar';
import { useApp } from '../context/AppContext';
import { NAV_TOP, NAV_GYM, NAV_REST } from '../data/navigation';
import { cx } from '../lib/utils';

export function NavBtn({ active, icon, label, onClick, child, collapsed }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-current={active ? 'page' : undefined}
      className={cx(
        'relative flex w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors',
        child ? 'py-2' : 'py-2.5',
        collapsed && 'lg:justify-center lg:px-0',
        active
          ? 'bg-primary font-semibold text-primary-foreground shadow-sm shadow-primary/20'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <Icon n={icon} size={child ? 16 : 18} />
      <span className={collapsed ? 'lg:hidden' : ''}>{label}</span>
    </button>
  );
}

export function Sidebar({ section, setSection, open, onClose, collapsed, onCollapse, onLogout }) {
  const { roleObj } = useApp();
  const inGym = section === 'gym' || section === 'plans' || section === 'gymDetail';
  const [gymOpen, setGymOpen] = useState(true);
  const pick = (id) => {
    setSection(id);
    onClose();
  };
  const hide = collapsed ? 'lg:hidden' : '';
  return (
    <>
      {open && <div className="fade-in fixed inset-0 z-50 bg-foreground/60 lg:hidden" onClick={onClose}></div>}
      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card text-foreground transition-all duration-200 lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:translate-x-0',
          collapsed && 'lg:w-[76px]',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{
          paddingTop: 'env(safe-area-inset-top,0px)',
          paddingBottom: 'env(safe-area-inset-bottom,0px)',
          paddingLeft: 'env(safe-area-inset-left,0px)',
        }}
      >
        <div className={cx('flex items-center gap-3 px-5 py-5', collapsed && 'lg:justify-center lg:px-0')}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Icon n="Dumbbell" size={19} strokeWidth={2.5} />
          </span>
          <div className={hide}>
            <p className="text-base font-bold leading-none tracking-tight text-foreground">Fitaval</p>
            <p className="mt-1 text-[11px] uppercase tracking-widest text-muted-foreground">Central Admin</p>
          </div>
          <button className="ml-auto text-muted-foreground lg:hidden" aria-label="Close menu" onClick={onClose}>
            <Icon n="X" />
          </button>
        </div>
        <nav className="mt-2 flex-1 space-y-1 overflow-y-auto px-3" aria-label="Main">
          <NavBtn
            active={section === NAV_TOP.id}
            icon={NAV_TOP.icon}
            label={NAV_TOP.label}
            collapsed={collapsed}
            onClick={() => pick(NAV_TOP.id)}
          />
          <div>
            <button
              aria-expanded={gymOpen}
              onClick={() => {
                if (!inGym) {
                  setSection('gym');
                  setGymOpen(true);
                } else setGymOpen(!gymOpen);
              }}
              className={cx(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                hide,
                inGym ? 'text-foreground' : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon n="Building2" size={18} className={inGym ? 'text-primary' : ''} />
              Gym Management
              <Icon
                n="ChevronDown"
                size={15}
                className={cx('ml-auto transition-transform', gymOpen ? '' : '-rotate-90')}
              />
            </button>
            {(gymOpen || collapsed) && (
              <div
                className={cx(
                  'mt-1 ml-[21px] space-y-1 border-l border-border pl-3',
                  collapsed && 'lg:ml-0 lg:border-0 lg:pl-0'
                )}
              >
                {NAV_GYM.map((n) => (
                  <NavBtn
                    key={n.id}
                    child={true}
                    collapsed={collapsed}
                    active={section === n.id || (n.id === 'gym' && section === 'gymDetail')}
                    icon={n.icon}
                    label={n.label}
                    onClick={() => pick(n.id)}
                  />
                ))}
              </div>
            )}
          </div>
          {NAV_REST.map((n) => (
            <NavBtn
              key={n.id}
              collapsed={collapsed}
              active={section === n.id}
              icon={n.icon}
              label={n.label}
              onClick={() => pick(n.id)}
            />
          ))}
        </nav>
        <div className="space-y-1 border-t border-border p-3">
          <div
            className={cx(
              'mb-2 flex items-center gap-3 rounded-xl bg-muted p-3',
              collapsed && 'lg:justify-center lg:p-2'
            )}
          >
            <Avatar name={roleObj.user} size={34} />
            <div className={cx('min-w-0', hide)}>
              <p className="truncate text-sm font-medium">{roleObj.user}</p>
              <p className="truncate text-[11px] text-muted-foreground">{roleObj.label}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Log out"
            className={cx(
              'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground',
              collapsed && 'lg:justify-center lg:px-0'
            )}
          >
            <Icon n="LogOut" size={18} />
            <span className={hide}>Log out</span>
          </button>
          <button
            onClick={onCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cx(
              'hidden w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground lg:flex',
              collapsed && 'lg:justify-center lg:px-0'
            )}
          >
            <Icon n={collapsed ? 'ChevronsRight' : 'ChevronsLeft'} size={16} />
            <span className={hide}>Collapse sidebar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
