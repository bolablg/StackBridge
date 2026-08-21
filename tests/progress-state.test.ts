import test from "node:test";
import assert from "node:assert/strict";
import { isDashboardStatePayload, progressRevision } from "../lib/progress-state";

const validState = {
  version: 2,
  revision: 7,
  weekStatus: {},
  setup: {},
  diagnostic: {},
  checkins: [],
};

test("progress payload validation requires a non-negative revision and core state sections", () => {
  assert.equal(isDashboardStatePayload(validState), true);
  assert.equal(isDashboardStatePayload({ ...validState, revision: -1 }), false);
  assert.equal(isDashboardStatePayload({ ...validState, revision: "not-a-number" }), false);
  assert.equal(isDashboardStatePayload({ ...validState, checkins: {} }), false);
  assert.equal(isDashboardStatePayload(null), false);
});

test("progress revisions migrate safely from legacy or malformed values", () => {
  assert.equal(progressRevision(validState), 7);
  assert.equal(progressRevision({}), 0);
  assert.equal(progressRevision({ revision: -8 }), 0);
  assert.equal(progressRevision({ revision: "12" }), 12);
});
