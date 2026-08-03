import { bootstrapApplication } from '@angular/platform-browser'
import { appConfig } from './app/app.config'
import { App } from './app/app'

bootstrapApplication(App, appConfig).catch((err) => console.error(err))

import { Router } from '@angular/router'

bootstrapApplication(App, appConfig).then((appRef) => {
  const router = appRef.injector.get(Router)

  router.events.subscribe((event) => {
    console.log(event)
  })
})
