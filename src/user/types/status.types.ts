export enum UserStatusType {
  ACTIVE = 'active', // 정상
  INACTIVE = 'inactive', // 휴면
  SUSPENDED = 'suspended', // 수동정지 (신고, 규정 위반 등으로 관리자가 정지 할 경우)
  DELETED = 'deleted', // 탈퇴
}

export const UserStatusTypeList = Object.values(UserStatusType);

