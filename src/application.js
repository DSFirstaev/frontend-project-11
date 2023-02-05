import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import render from './view.js';
import resources from './locales/ru.js';

const validation = (url, state) => {
  const stateForm = state.form;
  const schema = yup.string().url().required().notOneOf([state.urls]);
  schema.validate(url)
    .then(() => {
      stateForm.valid = true;
      state.urls.push(url);
    })
    .catch((err) => {
      stateForm.valid = false;
      stateForm.error = err.errors.join();
    });
};

const runApp = (i18n) => {
  const container = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    feedback: document.querySelector('.feedback'),
  };

  // model
  const initialState = {
    urls: [],
    form: {
      valid: true,
      error: '',
    },
  };

  const watchedState = onChange(initialState, render(initialState, container, i18n));

  // control
  container.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');
    validation(url, watchedState);
    container.form.reset();
    container.input.focus();
  });
};

export default () => {
  const defaultLanguage = 'ru';
  const i18n = i18next.createInstance();

  i18n.init({
    lng: defaultLanguage,
    debug: true,
    resources,
  })
    .then(() => {
      yup.setLocale({
        mixed: {
          notOneOf: 'repeatUrl',
        },
        string: {
          url: 'invalidUrl',
        },
      });
    })
    .then(() => runApp(i18n));
};
