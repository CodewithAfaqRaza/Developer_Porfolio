import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import { COUNTRY_CODES } from '../../../shared/contact';

const names = new Intl.DisplayNames(['en'], { type: 'region' });
const countries = COUNTRY_CODES.map(code => ({ code, name: names.of(code) || code })).sort((a, b) => a.name.localeCompare(b.name, 'en'));
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
type Props = {
  value: string; onChange: (value: string) => void; disabled?: boolean;
  'aria-invalid'?: true; 'aria-describedby'?: string;
};
export function CountrySelect({ value, onChange, disabled, ...attributes }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const selected = countries.find(country => country.code === value);
  const search = normalize(query);
  const filtered = countries.filter(country => normalize(country.name).includes(search) || country.code.toLowerCase().includes(search));
  useEffect(() => {
    if (open) document.getElementById(`contact-country-option-${filtered[active]?.code}`)?.scrollIntoView({ block: 'nearest' });
  }, [open, active, query]); // Query changes reset the active option.
  const close = () => { setOpen(false); setQuery(''); };
  const choose = (code: string) => { onChange(code); close(); input.current?.focus({ preventScroll: true }); };
  function keyboard(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) { setOpen(true); setQuery(''); setActive(0); }
      else setActive(current => Math.max(0, Math.min(filtered.length - 1, current + (event.key === 'ArrowDown' ? 1 : -1))));
    } else if (event.key === 'Enter' && open) {
      event.preventDefault(); if (filtered[active]) choose(filtered[active].code);
    } else if (event.key === 'Escape' && open) {
      event.preventDefault(); event.stopPropagation(); close();
    } else if (event.key === 'Tab') close();
  }
  return <div className="country-select">
    <input ref={input} id="contact-country" name="country" type="text" role="combobox"
      required disabled={disabled} autoComplete="off" spellCheck={false}
      placeholder="Search your country or region" value={open ? query : selected?.name || ''}
      aria-autocomplete="list" aria-expanded={open} aria-controls="contact-country-list"
      aria-activedescendant={open && filtered[active] ? `contact-country-option-${filtered[active].code}` : undefined}
      {...attributes}
      onFocus={() => { setOpen(true); setQuery(''); setActive(0); }}
      onClick={() => { if (!open) { setOpen(true); setQuery(''); setActive(0); } }}
      onBlur={close} onKeyDown={keyboard}
      onChange={event => { setQuery(event.target.value); setOpen(true); setActive(0); onChange(''); }} />
    <ChevronDown className="country-chevron" size={18} aria-hidden="true" />
    {open && <div className="country-popup">
      <ul id="contact-country-list" role="listbox" aria-label="Countries and regions">
        {filtered.map((country, index) => <li key={country.code} id={`contact-country-option-${country.code}`}
          role="option" aria-selected={country.code === value} className={index === active ? 'is-active' : ''}
          onPointerDown={event => event.preventDefault()} onClick={() => choose(country.code)}>
          <span>{country.name}</span><span className="country-code">{country.code}</span>
        </li>)}
      </ul>
      {!filtered.length && <p role="status">No countries found. Try another name or country code.</p>}
    </div>}
  </div>;
}
