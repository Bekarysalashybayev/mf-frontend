import 'zone.js'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import { AppModule } from './app/app.module'
import { mfSystem } from '../setup-mf'
import { Router, NavigationEnd } from '@angular/router'

platformBrowserDynamic().bootstrapModule(AppModule).then(m => {
  const router = m.injector.get(Router)
  // Привязываем Angular Router к системе микрофронтенда
  mfSystem.attachRouter(router)

  router.events.subscribe(ev => {
    if (ev instanceof NavigationEnd) {
      const path = router.url
      const current = window.location.pathname + window.location.search + window.location.hash
      if (path !== current) {
        // Используем replace чтобы не плодить записи в истории хоста
        mfSystem.navigate(path, true)
      }
    }
  })
}).catch(err => console.error(err))
