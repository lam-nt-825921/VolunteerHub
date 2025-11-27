import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums";
import type * as Prisma from "../internal/prismaNamespace";
export type UserModel = runtime.Types.Result.DefaultSelection<Prisma.$UserPayload>;
export type AggregateUser = {
    _count: UserCountAggregateOutputType | null;
    _avg: UserAvgAggregateOutputType | null;
    _sum: UserSumAggregateOutputType | null;
    _min: UserMinAggregateOutputType | null;
    _max: UserMaxAggregateOutputType | null;
};
export type UserAvgAggregateOutputType = {
    id: number | null;
};
export type UserSumAggregateOutputType = {
    id: number | null;
};
export type UserMinAggregateOutputType = {
    id: number | null;
    email: string | null;
    password: string | null;
    fullName: string | null;
    avatar: string | null;
    phone: string | null;
    role: $Enums.Role | null;
    isActive: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    refreshToken: string | null;
    refreshTokenExpiresAt: Date | null;
};
export type UserMaxAggregateOutputType = {
    id: number | null;
    email: string | null;
    password: string | null;
    fullName: string | null;
    avatar: string | null;
    phone: string | null;
    role: $Enums.Role | null;
    isActive: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    refreshToken: string | null;
    refreshTokenExpiresAt: Date | null;
};
export type UserCountAggregateOutputType = {
    id: number;
    email: number;
    password: number;
    fullName: number;
    avatar: number;
    phone: number;
    role: number;
    isActive: number;
    createdAt: number;
    updatedAt: number;
    refreshToken: number;
    refreshTokenExpiresAt: number;
    _all: number;
};
export type UserAvgAggregateInputType = {
    id?: true;
};
export type UserSumAggregateInputType = {
    id?: true;
};
export type UserMinAggregateInputType = {
    id?: true;
    email?: true;
    password?: true;
    fullName?: true;
    avatar?: true;
    phone?: true;
    role?: true;
    isActive?: true;
    createdAt?: true;
    updatedAt?: true;
    refreshToken?: true;
    refreshTokenExpiresAt?: true;
};
export type UserMaxAggregateInputType = {
    id?: true;
    email?: true;
    password?: true;
    fullName?: true;
    avatar?: true;
    phone?: true;
    role?: true;
    isActive?: true;
    createdAt?: true;
    updatedAt?: true;
    refreshToken?: true;
    refreshTokenExpiresAt?: true;
};
export type UserCountAggregateInputType = {
    id?: true;
    email?: true;
    password?: true;
    fullName?: true;
    avatar?: true;
    phone?: true;
    role?: true;
    isActive?: true;
    createdAt?: true;
    updatedAt?: true;
    refreshToken?: true;
    refreshTokenExpiresAt?: true;
    _all?: true;
};
export type UserAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
    cursor?: Prisma.UserWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | UserCountAggregateInputType;
    _avg?: UserAvgAggregateInputType;
    _sum?: UserSumAggregateInputType;
    _min?: UserMinAggregateInputType;
    _max?: UserMaxAggregateInputType;
};
export type GetUserAggregateType<T extends UserAggregateArgs> = {
    [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateUser[P]> : Prisma.GetScalarType<T[P], AggregateUser[P]>;
};
export type UserGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithAggregationInput | Prisma.UserOrderByWithAggregationInput[];
    by: Prisma.UserScalarFieldEnum[] | Prisma.UserScalarFieldEnum;
    having?: Prisma.UserScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: UserCountAggregateInputType | true;
    _avg?: UserAvgAggregateInputType;
    _sum?: UserSumAggregateInputType;
    _min?: UserMinAggregateInputType;
    _max?: UserMaxAggregateInputType;
};
export type UserGroupByOutputType = {
    id: number;
    email: string;
    password: string;
    fullName: string;
    avatar: string | null;
    phone: string | null;
    role: $Enums.Role;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    refreshToken: string | null;
    refreshTokenExpiresAt: Date | null;
    _count: UserCountAggregateOutputType | null;
    _avg: UserAvgAggregateOutputType | null;
    _sum: UserSumAggregateOutputType | null;
    _min: UserMinAggregateOutputType | null;
    _max: UserMaxAggregateOutputType | null;
};
type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<UserGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], UserGroupByOutputType[P]> : Prisma.GetScalarType<T[P], UserGroupByOutputType[P]>;
}>>;
export type UserWhereInput = {
    AND?: Prisma.UserWhereInput | Prisma.UserWhereInput[];
    OR?: Prisma.UserWhereInput[];
    NOT?: Prisma.UserWhereInput | Prisma.UserWhereInput[];
    id?: Prisma.IntFilter<"User"> | number;
    email?: Prisma.StringFilter<"User"> | string;
    password?: Prisma.StringFilter<"User"> | string;
    fullName?: Prisma.StringFilter<"User"> | string;
    avatar?: Prisma.StringNullableFilter<"User"> | string | null;
    phone?: Prisma.StringNullableFilter<"User"> | string | null;
    role?: Prisma.EnumRoleFilter<"User"> | $Enums.Role;
    isActive?: Prisma.BoolFilter<"User"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"User"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"User"> | Date | string;
    refreshToken?: Prisma.StringNullableFilter<"User"> | string | null;
    refreshTokenExpiresAt?: Prisma.DateTimeNullableFilter<"User"> | Date | string | null;
    createdEvents?: Prisma.EventListRelationFilter;
    registrations?: Prisma.RegistrationListRelationFilter;
    posts?: Prisma.PostListRelationFilter;
    comments?: Prisma.CommentListRelationFilter;
    likes?: Prisma.LikeListRelationFilter;
};
export type UserOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    password?: Prisma.SortOrder;
    fullName?: Prisma.SortOrder;
    avatar?: Prisma.SortOrderInput | Prisma.SortOrder;
    phone?: Prisma.SortOrderInput | Prisma.SortOrder;
    role?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    refreshToken?: Prisma.SortOrderInput | Prisma.SortOrder;
    refreshTokenExpiresAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdEvents?: Prisma.EventOrderByRelationAggregateInput;
    registrations?: Prisma.RegistrationOrderByRelationAggregateInput;
    posts?: Prisma.PostOrderByRelationAggregateInput;
    comments?: Prisma.CommentOrderByRelationAggregateInput;
    likes?: Prisma.LikeOrderByRelationAggregateInput;
};
export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    email?: string;
    AND?: Prisma.UserWhereInput | Prisma.UserWhereInput[];
    OR?: Prisma.UserWhereInput[];
    NOT?: Prisma.UserWhereInput | Prisma.UserWhereInput[];
    password?: Prisma.StringFilter<"User"> | string;
    fullName?: Prisma.StringFilter<"User"> | string;
    avatar?: Prisma.StringNullableFilter<"User"> | string | null;
    phone?: Prisma.StringNullableFilter<"User"> | string | null;
    role?: Prisma.EnumRoleFilter<"User"> | $Enums.Role;
    isActive?: Prisma.BoolFilter<"User"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"User"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"User"> | Date | string;
    refreshToken?: Prisma.StringNullableFilter<"User"> | string | null;
    refreshTokenExpiresAt?: Prisma.DateTimeNullableFilter<"User"> | Date | string | null;
    createdEvents?: Prisma.EventListRelationFilter;
    registrations?: Prisma.RegistrationListRelationFilter;
    posts?: Prisma.PostListRelationFilter;
    comments?: Prisma.CommentListRelationFilter;
    likes?: Prisma.LikeListRelationFilter;
}, "id" | "email">;
export type UserOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    password?: Prisma.SortOrder;
    fullName?: Prisma.SortOrder;
    avatar?: Prisma.SortOrderInput | Prisma.SortOrder;
    phone?: Prisma.SortOrderInput | Prisma.SortOrder;
    role?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    refreshToken?: Prisma.SortOrderInput | Prisma.SortOrder;
    refreshTokenExpiresAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.UserCountOrderByAggregateInput;
    _avg?: Prisma.UserAvgOrderByAggregateInput;
    _max?: Prisma.UserMaxOrderByAggregateInput;
    _min?: Prisma.UserMinOrderByAggregateInput;
    _sum?: Prisma.UserSumOrderByAggregateInput;
};
export type UserScalarWhereWithAggregatesInput = {
    AND?: Prisma.UserScalarWhereWithAggregatesInput | Prisma.UserScalarWhereWithAggregatesInput[];
    OR?: Prisma.UserScalarWhereWithAggregatesInput[];
    NOT?: Prisma.UserScalarWhereWithAggregatesInput | Prisma.UserScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"User"> | number;
    email?: Prisma.StringWithAggregatesFilter<"User"> | string;
    password?: Prisma.StringWithAggregatesFilter<"User"> | string;
    fullName?: Prisma.StringWithAggregatesFilter<"User"> | string;
    avatar?: Prisma.StringNullableWithAggregatesFilter<"User"> | string | null;
    phone?: Prisma.StringNullableWithAggregatesFilter<"User"> | string | null;
    role?: Prisma.EnumRoleWithAggregatesFilter<"User"> | $Enums.Role;
    isActive?: Prisma.BoolWithAggregatesFilter<"User"> | boolean;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"User"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"User"> | Date | string;
    refreshToken?: Prisma.StringNullableWithAggregatesFilter<"User"> | string | null;
    refreshTokenExpiresAt?: Prisma.DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null;
};
export type UserCreateInput = {
    email: string;
    password: string;
    fullName: string;
    avatar?: string | null;
    phone?: string | null;
    role?: $Enums.Role;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    refreshToken?: string | null;
    refreshTokenExpiresAt?: Date | string | null;
    createdEvents?: Prisma.EventCreateNestedManyWithoutCreatorInput;
    registrations?: Prisma.RegistrationCreateNestedManyWithoutUserInput;
    posts?: Prisma.PostCreateNestedManyWithoutAuthorInput;
    comments?: Prisma.CommentCreateNestedManyWithoutAuthorInput;
    likes?: Prisma.LikeCreateNestedManyWithoutUserInput;
};
export type UserUncheckedCreateInput = {
    id?: number;
    email: string;
    password: string;
    fullName: string;
    avatar?: string | null;
    phone?: string | null;
    role?: $Enums.Role;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    refreshToken?: string | null;
    refreshTokenExpiresAt?: Date | string | null;
    createdEvents?: Prisma.EventUncheckedCreateNestedManyWithoutCreatorInput;
    registrations?: Prisma.RegistrationUncheckedCreateNestedManyWithoutUserInput;
    posts?: Prisma.PostUncheckedCreateNestedManyWithoutAuthorInput;
    comments?: Prisma.CommentUncheckedCreateNestedManyWithoutAuthorInput;
    likes?: Prisma.LikeUncheckedCreateNestedManyWithoutUserInput;
};
export type UserUpdateInput = {
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    fullName?: Prisma.StringFieldUpdateOperationsInput | string;
    avatar?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    role?: Prisma.EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    refreshToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    refreshTokenExpiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdEvents?: Prisma.EventUpdateManyWithoutCreatorNestedInput;
    registrations?: Prisma.RegistrationUpdateManyWithoutUserNestedInput;
    posts?: Prisma.PostUpdateManyWithoutAuthorNestedInput;
    comments?: Prisma.CommentUpdateManyWithoutAuthorNestedInput;
    likes?: Prisma.LikeUpdateManyWithoutUserNestedInput;
};
export type UserUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    fullName?: Prisma.StringFieldUpdateOperationsInput | string;
    avatar?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    role?: Prisma.EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    refreshToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    refreshTokenExpiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdEvents?: Prisma.EventUncheckedUpdateManyWithoutCreatorNestedInput;
    registrations?: Prisma.RegistrationUncheckedUpdateManyWithoutUserNestedInput;
    posts?: Prisma.PostUncheckedUpdateManyWithoutAuthorNestedInput;
    comments?: Prisma.CommentUncheckedUpdateManyWithoutAuthorNestedInput;
    likes?: Prisma.LikeUncheckedUpdateManyWithoutUserNestedInput;
};
export type UserCreateManyInput = {
    id?: number;
    email: string;
    password: string;
    fullName: string;
    avatar?: string | null;
    phone?: string | null;
    role?: $Enums.Role;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    refreshToken?: string | null;
    refreshTokenExpiresAt?: Date | string | null;
};
export type UserUpdateManyMutationInput = {
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    fullName?: Prisma.StringFieldUpdateOperationsInput | string;
    avatar?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    role?: Prisma.EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    refreshToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    refreshTokenExpiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type UserUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    fullName?: Prisma.StringFieldUpdateOperationsInput | string;
    avatar?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    role?: Prisma.EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    refreshToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    refreshTokenExpiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type UserCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    password?: Prisma.SortOrder;
    fullName?: Prisma.SortOrder;
    avatar?: Prisma.SortOrder;
    phone?: Prisma.SortOrder;
    role?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    refreshToken?: Prisma.SortOrder;
    refreshTokenExpiresAt?: Prisma.SortOrder;
};
export type UserAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type UserMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    password?: Prisma.SortOrder;
    fullName?: Prisma.SortOrder;
    avatar?: Prisma.SortOrder;
    phone?: Prisma.SortOrder;
    role?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    refreshToken?: Prisma.SortOrder;
    refreshTokenExpiresAt?: Prisma.SortOrder;
};
export type UserMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    password?: Prisma.SortOrder;
    fullName?: Prisma.SortOrder;
    avatar?: Prisma.SortOrder;
    phone?: Prisma.SortOrder;
    role?: Prisma.SortOrder;
    isActive?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    refreshToken?: Prisma.SortOrder;
    refreshTokenExpiresAt?: Prisma.SortOrder;
};
export type UserSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
};
export type UserScalarRelationFilter = {
    is?: Prisma.UserWhereInput;
    isNot?: Prisma.UserWhereInput;
};
export type StringFieldUpdateOperationsInput = {
    set?: string;
};
export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
};
export type EnumRoleFieldUpdateOperationsInput = {
    set?: $Enums.Role;
};
export type BoolFieldUpdateOperationsInput = {
    set?: boolean;
};
export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
};
export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null;
};
export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type UserCreateNestedOneWithoutCreatedEventsInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutCreatedEventsInput, Prisma.UserUncheckedCreateWithoutCreatedEventsInput>;
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutCreatedEventsInput;
    connect?: Prisma.UserWhereUniqueInput;
};
export type UserUpdateOneRequiredWithoutCreatedEventsNestedInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutCreatedEventsInput, Prisma.UserUncheckedCreateWithoutCreatedEventsInput>;
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutCreatedEventsInput;
    upsert?: Prisma.UserUpsertWithoutCreatedEventsInput;
    connect?: Prisma.UserWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.UserUpdateToOneWithWhereWithoutCreatedEventsInput, Prisma.UserUpdateWithoutCreatedEventsInput>, Prisma.UserUncheckedUpdateWithoutCreatedEventsInput>;
};
export type UserCreateNestedOneWithoutRegistrationsInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutRegistrationsInput, Prisma.UserUncheckedCreateWithoutRegistrationsInput>;
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutRegistrationsInput;
    connect?: Prisma.UserWhereUniqueInput;
};
export type UserUpdateOneRequiredWithoutRegistrationsNestedInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutRegistrationsInput, Prisma.UserUncheckedCreateWithoutRegistrationsInput>;
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutRegistrationsInput;
    upsert?: Prisma.UserUpsertWithoutRegistrationsInput;
    connect?: Prisma.UserWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.UserUpdateToOneWithWhereWithoutRegistrationsInput, Prisma.UserUpdateWithoutRegistrationsInput>, Prisma.UserUncheckedUpdateWithoutRegistrationsInput>;
};
export type UserCreateNestedOneWithoutPostsInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutPostsInput, Prisma.UserUncheckedCreateWithoutPostsInput>;
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutPostsInput;
    connect?: Prisma.UserWhereUniqueInput;
};
export type UserUpdateOneRequiredWithoutPostsNestedInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutPostsInput, Prisma.UserUncheckedCreateWithoutPostsInput>;
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutPostsInput;
    upsert?: Prisma.UserUpsertWithoutPostsInput;
    connect?: Prisma.UserWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.UserUpdateToOneWithWhereWithoutPostsInput, Prisma.UserUpdateWithoutPostsInput>, Prisma.UserUncheckedUpdateWithoutPostsInput>;
};
export type UserCreateNestedOneWithoutCommentsInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutCommentsInput, Prisma.UserUncheckedCreateWithoutCommentsInput>;
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutCommentsInput;
    connect?: Prisma.UserWhereUniqueInput;
};
export type UserUpdateOneRequiredWithoutCommentsNestedInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutCommentsInput, Prisma.UserUncheckedCreateWithoutCommentsInput>;
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutCommentsInput;
    upsert?: Prisma.UserUpsertWithoutCommentsInput;
    connect?: Prisma.UserWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.UserUpdateToOneWithWhereWithoutCommentsInput, Prisma.UserUpdateWithoutCommentsInput>, Prisma.UserUncheckedUpdateWithoutCommentsInput>;
};
export type UserCreateNestedOneWithoutLikesInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutLikesInput, Prisma.UserUncheckedCreateWithoutLikesInput>;
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutLikesInput;
    connect?: Prisma.UserWhereUniqueInput;
};
export type UserUpdateOneRequiredWithoutLikesNestedInput = {
    create?: Prisma.XOR<Prisma.UserCreateWithoutLikesInput, Prisma.UserUncheckedCreateWithoutLikesInput>;
    connectOrCreate?: Prisma.UserCreateOrConnectWithoutLikesInput;
    upsert?: Prisma.UserUpsertWithoutLikesInput;
    connect?: Prisma.UserWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.UserUpdateToOneWithWhereWithoutLikesInput, Prisma.UserUpdateWithoutLikesInput>, Prisma.UserUncheckedUpdateWithoutLikesInput>;
};
export type UserCreateWithoutCreatedEventsInput = {
    email: string;
    password: string;
    fullName: string;
    avatar?: string | null;
    phone?: string | null;
    role?: $Enums.Role;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    refreshToken?: string | null;
    refreshTokenExpiresAt?: Date | string | null;
    registrations?: Prisma.RegistrationCreateNestedManyWithoutUserInput;
    posts?: Prisma.PostCreateNestedManyWithoutAuthorInput;
    comments?: Prisma.CommentCreateNestedManyWithoutAuthorInput;
    likes?: Prisma.LikeCreateNestedManyWithoutUserInput;
};
export type UserUncheckedCreateWithoutCreatedEventsInput = {
    id?: number;
    email: string;
    password: string;
    fullName: string;
    avatar?: string | null;
    phone?: string | null;
    role?: $Enums.Role;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    refreshToken?: string | null;
    refreshTokenExpiresAt?: Date | string | null;
    registrations?: Prisma.RegistrationUncheckedCreateNestedManyWithoutUserInput;
    posts?: Prisma.PostUncheckedCreateNestedManyWithoutAuthorInput;
    comments?: Prisma.CommentUncheckedCreateNestedManyWithoutAuthorInput;
    likes?: Prisma.LikeUncheckedCreateNestedManyWithoutUserInput;
};
export type UserCreateOrConnectWithoutCreatedEventsInput = {
    where: Prisma.UserWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserCreateWithoutCreatedEventsInput, Prisma.UserUncheckedCreateWithoutCreatedEventsInput>;
};
export type UserUpsertWithoutCreatedEventsInput = {
    update: Prisma.XOR<Prisma.UserUpdateWithoutCreatedEventsInput, Prisma.UserUncheckedUpdateWithoutCreatedEventsInput>;
    create: Prisma.XOR<Prisma.UserCreateWithoutCreatedEventsInput, Prisma.UserUncheckedCreateWithoutCreatedEventsInput>;
    where?: Prisma.UserWhereInput;
};
export type UserUpdateToOneWithWhereWithoutCreatedEventsInput = {
    where?: Prisma.UserWhereInput;
    data: Prisma.XOR<Prisma.UserUpdateWithoutCreatedEventsInput, Prisma.UserUncheckedUpdateWithoutCreatedEventsInput>;
};
export type UserUpdateWithoutCreatedEventsInput = {
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    fullName?: Prisma.StringFieldUpdateOperationsInput | string;
    avatar?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    role?: Prisma.EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    refreshToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    refreshTokenExpiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    registrations?: Prisma.RegistrationUpdateManyWithoutUserNestedInput;
    posts?: Prisma.PostUpdateManyWithoutAuthorNestedInput;
    comments?: Prisma.CommentUpdateManyWithoutAuthorNestedInput;
    likes?: Prisma.LikeUpdateManyWithoutUserNestedInput;
};
export type UserUncheckedUpdateWithoutCreatedEventsInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    fullName?: Prisma.StringFieldUpdateOperationsInput | string;
    avatar?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    role?: Prisma.EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    refreshToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    refreshTokenExpiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    registrations?: Prisma.RegistrationUncheckedUpdateManyWithoutUserNestedInput;
    posts?: Prisma.PostUncheckedUpdateManyWithoutAuthorNestedInput;
    comments?: Prisma.CommentUncheckedUpdateManyWithoutAuthorNestedInput;
    likes?: Prisma.LikeUncheckedUpdateManyWithoutUserNestedInput;
};
export type UserCreateWithoutRegistrationsInput = {
    email: string;
    password: string;
    fullName: string;
    avatar?: string | null;
    phone?: string | null;
    role?: $Enums.Role;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    refreshToken?: string | null;
    refreshTokenExpiresAt?: Date | string | null;
    createdEvents?: Prisma.EventCreateNestedManyWithoutCreatorInput;
    posts?: Prisma.PostCreateNestedManyWithoutAuthorInput;
    comments?: Prisma.CommentCreateNestedManyWithoutAuthorInput;
    likes?: Prisma.LikeCreateNestedManyWithoutUserInput;
};
export type UserUncheckedCreateWithoutRegistrationsInput = {
    id?: number;
    email: string;
    password: string;
    fullName: string;
    avatar?: string | null;
    phone?: string | null;
    role?: $Enums.Role;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    refreshToken?: string | null;
    refreshTokenExpiresAt?: Date | string | null;
    createdEvents?: Prisma.EventUncheckedCreateNestedManyWithoutCreatorInput;
    posts?: Prisma.PostUncheckedCreateNestedManyWithoutAuthorInput;
    comments?: Prisma.CommentUncheckedCreateNestedManyWithoutAuthorInput;
    likes?: Prisma.LikeUncheckedCreateNestedManyWithoutUserInput;
};
export type UserCreateOrConnectWithoutRegistrationsInput = {
    where: Prisma.UserWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserCreateWithoutRegistrationsInput, Prisma.UserUncheckedCreateWithoutRegistrationsInput>;
};
export type UserUpsertWithoutRegistrationsInput = {
    update: Prisma.XOR<Prisma.UserUpdateWithoutRegistrationsInput, Prisma.UserUncheckedUpdateWithoutRegistrationsInput>;
    create: Prisma.XOR<Prisma.UserCreateWithoutRegistrationsInput, Prisma.UserUncheckedCreateWithoutRegistrationsInput>;
    where?: Prisma.UserWhereInput;
};
export type UserUpdateToOneWithWhereWithoutRegistrationsInput = {
    where?: Prisma.UserWhereInput;
    data: Prisma.XOR<Prisma.UserUpdateWithoutRegistrationsInput, Prisma.UserUncheckedUpdateWithoutRegistrationsInput>;
};
export type UserUpdateWithoutRegistrationsInput = {
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    fullName?: Prisma.StringFieldUpdateOperationsInput | string;
    avatar?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    role?: Prisma.EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    refreshToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    refreshTokenExpiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdEvents?: Prisma.EventUpdateManyWithoutCreatorNestedInput;
    posts?: Prisma.PostUpdateManyWithoutAuthorNestedInput;
    comments?: Prisma.CommentUpdateManyWithoutAuthorNestedInput;
    likes?: Prisma.LikeUpdateManyWithoutUserNestedInput;
};
export type UserUncheckedUpdateWithoutRegistrationsInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    fullName?: Prisma.StringFieldUpdateOperationsInput | string;
    avatar?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    role?: Prisma.EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    refreshToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    refreshTokenExpiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdEvents?: Prisma.EventUncheckedUpdateManyWithoutCreatorNestedInput;
    posts?: Prisma.PostUncheckedUpdateManyWithoutAuthorNestedInput;
    comments?: Prisma.CommentUncheckedUpdateManyWithoutAuthorNestedInput;
    likes?: Prisma.LikeUncheckedUpdateManyWithoutUserNestedInput;
};
export type UserCreateWithoutPostsInput = {
    email: string;
    password: string;
    fullName: string;
    avatar?: string | null;
    phone?: string | null;
    role?: $Enums.Role;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    refreshToken?: string | null;
    refreshTokenExpiresAt?: Date | string | null;
    createdEvents?: Prisma.EventCreateNestedManyWithoutCreatorInput;
    registrations?: Prisma.RegistrationCreateNestedManyWithoutUserInput;
    comments?: Prisma.CommentCreateNestedManyWithoutAuthorInput;
    likes?: Prisma.LikeCreateNestedManyWithoutUserInput;
};
export type UserUncheckedCreateWithoutPostsInput = {
    id?: number;
    email: string;
    password: string;
    fullName: string;
    avatar?: string | null;
    phone?: string | null;
    role?: $Enums.Role;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    refreshToken?: string | null;
    refreshTokenExpiresAt?: Date | string | null;
    createdEvents?: Prisma.EventUncheckedCreateNestedManyWithoutCreatorInput;
    registrations?: Prisma.RegistrationUncheckedCreateNestedManyWithoutUserInput;
    comments?: Prisma.CommentUncheckedCreateNestedManyWithoutAuthorInput;
    likes?: Prisma.LikeUncheckedCreateNestedManyWithoutUserInput;
};
export type UserCreateOrConnectWithoutPostsInput = {
    where: Prisma.UserWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserCreateWithoutPostsInput, Prisma.UserUncheckedCreateWithoutPostsInput>;
};
export type UserUpsertWithoutPostsInput = {
    update: Prisma.XOR<Prisma.UserUpdateWithoutPostsInput, Prisma.UserUncheckedUpdateWithoutPostsInput>;
    create: Prisma.XOR<Prisma.UserCreateWithoutPostsInput, Prisma.UserUncheckedCreateWithoutPostsInput>;
    where?: Prisma.UserWhereInput;
};
export type UserUpdateToOneWithWhereWithoutPostsInput = {
    where?: Prisma.UserWhereInput;
    data: Prisma.XOR<Prisma.UserUpdateWithoutPostsInput, Prisma.UserUncheckedUpdateWithoutPostsInput>;
};
export type UserUpdateWithoutPostsInput = {
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    fullName?: Prisma.StringFieldUpdateOperationsInput | string;
    avatar?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    role?: Prisma.EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    refreshToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    refreshTokenExpiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdEvents?: Prisma.EventUpdateManyWithoutCreatorNestedInput;
    registrations?: Prisma.RegistrationUpdateManyWithoutUserNestedInput;
    comments?: Prisma.CommentUpdateManyWithoutAuthorNestedInput;
    likes?: Prisma.LikeUpdateManyWithoutUserNestedInput;
};
export type UserUncheckedUpdateWithoutPostsInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    fullName?: Prisma.StringFieldUpdateOperationsInput | string;
    avatar?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    role?: Prisma.EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    refreshToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    refreshTokenExpiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdEvents?: Prisma.EventUncheckedUpdateManyWithoutCreatorNestedInput;
    registrations?: Prisma.RegistrationUncheckedUpdateManyWithoutUserNestedInput;
    comments?: Prisma.CommentUncheckedUpdateManyWithoutAuthorNestedInput;
    likes?: Prisma.LikeUncheckedUpdateManyWithoutUserNestedInput;
};
export type UserCreateWithoutCommentsInput = {
    email: string;
    password: string;
    fullName: string;
    avatar?: string | null;
    phone?: string | null;
    role?: $Enums.Role;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    refreshToken?: string | null;
    refreshTokenExpiresAt?: Date | string | null;
    createdEvents?: Prisma.EventCreateNestedManyWithoutCreatorInput;
    registrations?: Prisma.RegistrationCreateNestedManyWithoutUserInput;
    posts?: Prisma.PostCreateNestedManyWithoutAuthorInput;
    likes?: Prisma.LikeCreateNestedManyWithoutUserInput;
};
export type UserUncheckedCreateWithoutCommentsInput = {
    id?: number;
    email: string;
    password: string;
    fullName: string;
    avatar?: string | null;
    phone?: string | null;
    role?: $Enums.Role;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    refreshToken?: string | null;
    refreshTokenExpiresAt?: Date | string | null;
    createdEvents?: Prisma.EventUncheckedCreateNestedManyWithoutCreatorInput;
    registrations?: Prisma.RegistrationUncheckedCreateNestedManyWithoutUserInput;
    posts?: Prisma.PostUncheckedCreateNestedManyWithoutAuthorInput;
    likes?: Prisma.LikeUncheckedCreateNestedManyWithoutUserInput;
};
export type UserCreateOrConnectWithoutCommentsInput = {
    where: Prisma.UserWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserCreateWithoutCommentsInput, Prisma.UserUncheckedCreateWithoutCommentsInput>;
};
export type UserUpsertWithoutCommentsInput = {
    update: Prisma.XOR<Prisma.UserUpdateWithoutCommentsInput, Prisma.UserUncheckedUpdateWithoutCommentsInput>;
    create: Prisma.XOR<Prisma.UserCreateWithoutCommentsInput, Prisma.UserUncheckedCreateWithoutCommentsInput>;
    where?: Prisma.UserWhereInput;
};
export type UserUpdateToOneWithWhereWithoutCommentsInput = {
    where?: Prisma.UserWhereInput;
    data: Prisma.XOR<Prisma.UserUpdateWithoutCommentsInput, Prisma.UserUncheckedUpdateWithoutCommentsInput>;
};
export type UserUpdateWithoutCommentsInput = {
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    fullName?: Prisma.StringFieldUpdateOperationsInput | string;
    avatar?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    role?: Prisma.EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    refreshToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    refreshTokenExpiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdEvents?: Prisma.EventUpdateManyWithoutCreatorNestedInput;
    registrations?: Prisma.RegistrationUpdateManyWithoutUserNestedInput;
    posts?: Prisma.PostUpdateManyWithoutAuthorNestedInput;
    likes?: Prisma.LikeUpdateManyWithoutUserNestedInput;
};
export type UserUncheckedUpdateWithoutCommentsInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    fullName?: Prisma.StringFieldUpdateOperationsInput | string;
    avatar?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    role?: Prisma.EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    refreshToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    refreshTokenExpiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdEvents?: Prisma.EventUncheckedUpdateManyWithoutCreatorNestedInput;
    registrations?: Prisma.RegistrationUncheckedUpdateManyWithoutUserNestedInput;
    posts?: Prisma.PostUncheckedUpdateManyWithoutAuthorNestedInput;
    likes?: Prisma.LikeUncheckedUpdateManyWithoutUserNestedInput;
};
export type UserCreateWithoutLikesInput = {
    email: string;
    password: string;
    fullName: string;
    avatar?: string | null;
    phone?: string | null;
    role?: $Enums.Role;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    refreshToken?: string | null;
    refreshTokenExpiresAt?: Date | string | null;
    createdEvents?: Prisma.EventCreateNestedManyWithoutCreatorInput;
    registrations?: Prisma.RegistrationCreateNestedManyWithoutUserInput;
    posts?: Prisma.PostCreateNestedManyWithoutAuthorInput;
    comments?: Prisma.CommentCreateNestedManyWithoutAuthorInput;
};
export type UserUncheckedCreateWithoutLikesInput = {
    id?: number;
    email: string;
    password: string;
    fullName: string;
    avatar?: string | null;
    phone?: string | null;
    role?: $Enums.Role;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    refreshToken?: string | null;
    refreshTokenExpiresAt?: Date | string | null;
    createdEvents?: Prisma.EventUncheckedCreateNestedManyWithoutCreatorInput;
    registrations?: Prisma.RegistrationUncheckedCreateNestedManyWithoutUserInput;
    posts?: Prisma.PostUncheckedCreateNestedManyWithoutAuthorInput;
    comments?: Prisma.CommentUncheckedCreateNestedManyWithoutAuthorInput;
};
export type UserCreateOrConnectWithoutLikesInput = {
    where: Prisma.UserWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserCreateWithoutLikesInput, Prisma.UserUncheckedCreateWithoutLikesInput>;
};
export type UserUpsertWithoutLikesInput = {
    update: Prisma.XOR<Prisma.UserUpdateWithoutLikesInput, Prisma.UserUncheckedUpdateWithoutLikesInput>;
    create: Prisma.XOR<Prisma.UserCreateWithoutLikesInput, Prisma.UserUncheckedCreateWithoutLikesInput>;
    where?: Prisma.UserWhereInput;
};
export type UserUpdateToOneWithWhereWithoutLikesInput = {
    where?: Prisma.UserWhereInput;
    data: Prisma.XOR<Prisma.UserUpdateWithoutLikesInput, Prisma.UserUncheckedUpdateWithoutLikesInput>;
};
export type UserUpdateWithoutLikesInput = {
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    fullName?: Prisma.StringFieldUpdateOperationsInput | string;
    avatar?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    role?: Prisma.EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    refreshToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    refreshTokenExpiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdEvents?: Prisma.EventUpdateManyWithoutCreatorNestedInput;
    registrations?: Prisma.RegistrationUpdateManyWithoutUserNestedInput;
    posts?: Prisma.PostUpdateManyWithoutAuthorNestedInput;
    comments?: Prisma.CommentUpdateManyWithoutAuthorNestedInput;
};
export type UserUncheckedUpdateWithoutLikesInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    password?: Prisma.StringFieldUpdateOperationsInput | string;
    fullName?: Prisma.StringFieldUpdateOperationsInput | string;
    avatar?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    role?: Prisma.EnumRoleFieldUpdateOperationsInput | $Enums.Role;
    isActive?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    refreshToken?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    refreshTokenExpiresAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdEvents?: Prisma.EventUncheckedUpdateManyWithoutCreatorNestedInput;
    registrations?: Prisma.RegistrationUncheckedUpdateManyWithoutUserNestedInput;
    posts?: Prisma.PostUncheckedUpdateManyWithoutAuthorNestedInput;
    comments?: Prisma.CommentUncheckedUpdateManyWithoutAuthorNestedInput;
};
export type UserCountOutputType = {
    createdEvents: number;
    registrations: number;
    posts: number;
    comments: number;
    likes: number;
};
export type UserCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    createdEvents?: boolean | UserCountOutputTypeCountCreatedEventsArgs;
    registrations?: boolean | UserCountOutputTypeCountRegistrationsArgs;
    posts?: boolean | UserCountOutputTypeCountPostsArgs;
    comments?: boolean | UserCountOutputTypeCountCommentsArgs;
    likes?: boolean | UserCountOutputTypeCountLikesArgs;
};
export type UserCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserCountOutputTypeSelect<ExtArgs> | null;
};
export type UserCountOutputTypeCountCreatedEventsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EventWhereInput;
};
export type UserCountOutputTypeCountRegistrationsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RegistrationWhereInput;
};
export type UserCountOutputTypeCountPostsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PostWhereInput;
};
export type UserCountOutputTypeCountCommentsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.CommentWhereInput;
};
export type UserCountOutputTypeCountLikesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.LikeWhereInput;
};
export type UserSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    email?: boolean;
    password?: boolean;
    fullName?: boolean;
    avatar?: boolean;
    phone?: boolean;
    role?: boolean;
    isActive?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    refreshToken?: boolean;
    refreshTokenExpiresAt?: boolean;
    createdEvents?: boolean | Prisma.User$createdEventsArgs<ExtArgs>;
    registrations?: boolean | Prisma.User$registrationsArgs<ExtArgs>;
    posts?: boolean | Prisma.User$postsArgs<ExtArgs>;
    comments?: boolean | Prisma.User$commentsArgs<ExtArgs>;
    likes?: boolean | Prisma.User$likesArgs<ExtArgs>;
    _count?: boolean | Prisma.UserCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["user"]>;
