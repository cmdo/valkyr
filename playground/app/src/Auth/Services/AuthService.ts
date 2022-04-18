import { jwt, remote } from "@valkyr/client";
import { Injectable } from "@valkyr/yggdrasil";

type Data = {
  auditor: string;
};

@Injectable()
export class AuthService {
  public get isAuthenticated(): boolean {
    return jwt.token !== null;
  }

  public get details(): Data {
    if (jwt.token === null) {
      throw new Error(`Auth Violation: Cannot retrieve details for unauthenticated client`);
    }
    return jwt.decode<Data>(jwt.token);
  }

  public get auditor() {
    return this.details.auditor;
  }

  public async setup() {
    if (this.isAuthenticated === true) {
      await remote.socket.send("token", { token: jwt.token });
    }
  }

  /**
   * Generate a single sign on token for a newly created or existing
   * account that can be used to generate a authorized signature.
   *
   * @param email - Email identifier to generate a token for.
   */
  public async create(email: string) {
    return remote.post("/accounts", { email });
  }

  /**
   * Sign the provided email identifier using the given token.
   *
   * @param email - Email identifier to sign.
   * @param token - Single sign on token to validate the signature.
   */
  public async sign(email: string, token: string) {
    await remote.post<{ token: string }>("/accounts/validate", { email, token }).then(({ token }) => {
      return this.resolve(token);
    });
  }

  /**
   * Authenticate the current socket by resolving the authorized JWT
   * token against the connection.
   *
   * @param token - Signed token to resolve.
   */
  public async resolve(token: string) {
    await remote.socket.send("token", { token });
    jwt.token = token;
  }

  /**
   * Remove the resolved authentication from the current connection.
   * This is used when you want to remove the credentials without
   * destroying the socket connection.
   */
  public async destroy() {
    await remote.socket.send("account:logout");
  }
}
