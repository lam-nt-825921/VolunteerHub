import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums";
import type * as Prisma from "../internal/prismaNamespace";
export type EventModel = runtime.Types.Result.DefaultSelection<Prisma.$EventPayload>;
export type AggregateEvent = {
    _count: EventCountAggregateOutputType | null;
    _avg: EventAvgAggregateOutputType | null;
    _sum: EventSumAggregateOutputType | null;
    _min: EventMinAggregateOutputType | null;
    _max: EventMaxAggregateOutputType | null;
};
export type EventAvgAggregateOutputType = {
    id: number | null;
    maxParticipants: number | null;
    creatorId: number | null;
};
export type EventSumAggregateOutputType = {
    id: number | null;
    maxParticipants: number | null;
    creatorId: number | null;
};
export type EventMinAggregateOutputType = {
    id: number | null;
    title: string | null;
    description: string | null;
    location: string | null;
    eventDate: Date | null;
    maxParticipants: number | null;
    thumbnail: string | null;
    status: $Enums.EventStatus | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    creatorId: number | null;
};
export type EventMaxAggregateOutputType = {
    id: number | null;
    title: string | null;
    description: string | null;
    location: string | null;
    eventDate: Date | null;
    maxParticipants: number | null;
    thumbnail: string | null;
    status: $Enums.EventStatus | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    creatorId: number | null;
};
export type EventCountAggregateOutputType = {
    id: number;
    title: number;
    description: number;
    location: number;
    eventDate: number;
    maxParticipants: number;
    thumbnail: number;
    status: number;
    createdAt: number;
    updatedAt: number;
    creatorId: number;
    _all: number;
};
export type EventAvgAggregateInputType = {
    id?: true;
    maxParticipants?: true;
    creatorId?: true;
};
export type EventSumAggregateInputType = {
    id?: true;
    maxParticipants?: true;
    creatorId?: true;
};
export type EventMinAggregateInputType = {
    id?: true;
    title?: true;
    description?: true;
    location?: true;
    eventDate?: true;
    maxParticipants?: true;
    thumbnail?: true;
    status?: true;
    createdAt?: true;
    updatedAt?: true;
    creatorId?: true;
};
export type EventMaxAggregateInputType = {
    id?: true;
    title?: true;
    description?: true;
    location?: true;
    eventDate?: true;
    maxParticipants?: true;
    thumbnail?: true;
    status?: true;
    createdAt?: true;
    updatedAt?: true;
    creatorId?: true;
};
export type EventCountAggregateInputType = {
    id?: true;
    title?: true;
    description?: true;
    location?: true;
    eventDate?: true;
    maxParticipants?: true;
    thumbnail?: true;
    status?: true;
    createdAt?: true;
    updatedAt?: true;
    creatorId?: true;
    _all?: true;
};
export type EventAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EventWhereInput;
    orderBy?: Prisma.EventOrderByWithRelationInput | Prisma.EventOrderByWithRelationInput[];
    cursor?: Prisma.EventWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | EventCountAggregateInputType;
    _avg?: EventAvgAggregateInputType;
    _sum?: EventSumAggregateInputType;
    _min?: EventMinAggregateInputType;
    _max?: EventMaxAggregateInputType;
};
export type GetEventAggregateType<T extends EventAggregateArgs> = {
    [P in keyof T & keyof AggregateEvent]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateEvent[P]> : Prisma.GetScalarType<T[P], AggregateEvent[P]>;
};
export type EventGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EventWhereInput;
    orderBy?: Prisma.EventOrderByWithAggregationInput | Prisma.EventOrderByWithAggregationInput[];
    by: Prisma.EventScalarFieldEnum[] | Prisma.EventScalarFieldEnum;
    having?: Prisma.EventScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: EventCountAggregateInputType | true;
    _avg?: EventAvgAggregateInputType;
    _sum?: EventSumAggregateInputType;
    _min?: EventMinAggregateInputType;
    _max?: EventMaxAggregateInputType;
};
export type EventGroupByOutputType = {
    id: number;
    title: string;
    description: string;
    location: string;
    eventDate: Date;
    maxParticipants: number | null;
    thumbnail: string | null;
    status: $Enums.EventStatus;
    createdAt: Date;
    updatedAt: Date;
    creatorId: number;
    _count: EventCountAggregateOutputType | null;
    _avg: EventAvgAggregateOutputType | null;
    _sum: EventSumAggregateOutputType | null;
    _min: EventMinAggregateOutputType | null;
    _max: EventMaxAggregateOutputType | null;
};
type GetEventGroupByPayload<T extends EventGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<EventGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof EventGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], EventGroupByOutputType[P]> : Prisma.GetScalarType<T[P], EventGroupByOutputType[P]>;
}>>;
export type EventWhereInput = {
    AND?: Prisma.EventWhereInput | Prisma.EventWhereInput[];
    OR?: Prisma.EventWhereInput[];
    NOT?: Prisma.EventWhereInput | Prisma.EventWhereInput[];
    id?: Prisma.IntFilter<"Event"> | number;
    title?: Prisma.StringFilter<"Event"> | string;
    description?: Prisma.StringFilter<"Event"> | string;
    location?: Prisma.StringFilter<"Event"> | string;
    eventDate?: Prisma.DateTimeFilter<"Event"> | Date | string;
    maxParticipants?: Prisma.IntNullableFilter<"Event"> | number | null;
    thumbnail?: Prisma.StringNullableFilter<"Event"> | string | null;
    status?: Prisma.EnumEventStatusFilter<"Event"> | $Enums.EventStatus;
    createdAt?: Prisma.DateTimeFilter<"Event"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Event"> | Date | string;
    creatorId?: Prisma.IntFilter<"Event"> | number;
    creator?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    registrations?: Prisma.RegistrationListRelationFilter;
    posts?: Prisma.PostListRelationFilter;
};
export type EventOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    location?: Prisma.SortOrder;
    eventDate?: Prisma.SortOrder;
    maxParticipants?: Prisma.SortOrderInput | Prisma.SortOrder;
    thumbnail?: Prisma.SortOrderInput | Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    creatorId?: Prisma.SortOrder;
    creator?: Prisma.UserOrderByWithRelationInput;
    registrations?: Prisma.RegistrationOrderByRelationAggregateInput;
    posts?: Prisma.PostOrderByRelationAggregateInput;
};
export type EventWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    AND?: Prisma.EventWhereInput | Prisma.EventWhereInput[];
    OR?: Prisma.EventWhereInput[];
    NOT?: Prisma.EventWhereInput | Prisma.EventWhereInput[];
    title?: Prisma.StringFilter<"Event"> | string;
    description?: Prisma.StringFilter<"Event"> | string;
    location?: Prisma.StringFilter<"Event"> | string;
    eventDate?: Prisma.DateTimeFilter<"Event"> | Date | string;
    maxParticipants?: Prisma.IntNullableFilter<"Event"> | number | null;
    thumbnail?: Prisma.StringNullableFilter<"Event"> | string | null;
    status?: Prisma.EnumEventStatusFilter<"Event"> | $Enums.EventStatus;
    createdAt?: Prisma.DateTimeFilter<"Event"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Event"> | Date | string;
    creatorId?: Prisma.IntFilter<"Event"> | number;
    creator?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    registrations?: Prisma.RegistrationListRelationFilter;
    posts?: Prisma.PostListRelationFilter;
}, "id">;
export type EventOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    location?: Prisma.SortOrder;
    eventDate?: Prisma.SortOrder;
    maxParticipants?: Prisma.SortOrderInput | Prisma.SortOrder;
    thumbnail?: Prisma.SortOrderInput | Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    creatorId?: Prisma.SortOrder;
    _count?: Prisma.EventCountOrderByAggregateInput;
    _avg?: Prisma.EventAvgOrderByAggregateInput;
    _max?: Prisma.EventMaxOrderByAggregateInput;
    _min?: Prisma.EventMinOrderByAggregateInput;
    _sum?: Prisma.EventSumOrderByAggregateInput;
};
export type EventScalarWhereWithAggregatesInput = {
    AND?: Prisma.EventScalarWhereWithAggregatesInput | Prisma.EventScalarWhereWithAggregatesInput[];
    OR?: Prisma.EventScalarWhereWithAggregatesInput[];
    NOT?: Prisma.EventScalarWhereWithAggregatesInput | Prisma.EventScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"Event"> | number;
    title?: Prisma.StringWithAggregatesFilter<"Event"> | string;
    description?: Prisma.StringWithAggregatesFilter<"Event"> | string;
    location?: Prisma.StringWithAggregatesFilter<"Event"> | string;
    eventDate?: Prisma.DateTimeWithAggregatesFilter<"Event"> | Date | string;
    maxParticipants?: Prisma.IntNullableWithAggregatesFilter<"Event"> | number | null;
    thumbnail?: Prisma.StringNullableWithAggregatesFilter<"Event"> | string | null;
    status?: Prisma.EnumEventStatusWithAggregatesFilter<"Event"> | $Enums.EventStatus;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Event"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Event"> | Date | string;
    creatorId?: Prisma.IntWithAggregatesFilter<"Event"> | number;
};
export type EventCreateInput = {
    title: string;
    description: string;
    location: string;
    eventDate: Date | string;
    maxParticipants?: number | null;
    thumbnail?: string | null;
    status?: $Enums.EventStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    creator: Prisma.UserCreateNestedOneWithoutCreatedEventsInput;
    registrations?: Prisma.RegistrationCreateNestedManyWithoutEventInput;
    posts?: Prisma.PostCreateNestedManyWithoutEventInput;
};
export type EventUncheckedCreateInput = {
    id?: number;
    title: string;
    description: string;
    location: string;
    eventDate: Date | string;
    maxParticipants?: number | null;
    thumbnail?: string | null;
    status?: $Enums.EventStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    creatorId: number;
    registrations?: Prisma.RegistrationUncheckedCreateNestedManyWithoutEventInput;
    posts?: Prisma.PostUncheckedCreateNestedManyWithoutEventInput;
};
export type EventUpdateInput = {
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    location?: Prisma.StringFieldUpdateOperationsInput | string;
    eventDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    maxParticipants?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    thumbnail?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumEventStatusFieldUpdateOperationsInput | $Enums.EventStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    creator?: Prisma.UserUpdateOneRequiredWithoutCreatedEventsNestedInput;
    registrations?: Prisma.RegistrationUpdateManyWithoutEventNestedInput;
    posts?: Prisma.PostUpdateManyWithoutEventNestedInput;
};
export type EventUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    location?: Prisma.StringFieldUpdateOperationsInput | string;
    eventDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    maxParticipants?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    thumbnail?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumEventStatusFieldUpdateOperationsInput | $Enums.EventStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    creatorId?: Prisma.IntFieldUpdateOperationsInput | number;
    registrations?: Prisma.RegistrationUncheckedUpdateManyWithoutEventNestedInput;
    posts?: Prisma.PostUncheckedUpdateManyWithoutEventNestedInput;
};
export type EventCreateManyInput = {
    id?: number;
    title: string;
    description: string;
    location: string;
    eventDate: Date | string;
    maxParticipants?: number | null;
    thumbnail?: string | null;
    status?: $Enums.EventStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    creatorId: number;
};
export type EventUpdateManyMutationInput = {
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    location?: Prisma.StringFieldUpdateOperationsInput | string;
    eventDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    maxParticipants?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    thumbnail?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumEventStatusFieldUpdateOperationsInput | $Enums.EventStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type EventUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    location?: Prisma.StringFieldUpdateOperationsInput | string;
    eventDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    maxParticipants?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    thumbnail?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumEventStatusFieldUpdateOperationsInput | $Enums.EventStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    creatorId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type EventListRelationFilter = {
    every?: Prisma.EventWhereInput;
    some?: Prisma.EventWhereInput;
    none?: Prisma.EventWhereInput;
};
export type EventOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type EventCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    location?: Prisma.SortOrder;
    eventDate?: Prisma.SortOrder;
    maxParticipants?: Prisma.SortOrder;
    thumbnail?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    creatorId?: Prisma.SortOrder;
};
export type EventAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    maxParticipants?: Prisma.SortOrder;
    creatorId?: Prisma.SortOrder;
};
export type EventMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    location?: Prisma.SortOrder;
    eventDate?: Prisma.SortOrder;
    maxParticipants?: Prisma.SortOrder;
    thumbnail?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    creatorId?: Prisma.SortOrder;
};
export type EventMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    location?: Prisma.SortOrder;
    eventDate?: Prisma.SortOrder;
    maxParticipants?: Prisma.SortOrder;
    thumbnail?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    creatorId?: Prisma.SortOrder;
};
export type EventSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    maxParticipants?: Prisma.SortOrder;
    creatorId?: Prisma.SortOrder;
};
export type EventScalarRelationFilter = {
    is?: Prisma.EventWhereInput;
    isNot?: Prisma.EventWhereInput;
};
export type EventCreateNestedManyWithoutCreatorInput = {
    create?: Prisma.XOR<Prisma.EventCreateWithoutCreatorInput, Prisma.EventUncheckedCreateWithoutCreatorInput> | Prisma.EventCreateWithoutCreatorInput[] | Prisma.EventUncheckedCreateWithoutCreatorInput[];
    connectOrCreate?: Prisma.EventCreateOrConnectWithoutCreatorInput | Prisma.EventCreateOrConnectWithoutCreatorInput[];
    createMany?: Prisma.EventCreateManyCreatorInputEnvelope;
    connect?: Prisma.EventWhereUniqueInput | Prisma.EventWhereUniqueInput[];
};
export type EventUncheckedCreateNestedManyWithoutCreatorInput = {
    create?: Prisma.XOR<Prisma.EventCreateWithoutCreatorInput, Prisma.EventUncheckedCreateWithoutCreatorInput> | Prisma.EventCreateWithoutCreatorInput[] | Prisma.EventUncheckedCreateWithoutCreatorInput[];
    connectOrCreate?: Prisma.EventCreateOrConnectWithoutCreatorInput | Prisma.EventCreateOrConnectWithoutCreatorInput[];
    createMany?: Prisma.EventCreateManyCreatorInputEnvelope;
    connect?: Prisma.EventWhereUniqueInput | Prisma.EventWhereUniqueInput[];
};
export type EventUpdateManyWithoutCreatorNestedInput = {
    create?: Prisma.XOR<Prisma.EventCreateWithoutCreatorInput, Prisma.EventUncheckedCreateWithoutCreatorInput> | Prisma.EventCreateWithoutCreatorInput[] | Prisma.EventUncheckedCreateWithoutCreatorInput[];
    connectOrCreate?: Prisma.EventCreateOrConnectWithoutCreatorInput | Prisma.EventCreateOrConnectWithoutCreatorInput[];
    upsert?: Prisma.EventUpsertWithWhereUniqueWithoutCreatorInput | Prisma.EventUpsertWithWhereUniqueWithoutCreatorInput[];
    createMany?: Prisma.EventCreateManyCreatorInputEnvelope;
    set?: Prisma.EventWhereUniqueInput | Prisma.EventWhereUniqueInput[];
    disconnect?: Prisma.EventWhereUniqueInput | Prisma.EventWhereUniqueInput[];
    delete?: Prisma.EventWhereUniqueInput | Prisma.EventWhereUniqueInput[];
    connect?: Prisma.EventWhereUniqueInput | Prisma.EventWhereUniqueInput[];
    update?: Prisma.EventUpdateWithWhereUniqueWithoutCreatorInput | Prisma.EventUpdateWithWhereUniqueWithoutCreatorInput[];
    updateMany?: Prisma.EventUpdateManyWithWhereWithoutCreatorInput | Prisma.EventUpdateManyWithWhereWithoutCreatorInput[];
    deleteMany?: Prisma.EventScalarWhereInput | Prisma.EventScalarWhereInput[];
};
export type EventUncheckedUpdateManyWithoutCreatorNestedInput = {
    create?: Prisma.XOR<Prisma.EventCreateWithoutCreatorInput, Prisma.EventUncheckedCreateWithoutCreatorInput> | Prisma.EventCreateWithoutCreatorInput[] | Prisma.EventUncheckedCreateWithoutCreatorInput[];
    connectOrCreate?: Prisma.EventCreateOrConnectWithoutCreatorInput | Prisma.EventCreateOrConnectWithoutCreatorInput[];
    upsert?: Prisma.EventUpsertWithWhereUniqueWithoutCreatorInput | Prisma.EventUpsertWithWhereUniqueWithoutCreatorInput[];
    createMany?: Prisma.EventCreateManyCreatorInputEnvelope;
    set?: Prisma.EventWhereUniqueInput | Prisma.EventWhereUniqueInput[];
    disconnect?: Prisma.EventWhereUniqueInput | Prisma.EventWhereUniqueInput[];
    delete?: Prisma.EventWhereUniqueInput | Prisma.EventWhereUniqueInput[];
    connect?: Prisma.EventWhereUniqueInput | Prisma.EventWhereUniqueInput[];
    update?: Prisma.EventUpdateWithWhereUniqueWithoutCreatorInput | Prisma.EventUpdateWithWhereUniqueWithoutCreatorInput[];
    updateMany?: Prisma.EventUpdateManyWithWhereWithoutCreatorInput | Prisma.EventUpdateManyWithWhereWithoutCreatorInput[];
    deleteMany?: Prisma.EventScalarWhereInput | Prisma.EventScalarWhereInput[];
};
export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type EnumEventStatusFieldUpdateOperationsInput = {
    set?: $Enums.EventStatus;
};
export type EventCreateNestedOneWithoutRegistrationsInput = {
    create?: Prisma.XOR<Prisma.EventCreateWithoutRegistrationsInput, Prisma.EventUncheckedCreateWithoutRegistrationsInput>;
    connectOrCreate?: Prisma.EventCreateOrConnectWithoutRegistrationsInput;
    connect?: Prisma.EventWhereUniqueInput;
};
export type EventUpdateOneRequiredWithoutRegistrationsNestedInput = {
    create?: Prisma.XOR<Prisma.EventCreateWithoutRegistrationsInput, Prisma.EventUncheckedCreateWithoutRegistrationsInput>;
    connectOrCreate?: Prisma.EventCreateOrConnectWithoutRegistrationsInput;
    upsert?: Prisma.EventUpsertWithoutRegistrationsInput;
    connect?: Prisma.EventWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.EventUpdateToOneWithWhereWithoutRegistrationsInput, Prisma.EventUpdateWithoutRegistrationsInput>, Prisma.EventUncheckedUpdateWithoutRegistrationsInput>;
};
export type EventCreateNestedOneWithoutPostsInput = {
    create?: Prisma.XOR<Prisma.EventCreateWithoutPostsInput, Prisma.EventUncheckedCreateWithoutPostsInput>;
    connectOrCreate?: Prisma.EventCreateOrConnectWithoutPostsInput;
    connect?: Prisma.EventWhereUniqueInput;
};
export type EventUpdateOneRequiredWithoutPostsNestedInput = {
    create?: Prisma.XOR<Prisma.EventCreateWithoutPostsInput, Prisma.EventUncheckedCreateWithoutPostsInput>;
    connectOrCreate?: Prisma.EventCreateOrConnectWithoutPostsInput;
    upsert?: Prisma.EventUpsertWithoutPostsInput;
    connect?: Prisma.EventWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.EventUpdateToOneWithWhereWithoutPostsInput, Prisma.EventUpdateWithoutPostsInput>, Prisma.EventUncheckedUpdateWithoutPostsInput>;
};
export type EventCreateWithoutCreatorInput = {
    title: string;
    description: string;
    location: string;
    eventDate: Date | string;
    maxParticipants?: number | null;
    thumbnail?: string | null;
    status?: $Enums.EventStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    registrations?: Prisma.RegistrationCreateNestedManyWithoutEventInput;
    posts?: Prisma.PostCreateNestedManyWithoutEventInput;
};
export type EventUncheckedCreateWithoutCreatorInput = {
    id?: number;
    title: string;
    description: string;
    location: string;
    eventDate: Date | string;
    maxParticipants?: number | null;
    thumbnail?: string | null;
    status?: $Enums.EventStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    registrations?: Prisma.RegistrationUncheckedCreateNestedManyWithoutEventInput;
    posts?: Prisma.PostUncheckedCreateNestedManyWithoutEventInput;
};
export type EventCreateOrConnectWithoutCreatorInput = {
    where: Prisma.EventWhereUniqueInput;
    create: Prisma.XOR<Prisma.EventCreateWithoutCreatorInput, Prisma.EventUncheckedCreateWithoutCreatorInput>;
};
export type EventCreateManyCreatorInputEnvelope = {
    data: Prisma.EventCreateManyCreatorInput | Prisma.EventCreateManyCreatorInput[];
};
export type EventUpsertWithWhereUniqueWithoutCreatorInput = {
    where: Prisma.EventWhereUniqueInput;
    update: Prisma.XOR<Prisma.EventUpdateWithoutCreatorInput, Prisma.EventUncheckedUpdateWithoutCreatorInput>;
    create: Prisma.XOR<Prisma.EventCreateWithoutCreatorInput, Prisma.EventUncheckedCreateWithoutCreatorInput>;
};
export type EventUpdateWithWhereUniqueWithoutCreatorInput = {
    where: Prisma.EventWhereUniqueInput;
    data: Prisma.XOR<Prisma.EventUpdateWithoutCreatorInput, Prisma.EventUncheckedUpdateWithoutCreatorInput>;
};
export type EventUpdateManyWithWhereWithoutCreatorInput = {
    where: Prisma.EventScalarWhereInput;
    data: Prisma.XOR<Prisma.EventUpdateManyMutationInput, Prisma.EventUncheckedUpdateManyWithoutCreatorInput>;
};
export type EventScalarWhereInput = {
    AND?: Prisma.EventScalarWhereInput | Prisma.EventScalarWhereInput[];
    OR?: Prisma.EventScalarWhereInput[];
    NOT?: Prisma.EventScalarWhereInput | Prisma.EventScalarWhereInput[];
    id?: Prisma.IntFilter<"Event"> | number;
    title?: Prisma.StringFilter<"Event"> | string;
    description?: Prisma.StringFilter<"Event"> | string;
    location?: Prisma.StringFilter<"Event"> | string;
    eventDate?: Prisma.DateTimeFilter<"Event"> | Date | string;
    maxParticipants?: Prisma.IntNullableFilter<"Event"> | number | null;
    thumbnail?: Prisma.StringNullableFilter<"Event"> | string | null;
    status?: Prisma.EnumEventStatusFilter<"Event"> | $Enums.EventStatus;
    createdAt?: Prisma.DateTimeFilter<"Event"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Event"> | Date | string;
    creatorId?: Prisma.IntFilter<"Event"> | number;
};
export type EventCreateWithoutRegistrationsInput = {
    title: string;
    description: string;
    location: string;
    eventDate: Date | string;
    maxParticipants?: number | null;
    thumbnail?: string | null;
    status?: $Enums.EventStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    creator: Prisma.UserCreateNestedOneWithoutCreatedEventsInput;
    posts?: Prisma.PostCreateNestedManyWithoutEventInput;
};
export type EventUncheckedCreateWithoutRegistrationsInput = {
    id?: number;
    title: string;
    description: string;
    location: string;
    eventDate: Date | string;
    maxParticipants?: number | null;
    thumbnail?: string | null;
    status?: $Enums.EventStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    creatorId: number;
    posts?: Prisma.PostUncheckedCreateNestedManyWithoutEventInput;
};
export type EventCreateOrConnectWithoutRegistrationsInput = {
    where: Prisma.EventWhereUniqueInput;
    create: Prisma.XOR<Prisma.EventCreateWithoutRegistrationsInput, Prisma.EventUncheckedCreateWithoutRegistrationsInput>;
};
export type EventUpsertWithoutRegistrationsInput = {
    update: Prisma.XOR<Prisma.EventUpdateWithoutRegistrationsInput, Prisma.EventUncheckedUpdateWithoutRegistrationsInput>;
    create: Prisma.XOR<Prisma.EventCreateWithoutRegistrationsInput, Prisma.EventUncheckedCreateWithoutRegistrationsInput>;
    where?: Prisma.EventWhereInput;
};
export type EventUpdateToOneWithWhereWithoutRegistrationsInput = {
    where?: Prisma.EventWhereInput;
    data: Prisma.XOR<Prisma.EventUpdateWithoutRegistrationsInput, Prisma.EventUncheckedUpdateWithoutRegistrationsInput>;
};
export type EventUpdateWithoutRegistrationsInput = {
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    location?: Prisma.StringFieldUpdateOperationsInput | string;
    eventDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    maxParticipants?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    thumbnail?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumEventStatusFieldUpdateOperationsInput | $Enums.EventStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    creator?: Prisma.UserUpdateOneRequiredWithoutCreatedEventsNestedInput;
    posts?: Prisma.PostUpdateManyWithoutEventNestedInput;
};
export type EventUncheckedUpdateWithoutRegistrationsInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    location?: Prisma.StringFieldUpdateOperationsInput | string;
    eventDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    maxParticipants?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    thumbnail?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumEventStatusFieldUpdateOperationsInput | $Enums.EventStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    creatorId?: Prisma.IntFieldUpdateOperationsInput | number;
    posts?: Prisma.PostUncheckedUpdateManyWithoutEventNestedInput;
};
export type EventCreateWithoutPostsInput = {
    title: string;
    description: string;
    location: string;
    eventDate: Date | string;
    maxParticipants?: number | null;
    thumbnail?: string | null;
    status?: $Enums.EventStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    creator: Prisma.UserCreateNestedOneWithoutCreatedEventsInput;
    registrations?: Prisma.RegistrationCreateNestedManyWithoutEventInput;
};
export type EventUncheckedCreateWithoutPostsInput = {
    id?: number;
    title: string;
    description: string;
    location: string;
    eventDate: Date | string;
    maxParticipants?: number | null;
    thumbnail?: string | null;
    status?: $Enums.EventStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    creatorId: number;
    registrations?: Prisma.RegistrationUncheckedCreateNestedManyWithoutEventInput;
};
export type EventCreateOrConnectWithoutPostsInput = {
    where: Prisma.EventWhereUniqueInput;
    create: Prisma.XOR<Prisma.EventCreateWithoutPostsInput, Prisma.EventUncheckedCreateWithoutPostsInput>;
};
export type EventUpsertWithoutPostsInput = {
    update: Prisma.XOR<Prisma.EventUpdateWithoutPostsInput, Prisma.EventUncheckedUpdateWithoutPostsInput>;
    create: Prisma.XOR<Prisma.EventCreateWithoutPostsInput, Prisma.EventUncheckedCreateWithoutPostsInput>;
    where?: Prisma.EventWhereInput;
};
export type EventUpdateToOneWithWhereWithoutPostsInput = {
    where?: Prisma.EventWhereInput;
    data: Prisma.XOR<Prisma.EventUpdateWithoutPostsInput, Prisma.EventUncheckedUpdateWithoutPostsInput>;
};
export type EventUpdateWithoutPostsInput = {
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    location?: Prisma.StringFieldUpdateOperationsInput | string;
    eventDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    maxParticipants?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    thumbnail?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumEventStatusFieldUpdateOperationsInput | $Enums.EventStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    creator?: Prisma.UserUpdateOneRequiredWithoutCreatedEventsNestedInput;
    registrations?: Prisma.RegistrationUpdateManyWithoutEventNestedInput;
};
export type EventUncheckedUpdateWithoutPostsInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    location?: Prisma.StringFieldUpdateOperationsInput | string;
    eventDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    maxParticipants?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    thumbnail?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumEventStatusFieldUpdateOperationsInput | $Enums.EventStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    creatorId?: Prisma.IntFieldUpdateOperationsInput | number;
    registrations?: Prisma.RegistrationUncheckedUpdateManyWithoutEventNestedInput;
};
export type EventCreateManyCreatorInput = {
    id?: number;
    title: string;
    description: string;
    location: string;
    eventDate: Date | string;
    maxParticipants?: number | null;
    thumbnail?: string | null;
    status?: $Enums.EventStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type EventUpdateWithoutCreatorInput = {
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    location?: Prisma.StringFieldUpdateOperationsInput | string;
    eventDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    maxParticipants?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    thumbnail?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumEventStatusFieldUpdateOperationsInput | $Enums.EventStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    registrations?: Prisma.RegistrationUpdateManyWithoutEventNestedInput;
    posts?: Prisma.PostUpdateManyWithoutEventNestedInput;
};
export type EventUncheckedUpdateWithoutCreatorInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    location?: Prisma.StringFieldUpdateOperationsInput | string;
    eventDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    maxParticipants?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    thumbnail?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumEventStatusFieldUpdateOperationsInput | $Enums.EventStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    registrations?: Prisma.RegistrationUncheckedUpdateManyWithoutEventNestedInput;
    posts?: Prisma.PostUncheckedUpdateManyWithoutEventNestedInput;
};
export type EventUncheckedUpdateManyWithoutCreatorInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    location?: Prisma.StringFieldUpdateOperationsInput | string;
    eventDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    maxParticipants?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    thumbnail?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    status?: Prisma.EnumEventStatusFieldUpdateOperationsInput | $Enums.EventStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type EventCountOutputType = {
    registrations: number;
    posts: number;
};
export type EventCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    registrations?: boolean | EventCountOutputTypeCountRegistrationsArgs;
    posts?: boolean | EventCountOutputTypeCountPostsArgs;
};
export type EventCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EventCountOutputTypeSelect<ExtArgs> | null;
};
export type EventCountOutputTypeCountRegistrationsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RegistrationWhereInput;
};
export type EventCountOutputTypeCountPostsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PostWhereInput;
};
export type EventSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    title?: boolean;
    description?: boolean;
    location?: boolean;
    eventDate?: boolean;
    maxParticipants?: boolean;
    thumbnail?: boolean;
    status?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    creatorId?: boolean;
    creator?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    registrations?: boolean | Prisma.Event$registrationsArgs<ExtArgs>;
    posts?: boolean | Prisma.Event$postsArgs<ExtArgs>;
    _count?: boolean | Prisma.EventCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["event"]>;
