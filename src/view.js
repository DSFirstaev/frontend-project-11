export default (state, container) => {
  const inputField = container.input;
  const inputFeedback = container.feedback;
  if (state.form.valid === false) {
    container.input.classList.add('is-invalid');
    inputFeedback.textContent = state.form.error;
  } else {
    inputField.classList.remove('is-invalid');
    inputFeedback.textContent = '';
  }
};
