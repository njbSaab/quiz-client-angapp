import { NgModule } from '@angular/core';
import { RouterModule, Routes, ExtraOptions } from '@angular/router';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { ContactsModule } from './view/contacts/contacts.module';
import { AboutModule } from './view/about/about.module';

const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  {
    path: 'main',
    loadChildren: () =>
      import('./view/quiz-list/quiz-list.module').then((m) => m.QuizListModule),
  },
  {
    path: 'quiz/:id',
    loadChildren: () =>
      import('./view/quiz-single/quiz-single.module').then((m) => m.QuizSingleModule),
  },
  {
    path: 'quiz/:id/play',
    loadChildren: () =>
      import('./view/quiz-play/quiz-play.module').then((m) => m.QuizPlayModule),
  },
  {
    path: 'quiz/:id/result',
    loadChildren: () =>
      import('./view/quiz-result/quiz-result.module').then((m) => m.QuizResultModule),
  },
  {
    path: 'about',
    loadChildren: () =>
      import('./view/about/about.module').then((m) => m.AboutModule),
  },
  {
    path: 'contacts',
    loadChildren: () =>
      import('./view/contacts/contacts.module').then((m) => m.ContactsModule),
  },
  {
    path: 'policy',
    loadChildren: () =>
      import('./view/police/police.module').then((m) => m.PoliceModule),
  },
  {
    path: 'faq',
    loadChildren: () =>
      import('./view/faq/faq.module').then((m) => m.FaqModule),
  },
  {
    path: 'terms',
    loadChildren: () =>
      import('./view/terms/terms.module').then((m) => m.TermsModule),
  },
  { path: '**', redirectTo: '/main', pathMatch: 'full' },
];

const routerOptions: ExtraOptions = {
  useHash: true, // Включаем хэш-маршрутизацию
};

@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy } // Используем HashLocationStrategy
  ],
})
export class AppRoutingModule {}