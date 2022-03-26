import { ledger } from "@valkyr/ledger-server";
import { nanoid } from "nanoid";
import { Account, account } from "stores";

import { collection } from "../../../Database/Collections";

/*
 |--------------------------------------------------------------------------------
 | Write
 |--------------------------------------------------------------------------------
 */

export async function createAccount(email: string) {
  const accountId = nanoid();

  const state = await ledger.reduce(accountId, Account);
  if (state) {
    throw new Error("Account already exists");
  }

  await ledger.insert(account.created(accountId, { email }));

  return getAccountByEmail(email);
}

export async function activateAccount(accountId: string) {
  const state = await getAccountState(accountId);
  if (state.status === "active") {
    throw new Error("Account is already active");
  }
  await ledger.insert(account.activated(accountId));
}

export async function setAccountName(accountId: string, name: Account["name"]) {
  const state = await getAccountState(accountId);
  if (state.name === name) {
    throw new Error("Name is already set");
  }
  await ledger.insert(account.nameSet(accountId, { name }));
}

/*
 |--------------------------------------------------------------------------------
 | Read
 |--------------------------------------------------------------------------------
 */

export async function getAccountByEmailOrCreate(email: string) {
  const account = await getAccountByEmail(email);
  if (account === null) {
    return createAccount(email);
  }
  return account;
}

export async function getAccountByUsername(username: string) {
  return collection.accounts.findOne({ username });
}

export async function getAccountByEmail(email: string) {
  return collection.accounts.findOne({ email });
}

/*
 |--------------------------------------------------------------------------------
 | Utilities
 |--------------------------------------------------------------------------------
 */

async function getAccountState(accountId: string) {
  const state = await ledger.reduce(accountId, Account);
  if (state === undefined) {
    throw new Error("Account not found");
  }
  return state;
}
