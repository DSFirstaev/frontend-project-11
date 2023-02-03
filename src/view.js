const renderValid = (state, container) => {
  const inputField = container.input;
  const inputFeedback = container.feedback;
  if (state.form.valid === false) {
    inputField.classList.add('is-invalid');
    inputFeedback.classList.add('text-danger');
    inputFeedback.classList.remove('text-success');
    inputFeedback.textContent = state.form.feedback;
  } else {
    inputField.classList.remove('is-invalid');
    inputFeedback.classList.remove('text-danger');
    inputFeedback.classList.add('text-success');
    inputFeedback.textContent = state.form.feedback;
  }
};

export default (state, container) => (path) => {
  switch (path) {
    case 'form.valid':
      renderValid(state, container);
      break;
    case 'repeatUrls':
      renderValid(state, container);
      break;
    case 'form.feedback':
      renderValid(state, container);
      break;
    default:
      throw new Error(`${path} is a wrong path`);
  }
};
