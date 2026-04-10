import type { AppUser, AuthTokens, UserRole } from "@/types/api";

import { decodeJwtPayload } from "@/lib/jwt-payload";

export interface AuthSessionPayload {
  user: AppUser;
  tokens: AuthTokens;
}

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
};

const unwrapAuthBody = (raw: unknown): Record<string, unknown> => {
  const root = asRecord(raw);
  if (!root) {
    return {};
  }
  const nested = asRecord(root.data);
  return nested ?? root;
};

/** Returns undefined if the claim is missing or not a known role (so JWT/body can be merged). */
const pickRoleFromClaim = (value: unknown): UserRole | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value === 2) {
      return "instructor";
    }
    if (value === 3) {
      return "admin";
    }
    if (value === 0 || value === 1) {
      return "student";
    }
  }
  if (typeof value !== "string") {
    return undefined;
  }
  const v = value.toLowerCase().trim();
  if (v === "instructor" || v === "teacher" || v === "professor" || v === "ROLE_INSTRUCTOR" || v === "role_instructor") {
    return "instructor";
  }
  if (v === "admin" || v === "administrator" || v === "ROLE_ADMIN" || v === "role_admin") {
    return "admin";
  }
  if (v === "student" || v === "learner" || v === "ROLE_STUDENT" || v === "role_student") {
    return "student";
  }
  return undefined;
};

const normalizeUserRole = (value: unknown): UserRole => pickRoleFromClaim(value) ?? "student";

const extractRoleFromJwtClaims = (claims: Record<string, unknown>): UserRole | undefined => {
  const direct =
    pickRoleFromClaim(claims.role) ??
    pickRoleFromClaim(claims.user_role) ??
    pickRoleFromClaim(claims.userRole);
  if (direct) {
    return direct;
  }

  const realm = claims.realm_access;
  if (realm && typeof realm === "object" && !Array.isArray(realm)) {
    const roles = (realm as { roles?: unknown }).roles;
    if (Array.isArray(roles)) {
      for (const r of roles) {
        const pr = pickRoleFromClaim(r);
        if (pr === "admin" || pr === "instructor") {
          return pr;
        }
        if (pr === "student") {
          return pr;
        }
      }
    }
  }

  const authorities = claims.authorities;
  if (Array.isArray(authorities)) {
    for (const a of authorities) {
      const pr = pickRoleFromClaim(a);
      if (pr === "admin" || pr === "instructor") {
        return pr;
      }
    }
  }

  return undefined;
};

const normalizeUser = (raw: unknown): AppUser => {
  const o = asRecord(raw) ?? {};
  const id = String(o.id ?? o.user_id ?? o.userId ?? o.sub ?? "");
  const email = String(o.email ?? "");
  const nameRaw = o.name ?? o.full_name ?? o.fullName ?? o.username ?? (email ? email.split("@")[0] : "");
  const name =
    typeof nameRaw === "string" && nameRaw.trim().length > 0 ? nameRaw.trim() : "User";
  const role = normalizeUserRole(o.role ?? o.user_role ?? o.userRole);
  return { id, email, name, role };
};

/** Maps backend / proxy variants to our AuthSessionPayload (snake_case, camelCase, field aliases). */
export const normalizeAuthSessionPayload = (raw: unknown): AuthSessionPayload => {
  const body = unwrapAuthBody(raw);
  const accessToken = String(body.access_token ?? body.accessToken ?? "");
  const tokenType = String(body.token_type ?? body.tokenType ?? "bearer");
  let user = normalizeUser(body.user ?? body.profile ?? body.account);

  if (!accessToken.trim()) {
    throw new Error("로그인 응답에 access token이 없습니다.");
  }

  const claims = decodeJwtPayload(accessToken);
  if (claims) {
    const jwtRole = extractRoleFromJwtClaims(claims);
    if (jwtRole) {
      user = { ...user, role: jwtRole };
    }
    if (!user.id && typeof claims.sub === "string") {
      user = { ...user, id: claims.sub };
    }
    if (!user.email && typeof claims.email === "string") {
      user = { ...user, email: claims.email };
    }
  }

  return {
    user,
    tokens: { accessToken, tokenType },
  };
};
