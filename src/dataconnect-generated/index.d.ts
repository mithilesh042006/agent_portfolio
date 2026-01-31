import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface CreateUserData {
  user_insert: User_Key;
}

export interface Experience_Key {
  id: UUIDString;
  __typename?: 'Experience_Key';
}

export interface GetProjectsData {
  projects: ({
    id: UUIDString;
    title: string;
    description: string;
  } & Project_Key)[];
}

export interface ListPublicUsersData {
  users: ({
    id: UUIDString;
    name: string;
  } & User_Key)[];
}

export interface Project_Key {
  id: UUIDString;
  __typename?: 'Project_Key';
}

export interface Skill_Key {
  id: UUIDString;
  __typename?: 'Skill_Key';
}

export interface UpdateSkillData {
  skill_update?: Skill_Key | null;
}

export interface UpdateSkillVariables {
  id: UUIDString;
  proficiencyLevel?: string | null;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateUserData, undefined>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(): MutationPromise<CreateUserData, undefined>;
export function createUser(dc: DataConnect): MutationPromise<CreateUserData, undefined>;

interface GetProjectsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetProjectsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetProjectsData, undefined>;
  operationName: string;
}
export const getProjectsRef: GetProjectsRef;

export function getProjects(): QueryPromise<GetProjectsData, undefined>;
export function getProjects(dc: DataConnect): QueryPromise<GetProjectsData, undefined>;

interface UpdateSkillRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateSkillVariables): MutationRef<UpdateSkillData, UpdateSkillVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateSkillVariables): MutationRef<UpdateSkillData, UpdateSkillVariables>;
  operationName: string;
}
export const updateSkillRef: UpdateSkillRef;

export function updateSkill(vars: UpdateSkillVariables): MutationPromise<UpdateSkillData, UpdateSkillVariables>;
export function updateSkill(dc: DataConnect, vars: UpdateSkillVariables): MutationPromise<UpdateSkillData, UpdateSkillVariables>;

interface ListPublicUsersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPublicUsersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListPublicUsersData, undefined>;
  operationName: string;
}
export const listPublicUsersRef: ListPublicUsersRef;

export function listPublicUsers(): QueryPromise<ListPublicUsersData, undefined>;
export function listPublicUsers(dc: DataConnect): QueryPromise<ListPublicUsersData, undefined>;

