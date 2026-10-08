import { Routes } from '@angular/router';
import { roleGuard } from './iam/presentation/guards/role.guard';
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./iam/presentation/views/login/login').then(
        (m) => m.Login,
      ),
  },
  ...['doctor', 'family'].map(role => ({
    path: role + '/profile',
    data: { role },
    canActivate: [roleGuard],
    loadComponent: () => import('./iam/presentation/views/profile/profile').then(m => m.Profile),
  })),
  ...['doctor', 'family'].flatMap((role) =>
    (role === 'doctor'
      ? ['dashboard', 'patients', 'patients/:id', 'alerts/:alertId']
      : ['dashboard', 'network']
    ).map((view) => ({
      path: `${role}/${view}`,
      data: { role, view },
      canActivate: [roleGuard],
      loadComponent: () =>
        import('./care/presentation/views/care-workspace/care-workspace').then(
          (m) => m.CareWorkspace,
        ),
    })),
  ),
  { path: 'family/patients/:id', redirectTo: 'family/dashboard' },
  { path: 'family/alerts/:alertId', redirectTo: 'family/dashboard' },
  { path: '**', redirectTo: '' },
];
