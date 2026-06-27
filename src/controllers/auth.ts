// src/controllers/auth.ts

import Elysia, { t } from "elysia";

const authController = new Elysia({ prefix: "/auth" })
  .post(
    "/login",
    ({ body, set }) => {
      const { email, password } = body;
      if (email === "super@admin.com" && password === "Manish@123") {
        // Set a session cookie valid for 1 day
        set.headers["Set-Cookie"] =
          "session=admin_logged_in; Path=/; HttpOnly; Max-Age=86400; SameSite=Lax";
        return { success: true };
      }
      set.status = 401;
      return "Invalid email or password";
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
      detail: {
        tags: ["Auth"],
        description: "Admin login endpoint",
      },
    },
  )
  .post(
    "/logout",
    ({ set }) => {
      // Clear the session cookie
      set.headers["Set-Cookie"] =
        "session=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax";
      return { success: true };
    },
    {
      detail: {
        tags: ["Auth"],
        description: "Admin logout endpoint",
      },
    },
  );

export default authController;
