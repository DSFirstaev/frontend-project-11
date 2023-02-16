import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';
import i18next from 'i18next';
import onChange from 'on-change';
import parser from './parser.js';
import render from './view.js';
import resources from './locales/ru.js';

const fetchingData = (url) => axios
  .get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
  .then((response) => response.data.contents)
  .catch(() => {
    throw new Error('networkError');
  });

const updatePosts = (state) => {
  const links = state.feeds.map((feed) => feed.linkFeed);
  const promises = links.map((link) => fetchingData(link)
    .then((response) => {
      const { posts } = parser(response);
      const currentPosts = state.posts;
      const newPosts = _.differenceBy(posts, currentPosts, 'titlePost');
      if (newPosts.length > 0) {
        state.posts = [...newPosts, ...state.posts];
      }
    }));

  return Promise.all(promises)
    .finally(setTimeout(() => updatePosts(state), 5000));
};

const validateUrl = (url, parsedUrl) => {
  const schema = yup.string().url().required().notOneOf(parsedUrl);
  return schema.validate(url);
};

const runApp = (i18n) => {
  const container = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    feedback: document.querySelector('.feedback'),
    postsContainer: document.querySelector('.posts'),
    feedsContainer: document.querySelector('.feeds'),
    submitButton: document.querySelector('button[type="submit"]'),
  };

  // model
  const initialState = {
    status: 'waiting',
    form: {
      valid: false,
      error: '',
    },
    stateUI: {
      postsUI: [],
      feedsUI: [],
    },
    posts: [],
    feeds: [],
  };

  const watchedState = onChange(initialState, render(initialState, container, i18n));

  // control
  container.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.status = 'loading';
    const formData = new FormData(e.target);
    const url = formData.get('url');
    const parsedUrl = watchedState.feeds.map((feed) => feed.linkFeed);
    validateUrl(url, parsedUrl)
      .then(() => fetchingData(url))
      .then((response) => parser(response, url))
      .then((parsedData) => {
        const { feed, posts } = parsedData;
        posts.forEach((elem) => {
          elem.postID = _.uniqueId();
        });
        watchedState.posts.unshift(posts);
        watchedState.feeds.unshift(feed);
        watchedState.form.valid = true;
        watchedState.status = 'waiting';
      })
      .catch((err) => {
        watchedState.form.valid = false;
        watchedState.form.error = err.message;
        watchedState.status = 'error!';
      });
    container.form.reset();
    container.input.focus();
  });

  updatePosts(watchedState);
};

export default () => {
  const defaultLanguage = 'ru';
  const i18n = i18next.createInstance();

  i18n.init({
    lng: defaultLanguage,
    debug: false,
    resources: { ru: resources },
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
