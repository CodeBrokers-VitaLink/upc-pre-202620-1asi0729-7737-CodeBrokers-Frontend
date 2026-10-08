import { Session } from '../domain/model/session.entity';
import { SessionResponse } from './session.response';
import { RoleAssembler } from './role.assembler';
export class SessionAssembler {
  static toEntity(response: SessionResponse): Session { return new Session(response.userId, RoleAssembler.toEntity(response.role)); }
  static toResponse(entity: Session): SessionResponse { return {userId: entity.userId, role: RoleAssembler.toResponse(entity.role)}; }
}
