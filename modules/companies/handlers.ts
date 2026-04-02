import { response } from "../../utils/response";
import type {
  AdminCreateCompanyBody,
  ApproveCompnayBody,
  UpdateCompanyBody,
} from "./schema";
import * as companiesService from "./service";

export async function createCompany(context: { body: { name: string } }) {
  const { body } = context;

  const company = await companiesService.create(body.name);

  return response.ok("Company created", {
    id: company?.id,
    name: company?.name,
  });
}

export async function adminCreate(context: { body: AdminCreateCompanyBody }) {
  const { body } = context;

  const company = await companiesService.adminCreate(body);

  return response.ok("Company created", {
    id: company?.id,
    name: company?.name,
  });
}

export async function approveCompany(context: {
  params: { id: number };
  body: ApproveCompnayBody;
}) {
  const { params, body } = context;

  const company = await companiesService.approve(params.id, body);

  return response.ok("Company approved", {
    id: company?.id,
    name: company?.name,
  });
}

export async function getAllCompanies(context: { request: Request }) {
  const url = new URL(context.request.url);

  let companies;

  if (url.pathname === "companies/dashboard")
    companies = await companiesService.queryAll("dashboard");

  companies = await companiesService.queryAll();

  return response.ok("Companies fetched", companies);
}

export async function updateCompany(context: {
  params: { id: number };
  body: UpdateCompanyBody;
}) {
  const { params, body } = context;

  const company = await companiesService.update(params.id, body);

  return response.ok("Company updated", {
    id: company?.id,
    name: company?.name,
  });
}

export async function deleteCompany(context: { params: { id: number } }) {
  const { params } = context;

  const company = await companiesService.remove(params.id);

  return response.ok("Company deleted", { name: company?.name });
}
