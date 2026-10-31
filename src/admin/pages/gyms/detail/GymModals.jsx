import { useState } from 'react';
import { GymScene } from '../../../components/GymVisuals';
import { Icon } from '../../../components/Icon';
import { ChipToggle } from '../../../components/Section';
import { Btn } from '../../../components/ui/Button';
import { Field } from '../../../components/ui/Field';
import { Modal } from '../../../components/ui/Modal';
import { Switch } from '../../../components/ui/Switch';
import { inputCls } from '../../../components/ui/styles';
import { useApp } from '../../../context/AppContext';
import { FACILITIES, SERVICE_LIST, SCENES } from '../../../data/gyms';
import { cx, toMin, DAYS_FULL, uid } from '../../../lib/utils';

export function ServicesModal({ g, onClose }) {
  const { updateGym, toast, addAudit } = useApp();
  const [fac, setFac] = useState(g.facilities);
  const [svc, setSvc] = useState(g.services);
  const tog = (arr, set, v) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Edit services and amenities"
      sub={g.name}
      footer={
        <>
          <Btn onClick={onClose}>Discard</Btn>
          <Btn
            v="primary"
            onClick={() => {
              updateGym(g.id, { facilities: fac, services: svc });
              addAudit(
                'UPDATE',
                'gyms.Gym',
                g.id,
                { amenities: g.facilities.length + g.services.length },
                { amenities: fac.length + svc.length }
              );
              toast({ title: 'Amenities saved', desc: fac.length + svc.length + ' services and facilities listed.' });
              onClose();
            }}
          >
            Save changes
          </Btn>
        </>
      }
    >
      <p className="mb-2 text-sm font-semibold">Facilities</p>
      <div className="mb-5 flex flex-wrap gap-2">
        {FACILITIES.map((f) => (
          <ChipToggle key={f} on={fac.includes(f)} label={f} onClick={() => tog(fac, setFac, f)} />
        ))}
      </div>
      <p className="mb-2 text-sm font-semibold">Services</p>
      <div className="flex flex-wrap gap-2">
        {SERVICE_LIST.map((f) => (
          <ChipToggle key={f} on={svc.includes(f)} label={f} onClick={() => tog(svc, setSvc, f)} />
        ))}
      </div>
    </Modal>
  );
}

export function HoursEditModal({ g, onClose }) {
  const { updateGym, toast, addAudit } = useApp();
  const [h, setH] = useState(g.hours.map((x) => ({ ...x })));
  const set = (i, k, v) => setH((p) => p.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const bad = h.some((r) => r.open && toMin(r.to) <= toMin(r.from));
  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Edit operating hours"
      sub={g.name}
      footer={
        <>
          <Btn onClick={onClose}>Discard</Btn>
          <Btn
            v="primary"
            disabled={bad}
            onClick={() => {
              updateGym(g.id, { hours: h });
              addAudit(
                'UPDATE',
                'gyms.Gym',
                g.id,
                { hours: g.hours.map((x) => (x.open ? x.from + '-' + x.to : 'closed')) },
                { hours: h.map((x) => (x.open ? x.from + '-' + x.to : 'closed')) }
              );
              toast({ title: 'Operating hours saved', desc: g.name });
              onClose();
            }}
          >
            Save hours
          </Btn>
        </>
      }
    >
      <div className="mb-3">
        <Btn size="sm" v="soft" onClick={() => setH((p) => p.map(() => ({ ...p[0] })))}>
          Copy Monday to all days
        </Btn>
      </div>
      <ul className="divide-y divide-zinc-100">
        {h.map((r, i) => (
          <li key={i} className="flex flex-wrap items-center gap-3 py-2.5">
            <span className="w-24 text-sm font-medium">{DAYS_FULL[i]}</span>
            <Switch checked={r.open} label={DAYS_FULL[i] + ' open'} onChange={(v) => set(i, 'open', v)} />
            {r.open ? (
              <div className="ml-auto flex items-center gap-2">
                <input
                  aria-label={DAYS_FULL[i] + ' opens'}
                  type="time"
                  className={cx(inputCls, 'w-[110px]')}
                  value={r.from}
                  onChange={(e) => set(i, 'from', e.target.value)}
                />
                <span className="text-zinc-400">to</span>
                <input
                  aria-label={DAYS_FULL[i] + ' closes'}
                  type="time"
                  className={cx(inputCls, 'w-[110px]')}
                  value={r.to}
                  onChange={(e) => set(i, 'to', e.target.value)}
                />
              </div>
            ) : (
              <span className="ml-auto text-sm text-zinc-500">Closed</span>
            )}
          </li>
        ))}
      </ul>
      {bad && <p className="mt-2 text-xs font-medium">Closing time must be after opening time on every open day.</p>}
    </Modal>
  );
}

