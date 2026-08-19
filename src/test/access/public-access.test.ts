// @vitest-environment node
import { describe, it, expect, beforeAll } from "vitest";
import { anonClient, isAccessDenied, SUPABASE_URL, SUPABASE_ANON_KEY } from "./helpers";

/**
 * End-to-end access rules for PUBLIC (not signed in) users.
 * These run against the live backend using only the publishable anon key.
 */
describe("public user access rules", () => {
  const supabase = anonClient();

  beforeAll(() => {
    expect(SUPABASE_URL, "VITE_SUPABASE_URL must be set").toBeTruthy();
    expect(SUPABASE_ANON_KEY, "VITE_SUPABASE_PUBLISHABLE_KEY must be set").toBeTruthy();
  });

  describe("bookings", () => {
    it("cannot read any bookings", async () => {
      const { data, error } = await supabase.from("bookings").select("id").limit(1);
      expect(error ? isAccessDenied(error) : (data ?? []).length === 0).toBe(true);
    });

    it("cannot create a booking", async () => {
      const { error } = await supabase.from("bookings").insert({
        client_id: "00000000-0000-0000-0000-000000000000",
        status: "pending",
      });
      expect(error).not.toBeNull();
      expect(isAccessDenied(error)).toBe(true);
    });

    it("cannot update a booking", async () => {
      const { data, error } = await supabase
        .from("bookings")
        .update({ status: "confirmed" })
        .neq("id", "00000000-0000-0000-0000-000000000000")
        .select("id");
      expect(error ? isAccessDenied(error) : (data ?? []).length === 0).toBe(true);
    });
  });

  describe("comments", () => {
    it("cannot read the author account id", async () => {
      const { error } = await supabase.from("comments").select("author_id").limit(1);
      expect(error).not.toBeNull();
      expect(isAccessDenied(error)).toBe(true);
    });

    it("cannot select all comment columns", async () => {
      const { error } = await supabase.from("comments").select("*").limit(1);
      expect(error).not.toBeNull();
    });

    it("can read approved comments through the public view without author ids", async () => {
      const { data, error } = await supabase
        .from("comments_public")
        .select("id, post_id, author_name, content, created_at")
        .limit(5);
      expect(error).toBeNull();
      for (const row of data ?? []) {
        expect(Object.keys(row)).not.toContain("author_id");
      }
    });

    it("cannot post a comment", async () => {
      const { error } = await supabase
        .from("comments")
        .insert({ content: "spam", author_name: "anon" });
      expect(error).not.toBeNull();
      expect(isAccessDenied(error)).toBe(true);
    });
  });

  describe("information centers", () => {
    it("cannot read contact phone or email", async () => {
      const phone = await supabase.from("information_centers").select("phone").limit(1);
      const email = await supabase.from("information_centers").select("email").limit(1);
      expect(isAccessDenied(phone.error)).toBe(true);
      expect(isAccessDenied(email.error)).toBe(true);
    });

    it("cannot select all information center columns", async () => {
      const { error } = await supabase.from("information_centers").select("*").limit(1);
      expect(error).not.toBeNull();
    });

    it("can read published centers through the public view (no contact fields)", async () => {
      const { data, error } = await supabase
        .from("information_centers_public")
        .select("*")
        .limit(5);
      expect(error).toBeNull();
      for (const row of data ?? []) {
        expect(Object.keys(row)).not.toContain("phone");
        expect(Object.keys(row)).not.toContain("email");
        expect(row.status).toBe("published");
      }
    });

    it("cannot create or modify information centers", async () => {
      const { error } = await supabase.from("information_centers").insert({
        name: "Rogue center",
        address: "nowhere",
        latitude: 0,
        longitude: 0,
      });
      expect(error).not.toBeNull();
      expect(isAccessDenied(error)).toBe(true);
    });
  });
});
