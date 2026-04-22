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
  AdminGetUser: { params: UserParams },
  AdminCreate: { body: AdminCreateUserBody },
  Activation: { params: UserParams, body: HandleActivationBody },
  AdminDelUser: { params: UserParams },

  // Logged User
  UpdateMe: { body: UpdateUserBody },
  ChangePW: { body: ChangePasswordBody },
  UpsertAddress: { body: AddressBase },
  DelMe: { body: DelMeBody },

  // Non Logged User
  Signup: { body: SignupBody },
  Login: { body: LoginBody },
};
