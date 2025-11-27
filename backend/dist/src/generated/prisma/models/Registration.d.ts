import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums";
import type * as Prisma from "../internal/prismaNamespace";
export type RegistrationModel = runtime.Types.Result.DefaultSelection<Prisma.$RegistrationPayload>;
export type AggregateRegistration = {
    _count: RegistrationCountAggregateOutputType | null;
    _avg: RegistrationAvgAggregateOutputType | null;
    _sum: RegistrationSumAggregateOutputType | null;
    _min: RegistrationMinAggregateOutputType | null;
    _max: RegistrationMaxAggregateOutputType | null;
};
export type RegistrationAvgAggregateOutputType = {
    id: number | null;
    userId: number | null;
    eventId: number | null;
};
export type RegistrationSumAggregateOutputType = {
    id: number | null;
    userId: number | null;
    eventId: number | null;
};
export type RegistrationMinAggregateOutputType = {
    id: number | null;
    status: $Enums.RegistrationStatus | null;
    registeredAt: Date | null;
    attendedAt: Date | null;
    userId: number | null;
    eventId: number | null;
};
export type RegistrationMaxAggregateOutputType = {
    id: number | null;
    status: $Enums.RegistrationStatus | null;
    registeredAt: Date | null;
    attendedAt: Date | null;
    userId: number | null;
    eventId: number | null;
};
export type RegistrationCountAggregateOutputType = {
    id: number;
    status: number;
    registeredAt: number;
    attendedAt: number;
    userId: number;
    eventId: number;
    _all: number;
};
export type RegistrationAvgAggregateInputType = {
    id?: true;
    userId?: true;
    eventId?: true;
};
export type RegistrationSumAggregateInputType = {
    id?: true;
    userId?: true;
    eventId?: true;
};
export type RegistrationMinAggregateInputType = {
    id?: true;
    status?: true;
    registeredAt?: true;
    attendedAt?: true;
    userId?: true;
    eventId?: true;
};
export type RegistrationMaxAggregateInputType = {
    id?: true;
    status?: true;
    registeredAt?: true;
    attendedAt?: true;
    userId?: true;
    eventId?: true;
};
export type RegistrationCountAggregateInputType = {
    id?: true;
    status?: true;
    registeredAt?: true;
    attendedAt?: true;
    userId?: true;
    eventId?: true;
    _all?: true;
};
export type RegistrationAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RegistrationWhereInput;
    orderBy?: Prisma.RegistrationOrderByWithRelationInput | Prisma.RegistrationOrderByWithRelationInput[];
    cursor?: Prisma.RegistrationWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | RegistrationCountAggregateInputType;
    _avg?: RegistrationAvgAggregateInputType;
    _sum?: RegistrationSumAggregateInputType;
    _min?: RegistrationMinAggregateInputType;
    _max?: RegistrationMaxAggregateInputType;
};
export type GetRegistrationAggregateType<T extends RegistrationAggregateArgs> = {
    [P in keyof T & keyof AggregateRegistration]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateRegistration[P]> : Prisma.GetScalarType<T[P], AggregateRegistration[P]>;
};
export type RegistrationGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RegistrationWhereInput;
    orderBy?: Prisma.RegistrationOrderByWithAggregationInput | Prisma.RegistrationOrderByWithAggregationInput[];
    by: Prisma.RegistrationScalarFieldEnum[] | Prisma.RegistrationScalarFieldEnum;
    having?: Prisma.RegistrationScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: RegistrationCountAggregateInputType | true;
    _avg?: RegistrationAvgAggregateInputType;
    _sum?: RegistrationSumAggregateInputType;
    _min?: RegistrationMinAggregateInputType;
    _max?: RegistrationMaxAggregateInputType;
};
export type RegistrationGroupByOutputType = {
    id: number;
    status: $Enums.RegistrationStatus;
    registeredAt: Date;
    attendedAt: Date | null;
    userId: number;
    eventId: number;
    _count: RegistrationCountAggregateOutputType | null;
    _avg: RegistrationAvgAggregateOutputType | null;
    _sum: RegistrationSumAggregateOutputType | null;
    _min: RegistrationMinAggregateOutputType | null;
    _max: RegistrationMaxAggregateOutputType | null;
};
type GetRegistrationGroupByPayload<T extends RegistrationGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<RegistrationGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof RegistrationGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], RegistrationGroupByOutputType[P]> : Prisma.GetScalarType<T[P], RegistrationGroupByOutputType[P]>;
}>>;
export type RegistrationWhereInput = {
    AND?: Prisma.RegistrationWhereInput | Prisma.RegistrationWhereInput[];
    OR?: Prisma.RegistrationWhereInput[];
    NOT?: Prisma.RegistrationWhereInput | Prisma.RegistrationWhereInput[];
    id?: Prisma.IntFilter<"Registration"> | number;
    status?: Prisma.EnumRegistrationStatusFilter<"Registration"> | $Enums.RegistrationStatus;
    registeredAt?: Prisma.DateTimeFilter<"Registration"> | Date | string;
    attendedAt?: Prisma.DateTimeNullableFilter<"Registration"> | Date | string | null;
    userId?: Prisma.IntFilter<"Registration"> | number;
    eventId?: Prisma.IntFilter<"Registration"> | number;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    event?: Prisma.XOR<Prisma.EventScalarRelationFilter, Prisma.EventWhereInput>;
};
export type RegistrationOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    registeredAt?: Prisma.SortOrder;
    attendedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    eventId?: Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
    event?: Prisma.EventOrderByWithRelationInput;
};
export type RegistrationWhereUniqueInput = Prisma.AtLeast<{
    id?: number;
    userId_eventId?: Prisma.RegistrationUserIdEventIdCompoundUniqueInput;
    AND?: Prisma.RegistrationWhereInput | Prisma.RegistrationWhereInput[];
    OR?: Prisma.RegistrationWhereInput[];
    NOT?: Prisma.RegistrationWhereInput | Prisma.RegistrationWhereInput[];
    status?: Prisma.EnumRegistrationStatusFilter<"Registration"> | $Enums.RegistrationStatus;
    registeredAt?: Prisma.DateTimeFilter<"Registration"> | Date | string;
    attendedAt?: Prisma.DateTimeNullableFilter<"Registration"> | Date | string | null;
    userId?: Prisma.IntFilter<"Registration"> | number;
    eventId?: Prisma.IntFilter<"Registration"> | number;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    event?: Prisma.XOR<Prisma.EventScalarRelationFilter, Prisma.EventWhereInput>;
}, "id" | "userId_eventId">;
export type RegistrationOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    registeredAt?: Prisma.SortOrder;
    attendedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    eventId?: Prisma.SortOrder;
    _count?: Prisma.RegistrationCountOrderByAggregateInput;
    _avg?: Prisma.RegistrationAvgOrderByAggregateInput;
    _max?: Prisma.RegistrationMaxOrderByAggregateInput;
    _min?: Prisma.RegistrationMinOrderByAggregateInput;
    _sum?: Prisma.RegistrationSumOrderByAggregateInput;
};
export type RegistrationScalarWhereWithAggregatesInput = {
    AND?: Prisma.RegistrationScalarWhereWithAggregatesInput | Prisma.RegistrationScalarWhereWithAggregatesInput[];
    OR?: Prisma.RegistrationScalarWhereWithAggregatesInput[];
    NOT?: Prisma.RegistrationScalarWhereWithAggregatesInput | Prisma.RegistrationScalarWhereWithAggregatesInput[];
    id?: Prisma.IntWithAggregatesFilter<"Registration"> | number;
    status?: Prisma.EnumRegistrationStatusWithAggregatesFilter<"Registration"> | $Enums.RegistrationStatus;
    registeredAt?: Prisma.DateTimeWithAggregatesFilter<"Registration"> | Date | string;
    attendedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"Registration"> | Date | string | null;
    userId?: Prisma.IntWithAggregatesFilter<"Registration"> | number;
    eventId?: Prisma.IntWithAggregatesFilter<"Registration"> | number;
};
export type RegistrationCreateInput = {
    status?: $Enums.RegistrationStatus;
    registeredAt?: Date | string;
    attendedAt?: Date | string | null;
    user: Prisma.UserCreateNestedOneWithoutRegistrationsInput;
    event: Prisma.EventCreateNestedOneWithoutRegistrationsInput;
};
export type RegistrationUncheckedCreateInput = {
    id?: number;
    status?: $Enums.RegistrationStatus;
    registeredAt?: Date | string;
    attendedAt?: Date | string | null;
    userId: number;
    eventId: number;
};
export type RegistrationUpdateInput = {
    status?: Prisma.EnumRegistrationStatusFieldUpdateOperationsInput | $Enums.RegistrationStatus;
    registeredAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    attendedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    user?: Prisma.UserUpdateOneRequiredWithoutRegistrationsNestedInput;
    event?: Prisma.EventUpdateOneRequiredWithoutRegistrationsNestedInput;
};
export type RegistrationUncheckedUpdateInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    status?: Prisma.EnumRegistrationStatusFieldUpdateOperationsInput | $Enums.RegistrationStatus;
    registeredAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    attendedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    userId?: Prisma.IntFieldUpdateOperationsInput | number;
    eventId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type RegistrationCreateManyInput = {
    id?: number;
    status?: $Enums.RegistrationStatus;
    registeredAt?: Date | string;
    attendedAt?: Date | string | null;
    userId: number;
    eventId: number;
};
export type RegistrationUpdateManyMutationInput = {
    status?: Prisma.EnumRegistrationStatusFieldUpdateOperationsInput | $Enums.RegistrationStatus;
    registeredAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    attendedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type RegistrationUncheckedUpdateManyInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    status?: Prisma.EnumRegistrationStatusFieldUpdateOperationsInput | $Enums.RegistrationStatus;
    registeredAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    attendedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    userId?: Prisma.IntFieldUpdateOperationsInput | number;
    eventId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type RegistrationListRelationFilter = {
    every?: Prisma.RegistrationWhereInput;
    some?: Prisma.RegistrationWhereInput;
    none?: Prisma.RegistrationWhereInput;
};
export type RegistrationOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type RegistrationUserIdEventIdCompoundUniqueInput = {
    userId: number;
    eventId: number;
};
export type RegistrationCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    registeredAt?: Prisma.SortOrder;
    attendedAt?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    eventId?: Prisma.SortOrder;
};
export type RegistrationAvgOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    eventId?: Prisma.SortOrder;
};
export type RegistrationMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    registeredAt?: Prisma.SortOrder;
    attendedAt?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    eventId?: Prisma.SortOrder;
};
export type RegistrationMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    registeredAt?: Prisma.SortOrder;
    attendedAt?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    eventId?: Prisma.SortOrder;
};
export type RegistrationSumOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    eventId?: Prisma.SortOrder;
};
export type RegistrationCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.RegistrationCreateWithoutUserInput, Prisma.RegistrationUncheckedCreateWithoutUserInput> | Prisma.RegistrationCreateWithoutUserInput[] | Prisma.RegistrationUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.RegistrationCreateOrConnectWithoutUserInput | Prisma.RegistrationCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.RegistrationCreateManyUserInputEnvelope;
    connect?: Prisma.RegistrationWhereUniqueInput | Prisma.RegistrationWhereUniqueInput[];
};
export type RegistrationUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.RegistrationCreateWithoutUserInput, Prisma.RegistrationUncheckedCreateWithoutUserInput> | Prisma.RegistrationCreateWithoutUserInput[] | Prisma.RegistrationUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.RegistrationCreateOrConnectWithoutUserInput | Prisma.RegistrationCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.RegistrationCreateManyUserInputEnvelope;
    connect?: Prisma.RegistrationWhereUniqueInput | Prisma.RegistrationWhereUniqueInput[];
};
export type RegistrationUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.RegistrationCreateWithoutUserInput, Prisma.RegistrationUncheckedCreateWithoutUserInput> | Prisma.RegistrationCreateWithoutUserInput[] | Prisma.RegistrationUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.RegistrationCreateOrConnectWithoutUserInput | Prisma.RegistrationCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.RegistrationUpsertWithWhereUniqueWithoutUserInput | Prisma.RegistrationUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.RegistrationCreateManyUserInputEnvelope;
    set?: Prisma.RegistrationWhereUniqueInput | Prisma.RegistrationWhereUniqueInput[];
    disconnect?: Prisma.RegistrationWhereUniqueInput | Prisma.RegistrationWhereUniqueInput[];
    delete?: Prisma.RegistrationWhereUniqueInput | Prisma.RegistrationWhereUniqueInput[];
    connect?: Prisma.RegistrationWhereUniqueInput | Prisma.RegistrationWhereUniqueInput[];
    update?: Prisma.RegistrationUpdateWithWhereUniqueWithoutUserInput | Prisma.RegistrationUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.RegistrationUpdateManyWithWhereWithoutUserInput | Prisma.RegistrationUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.RegistrationScalarWhereInput | Prisma.RegistrationScalarWhereInput[];
};
export type RegistrationUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.RegistrationCreateWithoutUserInput, Prisma.RegistrationUncheckedCreateWithoutUserInput> | Prisma.RegistrationCreateWithoutUserInput[] | Prisma.RegistrationUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.RegistrationCreateOrConnectWithoutUserInput | Prisma.RegistrationCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.RegistrationUpsertWithWhereUniqueWithoutUserInput | Prisma.RegistrationUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.RegistrationCreateManyUserInputEnvelope;
    set?: Prisma.RegistrationWhereUniqueInput | Prisma.RegistrationWhereUniqueInput[];
    disconnect?: Prisma.RegistrationWhereUniqueInput | Prisma.RegistrationWhereUniqueInput[];
    delete?: Prisma.RegistrationWhereUniqueInput | Prisma.RegistrationWhereUniqueInput[];
    connect?: Prisma.RegistrationWhereUniqueInput | Prisma.RegistrationWhereUniqueInput[];
    update?: Prisma.RegistrationUpdateWithWhereUniqueWithoutUserInput | Prisma.RegistrationUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.RegistrationUpdateManyWithWhereWithoutUserInput | Prisma.RegistrationUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.RegistrationScalarWhereInput | Prisma.RegistrationScalarWhereInput[];
};
export type RegistrationCreateNestedManyWithoutEventInput = {
    create?: Prisma.XOR<Prisma.RegistrationCreateWithoutEventInput, Prisma.RegistrationUncheckedCreateWithoutEventInput> | Prisma.RegistrationCreateWithoutEventInput[] | Prisma.RegistrationUncheckedCreateWithoutEventInput[];
    connectOrCreate?: Prisma.RegistrationCreateOrConnectWithoutEventInput | Prisma.RegistrationCreateOrConnectWithoutEventInput[];
    createMany?: Prisma.RegistrationCreateManyEventInputEnvelope;
    connect?: Prisma.RegistrationWhereUniqueInput | Prisma.RegistrationWhereUniqueInput[];
};
export type RegistrationUncheckedCreateNestedManyWithoutEventInput = {
    create?: Prisma.XOR<Prisma.RegistrationCreateWithoutEventInput, Prisma.RegistrationUncheckedCreateWithoutEventInput> | Prisma.RegistrationCreateWithoutEventInput[] | Prisma.RegistrationUncheckedCreateWithoutEventInput[];
    connectOrCreate?: Prisma.RegistrationCreateOrConnectWithoutEventInput | Prisma.RegistrationCreateOrConnectWithoutEventInput[];
    createMany?: Prisma.RegistrationCreateManyEventInputEnvelope;
    connect?: Prisma.RegistrationWhereUniqueInput | Prisma.RegistrationWhereUniqueInput[];
};
export type RegistrationUpdateManyWithoutEventNestedInput = {
    create?: Prisma.XOR<Prisma.RegistrationCreateWithoutEventInput, Prisma.RegistrationUncheckedCreateWithoutEventInput> | Prisma.RegistrationCreateWithoutEventInput[] | Prisma.RegistrationUncheckedCreateWithoutEventInput[];
    connectOrCreate?: Prisma.RegistrationCreateOrConnectWithoutEventInput | Prisma.RegistrationCreateOrConnectWithoutEventInput[];
    upsert?: Prisma.RegistrationUpsertWithWhereUniqueWithoutEventInput | Prisma.RegistrationUpsertWithWhereUniqueWithoutEventInput[];
    createMany?: Prisma.RegistrationCreateManyEventInputEnvelope;
    set?: Prisma.RegistrationWhereUniqueInput | Prisma.RegistrationWhereUniqueInput[];
    disconnect?: Prisma.RegistrationWhereUniqueInput | Prisma.RegistrationWhereUniqueInput[];
    delete?: Prisma.RegistrationWhereUniqueInput | Prisma.RegistrationWhereUniqueInput[];
    connect?: Prisma.RegistrationWhereUniqueInput | Prisma.RegistrationWhereUniqueInput[];
    update?: Prisma.RegistrationUpdateWithWhereUniqueWithoutEventInput | Prisma.RegistrationUpdateWithWhereUniqueWithoutEventInput[];
    updateMany?: Prisma.RegistrationUpdateManyWithWhereWithoutEventInput | Prisma.RegistrationUpdateManyWithWhereWithoutEventInput[];
    deleteMany?: Prisma.RegistrationScalarWhereInput | Prisma.RegistrationScalarWhereInput[];
};
export type RegistrationUncheckedUpdateManyWithoutEventNestedInput = {
    create?: Prisma.XOR<Prisma.RegistrationCreateWithoutEventInput, Prisma.RegistrationUncheckedCreateWithoutEventInput> | Prisma.RegistrationCreateWithoutEventInput[] | Prisma.RegistrationUncheckedCreateWithoutEventInput[];
    connectOrCreate?: Prisma.RegistrationCreateOrConnectWithoutEventInput | Prisma.RegistrationCreateOrConnectWithoutEventInput[];
    upsert?: Prisma.RegistrationUpsertWithWhereUniqueWithoutEventInput | Prisma.RegistrationUpsertWithWhereUniqueWithoutEventInput[];
    createMany?: Prisma.RegistrationCreateManyEventInputEnvelope;
    set?: Prisma.RegistrationWhereUniqueInput | Prisma.RegistrationWhereUniqueInput[];
    disconnect?: Prisma.RegistrationWhereUniqueInput | Prisma.RegistrationWhereUniqueInput[];
    delete?: Prisma.RegistrationWhereUniqueInput | Prisma.RegistrationWhereUniqueInput[];
    connect?: Prisma.RegistrationWhereUniqueInput | Prisma.RegistrationWhereUniqueInput[];
    update?: Prisma.RegistrationUpdateWithWhereUniqueWithoutEventInput | Prisma.RegistrationUpdateWithWhereUniqueWithoutEventInput[];
    updateMany?: Prisma.RegistrationUpdateManyWithWhereWithoutEventInput | Prisma.RegistrationUpdateManyWithWhereWithoutEventInput[];
    deleteMany?: Prisma.RegistrationScalarWhereInput | Prisma.RegistrationScalarWhereInput[];
};
export type EnumRegistrationStatusFieldUpdateOperationsInput = {
    set?: $Enums.RegistrationStatus;
};
export type RegistrationCreateWithoutUserInput = {
    status?: $Enums.RegistrationStatus;
    registeredAt?: Date | string;
    attendedAt?: Date | string | null;
    event: Prisma.EventCreateNestedOneWithoutRegistrationsInput;
};
export type RegistrationUncheckedCreateWithoutUserInput = {
    id?: number;
    status?: $Enums.RegistrationStatus;
    registeredAt?: Date | string;
    attendedAt?: Date | string | null;
    eventId: number;
};
export type RegistrationCreateOrConnectWithoutUserInput = {
    where: Prisma.RegistrationWhereUniqueInput;
    create: Prisma.XOR<Prisma.RegistrationCreateWithoutUserInput, Prisma.RegistrationUncheckedCreateWithoutUserInput>;
};
export type RegistrationCreateManyUserInputEnvelope = {
    data: Prisma.RegistrationCreateManyUserInput | Prisma.RegistrationCreateManyUserInput[];
};
export type RegistrationUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.RegistrationWhereUniqueInput;
    update: Prisma.XOR<Prisma.RegistrationUpdateWithoutUserInput, Prisma.RegistrationUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.RegistrationCreateWithoutUserInput, Prisma.RegistrationUncheckedCreateWithoutUserInput>;
};
export type RegistrationUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.RegistrationWhereUniqueInput;
    data: Prisma.XOR<Prisma.RegistrationUpdateWithoutUserInput, Prisma.RegistrationUncheckedUpdateWithoutUserInput>;
};
export type RegistrationUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.RegistrationScalarWhereInput;
    data: Prisma.XOR<Prisma.RegistrationUpdateManyMutationInput, Prisma.RegistrationUncheckedUpdateManyWithoutUserInput>;
};
export type RegistrationScalarWhereInput = {
    AND?: Prisma.RegistrationScalarWhereInput | Prisma.RegistrationScalarWhereInput[];
    OR?: Prisma.RegistrationScalarWhereInput[];
    NOT?: Prisma.RegistrationScalarWhereInput | Prisma.RegistrationScalarWhereInput[];
    id?: Prisma.IntFilter<"Registration"> | number;
    status?: Prisma.EnumRegistrationStatusFilter<"Registration"> | $Enums.RegistrationStatus;
    registeredAt?: Prisma.DateTimeFilter<"Registration"> | Date | string;
    attendedAt?: Prisma.DateTimeNullableFilter<"Registration"> | Date | string | null;
    userId?: Prisma.IntFilter<"Registration"> | number;
    eventId?: Prisma.IntFilter<"Registration"> | number;
};
export type RegistrationCreateWithoutEventInput = {
    status?: $Enums.RegistrationStatus;
    registeredAt?: Date | string;
    attendedAt?: Date | string | null;
    user: Prisma.UserCreateNestedOneWithoutRegistrationsInput;
};
export type RegistrationUncheckedCreateWithoutEventInput = {
    id?: number;
    status?: $Enums.RegistrationStatus;
    registeredAt?: Date | string;
    attendedAt?: Date | string | null;
    userId: number;
};
export type RegistrationCreateOrConnectWithoutEventInput = {
    where: Prisma.RegistrationWhereUniqueInput;
    create: Prisma.XOR<Prisma.RegistrationCreateWithoutEventInput, Prisma.RegistrationUncheckedCreateWithoutEventInput>;
};
export type RegistrationCreateManyEventInputEnvelope = {
    data: Prisma.RegistrationCreateManyEventInput | Prisma.RegistrationCreateManyEventInput[];
};
export type RegistrationUpsertWithWhereUniqueWithoutEventInput = {
    where: Prisma.RegistrationWhereUniqueInput;
    update: Prisma.XOR<Prisma.RegistrationUpdateWithoutEventInput, Prisma.RegistrationUncheckedUpdateWithoutEventInput>;
    create: Prisma.XOR<Prisma.RegistrationCreateWithoutEventInput, Prisma.RegistrationUncheckedCreateWithoutEventInput>;
};
export type RegistrationUpdateWithWhereUniqueWithoutEventInput = {
    where: Prisma.RegistrationWhereUniqueInput;
    data: Prisma.XOR<Prisma.RegistrationUpdateWithoutEventInput, Prisma.RegistrationUncheckedUpdateWithoutEventInput>;
};
export type RegistrationUpdateManyWithWhereWithoutEventInput = {
    where: Prisma.RegistrationScalarWhereInput;
    data: Prisma.XOR<Prisma.RegistrationUpdateManyMutationInput, Prisma.RegistrationUncheckedUpdateManyWithoutEventInput>;
};
export type RegistrationCreateManyUserInput = {
    id?: number;
    status?: $Enums.RegistrationStatus;
    registeredAt?: Date | string;
    attendedAt?: Date | string | null;
    eventId: number;
};
export type RegistrationUpdateWithoutUserInput = {
    status?: Prisma.EnumRegistrationStatusFieldUpdateOperationsInput | $Enums.RegistrationStatus;
    registeredAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    attendedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    event?: Prisma.EventUpdateOneRequiredWithoutRegistrationsNestedInput;
};
export type RegistrationUncheckedUpdateWithoutUserInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    status?: Prisma.EnumRegistrationStatusFieldUpdateOperationsInput | $Enums.RegistrationStatus;
    registeredAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    attendedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    eventId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type RegistrationUncheckedUpdateManyWithoutUserInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    status?: Prisma.EnumRegistrationStatusFieldUpdateOperationsInput | $Enums.RegistrationStatus;
    registeredAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    attendedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    eventId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type RegistrationCreateManyEventInput = {
    id?: number;
    status?: $Enums.RegistrationStatus;
    registeredAt?: Date | string;
    attendedAt?: Date | string | null;
    userId: number;
};
export type RegistrationUpdateWithoutEventInput = {
    status?: Prisma.EnumRegistrationStatusFieldUpdateOperationsInput | $Enums.RegistrationStatus;
    registeredAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    attendedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    user?: Prisma.UserUpdateOneRequiredWithoutRegistrationsNestedInput;
};
export type RegistrationUncheckedUpdateWithoutEventInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    status?: Prisma.EnumRegistrationStatusFieldUpdateOperationsInput | $Enums.RegistrationStatus;
    registeredAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    attendedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    userId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type RegistrationUncheckedUpdateManyWithoutEventInput = {
    id?: Prisma.IntFieldUpdateOperationsInput | number;
    status?: Prisma.EnumRegistrationStatusFieldUpdateOperationsInput | $Enums.RegistrationStatus;
    registeredAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    attendedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    userId?: Prisma.IntFieldUpdateOperationsInput | number;
};
export type RegistrationSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    status?: boolean;
    registeredAt?: boolean;
    attendedAt?: boolean;
    userId?: boolean;
    eventId?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    event?: boolean | Prisma.EventDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["registration"]>;
