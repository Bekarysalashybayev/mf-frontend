import { bootstrapApplication } from '@angular/platform-browser';
import { ApplicationRef, Provider } from '@angular/core';
import { CreditComponent } from '../pages/credit/credit';
import { appConfig } from '../app.config';

export interface AngularMountHandle {
  destroy: () => void;
  appRef: ApplicationRef;
  rootElement: HTMLElement;
}

export async function mountCredit(container: HTMLElement, opts?: { providers?: Provider[] }): Promise<AngularMountHandle> {
  if (!container) throw new Error('container element is required for mountCredit');

  const hostEl = document.createElement('app-credit');
  container.appendChild(hostEl);

  const appRef = await bootstrapApplication(CreditComponent, {
    ...appConfig,
    providers: [ ...(appConfig.providers || []), ...(opts?.providers || []) ]
  });

  return {
    destroy: () => {
      try { appRef.destroy(); } catch (e) { console.warn('Ошибка destroy Angular app', e); }
      if (hostEl.parentElement) hostEl.parentElement.removeChild(hostEl);
    },
    appRef,
    rootElement: hostEl
  };
}

export default mountCredit;

