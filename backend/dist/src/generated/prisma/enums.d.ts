export declare const Role: {
    readonly VOLUNTEER: "VOLUNTEER";
    readonly EVENT_MANAGER: "EVENT_MANAGER";
    readonly ADMIN: "ADMIN";
};
export type Role = (typeof Role)[keyof typeof Role];
export declare const EventStatus: {
    readonly PENDING: "PENDING";
    readonly APPROVED: "APPROVED";
    readonly REJECTED: "REJECTED";
    readonly CANCELLED: "CANCELLED";
    readonly COMPLETED: "COMPLETED";
};
export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus];
export declare const RegistrationStatus: {
    readonly PENDING: "PENDING";
    readonly APPROVED: "APPROVED";
    readonly REJECTED: "REJECTED";
    readonly ATTENDED: "ATTENDED";
};
export type RegistrationStatus = (typeof RegistrationStatus)[keyof typeof RegistrationStatus];
export declare const PostType: {
    readonly ANNOUNCEMENT: "ANNOUNCEMENT";
    readonly DISCUSSION: "DISCUSSION";
};
export type PostType = (typeof PostType)[keyof typeof PostType];
