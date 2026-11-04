import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationStore } from '../../application/authentication.store';
export const roleGuard: CanActivateFn = route => {
  const authentication = inject(AuthenticationStore);
  if (!authentication.accessToken()) authentication.expire();
  const session = authentication.session();
  const router = inject(Router);
  if (!session) return router.createUrlTree(['/']);
  return session.role.code === route.data['role'] || router.createUrlTree([session.role.home]);
};
