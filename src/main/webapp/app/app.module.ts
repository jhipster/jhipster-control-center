import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import './vendor';
import { JhipsterControlCenterSharedModule } from 'app/shared/shared.module';
import { JhipsterControlCenterCoreModule } from 'app/core/core.module';
import { JhipsterControlCenterAppRoutingModule } from './app-routing.module';
import { JhipsterControlCenterHomeModule } from './home/home.module';
import { JhipsterControlCenterEntityModule } from './entities/entity.module';
// jhipster-needle-angular-add-module-import JHipster will add new module here
import { MainComponent } from './layouts/main/main.component';
import { NavbarComponent } from './layouts/navbar/navbar.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { PageRibbonComponent } from './layouts/profiles/page-ribbon.component';
import { ErrorComponent } from './layouts/error/error.component';

@NgModule({
  imports: [
    BrowserModule,
    JhipsterControlCenterSharedModule,
    JhipsterControlCenterCoreModule,
    JhipsterControlCenterHomeModule,
    // jhipster-needle-angular-add-module JHipster will add new module here
    JhipsterControlCenterEntityModule,
    JhipsterControlCenterAppRoutingModule,
  ],
  declarations: [MainComponent, NavbarComponent, ErrorComponent, PageRibbonComponent, FooterComponent],
  bootstrap: [MainComponent],
})
export class JhipsterControlCenterAppModule {}
