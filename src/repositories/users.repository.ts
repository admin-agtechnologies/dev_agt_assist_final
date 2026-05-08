// src/repositories/users.repository.ts
import { api } from "@/lib/api-client";
import type { User, DetailResponse } from "@/types/api";

export interface UpdateMePayload {
    name?: string;
    telephone?: string;
    bio?: string;
    ville?: string;
    pays?: string;
}

export interface ChangePasswordPayload {
    old_password: string;
    new_password: string;
}

export const usersRepository = {
    updateMe: (payload: UpdateMePayload): Promise<User> =>
        api.patch<User>("/api/v1/users/update_me/", payload),
    changePassword: (payload: ChangePasswordPayload): Promise<DetailResponse> =>
        api.post<DetailResponse>("/api/v1/users/change_password/", payload),
};