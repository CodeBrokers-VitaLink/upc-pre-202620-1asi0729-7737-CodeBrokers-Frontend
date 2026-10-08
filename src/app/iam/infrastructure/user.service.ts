import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserResponse } from './user.response';
import { UserAssembler } from './user.assembler';
@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  findById(id: string) {
    return this.http.get<UserResponse>(environment.apiUrl + '/users/' + encodeURIComponent(id)).pipe(map(UserAssembler.toEntity));
  }
}
