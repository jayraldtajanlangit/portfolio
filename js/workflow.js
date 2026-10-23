export function createWorkflowState(projects, activeSlug) {
  const stageBySlug = Object.fromEntries(projects.map(({ slug }) => [slug, 0]));
  const requestedProject = projects.find(({ slug }) => slug === activeSlug);

  return {
    activeSlug: requestedProject?.slug ?? projects[0]?.slug ?? null,
    stageBySlug,
  };
}

export function reduceWorkflow(state, action, projects) {
  if (action.type === 'select') {
    if (!projects.some(({ slug }) => slug === action.slug)) return state;
    return { ...state, activeSlug: action.slug };
  }

  if (action.type !== 'next' && action.type !== 'previous') return state;
  const activeProject = projects.find(({ slug }) => slug === state.activeSlug);
  if (!activeProject) return state;

  const currentStage = state.stageBySlug[state.activeSlug] ?? 0;
  const direction = action.type === 'next' ? 1 : -1;
  const finalStage = Math.max(0, activeProject.stageCount - 1);
  const nextStage = Math.min(finalStage, Math.max(0, currentStage + direction));

  return {
    ...state,
    stageBySlug: {
      ...state.stageBySlug,
      [state.activeSlug]: nextStage,
    },
  };
}

export function initWorkflowScrubber(root = document) {
  const container = root.querySelector?.('[data-workflow]');
  const controls = root.querySelector?.('[data-workflow-controls]');
  const previous = root.querySelector?.('[data-workflow-prev]');
  const next = root.querySelector?.('[data-workflow-next]');
  const status = root.querySelector?.('[data-workflow-status]');
  const selectorButtons = [...(root.querySelectorAll?.('[data-project-select]') ?? [])];
  const projectElements = [...(root.querySelectorAll?.('[data-workflow-project]') ?? [])];
  const stageElements = [...(root.querySelectorAll?.('[data-workflow-stage]') ?? [])];

  if (!container || !controls || !previous || !next || !status || projectElements.length === 0) {
    return () => {};
  }

  const projects = projectElements.map((element) => {
    const slug = element.dataset.workflowProject;
    return {
      slug,
      stageCount: stageElements.filter((stage) =>
        stage.dataset.workflowStage?.startsWith(`${slug}-`),
      ).length,
    };
  });
  const names = Object.fromEntries(
    selectorButtons.map((button) => [button.dataset.projectSelect, button.textContent.trim()]),
  );
  let state = createWorkflowState(projects);
  let stopped = false;

  const render = () => {
    const activeProject = projects.find(({ slug }) => slug === state.activeSlug);
    const activeStage = state.stageBySlug[state.activeSlug] ?? 0;

    selectorButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.projectSelect === state.activeSlug));
    });
    projectElements.forEach((element) => {
      element.classList.toggle('is-active', element.dataset.workflowProject === state.activeSlug);
    });
    stageElements.forEach((stage) => {
      const isCurrent =
        stage.dataset.workflowStage?.startsWith(`${state.activeSlug}-`) &&
        Number(stage.dataset.stageIndex) === activeStage;
      stage.classList.toggle('is-current', isCurrent);
      if (isCurrent) stage.setAttribute('aria-current', 'step');
      else stage.removeAttribute('aria-current');
    });

    const finalStage = Math.max(0, (activeProject?.stageCount ?? 1) - 1);
    previous.disabled = activeStage <= 0;
    next.disabled = activeStage >= finalStage;
    status.textContent = `${names[state.activeSlug] ?? state.activeSlug}, state ${activeStage + 1} of ${finalStage + 1}`;
  };

  const handleSelect = (event) => {
    state = reduceWorkflow(
      state,
      { type: 'select', slug: event.currentTarget.dataset.projectSelect },
      projects,
    );
    render();
  };
  const handlePrevious = () => {
    state = reduceWorkflow(state, { type: 'previous' }, projects);
    render();
  };
  const handleNext = () => {
    state = reduceWorkflow(state, { type: 'next' }, projects);
    render();
  };

  controls.hidden = false;
  container.classList.add('workflow-enhanced');
  selectorButtons.forEach((button) => button.addEventListener('click', handleSelect));
  previous.addEventListener('click', handlePrevious);
  next.addEventListener('click', handleNext);
  render();

  return function teardownWorkflowScrubber() {
    if (stopped) return;
    stopped = true;
    selectorButtons.forEach((button) => button.removeEventListener('click', handleSelect));
    previous.removeEventListener('click', handlePrevious);
    next.removeEventListener('click', handleNext);
    container.classList.remove('workflow-enhanced');
    controls.hidden = true;
  };
}
