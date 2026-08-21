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
    for (const question of blueprint.simulations.flatMap((simulation) => simulation.questions)) {
      const optionKeys = Object.keys(question.options);
      const answerKeys = question.answer.split(",").map((answer) => answer.trim());
      assert.equal(new Set(optionKeys).size, optionKeys.length, `${question.id} option keys must be unique`);
      assert.equal(new Set(answerKeys).size, answerKeys.length, `${question.id} answers must be unique`);
      assert.ok(answerKeys.every((answer) => optionKeys.includes(answer)), `${question.id} answers must resolve to options`);
    }
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

test("exam simulations are owned by the destination credential", () => {
  const byTarget = new Map<string, typeof PATH_BLUEPRINTS[string]["simulations"]>();

  for (const pathKey of ACTIVE_PATH_KEYS) {
    const blueprint = PATH_BLUEPRINTS[pathKey];
    const existing = byTarget.get(blueprint.target.key);
    if (!existing) {
      byTarget.set(blueprint.target.key, blueprint.simulations);
      continue;
    }

    assert.deepEqual(blueprint.simulations, existing, `all routes to ${blueprint.target.key} must use the same exam bank`);
  }
});

test("each live destination exposes official exam-format context and destination-appropriate response types", () => {
  for (const pathKey of ACTIVE_PATH_KEYS) {
    const blueprint = PATH_BLUEPRINTS[pathKey];
    assert.ok(blueprint.target.exam.version);
    assert.ok(blueprint.target.exam.duration);
    assert.ok(blueprint.target.exam.questionCount);
    assert.ok(blueprint.target.exam.responseTypes);
    const hasMultipleResponse = blueprint.simulations.flatMap((simulation) => simulation.questions).some((question) => question.answer.includes(","));
    if (blueprint.target.key === "databricks") assert.equal(hasMultipleResponse, false);
    else assert.equal(hasMultipleResponse, true);
  }
});
