export enum PostStatusType {
  ACTIVE = 'active', // 정상
  DELETED = 'deleted', // 삭제
  HIDDEN = 'hidden', // 숨김
  REPORTED = 'reported', // 신고됨
  SUSPENDED = 'suspended', // 게시중지
}

export const PostStatusTypeList = Object.values(PostStatusType);

