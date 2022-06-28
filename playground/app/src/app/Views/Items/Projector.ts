import { On, Projector } from "@valkyr/angular";
import { LedgerEventRecord } from "@valkyr/ledger";
import { ItemStore } from "stores";

import { Item } from "./Models/Item";

export class ItemProjector extends Projector {
  @On("ItemCreated")
  public async handleItemCreated({
    streamId,
    data: { workspaceId, name, details, state, sort }
  }: LedgerEventRecord<ItemStore.Created>) {
    await Item.insertOne({
      id: streamId,
      workspaceId,
      name,
      details,
      state,
      sort
    });
  }

  @On("ItemSortSet")
  public async handleItemSortSet({ streamId, data: { sort } }: LedgerEventRecord<ItemStore.SortSet>) {
    await Item.updateOne({ id: streamId }, { $set: { sort } });
  }

  @On("ItemStateSet")
  public async handleItemStateSet({ streamId, data: { state } }: LedgerEventRecord<ItemStore.StateSet>) {
    await Item.updateOne({ id: streamId }, { $set: { state } });
  }
}
