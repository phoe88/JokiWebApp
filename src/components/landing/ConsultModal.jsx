import { useState } from 'react';
import { Check, Copy, MessagesSquare, Send } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../../config/site';
import { CONSULT_TIMELINES, SERVICES } from '../../content/landing';
import { useToast } from '../../context/ToastContext';
import Modal from '../Modal';
import TemplateLink from '../TemplateLink';

const MIN_BRIEF_LENGTH = 10;

function buildMessage({ service, timeline, brief }) {
  return `Halo JokiWebApp, saya mau konsultasi.\n\nKebutuhan: ${service}\nTarget waktu: ${timeline}\n\nBrief:\n${brief.trim()}`;
}

function ConsultForm() {
  const { notify } = useToast();
  const [form, setForm] = useState({ service: SERVICES[0].title, timeline: CONSULT_TIMELINES[0], brief: '' });
  const [copied, setCopied] = useState(false);

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const ready = form.brief.trim().length >= MIN_BRIEF_LENGTH;
  const message = buildMessage(form);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      notify({ tone: 'error', title: 'Gagal menyalin', body: 'Browser menolak akses ke clipboard.' });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="block">
        <span className="text-[13px] font-medium text-ink-muted">Kebutuhan</span>
        <select value={form.service} onChange={update('service')} className="field mt-1 text-base sm:text-sm">
          {SERVICES.map(({ id, title }) => (
            <option key={id} value={title}>
              {title}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-[13px] font-medium text-ink-muted">Target waktu</span>
        <select value={form.timeline} onChange={update('timeline')} className="field mt-1 text-base sm:text-sm">
          {CONSULT_TIMELINES.map((timeline) => (
            <option key={timeline}>{timeline}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="text-[13px] font-medium text-ink-muted">Ceritakan project kamu</span>
        <textarea
          value={form.brief}
          onChange={(event) => {
            update('brief')(event);
            setCopied(false);
          }}
          rows={4}
          placeholder="Apa yang mau dibuat, fitur utamanya, dan contoh referensi kalau ada."
          className="field mt-1 resize-y text-base sm:text-sm"
        />
      </label>

      {WHATSAPP_NUMBER ? (
        <a
          href={ready ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}` : undefined}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={!ready}
          className={`btn btn-primary mt-1 w-full ${ready ? '' : 'pointer-events-none opacity-50'}`}
        >
          <Send aria-hidden className="size-4" />
          Kirim via WhatsApp
        </a>
      ) : (
        <>
          <p className="glass-inset p-3 text-sm leading-relaxed text-ink-muted">
            Kanal konsultasi belum dibuka. Salin ringkasan ini untuk kamu kirim nanti, atau lihat template yang sudah ada.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" disabled={!ready} onClick={copy} className="btn btn-ghost flex-1 disabled:cursor-not-allowed">
              {copied ? <Check aria-hidden className="size-4 text-live" /> : <Copy aria-hidden className="size-4" />}
              {copied ? 'Tersalin' : 'Salin Ringkasan'}
            </button>
            <TemplateLink className="btn btn-primary flex-1">Lihat Template</TemplateLink>
          </div>
        </>
      )}
    </div>
  );
}

export default function ConsultModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Konsultasi Sekarang" icon={MessagesSquare}>
      <ConsultForm />
    </Modal>
  );
}