export function LocationModal({ g, onClose }) {
  const { updateGym, toast, addAudit } = useApp();
  const [f, setF] = useState({ addr: g.addr, loc: g.loc, zip: g.zip, lat: String(g.lat), lng: String(g.lng) });
  const la = Number(f.lat),
    ln = Number(f.lng);
  const ok =
    f.addr.trim() && f.loc.trim() && f.lat !== '' && f.lng !== '' && la >= -90 && la <= 90 && ln >= -180 && ln <= 180;
  return (
    <Modal
      open={true}
      onClose={onClose}
      title="Change gym location"
      sub={g.name}
      footer={
        <>
          <Btn onClick={onClose}>Discard</Btn>
          <Btn
            v="primary"
            disabled={!ok}
            onClick={() => {
              updateGym(g.id, { addr: f.addr.trim(), loc: f.loc.trim(), zip: f.zip.trim(), lat: la, lng: ln });
              addAudit(
                'UPDATE',
                'gyms.Gym',
                g.id,
                { address: g.addr, lat: g.lat, lng: g.lng },
                { address: f.addr.trim(), lat: la, lng: ln }
              );
              toast({ title: 'Location updated', desc: f.addr.trim() });
              onClose();
            }}
          >
            Save location
          </Btn>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Street address" id="loc-addr" className="sm:col-span-2">
          <input
            id="loc-addr"
            className={inputCls}
            value={f.addr}
            onChange={(e) => setF({ ...f, addr: e.target.value })}
          />
        </Field>
        <Field label="City, state" id="loc-city">
          <input
            id="loc-city"
            className={inputCls}
            value={f.loc}
            onChange={(e) => setF({ ...f, loc: e.target.value })}
          />
        </Field>
        <Field label="ZIP code" id="loc-zip">
          <input
            id="loc-zip"
            className={inputCls}
            value={f.zip}
            onChange={(e) => setF({ ...f, zip: e.target.value })}
          />
        </Field>
        <Field label="Latitude" id="loc-lat" hint="Between -90 and 90">
          <input
            id="loc-lat"
            type="number"
            step="0.0001"
            className={cx(inputCls, 'font-mono')}
            value={f.lat}
            onChange={(e) => setF({ ...f, lat: e.target.value })}
          />
        </Field>
        <Field label="Longitude" id="loc-lng" hint="Between -180 and 180">
          <input
            id="loc-lng"
            type="number"
            step="0.0001"
            className={cx(inputCls, 'font-mono')}
            value={f.lng}
            onChange={(e) => setF({ ...f, lng: e.target.value })}
          />
        </Field>
      </div>
    </Modal>
  );
}

export function PhotosModal({ g, onClose }) {
  const { updateGym, toast } = useApp();
  const [ph, setPh] = useState(g.photos);
  const onFiles = (e) => {
    [...e.target.files].slice(0, 6).forEach((f) => {
      if (!f.type.startsWith('image/') || f.size > 4 * 1024 * 1024) {
        toast({ title: 'Skipped ' + f.name, desc: 'Use an image file under 4 MB.' });
        return;
      }
      const fr = new FileReader();
      fr.onload = () => setPh((p) => [...p, { id: uid(), kind: 'upload', src: fr.result, name: f.name }]);
      fr.readAsDataURL(f);
    });
    e.target.value = '';
  };
  const missing = Object.keys(SCENES).filter((k) => !ph.some((p) => p.scene === k));
  return (
    <Modal
      open={true}
      onClose={onClose}
      size="lg"
      title="Manage photos"
      sub={ph.length + ' photos in the gallery'}
      footer={
        <>
          <Btn onClick={onClose}>Discard</Btn>
          <Btn
            v="primary"
            onClick={() => {
              updateGym(g.id, { photos: ph });
              toast({ title: 'Gallery saved', desc: ph.length + ' photos for ' + g.name + '.' });
              onClose();
            }}
          >
            Save gallery
          </Btn>
        </>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label
          htmlFor="ph-upload"
          className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800"
        >
          <Icon n="Upload" size={15} className="text-emerald-400" />
          Upload photos
        </label>
        <input id="ph-upload" type="file" accept="image/*" multiple className="sr-only" onChange={onFiles} />
        {missing.length > 0 && (
          <Btn v="outline" onClick={() => setPh((p) => [...p, { id: uid(), kind: 'scene', scene: missing[0] }])}>
            <Icon n="ImagePlus" size={15} />
            Add sample: {SCENES[missing[0]]}
          </Btn>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ph.map((p) => (
          <div
            key={p.id}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100"
          >
            {p.kind === 'upload' ? (
              <img src={p.src} alt={p.name} className="h-full w-full object-cover" />
            ) : (
              <GymScene kind={p.scene} />
            )}
            <button
              aria-label="Remove photo"
              onClick={() => setPh((x) => x.filter((y) => y.id !== p.id))}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-950 text-white shadow hover:bg-zinc-800"
            >
              <Icon n="Trash2" size={13} />
            </button>
          </div>
        ))}
      </div>
      {!ph.length && (
        <p className="py-10 text-center text-sm text-zinc-500">No photos yet. Upload an image or add a sample photo.</p>
      )}
    </Modal>
  );
}
