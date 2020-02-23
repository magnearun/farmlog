import { AccountsModuleContext } from '@accounts/graphql-api';
import { User } from '@accounts/typeorm';
import { ContainerInstance } from 'typedi';

export interface Context extends AccountsModuleContext<User> {
  requestId: number;
  container: ContainerInstance;
  ipAddress?: string;
}
