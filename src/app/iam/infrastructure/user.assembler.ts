import { User } from '../domain/model/user.entity';
import { RoleAssembler } from './role.assembler';
import { UserResponse } from './user.response';
export class UserAssembler {
  static toEntity(response: UserResponse): User {
    return new User(response.id, response.name, response.email, RoleAssembler.toEntity({code: response.role}), response.phone ?? null, response.hospital ?? null);
  }
}
