// @vitest-environment node
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AppRole, credentialsFor, signedInClient, isAccessDenied } from "./helpers";

/**
 * End-to-end access rules for every internal role.
 * Each role needs TEST_<ROLE>_EMAIL / TEST_<ROLE>_PASSWORD env vars;
 * suites for roles without credentials are skipped instead of failing.
 */
const ROLES: AppRole[] = ["admin", "tour_manager", "accountant", "client"];

const STAFF_CAN_READ_ALL_BOOKINGS: Record<AppRole, boolean> = {
  admin: true,
  tour_manager: true,
  accountant: true,
  client: false,
};

const CAN_UPDATE_BOOKINGS: Record<AppRole, boolean> = {
  admin: true,
  tour_manager: true,
  accountant: false,
  client: false,
};

const CAN_READ_CONTACT_DETAILS: Record<AppRole, boolean> = {
  admin: true,
  tour_manager: true,
  accountant: true,
  client: true, // any signed-in user may see published centers' contacts
};

for (const role of ROLES) {
  const hasCreds = credentialsFor(role) !== null;
  const suite = hasCreds ? describe : describe.skip;

  suite(`${role} access rules`, () => {
    let client: SupabaseClient;
    let userId: string;

    beforeAll(async () => {
      const session = await signedInClient(role);
      client = session!.client;
      userId = session!.userId;
    });

    afterAll(async () => {
      await client?.auth.signOut();
    });

    it("resolves the expected role from the backend", async () => {
      const { data, error } = await client.rpc("get_user_role", { _user_id: userId });
      expect(error).toBeNull();
      expect(data).toBe(role);
    });

    describe("bookings", () => {
      it(`${STAFF_CAN_READ_ALL_BOOKINGS[role] ? "sees all" : "sees only own"} bookings`, async () => {
        const { data, error } = await client
          .from("bookings")
          .select("id, client_id")
          .limit(50);
        expect(error).toBeNull();
        if (!STAFF_CAN_READ_ALL_BOOKINGS[role]) {
          for (const row of data ?? []) expect(row.client_id).toBe(userId);
        }
      });

      it(`${CAN_UPDATE_BOOKINGS[role] ? "can" : "cannot"} update other people's bookings`, async () => {
        const { data: foreign } = await client
          .from("bookings")
          .select("id, status, client_id")
          .neq("client_id", userId)
          .limit(1);
        const target = foreign?.[0];
        if (!target) return; // nothing to assert against in this environment

        const { data, error } = await client
          .from("bookings")
          .update({ status: target.status })
          .eq("id", target.id)
          .select("id");

        if (CAN_UPDATE_BOOKINGS[role]) {
          expect(error).toBeNull();
          expect((data ?? []).length).toBe(1);
        } else {
          expect(error ? isAccessDenied(error) : (data ?? []).length === 0).toBe(true);
        }
      });

      it("cannot create a booking on behalf of somebody else", async () => {
        const { error } = await client.from("bookings").insert({
          client_id: "00000000-0000-0000-0000-000000000000",
          status: "pending",
        });
        expect(error).not.toBeNull();
        expect(isAccessDenied(error)).toBe(true);
      });
    });

    describe("comments", () => {
      it(`${role === "admin" ? "sees all" : "sees only own"} full comment rows`, async () => {
        const { data, error } = await client
          .from("comments")
          .select("id, author_id")
          .limit(50);
        expect(error).toBeNull();
        if (role !== "admin") {
          for (const row of data ?? []) expect(row.author_id).toBe(userId);
        }
      });

      it("cannot post a comment attributed to another account", async () => {
        const { error } = await client.from("comments").insert({
          content: "impersonation attempt",
          author_id: "00000000-0000-0000-0000-000000000000",
        });
        expect(error).not.toBeNull();
        expect(isAccessDenied(error)).toBe(true);
      });

      it("can read approved comments through the public view", async () => {
        const { error } = await client.from("comments_public").select("id").limit(1);
        expect(error).toBeNull();
      });
    });

    describe("information centers", () => {
      it(`${CAN_READ_CONTACT_DETAILS[role] ? "can" : "cannot"} read contact phone and email`, async () => {
        const { data, error } = await client
          .from("information_centers")
          .select("id, phone, email, status")
          .limit(5);
        if (CAN_READ_CONTACT_DETAILS[role]) {
          expect(error).toBeNull();
          for (const row of data ?? []) {
            if (role !== "admin") expect(row.status).toBe("published");
          }
        } else {
          expect(isAccessDenied(error)).toBe(true);
        }
      });

      it(`${role === "admin" ? "can" : "cannot"} create information centers`, async () => {
        const { data, error } = await client
          .from("information_centers")
          .insert({
            name: `access-test-${role}-${Date.now()}`,
            address: "test",
            latitude: 0,
            longitude: 0,
            status: "draft",
          })
          .select("id");

        if (role === "admin") {
          expect(error).toBeNull();
          const created = data?.[0]?.id;
          if (created) await client.from("information_centers").delete().eq("id", created);
        } else {
          expect(error).not.toBeNull();
          expect(isAccessDenied(error)).toBe(true);
        }
      });
    });
  });
}
