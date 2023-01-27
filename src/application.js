import * as yup from 'yup';
import onChange from 'on-change';
import render from './view.js';

const validation = (url, state) => {
  const stateForm = state.form;
  const schema = yup.object().shape({
    link: yup.string().url().min(1).required()
      .mixed()
      .notOneOf(state.urlRss),
  });
  schema.validate(url, state)
    .then(() => {
      stateForm.valid = true;
      url.push(state.urlRss);
    })
    .catch((err) => {
      stateForm.valid = false;
      stateForm.error = err.name; // => 'ValidationError'
    });
};

export default () => {
  const container = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
  };

  // model
  const initialState = {
    urlRss: [],
    form: {
      valid: true,
      link: '',
      error: '',
    },
  };

  const watchedState = onChange(initialState, render(initialState, container));
  // control
  container.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    validation(formData, watchedState);
    container.form.reset();
    container.input.focus();
  });
};
