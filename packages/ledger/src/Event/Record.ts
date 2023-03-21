import { getLogicalTimestamp } from "@valkyr/time";
import { nanoid } from "nanoid";

import type { Event } from "./Event.js";

export function createEventRecord<E extends Event>(container: string, stream: string, event: E): EventRecord<E> {
  const timestamp = getLogicalTimestamp();
  return {
    id: nanoid(),
    container,
    stream,
    ...event,
    created: timestamp,
    recorded: timestamp
  };
}

/*
 |--------------------------------------------------------------------------------
 | Types
 |--------------------------------------------------------------------------------
 */

export type EventRecord<E extends Event = Event> = {
  /**
   * A unique event identifier correlating its identity in the **event store**
   * _(database)_.
   */
  id: string;

  /**
   * Identifier representing the container in which many individual streams belongs
   * and is used for grouping streams together for easier management.
   */
  container: string;

  /**
   * Identifier representing the stream in which many individual events/transactions
   * belongs to and is used to generate a specific aggregate state representation of
   * that particular identity.
   */
  stream: string;

  /**
   * Event identifier describing the intent of the event in a past tense format.
   */
  type: E["type"];

  /**
   * Stores the recorded partial piece of data that makes up a larger aggregate
   * state.
   */
  data: E["data"];

  /**
   * Stores additional meta data about the event that is not directly related
   * to the aggregate state.
   */
  meta: E["meta"];

  /**
   * An immutable logical hybrid clock timestamp representing the wall time when
   * the event was created.
   *
   * This value is used to identify the date of its creation as well as a sorting
   * key when performing reduction logic to generate aggregate state for the stream
   * in which the event belongs.
   */
  created: string;

  /**
   * A mutable logical hybrid clock timestamps representing the wall time when the
   * event was recorded to the local **event ledger** _(database)_ as opposed to
   * when the event was actually created.
   *
   * This value is used when performing event synchronization between two different
   * event ledgers.
   */
  recorded: string;
};

export type EventToRecord<E> = E extends Event ? EventRecord<E> : never;
