import { subscribe } from "@valkyr/ledger";
import { useEffect } from "react";

import { useQuery } from "../../../Hooks/UseQuery";
import { Account } from "../../../Models/Account";
import { auth } from "../../Auth/Auth";

export function useAccount() {
  const account = useQuery(Account, { filter: { id: auth.auditor }, singleton: true });

  useEffect(() => {
    if (auth.isAuthenticated) {
      return subscribe(auth.auditor);
    }
  }, [auth.auditor]);

  return account;
}