export type RegistrationSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    status?: boolean;
    registeredAt?: boolean;
    attendedAt?: boolean;
    userId?: boolean;
    eventId?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    event?: boolean | Prisma.EventDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["registration"]>;
export type RegistrationSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    status?: boolean;
    registeredAt?: boolean;
    attendedAt?: boolean;
    userId?: boolean;
    eventId?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    event?: boolean | Prisma.EventDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["registration"]>;
export type RegistrationSelectScalar = {
    id?: boolean;
    status?: boolean;
    registeredAt?: boolean;
    attendedAt?: boolean;
    userId?: boolean;
    eventId?: boolean;
};
export type RegistrationOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "status" | "registeredAt" | "attendedAt" | "userId" | "eventId", ExtArgs["result"]["registration"]>;
export type RegistrationInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    event?: boolean | Prisma.EventDefaultArgs<ExtArgs>;
};
export type RegistrationIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    event?: boolean | Prisma.EventDefaultArgs<ExtArgs>;
};
export type RegistrationIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    event?: boolean | Prisma.EventDefaultArgs<ExtArgs>;
};
export type $RegistrationPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Registration";
    objects: {
        user: Prisma.$UserPayload<ExtArgs>;
        event: Prisma.$EventPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: number;
        status: $Enums.RegistrationStatus;
        registeredAt: Date;
        attendedAt: Date | null;
        userId: number;
        eventId: number;
    }, ExtArgs["result"]["registration"]>;
    composites: {};
};
export type RegistrationGetPayload<S extends boolean | null | undefined | RegistrationDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$RegistrationPayload, S>;
export type RegistrationCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<RegistrationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: RegistrationCountAggregateInputType | true;
};
export interface RegistrationDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Registration'];
        meta: {
            name: 'Registration';
        };
    };
    findUnique<T extends RegistrationFindUniqueArgs>(args: Prisma.SelectSubset<T, RegistrationFindUniqueArgs<ExtArgs>>): Prisma.Prisma__RegistrationClient<runtime.Types.Result.GetResult<Prisma.$RegistrationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends RegistrationFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, RegistrationFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__RegistrationClient<runtime.Types.Result.GetResult<Prisma.$RegistrationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends RegistrationFindFirstArgs>(args?: Prisma.SelectSubset<T, RegistrationFindFirstArgs<ExtArgs>>): Prisma.Prisma__RegistrationClient<runtime.Types.Result.GetResult<Prisma.$RegistrationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends RegistrationFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, RegistrationFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__RegistrationClient<runtime.Types.Result.GetResult<Prisma.$RegistrationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends RegistrationFindManyArgs>(args?: Prisma.SelectSubset<T, RegistrationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RegistrationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends RegistrationCreateArgs>(args: Prisma.SelectSubset<T, RegistrationCreateArgs<ExtArgs>>): Prisma.Prisma__RegistrationClient<runtime.Types.Result.GetResult<Prisma.$RegistrationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends RegistrationCreateManyArgs>(args?: Prisma.SelectSubset<T, RegistrationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends RegistrationCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, RegistrationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RegistrationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends RegistrationDeleteArgs>(args: Prisma.SelectSubset<T, RegistrationDeleteArgs<ExtArgs>>): Prisma.Prisma__RegistrationClient<runtime.Types.Result.GetResult<Prisma.$RegistrationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends RegistrationUpdateArgs>(args: Prisma.SelectSubset<T, RegistrationUpdateArgs<ExtArgs>>): Prisma.Prisma__RegistrationClient<runtime.Types.Result.GetResult<Prisma.$RegistrationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends RegistrationDeleteManyArgs>(args?: Prisma.SelectSubset<T, RegistrationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends RegistrationUpdateManyArgs>(args: Prisma.SelectSubset<T, RegistrationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends RegistrationUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, RegistrationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RegistrationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends RegistrationUpsertArgs>(args: Prisma.SelectSubset<T, RegistrationUpsertArgs<ExtArgs>>): Prisma.Prisma__RegistrationClient<runtime.Types.Result.GetResult<Prisma.$RegistrationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends RegistrationCountArgs>(args?: Prisma.Subset<T, RegistrationCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], RegistrationCountAggregateOutputType> : number>;
    aggregate<T extends RegistrationAggregateArgs>(args: Prisma.Subset<T, RegistrationAggregateArgs>): Prisma.PrismaPromise<GetRegistrationAggregateType<T>>;
    groupBy<T extends RegistrationGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: RegistrationGroupByArgs['orderBy'];
    } : {
        orderBy?: RegistrationGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, RegistrationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRegistrationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: RegistrationFieldRefs;
}
export interface Prisma__RegistrationClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    event<T extends Prisma.EventDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.EventDefaultArgs<ExtArgs>>): Prisma.Prisma__EventClient<runtime.Types.Result.GetResult<Prisma.$EventPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface RegistrationFieldRefs {
    readonly id: Prisma.FieldRef<"Registration", 'Int'>;
    readonly status: Prisma.FieldRef<"Registration", 'RegistrationStatus'>;
    readonly registeredAt: Prisma.FieldRef<"Registration", 'DateTime'>;
    readonly attendedAt: Prisma.FieldRef<"Registration", 'DateTime'>;
    readonly userId: Prisma.FieldRef<"Registration", 'Int'>;
    readonly eventId: Prisma.FieldRef<"Registration", 'Int'>;
}
export type RegistrationFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RegistrationSelect<ExtArgs> | null;
    omit?: Prisma.RegistrationOmit<ExtArgs> | null;
    include?: Prisma.RegistrationInclude<ExtArgs> | null;
    where: Prisma.RegistrationWhereUniqueInput;
};
export type RegistrationFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RegistrationSelect<ExtArgs> | null;
    omit?: Prisma.RegistrationOmit<ExtArgs> | null;
    include?: Prisma.RegistrationInclude<ExtArgs> | null;
    where: Prisma.RegistrationWhereUniqueInput;
};
export type RegistrationFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type RegistrationFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type RegistrationFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type RegistrationCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RegistrationSelect<ExtArgs> | null;
    omit?: Prisma.RegistrationOmit<ExtArgs> | null;
    include?: Prisma.RegistrationInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RegistrationCreateInput, Prisma.RegistrationUncheckedCreateInput>;
};
export type RegistrationCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.RegistrationCreateManyInput | Prisma.RegistrationCreateManyInput[];
};
export type RegistrationCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RegistrationSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.RegistrationOmit<ExtArgs> | null;
    data: Prisma.RegistrationCreateManyInput | Prisma.RegistrationCreateManyInput[];
    include?: Prisma.RegistrationIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type RegistrationUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RegistrationSelect<ExtArgs> | null;
    omit?: Prisma.RegistrationOmit<ExtArgs> | null;
    include?: Prisma.RegistrationInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RegistrationUpdateInput, Prisma.RegistrationUncheckedUpdateInput>;
    where: Prisma.RegistrationWhereUniqueInput;
};
export type RegistrationUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.RegistrationUpdateManyMutationInput, Prisma.RegistrationUncheckedUpdateManyInput>;
    where?: Prisma.RegistrationWhereInput;
    limit?: number;
};
export type RegistrationUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RegistrationSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.RegistrationOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RegistrationUpdateManyMutationInput, Prisma.RegistrationUncheckedUpdateManyInput>;
    where?: Prisma.RegistrationWhereInput;
    limit?: number;
    include?: Prisma.RegistrationIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type RegistrationUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RegistrationSelect<ExtArgs> | null;
    omit?: Prisma.RegistrationOmit<ExtArgs> | null;
    include?: Prisma.RegistrationInclude<ExtArgs> | null;
    where: Prisma.RegistrationWhereUniqueInput;
    create: Prisma.XOR<Prisma.RegistrationCreateInput, Prisma.RegistrationUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.RegistrationUpdateInput, Prisma.RegistrationUncheckedUpdateInput>;
};
export type RegistrationDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RegistrationSelect<ExtArgs> | null;
    omit?: Prisma.RegistrationOmit<ExtArgs> | null;
    include?: Prisma.RegistrationInclude<ExtArgs> | null;
    where: Prisma.RegistrationWhereUniqueInput;
};
export type RegistrationDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RegistrationWhereInput;
    limit?: number;
};
export type RegistrationDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RegistrationSelect<ExtArgs> | null;
    omit?: Prisma.RegistrationOmit<ExtArgs> | null;
    include?: Prisma.RegistrationInclude<ExtArgs> | null;
};
export {};
