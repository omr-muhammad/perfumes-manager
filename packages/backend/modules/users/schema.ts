import { t, type Static } from "elysia";
import {
  AddressBase,
  Email,
  HandleActivationBody,
  ID,
  User,
  type Address,
  type Ctx,
  type CtxWithoutPayload,
} from "../../utils/globalSchema";

// ------------------ Create ------------------
const CreateUser = t.Omit(User, [
  "updatedAt",
  "createdAt",
  "active",
  "tokenVersion",
]);

const AdminCreateUserBody = t.Object({
  user: CreateUser,
  address: t.Optional(AddressBase),
});
export type AdminCreateUserBody = Static<typeof AdminCreateUserBody>;

// ------------------ Update ------------------
const UpdateUserBody = t.Partial(
  t.Omit(CreateUser, ["password", "role", "active"]),
);
export type UpdateUserBody = Static<typeof UpdateUserBody>;

const ChangePasswordBody = t.Object({
  oldPw: t.String(),
  newPw: t.String(),
});
export type ChangePasswordBody = Static<typeof ChangePasswordBody>;

const DelMeBody = t.Object({ password: t.String() });
export type DelMeBody = Static<typeof DelMeBody>;

// ------------------ Signup ------------------
const SignupUser = t.Omit(CreateUser, ["role"]);
export type SignupUser = Static<typeof SignupUser>;

const SignupBody = t.Object({
  user: SignupUser,
  keepLogin: t.Boolean({ default: false }),
});
export type SignupBody = Static<typeof SignupBody>;

// ------------------ Login ------------------
const LoginBody = t.Object({
  email: Email,
  password: t.String(),
  keepLogin: t.Boolean({ default: false }),
});
export type LoginBody = Static<typeof LoginBody>;

// ------------------ URL Params ------------------
const UserParams = t.Object({ userId: ID });
type UserParams = Static<typeof UserParams>;

// ------------------ CTXs ------------------
export interface UserCTXs {
  AdminCreate: Ctx<AdminCreateUserBody>;
  AdminDel: Ctx<unknown, UserParams>;
  AdminGetUser: Ctx<unknown, UserParams>;
  Activation: Ctx<HandleActivationBody, UserParams>;
  Signup: CtxWithoutPayload<SignupBody>;
  Login: CtxWithoutPayload<LoginBody>;
  Logout: Ctx;
  ChangePW: Ctx<ChangePasswordBody>;
  UpdateMe: Ctx<UpdateUserBody>;
  UpsertAddress: Ctx<Address>;
  GetMe: Ctx;
  DelMe: Ctx<DelMeBody>;
}

// ------------------ CTXs Schema ------------------
export const UserSchema = {
  // Admin
  AdminQuery: {
    detail: { summary: "List all users", tags: ["Admin - Users"] },
  },
  AdminGetUser: {
    params: UserParams,
    detail: { summary: "Get a user by id", tags: ["Admin - Users"] },
  },
  AdminCreate: {
    body: AdminCreateUserBody,
    detail: { summary: "Create a user", tags: ["Admin - Users"] },
  },
  Activation: {
    params: UserParams,
    body: HandleActivationBody,
    detail: {
      summary: "Activate or deactivate a user",
      tags: ["Admin - Users"],
    },
  },
  AdminDelUser: {
    params: UserParams,
    detail: { summary: "Delete a user", tags: ["Admin - Users"] },
  },

  // Logged User
  Me: {
    detail: {
      summary: "Get the current user's profile",
      tags: ["My Profile"],
    },
  },
  Logout: {
    detail: { summary: "Log out", tags: ["Auth"] },
  },
  UpdateMe: {
    body: UpdateUserBody,
    detail: {
      summary: "Update the current user's profile",
      tags: ["My Profile"],
    },
  },
  ChangePW: {
    body: ChangePasswordBody,
    detail: {
      summary: "Change the current user's password",
      tags: ["My Profile"],
    },
  },
  UpsertAddress: {
    body: AddressBase,
    detail: {
      summary: "Set or replace the current user's address",
      tags: ["My Profile"],
    },
  },
  DelMe: {
    body: DelMeBody,
    detail: {
      summary: "Delete the current user's account",
      tags: ["My Profile"],
    },
  },

  // Non Logged User
  Signup: {
    body: SignupBody,
    detail: { summary: "Register a new user", tags: ["Auth"] },
  },
  Login: {
    body: LoginBody,
    detail: { summary: "Log in", tags: ["Auth"] },
  },
};
