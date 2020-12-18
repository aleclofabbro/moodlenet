import { GraphQLResolveInfo } from 'graphql';
import { Context, RootValue } from '../../../GQL';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = { [X in Exclude<keyof T, K>]?: T[X] } & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Vertex = {
  id: Scalars['ID'];
};

export type WithIcon = {
  icon: Scalars['String'];
};

export type WithName = {
  name: Scalars['String'];
};

export type WithSummary = {
  summary: Scalars['String'];
};

export type Edge = {
  id: Scalars['ID'];
};

export type PageInput = {
  limit?: Maybe<Scalars['Int']>;
  after?: Maybe<Scalars['ID']>;
  before?: Maybe<Scalars['ID']>;
};

export type Follower = User;

export type Followed = User | Subject;

export type Follows = {
  id: Scalars['ID'];
  follower?: Maybe<Follower>;
  follows?: Maybe<Followed>;
};

export type UserFollowsSubject = Follows & {
  id: Scalars['ID'];
  follower?: Maybe<User>;
  follows?: Maybe<Subject>;
};

export type User = UserVertex & Vertex & WithIcon & WithName & WithSummary & {
  bio: Scalars['String'];
  followers: Array<UserFollowsUser>;
  followsSubjects: Array<UserFollowsSubject>;
  followsUsers: Array<UserFollowsUser>;
  icon: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
  summary: Scalars['String'];
};


export type UserFollowersArgs = {
  page?: Maybe<PageInput>;
};


export type UserFollowsSubjectsArgs = {
  page?: Maybe<PageInput>;
};


export type UserFollowsUsersArgs = {
  page?: Maybe<PageInput>;
};

export type Subject = SubjectVertex & Vertex & WithIcon & WithName & WithSummary & {
  followers: Array<UserFollowsSubject>;
  icon: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
  summary: Scalars['String'];
};


export type SubjectFollowersArgs = {
  page?: Maybe<PageInput>;
};

export type UserFollowsUser = Follows & {
  id: Scalars['ID'];
  follower?: Maybe<User>;
  follows?: Maybe<User>;
};

export type SubjectVertex = {
  id: Scalars['ID'];
  icon: Scalars['String'];
  name: Scalars['String'];
  summary: Scalars['String'];
};

export type Query = {
  subject?: Maybe<Subject>;
  user?: Maybe<User>;
};


export type QuerySubjectArgs = {
  id: Scalars['ID'];
};


export type QueryUserArgs = {
  id: Scalars['ID'];
};

export type UserVertex = {
  id: Scalars['ID'];
  icon: Scalars['String'];
  name: Scalars['String'];
  summary: Scalars['String'];
  bio: Scalars['String'];
};

export type UserQuery = {
  id?: Maybe<Scalars['ID']>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> = LegacyStitchingResolver<TResult, TParent, TContext, TArgs> | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Vertex: ResolversTypes['User'] | ResolversTypes['Subject'];
  ID: ResolverTypeWrapper<Scalars['ID']>;
  WithIcon: ResolversTypes['User'] | ResolversTypes['Subject'];
  String: ResolverTypeWrapper<Scalars['String']>;
  WithName: ResolversTypes['User'] | ResolversTypes['Subject'];
  WithSummary: ResolversTypes['User'] | ResolversTypes['Subject'];
  Edge: never;
  PageInput: PageInput;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Follower: ResolversTypes['User'];
  Followed: ResolversTypes['User'] | ResolversTypes['Subject'];
  Follows: ResolversTypes['UserFollowsSubject'] | ResolversTypes['UserFollowsUser'];
  UserFollowsSubject: ResolverTypeWrapper<UserFollowsSubject>;
  User: ResolverTypeWrapper<User>;
  Subject: ResolverTypeWrapper<Subject>;
  UserFollowsUser: ResolverTypeWrapper<UserFollowsUser>;
  SubjectVertex: ResolversTypes['Subject'];
  Query: ResolverTypeWrapper<RootValue>;
  UserVertex: ResolversTypes['User'];
  UserQuery: UserQuery;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Vertex: ResolversParentTypes['User'] | ResolversParentTypes['Subject'];
  ID: Scalars['ID'];
  WithIcon: ResolversParentTypes['User'] | ResolversParentTypes['Subject'];
  String: Scalars['String'];
  WithName: ResolversParentTypes['User'] | ResolversParentTypes['Subject'];
  WithSummary: ResolversParentTypes['User'] | ResolversParentTypes['Subject'];
  Edge: never;
  PageInput: PageInput;
  Int: Scalars['Int'];
  Follower: ResolversParentTypes['User'];
  Followed: ResolversParentTypes['User'] | ResolversParentTypes['Subject'];
  Follows: ResolversParentTypes['UserFollowsSubject'] | ResolversParentTypes['UserFollowsUser'];
  UserFollowsSubject: UserFollowsSubject;
  User: User;
  Subject: Subject;
  UserFollowsUser: UserFollowsUser;
  SubjectVertex: ResolversParentTypes['Subject'];
  Query: RootValue;
  UserVertex: ResolversParentTypes['User'];
  UserQuery: UserQuery;
  Boolean: Scalars['Boolean'];
};

