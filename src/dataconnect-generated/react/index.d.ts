import { CreateUserData, GetProjectsData, UpdateSkillData, UpdateSkillVariables, ListPublicUsersData } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateUser(options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateUserData, undefined>;
export function useCreateUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateUserData, undefined>;

export function useGetProjects(options?: useDataConnectQueryOptions<GetProjectsData>): UseDataConnectQueryResult<GetProjectsData, undefined>;
export function useGetProjects(dc: DataConnect, options?: useDataConnectQueryOptions<GetProjectsData>): UseDataConnectQueryResult<GetProjectsData, undefined>;

export function useUpdateSkill(options?: useDataConnectMutationOptions<UpdateSkillData, FirebaseError, UpdateSkillVariables>): UseDataConnectMutationResult<UpdateSkillData, UpdateSkillVariables>;
export function useUpdateSkill(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateSkillData, FirebaseError, UpdateSkillVariables>): UseDataConnectMutationResult<UpdateSkillData, UpdateSkillVariables>;

export function useListPublicUsers(options?: useDataConnectQueryOptions<ListPublicUsersData>): UseDataConnectQueryResult<ListPublicUsersData, undefined>;
export function useListPublicUsers(dc: DataConnect, options?: useDataConnectQueryOptions<ListPublicUsersData>): UseDataConnectQueryResult<ListPublicUsersData, undefined>;