export type UserSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    email?: boolean;
    password?: boolean;
    fullName?: boolean;
    avatar?: boolean;
    phone?: boolean;
    role?: boolean;
    isActive?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    refreshToken?: boolean;
    refreshTokenExpiresAt?: boolean;
}, ExtArgs["result"]["user"]>;
export type UserSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    email?: boolean;
    password?: boolean;
    fullName?: boolean;
    avatar?: boolean;
    phone?: boolean;
    role?: boolean;
    isActive?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    refreshToken?: boolean;
    refreshTokenExpiresAt?: boolean;
}, ExtArgs["result"]["user"]>;
export type UserSelectScalar = {
    id?: boolean;
    email?: boolean;
    password?: boolean;
    fullName?: boolean;
    avatar?: boolean;
    phone?: boolean;
    role?: boolean;
    isActive?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    refreshToken?: boolean;
    refreshTokenExpiresAt?: boolean;
};
export type UserOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "email" | "password" | "fullName" | "avatar" | "phone" | "role" | "isActive" | "createdAt" | "updatedAt" | "refreshToken" | "refreshTokenExpiresAt", ExtArgs["result"]["user"]>;
export type UserInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    createdEvents?: boolean | Prisma.User$createdEventsArgs<ExtArgs>;
    registrations?: boolean | Prisma.User$registrationsArgs<ExtArgs>;
    posts?: boolean | Prisma.User$postsArgs<ExtArgs>;
    comments?: boolean | Prisma.User$commentsArgs<ExtArgs>;
    likes?: boolean | Prisma.User$likesArgs<ExtArgs>;
    _count?: boolean | Prisma.UserCountOutputTypeDefaultArgs<ExtArgs>;
};
export type UserIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type UserIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $UserPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "User";
    objects: {
        createdEvents: Prisma.$EventPayload<ExtArgs>[];
        registrations: Prisma.$RegistrationPayload<ExtArgs>[];
        posts: Prisma.$PostPayload<ExtArgs>[];
        comments: Prisma.$CommentPayload<ExtArgs>[];
        likes: Prisma.$LikePayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        email: string;
        password: string;
        fullName: string;
        avatar: string | null;
        phone: string | null;
        role: $Enums.Role;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        refreshToken: string | null;
        refreshTokenExpiresAt: Date | null;
    }, ExtArgs["result"]["user"]>;
    composites: {};
};
export type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$UserPayload, S>;
export type UserCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: UserCountAggregateInputType | true;
};
export interface UserDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['User'];
        meta: {
            name: 'User';
        };
    };
    findUnique<T extends UserFindUniqueArgs>(args: Prisma.SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends UserFindFirstArgs>(args?: Prisma.SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends UserFindManyArgs>(args?: Prisma.SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends UserCreateArgs>(args: Prisma.SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends UserCreateManyArgs>(args?: Prisma.SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends UserDeleteArgs>(args: Prisma.SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends UserUpdateArgs>(args: Prisma.SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends UserDeleteManyArgs>(args?: Prisma.SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends UserUpdateManyArgs>(args: Prisma.SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends UserUpsertArgs>(args: Prisma.SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends UserCountArgs>(args?: Prisma.Subset<T, UserCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], UserCountAggregateOutputType> : number>;
    aggregate<T extends UserAggregateArgs>(args: Prisma.Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>;
    groupBy<T extends UserGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: UserGroupByArgs['orderBy'];
    } : {
        orderBy?: UserGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: UserFieldRefs;
}
export interface Prisma__UserClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    createdEvents<T extends Prisma.User$createdEventsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.User$createdEventsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    registrations<T extends Prisma.User$registrationsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.User$registrationsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RegistrationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    posts<T extends Prisma.User$postsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.User$postsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    comments<T extends Prisma.User$commentsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.User$commentsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$CommentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    likes<T extends Prisma.User$likesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.User$likesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$LikePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface UserFieldRefs {
    readonly id: Prisma.FieldRef<"User", 'Int'>;
    readonly email: Prisma.FieldRef<"User", 'String'>;
    readonly password: Prisma.FieldRef<"User", 'String'>;
    readonly fullName: Prisma.FieldRef<"User", 'String'>;
    readonly avatar: Prisma.FieldRef<"User", 'String'>;
    readonly phone: Prisma.FieldRef<"User", 'String'>;
    readonly role: Prisma.FieldRef<"User", 'Role'>;
    readonly isActive: Prisma.FieldRef<"User", 'Boolean'>;
    readonly createdAt: Prisma.FieldRef<"User", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"User", 'DateTime'>;
    readonly refreshToken: Prisma.FieldRef<"User", 'String'>;
    readonly refreshTokenExpiresAt: Prisma.FieldRef<"User", 'DateTime'>;
}
export type UserFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where: Prisma.UserWhereUniqueInput;
};
export type UserFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where: Prisma.UserWhereUniqueInput;
};
export type UserFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
    cursor?: Prisma.UserWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UserScalarFieldEnum | Prisma.UserScalarFieldEnum[];
};
export type UserFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
    cursor?: Prisma.UserWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UserScalarFieldEnum | Prisma.UserScalarFieldEnum[];
};
export type UserFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput | Prisma.UserOrderByWithRelationInput[];
    cursor?: Prisma.UserWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.UserScalarFieldEnum | Prisma.UserScalarFieldEnum[];
};
export type UserCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UserCreateInput, Prisma.UserUncheckedCreateInput>;
};
export type UserCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.UserCreateManyInput | Prisma.UserCreateManyInput[];
};
export type UserCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    data: Prisma.UserCreateManyInput | Prisma.UserCreateManyInput[];
};
export type UserUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UserUpdateInput, Prisma.UserUncheckedUpdateInput>;
    where: Prisma.UserWhereUniqueInput;
};
export type UserUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.UserUpdateManyMutationInput, Prisma.UserUncheckedUpdateManyInput>;
    where?: Prisma.UserWhereInput;
    limit?: number;
};
export type UserUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.UserUpdateManyMutationInput, Prisma.UserUncheckedUpdateManyInput>;
    where?: Prisma.UserWhereInput;
    limit?: number;
};
export type UserUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where: Prisma.UserWhereUniqueInput;
    create: Prisma.XOR<Prisma.UserCreateInput, Prisma.UserUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.UserUpdateInput, Prisma.UserUncheckedUpdateInput>;
};
export type UserDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
    where: Prisma.UserWhereUniqueInput;
};
export type UserDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UserWhereInput;
    limit?: number;
};
export type User$createdEventsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EventSelect<ExtArgs> | null;
    omit?: Prisma.EventOmit<ExtArgs> | null;
    include?: Prisma.EventInclude<ExtArgs> | null;
    where?: Prisma.EventWhereInput;
    orderBy?: Prisma.EventOrderByWithRelationInput | Prisma.EventOrderByWithRelationInput[];
    cursor?: Prisma.EventWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.EventScalarFieldEnum | Prisma.EventScalarFieldEnum[];
};
export type User$registrationsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RegistrationSelect<ExtArgs> | null;
    omit?: Prisma.RegistrationOmit<ExtArgs> | null;
    include?: Prisma.RegistrationInclude<ExtArgs> | null;
    where?: Prisma.RegistrationWhereInput;
    orderBy?: Prisma.RegistrationOrderByWithRelationInput | Prisma.RegistrationOrderByWithRelationInput[];
    cursor?: Prisma.RegistrationWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RegistrationScalarFieldEnum | Prisma.RegistrationScalarFieldEnum[];
};
export type User$postsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.PostSelect<ExtArgs> | null;
    omit?: Prisma.PostOmit<ExtArgs> | null;
    include?: Prisma.PostInclude<ExtArgs> | null;
    where?: Prisma.PostWhereInput;
    orderBy?: Prisma.PostOrderByWithRelationInput | Prisma.PostOrderByWithRelationInput[];
    cursor?: Prisma.PostWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PostScalarFieldEnum | Prisma.PostScalarFieldEnum[];
};
export type User$commentsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.CommentSelect<ExtArgs> | null;
    omit?: Prisma.CommentOmit<ExtArgs> | null;
    include?: Prisma.CommentInclude<ExtArgs> | null;
    where?: Prisma.CommentWhereInput;
    orderBy?: Prisma.CommentOrderByWithRelationInput | Prisma.CommentOrderByWithRelationInput[];
    cursor?: Prisma.CommentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.CommentScalarFieldEnum | Prisma.CommentScalarFieldEnum[];
};
export type User$likesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.LikeSelect<ExtArgs> | null;
    omit?: Prisma.LikeOmit<ExtArgs> | null;
    include?: Prisma.LikeInclude<ExtArgs> | null;
    where?: Prisma.LikeWhereInput;
    orderBy?: Prisma.LikeOrderByWithRelationInput | Prisma.LikeOrderByWithRelationInput[];
    cursor?: Prisma.LikeWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.LikeScalarFieldEnum | Prisma.LikeScalarFieldEnum[];
};
export type UserDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.UserSelect<ExtArgs> | null;
    omit?: Prisma.UserOmit<ExtArgs> | null;
    include?: Prisma.UserInclude<ExtArgs> | null;
};
export {};
