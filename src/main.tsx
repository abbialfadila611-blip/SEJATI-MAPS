import { Capacitor } from '@capacitor/core';
import 'leaflet/dist/leaflet.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

if (!Capacitor.isNativePlatform()) {
  try {
    registerSW({ immediate: true });
  } catch (err) {
    console.warn('[SEJATI MAPS] Service worker tidak aktif:', err);
  }
}

function renderFatalFallback(message: string) {
  const rootEl = document.getElementById('root');
  if (!rootEl) return;
  if (rootEl.querySelector('[data-boot-loading]') || rootEl.childElementCount === 0) {
    const safeMsg = String(message || 'Kesalahan tidak diketahui').replace(/[<>&]/g, '');
    rootEl.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.style.cssText =
      'min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#FAFAF8;font-family:sans-serif;color:#1C1917;';
    const card = document.createElement('div');
    card.style.cssText =
      'max-width:420px;width:100%;background:#fff;border:1px solid #E6E4DF;border-radius:16px;padding:24px;';
    const title = document.createElement('h1');
    title.style.cssText = 'font-size:18px;font-weight:700;margin:0 0 8px;';
    title.textContent = 'Gagal Memuat SEJATI MAPS';
    const desc = document.createElement('p');
    desc.style.cssText = 'font-size:13px;color:#57534E;margin:0 0 12px;line-height:1.5;';
    desc.textContent = safeMsg;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.style.cssText =
      'width:100%;padding:10px 16px;border:none;border-radius:10px;background:#14532D;color:#fff;font-weight:600;font-size:14px;cursor:pointer;';
    btn.textContent = 'Muat Ulang';
    btn.onclick = () => window.location.reload();
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(btn);
    wrapper.appendChild(card);
    rootEl.appendChild(wrapper);
  }
}

window.addEventListener('error', (event) => {
  if (event?.message) {
    renderFatalFallback(event.message);
  }
});

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>
  );
}
