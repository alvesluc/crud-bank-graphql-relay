describe("GET `/status`", () => {
  describe("anonymous user", () => {
    it("should return the current system status", async () => {
      const response = await fetch("http://localhost:4000/status");
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody.updated_at).toBeDefined();
      const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toEqual(parsedUpdatedAt);

      expect(responseBody.dependencies.database.status).toBe("connected")
      expect(responseBody.dependencies.database.version).toContain("8.0");
    });
  });
});
