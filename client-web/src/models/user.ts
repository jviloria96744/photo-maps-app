export interface UserResponse {
  datetime_created: string;
  datetime_updated: string;
  pk: string;
  sk: string;
  username: string;
}

export interface User {
  id: string;
  username: string;
  lastLoginDate?: string;
  userCreatedDate?: string;
}
