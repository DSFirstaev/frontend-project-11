import * as yup from 'yup';
import onChange from 'on-change';
import render from './view.js';

const validation = (url, state) => {
  const stateForm = state.form;
  const schema = yup.string().url('Ссылка должна быть валидным URL').required().notOneOf([state.repeatUrls], 'RSS уже загружен');
  schema.validate(url)
    .then(() => {
      stateForm.valid = true;
      stateForm.feedback = 'RSS успешно загружен';
      state.repeatUrls.push(url);
    })
    .catch((err) => {
      stateForm.valid = false;
      stateForm.feedback = err;
    });
};

export default () => {
  const container = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    feedback: document.querySelector('.feedback'),
  };

  // model
  const initialState = {
    repeatUrls: [],
    form: {
      valid: true,
      feedback: '',
    },
  };

  const watchedState = onChange(initialState, render(initialState, container));

  // control
  container.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const repeatUrls = formData.get('url');
    validation(repeatUrls, watchedState);
    container.form.reset();
    container.input.focus();
  });
};
