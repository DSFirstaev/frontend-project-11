const renderValid = (container, i18n) => {
  const inputField = container.input;
  const inputFeedback = container.feedback;
  inputField.classList.remove('is-invalid');
  inputFeedback.classList.remove('text-danger');
  inputFeedback.classList.add('text-success');
  inputFeedback.textContent = i18n.t('success');
};

const renderError = (state, container, i18n) => {
  const errors = {
    repeatUrl: () => i18n.t('repeatUrl'),
    invalidUrl: () => i18n.t('invalidUrl'),
  };

  const handleError = (errorCode) => errors[errorCode]();

  const inputField = container.input;
  const inputFeedback = container.feedback;
  inputField.classList.add('is-invalid');
  inputFeedback.classList.add('text-danger');
  inputFeedback.classList.remove('text-success');
  inputFeedback.textContent = handleError(state.form.error);
};

export default (state, container, i18n) => (path) => {
  switch (path) {
    case 'form.valid':
      renderValid(container, i18n);
      break;
    case 'form.error':
      renderError(state, container, i18n);
      break;
    case 'urls':
      renderValid(container, i18n);
      break;
    default:
      throw new Error(`${path} is a wrong path`);
  }
};
