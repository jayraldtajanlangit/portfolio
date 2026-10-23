import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createWorkflowState,
  initWorkflowScrubber,
  reduceWorkflow,
} from '../js/workflow.js';

const workflows = [
  { slug: 'alpha', stageCount: 3 },
  { slug: 'beta', stageCount: 2 },
];

test('creates a workflow state with the first project selected', () => {
  assert.deepEqual(createWorkflowState(workflows), {
    activeSlug: 'alpha',
    stageBySlug: { alpha: 0, beta: 0 },
  });
});

test('creates an empty state when there are no projects', () => {
  assert.deepEqual(createWorkflowState([]), {
    activeSlug: null,
    stageBySlug: {},
  });
});

test('selects a valid project without losing another project stage', () => {
  const advanced = reduceWorkflow(createWorkflowState(workflows), { type: 'next' }, workflows);
  const selected = reduceWorkflow(advanced, { type: 'select', slug: 'beta' }, workflows);

  assert.equal(selected.activeSlug, 'beta');
  assert.deepEqual(selected.stageBySlug, { alpha: 1, beta: 0 });
});

test('advances and reverses only the active project stage', () => {
  const beta = createWorkflowState(workflows, 'beta');
  const advanced = reduceWorkflow(beta, { type: 'next' }, workflows);
  const reversed = reduceWorkflow(advanced, { type: 'previous' }, workflows);

  assert.deepEqual(advanced.stageBySlug, { alpha: 0, beta: 1 });
  assert.deepEqual(reversed.stageBySlug, { alpha: 0, beta: 0 });
});

test('clamps workflow navigation at the first and final stage', () => {
  const initial = createWorkflowState(workflows);
  const beforeFirst = reduceWorkflow(initial, { type: 'previous' }, workflows);
  const firstAdvance = reduceWorkflow(initial, { type: 'next' }, workflows);
  const final = reduceWorkflow(firstAdvance, { type: 'next' }, workflows);
  const afterFinal = reduceWorkflow(final, { type: 'next' }, workflows);

  assert.equal(beforeFirst.stageBySlug.alpha, 0);
  assert.equal(afterFinal.stageBySlug.alpha, 2);
});

test('ignores invalid selections and unknown actions', () => {
  const initial = createWorkflowState(workflows);

  assert.strictEqual(
    reduceWorkflow(initial, { type: 'select', slug: 'missing' }, workflows),
    initial,
  );
  assert.strictEqual(reduceWorkflow(initial, { type: 'mystery' }, workflows), initial);
});

function createElement({ dataset = {}, textContent = '' } = {}) {
  const attributes = new Map();
  const listeners = new Map();
  const classes = new Set();

  return {
    dataset,
    textContent,
    hidden: true,
    disabled: false,
    classList: {
      add: (...names) => names.forEach((name) => classes.add(name)),
      remove: (...names) => names.forEach((name) => classes.delete(name)),
      contains: (name) => classes.has(name),
      toggle(name, force) {
        if (force) classes.add(name);
        else classes.delete(name);
      },
    },
    setAttribute: (name, value) => attributes.set(name, String(value)),
    getAttribute: (name) => attributes.get(name) ?? null,
    removeAttribute: (name) => attributes.delete(name),
    addEventListener(type, listener) {
      const entries = listeners.get(type) ?? [];
      entries.push(listener);
      listeners.set(type, entries);
    },
    removeEventListener(type, listener) {
      listeners.set(type, (listeners.get(type) ?? []).filter((entry) => entry !== listener));
    },
    click() {
      (listeners.get('click') ?? []).forEach((listener) => listener({ currentTarget: this }));
    },
  };
}

test('enhances project controls and updates the active workflow stage', () => {
  const container = createElement();
  const controls = createElement();
  const previous = createElement();
  const next = createElement();
  const status = createElement();
  const alphaButton = createElement({ dataset: { projectSelect: 'alpha' }, textContent: 'Alpha' });
  const betaButton = createElement({ dataset: { projectSelect: 'beta' }, textContent: 'Beta' });
  const projectElements = [
    createElement({ dataset: { workflowProject: 'alpha' } }),
    createElement({ dataset: { workflowProject: 'beta' } }),
  ];
  const stageElements = [
    createElement({ dataset: { workflowStage: 'alpha-0', stageIndex: '0' } }),
    createElement({ dataset: { workflowStage: 'alpha-1', stageIndex: '1' } }),
    createElement({ dataset: { workflowStage: 'alpha-2', stageIndex: '2' } }),
    createElement({ dataset: { workflowStage: 'beta-0', stageIndex: '0' } }),
    createElement({ dataset: { workflowStage: 'beta-1', stageIndex: '1' } }),
  ];
  const map = new Map([
    ['[data-workflow]', [container]],
    ['[data-workflow-controls]', [controls]],
    ['[data-project-select]', [alphaButton, betaButton]],
    ['[data-workflow-project]', projectElements],
    ['[data-workflow-stage]', stageElements],
    ['[data-workflow-prev]', [previous]],
    ['[data-workflow-next]', [next]],
    ['[data-workflow-status]', [status]],
  ]);
  const root = {
    querySelector: (selector) => map.get(selector)?.[0] ?? null,
    querySelectorAll: (selector) => map.get(selector) ?? [],
  };

  const teardown = initWorkflowScrubber(root);

  assert.equal(controls.hidden, false);
  assert.equal(alphaButton.getAttribute('aria-pressed'), 'true');
  assert.equal(previous.disabled, true);
  assert.equal(stageElements[0].getAttribute('aria-current'), 'step');

  next.click();
  assert.equal(stageElements[1].getAttribute('aria-current'), 'step');
  assert.equal(status.textContent, 'Alpha, state 2 of 3');

  betaButton.click();
  assert.equal(betaButton.getAttribute('aria-pressed'), 'true');
  assert.equal(previous.disabled, true);
  next.click();
  assert.equal(next.disabled, true);

  teardown();
  assert.equal(controls.hidden, true);
  assert.equal(container.classList.contains('workflow-enhanced'), false);
});
