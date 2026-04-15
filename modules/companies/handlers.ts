import type { Ctx } from "../../utils/globalSchema";
import { response as res } from "../../utils/response";
import type {
  CreateCompanyBody,
  ApproveCompnayBody,
  UpdateCompanyBody,
  CParams,
} from "./schema";
import * as companiesService from "./service";

export async function createCompany(context: Ctx<CreateCompanyBody>) {
  const { body, authPayload } = context;

  const approve = authPayload.role === "admin";
  const company = await companiesService.create(body, approve);

  if (!company)
    return res.fail("Failed to create company.", { code: "FAILED" });

  return res.ok("Company created", {
    id: company.id,
    name: company.name,
  });
}

export async function approveCompany(context: {
  params: { id: number };
  body: ApproveCompnayBody;
}) {
  const { params, body } = context;

  const company = await companiesService.approve(params.id, body);

  return res.ok("Company approved", {
    id: company?.id,
    name: company?.name,
  });
}

export async function getAllCompanies(context: Ctx) {
  const { request } = context;
  const url = new URL(request.url);

  const withApproved = url.pathname === "companies/dashboard";
  const companies = await companiesService.queryAll(withApproved);

  return res.ok("Companies fetched", companies);
}

export async function updateCompany(context: Ctx<UpdateCompanyBody, CParams>) {
  const { params, body } = context;

  const company = await companiesService.update(params.compnayId, body);

  if (!company) return res.fail("Failed to update company", { code: "FAILED" });

  return res.ok("Company updated", { company });
}

export async function deleteCompany(context: Ctx<unknown, CParams>) {
  const { params } = context;

  const company = await companiesService.remove(params.compnayId);

  if (!company)
    return res.fail(`Compnay with id: ${params.compnayId} not found.`, {
      code: "NOT_FOUND",
    });

  return res.ok("Company deleted", { id: company.id, name: company.name });
}
