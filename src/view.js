export default (state, container) => {
  const inputField = container.input;
  if (state.form.valid === false) {
    inputField.classList.add('is-invalid');
  }
};