export type VertexResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Vertex'] = ResolversParentTypes['Vertex']> = {
  __resolveType: TypeResolveFn<'User' | 'Subject', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type WithIconResolvers<ContextType = Context, ParentType extends ResolversParentTypes['WithIcon'] = ResolversParentTypes['WithIcon']> = {
  __resolveType: TypeResolveFn<'User' | 'Subject', ParentType, ContextType>;
  icon?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type WithNameResolvers<ContextType = Context, ParentType extends ResolversParentTypes['WithName'] = ResolversParentTypes['WithName']> = {
  __resolveType: TypeResolveFn<'User' | 'Subject', ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type WithSummaryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['WithSummary'] = ResolversParentTypes['WithSummary']> = {
  __resolveType: TypeResolveFn<'User' | 'Subject', ParentType, ContextType>;
  summary?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type EdgeResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Edge'] = ResolversParentTypes['Edge']> = {
  __resolveType: TypeResolveFn<null, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type FollowerResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Follower'] = ResolversParentTypes['Follower']> = {
  __resolveType: TypeResolveFn<'User', ParentType, ContextType>;
};

export type FollowedResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Followed'] = ResolversParentTypes['Followed']> = {
  __resolveType: TypeResolveFn<'User' | 'Subject', ParentType, ContextType>;
};

export type FollowsResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Follows'] = ResolversParentTypes['Follows']> = {
  __resolveType: TypeResolveFn<'UserFollowsSubject' | 'UserFollowsUser', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  follower?: Resolver<Maybe<ResolversTypes['Follower']>, ParentType, ContextType>;
  follows?: Resolver<Maybe<ResolversTypes['Followed']>, ParentType, ContextType>;
};

export type UserFollowsSubjectResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserFollowsSubject'] = ResolversParentTypes['UserFollowsSubject']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  follower?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  follows?: Resolver<Maybe<ResolversTypes['Subject']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  bio?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  followers?: Resolver<Array<ResolversTypes['UserFollowsUser']>, ParentType, ContextType, RequireFields<UserFollowersArgs, never>>;
  followsSubjects?: Resolver<Array<ResolversTypes['UserFollowsSubject']>, ParentType, ContextType, RequireFields<UserFollowsSubjectsArgs, never>>;
  followsUsers?: Resolver<Array<ResolversTypes['UserFollowsUser']>, ParentType, ContextType, RequireFields<UserFollowsUsersArgs, never>>;
  icon?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  summary?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubjectResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Subject'] = ResolversParentTypes['Subject']> = {
  followers?: Resolver<Array<ResolversTypes['UserFollowsSubject']>, ParentType, ContextType, RequireFields<SubjectFollowersArgs, never>>;
  icon?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  summary?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserFollowsUserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserFollowsUser'] = ResolversParentTypes['UserFollowsUser']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  follower?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  follows?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SubjectVertexResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SubjectVertex'] = ResolversParentTypes['SubjectVertex']> = {
  __resolveType: TypeResolveFn<'Subject', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  icon?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  summary?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  subject?: Resolver<Maybe<ResolversTypes['Subject']>, ParentType, ContextType, RequireFields<QuerySubjectArgs, 'id'>>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'id'>>;
};

export type UserVertexResolvers<ContextType = Context, ParentType extends ResolversParentTypes['UserVertex'] = ResolversParentTypes['UserVertex']> = {
  __resolveType: TypeResolveFn<'User', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  icon?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  summary?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  bio?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  Vertex?: VertexResolvers<ContextType>;
  WithIcon?: WithIconResolvers<ContextType>;
  WithName?: WithNameResolvers<ContextType>;
  WithSummary?: WithSummaryResolvers<ContextType>;
  Edge?: EdgeResolvers<ContextType>;
  Follower?: FollowerResolvers<ContextType>;
  Followed?: FollowedResolvers<ContextType>;
  Follows?: FollowsResolvers<ContextType>;
  UserFollowsSubject?: UserFollowsSubjectResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  Subject?: SubjectResolvers<ContextType>;
  UserFollowsUser?: UserFollowsUserResolvers<ContextType>;
  SubjectVertex?: SubjectVertexResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  UserVertex?: UserVertexResolvers<ContextType>;
};


/**
 * @deprecated
 * Use "Resolvers" root object instead. If you wish to get "IResolvers", add "typesPrefix: I" to your config.
 */
export type IResolvers<ContextType = Context> = Resolvers<ContextType>;
