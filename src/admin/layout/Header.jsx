import { Icon } from '../components/Icon';
import { Avatar } from '../components/ui/Avatar';
import { Btn } from '../components/ui/Button';
import { useApp } from '../context/AppContext';
import { SEC_TITLE } from '../data/navigation';
import { TODAY } from '../lib/utils';

export function Header({ onMenu, onBell, collapsed, onCollapse }) {
  const { section, roleObj, alerts, dark, toggleTheme } = useApp();
  const unread = alerts.filter((a) => !a.read).length;
  return (
    <header className="sticky z-30 border-b border-zinc-200 bg-white" style={{ top: 'env(safe-area-inset-top,0px)' }}>
      <div className="gutter flex items-center gap-3 py-3">
        <Btn v="outline" size="icon" className="lg:hidden" aria-label="Open menu" onClick={onMenu}>
          <Icon n="Menu" />
        </Btn>
        <Btn
          v="outline"
          size="icon"
          className="hidden lg:inline-flex"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={onCollapse}
        >
          <Icon n={collapsed ? 'ChevronsRight' : 'ChevronsLeft'} />
        </Btn>
        <div className="min-w-0 border-l border-zinc-200 pl-3">
          <p className="truncate text-sm font-semibold leading-tight text-zinc-950">{SEC_TITLE[section]}</p>
          <p className="truncate text-xs text-zinc-500">
            {new Date(TODAY).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:inline-flex">
            <span className="pulse-ring h-2 w-2 rounded-full bg-emerald-500"></span>2 branches live
          </span>
          <button
            onClick={toggleTheme}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={dark ? 'Light mode' : 'Dark mode'}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white hover:bg-zinc-50"
          >
            <Icon n={dark ? 'Sun' : 'Moon'} size={17} />
          </button>
          <button
            onClick={onBell}
            aria-label={'Notifications, ' + unread + ' unread'}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-200 bg-white hover:bg-zinc-50"
          >
            <Icon n="Bell" size={17} />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-bold tabular-nums text-white">
                {unread}
              </span>
            )}
          </button>
          <div className="hidden items-center gap-2.5 border-l border-zinc-200 pl-3 sm:flex">
            <Avatar name={roleObj.user} size={34} />
            <div className="leading-tight">
              <p className="text-sm font-medium text-zinc-950">{roleObj.user}</p>
              <p className="text-[11px] text-zinc-500">{roleObj.label}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
