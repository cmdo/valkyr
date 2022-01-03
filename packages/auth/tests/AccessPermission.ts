import { AccessPermission } from "../src/Lib/AccessPermission";
import { AccountAccessAttributes } from "./mocks/AccountAccessAttributes";

/*
 |--------------------------------------------------------------------------------
 | Mock
 |--------------------------------------------------------------------------------
 */

const accounts = [
  {
    name: "John Doe",
    password: "bcrypt"
  },
  {
    name: "Jane Doe",
    password: "bcrypt"
  }
];

const permission = new AccessPermission({
  granted: true,
  attributes: new AccountAccessAttributes()
});

/*
 |--------------------------------------------------------------------------------
 | Unit Tests
 |--------------------------------------------------------------------------------
 */

describe("AccessPermission", () => {
  describe("when using attributes .filter method", () => {
    it("should show all attributes when no filter is provided", () => {
      expect(permission.filter(accounts)).toEqual(accounts.map((account) => ({ name: account.name, password: account.password })));
      expect(permission.filter(accounts[0])).toEqual({ name: accounts[0].name, password: accounts[0].password });
    });

    it("should show all attributes when filter is set to owner", () => {
      expect(permission.filter(accounts, "owner")).toEqual(
        accounts.map((account) => ({ name: account.name, password: account.password }))
      );
      expect(permission.filter(accounts[0], "owner")).toEqual({ name: accounts[0].name, password: accounts[0].password });
    });

    it("should hide password when filter is set to public", () => {
      expect(permission.filter(accounts, "public")).toEqual(accounts.map((account) => ({ name: account.name })));
      expect(permission.filter(accounts[0], "public")).toEqual({ name: accounts[0].name });
    });
  });
});