export type EventSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    title?: boolean;
    description?: boolean;
    location?: boolean;
    eventDate?: boolean;
    maxParticipants?: boolean;
    thumbnail?: boolean;
    status?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    creatorId?: boolean;
    creator?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["event"]>;
export type EventSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    title?: boolean;
    description?: boolean;
    location?: boolean;
    eventDate?: boolean;
    maxParticipants?: boolean;
    thumbnail?: boolean;
    status?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    creatorId?: boolean;
    creator?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["event"]>;
export type EventSelectScalar = {
    id?: boolean;
    title?: boolean;
    description?: boolean;
    location?: boolean;
    eventDate?: boolean;
    maxParticipants?: boolean;
    thumbnail?: boolean;
    status?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    creatorId?: boolean;
};
export type EventOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "title" | "description" | "location" | "eventDate" | "maxParticipants" | "thumbnail" | "status" | "createdAt" | "updatedAt" | "creatorId", ExtArgs["result"]["event"]>;
export type EventInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    creator?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    registrations?: boolean | Prisma.Event$registrationsArgs<ExtArgs>;
    posts?: boolean | Prisma.Event$postsArgs<ExtArgs>;
    _count?: boolean | Prisma.EventCountOutputTypeDefaultArgs<ExtArgs>;
};
export type EventIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    creator?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type EventIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    creator?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
};
export type $EventPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Event";
    objects: {
        creator: Prisma.$UserPayload<ExtArgs>;
        registrations: Prisma.$RegistrationPayload<ExtArgs>[];
        posts: Prisma.$PostPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        title: string;
        description: string;
        location: string;
        eventDate: Date;
        maxParticipants: number | null;
        thumbnail: string | null;
        status: $Enums.EventStatus;
        createdAt: Date;
        updatedAt: Date;
        creatorId: number;
    }, ExtArgs["result"]["event"]>;
    composites: {};
};
export type EventGetPayload<S extends boolean | null | undefined | EventDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$EventPayload, S>;
export type EventCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<EventFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: EventCountAggregateInputType | true;
};
export interface EventDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Event'];
        meta: {
            name: 'Event';
        };
    };
    findUnique<T extends EventFindUniqueArgs>(args: Prisma.SelectSubset<T, EventFindUniqueArgs<ExtArgs>>): Prisma.Prisma__EventClient<runtime.Types.Result.GetResult<Prisma.$EventPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends EventFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, EventFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__EventClient<runtime.Types.Result.GetResult<Prisma.$EventPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends EventFindFirstArgs>(args?: Prisma.SelectSubset<T, EventFindFirstArgs<ExtArgs>>): Prisma.Prisma__EventClient<runtime.Types.Result.GetResult<Prisma.$EventPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends EventFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, EventFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__EventClient<runtime.Types.Result.GetResult<Prisma.$EventPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends EventFindManyArgs>(args?: Prisma.SelectSubset<T, EventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends EventCreateArgs>(args: Prisma.SelectSubset<T, EventCreateArgs<ExtArgs>>): Prisma.Prisma__EventClient<runtime.Types.Result.GetResult<Prisma.$EventPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends EventCreateManyArgs>(args?: Prisma.SelectSubset<T, EventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends EventCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, EventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EventPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends EventDeleteArgs>(args: Prisma.SelectSubset<T, EventDeleteArgs<ExtArgs>>): Prisma.Prisma__EventClient<runtime.Types.Result.GetResult<Prisma.$EventPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends EventUpdateArgs>(args: Prisma.SelectSubset<T, EventUpdateArgs<ExtArgs>>): Prisma.Prisma__EventClient<runtime.Types.Result.GetResult<Prisma.$EventPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends EventDeleteManyArgs>(args?: Prisma.SelectSubset<T, EventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends EventUpdateManyArgs>(args: Prisma.SelectSubset<T, EventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends EventUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, EventUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EventPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends EventUpsertArgs>(args: Prisma.SelectSubset<T, EventUpsertArgs<ExtArgs>>): Prisma.Prisma__EventClient<runtime.Types.Result.GetResult<Prisma.$EventPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends EventCountArgs>(args?: Prisma.Subset<T, EventCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], EventCountAggregateOutputType> : number>;
    aggregate<T extends EventAggregateArgs>(args: Prisma.Subset<T, EventAggregateArgs>): Prisma.PrismaPromise<GetEventAggregateType<T>>;
    groupBy<T extends EventGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: EventGroupByArgs['orderBy'];
    } : {
        orderBy?: EventGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, EventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: EventFieldRefs;
}
export interface Prisma__EventClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    creator<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    registrations<T extends Prisma.Event$registrationsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Event$registrationsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RegistrationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    posts<T extends Prisma.Event$postsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Event$postsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PostPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface EventFieldRefs {
    readonly id: Prisma.FieldRef<"Event", 'Int'>;
    readonly title: Prisma.FieldRef<"Event", 'String'>;
    readonly description: Prisma.FieldRef<"Event", 'String'>;
    readonly location: Prisma.FieldRef<"Event", 'String'>;
    readonly eventDate: Prisma.FieldRef<"Event", 'DateTime'>;
    readonly maxParticipants: Prisma.FieldRef<"Event", 'Int'>;
    readonly thumbnail: Prisma.FieldRef<"Event", 'String'>;
    readonly status: Prisma.FieldRef<"Event", 'EventStatus'>;
    readonly createdAt: Prisma.FieldRef<"Event", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Event", 'DateTime'>;
    readonly creatorId: Prisma.FieldRef<"Event", 'Int'>;
}
export type EventFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EventSelect<ExtArgs> | null;
    omit?: Prisma.EventOmit<ExtArgs> | null;
    include?: Prisma.EventInclude<ExtArgs> | null;
    where: Prisma.EventWhereUniqueInput;
};
export type EventFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EventSelect<ExtArgs> | null;
    omit?: Prisma.EventOmit<ExtArgs> | null;
    include?: Prisma.EventInclude<ExtArgs> | null;
    where: Prisma.EventWhereUniqueInput;
};
export type EventFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type EventFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type EventFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type EventCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EventSelect<ExtArgs> | null;
    omit?: Prisma.EventOmit<ExtArgs> | null;
    include?: Prisma.EventInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.EventCreateInput, Prisma.EventUncheckedCreateInput>;
};
export type EventCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.EventCreateManyInput | Prisma.EventCreateManyInput[];
};
export type EventCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EventSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.EventOmit<ExtArgs> | null;
    data: Prisma.EventCreateManyInput | Prisma.EventCreateManyInput[];
    include?: Prisma.EventIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type EventUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EventSelect<ExtArgs> | null;
    omit?: Prisma.EventOmit<ExtArgs> | null;
    include?: Prisma.EventInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.EventUpdateInput, Prisma.EventUncheckedUpdateInput>;
    where: Prisma.EventWhereUniqueInput;
};
export type EventUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.EventUpdateManyMutationInput, Prisma.EventUncheckedUpdateManyInput>;
    where?: Prisma.EventWhereInput;
    limit?: number;
};
export type EventUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EventSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.EventOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.EventUpdateManyMutationInput, Prisma.EventUncheckedUpdateManyInput>;
    where?: Prisma.EventWhereInput;
    limit?: number;
    include?: Prisma.EventIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type EventUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EventSelect<ExtArgs> | null;
    omit?: Prisma.EventOmit<ExtArgs> | null;
    include?: Prisma.EventInclude<ExtArgs> | null;
    where: Prisma.EventWhereUniqueInput;
    create: Prisma.XOR<Prisma.EventCreateInput, Prisma.EventUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.EventUpdateInput, Prisma.EventUncheckedUpdateInput>;
};
export type EventDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EventSelect<ExtArgs> | null;
    omit?: Prisma.EventOmit<ExtArgs> | null;
    include?: Prisma.EventInclude<ExtArgs> | null;
    where: Prisma.EventWhereUniqueInput;
};
export type EventDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EventWhereInput;
    limit?: number;
};
export type Event$registrationsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Event$postsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type EventDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EventSelect<ExtArgs> | null;
    omit?: Prisma.EventOmit<ExtArgs> | null;
    include?: Prisma.EventInclude<ExtArgs> | null;
};
export {};
