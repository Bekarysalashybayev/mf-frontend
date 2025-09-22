import { bootstrapApplication } from '@angular/platform-browser';
import { ApplicationRef, Provider, Type } from '@angular/core';
import { appConfig } from '../app.config';

export interface AngularMountHandle {
  destroy: () => void;
  appRef: ApplicationRef;
  rootElement: HTMLElement;
  key: string;
}

export interface MountOptions { providers?: Provider[] }

interface MappingEntry { selector: string; component: Type<unknown> }

type MappingLoader = () => Promise<MappingEntry>

const registry: Record<string, MappingLoader> = {
  'credit': async () => {
    const mod = await import('../pages/credit/credit');
    return { selector: 'app-credit', component: (mod as any).CreditComponent };
  },
  'credit-transfer': async () => {
    const mod = await import('../pages/credit/credit-transfer');
    return { selector: 'app-credit-transfer', component: (mod as any).CreditTransferComponent };
  }
};

function resolveLoader(key: string): MappingLoader {
  return registry[key] || registry['credit'];
}

export async function mountAngular(key: string, container: HTMLElement, opts?: MountOptions): Promise<AngularMountHandle> {
  if (!container) throw new Error('container element is required');
  const loader = resolveLoader(key);
  const entry = await loader();

  const hostEl = document.createElement(entry.selector);
  container.appendChild(hostEl);

  const appRef = await bootstrapApplication(entry.component as any, {
    ...appConfig,
    providers: [ ...(appConfig.providers || []), ...(opts?.providers || []) ]
  });

  return {
    destroy: () => {
      try { appRef.destroy(); } catch { /* ignore */ }
      if (hostEl.parentElement) hostEl.parentElement.removeChild(hostEl);
    },
    appRef,
    rootElement: hostEl,
    key
  };
}

export default mountAngular;
