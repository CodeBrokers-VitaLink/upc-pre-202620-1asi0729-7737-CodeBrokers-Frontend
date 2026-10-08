import { Role } from '../domain/model/role.entity';
import { RoleResponse } from './role.response';
export class RoleAssembler {
  static toEntity(response: RoleResponse): Role { return new Role(response.code); }
  static toResponse(entity: Role): RoleResponse { return { code: entity.code }; }
}
