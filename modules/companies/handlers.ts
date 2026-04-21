import { response as res } from "../../utils/response";
import type {
  CreateCoCtx,
  ApproveCoCtx,
  QueryCoCtx,
  UpdateCoCtx,
  DelCoCtx,
} from "./schema";
import * as companiesService from "./service";

export async function createCompany(context: CreateCoCtx) {
  const { body, authPayload } = context;

  const approve = authPayload.role === "admin";
  const company = await companiesService.create(body, approve);

  return res.ok("Company created", {
    id: company.id,
    name: company.name,
  });
}

export async function approveCompany(context: ApproveCoCtx) {
  const { params, body } = context;

  const company = await companiesService.approve(params.compnayId, body);

  return res.ok("Company approved", {
    id: company.id,
    name: company.name,
  });
}

export async function getAllCompanies(context: QueryCoCtx) {
  const { query } = context;

  const companies = await companiesService.queryAll(query);

  return res.ok("Companies fetched", companies);
}

export async function updateCompany(context: UpdateCoCtx) {
  const { params, body } = context;

  const company = await companiesService.update(params.compnayId, body);

  return res.ok("Company updated", { company });
}

export async function deleteCompany(context: DelCoCtx) {
  const { params } = context;

  const company = await companiesService.remove(params.compnayId);

  return res.ok("Company deleted", { id: company.id, name: company.name });
}
