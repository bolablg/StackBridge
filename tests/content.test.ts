import test from "node:test";
import assert from "node:assert/strict";
import { ACTIVE_PATH_COUNT, ACTIVE_PATH_KEYS, DEFAULT_PATH_KEY, PATH_BLUEPRINTS } from "../lib/content";
import { getRouteGuide } from "../lib/route-guides";
import { resolvePathKey } from "../lib/server/paths";

test("the live data-engineering catalog contains twelve complete bridges", () => {
  assert.equal(ACTIVE_PATH_COUNT, 12);
  assert.equal(new Set(ACTIVE_PATH_KEYS).size, ACTIVE_PATH_COUNT);

  for (const pathKey of ACTIVE_PATH_KEYS) {
    const blueprint = PATH_BLUEPRINTS[pathKey];
    assert.ok(blueprint, `missing blueprint for ${pathKey}`);
    assert.notEqual(blueprint.source.key, blueprint.target.key);
    assert.equal(blueprint.weeks.length, 13, `${pathKey} should have 13 milestones`);
    assert.equal(blueprint.simulations.length, 4, `${pathKey} should have four simulations`);
    assert.deepEqual(blueprint.simulations.map((simulation) => simulation.questions.length), [4, 4, 4, 4]);

    const questionIds = blueprint.simulations.flatMap((simulation) => simulation.questions.map((question) => question.id));
    assert.equal(new Set(questionIds).size, 16, `${pathKey} diagnostic IDs must be unique`);
    assert.equal(Object.keys(blueprint.target.diagnosticDomains).length, 4);
    assert.equal(blueprint.target.safety.checks.length, 4);
  }
});

test("every non-default milestone resolves to its own embedded route guide", () => {
  for (const pathKey of ACTIVE_PATH_KEYS.filter((key) => key !== DEFAULT_PATH_KEY)) {
    const blueprint = PATH_BLUEPRINTS[pathKey];
    for (const week of blueprint.weeks) {
      assert.equal(week.guide, `/data-engineering/${pathKey}/guides/${week.number}`);
      const guide = getRouteGuide(pathKey, week.number);
      assert.ok(guide, `missing guide for ${pathKey} week ${week.number}`);
      assert.equal(guide.blueprint.key, pathKey);
      assert.equal(guide.week.number, week.number);
      assert.ok(guide.labSteps.length >= 4);
      assert.ok(guide.evidence.length >= 4);
    }
  }
});

test("path resolution accepts the legacy route and rejects unknown routes", () => {
  assert.equal(resolvePathKey("gcp-to-aws"), DEFAULT_PATH_KEY);
  assert.equal(resolvePathKey(DEFAULT_PATH_KEY), DEFAULT_PATH_KEY);
  assert.equal(resolvePathKey("unknown-to-nowhere"), null);
  assert.equal(resolvePathKey(), null);
});
