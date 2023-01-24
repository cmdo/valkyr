import { EventEntry } from "../services/events";

export const events: EventEntry[] = [
  {
    type: "RealmCreated",
    data: {
      name: "p:string",
      color: "p:string",
      icon: "p:string",
      members: "t:Member[]",
      owner: "p:string"
    },
    meta: {
      container: "p:string",
      auditor: "p:string"
    }
  },
  {
    type: "RealmNameSet",
    data: {
      name: "p:string"
    },
    meta: {
      container: "p:string",
      auditor: "p:string"
    }
  },
  {
    type: "RealmArchived",
    data: {},
    meta: {
      container: "p:string",
      auditor: "p:string"
    }
  },
  {
    type: "RealmMemberAdded",
    data: {
      id: "p:string",
      accountId: "p:string",
      name: "p:string",
      avatar: "p:string",
      color: "p:string",
      archived: "p:boolean"
    },
    meta: {
      container: "p:string",
      auditor: "p:string"
    }
  },
  {
    type: "MemberArchived",
    data: {
      id: "p:string"
    },
    meta: {
      container: "p:string",
      auditor: "p:string"
    }
  },
  {
    type: "MemberUnarchived",
    data: {
      id: "p:string"
    },
    meta: {
      container: "p:string",
      auditor: "p:string"
    }
  }
];
